/**
 * Convert 24-hour time format (HH:MM) to 12-hour format with AM/PM
 * @param {string} time24 - Time in 24-hour format (e.g., "09:00", "18:00")
 * @returns {string} Time in 12-hour format (e.g., "9 AM", "6 PM")
 */
export const convertTo12Hour = (time24) => {
  if (!time24) return '';
  
  const [hours, minutes] = time24.split(':').map(Number);
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12;
  
  return `${hours12}:${String(minutes).padStart(2, '0')} ${ampm}`;
};

/**
 * Convert 12-hour time with AM/PM to 24-hour format
 * @param {string} time12 - Time in 12-hour format (e.g., "9:00 AM", "6:00 PM")
 * @returns {string} Time in 24-hour format (e.g., "09:00", "18:00")
 */
export const convertTo24Hour = (time12) => {
  if (!time12) return '';
  
  const [time, period] = time12.split(' ');
  let [hours, minutes] = time.split(':').map(Number);
  
  if (period === 'PM' && hours !== 12) {
    hours += 12;
  } else if (period === 'AM' && hours === 12) {
    hours = 0;
  }
  
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};
