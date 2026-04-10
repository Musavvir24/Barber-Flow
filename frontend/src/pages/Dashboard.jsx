import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboard, shops } from '../utils/api.jsx';
import './Dashboard.css';
// Upgrade modal is managed by `ProtectedRoute` to avoid duplicate modals

const Dashboard = ({ shop }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // local modal state removed — modal is shown by ProtectedRoute
  const [trialInfo, setTrialInfo] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState({});

  useEffect(() => {
    fetchStats();
    checkTrialStatus();
  }, []);

  // Countdown timer effect
  useEffect(() => {
    if (!trialInfo || trialInfo.is_premium) return;

    const updateCountdown = () => {
      const now = new Date();
      const trialEnd = new Date(trialInfo.trial_ends_at);
      const diff = trialEnd - now;

      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        setTimeRemaining({ days, hours, minutes, seconds });
      } else {
        setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateCountdown(); // Call immediately
    const interval = setInterval(updateCountdown, 1000); // Update every second

    return () => clearInterval(interval);
  }, [trialInfo]);

  const checkTrialStatus = async () => {
    try {
      const response = await shops.checkTrialStatus(shop.id);
      setTrialInfo(response.data);
      
      // Note: modal display is handled by ProtectedRoute; store trial info only
      if (response.data.is_trial_expired && !response.data.is_premium) {
        // keep trialInfo for display badges
      }
    } catch (err) {
      console.error('Failed to check trial status:', err);
    }
  };

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await dashboard.getStats();
      setStats(response.data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async () => {
    // In a real app, integrate with Razorpay (India) or Stripe (International)
    console.log('Opening payment gateway for upgrade...');
    // For now, just close the modal - you would integrate payment here
    setShowUpgradeModal(false);
  };

  return (
    <>
      {/* Upgrade modal removed from Dashboard — ProtectedRoute shows it when needed */}
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
        <div className="card">
          <div className="card-header">
            Welcome Back!
            {trialInfo && !trialInfo.is_premium && (
              <span style={{
                float: 'right',
                fontSize: '0.85rem',
                backgroundColor: '#fff3cd',
                color: '#856404',
                padding: '0.6rem 0.8rem',
                borderRadius: '4px',
                fontWeight: 'bold',
                fontFamily: 'monospace',
              }}>
                ⏱️ Trial: {timeRemaining.days}d {timeRemaining.hours}h {timeRemaining.minutes}m {timeRemaining.seconds}s
              </span>
            )}
            {trialInfo && trialInfo.is_premium && (
              <span style={{
                float: 'right',
                fontSize: '0.85rem',
                backgroundColor: '#d4edda',
                color: '#155724',
                padding: '0.4rem 0.8rem',
                borderRadius: '4px',
              }}>
                ✓ Premium Active
              </span>
            )}
          </div>
          <p style={{ marginBottom: '1rem', fontSize: '1.1rem', color: '#7f8c8d', clear: 'both' }}>
            Welcome to <strong>{shop?.name}</strong>! Manage your shop from here.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginTop: '2rem' }}>
            <Link to="/barbers" className="btn btn-primary">
              ➕ Add Staff Member
            </Link>
            <Link to="/services" className="btn btn-primary">
              ➕ Add Service
            </Link>
            <Link to="/appointments" className="btn btn-primary">
              📅 View Appointments
            </Link>
          </div>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <div className="loading">Loading statistics...</div>
      ) : stats ? (
        <>
          <div className="card">
            <div className="card-header">📊 Quick Stats</div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '1.5rem',
              marginTop: '1rem'
            }}>
              <div style={{
                padding: '1.5rem',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '8px',
                color: 'white',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                  {stats.totalBarbers}
                </div>
                <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Total Staff</div>
                <div style={{ fontSize: '0.8rem', marginTop: '0.5rem', opacity: 0.7 }}>
                  {stats.availableBarbers} available
                </div>
              </div>

              <div style={{
                padding: '1.5rem',
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                borderRadius: '8px',
                color: 'white',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                  {stats.totalServices}
                </div>
                <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Services</div>
              </div>

              <div style={{
                padding: '1.5rem',
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                borderRadius: '8px',
                color: 'white',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                  {stats.todayAppointments}
                </div>
                <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Today's Appointments</div>
                <div style={{ fontSize: '0.8rem', marginTop: '0.5rem', opacity: 0.7 }}>
                  {stats.todayCompleted} completed
                </div>
              </div>

              <div style={{
                padding: '1.5rem',
                background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                borderRadius: '8px',
                color: 'white',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                  {stats.totalAppointments}
                </div>
                <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Total Bookings</div>
              </div>
            </div>
          </div>

          {stats.recentAppointments && stats.recentAppointments.length > 0 && (
            <div className="card">
              <div className="card-header">📋 Recent Appointments</div>
              <table style={{ marginTop: '1rem' }}>
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Staff</th>
                    <th>Service</th>
                    <th>Date & Time</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentAppointments.map((apt) => (
                    <tr key={apt.id}>
                      <td>{apt.customer_name}</td>
                      <td>{apt.barber_name}</td>
                      <td>{apt.service_name}</td>
                      <td>{new Date(apt.start_time).toLocaleString()}</td>
                      <td>
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '4px',
                          fontSize: '0.85rem',
                          fontWeight: 'bold',
                          background: apt.status === 'booked' ? '#d1ecf1' : apt.status === 'completed' ? '#d4edda' : '#f8d7da',
                          color: apt.status === 'booked' ? '#0c5460' : apt.status === 'completed' ? '#155724' : '#721c24'
                        }}>
                          {apt.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : null}

      <div className="card">
        <div className="card-header">🔗 Your Public Booking Link</div>
        <p style={{ marginTop: '1rem', marginBottom: '0.5rem', color: '#7f8c8d' }}>Share this with your customers:</p>
        <code style={{
          display: 'block',
          padding: '1rem',
          background: '#f5f5f5',
          borderRadius: '4px',
          wordBreak: 'break-all',
          fontSize: '0.9rem',
          border: '1px solid #ddd'
        }}>
          {window.location.origin}/book/{shop?.slug}
        </code>
        <button
          onClick={() => {
            navigator.clipboard.writeText(`${window.location.origin}/book/${shop?.slug}`);
            alert('Booking link copied!');
          }}
          className="btn btn-primary"
          style={{ marginTop: '1rem' }}
        >
          📋 Copy Link
        </button>
      </div>
      </div>
    </>
  );
};

export default Dashboard;
