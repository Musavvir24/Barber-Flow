const { prisma } = require('../../utils/db');

const Payment = {
  async create(data) {
    return prisma.payment.create({ data });
  },

  async findById(id) {
    return prisma.payment.findUnique({ where: { id } });
  },

  async findByShopId(shopId) {
    return prisma.payment.findMany({
      where: { shop_id: shopId },
      orderBy: { created_at: 'desc' },
    });
  },

  async findByStatus(status) {
    return prisma.payment.findMany({
      where: { status },
      include: { shop: true },
    });
  },

  async update(id, data) {
    return prisma.payment.update({ where: { id }, data });
  },

  async delete(id) {
    return prisma.payment.delete({ where: { id } });
  },

  async findByShopAndStatus(shopId, status) {
    return prisma.payment.findMany({
      where: { shop_id: shopId, status },
      orderBy: { created_at: 'desc' },
    });
  },
};

module.exports = Payment;
