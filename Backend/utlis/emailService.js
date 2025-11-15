// utils/emailService.js
const nodemailer = require('nodemailer');
const logger = require('./logger');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

/**
 * Send OTP Email
 * @param {string} email - Recipient email
 * @param {string} otp - OTP code
 * @param {string} name - User's name
 */
const sendOTPEmail = async (email, otp, name = 'User') => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: '🔥 Phoenix Project - Verify Your Email',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #007D6E 0%, #5EB47C 100%); 
                     color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .otp-box { background: white; border: 2px dashed #EC744A; padding: 20px; 
                      text-align: center; font-size: 32px; font-weight: bold; 
                      letter-spacing: 8px; color: #EC744A; margin: 20px 0; border-radius: 8px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            .logo { font-size: 24px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🔥 THE PHOENIX PROJECT</div>
              <p style="margin: 10px 0 0 0; font-size: 14px;">RECYCLE · RENEW</p>
            </div>
            <div class="content">
              <h2 style="color: #007D6E; margin-top: 0;">Hello ${name}! 👋</h2>
              <p>Thank you for joining the Phoenix community! We're excited to have you on board.</p>
              <p>To complete your registration, please verify your email address using the OTP below:</p>
              
              <div class="otp-box">${otp}</div>
              
              <p><strong>⏱️ This OTP will expire in ${process.env.OTP_EXPIRY_MINUTES || 5} minutes.</strong></p>
              
              <p style="color: #666; font-size: 14px;">
                If you didn't request this verification, please ignore this email.
              </p>
              
              <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
              
              <p style="font-size: 14px; color: #666;">
                🌱 Join us in building a sustainable future, one product at a time!
              </p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Phoenix Project. All rights reserved.</p>
              <p>Rebuilding the world, one story at a time.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };
    
    const info = await transporter.sendMail(mailOptions);
    logger.info(`OTP email sent to ${email}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
    
  } catch (error) {
    logger.error('Error sending OTP email:', error);
    throw new Error('Failed to send OTP email');
  }
};

/**
 * Send Welcome Email
 * @param {string} email - Recipient email
 * @param {string} name - User's name
 */
const sendWelcomeEmail = async (email, name) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: '🎉 Welcome to Phoenix Project!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #007D6E 0%, #5EB47C 100%); 
                     color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #EC744A; color: white; 
                     padding: 12px 30px; text-decoration: none; border-radius: 5px; 
                     margin: 20px 0; }
            .feature { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; 
                      border-left: 4px solid #007D6E; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">🔥 Welcome to Phoenix!</h1>
              <p style="margin: 10px 0 0 0;">Your journey to sustainability starts here</p>
            </div>
            <div class="content">
              <h2 style="color: #007D6E;">Hello ${name}! 🌱</h2>
              <p>Congratulations! Your account has been successfully verified.</p>
              <p>You're now part of a growing community committed to sustainability and eco-friendly living.</p>
              
              <h3 style="color: #007D6E; margin-top: 30px;">What you can do now:</h3>
              
              <div class="feature">
                <strong>🛍️ Browse Marketplace</strong>
                <p style="margin: 5px 0 0 0; font-size: 14px;">Discover sustainable products and give items a second life</p>
              </div>
              
              <div class="feature">
                <strong>📝 Share Your Story</strong>
                <p style="margin: 5px 0 0 0; font-size: 14px;">Post your eco-journey and inspire others</p>
              </div>
              
              <div class="feature">
                <strong>🏅 Earn Eco Points</strong>
                <p style="margin: 5px 0 0 0; font-size: 14px;">Get rewarded for every sustainable action</p>
              </div>
              
              <div class="feature">
                <strong>🔧 Offer or Request Services</strong>
                <p style="margin: 5px 0 0 0; font-size: 14px;">Connect with others for repairs and maintenance</p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL}" class="button">Get Started</a>
              </div>
              
              <p style="font-size: 14px; color: #666; margin-top: 30px;">
                Need help? Contact our support team anytime at support@phoenixproject.com
              </p>
            </div>
            <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
              <p>© ${new Date().getFullYear()} Phoenix Project. All rights reserved.</p>
              <p>🌍 Together, we rise like the Phoenix</p>
            </div>
          </div>
        </body>
        </html>
      `
    };
    
    await transporter.sendMail(mailOptions);
    logger.info(`Welcome email sent to ${email}`);
    
  } catch (error) {
    logger.error('Error sending welcome email:', error);
    // Don't throw error for welcome email - it's not critical
  }
};

/**
 * Send Password Reset Email
 * @param {string} email - Recipient email
 * @param {string} resetToken - Password reset token
 * @param {string} name - User's name
 */
const sendPasswordResetEmail = async (email, resetToken, name) => {
  try {
    const transporter = createTransporter();
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: '🔐 Phoenix Project - Password Reset Request',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #007D6E 0%, #5EB47C 100%); 
                     color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #EC744A; color: white; 
                     padding: 12px 30px; text-decoration: none; border-radius: 5px; 
                     margin: 20px 0; }
            .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; 
                      margin: 20px 0; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">🔐 Password Reset</h1>
            </div>
            <div class="content">
              <h2 style="color: #007D6E;">Hello ${name},</h2>
              <p>We received a request to reset your password for your Phoenix Project account.</p>
              <p>Click the button below to create a new password:</p>
              
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </div>
              
              <div class="warning">
                <strong>⚠️ Important:</strong>
                <ul style="margin: 10px 0;">
                  <li>This link will expire in 1 hour</li>
                  <li>If you didn't request this, please ignore this email</li>
                  <li>Never share this link with anyone</li>
                </ul>
              </div>
              
              <p style="font-size: 14px; color: #666; margin-top: 20px;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <span style="color: #007D6E;">${resetUrl}</span>
              </p>
            </div>
            <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
              <p>© ${new Date().getFullYear()} Phoenix Project. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };
    
    await transporter.sendMail(mailOptions);
    logger.info(`Password reset email sent to ${email}`);
    
  } catch (error) {
    logger.error('Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
};

module.exports = {
  sendOTPEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail
};