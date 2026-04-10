import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { appointments } from '../utils/api.jsx';

const CustomerAppointments = () => {
  const { shopSlug } = useParams();
  const [phone, setPhone] = useState('');
  const [customerAppointments, setCustomerAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const formatTimeDisplay = (timeStr) => {
    if (!timeStr) return '';
    
    const parts = timeStr.split(':');
    if (parts.length >= 2) {
      let hours = parseInt(parts[0]);
      const minutes = String(parts[1]).padStart(2, '0');
      
      const meridiem = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      
      return `${displayHours}:${minutes} ${meridiem}`;
    }
    
    return timeStr;
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!phone.trim()) {
      setError('Please enter your phone number');
      return;
    }

    setLoading(true);
    setError('');
    setSearched(true);

    try {
      const response = await appointments.getCustomerHistory(shopSlug, phone);
      setCustomerAppointments(response.data || []);
      
      if (!response.data || response.data.length === 0) {
        setError('No appointments found for this phone number');
      }
    } catch (err) {
      setError('Failed to fetch appointments. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      booked: '#3498db',
      completed: '#27ae60',
      cancelled: '#e74c3c'
    };
    
    return (
      <span style={{
        display: 'inline-block',
        padding: '0.4rem 0.8rem',
        borderRadius: '4px',
        backgroundColor: statusColors[status] || '#95a5a6',
        color: 'white',
        fontSize: '0.85rem',
        fontWeight: 'bold'
      }}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="container" style={{ maxWidth: '600px', marginTop: '2rem' }}>
      <div className="card">
        <div className="card-header">Your Appointments</div>

        <form onSubmit={handleSearch} style={{ padding: '1rem' }}>
          <div className="form-group">
            <label htmlFor="phone">Enter Your Phone Number</label>
            <input
              id="phone"
              type="tel"
              placeholder="+91 XXXXX XXXXX or 10-digit number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
          <button 
            className="btn btn-primary" 
            type="submit"
            disabled={loading}
          >
            {loading ? 'Searching...' : 'Search Appointments'}
          </button>
        </form>

        {error && (
          <div className="alert alert-danger" style={{ margin: '1rem' }}>
            {error}
          </div>
        )}

        {searched && customerAppointments.length > 0 && (
          <div style={{ padding: '1rem' }}>
            <h4>Found {customerAppointments.length} appointment(s)</h4>
            <div style={{ marginTop: '1rem' }}>
              {customerAppointments.map((apt) => {
                // Use the start_time_display field that backend now provides
                let displayTime = apt.start_time_display;
                
                if (!displayTime) {
                  // Fallback: Extract and format time manually
                  const startDate = new Date(apt.start_time);
                  const hours = String(startDate.getHours()).padStart(2, '0');
                  const minutes = String(startDate.getMinutes()).padStart(2, '0');
                  displayTime = formatTimeDisplay(`${hours}:${minutes}`);
                }
                
                const startDate = new Date(apt.start_time);
                return (
                  <div
                    key={apt.id}
                    style={{
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      padding: '1rem',
                      marginBottom: '1rem',
                      backgroundColor: apt.status === 'cancelled' ? '#f8f9fa' : '#fff'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                      <div>
                        <h5 style={{ margin: '0 0 0.5rem 0' }}>{apt.service_name || 'Service'}</h5>
                        <p style={{ margin: '0 0 0.3rem 0', color: '#666' }}>
                          <strong>Staff Member:</strong> {apt.barber_name || 'Unknown'}
                        </p>
                      </div>
                      {getStatusBadge(apt.status)}
                    </div>

                    <p style={{ margin: '0.3rem 0', color: '#666' }}>
                      <strong>Date:</strong> {startDate.toLocaleDateString()}
                    </p>
                    <p style={{ margin: '0.3rem 0', color: '#666' }}>
                      <strong>Time:</strong> {displayTime}
                    </p>
                    <p style={{ margin: '0.3rem 0', color: '#666' }}>
                      <strong>Duration:</strong> {apt.duration_minutes || '30'} minutes
                    </p>

                    {apt.status === 'booked' && (
                      <div style={{
                        marginTop: '0.75rem',
                        padding: '0.75rem',
                        backgroundColor: '#d4edda',
                        borderRadius: '4px',
                        fontSize: '0.9rem',
                        color: '#155724'
                      }}>
                        ✓ Your appointment is confirmed! Please arrive 5 minutes early.
                      </div>
                    )}

                    {apt.status === 'completed' && (
                      <div style={{
                        marginTop: '0.75rem',
                        padding: '0.75rem',
                        backgroundColor: '#cfe2ff',
                        borderRadius: '4px',
                        fontSize: '0.9rem',
                        color: '#084298'
                      }}>
                        ✓ Thank you for your visit! We hope you enjoyed your service.
                      </div>
                    )}

                    {apt.status === 'cancelled' && (
                      <div style={{
                        marginTop: '0.75rem',
                        padding: '0.75rem',
                        backgroundColor: '#f8d7da',
                        borderRadius: '4px',
                        fontSize: '0.9rem',
                        color: '#721c24'
                      }}>
                        This appointment has been cancelled.
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {searched && customerAppointments.length === 0 && !loading && !error && (
          <div className="alert alert-info" style={{ margin: '1rem' }}>
            No appointments found for this phone number. <a href="/" style={{ color: '#3498db', textDecoration: 'none' }}>Book a new appointment</a>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerAppointments;
