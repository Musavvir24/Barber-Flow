# BarberFlow Frontend

Simple React frontend for barber shop management.

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Configure `.env` file:
   ```
   REACT_APP_API_URL=http://localhost:5000
   ```

3. Start the development server:
   ```
   npm start
   ```

## Features

- **Owner Dashboard**: Login and manage shop data
- **Barbers Management**: Add, edit, delete barbers
- **Services Management**: Add, edit, delete services
- **Appointments**: View and manage appointments, update status
- **Public Booking**: Customers can book appointments without login
- **WhatsApp Integration**: Copy pre-formatted WhatsApp messages

## Pages

- `/login` - Shop owner login
- `/signup` - Create new shop and account
- `/dashboard` - Owner dashboard home
- `/barbers` - Manage barbers
- `/services` - Manage services
- `/appointments` - View and manage appointments
- `/book/:shopSlug` - Public booking page (accessible without login)
