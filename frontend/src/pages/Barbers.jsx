import React, { useState, useEffect } from 'react';
import { barbers, services } from '../utils/api.jsx';
import { convertTo12Hour } from '../utils/timeFormat.js';
import './Barbers.css';
import { useApi } from '../utils/hooks.jsx';

const Barbers = () => {
  const { data: barbersList, loading, error, refetch } = useApi(() => barbers.getAll());
  const { data: servicesList, loading: servicesLoading } = useApi(() => services.getAll());
  const [formData, setFormData] = useState({ name: '', phone: '' });
  const [editId, setEditId] = useState(null);
  const [message, setMessage] = useState('');
  const [expandedBarber, setExpandedBarber] = useState(null);
  const [barberServices, setBarberServices] = useState({});
  const [barberBreaks, setBarberBreaks] = useState({});
  const [breakManageId, setBreakManageId] = useState(null);
  const [breakForm, setBreakForm] = useState({ day_of_week: 'Monday', break_start_time: '12:00', break_end_time: '13:00' });

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Load services and breaks for each barber
  useEffect(() => {
    if (barbersList && barbersList.length > 0) {
      barbersList.forEach(async (barber) => {
        try {
          const serviceResponse = await barbers.getServices(barber.id);
          setBarberServices(prev => ({
            ...prev,
            [barber.id]: serviceResponse.data
          }));

          const breakResponse = await barbers.getBreaks(barber.id);
          setBarberBreaks(prev => ({
            ...prev,
            [barber.id]: breakResponse.data
          }));
        } catch (err) {
          console.error('Error loading barber data:', err);
        }
      });
    }
  }, [barbersList]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await barbers.update(editId, formData);
        setMessage('Staff Member updated successfully');
        setEditId(null);
      } else {
        await barbers.create(formData);
        setMessage('Staff Member created successfully');
      }
      setFormData({ name: '', phone: '' });
      refetch();
    } catch (err) {
      setMessage(err.response?.data?.error || 'Error saving staff member');
    }
  };

  const handleEdit = (barber) => {
    setFormData({ name: barber.name, phone: barber.phone });
    setEditId(barber.id);
    setExpandedBarber(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await barbers.delete(id);
        setMessage('Staff Member deleted successfully');
        refetch();
      } catch (err) {
        setMessage(err.response?.data?.error || 'Error deleting staff member');
      }
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', phone: '' });
    setEditId(null);
  };

  const handleToggleAvailability = async (barber) => {
    try {
      await barbers.update(barber.id, { available: !barber.available });
      setMessage(`${barber.name} is now ${!barber.available ? 'available' : 'unavailable'}`);
      refetch();
    } catch (err) {
      setMessage(err.response?.data?.error || 'Error updating availability');
    }
  };

  const handleAssignService = async (barberId, serviceId) => {
    try {
      await barbers.assignService(barberId, serviceId);
      setMessage('Service assigned successfully');
      
      // Reload services for this barber
      const response = await barbers.getServices(barberId);
      setBarberServices(prev => ({
        ...prev,
        [barberId]: response.data
      }));
    } catch (err) {
      setMessage(err.response?.data?.error || 'Error assigning service');
    }
  };

  const handleRemoveService = async (barberId, serviceId) => {
    try {
      await barbers.removeService(barberId, serviceId);
      setMessage('Service removed successfully');
      
      // Reload services for this barber
      const response = await barbers.getServices(barberId);
      setBarberServices(prev => ({
        ...prev,
        [barberId]: response.data
      }));
    } catch (err) {
      setMessage(err.response?.data?.error || 'Error removing service');
    }
  };

  const handleAddBreak = async (barberId) => {
    try {
      await barbers.addBreak({
        barber_id: barberId,
        day_of_week: breakForm.day_of_week,
        break_start_time: breakForm.break_start_time,
        break_end_time: breakForm.break_end_time,
      });
      setMessage('Break time added successfully');
      setBreakForm({ day_of_week: 'Monday', break_start_time: '12:00', break_end_time: '13:00' });
      
      // Reload breaks for this barber
      const response = await barbers.getBreaks(barberId);
      setBarberBreaks(prev => ({
        ...prev,
        [barberId]: response.data
      }));
    } catch (err) {
      setMessage(err.response?.data?.error || 'Error adding break');
    }
  };

  const handleDeleteBreak = async (breakId, barberId) => {
    try {
      await barbers.deleteBreak(breakId);
      setMessage('Break deleted successfully');
      
      // Reload breaks for this barber
      const response = await barbers.getBreaks(barberId);
      setBarberBreaks(prev => ({
        ...prev,
        [barberId]: response.data
      }));
    } catch (err) {
      setMessage(err.response?.data?.error || 'Error deleting break');
    }
  };

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      <div className="card">
        <div className="card-header">💈 Manage Staff & Their Services</div>

        {message && (
          <div className="alert alert-success" style={{ marginBottom: '1rem' }}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ marginBottom: '2rem', padding: '1.5rem', background: '#f9f9f9', borderRadius: '8px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label htmlFor="name">Staff Member Name *</label>
              <input
                id="name"
                type="text"
                name="name"
                placeholder="e.g., John Smith"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone (optional)</label>
              <input
                id="phone"
                type="tel"
                name="phone"
                placeholder="+1234567890"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="btn-group">
            <button type="submit" className="btn btn-success">
              {editId ? '✏️ Update Staff Member' : '➕ Add Staff Member'}
            </button>
            {editId && (
              <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                Cancel
              </button>
            )}
          </div>
          <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#666', fontStyle: 'italic' }}>
            💡 After adding staff, you must assign at least one service to make them available for booking.
          </div>
        </form>

        {loading && <div className="loading">Loading staff...</div>}
        {error && <div className="alert alert-danger">{error}</div>}

        {barbersList && barbersList.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {barbersList.map((barber) => {
              const hasServices = barberServices[barber.id] && barberServices[barber.id].length > 0;
              return (
              <div key={barber.id} style={{
                border: !hasServices ? '2px solid #ff9800' : '1px solid #ddd',
                borderRadius: '8px',
                padding: '1rem',
                background: !hasServices ? '#fff3e0' : '#f9f9f9'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                      <strong style={{ fontSize: '1.1rem' }}>{barber.name}</strong>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '4px',
                        fontSize: '0.85rem',
                        background: barber.active ? '#d4edda' : '#f8d7da',
                        color: barber.active ? '#155724' : '#721c24',
                        fontWeight: 'bold'
                      }}>
                        {barber.active ? '✓ Active' : '✗ Inactive'}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>
                      {barber.phone && <span>📱 {barber.phone}</span>}
                    </div>
                    {!hasServices && (
                      <div style={{ fontSize: '0.85rem', color: '#ff9800', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                        ⚠️ No services assigned - Not available for booking
                      </div>
                    )}
                    {barberServices[barber.id] && barberServices[barber.id].length > 0 && (
                      <div style={{ fontSize: '0.85rem', color: '#333', marginTop: '0.5rem', background: '#e8f5e9', padding: '0.5rem', borderRadius: '4px' }}>
                        <strong>Services:</strong><br />
                        {barberServices[barber.id].map((s, idx) => (
                          <span key={idx}>
                            {s.name} ({s.duration_minutes}min {s.gap_time_minutes ? `+ ${s.gap_time_minutes}min gap` : ''})
                            {idx < barberServices[barber.id].length - 1 && ', '}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="btn-group" style={{ flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => handleToggleAvailability(barber)}
                      className={`btn btn-small ${barber.available ? 'btn-success' : 'btn-danger'}`}
                      title={barber.available ? 'Click to mark unavailable' : 'Click to mark available'}
                    >
                      {barber.available ? '🟢 Available' : '🔴 Unavailable'}
                    </button>
                    <button
                      className="btn btn-primary btn-small"
                      onClick={() => handleEdit(barber)}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      className="btn btn-info btn-small"
                      onClick={() => setExpandedBarber(expandedBarber === barber.id ? null : barber.id)}
                    >
                      {expandedBarber === barber.id ? '▼ Hide Services' : '▶ Manage Services'}
                    </button>
                    <button
                      className="btn btn-warning btn-small"
                      onClick={() => setBreakManageId(breakManageId === barber.id ? null : barber.id)}
                    >
                      {breakManageId === barber.id ? '▼ Hide Breaks' : '⏸️ Manage Breaks'}
                    </button>
                    <button
                      className="btn btn-danger btn-small"
                      onClick={() => handleDelete(barber.id)}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>

                {/* Service assignment section */}
                {expandedBarber === barber.id && (
                  <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '2px solid #ddd', background: '#fff', padding: '1rem', borderRadius: '6px' }}>
                    <strong style={{ fontSize: '1rem', marginBottom: '0.75rem', display: 'block' }}>📋 Assign Services to {barber.name}</strong>
                    {servicesLoading ? (
                      <div className="loading">Loading services...</div>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '0.75rem' }}>
                        {servicesList && servicesList.map((service) => {
                          const isAssigned = barberServices[barber.id]?.some(s => s.id === service.id);
                          return (
                            <div key={service.id} style={{
                              border: isAssigned ? '2px solid #28a745' : '1px solid #ccc',
                              padding: '0.75rem',
                              borderRadius: '6px',
                              background: isAssigned ? '#e8f5e9' : '#fafafa',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}>
                              <div style={{ flex: 1 }}>
                                <strong style={{ display: 'block', marginBottom: '0.25rem' }}>{service.name}</strong>
                                <div style={{ fontSize: '0.85rem', color: '#666' }}>
                                  ⏱️ {service.duration_minutes}min
                                  {service.gap_time_minutes ? ` + ${service.gap_time_minutes}min gap` : ''}
                                </div>
                                <div style={{ fontSize: '0.85rem', color: '#333', fontWeight: 'bold' }}>
                                  💰 ${service.price}
                                </div>
                              </div>
                              {isAssigned ? (
                                <button
                                  className="btn btn-danger btn-small"
                                  onClick={() => handleRemoveService(barber.id, service.id)}
                                  style={{ marginLeft: '0.5rem' }}
                                >
                                  ✕ Remove
                                </button>
                              ) : (
                                <button
                                  className="btn btn-success btn-small"
                                  onClick={() => handleAssignService(barber.id, service.id)}
                                  style={{ marginLeft: '0.5rem' }}
                                >
                                  ✓ Add
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Break management section */}
                {breakManageId === barber.id && (
                  <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '2px solid #ddd', background: '#fff', padding: '1rem', borderRadius: '6px' }}>
                    <strong style={{ fontSize: '1rem', marginBottom: '0.75rem', display: 'block' }}>⏸️ Manage Break Times for {barber.name}</strong>
                    
                    {/* Add new break form */}
                    <div style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '6px', marginBottom: '1rem' }}>
                      <strong style={{ display: 'block', marginBottom: '0.75rem' }}>Add New Break Time</strong>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem', marginBottom: '0.75rem' }}>
                        <div>
                          <label style={{ fontSize: '0.85rem', fontWeight: 'bold', display: 'block', marginBottom: '0.25rem' }}>Day of Week</label>
                          <select
                            value={breakForm.day_of_week}
                            onChange={(e) => setBreakForm({ ...breakForm, day_of_week: e.target.value })}
                            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                          >
                            {daysOfWeek.map((day) => (
                              <option key={day} value={day}>{day}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label style={{ fontSize: '0.85rem', fontWeight: 'bold', display: 'block', marginBottom: '0.25rem' }}>Break Start</label>
                          <input
                            type="time"
                            value={breakForm.break_start_time}
                            onChange={(e) => setBreakForm({ ...breakForm, break_start_time: e.target.value })}
                            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                          />
                          <small style={{ fontSize: '0.75rem', color: '#666' }}>({convertTo12Hour(breakForm.break_start_time + ':00')})</small>
                        </div>
                        <div>
                          <label style={{ fontSize: '0.85rem', fontWeight: 'bold', display: 'block', marginBottom: '0.25rem' }}>Break End</label>
                          <input
                            type="time"
                            value={breakForm.break_end_time}
                            onChange={(e) => setBreakForm({ ...breakForm, break_end_time: e.target.value })}
                            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                          />
                          <small style={{ fontSize: '0.75rem', color: '#666' }}>({convertTo12Hour(breakForm.break_end_time + ':00')})</small>
                        </div>
                      </div>
                      <button
                        className="btn btn-success"
                        onClick={() => handleAddBreak(barber.id)}
                        style={{ width: '100%' }}
                      >
                        ✓ Add Break Time
                      </button>
                    </div>

                    {/* List existing breaks */}
                    <div>
                      <strong style={{ display: 'block', marginBottom: '0.75rem' }}>Existing Break Times</strong>
                      {barberBreaks[barber.id] && barberBreaks[barber.id].length > 0 ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '0.75rem' }}>
                          {barberBreaks[barber.id].map((breakTime) => (
                            <div key={breakTime.id} style={{
                              border: '1px solid #ddd',
                              padding: '0.75rem',
                              borderRadius: '6px',
                              background: '#fff9e6',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}>
                              <div>
                                <strong style={{ display: 'block', marginBottom: '0.25rem' }}>{breakTime.day_of_week}</strong>
                                <div style={{ fontSize: '0.85rem', color: '#666' }}>
                                  🕐 {convertTo12Hour(breakTime.break_start_time + ':00')} - {convertTo12Hour(breakTime.break_end_time + ':00')}
                                </div>
                              </div>
                              <button
                                className="btn btn-danger btn-small"
                                onClick={() => handleDeleteBreak(breakTime.id, barber.id)}
                              >
                                🗑️ Delete
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ padding: '1rem', background: '#f9f9f9', borderRadius: '4px', color: '#666', fontSize: '0.9rem' }}>
                          📋 No break times set. Add one above!
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">✂️ No staff members yet. Add your first staff member above, then assign services!</div>
        )}
      </div>
    </div>
  );
};

export default Barbers;
