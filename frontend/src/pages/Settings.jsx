import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { shops } from '../utils/api.jsx';
import { convertTo12Hour } from '../utils/timeFormat.js';
import { isElectron } from '../utils/isElectron.js';
import UpgradePlanModal from '../components/UpgradePlanModal.jsx';
import './Settings.css';

const Settings = ({ shop, onLogout }) => {
  const [formData, setFormData] = useState({
    opening_time: '',
    closing_time: '',
    name: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [trialInfo, setTrialInfo] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    if (shop) {
      setFormData({
        opening_time: shop.opening_time ? shop.opening_time.substring(0, 5) : '09:00',
        closing_time: shop.closing_time ? shop.closing_time.substring(0, 5) : '18:00',
        name: shop.name || '',
      });
      checkTrialStatus();
    }
  }, [shop]);

  // Countdown timer effect
  useEffect(() => {
    if (isElectron() || !trialInfo || trialInfo.is_premium) return;

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
    // Skip trial checks in Electron (completely free)
    if (isElectron()) {
      return;
    }
    try {
      const response = await shops.checkTrialStatus(shop.id);
      setTrialInfo(response.data);
    } catch (err) {
      console.error('Failed to check trial status:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await shops.updateShop(shop.id, {
        name: formData.name,
        opening_time: formData.opening_time + ':00',
        closing_time: formData.closing_time + ':00',
      });
      setMessage('Shop settings updated successfully!');
      // Update localStorage
      const updatedShop = { ...shop, ...response.data };
      localStorage.setItem('shop', JSON.stringify(updatedShop));
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('shop');
    onLogout();
    navigate('/login');
  };

  if (!shop) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <>
      {!isElectron() && (
        <UpgradePlanModal
          shop={shop}
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          onUpgrade={() => window.location.reload()}
        />
      )}

      <div className="container" style={{ maxWidth: '600px', marginTop: '2rem', marginBottom: '2rem' }}>
        <div className="card">
          <div className="card-header">
            Shop Settings
            {!isElectron() && (
              <>
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
                    ✓ Premium Active {trialInfo.premium_expires_at && 
                      `- Expires: ${new Date(trialInfo.premium_expires_at).toLocaleDateString()}`}
                  </span>
                )}
              </>
            )}
          </div>

        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleUpdate} style={{ padding: '1.5rem' }}>
          {/* Shop Name */}
          <div className="form-group">
            <label htmlFor="name">Shop Name</label>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          {/* Opening Time */}
          <div className="form-group">
            <label htmlFor="opening_time">Opening Time</label>
            <input
              id="opening_time"
              type="time"
              name="opening_time"
              value={formData.opening_time}
              onChange={handleChange}
              required
            />
            <small>({convertTo12Hour(formData.opening_time + ':00')})</small>
          </div>

          {/* Closing Time */}
          <div className="form-group">
            <label htmlFor="closing_time">Closing Time</label>
            <input
              id="closing_time"
              type="time"
              name="closing_time"
              value={formData.closing_time}
              onChange={handleChange}
              required
            />
            <small>({convertTo12Hour(formData.closing_time + ':00')})</small>
          </div>

          {/* Shop Email Info */}
          <div className="form-group" style={{ backgroundColor: '#f9f9f9', padding: '1rem', borderRadius: '4px' }}>
            <label style={{ fontWeight: 'bold', color: '#2c3e50' }}>Shop Email</label>
            <p style={{ margin: '0.5rem 0 0 0', color: '#666', fontSize: '0.95rem' }}>
              {shop.email || localStorage.getItem('user') && JSON.parse(localStorage.getItem('user')).email}
            </p>
            <small style={{ color: '#999' }}>This is the email associated with your account</small>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', marginBottom: '0.75rem' }}
          >
            {loading ? 'Updating...' : 'Save Changes'}
          </button>

          {/* Logout Button */}
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleLogout}
            style={{ width: '100%', backgroundColor: '#e74c3c', marginBottom: '0.75rem' }}
          >
            Logout
          </button>

          {/* Upgrade Plan Button */}
          {!isElectron() && trialInfo && !trialInfo.is_premium && (
            <button
              type="button"
              onClick={() => setShowUpgradeModal(true)}
              style={{
                width: '100%',
                padding: '0.9rem',
                backgroundColor: '#27ae60',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              🚀 Upgrade to Premium
            </button>
          )}
        </form>
      </div>
    </div>
    </>
  );
};

export default Settings;
