const mongoose = require('mongoose');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

// Mongoose models for reading from MongoDB
const ShopModel = require('../models/Shop');
const UserModel = require('../models/User');
const BarberModel = require('../models/Barber');
const ServiceModel = require('../models/Service');
const AppointmentModel = require('../models/Appointment');
const PaymentModel = require('../models/Payment');
const BarberUnavailableDayModel = require('../models/BarberUnavailableDay');

async function migrateData() {
  try {
    console.log('🔄 Starting MongoDB to PostgreSQL migration...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
    
    // Create mapping for old ObjectIds to new UUIDs
    const shopMapping = {};
    const barberMapping = {};
    const serviceMapping = {};
    const userMapping = {};

    // 1. Migrate Shops
    console.log('📦 Migrating Shops...');
    const shops = await ShopModel.find();
    for (const shop of shops) {
      const newShop = await prisma.shop.create({
        data: {
          name: shop.name,
          slug: shop.slug,
          opening_time: shop.opening_time,
          closing_time: shop.closing_time,
          country: shop.country,
          timezone: shop.timezone,
          trial_started_at: shop.trial_started_at,
          trial_ends_at: shop.trial_ends_at,
          is_premium: shop.is_premium,
          upgrade_date: shop.upgrade_date,
          premium_expires_at: shop.premium_expires_at,
          created_at: shop.createdAt,
          updated_at: shop.updatedAt,
        },
      });
      shopMapping[shop._id.toString()] = newShop.id;
    }
    console.log(`✅ Migrated ${shops.length} shops`);

    // 2. Migrate Users
    console.log('📦 Migrating Users...');
    const users = await UserModel.find();
    for (const user of users) {
      const newUser = await prisma.user.create({
        data: {
          shop_id: shopMapping[user.shop_id.toString()],
          email: user.email,
          password_hash: user.password_hash,
          phone: user.phone,
          country_code: user.country_code,
          created_at: user.createdAt,
          updated_at: user.updatedAt,
        },
      });
      userMapping[user._id.toString()] = newUser.id;
    }
    console.log(`✅ Migrated ${users.length} users`);

    // 3. Migrate Barbers
    console.log('📦 Migrating Barbers...');
    const barbers = await BarberModel.find();
    for (const barber of barbers) {
      const newBarber = await prisma.barber.create({
        data: {
          shop_id: shopMapping[barber.shop_id.toString()],
          name: barber.name,
          phone: barber.phone,
          active: barber.active,
          available: barber.available,
          created_at: barber.createdAt,
          updated_at: barber.updatedAt,
        },
      });
      barberMapping[barber._id.toString()] = newBarber.id;
    }
    console.log(`✅ Migrated ${barbers.length} barbers`);

    // 4. Migrate Services
    console.log('📦 Migrating Services...');
    const services = await ServiceModel.find();
    for (const service of services) {
      const newService = await prisma.service.create({
        data: {
          shop_id: shopMapping[service.shop_id.toString()],
          name: service.name,
          duration_minutes: service.duration_minutes,
          price: service.price,
          gap_time_minutes: service.gap_time_minutes,
          active: service.active,
          created_at: service.createdAt,
          updated_at: service.updatedAt,
        },
      });
      serviceMapping[service._id.toString()] = newService.id;
    }
    console.log(`✅ Migrated ${services.length} services`);

    // 5. Migrate Barber-Service relationships
    console.log('📦 Migrating Barber-Service relationships...');
    for (const barber of barbers) {
      if (barber.services && barber.services.length > 0) {
        for (const serviceId of barber.services) {
          await prisma.barbersOnServices.create({
            data: {
              barber_id: barberMapping[barber._id.toString()],
              service_id: serviceMapping[serviceId.toString()],
            },
          });
        }
      }
    }
    console.log('✅ Migrated barber-service relationships');

    // 6. Migrate Appointments
    console.log('📦 Migrating Appointments...');
    const appointments = await AppointmentModel.find();
    for (const appt of appointments) {
      await prisma.appointment.create({
        data: {
          shop_id: shopMapping[appt.shop_id.toString()],
          barber_id: barberMapping[appt.barber_id.toString()],
          service_id: serviceMapping[appt.service_id.toString()],
          customer_name: appt.customer_name,
          customer_phone: appt.customer_phone,
          customer_email: appt.customer_email,
          start_time: appt.start_time,
          end_time: appt.end_time,
          status: appt.status,
          notification_sent: appt.notification_sent,
          notification_channel: appt.notification_channel,
          created_at: appt.createdAt,
          updated_at: appt.updatedAt,
        },
      });
    }
    console.log(`✅ Migrated ${appointments.length} appointments`);

    // 7. Migrate Barber Unavailable Days
    console.log('📦 Migrating Barber Unavailable Days...');
    const unavailableDays = await BarberUnavailableDayModel.find();
    for (const day of unavailableDays) {
      await prisma.barberUnavailableDay.create({
        data: {
          barber_id: barberMapping[day.barber_id.toString()],
          unavailable_date: day.unavailable_date,
          created_at: day.createdAt,
          updated_at: day.updatedAt,
        },
      });
    }
    console.log(`✅ Migrated ${unavailableDays.length} unavailable days`);

    // 8. Migrate Payments
    console.log('📦 Migrating Payments...');
    const payments = await PaymentModel.find();
    for (const payment of payments) {
      await prisma.payment.create({
        data: {
          shop_id: shopMapping[payment.shop_id.toString()],
          amount: payment.amount,
          currency: payment.currency,
          payment_method: payment.payment_method,
          status: payment.status,
          gateway: payment.gateway,
          created_at: payment.createdAt,
          updated_at: payment.updatedAt,
        },
      });
    }
    console.log(`✅ Migrated ${payments.length} payments`);

    console.log('✅ ✅ ✅ Migration completed successfully! ✅ ✅ ✅');
    console.log(`
    Summary:
    - Shops: ${shops.length}
    - Users: ${users.length}
    - Barbers: ${barbers.length}
    - Services: ${services.length}
    - Appointments: ${appointments.length}
    - Unavailable Days: ${unavailableDays.length}
    - Payments: ${payments.length}
    `);

  } catch (error) {
    console.error('❌ Migration error:', error);
  } finally {
    await mongoose.disconnect();
    await prisma.$disconnect();
  }
}

migrateData();
