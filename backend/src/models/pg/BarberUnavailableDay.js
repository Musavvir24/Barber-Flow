const { prisma } = require('../../utils/db');

const BarberUnavailableDay = {
  async create(data) {
    return prisma.barberUnavailableDay.create({ data });
  },

  async findById(id) {
    return prisma.barberUnavailableDay.findUnique({ where: { id } });
  },

  async findByBarberId(barberId) {
    return prisma.barberUnavailableDay.findMany({
      where: { barber_id: barberId },
      orderBy: { unavailable_date: 'asc' },
    });
  },

  async findByBarberAndDate(barberId, date) {
    return prisma.barberUnavailableDay.findMany({
      where: {
        barber_id: barberId,
        unavailable_date: {
          gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
          lt: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1),
        },
      },
    });
  },

  async delete(id) {
    return prisma.barberUnavailableDay.delete({ where: { id } });
  },
};

module.exports = BarberUnavailableDay;
