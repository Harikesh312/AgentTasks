import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMail, FiLock, FiHexagon, FiAlertCircle, FiEye, FiEyeOff } from 'react-icons/fi';
import './LoginPage.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Failed to login');
      }

      login(data.token, data);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper animate-fade">
      <div className="auth-split-container">
        
        <div className="auth-left-panel">
          <div className="auth-left-content">
            <Link to="/" className="brand-header">
              <FiHexagon className="brand-icon" /> AgentPrep
            </Link>
            <h2>Welcome Back.</h2>
            <p>Log in to continue orchestrating AI agents, practicing your prompts, and tracking your progress.</p>
          </div>
        </div>

        <div className="auth-right-panel">
          <div className="auth-form-container">
            <h2 className="auth-title">Log In</h2>
            <p className="auth-subtitle">Welcome back! Please enter your details.</p>
            
            {error && (
              <div className="auth-error animate-slide">
                <FiAlertCircle size={18} /> {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <div className="input-wrapper">
                  <FiMail className="input-icon" size={18} />
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="input-wrapper">
                  <FiLock className="input-icon" size={18} />
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                  />
                  <button 
                    type="button" 
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </div>
              
              <button type="submit" className="btn-primary auth-submit" disabled={loading}>
                {loading ? 'Logging in...' : 'Log In'}
              </button>
            </form>
            
            <p className="auth-redirect">
              Don't have an account? <Link to="/signup">Sign up</Link>
            </p>
          </div>
        </div>
        
      </div>
    </div>
  );
}
