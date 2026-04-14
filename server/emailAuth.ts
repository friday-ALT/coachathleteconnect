import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { db } from './db';
import { users } from '@shared/schema';
import { eq, and, gt } from 'drizzle-orm';
import { sendVerificationEmail, sendPasswordResetEmail, getBaseUrl } from './email';
import { z } from 'zod';
import { isDemoLogin, DEMO_USER_DATA, DEMO_CREDENTIALS } from './demoAuth';
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

    // Check if user already exists
    const existingUser = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);
    if (existingUser.length > 0) {
      const user = existingUser[0];
      // If user exists but email not verified, allow re-sending verification
      if (user.authProvider === 'email' && user.emailVerified === 0) {
        const token = generateToken();
        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        await db.update(users)
          .set({
            verificationToken: token,
            verificationTokenExpires: expires,
            passwordHash: await bcrypt.hash(password, 12),
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

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

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
    }).returning();

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

    // No email provider — auto-login with JWT
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
    res.status(500).json({ error: 'Failed to create account. Please try again.' });
  }
});

// GET /api/auth/verify-email - Verify email with token
router.get('/verify-email', async (req: Request, res: Response) => {
  try {
    const { token } = req.query;

    if (!token || typeof token !== 'string') {
      return res.redirect('/login?error=invalid-token');
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
      return res.redirect('/login?error=expired-token');
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
    res.redirect('/login?verified=true');
  } catch (error: any) {
    console.error('Email verification error:', error);
    res.redirect('/login?error=verification-failed');
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
      console.log('Demo login detected');
      
      // Check if demo user exists, create if not
      const [existingDemoUser] = await db.select().from(users)
        .where(eq(users.id, DEMO_CREDENTIALS.userId))
        .limit(1);
      
      if (!existingDemoUser) {
        await db.insert(users).values(DEMO_USER_DATA);
        console.log('Created demo user');
      }

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
      return res.status(401).json({ 
        error: 'This account uses a different login method. Please use the original sign-in method.' 
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

// POST /api/auth/demo-login - Quick demo login (no credentials required)
router.post('/demo-login', async (req: Request, res: Response) => {
  try {
    console.log('Demo login endpoint called');
    
    // Check if demo user exists, create if not
    const [existingDemoUser] = await db.select().from(users)
      .where(eq(users.id, DEMO_CREDENTIALS.userId))
      .limit(1);
    
    if (!existingDemoUser) {
      await db.insert(users).values(DEMO_USER_DATA);
      console.log('Created demo user');
    }

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

    if (!email || !googleId) {
      return res.status(400).json({ error: 'Missing required Google credentials' });
    }

    // Find or create user by Google ID or email
    let user = await db.select().from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1)
      .then(r => r[0]);

    if (!user) {
      // Create new user from Google profile
      const newId = crypto.randomUUID();
      const [created] = await db.insert(users).values({
        id: newId,
        email: email.toLowerCase(),
        firstName: firstName || email.split('@')[0],
        lastName: lastName || '',
        profileImageUrl: photoUrl || null,
        emailVerified: 1,
        authProvider: 'google',
        googleId,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning();
      user = created;
    } else if (!user.googleId) {
      // Link Google to existing email account
      await db.update(users)
        .set({ googleId, emailVerified: 1, profileImageUrl: user.profileImageUrl || photoUrl || null, updatedAt: new Date() })
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
