const Appointment = require('../models/Appointment');

// Check if barber has conflicting appointments
const checkConflict = async (barberId, startTime, endTime, excludeAppointmentId = null) => {
  let filter = {
    barber_id: barberId,
    status: 'booked',
    $or: [
      {
        start_time: { $lt: new Date(endTime), $gte: new Date(startTime) },
      },
      {
        end_time: { $gt: new Date(startTime), $lte: new Date(endTime) },
      },
      {
        start_time: { $lte: new Date(startTime) },
        end_time: { $gte: new Date(endTime) },
      },
    ],
  };

  // Exclude current appointment if editing
  if (excludeAppointmentId) {
    filter._id = { $ne: excludeAppointmentId };
  }

  const result = await Appointment.findOne(filter);
  return !!result; // Returns true if conflict exists
};

// Check if time slot falls within any barber break times (placeholder)
const hasBreakConflict = async (barberId, date, slotTime, durationMinutes) => {
  // Since barber breaks table is not fully implemented in MongoDB,
  // returning false for now. Can be extended later.
  return false;
};

// Get available time slots for a barber on a specific date
// Generates slots based on service duration + gap time using shop's opening/closing times
const getAvailableSlots = async (barberId, date, durationMinutes, gapTimeMinutes = 0, openingTime = '09:00:00', closingTime = '18:00:00') => {
  // Parse opening and closing times
  const [openHour, openMin] = openingTime.split(':').map(Number);
  const [closeHour, closeMin] = closingTime.split(':').map(Number);

  const workStart = openHour * 60 + openMin; // in minutes
  const workEnd = closeHour * 60 + closeMin; // in minutes
  const slotIntervalMinutes = durationMinutes + gapTimeMinutes; // Total time per slot including gap

  const slots = [];
  const dateStr = new Date(date).toISOString().split('T')[0];

  // Generate all possible slots based on service duration + gap time
  let currentMinutes = workStart;

  while (currentMinutes + durationMinutes <= workEnd) {
    const hour = Math.floor(currentMinutes / 60);
    const minute = currentMinutes % 60;
    const slotTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

    // Check if this slot has conflicts with appointments
    const startTime = new Date(`${dateStr}T${slotTime}:00`);
    const endTime = new Date(startTime.getTime() + durationMinutes * 60000);

    const hasAppointmentConflict = await checkConflict(barberId, startTime, endTime);

    // Check if this slot conflicts with break times
    const hasBreak = await hasBreakConflict(barberId, date, slotTime, durationMinutes);

    if (!hasAppointmentConflict && !hasBreak) {
      slots.push(slotTime);
    }

    // Move to next slot (duration + gap time)
    currentMinutes += slotIntervalMinutes;
  }

  return slots;
};

module.exports = {
  checkConflict,
  hasBreakConflict,
  getAvailableSlots,
};

module.exports = {
  checkConflict,
  getAvailableSlots,
  hasBreakConflict,
};
