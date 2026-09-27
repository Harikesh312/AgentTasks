import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_URL } from '../config';
import { useAuth } from '../context/AuthContext';
import {
  FiMail, FiLock, FiAlertCircle, FiEye, FiEyeOff,
  FiArrowRight, FiShield, FiCheck
} from 'react-icons/fi';
import './LoginPage.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
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
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password, rememberMe }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || 'Failed to login');
      }

      login(data);
      if (data.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err instanceof TypeError
        ? 'Unable to reach the server. Please check your connection and try again.'
        : err.message || 'Unable to log in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-container">

        {/* ==================================================
            LEFT PANEL - PREMIUM ORANGE BACKGROUND
            ================================================== */}
        <div className="login-left-panel">

          {/* Abstract SVG Background Decor */}
          <svg className="login-bg-decor" viewBox="0 0 600 700" preserveAspectRatio="xMidYMid slice">
            {/* Flowing arcs */}
            <path d="M-100 200 Q 200 100 500 450 T 800 700" className="bg-path" />
            <path d="M0 600 Q 250 750 450 350 T 700 100" className="bg-path" />
            <path d="M200 -50 Q 300 250 650 650" className="bg-path" />
            {/* Soft glowing nodes */}
            <circle cx="150" cy="180" r="3" className="bg-node" />
            <circle cx="450" cy="380" r="4.5" className="bg-node" />
            <circle cx="280" cy="550" r="2.5" className="bg-node" />
            <circle cx="500" cy="220" r="3" className="bg-node" />
          </svg>

          {/* Tailwind-style background patches converted to inline CSS */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
            {/* 1. TOP LEFT */}
            <div style={{ position: 'absolute', top: '-8rem', left: '-8rem', width: '420px', height: '420px', borderRadius: '9999px', filter: 'blur(64px)', opacity: 0.5, background: '#fed7aa' }}></div>
            {/* 2. CENTER LEFT */}
            <div style={{ position: 'absolute', top: '25%', left: '-10rem', width: '380px', height: '380px', borderRadius: '9999px', filter: 'blur(64px)', opacity: 0.45, background: '#ffedd5' }}></div>
            {/* 3. TOP RIGHT */}
            <div style={{ position: 'absolute', top: '-6rem', right: '-8rem', width: '430px', height: '430px', borderRadius: '9999px', filter: 'blur(64px)', opacity: 0.5, background: '#fed7aa' }}></div>
            {/* 4. CENTER RIGHT */}
            <div style={{ position: 'absolute', top: '40%', right: '-11rem', width: '400px', height: '400px', borderRadius: '9999px', filter: 'blur(64px)', opacity: 0.4, background: '#fdba74' }}></div>
            {/* 5. BOTTOM LEFT */}
            <div style={{ position: 'absolute', bottom: '-10rem', left: '-5rem', width: '430px', height: '430px', borderRadius: '9999px', filter: 'blur(64px)', opacity: 0.4, background: '#fed7aa' }}></div>
            {/* 6. BOTTOM RIGHT */}
            <div style={{ position: 'absolute', bottom: '-11rem', right: '-5rem', width: '460px', height: '460px', borderRadius: '9999px', filter: 'blur(64px)', opacity: 0.4, background: '#ffedd5' }}></div>
          </div>

          <div className="login-left-content">

            {/* Top Branding — uses the same logo as the navbar */}
            <div className="login-brand">
              <img src="/logo02.png" alt="AgentTasks" className="brand-logo-img" />
              <span className="brand-name">AgentTasks</span>
            </div>

            <div className="login-pill">
              <span className="pill-icon">+</span>
              AI Powered Learning Platform
            </div>

            {/* Main Headline */}
            <h1 className="login-heading">
              <span className="heading-dark">Build. Prompt.</span>
              <br />
              <span className="heading-orange">Get Evaluated.</span>
            </h1>

            <p className="login-desc">
              Practice with AI agents, solve real-world tasks,
              and get instant evaluation on your prompts
              and solutions.
            </p>

            {/* Feature Checklist */}
            <ul className="login-features">
              <li>
                <span className="feature-check"><FiCheck size={12} /></span>
                Real-world AI agent challenges
              </li>
              <li>
                <span className="feature-check"><FiCheck size={12} /></span>
                Instant AI evaluation & feedback
              </li>
              <li>
                <span className="feature-check"><FiCheck size={12} /></span>
                Improve your skills, track your progress
              </li>
            </ul>

            {/* Handwritten Text */}
            <div className="login-handwritten">
              Better Prompts
              <br />
              Bigger Opportunities
              <div className="handwritten-underline"></div>
            </div>

            {/* FLOATING CARDS */}
            {/* 1. AI Evaluation Card */}

            {/* 2. AI Evaluation Card */}
            <div className="login-eval-card">
              <div className="eval-title">AI Evaluation</div>
              <div className="eval-layout">
                <div className="eval-score-widget">
                  <svg className="eval-ring" viewBox="0 0 80 80">
                    <circle cx="40" cy="40" r="32" className="ring-bg" />
                    <circle cx="40" cy="40" r="32" className="ring-progress" />
                  </svg>
                  <div className="eval-score-text">
                    <span className="score-num">92%</span>
                    <span className="score-label">Score</span>
                  </div>
                </div>
                <ul className="eval-checklist">
                  <li><span className="eval-check-icon"><FiCheck size={10} /></span> Logic & Accuracy</li>
                  <li><span className="eval-check-icon"><FiCheck size={10} /></span> Code Quality</li>
                  <li><span className="eval-check-icon"><FiCheck size={10} /></span> Problem Solving</li>
                  <li><span className="eval-check-icon"><FiCheck size={10} /></span> Efficiency</li>
                </ul>
              </div>
            </div>

          </div>
        </div>

        {/* ==================================================
            RIGHT PANEL - LOGIN FORM
            ================================================== */}
        <div className="login-right-panel">
          <div className="login-form-content">

            <div className="secure-badge">
              <FiShield size={14} />
              Secure Access
            </div>

            <h2 className="login-title">
              Welcome <span className="title-orange">back!</span>
            </h2>
            <p className="login-subtitle">
              Sign in to continue your journey with AgentTasks.
            </p>

            {error && (
              <div className="login-error">
                <FiAlertCircle size={18} /> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="login-form">
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
                    placeholder="Enter your password"
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

              <div className="form-options">
                <label className="remember-me">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>Remember me</span>
                </label>
                <a href="#" className="forgot-pw">Forgot password?</a>
              </div>

              <button type="submit" className="login-submit-btn" disabled={loading}>
                {loading ? 'Logging in...' : 'Log In'}
                {!loading && <FiArrowRight size={18} />}
              </button>
            </form>

            <div className="login-redirect">
              Don't have an account? <Link to="/signup">Sign up</Link>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
