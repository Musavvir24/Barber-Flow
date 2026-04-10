const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    opening_time: {
      type: String,
      default: '09:00:00',
    },
    closing_time: {
      type: String,
      default: '18:00:00',
    },
    country: {
      type: String,
      default: 'India',
    },
    timezone: {
      type: String,
      default: 'Asia/Kolkata',
    },
    trial_started_at: {
      type: Date,
      default: Date.now,
    },
    trial_ends_at: {
      type: Date,
      required: true,
    },
    is_premium: {
      type: Boolean,
      default: false,
    },
    upgrade_date: {
      type: Date,
    },
    premium_expires_at: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Shop', shopSchema);
