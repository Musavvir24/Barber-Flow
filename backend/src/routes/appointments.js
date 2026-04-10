const express = require('express');
const authMiddleware = require('../middleware/auth');
const {
  getAllAppointments,
  getAppointmentsByShopSlug,
  getAvailableSlotsForBarber,
  createAppointment,
  updateAppointmentStatus,
  getCustomerHistory,
} = require('../controllers/appointmentsController');

const router = express.Router();

// Protected routes (owner dashboard)
// GET /appointments - Get all appointments for a shop (protected)
router.get('/', authMiddleware, getAllAppointments);

// PUT /appointments/:id - Update appointment status (protected)
router.put('/:id', authMiddleware, updateAppointmentStatus);

// Public routes (for booking page)
// GET /appointments/public/:shopSlug - Get appointments by shop slug (public)
router.get('/public/:shopSlug', getAppointmentsByShopSlug);

// GET /appointments/slots/:shopSlug - Get available slots (public)
router.get('/slots/:shopSlug', getAvailableSlotsForBarber);

// POST /appointments/book/:shopSlug - Create appointment (public)
router.post('/book/:shopSlug', createAppointment);

// GET /appointments/history/:shopSlug - Get customer history (public)
router.get('/history/:shopSlug', getCustomerHistory);

module.exports = router;
