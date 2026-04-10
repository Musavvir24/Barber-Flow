const { sendAppointmentConfirmationEmail } = require('./emailService');

let twilio;
try {
  twilio = require('twilio');
} catch (error) {
  console.warn('⚠ Twilio package could not be loaded');
  twilio = null;
}

// Initialize Twilio client only if credentials are provided
const TWILIO_ENABLED = !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN);
let client = null;

if (TWILIO_ENABLED && twilio) {
  try {
    // Only create client if we have valid credentials
    if (process.env.TWILIO_ACCOUNT_SID.startsWith('AC')) {
      client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      console.log('✓ Twilio notifications enabled');
    } else {
      console.log('⚠ Twilio credentials present but invalid format. Notifications disabled.');
    }
  } catch (error) {
    console.warn('⚠ Twilio initialization failed:', error.message);
  }
}

const TWILIO_PHONE = process.env.TWILIO_PHONE || '';
const TWILIO_WHATSAPP = process.env.TWILIO_WHATSAPP_NUMBER ? 'whatsapp:' + process.env.TWILIO_WHATSAPP_NUMBER : '';

/**
 * Format phone number to international format
 */
function formatPhoneNumber(phone) {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // If already has country code (starts with 1-9), assume it's complete
  if (digits.length >= 10) {
    return '+' + digits;
  }
  
  // Otherwise assume US number and add +1
  return '+1' + digits;
}

/**
 * Format appointment details for message
 */
function formatAppointmentDetails(appointment, barberName, shopName, serviceName) {
  const appointmentDate = new Date(appointment.start_time);
  const dateStr = appointmentDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  const timeStr = appointmentDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  return {
    date: dateStr,
    time: timeStr,
    barber: barberName,
    shop: shopName,
    service: serviceName
  };
}

/**
 * Send appointment confirmation via EMAIL
 */
async function sendConfirmation(appointment, customer, barberName, shopName, serviceName, duration) {
  // Send email to customer instead of WhatsApp
  const appointmentData = {
    appointmentId: appointment.id,
    customerName: customer.name || customer.email.split('@')[0],
    barberName: barberName,
    serviceName: serviceName,
    appointmentDate: appointment.start_time,
    appointmentTime: new Date(appointment.start_time).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }),
    shopName: shopName,
    shopPhone: customer.phone || '',
    duration: duration || 30
  };

  console.log('📧 Sending appointment confirmation email to:', customer.email);
  const emailSent = await sendAppointmentConfirmationEmail(customer.email, appointmentData);
  
  if (emailSent) {
    console.log('✅ Appointment confirmation sent via email to:', customer.email);
    return { success: true, channel: 'email' };
  } else {
    console.error('❌ Failed to send appointment confirmation email to:', customer.email);
    return { success: false, reason: 'Email send failed' };
  }
}

/**
 * Legacy WhatsApp confirmation (kept for reference, not used)
 */
