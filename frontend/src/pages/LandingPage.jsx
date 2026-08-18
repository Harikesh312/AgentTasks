import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiCpu, FiFileText, FiBarChart2, FiArrowRight, FiTarget, FiUsers } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import './LandingPage.css';

export default function LandingPage() {
  const { isLoggedIn } = useAuth();
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
          }
        });
      },
      { threshold: 0.2 }
    );

    const elements = document.querySelectorAll('.animate-on-scroll');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

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
            {isLoggedIn ? (
              <Link to="/profile" className="btn-outline btn-lg">
                View Profile
              </Link>
            ) : (
              <Link to="/login" className="btn-outline btn-lg">
                Log In
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="landing-stats-section animate-on-scroll fade-up">
        <div className="stats-container">
          <div className="stat-item">
            <div className="stat-icon-wrapper"><FiFileText className="stat-icon" /></div>
            <div className="stat-content">
              <span className="stat-number">50+</span>
              <span className="stat-label">Questions</span>
              <span className="stat-sublabel">Practice tasks</span>
            </div>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <div className="stat-icon-wrapper"><FiTarget className="stat-icon" /></div>
            <div className="stat-content">
              <span className="stat-number">82%</span>
              <span className="stat-label">Avg. Score</span>
            </div>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <div className="stat-icon-wrapper"><FiUsers className="stat-icon" /></div>
            <div className="stat-content">
              <span className="stat-number">1.2K</span>
              <span className="stat-label">Active Learners</span>
            </div>
          </div>
        </div>
      </section>

      <section className="how-it-works-section animate-on-scroll">
        <div className="hiw-header">
          <h2 className="section-title">How It Works</h2>
          <p className="hiw-subtitle">From your first prompt to a detailed evaluation — see how AgentPrep turns ideas into results.</p>
        </div>

        <div className="timeline-container">
          <div className="timeline-track">
            <div className="timeline-line-bg"></div>
            <div className="timeline-line-progress"></div>
            <div className="timeline-nodes">
              <div className="timeline-node active" style={{ transitionDelay: '0.1s' }}>01</div>
              <div className="timeline-node active" style={{ transitionDelay: '0.4s' }}>02</div>
              <div className="timeline-node active" style={{ transitionDelay: '0.7s' }}>03</div>
            </div>
          </div>

          <div className="timeline-steps">
            <div className="timeline-step" style={{ transitionDelay: '0.2s' }}>
              <div className="step-icon-wrapper"><FiFileText size={24} /></div>
              <h3 className="step-title">Read the Prompt</h3>
              <p className="step-desc">Get a design task with a reference image and requirements. No coding needed — just prompt writing.</p>
            </div>
            
            <div className="timeline-step" style={{ transitionDelay: '0.5s' }}>
              <div className="step-icon-wrapper"><FiCpu size={24} /></div>
              <h3 className="step-title">Guide the Agent</h3>
              <p className="step-desc">Write prompts to instruct an AI agent. Watch it generate code in real-time. Fix mistakes with follow-ups.</p>
            </div>
            
            <div className="timeline-step" style={{ transitionDelay: '0.8s' }}>
              <div className="step-icon-wrapper"><FiBarChart2 size={24} /></div>
              <h3 className="step-title">Get Scored</h3>
              <p className="step-desc">Receive a detailed evaluation covering visual accuracy, code quality, and prompt efficiency.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section animate-on-scroll fade-up">
        <div className="cta-card">
          <h2>Ready to test your prompting skills?</h2>
          <p>Join thousands of developers mastering AI agent orchestration.</p>
          {isLoggedIn ? (
            <Link to="/questions" className="btn-primary btn-lg">Get Started <FiArrowRight size={16} /></Link>
          ) : (
            <Link to="/signup" className="btn-primary btn-lg">Sign Up Free <FiArrowRight size={16} /></Link>
          )}
        </div>
      </section>
    </div>
  );
}
