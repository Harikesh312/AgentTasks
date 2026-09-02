import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiCpu, FiFileText, FiBarChart2, FiArrowRight, FiTarget,
  FiUsers, FiImage, FiCode, FiMonitor
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import './LandingPage.css';

/* ─── Constants ─── */

const GENERATED_PREVIEW_HTML = `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#1a1a2e,#2d2d44);font-family:Inter,system-ui,sans-serif;padding:24px"><div style="text-align:center;max-width:420px"><h1 style="font-size:clamp(1.2rem,3vw,2rem);margin-bottom:8px;background:linear-gradient(90deg,#ff6b35,#ffb088);-webkit-background-clip:text;-webkit-text-fill-color:transparent;font-weight:800;line-height:1.2">Build the Future Faster</h1><p style="color:#94a3b8;font-size:clamp(0.7rem,1.5vw,0.9rem);margin-bottom:16px;line-height:1.5">Ship your product in days, not months. The most powerful SaaS boilerplate.</p><button style="background:#ff6b35;color:white;border:none;padding:8px 24px;border-radius:6px;font-size:clamp(0.7rem,1.2vw,0.85rem);font-weight:600;cursor:pointer">Get Started</button></div></div>`;

const TIMELINE_STEPS = [
  {
    icon: FiFileText,
    accent: 'accent-orange',
    title: 'Read the Prompt',
    desc: 'Get a design task with a reference image. Understand the requirements and plan your prompting strategy.',
  },
  {
    icon: FiCpu,
    accent: 'accent-purple',
    title: 'Guide the Agent',
    desc: 'Write natural language prompts to instruct the AI agent. Watch it generate real HTML, CSS and JavaScript in real-time.',
  },
  {
    icon: FiMonitor,
    accent: 'accent-blue',
    title: 'Preview & Iterate',
    desc: 'See the live output instantly in the preview pane. Test responsive layouts and refine with follow-up prompts.',
  },
  {
    icon: FiBarChart2,
    accent: 'accent-green',
    title: 'Get Evaluated',
    desc: 'Receive a detailed evaluation covering visual accuracy, requirement coverage, code quality and prompt efficiency.',
  },
];

