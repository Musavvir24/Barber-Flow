// Email Service - Using Brevo (Sendinblue) for appointment confirmations
const axios = require('axios');

const BREVO_API_KEY = process.env.SENDGRID_API_KEY;
const BREVO_FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL;
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

// Initialize Brevo
if (BREVO_API_KEY) {
  console.log('✅ Brevo email service initialized');
} else {
  console.error('❌ SENDGRID_API_KEY (Brevo) not configured in .env');
}

// Send appointment confirmation email to customer via Brevo
const sendAppointmentConfirmationEmail = async (customerEmail, appointmentData) => {
  try {
    if (!BREVO_API_KEY) {
      console.error('❌ Brevo not configured');
      return false;
    }

    const {
      appointmentId,
      customerName,
      barberName,
      serviceName,
      appointmentDate,
      appointmentTime,
      shopName,
      shopPhone,
      duration
    } = appointmentData;

    // Format date for display
    const date = new Date(appointmentDate);
    const formattedDate = date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    const emailContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; color: #333; background: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .email-card { background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; }
          .header p { margin: 5px 0 0 0; font-size: 14px; opacity: 0.9; }
          .content { padding: 30px; }
          .confirmation-number { background: #f0f4ff; padding: 15px; border-radius: 6px; margin-bottom: 20px; text-align: center; border-left: 4px solid #667eea; }
          .confirmation-number strong { color: #667eea; font-size: 18px; }
          .detail-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #eee; }
          .detail-row:last-child { border-bottom: none; }
          .detail-label { font-weight: bold; color: #666; }
          .detail-value { color: #333; text-align: right; }
          .footer { background: #f9f9f9; padding: 20px; text-align: center; border-top: 1px solid #eee; font-size: 12px; color: #999; }
          .divider { height: 1px; background: #eee; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="email-card">
            <div class="header">
              <h1>Appointment Confirmed</h1>
              <p>Your booking is all set!</p>
            </div>

            <div class="content">
              <p>Hi ${customerName},</p>
              
              <p>Thank you for booking an appointment at <strong>${shopName}</strong>! We're excited to see you.</p>

              <div class="confirmation-number">
                <p style="margin: 0; font-size: 12px; color: #999; margin-bottom: 5px;">Booking Reference</p>
                <strong>#${appointmentId}</strong>
              </div>

              <h3 style="color: #333; margin-top: 25px;">Appointment Details</h3>
              
              <div class="detail-row">
                <span class="detail-label">Date:</span>
                <span class="detail-value">${formattedDate}</span>
              </div>

              <div class="detail-row">
                <span class="detail-label">Time:</span>
                <span class="detail-value">${appointmentTime}</span>
              </div>

              <div class="detail-row">
                <span class="detail-label">Barber:</span>
                <span class="detail-value">${barberName}</span>
              </div>

              <div class="detail-row">
                <span class="detail-label">Service:</span>
                <span class="detail-value">${serviceName}</span>
              </div>

              <div class="detail-row">
                <span class="detail-label">Duration:</span>
                <span class="detail-value">${duration} minutes</span>
              </div>

              <div class="divider"></div>

              <h3 style="color: #333;">Shop Information</h3>
              <p style="margin: 10px 0;">
                <strong>${shopName}</strong><br>
                ${shopPhone ? `Phone: <a href="tel:${shopPhone}">${shopPhone}</a>` : ''}
              </p>

              <p style="color: #666; margin-top: 20px;">
                Please arrive 5-10 minutes early. If you need to reschedule or cancel, please contact the shop directly.
              </p>

              <p style="margin-top: 30px; color: #999; font-size: 12px;">
                We look forward to serving you! 💈
              </p>
            </div>

            <div class="footer">
              <p style="margin: 0;">BarberFlow - Your Appointment, Our Priority</p>
              <p style="margin: 5px 0 0 0;">This is an automated email. Please do not reply to this message.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const payload = {
      sender: {
        name: shopName,
        email: BREVO_FROM_EMAIL
      },
      to: [
        {
          email: customerEmail,
          name: customerName
        }
      ],
      subject: `✂️ Appointment Confirmation - ${shopName}`,
      htmlContent: emailContent
    };

    console.log('📧 Sending appointment confirmation email to:', customerEmail);
    
    const response = await axios.post(BREVO_API_URL, payload, {
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Appointment confirmation email sent successfully to:', customerEmail);
    console.log('📧 Message ID:', response.data.messageId);
    
    return true;
  } catch (error) {
    console.error('❌ Error sending appointment confirmation email:', error.message);
    if (error.response) {
      console.error('❌ Brevo Error Response:', error.response.data);
    }
    return false;
  }
};

// Send appointment reminder email
const sendAppointmentReminderEmail = async (customerEmail, appointmentData) => {
  try {
    if (!BREVO_API_KEY) {
      console.error('❌ Brevo not configured');
      return false;
    }

    const { customerName, barberName, serviceName, appointmentDate, appointmentTime, shopName } = appointmentData;

    const payload = {
      sender: {
        name: shopName,
        email: BREVO_FROM_EMAIL
      },
      to: [
        {
          email: customerEmail,
          name: customerName
        }
      ],
      subject: `⏰ Appointment Reminder - ${shopName}`,
      htmlContent: `
        <h2>Appointment Reminder</h2>
        <p>Hi ${customerName},</p>
        <p>Just a friendly reminder that you have an appointment tomorrow at <strong>${shopName}</strong></p>
        <p><strong>Time:</strong> ${appointmentTime}</p>
        <p><strong>Barber:</strong> ${barberName}</p>
        <p><strong>Service:</strong> ${serviceName}</p>
        <p>See you soon! 💈</p>
      `
    };

    await axios.post(BREVO_API_URL, payload, {
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Appointment reminder email sent to:', customerEmail);
    return true;
  } catch (error) {
    console.error('❌ Error sending reminder email:', error.message);
    return false;
  }
};

// Send appointment cancellation email
const sendAppointmentCancellationEmail = async (customerEmail, appointmentData) => {
  try {
    if (!BREVO_API_KEY) {
      console.error('❌ Brevo not configured');
      return false;
    }

    const { customerName, barberName, serviceName, appointmentDate, appointmentTime, shopName } = appointmentData;

    const payload = {
      sender: {
        name: shopName,
        email: BREVO_FROM_EMAIL
      },
      to: [
        {
          email: customerEmail,
          name: customerName
        }
      ],
      subject: `❌ Appointment Cancelled - ${shopName}`,
      htmlContent: `
        <h2>Appointment Cancelled</h2>
        <p>Hi ${customerName},</p>
        <p>Your appointment at <strong>${shopName}</strong> has been cancelled.</p>
        <p><strong>Date:</strong> ${appointmentDate}</p>
        <p><strong>Time:</strong> ${appointmentTime}</p>
        <p><strong>Barber:</strong> ${barberName}</p>
        <p>If you have any questions, please contact the shop directly.</p>
      `
    };

    await axios.post(BREVO_API_URL, payload, {
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Cancellation email sent to:', customerEmail);
    return true;
  } catch (error) {
    console.error('❌ Error sending cancellation email:', error.message);
    return false;
  }
};

module.exports = {
  sendAppointmentConfirmationEmail,
  sendAppointmentReminderEmail,
  sendAppointmentCancellationEmail,
};
