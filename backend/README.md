# BarberFlow Backend

Simple Node.js + Express API for barber shop management.

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Create PostgreSQL database:
   ```
   psql -U postgres -f db.sql
   ```

3. Configure `.env` file with your database URL and JWT secret.

4. Start the server:
   ```
   npm run dev
   ```

## API Endpoints

### Auth
- `POST /auth/signup` - Register a new shop
- `POST /auth/login` - Login shop owner

### Barbers (Protected)
- `GET /barbers` - Get all barbers
- `POST /barbers` - Create a barber
- `PUT /barbers/:id` - Update a barber
- `DELETE /barbers/:id` - Delete a barber

### Services (Protected)
- `GET /services` - Get all services
- `POST /services` - Create a service
- `PUT /services/:id` - Update a service
- `DELETE /services/:id` - Delete a service

### Appointments
- `GET /appointments` - Get all appointments (protected)
- `PUT /appointments/:id` - Update appointment status (protected)
- `POST /appointments/book/:shopSlug` - Create appointment (public)
- `GET /appointments/slots/:shopSlug` - Get available slots (public)
- `GET /appointments/history/:shopSlug` - Get customer history (public)
