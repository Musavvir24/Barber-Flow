const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    shop_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shop',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    payment_method: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
    gateway: {
      type: String,
      default: 'razorpay',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);
