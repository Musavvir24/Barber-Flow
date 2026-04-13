import React, { useState } from 'react';
import { appointments } from '../utils/api.jsx';
import { useApi } from '../utils/hooks.jsx';
import { convertTo12Hour } from '../utils/timeFormat.js';
import './Appointments.css';

const Appointments = ({ shop }) => {
  const { data: appointmentsList, loading, error, refetch } = useApi(() =>
    appointments.getAll()
  );
  const [message, setMessage] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      await appointments.updateStatus(appointmentId, newStatus);
      setMessage('Appointment updated successfully');
      refetch();
    } catch (err) {
      setMessage(err.response?.data?.error || 'Error updating appointment');
    }
  };



  const filteredAppointments = selectedDate
    ? appointmentsList?.filter(
        (apt) => new Date(apt.start_time).toLocaleDateString() === selectedDate
      )
    : appointmentsList;

  return (
    <div className="container">
      <div className="card">
        <div className="card-header">Appointments</div>

        {message && (
          <div className="alert alert-success" style={{ marginBottom: '1rem' }}>
            {message}
          </div>
        )}

        <div className="form-group">
          <label>Filter by Date (optional)</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
          {selectedDate && (
            <button
              className="btn btn-secondary btn-small"
              onClick={() => setSelectedDate('')}
              style={{ marginLeft: '0.5rem' }}
            >
              Clear Filter
            </button>
          )}
        </div>

        {loading && <div className="loading">Loading...</div>}
        {error && <div className="alert alert-danger">{error}</div>}

        {filteredAppointments && filteredAppointments.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Phone</th>
                <th>Date & Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.map((appointment) => (
                <tr key={appointment.id}>
                  <td>{appointment.customer_name}</td>
                  <td>{appointment.customer_phone}</td>
                  <td>{new Date(appointment.start_time).toLocaleString()}</td>
                  <td>
                    <select
                      value={appointment.status}
                      onChange={(e) => handleStatusChange(appointment.id, e.target.value)}
                    >
                      <option value="booked">Booked</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">No appointments found.</div>
        )}
      </div>
    </div>
  );
};

export default Appointments;
