const mongoose = require('mongoose');

const barberUnavailableDaySchema = new mongoose.Schema(
  {
    barber_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Barber',
      required: true,
    },
    unavailable_date: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

barberUnavailableDaySchema.index({ barber_id: 1, unavailable_date: 1 });

module.exports = mongoose.model('BarberUnavailableDay', barberUnavailableDaySchema);
