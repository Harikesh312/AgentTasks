import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';
import { FiUser, FiMail, FiLock, FiAlertCircle, FiEye, FiEyeOff, FiArrowRight, FiShield, FiCheck } from 'react-icons/fi';
import './LoginPage.css'; // Reusing styles from LoginPage

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (password.length < 6) {
      return setError('Password must be at least 6 characters');
    }
    
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }
    
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Failed to sign up');
      }

      login(data);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-container">
        
        {/* ==================================================
            LEFT PANEL - MATCHING LOGIN PAGE
            ================================================== */}
        <div className="login-left-panel">
          {/* Abstract SVG Background Decor */}
          <svg className="login-bg-decor" viewBox="0 0 600 700" preserveAspectRatio="xMidYMid slice">
            <path d="M-100 200 Q 200 100 500 450 T 800 700" className="bg-path" />
            <path d="M0 600 Q 250 750 450 350 T 700 100" className="bg-path" />
            <path d="M200 -50 Q 300 250 650 650" className="bg-path" />
            <circle cx="150" cy="180" r="3" className="bg-node" />
            <circle cx="450" cy="380" r="4.5" className="bg-node" />
            <circle cx="280" cy="550" r="2.5" className="bg-node" />
            <circle cx="500" cy="220" r="3" className="bg-node" />
          </svg>

          {/* Tailwind-style background patches converted to inline CSS */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
            <div style={{ position: 'absolute', top: '-8rem', left: '-8rem', width: '420px', height: '420px', borderRadius: '9999px', filter: 'blur(64px)', opacity: 0.5, background: '#fed7aa' }}></div>
            <div style={{ position: 'absolute', top: '25%', left: '-10rem', width: '380px', height: '380px', borderRadius: '9999px', filter: 'blur(64px)', opacity: 0.45, background: '#ffedd5' }}></div>
            <div style={{ position: 'absolute', top: '-6rem', right: '-8rem', width: '430px', height: '430px', borderRadius: '9999px', filter: 'blur(64px)', opacity: 0.5, background: '#fed7aa' }}></div>
            <div style={{ position: 'absolute', top: '40%', right: '-11rem', width: '400px', height: '400px', borderRadius: '9999px', filter: 'blur(64px)', opacity: 0.4, background: '#fdba74' }}></div>
            <div style={{ position: 'absolute', bottom: '-10rem', left: '-5rem', width: '430px', height: '430px', borderRadius: '9999px', filter: 'blur(64px)', opacity: 0.4, background: '#fed7aa' }}></div>
            <div style={{ position: 'absolute', bottom: '-11rem', right: '-5rem', width: '460px', height: '460px', borderRadius: '9999px', filter: 'blur(64px)', opacity: 0.4, background: '#ffedd5' }}></div>
          </div>

          <div className="login-left-content">
            <Link to="/" style={{ textDecoration: 'none' }}>
              <div className="login-brand">
                <img src="/logo02.png" alt="AgentTasks" className="brand-logo-img" />
                <span className="brand-name">AgentTasks</span>
              </div>
            </Link>

            <div className="login-pill">
              <span className="pill-icon">+</span>
              AI Powered Learning Platform
            </div>

            <h1 className="login-heading" style={{ fontSize: '3rem' }}>
              <span className="heading-dark">Start Your</span>
              <br />
              <span className="heading-orange">Journey.</span>
            </h1>

            <p className="login-desc">
              Join thousands of developers mastering AI agent orchestration and building the future of software.
            </p>

            <ul className="login-features">
              <li>
                <span className="feature-check"><FiCheck size={12} /></span>
                Build real-world AI agents
              </li>
              <li>
                <span className="feature-check"><FiCheck size={12} /></span>
                Get instant feedback
              </li>
              <li>
                <span className="feature-check"><FiCheck size={12} /></span>
                Track your progress
              </li>
            </ul>

            <div className="login-handwritten">
              Master AI Agents
              <div className="handwritten-underline"></div>
            </div>

            {/* AI Progress Card */}
            <div className="login-eval-card">
              <div className="eval-title">AI Progress</div>
              <div className="eval-layout">
                <div className="eval-score-widget">
                  <svg className="eval-ring" viewBox="0 0 80 80">
                    <circle cx="40" cy="40" r="32" className="ring-bg" />
                    <circle cx="40" cy="40" r="32" className="ring-progress" style={{ strokeDashoffset: '44' }} />
                  </svg>
                  <div className="eval-score-text">
                    <span className="score-num">78%</span>
                    <span className="score-label">Progress</span>
                  </div>
                </div>
                <ul className="eval-checklist">
                  <li><span className="eval-check-icon"><FiCheck size={10} /></span> Practice regularly</li>
                  <li><span className="eval-check-icon"><FiCheck size={10} /></span> Improve problem solving</li>
                  <li><span className="eval-check-icon"><FiCheck size={10} /></span> Track performance</li>
                  <li><span className="eval-check-icon"><FiCheck size={10} /></span> Build better solutions</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* ==================================================
            RIGHT PANEL - SIGNUP FORM
            ================================================== */}
        <div className="login-right-panel">
          <div className="login-form-content">

            <div className="secure-badge">
              <FiShield size={14} />
              Secure Registration
            </div>

            <h2 className="login-title">
              Create an <span className="title-orange">Account</span>
            </h2>
            <p className="login-subtitle">
              Sign up now and start practicing immediately.
            </p>

            {error && (
              <div className="login-error">
                <FiAlertCircle size={18} /> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="login-form">
              <div className="input-group">
                <label>Full Name</label>
                <div className="input-wrapper">
                  <FiUser className="input-icon" size={18} />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Email</label>
                <div className="input-wrapper">
                  <FiMail className="input-icon" size={18} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Password</label>
                <div className="input-wrapper">
                  <FiLock className="input-icon" size={18} />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password"
                    required
                  />
                  <button
                    type="button"
                    className="pw-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </div>

              <div className="input-group">
                <label>Confirm Password</label>
                <div className="input-wrapper">
                  <FiLock className="input-icon" size={18} />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    required
                  />
                  <button
                    type="button"
                    className="pw-toggle-btn"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="login-submit-btn" disabled={loading} style={{ marginTop: '10px' }}>
                {loading ? 'Creating Account...' : 'Sign Up'}
                {!loading && <FiArrowRight size={18} />}
              </button>
            </form>

            <div className="login-redirect" style={{ marginTop: '30px' }}>
              Already have an account? <Link to="/login">Log in here</Link>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
