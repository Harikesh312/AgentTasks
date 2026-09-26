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
      const data = await res.json();

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
      setError(err.message);
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
            {/* 1. Code Card */}
            <div className="login-code-card">
              <div className="code-card-top">
                <div className="mac-dots">
                  <span style={{ background: '#FF5F56' }}></span>
                  <span style={{ background: '#FFBD2E' }}></span>
                  <span style={{ background: '#27C93F' }}></span>
                </div>
                <svg className="code-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="16 18 22 12 16 6"></polyline>
                  <polyline points="8 6 2 12 8 18"></polyline>
                </svg>
              </div>
              <div className="code-card-body">
                <span className="code-comment"># Build your agent</span>
                <div>
                  <span className="code-keyword">def</span>{' '}
                  <span className="code-func">solve</span>(task):
                </div>
                <div style={{ paddingLeft: '16px' }}>
                  <span className="code-keyword">return</span>{' '}
                  <span className="code-call">ai_agent</span>(task)
                </div>
              </div>
            </div>

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

            <div className="login-divider">
              <span>OR CONTINUE WITH</span>
            </div>

            <div className="social-row">
              <a href="https://www.google.com/" className="social-btn">
                <svg width="18" height="18" viewBox="0 0 18 18"><path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" /><path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853" /><path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" /><path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" /></svg>
                Continue with Google
              </a>
              <a href="https://github.com/" className="social-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#24292e"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" /></svg>
                Continue with GitHub
              </a>
            </div>

            <div className="login-redirect">
              Don't have an account? <Link to="/signup">Sign up</Link>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