const SCORE = 86;
const RADIUS = 54;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function LandingPage() {
  const { isLoggedIn } = useAuth();
  const howItWorksRef = useRef(null);
  const scoreRef = useRef(null);

  const [activeTimelineIndex, setActiveTimelineIndex] = useState(-1);
  const [scoreInView, setScoreInView] = useState(false);
  const [displayScore, setDisplayScore] = useState(0);

  /* 1. General scroll-reveal (fade-up sections) */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
          }
        });
      },
      { threshold: 0.15 }
    );
    const elements = document.querySelectorAll('.animate-on-scroll');
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  /* 2. Timeline item observers — progressive activation */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = parseInt(entry.target.dataset.index, 10);
            entry.target.classList.add('active');
            setActiveTimelineIndex((prev) => Math.max(prev, idx));
          }
        });
      },
      { threshold: 0.3, rootMargin: '0px 0px -60px 0px' }
    );
    const items = document.querySelectorAll('.vt-item');
    items.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  /* 3. Score ring observer */
  useEffect(() => {
    const el = scoreRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setScoreInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  /* 4. Animated counter */
  useEffect(() => {
    if (!scoreInView) return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setDisplayScore(SCORE);
      return;
    }
    const duration = 1400;
    const startTime = performance.now();
    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(eased * SCORE));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [scoreInView]);

  /* Scroll to How It Works */
  const scrollToHowItWorks = (e) => {
    e.preventDefault();
    howItWorksRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  /* Timeline progress height */
  const progressPercent =
    activeTimelineIndex >= 0
      ? ((activeTimelineIndex + 1) / TIMELINE_STEPS.length) * 100
      : 0;

  /* Score ring offset */
  const strokeDashoffset = scoreInView
    ? CIRCUMFERENCE * (1 - SCORE / 100)
    : CIRCUMFERENCE;

  return (
    <div className="landing-page" id="landing-page">

      {/* ═══ 1. HERO ═══ */}
      <section className="hero">
        <div className="hero-bg-shapes">
          <div className="shape shape-1" />
          <div className="shape shape-2" />
          <div className="shape shape-3" />
        </div>
        <div className="hero-content animate-slide">
          <div className="hero-badge">
            <FiCpu size={16} />
            AI Agent Interview Prep
          </div>
          <h1 className="hero-title">
            Build Better. <span className="hero-highlight">Prompt Smarter.</span>
            <br />
            Get Evaluated.
          </h1>
          <p className="hero-sub">
            Turn design ideas into working code with an AI agent, then evaluate
            how closely the result matches the target.
          </p>
          <div className="hero-actions">
            <Link to="/questions" className="btn-primary btn-lg">
              Start Building <FiArrowRight size={18} />
            </Link>
            <a
              href="#how-it-works"
              className="btn-outline btn-lg"
              onClick={scrollToHowItWorks}
            >
              See How It Works
            </a>
          </div>
        </div>
      </section>

      {/* ═══ 2. STATS ═══ */}
      <section className="landing-stats-section animate-on-scroll fade-up">
        <div className="stats-container">
          <div className="stat-item">
            <div className="stat-icon-wrapper icon-orange">
              <FiFileText size={32} />
            </div>
            <div className="stat-content">
              <span className="stat-number">50+</span>
              <span className="stat-label">Questions</span>
              <span className="stat-sublabel">Practice tasks</span>
            </div>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <div className="stat-icon-wrapper icon-purple">
              <FiTarget size={32} />
            </div>
            <div className="stat-content">
              <span className="stat-number">82%</span>
              <span className="stat-label">Avg. Score</span>
              <span className="stat-sublabel">Community average</span>
            </div>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <div className="stat-icon-wrapper icon-green">
              <FiUsers size={32} />
            </div>
            <div className="stat-content">
              <span className="stat-number">1.2K</span>
              <span className="stat-label">Active Learners</span>
              <span className="stat-sublabel">And growing</span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 3. HOW IT WORKS — Vertical Timeline ═══ */}
      <section
        className="how-it-works-section"
        id="how-it-works"
        ref={howItWorksRef}
      >
        <div className="section-header animate-on-scroll fade-up">
          <div className="section-tag">Workflow</div>
          <h2 className="section-title">How It Works</h2>
          <p className="section-subtitle">
            From your first prompt to a detailed evaluation — see how AgentPrep
            turns ideas into results.
          </p>
        </div>

        <div className="vertical-timeline">
          <div className="vt-line-bg" />
          <div
            className="vt-line-progress"
            style={{ height: `${progressPercent}%` }}
          />

          {TIMELINE_STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <div className="vt-item" data-index={i} key={step.title}>
                <div className="vt-dot" />
                <div className="vt-card">
                  <div className={`vt-card-icon ${step.accent}`}>
                    <Icon size={20} />
                  </div>
                  <div className="vt-card-step">Step {String(i + 1).padStart(2, '0')}</div>
                  <h3 className="vt-card-title">{step.title}</h3>
                  <p className="vt-card-desc">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ═══ 4. COMPARISON ═══ */}
      <section className="comparison-section animate-on-scroll fade-up">
        <div className="section-header">
          <div className="section-tag">Compare</div>
          <h2 className="section-title">See the Difference</h2>
          <p className="section-subtitle">
            Compare the target design with the AI-generated result side by side.
          </p>
        </div>

        <div className="comparison-grid">
          {/* Reference */}
          <div className="comparison-panel panel-reference">
            <div className="comparison-panel-header">
              <FiImage size={20} />
              Reference Design
            </div>
            <div className="comparison-image-container">
              <img
                src="/images/references/q1_hero.svg"
                alt="Reference design — Hero section wireframe"
                loading="lazy"
              />
            </div>
          </div>

          {/* VS */}
          <div className="vs-badge-column">
            <div className="vs-badge">VS</div>
          </div>

          {/* Generated */}
          <div className="comparison-panel panel-generated">
            <div className="comparison-panel-header">
              <FiCode size={20} />
              AI Generated Output
            </div>
            <div className="comparison-preview-container">
              <div dangerouslySetInnerHTML={{ __html: GENERATED_PREVIEW_HTML }} />
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 5. OVERALL MATCH ═══ */}
      <section className="match-section" ref={scoreRef}>
        <div className="match-card">
          <div className="match-label">Overall Match</div>

          <div className="score-ring-container">
            <svg className="score-ring-svg" viewBox="0 0 120 120">
              <circle
                className="score-ring-bg"
                cx="60"
                cy="60"
                r={RADIUS}
              />
              <circle
                className="score-ring-progress"
                cx="60"
                cy="60"
                r={RADIUS}
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={strokeDashoffset}
              />
            </svg>
            <div className="score-ring-value">
              {displayScore}<span>%</span>
            </div>
          </div>

          <div className="match-metrics">
            <div className="match-metric">
              <div className="match-metric-value">92%</div>
              <div className="match-metric-label">Visual Accuracy</div>
            </div>
            <div className="match-metric">
              <div className="match-metric-value">88%</div>
              <div className="match-metric-label">Code Quality</div>
            </div>
            <div className="match-metric">
              <div className="match-metric-value">78%</div>
              <div className="match-metric-label">Prompt Efficiency</div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 6. CTA ═══ */}
      <section className="cta-section animate-on-scroll fade-up">
        <div className="cta-card">
          <h2>Ready to Build Your Next Solution?</h2>
          <p>Start with a prompt. Guide the agent. See the result.</p>
          {isLoggedIn ? (
            <Link to="/questions" className="btn-primary btn-lg">
              Start Building <FiArrowRight size={18} />
            </Link>
          ) : (
            <Link to="/signup" className="btn-primary btn-lg">
              Start Building <FiArrowRight size={18} />
            </Link>
          )}
        </div>
      </section>

      {/* ═══ 7. FOOTER ═══ */}
      <footer className="landing-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="footer-brand-name">
              <img src="/logo02.png" alt="Logo" style={{ width: '20px', height: '20px' }} />
              AgentPrep
            </div>
            <p className="footer-brand-desc">
              Practice AI agent orchestration. Write prompts, guide agents, and
              get evaluated on real design tasks.
            </p>
          </div>

          <div className="footer-col">
            <div className="footer-col-title">Product</div>
            <ul className="footer-links">
              <li><Link to="/questions" className="footer-link">Prompt Chat</Link></li>
              <li><Link to="/questions" className="footer-link">Files</Link></li>
              <li><Link to="/questions" className="footer-link">Preview</Link></li>
              <li><Link to="/questions" className="footer-link">Evaluation</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <div className="footer-col-title">Resources</div>
            <ul className="footer-links">
              <li>
                <a href="#how-it-works" className="footer-link" onClick={scrollToHowItWorks}>
                  How It Works
                </a>
              </li>
              <li><Link to="/discuss" className="footer-link">Discuss</Link></li>
              <li><Link to="/profile" className="footer-link">Profile</Link></li>
              <li><Link to="/contest" className="footer-link">Contest</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span className="footer-copy">© {new Date().getFullYear()} AgentPrep. All rights reserved.</span>
          <div className="footer-bottom-links">
            <a href="#" className="footer-bottom-link">Privacy</a>
            <a href="#" className="footer-bottom-link">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
