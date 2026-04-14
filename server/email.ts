import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Get the base URL for email links
export function getBaseUrl(req?: { protocol: string; hostname: string }): string {
  if (req) {
    return `${req.protocol}://${req.hostname}`;
  }
  // Fallback for when req is not available
  if (process.env.REPLIT_DOMAINS) {
    const domain = process.env.REPLIT_DOMAINS.split(',')[0];
    return `https://${domain}`;
  }
  return 'http://localhost:5000';
}

export async function sendVerificationEmail(
  email: string,
  token: string,
  baseUrl: string
): Promise<{ success: boolean; error?: string }> {
  const verificationUrl = `${baseUrl}/api/auth/verify-email?token=${token}`;
  
  // If no API key, log the verification URL for development
  if (!resend) {
    console.log('\n📧 EMAIL VERIFICATION (Development Mode):');
    console.log(`   Email: ${email}`);
    console.log(`   Verification URL: ${verificationUrl}\n`);
    return { success: true };
  }
  
  try {
    const { data, error } = await resend.emails.send({
      from: 'CoachConnect <onboarding@resend.dev>',
      to: email,
      subject: 'Verify your email - CoachConnect',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #26a641; margin: 0;">CoachConnect</h1>
          </div>
          
          <div style="background: #f9f9f9; border-radius: 8px; padding: 30px; margin-bottom: 20px;">
            <h2 style="margin-top: 0;">Verify your email address</h2>
            <p>Thanks for signing up! Please click the button below to verify your email address and complete your registration.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" style="background: #26a641; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
                Verify Email Address
              </a>
            </div>
            
            <p style="font-size: 14px; color: #666;">
              Or copy and paste this link into your browser:<br>
              <a href="${verificationUrl}" style="color: #26a641; word-break: break-all;">${verificationUrl}</a>
            </p>
            
            <p style="font-size: 14px; color: #666; margin-bottom: 0;">
              This link will expire in 24 hours.
            </p>
          </div>
          
          <div style="text-align: center; font-size: 12px; color: #999;">
            <p>If you didn't create an account with CoachConnect, you can safely ignore this email.</p>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('Failed to send verification email:', error);
      return { success: false, error: error.message };
    }

    console.log('Verification email sent:', data?.id);
    return { success: true };
  } catch (err: any) {
    console.error('Error sending verification email:', err);
    return { success: false, error: err.message || 'Failed to send email' };
  }
}

export async function sendPasswordResetEmail(
  email: string,
  token: string,
  baseUrl: string
): Promise<{ success: boolean; error?: string }> {
  const resetUrl = `${baseUrl}/reset-password?token=${token}`;
  
  // If no API key, log the reset URL for development
  if (!resend) {
    console.log('\n🔑 PASSWORD RESET (Development Mode):');
    console.log(`   Email: ${email}`);
    console.log(`   Reset URL: ${resetUrl}\n`);
    return { success: true };
  }
  
  try {
    const { data, error } = await resend.emails.send({
      from: 'CoachConnect <onboarding@resend.dev>',
      to: email,
      subject: 'Reset your password - CoachConnect',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #26a641; margin: 0;">CoachConnect</h1>
          </div>
          
          <div style="background: #f9f9f9; border-radius: 8px; padding: 30px; margin-bottom: 20px;">
            <h2 style="margin-top: 0;">Reset your password</h2>
            <p>We received a request to reset your password. Click the button below to choose a new password.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background: #26a641; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
                Reset Password
              </a>
            </div>
            
            <p style="font-size: 14px; color: #666;">
              Or copy and paste this link into your browser:<br>
              <a href="${resetUrl}" style="color: #26a641; word-break: break-all;">${resetUrl}</a>
            </p>
            
            <p style="font-size: 14px; color: #666; margin-bottom: 0;">
              This link will expire in 1 hour.
            </p>
          </div>
          
          <div style="text-align: center; font-size: 12px; color: #999;">
            <p>If you didn't request a password reset, you can safely ignore this email.</p>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('Failed to send password reset email:', error);
      return { success: false, error: error.message };
    }

    console.log('Password reset email sent:', data?.id);
    return { success: true };
  } catch (err: any) {
    console.error('Error sending password reset email:', err);
    return { success: false, error: err.message || 'Failed to send email' };
  }
}
