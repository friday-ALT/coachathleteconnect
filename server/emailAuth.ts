import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { db } from './db';
import { users } from '@shared/schema';
import { eq, and, gt } from 'drizzle-orm';
import { sendVerificationEmail, sendPasswordResetEmail, getBaseUrl } from './email';
import { z } from 'zod';
import { isDemoLogin, DEMO_USER_DATA, DEMO_CREDENTIALS } from './demoAuth';
import { isDemoAuthEnabled } from './demoAuthGate';
import { ensureDemoUserProfiles } from './demoSeed';
import { signToken } from './jwt';

const router = Router();

// Validation schemas
const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Generate a secure random token
function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

async function verifyGoogleIdToken(idToken: string): Promise<{
  sub: string;
  email: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
} | null> {
  const res = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`,
  );
  if (!res.ok) return null;
  const data = await res.json() as {
    sub?: string;
    email?: string;
    given_name?: string;
    family_name?: string;
    picture?: string;
    aud?: string;
  };
  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_WEB_CLIENT_ID;
  if (clientId && data.aud && data.aud !== clientId) return null;
  if (!data.sub || !data.email) return null;
  return {
    sub: data.sub,
    email: data.email,
    given_name: data.given_name,
    family_name: data.family_name,
    picture: data.picture,
  };
}

// POST /api/auth/signup - Create new account with email/password
router.post('/signup', async (req: Request, res: Response) => {
  try {
    const result = signupSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ 
        error: result.error.errors[0].message 
      });
    }

    const { email, password, firstName, lastName } = result.data;

    const passwordHash = await bcrypt.hash(password, 12);

    // Check if user already exists
    const existingUser = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);
    if (existingUser.length > 0) {
      const user = existingUser[0];

      // Website/Google/Apple account — add password so web + mobile email login works
      if (user.authProvider !== 'email' || !user.passwordHash) {
        const hasEmailProvider = !!process.env.RESEND_API_KEY;
        const [linked] = await db.update(users)
          .set({
            passwordHash,
            authProvider: 'email',
            firstName,
            lastName,
            emailVerified: hasEmailProvider ? user.emailVerified : 1,
            updatedAt: new Date(),
          })
          .where(eq(users.id, user.id))
          .returning({
            id: users.id,
            email: users.email,
            firstName: users.firstName,
            lastName: users.lastName,
            emailVerified: users.emailVerified,
          });

        if (!linked) {
          return res.status(500).json({ error: 'Failed to link password to existing account.' });
        }

        if (hasEmailProvider && linked.emailVerified !== 1) {
          const token = generateToken();
          const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
          await db.update(users)
            .set({ verificationToken: token, verificationTokenExpires: expires })
            .where(eq(users.id, linked.id));
          const baseUrl = getBaseUrl(req);
          await sendVerificationEmail(email.toLowerCase(), token, baseUrl);
          return res.json({
            message: 'Password set. Please check your email to verify your account.',
            requiresVerification: true,
          });
        }

        const token = signToken({
          sub: linked.id,
          email: linked.email!,
          firstName: linked.firstName!,
          lastName: linked.lastName!,
        });
        (req.session as any).userId = linked.id;
        (req.session as any).user = {
          id: linked.id,
          email: linked.email,
          firstName: linked.firstName,
          lastName: linked.lastName,
        };
        return res.status(200).json({
          message: 'Account linked — you can now log in with email and password.',
          token,
          user: {
            id: linked.id,
            email: linked.email,
            firstName: linked.firstName,
            lastName: linked.lastName,
            emailVerified: true,
          },
          requiresVerification: false,
        });
      }

      // If user exists but email not verified, allow re-sending verification
      if (user.authProvider === 'email' && user.emailVerified === 0) {
        const token = generateToken();
        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        await db.update(users)
          .set({
            verificationToken: token,
            verificationTokenExpires: expires,
            passwordHash,
            firstName,
            lastName,
            updatedAt: new Date(),
          })
          .where(eq(users.id, user.id));

        const baseUrl = getBaseUrl(req);
        await sendVerificationEmail(email.toLowerCase(), token, baseUrl);

        return res.json({
          message: 'Verification email sent. Please check your inbox.',
          requiresVerification: true,
        });
      }
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    // Generate verification token
    const verificationToken = generateToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // If no email provider is configured, auto-verify and auto-login
    const hasEmailProvider = !!process.env.RESEND_API_KEY;

    const [newUser] = await db.insert(users).values({
      email: email.toLowerCase(),
      firstName,
      lastName,
      passwordHash,
      emailVerified: hasEmailProvider ? 0 : 1, // auto-verify when no email provider
      verificationToken: hasEmailProvider ? verificationToken : null,
      verificationTokenExpires: hasEmailProvider ? verificationExpires : null,
      authProvider: 'email',
    }).returning({
      id: users.id,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
    });

    if (hasEmailProvider) {
      const baseUrl = getBaseUrl(req);
      const emailResult = await sendVerificationEmail(email.toLowerCase(), verificationToken, baseUrl);
      if (!emailResult.success) {
        console.error('Failed to send verification email:', emailResult.error);
      }
      return res.status(201).json({
        message: 'Account created! Please check your email to verify your account.',
        requiresVerification: true,
        userId: newUser.id,
      });
    }

    // No email provider — auto-login (session + JWT for mobile)
    (req.session as any).userId = newUser.id;
    (req.session as any).user = {
      id: newUser.id,
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
    };

    const token = signToken({
      sub: newUser.id,
      email: newUser.email!,
      firstName: newUser.firstName!,
      lastName: newUser.lastName!,
    });

    res.status(201).json({
      message: 'Account created!',
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        emailVerified: true,
      },
      requiresVerification: false,
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    const pgCode = error?.code as string | undefined;
    if (pgCode === '23505') {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }
    res.status(500).json({
      error: 'Failed to create account. Please try again.',
      ...(process.env.NODE_ENV === 'development' && { detail: error?.message }),
    });
  }
});

// GET /api/auth/verify-email - Verify email with token
router.get('/verify-email', async (req: Request, res: Response) => {
  try {
    const { token } = req.query;

    if (!token || typeof token !== 'string') {
      return res.redirect('/auth/login?error=invalid-token');
    }

    // Find user with valid token
    const [user] = await db.select().from(users)
      .where(
        and(
          eq(users.verificationToken, token),
          gt(users.verificationTokenExpires!, new Date())
        )
      )
      .limit(1);

    if (!user) {
      return res.redirect('/auth/login?error=expired-token');
    }

    // Mark email as verified
    await db.update(users)
      .set({
        emailVerified: 1,
        verificationToken: null,
        verificationTokenExpires: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    // Redirect to login with success message
    res.redirect('/auth/login?verified=true');
  } catch (error: any) {
    console.error('Email verification error:', error);
    res.redirect('/auth/login?error=verification-failed');
  }
});

// POST /api/auth/login - Login with email/password
router.post('/login', async (req: Request, res: Response) => {
  try {
    const result = loginSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ 
        error: result.error.errors[0].message 
      });
    }

    const { email, password } = result.data;

    // Check if this is a demo login
    if (isDemoLogin(email, password)) {
      if (!isDemoAuthEnabled()) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
      console.log('Demo login detected');
      
      // Check if demo user exists, create if not
      const [existingDemoUser] = await db.select().from(users)
        .where(eq(users.id, DEMO_CREDENTIALS.userId))
        .limit(1);
      
      if (!existingDemoUser) {
        await db.insert(users).values(DEMO_USER_DATA);
        console.log('Created demo user');
      }

      await ensureDemoUserProfiles();

      // Create session for demo user
      (req.session as any).userId = DEMO_CREDENTIALS.userId;
      (req.session as any).user = {
        id: DEMO_CREDENTIALS.userId,
        email: DEMO_CREDENTIALS.email,
        firstName: DEMO_USER_DATA.firstName,
        lastName: DEMO_USER_DATA.lastName,
      };

      const token = signToken({
        sub: DEMO_CREDENTIALS.userId,
        email: DEMO_CREDENTIALS.email,
        firstName: DEMO_USER_DATA.firstName as string,
        lastName: DEMO_USER_DATA.lastName as string,
      });

      return res.json({
        message: 'Demo login successful',
        token,
        user: {
          id: DEMO_CREDENTIALS.userId,
          email: DEMO_CREDENTIALS.email,
          firstName: DEMO_USER_DATA.firstName,
          lastName: DEMO_USER_DATA.lastName,
        },
        isDemo: true,
      });
    }

    // Find user
    const [user] = await db.select().from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check if this is an email auth user
    if (user.authProvider !== 'email' || !user.passwordHash) {
      const provider = user.authProvider || 'oauth';
      const hint =
        provider === 'google' ? 'Continue with Google' :
        provider === 'apple' ? 'Sign in with Apple' :
        'the same sign-in method you used on the website';
      return res.status(401).json({
        error: `This account uses ${provider === 'email' ? 'a different' : provider} sign-in. On the app, use ${hint}.`,
        authProvider: provider,
      });
    }

    // Only block unverified accounts when an email provider IS configured
    if (user.emailVerified !== 1 && !!process.env.RESEND_API_KEY) {
      return res.status(403).json({ 
        error: 'Please verify your email address before logging in.',
        requiresVerification: true,
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Create session
    (req.session as any).userId = user.id;
    (req.session as any).user = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    const token = signToken({
      sub: user.id,
      email: user.email!,
      firstName: user.firstName!,
      lastName: user.lastName!,
    });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        emailVerified: user.emailVerified === 1,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login. Please try again.' });
  }
});

// POST /api/auth/apple - Sign in with Apple
router.post('/apple', async (req: Request, res: Response) => {
  try {
    const { identityToken, user: appleUser } = req.body;
    if (!identityToken) {
      return res.status(400).json({ error: 'identityToken is required' });
    }

    // Decode header to get key ID
    const [headerB64] = identityToken.split('.');
    const header = JSON.parse(Buffer.from(headerB64, 'base64url').toString());

    // Fetch Apple's public keys
    const keysRes = await fetch('https://appleid.apple.com/auth/keys');
    const { keys } = await keysRes.json() as { keys: any[] };
    const jwk = keys.find((k: any) => k.kid === header.kid);
    if (!jwk) {
      return res.status(401).json({ error: 'Apple public key not found' });
    }

    // Verify the token
    const { createPublicKey } = await import('crypto');
    const publicKey = createPublicKey({ key: jwk, format: 'jwk' });
    const jwt = await import('jsonwebtoken');
    let payload: any;
    try {
      const appleClientId = process.env.APPLE_CLIENT_ID;
      payload = jwt.default.verify(identityToken, publicKey, {
        algorithms: ['RS256'],
        issuer: 'https://appleid.apple.com',
        ...(appleClientId ? { audience: appleClientId } : {}),
      });
    } catch {
      return res.status(401).json({ error: 'Invalid Apple identity token' });
    }

    const appleId: string = payload.sub;
    // Apple only sends email + name on first sign-in
    const email: string | undefined = payload.email || appleUser?.email;
    const firstName: string = appleUser?.name?.firstName || 'Apple';
    const lastName: string  = appleUser?.name?.lastName  || 'User';

    if (!email && !appleId) {
      return res.status(400).json({ error: 'Could not determine user identity from Apple token' });
    }

    // Upsert user by appleId or email
    let dbUser: any;
    const byApple = appleId
      ? await db.select().from(users).where(eq(users.googleId, `apple:${appleId}`)).limit(1)
      : [];

    if (byApple.length > 0) {
      dbUser = byApple[0];
    } else if (email) {
      const byEmail = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);
      if (byEmail.length > 0) {
        dbUser = byEmail[0];
        // Link apple ID to existing account
        await db.update(users).set({ googleId: `apple:${appleId}` }).where(eq(users.id, dbUser.id));
      }
    }

    if (!dbUser) {
      // New user — create account
      const newId = crypto.randomUUID();
      await db.insert(users).values({
        id: newId,
        email: email ? email.toLowerCase() : `apple_${appleId}@privaterelay.appleid.com`,
        firstName,
        lastName,
        authProvider: 'apple',
        emailVerified: 1,
        googleId: `apple:${appleId}`,
      });
      dbUser = { id: newId, email, firstName, lastName };
    }

    const token = signToken({
      sub: dbUser.id,
      email: dbUser.email || '',
      firstName: dbUser.firstName || firstName,
      lastName: dbUser.lastName || lastName,
    });

    res.json({
      message: 'Apple sign-in successful',
      token,
      user: {
        id: dbUser.id,
        email: dbUser.email,
        firstName: dbUser.firstName || firstName,
        lastName: dbUser.lastName || lastName,
      },
      existingUser: !!byApple.length,
    });
  } catch (error: any) {
    console.error('Apple sign-in error:', error);
    res.status(500).json({ error: 'Apple sign-in failed. Please try again.' });
  }
});

// POST /api/auth/demo-login - Quick demo login (no credentials required)
router.post('/demo-login', async (req: Request, res: Response) => {
  if (!isDemoAuthEnabled()) {
    return res.status(403).json({ error: 'Demo login is disabled' });
  }
  try {
    console.log('Demo login endpoint called');

    // Upsert demo user — safe to call repeatedly
    await db.insert(users)
      .values({
        id: DEMO_CREDENTIALS.userId,
        email: DEMO_CREDENTIALS.email,
        firstName: DEMO_USER_DATA.firstName as string,
        lastName: DEMO_USER_DATA.lastName as string,
        authProvider: 'demo',
        emailVerified: 1,
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email: DEMO_CREDENTIALS.email,
          firstName: DEMO_USER_DATA.firstName as string,
          lastName: DEMO_USER_DATA.lastName as string,
          updatedAt: new Date(),
        },
      });

    // Athlete + coach profiles so role-select shows both modes
    await ensureDemoUserProfiles();

    const token = signToken({
      sub: DEMO_CREDENTIALS.userId,
      email: DEMO_CREDENTIALS.email,
      firstName: DEMO_USER_DATA.firstName as string,
      lastName: DEMO_USER_DATA.lastName as string,
    });

    res.json({
      message: 'Demo login successful',
      token,
      user: {
        id: DEMO_CREDENTIALS.userId,
        email: DEMO_CREDENTIALS.email,
        firstName: DEMO_USER_DATA.firstName,
        lastName: DEMO_USER_DATA.lastName,
      },
      isDemo: true,
    });
  } catch (error: any) {
    console.error('Demo login error:', error);
    res.status(500).json({ error: 'Failed to login with demo account. Please try again.' });
  }
});

// POST /api/auth/logout - Logout
router.post('/logout', (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ error: 'Failed to logout' });
    }
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out successfully' });
  });
});

// POST /api/auth/forgot-password - Request password reset
router.post('/forgot-password', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Find user
    const [user] = await db.select().from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    // Always return success to prevent email enumeration
    if (!user || user.authProvider !== 'email') {
      return res.json({ message: 'If an account exists with this email, you will receive a password reset link.' });
    }

    // Generate reset token
    const resetToken = generateToken();
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await db.update(users)
      .set({
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetExpires,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    // Send password reset email
    const baseUrl = getBaseUrl(req);
    await sendPasswordResetEmail(email.toLowerCase(), resetToken, baseUrl);

    res.json({ message: 'If an account exists with this email, you will receive a password reset link.' });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to process request. Please try again.' });
  }
});

// POST /api/auth/reset-password - Reset password with token
router.post('/reset-password', async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ error: 'Token and password are required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    // Find user with valid token
    const [user] = await db.select().from(users)
      .where(
        and(
          eq(users.resetPasswordToken, token),
          gt(users.resetPasswordExpires!, new Date())
        )
      )
      .limit(1);

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    // Update password
    const passwordHash = await bcrypt.hash(password, 12);
    await db.update(users)
      .set({
        passwordHash,
        resetPasswordToken: null,
        resetPasswordExpires: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    res.json({ message: 'Password reset successfully. You can now login with your new password.' });
  } catch (error: any) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password. Please try again.' });
  }
});

// POST /api/auth/resend-verification - Resend verification email
router.post('/resend-verification', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Find user
    const [user] = await db.select().from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (!user || user.authProvider !== 'email') {
      return res.json({ message: 'If an unverified account exists with this email, you will receive a verification link.' });
    }

    if (user.emailVerified === 1) {
      return res.status(400).json({ error: 'Email is already verified. You can login now.' });
    }

    // Generate new verification token
    const verificationToken = generateToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await db.update(users)
      .set({
        verificationToken,
        verificationTokenExpires: verificationExpires,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    // Send verification email
    const baseUrl = getBaseUrl(req);
    await sendVerificationEmail(email.toLowerCase(), verificationToken, baseUrl);

    res.json({ message: 'Verification email sent. Please check your inbox.' });
  } catch (error: any) {
    console.error('Resend verification error:', error);
    res.status(500).json({ error: 'Failed to send verification email. Please try again.' });
  }
});

// GET /api/auth/me - Get current user (works with Bearer JWT or session)
router.get('/me', async (req: Request, res: Response) => {
  const session = req.session as any;

  // Support Bearer JWT for mobile clients
  let userId: string | null = null;
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    const { verifyToken } = await import('./jwt');
    const payload = verifyToken(authHeader.slice(7));
    if (payload) userId = payload.sub;
  }
  if (!userId) userId = session.userId ?? null;

  if (!userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const [user] = await db.select().from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    res.json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImageUrl: user.profileImageUrl,
      emailVerified: user.emailVerified === 1,
    });
  } catch (error: any) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// POST /api/auth/google - Google OAuth sign-in with ID token
router.post('/google', async (req: Request, res: Response) => {
  try {
    const { idToken, email, firstName, lastName, googleId, photoUrl } = req.body;

    let verifiedEmail: string;
    let verifiedGoogleId: string;
    let verifiedFirstName = firstName;
    let verifiedLastName = lastName;
    let verifiedPhoto = photoUrl;

    if (idToken) {
      const verified = await verifyGoogleIdToken(idToken);
      if (!verified) {
        return res.status(401).json({ error: 'Invalid Google ID token' });
      }
      verifiedEmail = verified.email;
      verifiedGoogleId = verified.sub;
      verifiedFirstName = verified.given_name ?? firstName;
      verifiedLastName = verified.family_name ?? lastName;
      verifiedPhoto = verified.picture ?? photoUrl;
    } else if (process.env.NODE_ENV === 'production') {
      return res.status(400).json({ error: 'Google ID token required' });
    } else if (!email || !googleId) {
      return res.status(400).json({ error: 'Missing required Google credentials' });
    } else {
      verifiedEmail = email;
      verifiedGoogleId = googleId;
    }

    // Find or create user by Google ID or email
    let user = await db.select().from(users)
      .where(eq(users.email, verifiedEmail.toLowerCase()))
      .limit(1)
      .then(r => r[0]);

    if (!user) {
      // Create new user from Google profile
      const newId = crypto.randomUUID();
      const [created] = await db.insert(users).values({
        id: newId,
        email: verifiedEmail.toLowerCase(),
        firstName: verifiedFirstName || verifiedEmail.split('@')[0],
        lastName: verifiedLastName || '',
        profileImageUrl: verifiedPhoto || null,
        emailVerified: 1,
        authProvider: 'google',
        googleId: verifiedGoogleId,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning();
      user = created;
    } else if (!user.googleId) {
      // Link Google to existing email account
      await db.update(users)
        .set({
          googleId: verifiedGoogleId,
          emailVerified: 1,
          profileImageUrl: user.profileImageUrl || verifiedPhoto || null,
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id));
    }

    // Create session
    (req.session as any).userId = user.id;
    (req.session as any).user = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    const token = signToken({
      sub: user!.id,
      email: user!.email!,
      firstName: user!.firstName!,
      lastName: user!.lastName!,
    });

    res.json({
      message: 'Google login successful',
      token,
      user: {
        id: user!.id,
        email: user!.email,
        firstName: user!.firstName,
        lastName: user!.lastName,
        profileImageUrl: user!.profileImageUrl,
        emailVerified: true,
      },
    });
  } catch (error: any) {
    console.error('Google login error:', error);
    res.status(500).json({ error: 'Failed to sign in with Google' });
  }
});

export default router;