async function sendConfirmationViaWhatsApp(appointment, customer, barberName, shopName, serviceName) {
  if (!TWILIO_ENABLED) {
    console.log('⚠ Twilio disabled - WhatsApp notification would be sent to:', customer.phone);
    return { success: false, reason: 'Twilio not configured' };
  }

  const phoneNumber = formatPhoneNumber(customer.phone);
  const details = formatAppointmentDetails(appointment, barberName, shopName, serviceName);

  const message = `Hi ${customer.name}! 

Your appointment is confirmed! ✂️

📍 Shop: ${details.shop}
💈 Barber: ${details.barber}
✨ Service: ${serviceName}
📅 Date: ${details.date}
🕐 Time: ${details.time}

Reply with "CANCEL" to reschedule or cancel.

Thank you!`;

  try {
    // Try WhatsApp first
    try {
      const whatsappResult = await client.messages.create({
        from: TWILIO_WHATSAPP,
        to: `whatsapp:${phoneNumber}`,
        body: message
      });
      console.log(`✓ WhatsApp confirmation sent to ${phoneNumber}: ${whatsappResult.sid}`);
      return { success: true, channel: 'whatsapp', sid: whatsappResult.sid };
    } catch (whatsappError) {
      console.log(`WhatsApp failed (${whatsappError.message}), falling back to SMS`);

      // Fallback to SMS
      const smsResult = await client.messages.create({
        from: TWILIO_PHONE,
        to: phoneNumber,
        body: message
      });
      console.log(`✓ SMS confirmation sent to ${phoneNumber}: ${smsResult.sid}`);
      return { success: true, channel: 'sms', sid: smsResult.sid };
    }
  } catch (error) {
    console.error(`✗ Notification failed for ${phoneNumber}:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Send appointment reminder 24 hours before
 */
async function sendReminder(appointment, customer, barberName, shopName, serviceName) {
  if (!TWILIO_ENABLED) {
    console.log('⚠ Twilio disabled - reminder would be sent to:', customer.phone);
    return { success: false, reason: 'Twilio not configured' };
  }

  const phoneNumber = formatPhoneNumber(customer.phone);
  const details = formatAppointmentDetails(appointment, barberName, shopName, serviceName);

  const message = `Reminder! Your appointment is tomorrow at ${details.time} with ${details.barber} at ${details.shop}.

Service: ${serviceName}
Please arrive 5 minutes early.

${details.time}`;

  try {
    try {
      const whatsappResult = await client.messages.create({
        from: TWILIO_WHATSAPP,
        to: `whatsapp:${phoneNumber}`,
        body: message
      });
      console.log(`✓ WhatsApp reminder sent to ${phoneNumber}: ${whatsappResult.sid}`);
      return { success: true, channel: 'whatsapp', sid: whatsappResult.sid };
    } catch (whatsappError) {
      const smsResult = await client.messages.create({
        from: TWILIO_PHONE,
        to: phoneNumber,
        body: message
      });
      console.log(`✓ SMS reminder sent to ${phoneNumber}: ${smsResult.sid}`);
      return { success: true, channel: 'sms', sid: smsResult.sid };
    }
  } catch (error) {
    console.error(`✗ Reminder failed for ${phoneNumber}:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Send cancellation notification
 */
async function sendCancellation(appointment, customer, barberName, shopName, serviceName, reason = '') {
  if (!TWILIO_ENABLED) {
    console.log('⚠ Twilio disabled - cancellation would be sent to:', customer.phone);
    return { success: false, reason: 'Twilio not configured' };
  }

  const phoneNumber = formatPhoneNumber(customer.phone);
  const details = formatAppointmentDetails(appointment, barberName, shopName, serviceName);

  const message = `Hi ${customer.name},

Your appointment has been cancelled.

${reason ? `Reason: ${reason}\n\n` : ''}Shop: ${details.shop}
Barber: ${details.barber}
Original time: ${details.date} at ${details.time}

To reschedule, reply to this message or visit our booking page.`;

  try {
    try {
      const whatsappResult = await client.messages.create({
        from: TWILIO_WHATSAPP,
        to: `whatsapp:${phoneNumber}`,
        body: message
      });
      console.log(`✓ WhatsApp cancellation sent to ${phoneNumber}: ${whatsappResult.sid}`);
      return { success: true, channel: 'whatsapp', sid: whatsappResult.sid };
    } catch (whatsappError) {
      const smsResult = await client.messages.create({
        from: TWILIO_PHONE,
        to: phoneNumber,
        body: message
      });
      console.log(`✓ SMS cancellation sent to ${phoneNumber}: ${smsResult.sid}`);
      return { success: true, channel: 'sms', sid: smsResult.sid };
    }
  } catch (error) {
    console.error(`✗ Cancellation notification failed for ${phoneNumber}:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Send rescheduling notification
 */
async function sendReschedule(appointment, oldAppointment, customer, barberName, shopName, serviceName) {
  if (!TWILIO_ENABLED) {
    console.log('⚠ Twilio disabled - reschedule notification would be sent to:', customer.phone);
    return { success: false, reason: 'Twilio not configured' };
  }

  const phoneNumber = formatPhoneNumber(customer.phone);
  const oldDetails = formatAppointmentDetails(oldAppointment, barberName, shopName, serviceName);
  const newDetails = formatAppointmentDetails(appointment, barberName, shopName, serviceName);

  const message = `Hi ${customer.name},

Your appointment has been rescheduled! 📅

❌ Old time: ${oldDetails.date} at ${oldDetails.time}
✅ New time: ${newDetails.date} at ${newDetails.time}

Barber: ${newDetails.barber}
Service: ${serviceName}
Shop: ${newDetails.shop}`;

  try {
    try {
      const whatsappResult = await client.messages.create({
        from: TWILIO_WHATSAPP,
        to: `whatsapp:${phoneNumber}`,
        body: message
      });
      console.log(`✓ WhatsApp reschedule sent to ${phoneNumber}: ${whatsappResult.sid}`);
      return { success: true, channel: 'whatsapp', sid: whatsappResult.sid };
    } catch (whatsappError) {
      const smsResult = await client.messages.create({
        from: TWILIO_PHONE,
        to: phoneNumber,
        body: message
      });
      console.log(`✓ SMS reschedule sent to ${phoneNumber}: ${smsResult.sid}`);
      return { success: true, channel: 'sms', sid: smsResult.sid };
    }
  } catch (error) {
    console.error(`✗ Reschedule notification failed for ${phoneNumber}:`, error.message);
    return { success: false, error: error.message };
  }
}

module.exports = {
  sendConfirmation,
  sendReminder,
  sendCancellation,
  sendReschedule,
  formatPhoneNumber
};
