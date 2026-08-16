import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCheckCircle, FiSun, FiRefreshCw, FiArrowRight, FiXCircle, FiTrendingUp } from 'react-icons/fi';
import './EvaluationCard.css';

export default function EvaluationCard({ evaluation, questionId, onTryAgain }) {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useState(() => {
    const timer = setTimeout(() => setLoading(false), 2200);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="eval-card loading premium-card" id="eval-loading">
        <div className="eval-loader">
          <div className="premium-spinner" />
          <p className="loader-text">Analyzing agent output...</p>
          <div className="premium-loader-bar">
            <div className="premium-loader-fill" />
          </div>
        </div>
      </div>
    );
  }

  const { score, visualMatch, codeOptimization, promptEfficiency, feedback } = evaluation;

  return (
    <div className="eval-card premium-card animate-slide-up" id="evaluation-card">
      
      <div className="premium-eval-header">
        <h3 className="premium-title">Evaluation Complete</h3>
        <span className="premium-subtitle">Here's how your agent orchestration performed</span>
      </div>

      <div className="premium-eval-grid">
        {/* Left: Overall Score */}
        <div className="premium-score-section">
          <div className="premium-score-circle-wrapper">
            <svg viewBox="0 0 110 110" className="premium-score-svg">
              <circle cx="55" cy="55" r="48" className="premium-score-track" />
              <circle
                cx="55" cy="55" r="48"
                className="premium-score-fill"
                style={{ strokeDasharray: `${(score / 100) * 301} 301` }}
              />
            </svg>
            <div className="premium-score-content">
              <span className="premium-score-num">{score}</span>
              <span className="premium-score-total">/100</span>
            </div>
          </div>
          <div className="premium-score-label">Overall Mastery</div>
        </div>

        {/* Right: Breakdown Metrics */}
        <div className="premium-breakdown-section">
          <div className="premium-metric">
            <div className="premium-metric-info">
              <span className="premium-metric-name">Visual Match</span>
              <span className="premium-metric-val">{visualMatch}%</span>
            </div>
            <div className="premium-metric-bar">
              <div className="premium-metric-fill metric-1" style={{ width: `${visualMatch}%` }} />
            </div>
          </div>
          
          <div className="premium-metric">
            <div className="premium-metric-info">
              <span className="premium-metric-name">Code Optimization</span>
              <span className="premium-metric-val">{codeOptimization}%</span>
            </div>
            <div className="premium-metric-bar">
              <div className="premium-metric-fill metric-2" style={{ width: `${codeOptimization}%` }} />
            </div>
          </div>

          <div className="premium-metric">
            <div className="premium-metric-info">
              <span className="premium-metric-name">Prompt Efficiency</span>
              <span className="premium-metric-val">{promptEfficiency}%</span>
            </div>
            <div className="premium-metric-bar">
              <div className="premium-metric-fill metric-3" style={{ width: `${promptEfficiency}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Visual Diff Section */}
      <div className="premium-diff-section">
        <div className="premium-diff-box">
          <div className="premium-diff-header">
            <span className="diff-title">Reference Target</span>
          </div>
          <div className="premium-diff-window reference">
            <div className="diff-mock-ui">
              <div className="mock-nav" />
              <div className="mock-hero" />
            </div>
          </div>
        </div>
        
        <div className="premium-diff-divider">
          <div className="divider-line" />
          <div className="divider-badge">VS</div>
          <div className="divider-line" />
        </div>

        <div className="premium-diff-box">
          <div className="premium-diff-header">
            <span className="diff-title">Agent Output</span>
            {visualMatch > 80 ? (
              <span className="diff-status success"><FiCheckCircle size={12}/> Match</span>
            ) : (
              <span className="diff-status warning"><FiXCircle size={12}/> Differs</span>
            )}
          </div>
          <div className="premium-diff-window generated">
            <div className="diff-mock-ui generated-ui">
              <div className="mock-nav" />
              <div className="mock-hero alt" />
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Section */}
      <div className="premium-feedback-box">
        <div className="feedback-icon-wrapper">
          <FiTrendingUp className="feedback-icon" size={20} />
        </div>
        <div className="feedback-content">
          <h4>AI Coach Feedback</h4>
          <p>{feedback}</p>
        </div>
      </div>

      <div className="premium-actions">
        <button className="premium-btn outline" onClick={onTryAgain}>
          <FiRefreshCw size={14} /> Try Again
        </button>
        <button className="premium-btn solid" onClick={() => navigate(`/questions/${Math.min(questionId + 1, 8)}`)}>
          Next Challenge <FiArrowRight size={14} />
        </button>
      </div>

    </div>
  );
}
