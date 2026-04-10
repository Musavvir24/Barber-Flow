const express = require('express');
const authMiddleware = require('../middleware/auth');
const {
  getAllBarbers,
  createBarber,
  updateBarber,
  deleteBarber,
  getBarberServices,
  assignServiceToBarber,
  removeServiceFromBarber,
  getBarberBreaks,
  addBarberBreak,
  updateBarberBreak,
  deleteBarberBreak,
} = require('../controllers/barbersController');

const router = express.Router();

// GET /barbers - Get all barbers for a shop (protected)
router.get('/', authMiddleware, getAllBarbers);

// POST /barbers - Create a barber (protected)
router.post('/', authMiddleware, createBarber);

// PUT /barbers/:id - Update a barber (protected)
router.put('/:id', authMiddleware, updateBarber);

// DELETE /barbers/:id - Delete a barber (protected)
router.delete('/:id', authMiddleware, deleteBarber);

// GET /barbers/:barber_id/services - Get services for a barber (public)
router.get('/:barber_id/services', getBarberServices);

// POST /barbers/services/assign - Assign a service to a barber (protected)
router.post('/services/assign', authMiddleware, assignServiceToBarber);

// POST /barbers/services/remove - Remove a service from a barber (protected)
router.post('/services/remove', authMiddleware, removeServiceFromBarber);

// GET /barbers/:barber_id/breaks - Get break times for a barber (protected)
router.get('/:barber_id/breaks', authMiddleware, getBarberBreaks);

// POST /barbers/breaks - Add a break time for a barber (protected)
router.post('/breaks/add', authMiddleware, addBarberBreak);

// PUT /barbers/breaks/:break_id - Update a break time (protected)
router.put('/breaks/:break_id', authMiddleware, updateBarberBreak);

// DELETE /barbers/breaks/:break_id - Delete a break time (protected)
router.delete('/breaks/:break_id', authMiddleware, deleteBarberBreak);

module.exports = router;
