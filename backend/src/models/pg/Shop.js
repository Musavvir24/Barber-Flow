const { prisma } = require('../../utils/db');

const Shop = {
  async create(data) {
    return prisma.shop.create({ data });
  },

  async findById(id) {
    return prisma.shop.findUnique({ where: { id } });
  },

  async findBySlug(slug) {
    return prisma.shop.findUnique({ where: { slug } });
  },

  async findAll() {
    return prisma.shop.findMany();
  },

  async update(id, data) {
    return prisma.shop.update({ where: { id }, data });
  },

  async delete(id) {
    return prisma.shop.delete({ where: { id } });
  },

  async findByIdWithRelations(id) {
    return prisma.shop.findUnique({
      where: { id },
      include: {
        users: true,
        barbers: true,
        services: true,
        appointments: true,
        payments: true,
      },
    });
  },
};

module.exports = Shop;
