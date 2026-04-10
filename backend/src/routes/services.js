const express = require('express');
const authMiddleware = require('../middleware/auth');
const {
  getAllServices,
  createService,
  updateService,
  deleteService,
} = require('../controllers/servicesController');

const router = express.Router();

// GET /services - Get all services for a shop (protected)
router.get('/', authMiddleware, getAllServices);

// POST /services - Create a service (protected)
router.post('/', authMiddleware, createService);

// PUT /services/:id - Update a service (protected)
router.put('/:id', authMiddleware, updateService);

// DELETE /services/:id - Delete a service (protected)
router.delete('/:id', authMiddleware, deleteService);

module.exports = router;
