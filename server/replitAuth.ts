import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

// Replit Auth is optional - only set up if REPLIT_DOMAINS is provided
const isReplitAuthEnabled = !!process.env.REPLIT_DOMAINS;

const getOidcConfig = memoize(
  async () => {
    if (!isReplitAuthEnabled) {
      throw new Error("Replit Auth is not enabled");
    }
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  
  // In production/Replit, we're behind a proxy so secure cookies work
  // The 'trust proxy' setting handles this
  const isProduction = process.env.NODE_ENV === 'production' || !!process.env.REPLIT_DOMAINS;
  
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    name: 'connect.sid',
    cookie: {
      path: '/',
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: sessionTtl,
    },
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(
  claims: any,
) {
  await storage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"],
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  // Only set up Replit Auth if enabled
  if (isReplitAuthEnabled) {
    const config = await getOidcConfig();

    const verify: VerifyFunction = async (
      tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
      verified: passport.AuthenticateCallback
    ) => {
      const user = {};
      updateUserSession(user, tokens);
      await upsertUser(tokens.claims());
      verified(null, user);
    };

    for (const domain of process.env.REPLIT_DOMAINS!.split(",")) {
      const strategy = new Strategy(
        {
          name: `replitauth:${domain}`,
          config,
          scope: "openid email profile offline_access",
          callbackURL: `https://${domain}/api/callback`,
        },
        verify,
      );
      passport.use(strategy);
    }

    app.get("/api/login", (req, res, next) => {
      passport.authenticate(`replitauth:${req.hostname}`, {
        prompt: "login consent",
        scope: ["openid", "email", "profile", "offline_access"],
      })(req, res, next);
    });

    app.get("/api/callback", (req, res, next) => {
      passport.authenticate(`replitauth:${req.hostname}`, async (err: any, user: any) => {
        if (err) {
          return res.redirect("/api/login");
        }
        
        if (!user) {
          return res.redirect("/api/login");
        }

        req.logIn(user, async (err) => {
          if (err) {
            return next(err);
          }

          // Check if user has profiles and redirect appropriately
          try {
            const userId = user.claims.sub;
            const athleteProfile = await storage.getAthleteProfile(userId);
            const coachProfile = await storage.getCoachProfile(userId);

            // If user has no profiles, go to onboarding
            if (!athleteProfile && !coachProfile) {
              return res.redirect("/onboarding");
            }

            // If user has only one profile, auto-enter that role and go to dashboard
            if (athleteProfile && !coachProfile) {
              req.session.activeRole = 'athlete';
              return res.redirect("/dashboard");
            }
            
            if (coachProfile && !athleteProfile) {
              req.session.activeRole = 'coach';
              return res.redirect("/dashboard");
            }

            // If user has both profiles, go to dashboard (they'll choose role there)
            return res.redirect("/dashboard");
          } catch (error) {
            console.error("Error checking profiles:", error);
            return res.redirect("/onboarding");
          }
        });
      })(req, res, next);
    });

    app.get("/api/logout", (req, res) => {
      req.logout(() => {
        res.redirect(
          client.buildEndSessionUrl(config, {
            client_id: process.env.REPL_ID!,
            post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
          }).href
        );
      });
    });
  }
}

// Role types for session management
export type ActiveRole = 'athlete' | 'coach' | null;

// Extend Express session to include active_role and email auth
declare module 'express-session' {
  interface SessionData {
    activeRole?: ActiveRole;
    userId?: string;
    user?: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
    };
  }
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const session = req.session as any;
  const user = req.user as any;

  // 1. Check for Bearer JWT token (mobile app)
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    const { verifyToken } = await import('./jwt');
    const token = authHeader.slice(7);
    const payload = verifyToken(token);
    if (payload) {
      (req as any).user = {
        claims: {
          sub: payload.sub,
          email: payload.email,
          first_name: payload.firstName,
          last_name: payload.lastName,
        }
      };
      return next();
    }
    return res.status(401).json({ message: 'Invalid or expired token' });
  }

  // 2. Check for email auth session (web)
  if (session.userId && session.user) {
    if (!req.user) {
      (req as any).user = {
        claims: {
          sub: session.userId,
          email: session.user.email,
          first_name: session.user.firstName,
          last_name: session.user.lastName,
        }
      };
    }
    return next();
  }

  // Check for Replit Auth (only if enabled)
  if (isReplitAuthEnabled) {
    if (!req.isAuthenticated() || !user || !user.expires_at) {
      console.log("[Auth Debug] Unauthorized - no valid session found");
      return res.status(401).json({ message: "Unauthorized" });
    }

    const now = Math.floor(Date.now() / 1000);
    if (now <= user.expires_at) {
      return next();
    }

    const refreshToken = user.refresh_token;
    if (!refreshToken) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    try {
      const config = await getOidcConfig();
      const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
      updateUserSession(user, tokenResponse);
      return next();
    } catch (error) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
  }

  // If Replit Auth is not enabled and no email auth session, return unauthorized
  console.log("[Auth Debug] Unauthorized - no valid session found");
  return res.status(401).json({ message: "Unauthorized" });
};

// Middleware to require a specific active role
export const requireRole = (role: 'athlete' | 'coach'): RequestHandler => {
  return (req, res, next) => {
    const activeRole = req.session?.activeRole;
    
    if (!activeRole) {
      return res.status(403).json({ 
        message: "No active role selected. Please select a role first.",
        code: "NO_ACTIVE_ROLE"
      });
    }
    
    if (activeRole !== role) {
      return res.status(403).json({ 
        message: `This action requires ${role} mode. You are currently in ${activeRole} mode.`,
        code: "WRONG_ROLE"
      });
    }
    
    next();
  };
};

// Middleware that checks if user has an active role (any role)
export const hasActiveRole: RequestHandler = (req, res, next) => {
  const activeRole = req.session?.activeRole;
  
  if (!activeRole) {
    return res.status(403).json({ 
      message: "No active role selected. Please select a role first.",
      code: "NO_ACTIVE_ROLE"
    });
  }
  
  next();
};
