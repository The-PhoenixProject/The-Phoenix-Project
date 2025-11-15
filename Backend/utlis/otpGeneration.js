// utils/otpGenerator.js
const crypto = require('crypto');

/**
 * Generate a random OTP
 * @param {number} length - Length of OTP (default: 6)
 * @returns {string} - Generated OTP
 */
const generateOTP = (length = 6) => {
  const otpLength = parseInt(process.env.OTP_LENGTH) || length;
  
  // Generate random bytes
  const buffer = crypto.randomBytes(Math.ceil(otpLength / 2));
  
  // Convert to number and ensure it has the correct length
  let otp = parseInt(buffer.toString('hex'), 16)
    .toString()
    .substring(0, otpLength);
  
  // Pad with zeros if needed
  while (otp.length < otpLength) {
    otp = '0' + otp;
  }
  
  return otp;
};

/**
 * Generate a random token for email verification or password reset
 * @returns {string} - Generated token
 */
const generateToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Hash a token using SHA256
 * @param {string} token - Token to hash
 * @returns {string} - Hashed token
 */
const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

module.exports = {
  generateOTP,
  generateToken,
  hashToken
};