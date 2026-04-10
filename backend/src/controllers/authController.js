const bcrypt = require('bcryptjs');
const PgUser = require('../models/pg/User');
const PgShop = require('../models/pg/Shop');
const { generateToken } = require('../utils/jwt');

// Signup - Create shop and user
const signup = async (req, res) => {
  try {
    const { shopName, shopSlug, email, password, openingTime, closingTime, country, timezone, phone, countryCode } = req.body;

    if (!shopName || !shopSlug || !email || !password || !phone) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if email already exists
    const existingUser = await PgUser.findByEmail(email.toLowerCase());
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists. Please use a different email or login.' });
    }

    // Check if shop slug already exists
    const existingSlug = await PgShop.findBySlug(shopSlug.toLowerCase());
    if (existingSlug) {
      return res.status(400).json({ error: 'This shop URL is already taken. Please choose a different shop name or modify the URL.' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create shop with opening/closing times, country, and 3-day trial
    const trialEndsAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 days from now
    const shop = await PgShop.create({
      name: shopName,
      slug: shopSlug.toLowerCase(),
      opening_time: openingTime || '09:00:00',
      closing_time: closingTime || '18:00:00',
      country: country || 'India',
      timezone: timezone || 'Asia/Kolkata',
      trial_started_at: new Date(),
      trial_ends_at: trialEndsAt,
    });

    // Create user with phone and country_code
    const user = await PgUser.create({
      shop_id: shop.id,
      email: email.toLowerCase(),
      password_hash: passwordHash,
      phone,
      country_code: countryCode,
    });

    // Generate token
    const token = generateToken(user.id, shop.id);

    res.status(201).json({
      message: 'Shop created successfully',
      token,
      shop: {
        id: shop.id,
        name: shop.name,
        slug: shop.slug,
        opening_time: shop.opening_time,
        closing_time: shop.closing_time,
        country: shop.country,
        timezone: shop.timezone,
      },
      user: { id: user.id, email: user.email },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Find user by email
    const user = await PgUser.findByEmail(email.toLowerCase());
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Get shop info
    const shop = await PgShop.findById(user.shop_id);

    // Generate token
    const token = generateToken(user.id, user.shop_id);

    res.json({
      message: 'Login successful',
      token,
      shop: { id: shop.id, name: shop.name, slug: shop.slug },
      user: { id: user.id, email: user.email },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  signup,
  login,
};
