const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    shop_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shop',
      required: true,
    },
    barber_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Barber',
      required: true,
    },
    service_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
    },
    customer_name: {
      type: String,
      required: true,
    },
    customer_phone: {
      type: String,
      required: true,
    },
    customer_email: {
      type: String,
    },
    start_time: {
      type: Date,
      required: true,
    },
    end_time: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['booked', 'completed', 'cancelled', 'rescheduled'],
      default: 'booked',
    },
    notification_sent: {
      type: Boolean,
      default: false,
    },
    notification_channel: {
      type: String,
      enum: ['email', 'sms'],
    },
  },
  { timestamps: true }
);

// Create indexes for performance
appointmentSchema.index({ shop_id: 1 });
appointmentSchema.index({ barber_id: 1 });
appointmentSchema.index({ start_time: 1 });
appointmentSchema.index({ notification_sent: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
