import nodemailer from 'nodemailer';

// Create nodemailer transporter from environment variables
const getTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    // If SMTP is not fully configured, return null to use the development console logging fallback
    return null;
  }

  return nodemailer.createTransport({
    host,
    port: parseInt(port, 10),
    secure: port == 465,
    auth: {
      user,
      pass,
    },
  });
};

/**
 * Send a verification code to a user's email address.
 * Falls back to logging to console in development if SMTP is not configured.
 * @param {string} email - Destination email address
 * @param {string} code - 6-digit verification code
 */
export const sendVerificationEmail = async (email, code) => {
  const transporter = getTransporter();

  const mailOptions = {
    from: `"Zephyra Support" <${process.env.SMTP_USER || 'no-reply@zephyra.io'}>`,
    to: email,
    subject: 'Verify Your Zephyra Account',
    text: `Your Zephyra verification code is: ${code}. This code is valid for 15 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #7c3aed; text-align: center;">Welcome to Zephyra!</h2>
        <p>Thank you for registering. Please use the following 6-digit verification code to complete your registration:</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; padding: 10px 20px; background-color: #f5f3ff; border: 1px solid #c4b5fd; border-radius: 8px; color: #7c3aed;">
            ${code}
          </span>
        </div>
        <p style="color: #64748b; font-size: 14px;">This code is valid for 15 minutes. If you did not request this code, please ignore this email.</p>
      </div>
    `,
  };

  if (!transporter) {
    console.log(`\n========================================`);
    console.log(`[Development Fallback] Verification Email Simulation`);
    console.log(`To: ${email}`);
    console.log(`Verification Code: ${code}`);
    console.log(`========================================\n`);
    return;
  }

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent successfully to ${email}`);
  } catch (error) {
    console.error(`Failed to send verification email to ${email}:`, error.message);
    console.log(`\n[Development Fallback] Verification Code: ${code} (Console output due to email failure)\n`);
  }
};
