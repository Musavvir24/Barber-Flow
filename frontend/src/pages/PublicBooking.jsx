import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { barbers, services, appointments } from '../utils/api.jsx';

const PublicBooking = () => {
  const { shopSlug } = useParams();
  const slug = shopSlug ? shopSlug.replace(/\.+$/,'').trim() : shopSlug;
  const [step, setStep] = useState(1);
  const [shopInfo, setShopInfo] = useState(null);
  const [barbersList, setBarbersList] = useState([]);
  const [servicesList, setServicesList] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const [formData, setFormData] = useState({
    service_id: '',
    barber_id: '',
    date: '',
    time: '',
    customer_name: '',
    customer_phone: '',
    customer_email: '',
  });

  const [createdAppointment, setCreatedAppointment] = useState(null);

  // Helper function to convert 24-hour format to 12-hour display format (e.g., "15:30" -> "3:30 PM")
  const formatTimeDisplay = (timeStr) => {
    if (!timeStr) return '';
    
    // Parse 24-hour format (HH:MM)
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

  // Load shop info, barbers and services on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await appointments.getShopOverview(slug);
        setShopInfo(response.data.shop);
        setBarbersList(response.data.barbers);
        setServicesList(response.data.services);
      } catch (err) {
        setError('Failed to load shop information');
        console.error(err);
      }
    };
    loadData();
  }, [shopSlug]);

  // Load available and booked slots when date/barber change
  useEffect(() => {
    if (formData.barber_id && formData.date && formData.service_id) {
      loadSlots();
    }
  }, [formData.barber_id, formData.date, formData.service_id]);

  // Poll for updated booked slots - check immediately on click, then every 1 second when on step 3
  useEffect(() => {
    if (step === 3 && formData.barber_id && formData.date && formData.service_id) {
      // Check immediately
      loadBookedSlots();
      
      // Then check every 1 second for real-time updates
      const pollInterval = setInterval(() => {
        loadBookedSlots();
      }, 1000); // Check for new bookings every 1 second

      return () => clearInterval(pollInterval);
    }
  }, [step, formData.barber_id, formData.date, formData.service_id]);

  const loadSlots = async () => {
    setLoading(true);
    try {
      const selectedService = servicesList.find((s) => s.id == formData.service_id);
      
      // Get available slots
      const availResponse = await appointments.getAvailableSlots(slug, {
        barber_id: formData.barber_id,
        date: formData.date,
        duration_minutes: selectedService?.duration_minutes,
        gap_time_minutes: selectedService?.gap_time_minutes || 0,
      });
      const allSlots = availResponse.data.slots || [];
      
      // Get booked appointments for this date/barber
      const bookedResponse = await appointments.getByShopSlug(slug, {
        barber_id: formData.barber_id,
        date: formData.date,
      });
      // Store booked slots in 24-hour format (HH:MM) - extract from the stored time
      const booked = bookedResponse.data
        .filter(apt => apt.status === 'booked')
        .map(apt => {
          // Use the start_time_display field that backend now provides
          if (apt.start_time_display) {
            return apt.start_time_display;
          }
          
          // Fallback: Extract time from start_time string if display field not available
          const startTime = apt.start_time;
          const timeMatch = startTime.match(/T(\d{2}):(\d{2})/);
          if (timeMatch) {
            return `${timeMatch[1]}:${timeMatch[2]}`;
          }
          return '';
        })
        .filter(time => time);
      
      setBookedSlots(booked);
      
      // Filter out booked slots from available slots (compare in 24-hour format)
      const filteredSlots = allSlots.filter(slot => !booked.includes(slot));
      setAvailableSlots(filteredSlots);
      
      console.log('Available slots (raw):', allSlots);
      console.log('Booked slots (24-hour):', booked);
      console.log('Filtered slots:', filteredSlots);
      console.log('---');
    } catch (err) {
      setError('Failed to load available slots');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadBookedSlots = async () => {
    try {
      const bookedResponse = await appointments.getByShopSlug(slug, {
        barber_id: formData.barber_id,
        date: formData.date,
      });
      // Store booked slots in 24-hour format (HH:MM) - extract from the stored time
      // The backend now provides start_time_display field for easy parsing
      const booked = bookedResponse.data
        .filter(apt => apt.status === 'booked')
        .map(apt => {
          // Use the start_time_display field that backend now provides
          if (apt.start_time_display) {
            return apt.start_time_display;
          }
          
          // Fallback: Extract time from start_time string if display field not available
          const startTime = apt.start_time;
          const timeMatch = startTime.match(/T(\d{2}):(\d{2})/);
          if (timeMatch) {
            return `${timeMatch[1]}:${timeMatch[2]}`;
          }
          return '';
        })
        .filter(time => time); // Remove empty entries
      
      setBookedSlots(booked);
      console.log('Booked slots (24-hour format):', booked);
    } catch (err) {
      console.error('Error fetching booked slots:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNextStep = () => {
    if (step < 5) {
      setStep(step + 1);
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const selectedService = servicesList.find((s) => s.id == formData.service_id);
    
    // formData.time is already in 24-hour format (HH:MM)
    // Create ISO strings WITHOUT timezone conversion to preserve local time
    const startTimeISO = `${formData.date}T${formData.time}:00`;
    
    // Calculate end time by adding duration
    const [startHours, startMinutes] = formData.time.split(':').map(Number);
    let endHours = startHours;
    let endMinutes = startMinutes + selectedService.duration_minutes;
    let endDate = formData.date;
    
    // Handle overflow (if minutes >= 60 or hours >= 24)
    if (endMinutes >= 60) {
      endHours += Math.floor(endMinutes / 60);
      endMinutes = endMinutes % 60;
    }
    if (endHours >= 24) {
      // Move to next day
      const nextDay = new Date(formData.date);
      nextDay.setDate(nextDay.getDate() + 1);
      endDate = nextDay.toISOString().split('T')[0];
      endHours = endHours % 24;
    }
    
    const endTimeISO = `${endDate}T${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}:00`;

    try {
      setLoading(true);
      
      // Check if selected slot is still available before booking
      // Compare in 24-hour format
      if (bookedSlots.includes(formData.time)) {
        setError('This time slot has just been booked. Please select another time.');
        setStep(3); // Go back to time selection
        return;
      }

      const response = await appointments.create(slug, {
        barber_id: formData.barber_id,
        service_id: formData.service_id,
        customer_name: formData.customer_name,
        customer_phone: formData.customer_phone,
        customer_email: formData.customer_email || null,
        start_time: startTimeISO,
        end_time: endTimeISO,
      });
      setCreatedAppointment(response.data);
      setStep(5);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create appointment');
    } finally {
      setLoading(false);
    }
  };

  const getServiceName = () => {
    return servicesList.find((s) => s.id == formData.service_id)?.name;
  };

  const getBarberName = () => {
    return barbersList.find((b) => b.id == formData.barber_id)?.name;
  };

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: '600px', margin: '2rem auto' }}>
        <div className="card-header">Book an Appointment</div>

        {error && <div className="alert alert-danger">{error}</div>}
        {message && <div className="alert alert-success">{message}</div>}

        {/* Step 1: Select Service */}
        {step === 1 && (
          <div>
            <h3>Step 1: Select a Service</h3>
            <div className="form-group">
              <select
                name="service_id"
                value={formData.service_id}
                onChange={handleChange}
                required
              >
                <option value="">-- Choose a service --</option>
                {servicesList.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name} ({service.duration_minutes} min) - ${service.price}
                  </option>
                ))}
              </select>
            </div>
            <div className="btn-group">
              <button
                className="btn btn-primary"
                onClick={handleNextStep}
                disabled={!formData.service_id}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Select Barber */}
        {step === 2 && (
          <div>
            <h3>Step 2: Choose Your Staff Member</h3>
            <div className="form-group">
              <label>Available Staff Members & Their Services</label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                marginTop: '1rem'
              }}>
                {barbersList.filter(barber => barber.available && barber.services && barber.services.some(s => s.id == formData.service_id)).length > 0 ? (
                  barbersList
                    .filter(barber => barber.available && barber.services && barber.services.some(s => s.id == formData.service_id))
                    .map((barber) => (
                      <div
                        key={barber.id}
                        onClick={() => handleChange({ target: { name: 'barber_id', value: barber.id } })}
                        style={{
                          padding: '1rem',
                          border: formData.barber_id == barber.id ? '2px solid #3498db' : '1px solid #ddd',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          background: formData.barber_id == barber.id ? '#f0f8ff' : 'white',
                          transition: 'all 0.3s'
                        }}
                      >
                        <div style={{ fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '1rem' }}>
                          ✂️ {barber.name}
                        </div>
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '4px',
                          fontSize: '0.8rem',
                          background: '#d4edda',
                          color: '#155724',
                          fontWeight: 'bold',
                          display: 'inline-block',
                          marginBottom: '0.5rem'
                        }}>
                          🟢 Available
                        </span>
                        
                        {/* Show services for this barber */}
                        {barber.services && barber.services.length > 0 ? (
                          <div style={{ marginTop: '0.75rem', textAlign: 'left', fontSize: '0.85rem', color: '#555' }}>
                            <strong style={{ display: 'block', marginBottom: '0.5rem' }}>Services:</strong>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                              {barber.services.map((service) => (
                                <div key={service.id} style={{ padding: '0.4rem', background: '#f5f5f5', borderRadius: '4px' }}>
                                  <span style={{ fontWeight: 'bold' }}>{service.name}</span>
                                  <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.2rem' }}>
                                    ⏱️ {service.duration_minutes}min
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: '#999', fontStyle: 'italic' }}>
                            No services assigned yet
                          </div>
                        )}
                      </div>
                    ))
                ) : (
                  <div className="alert alert-warning">
                    No available staff with this service at this moment. Please try again later.
                  </div>
                )}
              </div>
            </div>
            <div className="btn-group">
              <button className="btn btn-secondary" onClick={handlePrevStep}>
                Back
              </button>
              <button
                className="btn btn-primary"
                onClick={handleNextStep}
                disabled={!formData.barber_id}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Select Date & Time */}
        {step === 3 && (
          <div>
            <h3>Step 3: Choose Date & Time</h3>
            <div className="form-group">
              <label htmlFor="date">Select Date</label>
              <input
                id="date"
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>
            {formData.date && (
              <div className="form-group">
                <label>Available Time Slots</label>
                {loading && <div className="loading">Loading available times...</div>}
                {availableSlots.length > 0 || bookedSlots.length > 0 ? (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
                    gap: '0.75rem',
                    marginTop: '1rem'
                  }}>
                    {/* Show all slots - combine available and booked, both in 24-hour format */}
                    {[...availableSlots, ...bookedSlots].sort().map((slot) => {
                      // slot is in 24-hour format (HH:MM)
                      const displayTime = formatTimeDisplay(slot); // Convert to 12-hour format for display
                      const isBooked = bookedSlots.includes(slot);
                      const isSelected = formData.time === slot; // Compare in 24-hour format
                      
                      return (
                        <button
                          key={slot}
                          onClick={() => {
                            if (!isBooked) {
                              console.log('Selected time (24-hour):', slot, 'Display:', displayTime);
                              handleChange({ target: { name: 'time', value: slot } });
                            }
                          }}
                          disabled={isBooked}
                          style={{
                            padding: '0.75rem',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: isBooked ? 'not-allowed' : 'pointer',
                            fontWeight: 'bold',
                            fontSize: '0.9rem',
                            background: isBooked 
                              ? '#f8d7da' 
                              : isSelected
                                ? '#3498db' 
                                : '#d4edda',
                            color: isBooked 
                              ? '#721c24' 
                              : isSelected
                                ? 'white' 
                                : '#155724',
                            opacity: isBooked ? 0.6 : 1,
                            transition: 'all 0.2s'
                          }}
                          title={isBooked ? 'Already booked' : 'Available'}
                        >
                          {isBooked ? '🔴' : '🟢'} {displayTime}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="alert alert-info">No available slots for this date. Please try another date or barber.</div>
                )}
              </div>
            )}
            <div className="btn-group">
              <button className="btn btn-secondary" onClick={handlePrevStep}>
                Back
              </button>
              <button
                className="btn btn-primary"
                onClick={handleNextStep}
                disabled={!formData.time}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Enter Customer Info */}
        {step === 4 && (
          <div>
            <h3>Step 4: Your Information</h3>
            
            {/* Warning if slot is no longer available */}
            {bookedSlots.includes(formData.time) && (
              <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>
                ⚠️ <strong>Alert!</strong> The time slot <strong>{formatTimeDisplay(formData.time)}</strong> has just been booked by someone else. 
                <button 
                  className="btn btn-sm btn-danger" 
                  onClick={() => setStep(3)}
                  style={{ marginLeft: '1rem' }}
                >
                  Select Another Time
                </button>
              </div>
            )}

            {/* Summary of selected appointment */}
            <div className="alert alert-info" style={{ marginBottom: '1rem', backgroundColor: '#e7f3ff', border: '1px solid #b3d9ff', borderRadius: '4px', padding: '1rem' }}>
              <strong>Your Selection:</strong>
              <div style={{ marginTop: '0.5rem', fontSize: '0.95rem' }}>
                📅 <strong>Date:</strong> {formData.date}<br/>
                🕐 <strong>Time:</strong> {formatTimeDisplay(formData.time)}<br/>
                💈 <strong>Barber:</strong> {getBarberName()}<br/>
                ✨ <strong>Service:</strong> {getServiceName()}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="customer_name">Full Name *</label>
              <input
                id="customer_name"
                type="text"
                name="customer_name"
                placeholder="John Doe"
                value={formData.customer_name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="customer_phone">Phone Number *</label>
              <input
                id="customer_phone"
                type="tel"
                name="customer_phone"
                placeholder="+1234567890"
                value={formData.customer_phone}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="customer_email">Email Address *</label>
              <input
                id="customer_email"
                type="email"
                name="customer_email"
                placeholder="you@example.com"
                value={formData.customer_email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="btn-group">
              <button className="btn btn-secondary" onClick={handlePrevStep}>
                Back
              </button>
              <button
                className="btn btn-success"
                onClick={handleSubmit}
                disabled={!formData.customer_name || !formData.customer_phone || loading || bookedSlots.includes(formData.time)}
                title={bookedSlots.includes(formData.time) ? 'Selected time is no longer available' : ''}
              >
                {loading ? 'Booking...' : bookedSlots.includes(formData.time) ? 'Time Slot Taken' : 'Confirm Booking'}
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Confirmation */}
        {step === 5 && createdAppointment && (
          <div>
            <h3>✓ Booking Confirmed!</h3>
            <div className="alert alert-success">
              <p>
                <strong>Service:</strong> {getServiceName()}
              </p>
              <p>
                <strong>Barber:</strong> {getBarberName()}
              </p>
              <p>
                <strong>Date & Time:</strong>{' '}
                {new Date(createdAppointment.start_time).toLocaleString()}
              </p>
              <p>
                <strong>Your Name:</strong> {createdAppointment.customer_name}
              </p>
              <p>
                <strong>Your Phone:</strong> {createdAppointment.customer_phone}
              </p>
            </div>

            <div className="card" style={{ backgroundColor: '#ecf0f1', marginTop: '1rem' }}>
              <h4>✅ Booking Confirmed</h4>
              <p style={{ fontStyle: 'italic', color: '#27ae60' }}>Your appointment has been confirmed. A confirmation email has been sent to your email address.</p>
            </div>

            <div className="btn-group" style={{ marginTop: '1rem' }}>
              <button className="btn btn-primary" onClick={() => window.location.reload()}>
                Book Another Appointment
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicBooking;
