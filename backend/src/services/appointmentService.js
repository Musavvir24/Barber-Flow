const { prisma } = require('../utils/db');

// Check if barber has conflicting appointments (uses string format)
const checkConflict = async (barberId, appointmentDate, startTime, endTime, excludeAppointmentId = null) => {
  const result = await prisma.appointment.findFirst({
    where: {
      barber_id: barberId,
      appointment_date: appointmentDate,
      status: 'booked',
      OR: [
        {
          start_time: { lt: endTime, gte: startTime },
        },
        {
          end_time: { gt: startTime, lte: endTime },
        },
        {
          start_time: { lte: startTime },
          end_time: { gte: endTime },
        },
      ],
      ...(excludeAppointmentId && { NOT: { id: excludeAppointmentId } }),
    },
  });
  return !!result; // Returns true if conflict exists
};

// Check if time slot falls within any barber break times (placeholder)
const hasBreakConflict = async (barberId, date, slotTime, durationMinutes) => {
  // Check for barber unavailable days
  const dateObj = new Date(date);
  const startOfDay = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
  const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);
  
  const unavailableDay = await prisma.barberUnavailableDay.findFirst({
    where: {
      barber_id: barberId,
      unavailable_date: {
        gte: startOfDay,
        lt: endOfDay,
      },
    },
  });
  return !!unavailableDay;
};

// Get available time slots for a barber on a specific date
// Generates slots based on service duration + gap time using shop's opening/closing times
const getAvailableSlots = async (barberId, date, durationMinutes, gapTimeMinutes = 0, openingTime = '09:00:00', closingTime = '18:00:00') => {
  const [openHour, openMin] = openingTime.split(':').map(Number);
  const [closeHour, closeMin] = closingTime.split(':').map(Number);

  const workStart = openHour * 60 + openMin; // in minutes
  const workEnd = closeHour * 60 + closeMin; // in minutes
  const slotIntervalMinutes = durationMinutes + gapTimeMinutes;

  const slots = [];
  const dateStr = new Date(date).toISOString().split('T')[0];

  // Get all appointments for this barber on this date
  const appointments = await prisma.appointment.findMany({
    where: {
      barber_id: barberId,
      appointment_date: dateStr,
      status: 'booked',
    },
  });

  let currentMinutes = workStart;

  while (currentMinutes + durationMinutes <= workEnd) {
    const hour = Math.floor(currentMinutes / 60);
    const minute = currentMinutes % 60;
    const slotTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`;
    
    // Calculate end time for this slot
    const endMinutes = currentMinutes + durationMinutes;
    const endHour = Math.floor(endMinutes / 60);
    const endMinute = endMinutes % 60;
    const slotEndTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}:00`;

    // Check if this slot conflicts with any existing appointment
    let hasConflict = false;
    for (const appt of appointments) {
      const apptStart = appt.start_time;
      const apptEnd = appt.end_time;
      
      // Check if slot overlaps with appointment
      if (slotTime < apptEnd && slotEndTime > apptStart) {
        hasConflict = true;
        break;
      }
    }
    
    // Check if barber is unavailable on this date
    const isUnavailable = await prisma.barberUnavailableDay.findFirst({
      where: {
        barber_id: barberId,
        unavailable_date: new Date(dateStr),
      },
    });

    if (!hasConflict && !isUnavailable) {
      slots.push(slotTime.split(':')[0] + ':' + slotTime.split(':')[1]); // Return HH:MM format
    }

    currentMinutes += slotIntervalMinutes;
  }

  return slots;
};

module.exports = {
  checkConflict,
  hasBreakConflict,
  getAvailableSlots,
};
