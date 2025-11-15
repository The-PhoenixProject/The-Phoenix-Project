// models/OTP.model.js
const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  
  otp: {
    type: String,
    required: true
  },
  
  purpose: {
    type: String,
    enum: ['email_verification', 'password_reset', '2fa'],
    default: 'email_verification'
  },
  
  attempts: {
    type: Number,
    default: 0,
    max: 5
  },
  
  isUsed: {
    type: Boolean,
    default: false
  },
  
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 } // TTL index - MongoDB will auto-delete after expiration
  },
  
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600 // Document will be deleted 10 minutes after creation (fallback)
  }
}, {
  timestamps: true
});

// Index for faster queries
otpSchema.index({ email: 1, purpose: 1 });
otpSchema.index({ expiresAt: 1 });

// Static method to create new OTP
otpSchema.statics.createOTP = async function(email, otp, purpose = 'email_verification') {
  const expiryMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES) || 5;
  
  // Delete any existing OTPs for this email and purpose
  await this.deleteMany({ email, purpose });
  
  // Create new OTP
  return await this.create({
    email,
    otp,
    purpose,
    expiresAt: new Date(Date.now() + expiryMinutes * 60 * 1000)
  });
};

// Static method to verify OTP
otpSchema.statics.verifyOTP = async function(email, otp, purpose = 'email_verification') {
  const otpDoc = await this.findOne({ 
    email, 
    purpose,
    isUsed: false,
    expiresAt: { $gt: new Date() }
  });
  
  if (!otpDoc) {
    return { 
      success: false, 
      message: 'OTP not found or expired' 
    };
  }
  
  // Check max attempts
  if (otpDoc.attempts >= 5) {
    await otpDoc.deleteOne();
    return { 
      success: false, 
      message: 'Maximum attempts exceeded. Please request a new OTP.' 
    };
  }
  
  // Increment attempts
  otpDoc.attempts += 1;
  
  // Verify OTP
  if (otpDoc.otp !== otp) {
    await otpDoc.save();
    return { 
      success: false, 
      message: `Invalid OTP. ${5 - otpDoc.attempts} attempts remaining.` 
    };
  }
  
  // Mark as used and delete
  otpDoc.isUsed = true;
  await otpDoc.save();
  await otpDoc.deleteOne();
  
  return { 
    success: true, 
    message: 'OTP verified successfully' 
  };
};

// Static method to check if OTP exists and is valid
otpSchema.statics.isValidOTP = async function(email, purpose = 'email_verification') {
  const otpDoc = await this.findOne({ 
    email, 
    purpose,
    isUsed: false,
    expiresAt: { $gt: new Date() }
  });
  
  return !!otpDoc;
};

const OTP = mongoose.model('OTP', otpSchema);

module.exports = OTP;