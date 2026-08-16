import { Link } from 'react-router-dom';
import { FiCpu, FiFileText, FiBarChart2, FiArrowRight } from 'react-icons/fi';
import './LandingPage.css';

export default function LandingPage() {
  return (
    <div className="landing-page" id="landing-page">
      <section className="hero">
        <div className="hero-bg-shapes">
          <div className="shape shape-1" />
          <div className="shape shape-2" />
          <div className="shape shape-3" />
        </div>
        <div className="hero-content animate-slide">
          <div className="hero-badge"><FiCpu size={16} /> AI Agent Interview Prep</div>
          <h1 className="hero-title">
            Practice AI Agent Interviews.
            <br />
            <span className="hero-highlight">Prompt Better.</span> Get Hired.
          </h1>
          <p className="hero-sub">
            Master the art of AI agent orchestration. Write prompts — not code — to guide
            AI agents in building real UIs. Get scored on prompt quality, efficiency,
            and optimization skills.
          </p>
          <div className="hero-actions">
            <Link to="/questions" className="btn-primary btn-lg">
              Browse Questions <FiArrowRight size={16} />
            </Link>
            <Link to="/profile" className="btn-outline btn-lg">
              View Demo Profile
            </Link>
          </div>
        </div>
      </section>

      <section className="stats-row animate-fade">
        <div className="stat-block">
          <span className="stat-number">50+</span>
          <span className="stat-text">Questions</span>
        </div>
        <div className="stat-divider" />
        <div className="stat-block">
          <span className="stat-number">82%</span>
          <span className="stat-text">Avg. Score</span>
        </div>
        <div className="stat-divider" />
        <div className="stat-block">
          <span className="stat-number">1.2K</span>
          <span className="stat-text">Active Learners</span>
        </div>
      </section>

      <section className="features-section">
        <h2 className="section-title">How It Works</h2>
        <div className="features-grid">
          <div className="feature-card animate-fade" style={{ animationDelay: '0.1s' }}>
            <div className="feature-icon"><FiFileText size={36} /></div>
            <h3>Read the Prompt</h3>
            <p>Get a design task with a reference image and requirements. No coding needed — just prompt writing.</p>
          </div>
          <div className="feature-card animate-fade" style={{ animationDelay: '0.2s' }}>
            <div className="feature-icon"><FiCpu size={36} /></div>
            <h3>Guide the Agent</h3>
            <p>Write prompts to instruct an AI agent. Watch it generate code in real-time. Fix mistakes with follow-ups.</p>
          </div>
          <div className="feature-card animate-fade" style={{ animationDelay: '0.3s' }}>
            <div className="feature-icon"><FiBarChart2 size={36} /></div>
            <h3>Get Scored</h3>
            <p>Receive a detailed evaluation: visual accuracy, code quality, and prompt efficiency — all in one score.</p>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-card animate-fade">
          <h2>Ready to test your prompting skills?</h2>
          <p>Join thousands of developers mastering AI agent orchestration.</p>
          <Link to="/questions" className="btn-primary btn-lg">Get Started Free <FiArrowRight size={16} /></Link>
        </div>
      </section>
    </div>
  );
}
