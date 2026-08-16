import { Link } from 'react-router-dom';
import {
  FiEye, FiCheckSquare, FiMessageCircle, FiStar,
  FiChevronRight, FiChevronDown, FiList
} from 'react-icons/fi';
import { BsChatSquareText } from 'react-icons/bs';
import { BiNetworkChart } from 'react-icons/bi';
import userProfile from '../data/userProfile';
import './ProfilePage.css';

// SVG Circular Progress Component
const CircularProgress = ({ solved, total }) => {
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (solved / total) * circumference;

  return (
    <div className="lc-progress-wrapper">
      <svg className="lc-progress-svg" viewBox="0 0 130 130">
        <circle
          cx="65" cy="65" r={radius}
          className="lc-progress-bg"
        />
        <circle
          cx="65" cy="65" r={radius}
          className="lc-progress-fill"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
        />
      </svg>
      <div className="lc-progress-text">
        <span className="lc-solved-num">{solved}</span>
        <span className="lc-total-num">/{total}</span>
        <span className="lc-solved-label">✓ Solved</span>
      </div>
    </div>
  );
};

// Heatmap Component
const Heatmap = () => {
  // Generate fake heatmap data for 52 weeks (approx 1 year) x 7 days
  const weeks = 52;
  const days = 7;
  const grid = [];
  
  for (let w = 0; w < weeks; w++) {
    const col = [];
    for (let d = 0; d < days; d++) {
      // Randomly assign activity level (0-4)
      const level = Math.random() > 0.7 ? Math.floor(Math.random() * 4) + 1 : 0;
      col.push(level);
    }
    grid.push(col);
  }

  const months = ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];

  return (
    <div className="lc-heatmap-container">
      <div className="lc-heatmap-scroll">
        <div className="lc-heatmap-grid">
          {grid.map((col, wIdx) => (
            <div key={wIdx} className="lc-heatmap-col">
              {col.map((level, dIdx) => (
                <div key={dIdx} className={`lc-heatmap-cell level-${level}`} />
              ))}
            </div>
          ))}
        </div>
        <div className="lc-heatmap-months">
          {months.map((m, i) => (
            <span key={i}>{m}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function ProfilePage() {
  const p = userProfile;

  return (
    <div className="lc-profile-wrapper" id="profile-page">
      <div className="lc-profile-container">
        
        {/* LEFT SIDEBAR */}
        <div className="lc-sidebar">
          <div className="lc-avatar-section">
            <img src={p.avatar} alt="Avatar" className="lc-avatar-img" />
            <div className="lc-user-names">
              <h1 className="lc-display-name">{p.displayName} <span className="lc-badge-dot" /></h1>
              <span className="lc-school">{p.school}</span>
            </div>
          </div>
          
          <div className="lc-rank-section">
            <span className="lc-label">Rank</span>
            <span className="lc-rank-value">{p.rank}</span>
          </div>
          
          <div className="lc-follow-section">
            <span><b>{p.following}</b> Following</span>
            <span><b>{p.followers}</b> Followers</span>
          </div>
          
          <button className="btn-outline" style={{ width: '100%', marginBottom: '16px' }}>Edit Profile</button>
          
          <div className="lc-community-stats">
            <h3 className="lc-sidebar-title">Community Stats</h3>
            <div className="lc-stat-row">
              <span className="lc-stat-label"><FiEye size={14} className="icon-blue" /> Views</span>
              <span className="lc-stat-val">{p.communityStats.views}</span>
            </div>
            <div className="lc-stat-sub">Last week 0</div>
            
            <div className="lc-stat-row">
              <span className="lc-stat-label"><FiCheckSquare size={14} className="icon-cyan" /> Solution</span>
              <span className="lc-stat-val">{p.communityStats.solution}</span>
            </div>
            <div className="lc-stat-sub">Last week 0</div>
            
            <div className="lc-stat-row">
              <span className="lc-stat-label"><FiMessageCircle size={14} className="icon-green" /> Discuss</span>
              <span className="lc-stat-val">{p.communityStats.discuss}</span>
            </div>
            <div className="lc-stat-sub">Last week 0</div>
            
            <div className="lc-stat-row">
              <span className="lc-stat-label"><FiStar size={14} className="icon-orange" /> Reputation</span>
              <span className="lc-stat-val">{p.communityStats.reputation}</span>
            </div>
            <div className="lc-stat-sub">Last week 0</div>
          </div>
        </div>

        {/* RIGHT MAIN CONTENT */}
        <div className="lc-main-content">
          
          {/* Top Row: Progress and Badges */}
          <div className="lc-top-row">
            <div className="lc-card lc-progress-card">
              <div className="lc-progress-left">
                <CircularProgress solved={p.stats.questionsSolved} total={p.stats.totalQuestions} />
                <div className="lc-attempting-text">
                  <span className="dot-cyan" /> {p.stats.attempting} Attempting
                </div>
              </div>
              <div className="lc-progress-right">
                <div className="lc-diff-row">
                  <div className="lc-diff-label easy">Easy</div>
                  <div className="lc-diff-val">{p.stats.easy.solved}<span className="lc-diff-total">/{p.stats.easy.total}</span></div>
                </div>
                <div className="lc-diff-row">
                  <div className="lc-diff-label med">Med.</div>
                  <div className="lc-diff-val">{p.stats.medium.solved}<span className="lc-diff-total">/{p.stats.medium.total}</span></div>
                </div>
                <div className="lc-diff-row">
                  <div className="lc-diff-label hard">Hard</div>
                  <div className="lc-diff-val">{p.stats.hard.solved}<span className="lc-diff-total">/{p.stats.hard.total}</span></div>
                </div>
              </div>
            </div>
            
            <div className="lc-card lc-badges-card">
              <div className="lc-badges-header">
                <span className="lc-badges-title">Badges</span>
                <FiChevronRight size={18} className="lc-icon-arrow" />
              </div>
              <div className="lc-badges-count">{p.badges.length}</div>
              
              <div className="lc-badge-showcase">
                <div className="lc-badge-hex">
                  <span>50</span>
                  <div className="lc-badge-bg-shape"></div>
                </div>
                <div className="lc-badge-info">
                  <div className="lc-badge-subtitle">Most Recent Badge</div>
                  <div className="lc-badge-name">{p.badges[0].name}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Middle Row: Heatmap */}
          <div className="lc-card lc-heatmap-card">
            <div className="lc-heatmap-header">
              <div className="lc-heatmap-title">
                <b>{p.submissions.total}</b> submissions in the past one year
              </div>
              <div className="lc-heatmap-stats">
                <span>Total active days: {p.submissions.activeDays}</span>
                <span>Max streak: {p.submissions.maxStreak}</span>
                <button className="lc-dropdown-btn">Current <FiChevronDown size={14} /></button>
              </div>
            </div>
            <Heatmap />
          </div>

          {/* Bottom Row: Orchestration History */}
          <div className="lc-card history-card">
            <div className="history-header">
              <h3 className="history-title"><BiNetworkChart size={18} className="icon-orange" /> Recent Orchestrations</h3>
              <a href="#" className="lc-view-all">View full history</a>
            </div>
            <div className="history-list">
              {p.recentActivity.map((a, i) => (
                <Link to={`/questions/${a.questionId}`} key={i} className="history-item">
                  <div className="history-item-left">
                    <div className="history-item-title">{a.title}</div>
                    <div className="history-item-badges">
                      <span className={`history-badge diff-${a.difficulty.toLowerCase()}`}>{a.difficulty}</span>
                      <span className="history-badge score-badge">Score: {a.score}</span>
                    </div>
                  </div>
                  <div className="history-item-right">
                    <span className="history-date">{a.date}</span>
                    <FiChevronRight className="history-arrow" size={18} />
                  </div>
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
