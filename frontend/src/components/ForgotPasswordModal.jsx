import React, { useState } from 'react';
import api from '../utils/api';

const ForgotPasswordModal = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.auth.forgotPassword({ email });
      setSuccess(true);
      setEmail('');
      
      // Auto-close after 5 seconds
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 5000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        
        <h2>🔐 Reset Your Password</h2>
        
        {success ? (
          <div className="success-message">
            <p>✅ Check your email!</p>
            <p>We've sent a password reset link to {email}. Click the link to set a new password.</p>
            <p style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
              The link expires in 30 minutes. If you don't see the email, check your spam folder.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button
              type="submit"
              className="btn-primary"
              disabled={loading || !email}
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>

            <p style={{ fontSize: '12px', color: '#666', marginTop: '15px' }}>
              We'll send you an email with a secure link to reset your password.
            </p>
          </form>
        )}
      </div>

      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          padding: 40px;
          border-radius: 12px;
          width: 90%;
          max-width: 400px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
          position: relative;
        }

        .modal-close {
          position: absolute;
          top: 15px;
          right: 15px;
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #999;
          transition: color 0.3s;
        }

        .modal-close:hover {
          color: #333;
        }

        h2 {
          margin: 0 0 20px 0;
          color: #333;
          font-size: 24px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        label {
          display: block;
          margin-bottom: 8px;
          color: #333;
          font-weight: 500;
        }

        input {
          width: 100%;
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
          box-sizing: border-box;
          transition: border-color 0.3s;
        }

        input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        input:disabled {
          background: #f5f5f5;
          cursor: not-allowed;
        }

        .btn-primary {
          width: 100%;
          padding: 12px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 5px 20px rgba(102, 126, 234, 0.3);
        }

        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .error-message {
          background: #fee;
          color: #c33;
          padding: 12px;
          border-radius: 6px;
          margin-bottom: 15px;
          font-size: 14px;
        }

        .success-message {
          background: #efe;
          color: #3a3;
          padding: 20px;
          border-radius: 6px;
          text-align: center;
        }

        .success-message p:first-child {
          margin: 0 0 10px 0;
          font-size: 18px;
          font-weight: 600;
        }

        .success-message p {
          margin: 0;
          line-height: 1.5;
        }
      `}</style>
    </div>
  );
};

export default ForgotPasswordModal;
