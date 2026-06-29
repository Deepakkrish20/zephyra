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
    console.log(
      `\n[Development Fallback] Verification Code: ${code} (Console output due to email failure)\n`
    );
  }
};

/**
 * Send a verification reminder email with a direct link to a user.
 * Falls back to logging to console in development if SMTP is not configured.
 * @param {string} email - Destination email address
 * @param {string} code - 6-digit verification code
 */
export const sendVerificationReminderEmail = async (email, code) => {
  const transporter = getTransporter();
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const verificationLink = `${clientUrl}/verify-email?email=${encodeURIComponent(email)}&code=${code}`;

  const mailOptions = {
    from: `"Zephyra Support" <${process.env.SMTP_USER || 'no-reply@zephyra.io'}>`,
    to: email,
    subject: 'Action Required: Verify Your Zephyra Account',
    text: `Reminder: Please verify your Zephyra account. Use code: ${code} or click the link to verify: ${verificationLink}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #7c3aed; text-align: center;">Account Verification Reminder</h2>
        <p>Hi there,</p>
        <p>This is a reminder to complete your registration on Zephyra. Please click the button below to verify your email address automatically:</p>
        <div style="text-align: center; margin: 25px 0;">
          <a href="${verificationLink}" style="background-color: #7c3aed; color: #ffffff; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 8px; display: inline-block;">
            Verify My Account
          </a>
        </div>
        <p>Or use the following 6-digit code on the verification page:</p>
        <div style="text-align: center; margin: 20px 0;">
          <span style="font-size: 24px; font-weight: bold; letter-spacing: 2px; padding: 8px 16px; background-color: #f5f3ff; border: 1px solid #c4b5fd; border-radius: 6px; color: #7c3aed;">
            ${code}
          </span>
        </div>
        <p style="color: #64748b; font-size: 14px;">The code is valid for 15 minutes. If you did not request this, you can safely ignore this email.</p>
      </div>
    `,
  };

  if (!transporter) {
    console.log(`\n========================================`);
    console.log(`[Development Fallback] Verification Reminder Email Simulation`);
    console.log(`To: ${email}`);
    console.log(`Verification Code: ${code}`);
    console.log(`Verification Link: ${verificationLink}`);
    console.log(`========================================\n`);
    return;
  }

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Verification reminder email sent successfully to ${email}`);
  } catch (error) {
    console.error(`Failed to send verification reminder email to ${email}:`, error.message);
    console.log(
      `\n[Development Fallback] Verification Code: ${code} (Console output due to email failure)\n`
    );
  }
};
