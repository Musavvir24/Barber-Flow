const PgShop = require('../models/pg/Shop');
const PgPayment = require('../models/pg/Payment');

// Get shop info
const getShop = async (req, res) => {
  try {
    const { shopId } = req.params;

    const shop = await PgShop.findById(shopId);
    if (!shop) {
      return res.status(404).json({ error: 'Shop not found' });
    }

    res.json(shop);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Update shop info
const updateShop = async (req, res) => {
  try {
    const { shopId } = req.params;
    const { shopId: userShopId } = req.user;

    // Check if user owns this shop
    if (shopId !== userShopId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { name, opening_time, closing_time } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (opening_time) updateData.opening_time = opening_time;
    if (closing_time) updateData.closing_time = closing_time;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const shop = await PgShop.update(shopId, updateData);
    res.json(shop);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Check trial status and handle subscription expiration
const checkTrialStatus = async (req, res) => {
  try {
    const { shopId } = req.params;

    const shop = await PgShop.findById(shopId);
    if (!shop) {
      return res.status(404).json({ error: 'Shop not found' });
    }

    const now = new Date();
    const trialEndsAt = new Date(shop.trial_ends_at);

    // Check if premium subscription has expired
    let isPremiumExpired = false;
    if (shop.is_premium && shop.premium_expires_at) {
      const premiumExpiresAt = new Date(shop.premium_expires_at);
      isPremiumExpired = now > premiumExpiresAt;

      // If premium subscription has expired, downgrade shop to free
      if (isPremiumExpired) {
        await PgShop.update(shopId, { is_premium: false });
      }
    }

    const isTrialExpired = now > trialEndsAt && !shop.is_premium;

    res.json({
      is_premium: shop.is_premium,
      trial_ends_at: shop.trial_ends_at,
      premium_expires_at: shop.premium_expires_at,
      is_trial_expired: isTrialExpired,
      is_premium_expired: isPremiumExpired,
      days_remaining: Math.ceil((trialEndsAt - now) / (1000 * 60 * 60 * 24)),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Record payment and upgrade to premium
const recordPayment = async (req, res) => {
  try {
    const { shopId } = req.params;
    const { payment_id, method, amount, currency, gateway } = req.body;

    // Record payment in payments table
    await PgPayment.create({
      shop_id: shopId,
      amount,
      currency,
      payment_method: method,
      status: 'completed',
      gateway: gateway || 'razorpay',
    });

    // Update shop to premium with 30-day subscription expiration
    const premiumExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const shop = await PgShop.update(shopId, {
      is_premium: true,
      upgrade_date: new Date(),
      premium_expires_at: premiumExpiresAt,
    });

    if (!shop) {
      return res.status(404).json({ error: 'Shop not found' });
    }

    res.json({
      success: true,
      message: 'Payment recorded successfully',
      shop,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getShop,
  updateShop,
  checkTrialStatus,
  recordPayment,
};
