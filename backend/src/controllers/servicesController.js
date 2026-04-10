const PgService = require('../models/pg/Service');

// Get all services for a shop
const getAllServices = async (req, res) => {
  try {
    const { shopId } = req.user;

    const services = await PgService.findByShopId(shopId);

    res.json(services);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Create a service
const createService = async (req, res) => {
  try {
    const { shopId } = req.user;
    const { name, duration_minutes, price, gap_time_minutes } = req.body;

    if (!name || !duration_minutes || !price) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const service = await PgService.create({
      shop_id: shopId,
      name,
      duration_minutes,
      price,
      gap_time_minutes: gap_time_minutes || 0,
      active: true,
    });

    res.status(201).json(service);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Update a service
const updateService = async (req, res) => {
  try {
    const { shopId } = req.user;
    const { id } = req.params;
    const { name, duration_minutes, price, gap_time_minutes, active } = req.body;

    // Verify service belongs to shop
    const service = await PgService.findById(id);
    if (!service || service.shop_id !== shopId) {
      return res.status(404).json({ error: 'Service not found' });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (duration_minutes) updateData.duration_minutes = duration_minutes;
    if (price) updateData.price = price;
    if (gap_time_minutes !== undefined) updateData.gap_time_minutes = gap_time_minutes;
    if (active !== undefined) updateData.active = active;

    const updated = await PgService.update(id, updateData);

    if (!updated) {
      return res.status(404).json({ error: 'Service not found' });
    }

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Delete a service
const deleteService = async (req, res) => {
  try {
    const { shopId } = req.user;
    const { id } = req.params;

    // Verify service belongs to shop
    const service = await PgService.findById(id);
    if (!service || service.shop_id !== shopId) {
      return res.status(404).json({ error: 'Service not found' });
    }

    await PgService.delete(id);

    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllServices,
  createService,
  updateService,
  deleteService,
};
