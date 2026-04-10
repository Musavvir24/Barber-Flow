const { prisma } = require('../../utils/db');

const Barber = {
  async create(data) {
    return prisma.barber.create({ data });
  },

  async findById(id) {
    return prisma.barber.findUnique({ where: { id } });
  },

  async findByShopId(shopId) {
    return prisma.barber.findMany({
      where: { shop_id: shopId },
      include: { services: { include: { service: true } } },
    });
  },

  async update(id, data) {
    return prisma.barber.update({ where: { id }, data });
  },

  async delete(id) {
    return prisma.barber.delete({ where: { id } });
  },

  async findByIdWithServices(id) {
    return prisma.barber.findUnique({
      where: { id },
      include: {
        services: { include: { service: true } },
        unavailable_days: true,
      },
    });
  },

  async addService(barberId, serviceId) {
    return prisma.barbersOnServices.create({
      data: {
        barber_id: barberId,
        service_id: serviceId,
      },
    });
  },

  async removeService(barberId, serviceId) {
    return prisma.barbersOnServices.delete({
      where: {
        barber_id_service_id: {
          barber_id: barberId,
          service_id: serviceId,
        },
      },
    });
  },
};

module.exports = Barber;
