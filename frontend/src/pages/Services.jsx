import React, { useState } from 'react';
import { services } from '../utils/api.jsx';
import { useApi } from '../utils/hooks.jsx';
import './Services.css';

const Services = () => {
  const { data: servicesList, loading, error, refetch } = useApi(() => services.getAll());
  const [formData, setFormData] = useState({ name: '', duration_minutes: '', price: '', gap_time_minutes: '0' });
  const [editId, setEditId] = useState(null);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await services.update(editId, formData);
        setMessage('Service updated successfully');
        setEditId(null);
      } else {
        await services.create(formData);
        setMessage('Service created successfully');
      }
      setFormData({ name: '', duration_minutes: '', price: '', gap_time_minutes: '0' });
      refetch();
    } catch (err) {
      setMessage(err.response?.data?.error || 'Error saving service');
    }
  };

  const handleEdit = (service) => {
    setFormData({
      name: service.name,
      duration_minutes: service.duration_minutes,
      price: service.price,
      gap_time_minutes: service.gap_time_minutes || 0,
    });
    setEditId(service.id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await services.delete(id);
        setMessage('Service deleted successfully');
        refetch();
      } catch (err) {
        setMessage(err.response?.data?.error || 'Error deleting service');
      }
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', duration_minutes: '', price: '', gap_time_minutes: '0' });
    setEditId(null);
  };

  return (
    <div className="container">
      <div className="card">
        <div className="card-header">Manage Services</div>

        {message && (
          <div className="alert alert-success" style={{ marginBottom: '1rem' }}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
          <div className="form-group">
            <label>Service Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Duration (minutes)</label>
            <input
              type="number"
              name="duration_minutes"
              value={formData.duration_minutes}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Gap Time After Service (minutes) - Time to wait before next appointment</label>
            <input
              type="number"
              name="gap_time_minutes"
              value={formData.gap_time_minutes}
              onChange={handleChange}
              min="0"
              placeholder="0"
            />
          </div>

          <div className="form-group">
            <label>Price</label>
            <input
              type="number"
              step="0.01"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
            />
          </div>

          <div className="btn-group">
            <button type="submit" className="btn btn-success">
              {editId ? 'Update Service' : 'Add Service'}
            </button>
            {editId && (
              <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                Cancel
              </button>
            )}
          </div>
        </form>

        {loading && <div className="loading">Loading...</div>}
        {error && <div className="alert alert-danger">{error}</div>}

        {servicesList && servicesList.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Duration</th>
                <th>Gap Time</th>
                <th>Price</th>
                <th>Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {servicesList.map((service) => (
                <tr key={service.id}>
                  <td>{service.name}</td>
                  <td>{service.duration_minutes} min</td>
                  <td>{service.gap_time_minutes || 0} min</td>
                  <td>${service.price}</td>
                  <td>{service.active ? 'Yes' : 'No'}</td>
                  <td>
                    <div className="btn-group">
                      <button
                        className="btn btn-primary btn-small"
                        onClick={() => handleEdit(service)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-danger btn-small"
                        onClick={() => handleDelete(service.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">No services yet. Add your first service above!</div>
        )}
      </div>
    </div>
  );
};

export default Services;
