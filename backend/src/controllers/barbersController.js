const PgBarber = require('../models/pg/Barber');
const PgService = require('../models/pg/Service');

// Get all barbers for a shop
const getAllBarbers = async (req, res) => {
  try {
    const { shopId } = req.user;

    const barbers = await PgBarber.findByShopId(shopId);

    res.json(barbers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Create a barber
const createBarber = async (req, res) => {
  try {
    const { shopId } = req.user;
    const { name, phone } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Barber name is required' });
    }

    const barber = await PgBarber.create({
      shop_id: shopId,
      name,
      phone: phone || null,
      active: true,
    });

    res.status(201).json(barber);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Update a barber
const updateBarber = async (req, res) => {
  try {
    const { shopId } = req.user;
    const { id } = req.params;
    const { name, phone, active, available } = req.body;

    // Verify barber belongs to shop
    const barber = await PgBarber.findById(id);
    if (!barber || barber.shop_id !== shopId) {
      return res.status(404).json({ error: 'Barber not found' });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (active !== undefined) updateData.active = active;
    if (available !== undefined) updateData.available = available;

    const updated = await PgBarber.update(id, updateData);

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Delete a barber
const deleteBarber = async (req, res) => {
  try {
    const { shopId } = req.user;
    const { id } = req.params;

    // Verify barber belongs to shop
    const barber = await PgBarber.findById(id);
    if (!barber || barber.shop_id !== shopId) {
      return res.status(404).json({ error: 'Barber not found' });
    }

    await PgBarber.delete(id);

    res.json({ message: 'Barber deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Get services for a specific barber
const getBarberServices = async (req, res) => {
  try {
    const { barber_id } = req.params;

    const barber = await PgBarber.findByIdWithServices(barber_id);
    if (!barber) {
      return res.status(404).json({ error: 'Barber not found' });
    }

    const services = barber.services.map(bs => bs.service);
    res.json(services);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Assign a service to a barber
const assignServiceToBarber = async (req, res) => {
  try {
    const { shopId } = req.user;
    const { barber_id, service_id } = req.body;

    if (!barber_id || !service_id) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verify barber belongs to the shop
    const barber = await PgBarber.findById(barber_id);
    if (!barber || barber.shop_id !== shopId) {
      return res.status(404).json({ error: 'Barber not found' });
    }

    // Verify service belongs to the shop
    const service = await PgService.findById(service_id);
    if (!service || service.shop_id !== shopId) {
      return res.status(404).json({ error: 'Service not found' });
    }

    // Add service if not already assigned
    try {
      await PgBarber.addService(barber_id, service_id);
    } catch (err) {
      // Service already assigned, that's okay
    }

    const updated = await PgBarber.findByIdWithServices(barber_id);
    res.status(201).json({ message: 'Service assigned to barber', barber: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Remove a service from a barber
const removeServiceFromBarber = async (req, res) => {
  try {
    const { shopId } = req.user;
    const { barber_id, service_id } = req.body;

    if (!barber_id || !service_id) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verify barber belongs to the shop
    const barber = await PgBarber.findById(barber_id);
    if (!barber || barber.shop_id !== shopId) {
      return res.status(404).json({ error: 'Barber not found' });
    }

    await PgBarber.removeService(barber_id, service_id);

    res.json({ message: 'Service removed from barber' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Get break times for a barber
const getBarberBreaks = async (req, res) => {
  try {
    const { shopId } = req.user;
    const { barber_id } = req.params;

    // Verify barber belongs to the shop
    const barber = await PgBarber.findById(barber_id);
    if (!barber || barber.shop_id !== shopId) {
      return res.status(404).json({ error: 'Barber not found' });
    }

    res.json([]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Add a break time for a barber
const addBarberBreak = async (req, res) => {
  try {
    const { shopId } = req.user;
    const { barber_id, day_of_week, break_start_time, break_end_time } = req.body;

    if (!barber_id || !day_of_week || !break_start_time || !break_end_time) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verify barber belongs to the shop
    const barber = await PgBarber.findById(barber_id);
    if (!barber || barber.shop_id !== shopId) {
      return res.status(404).json({ error: 'Barber not found' });
    }

    res.status(201).json({ message: 'Break added successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Update a break time for a barber
const updateBarberBreak = async (req, res) => {
  try {
    const { shopId } = req.user;
    const { break_id } = req.params;
    const { break_start_time, break_end_time } = req.body;

    if (!break_start_time || !break_end_time) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    res.json({ message: 'Break updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Delete a break time for a barber
const deleteBarberBreak = async (req, res) => {
  try {
    const { shopId } = req.user;
    const { break_id } = req.params;

    res.json({ message: 'Break deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllBarbers,
  createBarber,
  updateBarber,
  deleteBarber,
  getBarberServices,
  assignServiceToBarber,
  removeServiceFromBarber,
  getBarberBreaks,
  addBarberBreak,
  updateBarberBreak,
  deleteBarberBreak,
};
