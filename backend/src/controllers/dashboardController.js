const PgBarber = require('../models/pg/Barber');
const PgService = require('../models/pg/Service');
const PgAppointment = require('../models/pg/Appointment');
const { prisma } = require('../utils/db');

/**
 * Get dashboard statistics for a shop
 */
const getDashboardStats = async (req, res) => {
  try {
    const shopId = req.user?.shopId;
    
    if (!shopId) {
      console.error('DEBUG: shopId is missing. req.user:', req.user);
      return res.status(400).json({ error: 'Shop ID not found in token' });
    }

    // Get today's date range for filtering
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get total barbers
    const totalBarbers = await prisma.barber.count({
      where: {
        shop_id: shopId,
        active: true,
      },
    });

    // Get available barbers
    const availableBarbers = await prisma.barber.count({
      where: {
        shop_id: shopId,
        active: true,
        available: true,
      },
    });

    // Get total services
    const totalServices = await prisma.service.count({
      where: {
        shop_id: shopId,
        active: true,
      },
    });

    // Get today's appointments (using DateTime range)
    const todayAppointments = await prisma.appointment.count({
      where: {
        shop_id: shopId,
        start_time: {
          gte: today,
          lt: tomorrow,
        },
        status: { in: ['booked', 'completed'] },
      },
    });

    // Get today's completed appointments
    const todayCompleted = await prisma.appointment.count({
      where: {
        shop_id: shopId,
        start_time: {
          gte: today,
          lt: tomorrow,
        },
        status: 'completed',
      },
    });

    // Get total appointments (all time)
    const totalAppointments = await prisma.appointment.count({
      where: {
        shop_id: shopId,
      },
    });

    // Get recent appointments (last 5)
    const recentAppointments = await prisma.appointment.findMany({
      where: { 
        shop_id: shopId,
      },
      include: { barber: true, service: true },
      orderBy: { created_at: 'desc' },
      take: 5,
    });

    res.json({
      totalBarbers,
      availableBarbers,
      totalServices,
      todayAppointments,
      todayCompleted,
      totalAppointments,
      recentAppointments: recentAppointments.map((apt) => ({
        ...apt,
        barber_name: apt.barber?.name,
        service_name: apt.service?.name,
      })),
    });
  } catch (error) {
    console.error('Dashboard stats error:', error.message, error.stack);
    res.status(500).json({ error: error.message || 'Failed to fetch dashboard stats' });
  }
};

/**
 * Get appointments by status
 */
const getAppointmentsByStatus = async (req, res) => {
  try {
    const { shopId } = req.user;
    const { status, limit = 10 } = req.query;

    let filter = { shop_id: shopId };

    if (status) {
      filter.status = status;
    }

    const appointments = await prisma.appointment.findMany({
      where: filter,
      include: { barber: true, service: true },
      orderBy: { created_at: 'desc' },
      take: parseInt(limit),
    });

    const formattedAppointments = appointments.map((apt) => ({
      ...apt,
      barber_name: apt.barber?.name,
      service_name: apt.service?.name,
    }));

    res.json(formattedAppointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get shop overview (for public dashboard)
 */
const getShopOverview = async (req, res) => {
  try {
    const { shopSlug } = req.params;

    // Get shop
    const shop = await prisma.shop.findUnique({
      where: { slug: shopSlug },
    });

    if (!shop) {
      return res.status(404).json({ error: 'Shop not found' });
    }

    // Get available barbers with their services
    const barbers = await prisma.barber.findMany({
      where: {
        shop_id: shop.id,
        active: true,
      },
      include: {
        services: {
          include: { service: true },
        },
      },
    });

    // Format barbers with services
    const barbersWithServices = barbers.map((barber) => ({
      id: barber.id,
      name: barber.name,
      active: barber.active,
      available: barber.available,
      services: barber.services.map((bs) => ({
        id: bs.service.id,
        name: bs.service.name,
        duration_minutes: bs.service.duration_minutes,
        price: bs.service.price,
        gap_time_minutes: bs.service.gap_time_minutes,
      })),
    }));

    // Get all services for this shop
    const services = await prisma.service.findMany({
      where: {
        shop_id: shop.id,
        active: true,
      },
      select: {
        id: true,
        name: true,
        duration_minutes: true,
        price: true,
        gap_time_minutes: true,
      },
      orderBy: { name: 'asc' },
    });

    res.json({
      shop: {
        id: shop.id,
        name: shop.name,
        slug: shop.slug,
      },
      barbers: barbersWithServices,
      services,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getAppointmentsByStatus,
  getShopOverview,
};
