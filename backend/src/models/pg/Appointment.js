const { prisma } = require('../../utils/db');

const Appointment = {
  async create(data) {
    return prisma.appointment.create({ data });
  },

  async findById(id) {
    return prisma.appointment.findUnique({
      where: { id },
      include: { barber: true, service: true, shop: true },
    });
  },

  async findByShopId(shopId) {
    return prisma.appointment.findMany({
      where: { shop_id: shopId },
      include: { barber: true, service: true },
    });
  },

  async findByBarberId(barberId) {
    return prisma.appointment.findMany({
      where: { barber_id: barberId },
      orderBy: { start_time: 'asc' },
    });
  },

  async findByDateRange(shopId, startDate, endDate) {
    return prisma.appointment.findMany({
      where: {
        shop_id: shopId,
        start_time: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: { barber: true, service: true },
    });
  },

  async update(id, data) {
    return prisma.appointment.update({ where: { id }, data });
  },

  async delete(id) {
    return prisma.appointment.delete({ where: { id } });
  },

  async findByNotificationStatus(sent = false) {
    return prisma.appointment.findMany({
      where: { notification_sent: sent },
      include: { barber: true, service: true, shop: true },
    });
  },
};

module.exports = Appointment;
