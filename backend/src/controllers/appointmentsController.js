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
    const appointments = await prisma.appointment.findMany({
      where: { 
        shop_id: shopId,
        appointment_date: { not: null }
      },
      include: { barber: true, service: true },
      orderBy: { created_at: 'desc' },
    });
    res.json(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
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
    const appointments = await prisma.appointment.findMany({
      where: { 
        shop_id: shop.id,
        appointment_date: { not: null }
      },
      include: { barber: true, service: true },
      orderBy: { created_at: 'asc' },
    });
    res.json(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
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
    const slots = await getAvailableSlots(barber_id, date, parseInt(duration_minutes), parseInt(gap_time_minutes || 0), shop.opening_time, shop.closing_time);
    res.json({ date, barber_id, slots });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
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
    const hasConflict = await checkConflict(barber_id, appointmentDate, startTimeStr, endTimeStr);
    if (hasConflict) {
      return res.status(409).json({ error: 'Time slot not available' });
    }
    
    const appointment = await PgAppointment.create({
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
    res.status(201).json(appointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
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
    const updated = await PgAppointment.update(id, { status });
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
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
    const appointments = await prisma.appointment.findMany({
      where: { 
        shop_id: shop.id, 
        customer_phone: phone,
        appointment_date: { not: null }
      },
      include: { barber: true, service: true },
      orderBy: { created_at: 'desc' },
    });
    res.json(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
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
