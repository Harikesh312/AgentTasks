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
  FiChevronDown,
  FiStar,
  FiTrendingUp,
  FiTarget,
} from 'react-icons/fi';
import { IoTrophyOutline } from 'react-icons/io5';
import {
  contests as upcomingContests,
  liveContest as liveContestData,
  pastContests as pastContestsData,
  leaderboard as leaderboardData,
  badges as badgesData,
  userStats,
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

/* ─── Filter tabs ─── */
const FILTER_TABS = ['All', 'Live', 'Upcoming', 'Completed'];

/* ─── Difficulty options ─── */
const DIFFICULTY_OPTIONS = ['All Difficulties', 'Easy', 'Medium', 'Hard', 'Expert'];

/* ─── Contest type options ─── */
const TYPE_OPTIONS = ['All Types', 'Weekly', 'Biweekly', 'Monthly', 'Beginner', 'Advanced'];

/* ─────────────────────────────────────────── */
/*  ContestPage                                */
/* ─────────────────────────────────────────── */
export default function ContestPage() {
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('All Difficulties');
  const [typeFilter, setTypeFilter] = useState('All Types');
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

    // Tab filter
    if (activeTab === 'Live') {
      list = list.filter((c) => c.status === 'live');
    } else if (activeTab === 'Upcoming') {
      list = list.filter((c) => c.status === 'upcoming');
    } else if (activeTab === 'Completed') {
      list = list.filter((c) => c.status === 'completed');
    }
    // 'All' shows everything

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((c) => (c.name || '').toLowerCase().includes(q));
    }

    // Difficulty filter
    if (difficultyFilter !== 'All Difficulties') {
      list = list.filter((c) =>
        (c.difficulty || '').toLowerCase().includes(difficultyFilter.toLowerCase())
      );
    }

    // Type filter
    if (typeFilter !== 'All Types') {
      list = list.filter((c) => c.type === typeFilter);
    }

    return list;
  }, [allContests, activeTab, search, difficultyFilter, typeFilter]);

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

  // Top performers (top 5)
  const topPerformers = useMemo(() => {
    return (Array.isArray(leaderboardData) ? leaderboardData : []).slice(0, 5);
  }, []);

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
              <button className="btn-primary btn-lg" onClick={() => scrollTo('contests-section')}>
                View Upcoming Contests <FiArrowRight size={16} />
              </button>
              <button className="btn-outline btn-lg" onClick={() => scrollTo('top-performers-section')}>
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

      {/* ─── Live Now ─── */}
      {liveContestData && liveContestData.status === 'live' && (
        <LiveSection contest={liveContestData} onViewDetails={setDetailContest} />
      )}

      {/* ─── Next Contest Countdown ─── */}
      {nextContest && <NextContestCard contest={nextContest} onViewDetails={setDetailContest} />}

      {/* ─── Compact Stats ─── */}
      <section className="stats-section animate-fade" id="stats-section">
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
        </div>
      </section>

      {/* ─── Contests Section with Filters ─── */}
      <section id="contests-section">
        <h2 className="section-heading">Contests</h2>

        {/* Filter Bar */}
        <div className="contest-controls">
          <div className="contest-controls-left">
            <div className="contest-tabs">
              {FILTER_TABS.map((tab) => (
                <button
                  key={tab}
                  className={`contest-tab ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          <div className="contest-controls-right">
            <div className="contest-search">
              <FiSearch size={16} />
              <input
                type="text"
                placeholder="Search contests..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="filter-select-wrapper">
              <select
                className="filter-select"
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
              >
                {DIFFICULTY_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              <FiChevronDown size={14} className="filter-select-icon" />
            </div>
            <div className="filter-select-wrapper">
              <select
                className="filter-select"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                {TYPE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              <FiChevronDown size={14} className="filter-select-icon" />
            </div>
          </div>
        </div>

        {/* Contest Grid */}
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
                  <span className="past-stat-label">Rank</span>
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

      {/* ─── Motivational Visual + Prizes ─── */}
      <section className="contest-cta-section animate-fade">
        <div className="contest-cta-inner">
          <div className="contest-cta-content">
            <FiTarget size={28} className="contest-cta-icon" />
            <h2 className="contest-cta-title">Ready to compete?</h2>
            <p className="contest-cta-text">
              Compete with developers worldwide. Climb the leaderboard. Earn exclusive rewards.
            </p>
            <button className="btn-primary" onClick={() => scrollTo('contests-section')}>
              Browse Contests <FiArrowRight size={14} />
            </button>
          </div>
          <div className="contest-cta-visual">
            <img
              src="/contest-hero.jpg"
              alt="Coding contest"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>
        </div>
      </section>

      {/* ─── Contest Prizes & Rewards ─── */}
      <PrizesSection />

      {/* ─── Top Performers ─── */}
      <section className="top-performers-section" id="top-performers-section">
        <div className="top-performers-header">
          <h2 className="section-heading">Top Performers</h2>
          <button className="btn-ghost btn-sm" onClick={() => scrollTo('top-performers-section')}>
            View Full Leaderboard <FiChevronRight size={14} />
          </button>
        </div>
        <div className="top-performers-list">
          {topPerformers.map((entry) => (
            <div key={entry.rank} className="performer-row">
              <div className="performer-rank">
                {entry.rank === 1 && <span className="rank-medal">🥇</span>}
                {entry.rank === 2 && <span className="rank-medal">🥈</span>}
                {entry.rank === 3 && <span className="rank-medal">🥉</span>}
                {entry.rank > 3 && <span className="rank-number">#{entry.rank}</span>}
              </div>
              <span className="performer-name">{entry.user}</span>
              <span className="performer-score">{entry.score.toLocaleString()}</span>
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
            <span className="live-meta-tag"><FiClock size={14} /> {contest.duration}</span>
            <span className="live-meta-tag"><FiLayers size={14} /> {contest.problems} Problems</span>
            <span className="live-meta-tag"><FiUsers size={14} /> {contest.participants?.toLocaleString()}</span>
            <span className="live-meta-tag"><FiZap size={14} /> {contest.difficulty}</span>
          </div>
        </div>
        <button className="btn-primary" onClick={() => onViewDetails(contest)}>
          Enter Contest <FiArrowRight size={14} />
        </button>
      </div>
    </section>
  );
}

function ContestCard({ contest, index, onViewDetails }) {
  const isLive = contest.status === 'live';
  const isCompleted = contest.status === 'completed';

  return (
    <div className="contest-card animate-fade" style={{ animationDelay: `${index * 0.05}s` }}>
      <div className="contest-card-top">
        <span className={`contest-status-badge ${
          isLive ? 'status-live-badge' : isCompleted ? 'status-completed-badge' : 'status-upcoming-badge'
        }`}>
          {isLive ? '● Live' : isCompleted ? 'Completed' : contest.type || 'Upcoming'}
        </span>
        <span className="contest-difficulty">{contest.difficulty}</span>
      </div>
      <h3>{contest.name}</h3>
      <div className="contest-card-details">
        <span className="contest-detail"><FiCalendar size={14} /> {formatDate(contest.date)}</span>
        <span className="contest-detail"><FiClock size={14} /> {contest.duration}</span>
        <span className="contest-detail"><FiLayers size={14} /> {contest.problems} Problems</span>
        <span className="contest-detail"><FiUsers size={14} /> {contest.participants?.toLocaleString()}</span>
      </div>
      <div className="contest-card-footer">
        {isLive ? (
          <button className="btn-primary" onClick={() => onViewDetails(contest)}>
            Enter <FiArrowRight size={14} />
          </button>
        ) : (
          <button className="btn-outline" onClick={() => onViewDetails(contest)}>
            View Details <FiChevronRight size={14} />
          </button>
        )}
      </div>
    </div>
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
  const prizes = [
    {
      place: '1st Place',
      reward: '$500 + Champion Badge',
      description: 'Exclusive AgentPrep Champion Badge, 1-year Pro subscription, and $500 cash prize.',
      tier: 'gold',
      icon: <IoTrophyOutline size={28} />,
    },
    {
      place: '2nd Place',
      reward: '$250 + Elite Badge',
      description: 'AgentPrep Elite Badge, 6-months Pro subscription, and $250 cash prize.',
      tier: 'silver',
      icon: <FiAward size={28} />,
    },
    {
      place: '3rd Place',
      reward: '$100 + Pro Badge',
      description: 'AgentPrep Pro Badge, 3-months Pro subscription, and $100 cash prize.',
      tier: 'bronze',
      icon: <FiStar size={28} />,
    },
  ];

  return (
    <section className="prizes-section animate-fade" id="prizes-section">
      <div className="prizes-section-header">
        <h2 className="section-heading">Contest Prizes & Rewards</h2>
        <p className="prizes-section-sub">Compete, climb the leaderboard, and earn exclusive rewards.</p>
      </div>
      <div className="prizes-grid">
        {prizes.map((prize) => (
          <div key={prize.place} className={`prize-card prize-${prize.tier}`}>
            <div className={`prize-icon-wrapper prize-icon-${prize.tier}`}>
              {prize.icon}
            </div>
            <h3 className="prize-place">{prize.place}</h3>
            <div className="prize-reward">{prize.reward}</div>
            <p className="prize-desc">{prize.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

