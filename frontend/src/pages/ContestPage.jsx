import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  FiCalendar,
  FiClock,
  FiUsers,
  FiZap,
  FiArrowRight,
  FiSearch,
  FiX,
  FiAward,
  FiBarChart2,
  FiChevronRight,
  FiLayers,
} from 'react-icons/fi';
import { IoTrophyOutline } from 'react-icons/io5';
import {
  contests as upcomingContests,
  liveContest as liveContestData,
  pastContests as pastContestsData,
  leaderboard as leaderboardData,
  badges as badgesData,
  userStats,
  ratingHistory,
} from '../data/contests';
import './ContestPage.css';

/* ─── Countdown hook ─── */
function useCountdown(targetDate) {
  const calcTimeLeft = useCallback(() => {
    const diff = new Date(targetDate).getTime() - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
    return {
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000) / 60000),
      seconds: Math.floor((diff % 60000) / 1000),
      expired: false,
    };
  }, [targetDate]);

  const [timeLeft, setTimeLeft] = useState(calcTimeLeft);

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(calcTimeLeft()), 1000);
    return () => clearInterval(id);
  }, [calcTimeLeft]);

  return timeLeft;
}

/* ─── Remaining time for live contest ─── */
function useLiveCountdown(remainingMs) {
  const [left, setLeft] = useState(remainingMs);

  useEffect(() => {
    if (left <= 0) return;
    const id = setInterval(() => setLeft((l) => Math.max(l - 1000, 0)), 1000);
    return () => clearInterval(id);
  }, [left]);

  const m = Math.floor(left / 60000);
  const s = Math.floor((left % 60000) / 1000);
  return `${m}m ${s}s remaining`;
}

/* ─── Format date helper ─── */
function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return 'TBD';
  }
}

/* ─── Categories ─── */
const CATEGORIES = ['All', 'Weekly', 'Biweekly', 'Monthly', 'Beginner', 'Advanced', 'Completed'];

