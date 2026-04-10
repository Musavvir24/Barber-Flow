import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../utils/api';
import '../pages/Auth.css';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Validate token on component mount
  useEffect(() => {
    const validateToken = async () => {
      try {
        const response = await api.auth.validateResetToken(token);
        setTokenValid(true);
      } catch (err) {
        setError('Invalid or expired reset link. Please request a new password reset.');
        setTokenValid(false);
      } finally {
        setValidating(false);
      }
    };

    if (token) {
      validateToken();
    }
  }, [token]);

  // Calculate password strength
  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 10) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    return Math.min(strength, 4); // Max 4 levels
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === 'newPassword') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!formData.newPassword || !formData.confirmPassword) {
      setError('Both password fields are required');
      setLoading(false);
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      await api.auth.resetPassword({
        token,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      });

      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div className="auth-container">
        <div className="auth-box">
          <p>Validating reset link...</p>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="auth-container">
        <div className="auth-box">
          <h2>❌ Invalid Reset Link</h2>
          <p>{error}</p>
          <button
            className="auth-button"
            onClick={() => navigate('/login')}
            style={{ marginTop: '20px' }}
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="auth-container">
        <div className="auth-box">
          <h2>✅ Password Reset Successfully!</h2>
          <p>Your password has been reset. Redirecting to login...</p>
          <button
            className="auth-button"
            onClick={() => navigate('/login')}
            style={{ marginTop: '20px' }}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
  const strengthColors = ['#e74c3c', '#f39c12', '#3498db', '#2ecc71', '#27ae60'];

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>🔐 Reset Your Password</h2>
        <p className="auth-subtitle">Create a new password for your Meazebook account</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              name="newPassword"
              placeholder="Enter new password"
              value={formData.newPassword}
              onChange={handleChange}
              required
              disabled={loading}
              minLength="6"
            />
            {formData.newPassword && (
              <div
                className="password-strength"
                style={{ '--strength-level': passwordStrength }}
              >
                <div className="strength-bar">
                  <div
                    className="strength-fill"
                    style={{
                      width: `${(passwordStrength / 4) * 100}%`,
                      backgroundColor: strengthColors[passwordStrength - 1],
                    }}
                  ></div>
                </div>
                <span
                  style={{ color: strengthColors[passwordStrength - 1] }}
                >
                  {strengthLabels[passwordStrength - 1]}
                </span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm new password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              disabled={loading}
              minLength="6"
            />
            {formData.confirmPassword && formData.newPassword === formData.confirmPassword && (
              <div style={{ color: '#2ecc71', fontSize: '14px', marginTop: '5px' }}>
                ✓ Passwords match
              </div>
            )}
            {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
              <div style={{ color: '#e74c3c', fontSize: '14px', marginTop: '5px' }}>
                ✗ Passwords don't match
              </div>
            )}
          </div>

          <button
            type="submit"
            className="auth-button"
            disabled={loading || !formData.newPassword || !formData.confirmPassword}
          >
            {loading ? 'Resetting Password...' : 'Reset Password'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Remember your password?{' '}
            <a href="/login" style={{ color: '#667eea', textDecoration: 'none' }}>
              Sign In
            </a>
          </p>
        </div>
      </div>

      <style>{`
        .password-strength {
          margin-top: 10px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .strength-bar {
          flex: 1;
          height: 6px;
          background: #e0e0e0;
          border-radius: 3px;
          overflow: hidden;
        }

        .strength-fill {
          height: 100%;
          transition: width 0.3s ease, background-color 0.3s ease;
        }

        .error-message {
          background: #fee;
          color: #c33;
          padding: 12px;
          border-radius: 6px;
          margin-bottom: 20px;
          font-size: 14px;
        }
      `}</style>
    </div>
  );
};

export default ResetPassword;
