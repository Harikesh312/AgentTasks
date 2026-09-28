import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_URL } from '../../config';
import { useAuth } from '../../context/AuthContext';
import { FiMail, FiLock, FiAlertCircle, FiEye, FiEyeOff, FiArrowRight, FiShield } from 'react-icons/fi';
import './AdminLogin.css';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, user, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  // If already logged in as admin, redirect
  useEffect(() => {
    if (isLoggedIn && user?.role === 'admin') {
      navigate('/admin');
    }
  }, [isLoggedIn, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to authenticate');
      }

      if (data.role !== 'admin') {
        throw new Error('Access denied. Admin privileges required.');
      }

      login(data);
      // Removed navigate('/admin') here to avoid race condition.
      // The useEffect above will handle the redirect once AuthContext state updates.
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="al-wrapper">
      <div className="al-container">
        
        {/* Branding */}
        <div className="al-brand">
          <img src="/logo02.png" alt="AgentTasks" className="al-logo" />
          <span className="al-brand-name">AgentTasks Admin</span>
        </div>

        <div className="al-card">
          <div className="al-header">
            <div className="al-icon-wrap">
              <FiShield size={24} className="al-icon" />
            </div>
            <h2>Admin Login</h2>
            <p>Enter your credentials to access the secure admin panel.</p>
          </div>

          {error && (
            <div className="al-error">
              <FiAlertCircle size={16} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="al-form">
            <div className="al-input-group">
              <label>Administrator Email</label>
              <div className="al-input-wrapper">
                <FiMail className="al-input-icon" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  required
                />
              </div>
            </div>

            <div className="al-input-group">
              <label>Password</label>
              <div className="al-input-wrapper">
                <FiLock className="al-input-icon" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  className="al-pw-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="al-submit-btn" disabled={loading}>
              {loading ? 'Authenticating...' : 'Secure Login'}
              {!loading && <FiArrowRight size={18} />}
            </button>
          </form>

          <div className="al-footer">
            <Link to="/" className="al-back-link">
              ← Return to Normal Panel
            </Link>
          </div>
        </div>
        
        {/* Decorative background shapes */}
        <div className="al-bg-shape shape-1"></div>
        <div className="al-bg-shape shape-2"></div>
      </div>
    </div>
  );
}
