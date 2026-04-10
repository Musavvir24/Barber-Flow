const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
  {
    shop_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shop',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    duration_minutes: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    gap_time_minutes: {
      type: Number,
      default: 0,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Service', serviceSchema);
