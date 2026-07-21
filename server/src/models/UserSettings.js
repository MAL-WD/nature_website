import mongoose from 'mongoose';

const userSettingsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, required: true },
  profile: {
    name: String,
    email: String,
    phone: String,
    language: { type: String, default: 'ar' },
    timezone: { type: String, default: 'Asia/Riyadh' }
  },
  notifications: {
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: true },
    sms: { type: Boolean, default: false },
    fileUpdates: { type: Boolean, default: true },
    systemUpdates: { type: Boolean, default: true },
    reminders: { type: Boolean, default: true }
  },
  security: {
    twoFactorAuth: { type: Boolean, default: false },
    sessionTimeout: { type: Number, default: 30 },
    passwordExpiry: { type: Number, default: 90 }
  },
  appearance: {
    theme: { type: String, enum: ['light', 'dark', 'auto'], default: 'light' },
    fontSize: { type: String, enum: ['small', 'medium', 'large'], default: 'medium' },
    compactMode: { type: Boolean, default: false }
  }
}, { timestamps: true });

export default mongoose.model('UserSettings', userSettingsSchema);
