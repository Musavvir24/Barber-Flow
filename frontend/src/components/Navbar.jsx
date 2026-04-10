import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    onLogout();
    setMobileMenuOpen(false);
    navigate('/login');
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-container">
          <Link to="/dashboard" className="navbar-brand">
            <span className="brand-text">
              <span className="brand-meaze">Meaze</span><span className="brand-book">book</span>
            </span>
          </Link>

          {/* Hamburger menu for mobile */}
          <button 
            className="hamburger"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          {/* Desktop menu */}
          <div className={`navbar-menu ${mobileMenuOpen ? 'mobile-open' : ''}`}>
            {user ? (
              <>
                <Link to="/dashboard" className="nav-link">Dashboard</Link>
                <Link to="/barbers" className="nav-link">Staff</Link>
                <Link to="/services" className="nav-link">Services</Link>
                <Link to="/appointments" className="nav-link">Appointments</Link>
                <Link to="/settings" className="nav-link">⚙️ Settings</Link>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link">Login</Link>
                <Link to="/signup" className="btn btn-primary">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