/* ─────────────────────────────────────────── */
/*  ContestPage                                */
/* ─────────────────────────────────────────── */
export default function ContestPage() {
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  const [detailContest, setDetailContest] = useState(null);

  // Combine all contests for filtering
  const allContests = useMemo(() => {
    const live = liveContestData ? [liveContestData] : [];
    const upcoming = Array.isArray(upcomingContests) ? upcomingContests : [];
    const past = Array.isArray(pastContestsData) ? pastContestsData : [];
    return [...live, ...upcoming, ...past];
  }, []);

  // Filtered contests
  const filtered = useMemo(() => {
    let list = allContests;

    if (activeTab === 'Completed') {
      list = list.filter((c) => c.status === 'completed');
    } else if (activeTab !== 'All') {
      list = list.filter((c) => c.type === activeTab && c.status !== 'completed');
    } else {
      list = list.filter((c) => c.status !== 'completed');
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((c) => (c.name || '').toLowerCase().includes(q));
    }

    return list;
  }, [allContests, activeTab, search]);

  // Next upcoming contest (first upcoming sorted by date)
  const nextContest = useMemo(() => {
    const upcoming = (Array.isArray(upcomingContests) ? upcomingContests : [])
      .filter((c) => c.status === 'upcoming')
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    return upcoming[0] || null;
  }, []);

  // Scroll to sections
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="contest-page" id="contest-page">
      {/* ─── Hero ─── */}
      <section className="contest-hero">
        <div className="contest-hero-shapes">
          <div className="shape shape-1" />
          <div className="shape shape-2" />
          <div className="shape shape-3" />
        </div>
        <div className="contest-hero-inner animate-slide">
          <div className="contest-hero-text">
            <div className="contest-badge">
              <IoTrophyOutline size={16} /> Coding Contests
            </div>
            <h1 className="contest-hero-title">
              Weekly Coding <span className="highlight">Contests</span>
            </h1>
            <p className="contest-hero-sub">
              Compete. Solve. Improve. Earn your place on the leaderboard.
              Test your AI agent prompting skills against the community.
            </p>
            <div className="contest-hero-actions">
              <button className="btn-primary btn-lg" onClick={() => scrollTo('upcoming-section')}>
                View Upcoming Contests <FiArrowRight size={16} />
              </button>
              <button className="btn-outline btn-lg" onClick={() => scrollTo('leaderboard-section')}>
                View Leaderboard
              </button>
            </div>
          </div>
          <div className="contest-hero-visual">
            <img
              src="/contest-hero.jpg"
              alt="Coding contest illustration"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>
        </div>
      </section>

      {/* ─── Next Contest Countdown ─── */}
      {nextContest && <NextContestCard contest={nextContest} onViewDetails={setDetailContest} />}

      {/* ─── Live Now ─── */}
      {liveContestData && liveContestData.status === 'live' && (
        <LiveSection contest={liveContestData} onViewDetails={setDetailContest} />
      )}

      {/* ─── Stats ─── */}
      <section className="stats-section animate-fade" id="stats-section">
        <h2 className="section-heading">Contest Statistics</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-card-value">{userStats.rating}</span>
            <span className="stat-card-label">Contest Rating</span>
          </div>
          <div className="stat-card">
            <span className="stat-card-value">#{userStats.globalRank.toLocaleString()}</span>
            <span className="stat-card-label">Global Rank</span>
          </div>
          <div className="stat-card">
            <span className="stat-card-value">{userStats.totalContests}</span>
            <span className="stat-card-label">Contests</span>
          </div>
          <div className="stat-card">
            <span className="stat-card-value">{userStats.problemsSolved}</span>
            <span className="stat-card-label">Problems Solved</span>
          </div>
          <div className="stat-card">
            <span className="stat-card-value">#{userStats.bestRank}</span>
            <span className="stat-card-label">Best Rank</span>
          </div>
          <div className="stat-card">
            <span className="stat-card-value">{userStats.badgesEarned}</span>
            <span className="stat-card-label">Badges</span>
          </div>
        </div>
      </section>

      {/* ─── Filters & Search ─── */}
      <section id="upcoming-section">
        <h2 className="section-heading">Upcoming Contests</h2>
        <div className="contest-controls">
          <div className="contest-tabs">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`contest-tab ${activeTab === cat ? 'active' : ''}`}
                onClick={() => setActiveTab(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="contest-search">
            <FiSearch size={16} />
            <input
              type="text"
              placeholder="Search contests..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* ─── Contest Grid ─── */}
        <div className="contest-grid">
          {filtered.length === 0 ? (
            <div className="contest-empty animate-fade">
              <FiSearch size={36} />
              <p>No contests found</p>
            </div>
          ) : (
            filtered.map((c, i) => (
              <ContestCard
                key={c.id}
                contest={c}
                index={i}
                onViewDetails={setDetailContest}
              />
            ))
          )}
        </div>
      </section>

      {/* ─── Prizes & Rewards ─── */}
      <PrizesSection />

      {/* ─── Leaderboard ─── */}
      <section className="leaderboard-section" id="leaderboard-section">
        <h2 className="section-heading">Contest Leaderboard</h2>
        <div className="leaderboard-table">
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>User</th>
                <th>Score</th>
                <th>Solved</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {(Array.isArray(leaderboardData) ? leaderboardData : []).map((entry) => (
                <tr key={entry.rank}>
                  <td>
                    <div className="rank-cell">
                      {entry.rank === 1 && <span className="rank-medal rank-gold">🥇</span>}
                      {entry.rank === 2 && <span className="rank-medal rank-silver">🥈</span>}
                      {entry.rank === 3 && <span className="rank-medal rank-bronze">🥉</span>}
                      #{entry.rank}
                    </div>
                  </td>
                  <td className="user-cell">{entry.user}</td>
                  <td className="score-cell">{entry.score.toLocaleString()}</td>
                  <td>{entry.solved}</td>
                  <td>{entry.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ─── Badges ─── */}
      <section className="badges-section" id="badges-section">
        <h2 className="section-heading">Badges & Achievements</h2>
        <div className="badges-grid">
          {(Array.isArray(badgesData) ? badgesData : []).map((badge) => (
            <div key={badge.id} className={`badge-card ${badge.unlocked ? '' : 'locked'} animate-fade`}>
              <div className="badge-emoji">{badge.icon}</div>
              <div className="badge-info">
                <h4>{badge.name}</h4>
                <p>{badge.description}</p>
                <div className="badge-progress-bar">
                  <div className="badge-progress-fill" style={{ width: `${badge.progress || 0}%` }} />
                </div>
                <span className={`badge-status ${badge.unlocked ? 'unlocked' : 'locked-text'}`}>
                  {badge.unlocked ? '✓ Unlocked' : `${badge.progress || 0}% Progress`}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Rating Progress ─── */}
      <section className="rating-section">
        <h2 className="section-heading">Rating Progress</h2>
        <div className="rating-chart-container">
          <RatingChart data={ratingHistory} />
        </div>
      </section>

      {/* ─── Past Contests ─── */}
      <section className="past-section">
        <h2 className="section-heading">Past Contests</h2>
        <div className="past-grid">
          {(Array.isArray(pastContestsData) ? pastContestsData : []).map((pc) => (
            <div key={pc.id} className="past-card animate-fade">
              <div className="past-card-top">
                <span className="completed-badge">Completed</span>
              </div>
              <h3>{pc.name}</h3>
              <div className="past-card-stats">
                <div className="past-stat">
                  <span className="past-stat-value">#{pc.userRank}</span>
                  <span className="past-stat-label">Your Rank</span>
                </div>
                <div className="past-stat">
                  <span className="past-stat-value">{pc.userScore}</span>
                  <span className="past-stat-label">Score</span>
                </div>
                <div className="past-stat">
                  <span className="past-stat-value">{pc.participants?.toLocaleString()}</span>
                  <span className="past-stat-label">Participants</span>
                </div>
              </div>
              <div className="past-card-meta">
                <span><FiCalendar size={14} /> {formatDate(pc.date)}</span>
                <span><FiClock size={14} /> {pc.duration}</span>
                <span><FiLayers size={14} /> {pc.problems} Problems</span>
              </div>
              <button className="btn-outline" onClick={() => setDetailContest(pc)}>
                View Results <FiChevronRight size={14} />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Detail Modal ─── */}
      {detailContest && (
        <ContestDetailModal contest={detailContest} onClose={() => setDetailContest(null)} />
      )}
    </div>
  );
}

/* ────────────────────────────────────────── */
/*  Sub-components                             */
/* ────────────────────────────────────────── */

function NextContestCard({ contest, onViewDetails }) {
  const { days, hours, minutes, seconds, expired } = useCountdown(contest.date);

  return (
    <div className="next-contest-card animate-fade">
      <div className="next-contest-header">
        <span className="next-contest-label">Next Contest</span>
        <span className={`next-contest-status ${expired ? 'status-live' : 'status-upcoming'}`}>
          {expired ? '🔴 LIVE' : 'Upcoming'}
        </span>
      </div>
      <h2 className="next-contest-name">{contest.name}</h2>
      <div className="next-contest-meta">
        <span className="next-meta-item"><FiCalendar size={16} /> {formatDate(contest.date)}</span>
        <span className="next-meta-item"><FiClock size={16} /> {contest.startTime}</span>
        <span className="next-meta-item"><FiClock size={16} /> {contest.duration}</span>
        <span className="next-meta-item"><FiLayers size={16} /> {contest.problems} Problems</span>
        <span className="next-meta-item"><FiUsers size={16} /> {contest.participants?.toLocaleString()}</span>
        <span className="next-meta-item"><FiZap size={16} /> {contest.difficulty}</span>
      </div>
      <div className="countdown-row">
        <div className="countdown-blocks">
          <div className="countdown-block">
            <span className="countdown-value">{String(days).padStart(2, '0')}</span>
            <span className="countdown-label">Days</span>
          </div>
          <div className="countdown-block">
            <span className="countdown-value">{String(hours).padStart(2, '0')}</span>
            <span className="countdown-label">Hours</span>
          </div>
          <div className="countdown-block">
            <span className="countdown-value">{String(minutes).padStart(2, '0')}</span>
            <span className="countdown-label">Min</span>
          </div>
          <div className="countdown-block">
            <span className="countdown-value">{String(seconds).padStart(2, '0')}</span>
            <span className="countdown-label">Sec</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {expired ? (
            <button className="btn-primary">Enter Contest <FiArrowRight size={14} /></button>
          ) : (
            <button className="btn-primary">Register <FiArrowRight size={14} /></button>
          )}
          <button className="btn-outline" onClick={() => onViewDetails(contest)}>
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}

function LiveSection({ contest, onViewDetails }) {
  const remaining = useLiveCountdown(contest.remainingMs || 0);

  return (
    <section className="live-section animate-fade">
      <h2 className="live-section-title">
        <span className="live-dot" /> Live Now
      </h2>
      <div className="live-card">
        <div className="live-card-info">
          <h3>{contest.name}</h3>
          <div className="live-card-meta">
            <span className="live-meta-tag"><FiClock size={14} /> {remaining}</span>
            <span className="live-meta-tag"><FiLayers size={14} /> {contest.problems} Problems</span>
            <span className="live-meta-tag"><FiUsers size={14} /> {contest.participants?.toLocaleString()}</span>
            <span className="live-meta-tag"><FiZap size={14} /> {contest.difficulty}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button className="btn-primary">Enter Contest <FiArrowRight size={14} /></button>
          <button className="btn-outline" onClick={() => onViewDetails(contest)}>Details</button>
        </div>
      </div>
    </section>
  );
}

function ContestCard({ contest, index, onViewDetails }) {
  const isLive = contest.status === 'live';

  return (
    <div className="contest-card animate-fade" style={{ animationDelay: `${index * 0.05}s` }}>
      <div className="contest-card-top">
        <div className="contest-card-icon">
          {isLive ? <FiZap size={20} /> : <IoTrophyOutline size={20} />}
        </div>
        <span className="contest-type-badge">{contest.type || 'Contest'}</span>
      </div>
      <h3>{contest.name}</h3>
      <div className="contest-card-details">
        <span className="contest-detail"><FiCalendar size={14} /> {formatDate(contest.date)}</span>
        <span className="contest-detail"><FiClock size={14} /> {contest.duration}</span>
        <span className="contest-detail"><FiLayers size={14} /> {contest.problems} Problems</span>
        <span className="contest-detail"><FiUsers size={14} /> {contest.participants?.toLocaleString()}</span>
      </div>
      <div className="contest-card-footer">
        <span className="contest-difficulty">{contest.difficulty}</span>
        {isLive ? (
          <button className="btn-primary">Enter <FiArrowRight size={14} /></button>
        ) : (
          <button className="btn-outline" onClick={() => onViewDetails(contest)}>
            View Details <FiChevronRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

function RatingChart({ data }) {
  if (!Array.isArray(data) || data.length === 0) return null;

  const padding = { top: 30, right: 30, bottom: 40, left: 20 };
  const width = 600;
  const height = 200;
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const values = data.map((d) => d.rating);
  const min = Math.min(...values) - 50;
  const max = Math.max(...values) + 50;

  const points = data.map((d, i) => {
    const x = padding.left + (i / (data.length - 1)) * chartW;
    const y = padding.top + chartH - ((d.rating - min) / (max - min)) * chartH;
    return { x, y, ...d };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const areaPath = `${linePath} L${points[points.length - 1].x},${padding.top + chartH} L${points[0].x},${padding.top + chartH} Z`;

  return (
    <svg className="rating-chart" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="ratingGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.4" />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
        const y = padding.top + chartH * (1 - pct);
        return <line key={pct} className="grid-line" x1={padding.left} y1={y} x2={padding.left + chartW} y2={y} />;
      })}
      {/* Area */}
      <path className="chart-area" d={areaPath} />
      {/* Line */}
      <path className="chart-line" d={linePath} />
      {/* Dots + labels */}
      {points.map((p) => (
        <g key={p.contest}>
          <circle className="chart-dot" cx={p.x} cy={p.y} r={5} />
          <text className="chart-value" x={p.x} y={p.y - 14}>{p.rating}</text>
          <text className="chart-label" x={p.x} y={padding.top + chartH + 20}>{p.contest}</text>
        </g>
      ))}
    </svg>
  );
}

function ContestDetailModal({ contest, onClose }) {
  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!contest) return null;

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-content">
        <div className="modal-header">
          <h2>{contest.name}</h2>
          <button className="modal-close" onClick={onClose}><FiX size={18} /></button>
        </div>
        <div className="modal-body">
          <p>{contest.description || 'Contest details coming soon.'}</p>

          <div className="modal-meta-grid">
            <div className="modal-meta-item">
              <FiCalendar size={16} /> Date <strong>{formatDate(contest.date)}</strong>
            </div>
            <div className="modal-meta-item">
              <FiClock size={16} /> Start <strong>{contest.startTime || 'TBD'}</strong>
            </div>
            <div className="modal-meta-item">
              <FiClock size={16} /> Duration <strong>{contest.duration}</strong>
            </div>
            <div className="modal-meta-item">
              <FiLayers size={16} /> Problems <strong>{contest.problems}</strong>
            </div>
            <div className="modal-meta-item">
              <FiUsers size={16} /> Participants <strong>{contest.participants?.toLocaleString() || '—'}</strong>
            </div>
            <div className="modal-meta-item">
              <FiZap size={16} /> Difficulty <strong>{contest.difficulty}</strong>
            </div>
          </div>

          {Array.isArray(contest.rules) && contest.rules.length > 0 && (
            <>
              <h3 className="modal-sub">Rules</h3>
              <ul className="modal-rules">
                {contest.rules.map((rule, i) => (
                  <li key={i}>{rule}</li>
                ))}
              </ul>
            </>
          )}

          {contest.scoring && (
            <>
              <h3 className="modal-sub">Scoring</h3>
              <div className="modal-scoring">{contest.scoring}</div>
            </>
          )}

          {/* Past contest stats */}
          {contest.userRank != null && (
            <>
              <h3 className="modal-sub">Your Performance</h3>
              <div className="modal-meta-grid">
                <div className="modal-meta-item">
                  <FiAward size={16} /> Rank <strong>#{contest.userRank}</strong>
                </div>
                <div className="modal-meta-item">
                  <FiBarChart2 size={16} /> Score <strong>{contest.userScore}/{contest.totalScore}</strong>
                </div>
              </div>
            </>
          )}

          <div className="modal-actions">
            {contest.status === 'upcoming' && (
              <button className="btn-primary">Register <FiArrowRight size={14} /></button>
            )}
            {contest.status === 'live' && (
              <button className="btn-primary">Enter Contest <FiArrowRight size={14} /></button>
            )}
            <button className="btn-outline" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PrizesSection() {
  return (
    <section className="prizes-section animate-fade" id="prizes-section">
      <h2 className="section-heading">Contest Prizes & Rewards</h2>
      <div className="prizes-grid">
        <div className="prize-card gold">
          <div className="prize-image-wrapper">
            <img src="/gold_trophy.jpg" alt="1st Place Gold Trophy" onError={(e) => { e.target.style.display = 'none'; }} />
          </div>
          <h3 className="prize-title">1st Place</h3>
          <div className="prize-reward">$500 + Champion Badge</div>
          <p className="prize-desc">Exclusive AgentPrep Champion Badge, 1-year Pro subscription, and $500 cash prize.</p>
        </div>
        <div className="prize-card silver">
          <div className="prize-image-wrapper">
            <img src="/silver_medal.jpg" alt="2nd Place Silver Medal" onError={(e) => { e.target.style.display = 'none'; }} />
          </div>
          <h3 className="prize-title">2nd Place</h3>
          <div className="prize-reward">$250 + Elite Badge</div>
          <p className="prize-desc">AgentPrep Elite Badge, 6-months Pro subscription, and $250 cash prize.</p>
        </div>
        <div className="prize-card bronze">
          <div className="prize-image-wrapper">
            <img src="/bronze_medal.jpg" alt="3rd Place Bronze Medal" onError={(e) => { e.target.style.display = 'none'; }} />
          </div>
          <h3 className="prize-title">3rd Place</h3>
          <div className="prize-reward">$100 + Pro Badge</div>
          <p className="prize-desc">AgentPrep Pro Badge, 3-months Pro subscription, and $100 cash prize.</p>
        </div>
      </div>
    </section>
  );
}
