const { prisma } = require('../../utils/db');

const User = {
  async create(data) {
    return prisma.user.create({ data });
  },

  async findById(id) {
    return prisma.user.findUnique({ where: { id } });
  },

  async findByEmail(email) {
    return prisma.user.findUnique({ where: { email } });
  },

  async findByShopId(shopId) {
    return prisma.user.findMany({ where: { shop_id: shopId } });
  },

  async update(id, data) {
    return prisma.user.update({ where: { id }, data });
  },

  async delete(id) {
    return prisma.user.delete({ where: { id } });
  },

  async findByIdWithShop(id) {
    return prisma.user.findUnique({
      where: { id },
      include: { shop: true },
    });
  },
};

module.exports = User;
