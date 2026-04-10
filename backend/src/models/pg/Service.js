const { prisma } = require('../../utils/db');

const Service = {
  async create(data) {
    return prisma.service.create({ data });
  },

  async findById(id) {
    return prisma.service.findUnique({ where: { id } });
  },

  async findByShopId(shopId) {
    return prisma.service.findMany({
      where: { shop_id: shopId },
      include: { barbers: { include: { barber: true } } },
    });
  },

  async update(id, data) {
    return prisma.service.update({ where: { id }, data });
  },

  async delete(id) {
    return prisma.service.delete({ where: { id } });
  },

  async findByIdWithBarbers(id) {
    return prisma.service.findUnique({
      where: { id },
      include: { barbers: { include: { barber: true } } },
    });
  },
};

module.exports = Service;
