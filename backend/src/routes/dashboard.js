const express = require('express');
let getDashboardStats, getAppointmentsByStatus, getShopOverview;

try {
  const dashboardController = require('../controllers/dashboardController');
  getDashboardStats = dashboardController.getDashboardStats;
  getAppointmentsByStatus = dashboardController.getAppointmentsByStatus;
  getShopOverview = dashboardController.getShopOverview;
  console.log('✓ Dashboard controllers loaded:', { getDashboardStats: !!getDashboardStats, getAppointmentsByStatus: !!getAppointmentsByStatus, getShopOverview: !!getShopOverview });
} catch (error) {
  console.error('✗ Failed to load dashboard controller:', error);
}

const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Protected routes (require authentication)
router.get('/stats', authMiddleware, getDashboardStats);
router.get('/appointments/by-status', authMiddleware, getAppointmentsByStatus);

// Public routes (no authentication required)
router.get('/shop-overview/:shopSlug', getShopOverview);

module.exports = router;
