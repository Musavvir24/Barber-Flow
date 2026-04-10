import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Barbers from './pages/Barbers.jsx';
import Services from './pages/Services.jsx';
import Appointments from './pages/Appointments.jsx';
import CustomerAppointments from './pages/CustomerAppointments.jsx';
import Settings from './pages/Settings.jsx';
import PublicBooking from './pages/PublicBooking.jsx';
import './App.css';

function AppContent() {
  const [user, setUser] = useState(null);
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  // Load user from localStorage on mount
  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      const storedShop = localStorage.getItem('shop');

      if (token && storedUser && storedShop) {
        setUser(JSON.parse(storedUser));
        setShop(JSON.parse(storedShop));
      }
    } catch (error) {
      console.error('Error loading auth state:', error);
    }
    setLoading(false);
  }, []);

  const handleLoginSuccess = ({ token, user: newUser, shop: newShop }) => {
    setUser(newUser);
    setShop(newShop);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('shop');
    setUser(null);
    setShop(null);
  };

  // Check if current page should hide navbar
  const hideNavbarRoutes = ['/login', '/signup', '/book'];
  const shouldHideNavbar = hideNavbarRoutes.some(route => location.pathname.startsWith(route));

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <>
      {!shouldHideNavbar && <Navbar user={user} onLogout={handleLogout} />}
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
        <Route path="/signup" element={<Signup onSignupSuccess={handleLoginSuccess} />} />
        <Route path="/book/:shopSlug" element={<PublicBooking />} />
        <Route path="/appointments/:shopSlug" element={<CustomerAppointments />} />

        {/* Home redirect */}
        <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute user={user} shop={shop}>
              <Dashboard shop={shop} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/barbers"
          element={
            <ProtectedRoute user={user} shop={shop}>
              <Barbers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/services"
          element={
            <ProtectedRoute user={user} shop={shop}>
              <Services />
            </ProtectedRoute>
          }
        />
        <Route
          path="/appointments"
          element={
            <ProtectedRoute user={user} shop={shop}>
              <Appointments shop={shop} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute user={user} shop={shop} allowedWhenTrialExpired={true}>
              <Settings shop={shop} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
