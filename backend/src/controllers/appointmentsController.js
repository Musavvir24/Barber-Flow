const PgAppointment = require('../models/pg/Appointment');
const PgShop = require('../models/pg/Shop');
const PgBarber = require('../models/pg/Barber');
const PgService = require('../models/pg/Service');
const { checkConflict, getAvailableSlots } = require('../services/appointmentService');
const { sendConfirmation, sendCancellation } = require('../services/notificationService');

const getAllAppointments = async (req, res) => {
  try {
    const { shopId } = req.user;
    const { prisma } = require('../utils/db');
    let appointments = [];
    try {
      appointments = await prisma.appointment.findMany({
        where: { 
          shop_id: shopId,
        },
        include: { barber: true, service: true },
        orderBy: { created_at: 'desc' },
      });
    } catch (err) {
      console.warn('Error fetching appointments:', err.message);
      appointments = [];
    }
    res.json(appointments);
  } catch (error) {
    console.error('getAllAppointments error:', error.message);
    res.status(500).json({ error: error.message || 'Failed to fetch appointments' });
  }
};

const getAppointmentsByShopSlug = async (req, res) => {
  try {
    const { shopSlug } = req.params;
    const { date } = req.query;
    const shop = await PgShop.findBySlug(shopSlug.toLowerCase());
    if (!shop) {
      return res.status(404).json({ error: 'Shop not found' });
    }
    const { prisma } = require('../utils/db');
    let appointments = [];
    try {
      appointments = await prisma.appointment.findMany({
        where: { 
          shop_id: shop.id,
        },
        include: { barber: true, service: true },
        orderBy: { created_at: 'asc' },
      });
    } catch (err) {
      console.warn('Error fetching appointments by shop slug:', err.message);
      appointments = [];
    }
    res.json(appointments);
  } catch (error) {
    console.error('getAppointmentsByShopSlug error:', error.message);
    res.status(500).json({ error: error.message || 'Failed to fetch shop appointments' });
  }
};

const getAvailableSlotsForBarber = async (req, res) => {
  try {
    const { shopSlug } = req.params;
    const { barber_id, date, duration_minutes, gap_time_minutes } = req.query;
    if (!barber_id || !date || !duration_minutes) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    const shop = await PgShop.findBySlug(shopSlug.toLowerCase());
    if (!shop) {
      return res.status(404).json({ error: 'Shop not found' });
    }
    let slots = [];
    try {
      slots = await getAvailableSlots(barber_id, date, parseInt(duration_minutes), parseInt(gap_time_minutes || 0), shop.opening_time, shop.closing_time);
    } catch (err) {
      console.warn('Error fetching available slots:', err.message);
      slots = [];
    }
    res.json({ date, barber_id, slots });
  } catch (error) {
    console.error('getAvailableSlotsForBarber error:', error.message);
    res.status(500).json({ error: error.message || 'Failed to fetch available slots' });
  }
};

const createAppointment = async (req, res) => {
  try {
    const { shopSlug } = req.params;
    const { barber_id, service_id, customer_name, customer_phone, customer_email, start_time, end_time } = req.body;
    if (!barber_id || !service_id || !customer_name || !customer_phone || !start_time || !end_time) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const shop = await PgShop.findBySlug(shopSlug.toLowerCase());
    if (!shop) {
      return res.status(404).json({ error: 'Shop not found' });
    }
    
    // Extract date from start_time (format: "2026-04-13T09:20:00")
    const startDate = new Date(start_time);
    const appointmentDate = startDate.toISOString().split('T')[0]; // "2026-04-13"
    const startTimeStr = startDate.toTimeString().split(' ')[0]; // "09:20:00"
    const endTimeStr = new Date(end_time).toTimeString().split(' ')[0]; // "09:35:00"
    
    // Check conflicts using string format
    let hasConflict = false;
    try {
      hasConflict = await checkConflict(barber_id, appointmentDate, startTimeStr, endTimeStr);
    } catch (err) {
      console.warn('Error checking conflict:', err.message);
      // Continue without conflict check if it fails
      hasConflict = false;
    }
    
    if (hasConflict) {
      return res.status(409).json({ error: 'Time slot not available' });
    }
    
    let appointment = null;
    try {
      appointment = await PgAppointment.create({
        shop_id: shop.id,
        barber_id,
        service_id,
        customer_name,
        customer_phone,
        customer_email: customer_email || null,
        appointment_date: appointmentDate,
        start_time: startTimeStr,
        end_time: endTimeStr,
        status: 'booked',
      });
    } catch (err) {
      console.error('Error creating appointment:', err.message);
      return res.status(500).json({ error: 'Failed to create appointment: ' + err.message });
    }
    
    res.status(201).json(appointment);
  } catch (error) {
    console.error('createAppointment error:', error.message);
    res.status(500).json({ error: error.message || 'Failed to create appointment' });
  }
};

const updateAppointmentStatus = async (req, res) => {
  try {
    const { shopId } = req.user;
    const { id } = req.params;
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }
    let updated = null;
    try {
      updated = await PgAppointment.update(id, { status });
    } catch (err) {
      console.warn('Error updating appointment status:', err.message);
      return res.status(500).json({ error: 'Failed to update appointment status' });
    }
    res.json(updated);
  } catch (error) {
    console.error('updateAppointmentStatus error:', error.message);
    res.status(500).json({ error: error.message || 'Failed to update appointment' });
  }
};

const getCustomerHistory = async (req, res) => {
  try {
    const { shopSlug } = req.params;
    const { phone } = req.query;
    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required' });
    }
    const shop = await PgShop.findBySlug(shopSlug.toLowerCase());
    if (!shop) {
      return res.status(404).json({ error: 'Shop not found' });
    }
    const { prisma } = require('../utils/db');
    let appointments = [];
    try {
      appointments = await prisma.appointment.findMany({
        where: { 
          shop_id: shop.id, 
          customer_phone: phone,
        },
        include: { barber: true, service: true },
        orderBy: { created_at: 'desc' },
      });
    } catch (err) {
      console.warn('Error fetching customer history:', err.message);
      appointments = [];
    }
    res.json(appointments);
  } catch (error) {
    console.error('getCustomerHistory error:', error.message);
    res.status(500).json({ error: error.message || 'Failed to fetch appointment history' });
  }
};

module.exports = {
  getAllAppointments,
  getAppointmentsByShopSlug,
  getAvailableSlotsForBarber,
  createAppointment,
  updateAppointmentStatus,
  getCustomerHistory,
};
