# BarberFlow - Barber Shop Management SaaS

A simple, mobile-friendly web application for managing barbershop appointments, barbers, services, and customer bookings.

## Architecture

```
barber-software/
├── backend/          # Node.js + Express API
├── frontend/         # React SPA
└── README.md
```

## Tech Stack

- **Backend**: Node.js + Express
- **Frontend**: React + React Router
- **Database**: PostgreSQL
- **Authentication**: JWT (for shop owners)

## Quick Start

### Backend Setup

1. Navigate to `backend/` folder:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create PostgreSQL database using `db.sql`:
   ```
   psql -U postgres -f db.sql
   ```

4. Update `.env` with your database credentials:
   ```
   DATABASE_URL=postgresql://user:password@localhost:5432/barberflow
   JWT_SECRET=your_secret_key
   PORT=5000
   ```

5. Start the server:
   ```
   npm run dev
   ```

### Frontend Setup

1. Navigate to `frontend/` folder:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

4. Open `http://localhost:3000` in your browser

## Features

### For Shop Owners (Protected Routes)
- **Authentication**: Sign up and login with email/password
- **Dashboard**: Quick overview and links to all management pages
- **Barbers Management**: Add, edit, delete barbers
- **Services Management**: Add, edit, delete services
- **Appointments**: View all appointments, update status (booked/completed/cancelled)
- **WhatsApp Integration**: Generate and copy WhatsApp message templates

### For Customers (Public Routes)
- **Public Booking Page**: `/book/:shop-slug`
  - Select service
  - Choose barber
  - Pick available date & time
  - Enter name and phone
  - Confirm booking
- **Conflict Checking**: System prevents double-booking
- **Customer History**: View past appointments by phone number

## API Endpoints

### Authentication
- `POST /auth/signup` - Register new shop
- `POST /auth/login` - Login shop owner

### Barbers (Protected)
- `GET /barbers` - Get all barbers
- `POST /barbers` - Create barber
- `PUT /barbers/:id` - Update barber
- `DELETE /barbers/:id` - Delete barber

### Services (Protected)
- `GET /services` - Get all services
- `POST /services` - Create service
- `PUT /services/:id` - Update service
- `DELETE /services/:id` - Delete service

### Appointments
- `GET /appointments` - Get all appointments (protected)
- `PUT /appointments/:id` - Update appointment status (protected)
- `POST /appointments/book/:shopSlug` - Create appointment (public)
- `GET /appointments/slots/:shopSlug` - Get available slots (public)
- `GET /appointments/history/:shopSlug` - Get customer history (public)

## Database Schema

### shops
- id, name, slug, created_at

### users
- id, shop_id, email, password_hash, created_at

### barbers
- id, shop_id, name, phone, active, created_at

### services
- id, shop_id, name, duration_minutes, price, active, created_at

### appointments
- id, shop_id, barber_id, service_id, customer_name, customer_phone, start_time, end_time, status, created_at

### barber_unavailable_days
- id, barber_id, unavailable_date

## Key Features

### Conflict Checking
The system automatically checks for overlapping appointments when booking. If a barber already has an appointment during the requested time slot, the booking is rejected.

### Available Time Slots
For MVP, slots are generated in 30-minute intervals from 9 AM to 6 PM. The system filters out slots with existing bookings.

### Multi-Tenant Architecture
Each shop has its own data, scoped by `shop_id`. Multiple shops can run on the same database without data leakage.

### WhatsApp Messages
After booking, customers see a pre-formatted WhatsApp message that shop owners can copy and send directly via WhatsApp Business (no API integration yet).

## Future Enhancements

- WhatsApp API integration for automatic messages
- Email confirmations
- SMS reminders
- Barber working hours configuration
- Multi-branch support
- Payment integration
- Analytics and reporting
- Appointment cancellation requests
- Calendar view for appointments

## License

MIT
