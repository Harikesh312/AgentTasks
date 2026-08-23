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
  FiPlay,
  FiBookOpen,
  FiCpu,
} from 'react-icons/fi';
import { IoTrophyOutline, IoRocketOutline, IoFlameOutline } from 'react-icons/io5';
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

/* ─── Icon + accent config per contest type ─── */
function getContestVisualConfig(contest) {
  const type = (contest.type || '').toLowerCase();
  const status = contest.status;

  if (status === 'live') {
    return {
      accentClass: 'accent-live',
      pillClass: 'pill-live',
      pillText: 'LIVE NOW',
      iconBoxClass: 'iconbox-live',
      Icon: IoFlameOutline,
      iconSize: 22,
    };
  }

  if (status === 'completed') {
    // Use original type for icon but muted
    const base = getTypeConfig(type);
    return {
      ...base,
      accentClass: 'accent-completed',
      pillClass: 'pill-completed',
      pillText: 'COMPLETED',
      iconBoxClass: base.iconBoxClass + ' iconbox-muted',
    };
  }

  const base = getTypeConfig(type);
  return {
    ...base,
    pillText: (contest.type || 'UPCOMING').toUpperCase(),
  };
}

function getTypeConfig(type) {
  switch (type) {
    case 'weekly':
      return {
        accentClass: 'accent-weekly',
        pillClass: 'pill-weekly',
        pillText: 'WEEKLY',
        iconBoxClass: 'iconbox-weekly',
        Icon: FiCalendar,
        iconSize: 20,
      };
    case 'biweekly':
      return {
        accentClass: 'accent-biweekly',
        pillClass: 'pill-biweekly',
        pillText: 'BIWEEKLY',
        iconBoxClass: 'iconbox-biweekly',
        Icon: FiLayers,
        iconSize: 20,
      };
    case 'monthly':
      return {
        accentClass: 'accent-monthly',
        pillClass: 'pill-monthly',
        pillText: 'MONTHLY',
        iconBoxClass: 'iconbox-monthly',
        Icon: IoTrophyOutline,
        iconSize: 22,
      };
    case 'beginner':
      return {
        accentClass: 'accent-beginner',
        pillClass: 'pill-beginner',
        pillText: 'BEGINNER',
        iconBoxClass: 'iconbox-beginner',
        Icon: FiStar,
        iconSize: 20,
      };
    case 'advanced':
      return {
        accentClass: 'accent-advanced',
        pillClass: 'pill-advanced',
        pillText: 'ADVANCED',
        iconBoxClass: 'iconbox-advanced',
        Icon: IoRocketOutline,
        iconSize: 22,
      };
    default:
      return {
        accentClass: 'accent-default',
        pillClass: 'pill-default',
        pillText: 'UPCOMING',
        iconBoxClass: 'iconbox-default',
        Icon: FiTarget,
        iconSize: 20,
      };
  }
}

/* ─── Difficulty badge class ─── */
function getDifficultyClass(difficulty) {
  const d = (difficulty || '').toLowerCase();
  if (d.includes('expert') || (d.includes('hard') && d.includes('expert'))) return 'diff-expert';
  if (d.includes('hard') && !d.includes('easy')) return 'diff-hard';
  if (d.includes('easy') && !d.includes('hard') && !d.includes('expert')) return 'diff-easy';
  return 'diff-medium';
}

/* ─── Filter tabs ─── */
const FILTER_TABS = ['All', 'Live', 'Upcoming', 'Completed'];
const DIFFICULTY_OPTIONS = ['All Difficulties', 'Easy', 'Medium', 'Hard', 'Expert'];
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

  const allContests = useMemo(() => {
    const live = liveContestData ? [liveContestData] : [];
    const upcoming = Array.isArray(upcomingContests) ? upcomingContests : [];
    const past = Array.isArray(pastContestsData) ? pastContestsData : [];
    return [...live, ...upcoming, ...past];
  }, []);

  const filtered = useMemo(() => {
    let list = allContests;
    if (activeTab === 'Live') list = list.filter((c) => c.status === 'live');
    else if (activeTab === 'Upcoming') list = list.filter((c) => c.status === 'upcoming');
    else if (activeTab === 'Completed') list = list.filter((c) => c.status === 'completed');
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((c) => (c.name || '').toLowerCase().includes(q));
    }
    if (difficultyFilter !== 'All Difficulties') {
      list = list.filter((c) => (c.difficulty || '').toLowerCase().includes(difficultyFilter.toLowerCase()));
    }
    if (typeFilter !== 'All Types') {
      list = list.filter((c) => c.type === typeFilter);
    }
    return list;
  }, [allContests, activeTab, search, difficultyFilter, typeFilter]);

  const nextContest = useMemo(() => {
    const upcoming = (Array.isArray(upcomingContests) ? upcomingContests : [])
      .filter((c) => c.status === 'upcoming')
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    return upcoming[0] || null;
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

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
              <IoTrophyOutline size={20} /> Coding Contests
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
                View Upcoming Contests <FiArrowRight size={20} />
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
        <h2 className="section-heading">Live & Upcoming Contests</h2>
        <p className="section-subheading">Compete in weekly challenges and climb the leaderboard</p>

        {/* Filter Bar */}
        <div className="cp-filter-bar">
          <div className="cp-filter-left">
            <div className="cp-tabs">
              {FILTER_TABS.map((tab) => (
                <button
                  key={tab}
                  className={`cp-tab ${activeTab === tab ? 'cp-tab--active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab === 'Live' && <span className="cp-tab-live-dot" />}
                  {tab}
                </button>
              ))}
            </div>
          </div>
          <div className="cp-filter-right">
            <div className="cp-search">
              <FiSearch size={15} />
              <input
                type="text"
                placeholder="Search contests..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="cp-select-wrap">
              <select
                className="cp-select"
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
              >
                {DIFFICULTY_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              <FiChevronDown size={18} className="cp-select-chevron" />
            </div>
            <div className="cp-select-wrap">
              <select
                className="cp-select"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                {TYPE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              <FiChevronDown size={18} className="cp-select-chevron" />
            </div>
          </div>
        </div>

        {/* Contest Grid */}
        <div className="cp-grid">
          {filtered.length === 0 ? (
            <div className="cp-empty animate-fade">
              <FiSearch size={36} />
              <p>No contests found matching your filters</p>
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

      {/* ─── Motivational CTA ─── */}
      <section className="contest-cta-section animate-fade">
        <div className="contest-cta-inner">
          <div className="contest-cta-content">
            <FiTarget size={28} className="contest-cta-icon" />
            <h2 className="contest-cta-title">Ready to compete?</h2>
            <p className="contest-cta-text">
              Compete with developers worldwide. Climb the leaderboard. Earn exclusive rewards.
            </p>
            <button className="btn-primary" onClick={() => scrollTo('contests-section')}>
              Browse Contests <FiArrowRight size={18} />
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
            View Full Leaderboard <FiChevronRight size={18} />
          </button>
        </div>
        <div className="tp-list">
          <div className="tp-row tp-row--header">
            <div className="tp-rank">Rank</div>
            <div className="tp-name">User</div>
            <div className="tp-stat">Solved</div>
            <div className="tp-stat">Time</div>
            <div className="tp-score">Score</div>
          </div>
          {topPerformers.map((entry) => (
            <div key={entry.rank} className={`tp-row ${entry.rank <= 3 ? `tp-row--top${entry.rank}` : ''}`}>
              <div className="tp-rank">
                {entry.rank <= 3 ? (
                  <span className={`tp-badge tp-badge--${entry.rank}`}>{entry.rank}</span>
                ) : (
                  <span className="tp-rank-num">#{entry.rank}</span>
                )}
              </div>
              <div className="tp-name">{entry.user}</div>
              <div className="tp-stat">{entry.solved}</div>
              <div className="tp-stat">{entry.time}</div>
              <div className="tp-score">{entry.score.toLocaleString()}</div>
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

/* ─────────────────────────────────────────── */
/*  CONTEST CARD — Completely rebuilt          */
/* ─────────────────────────────────────────── */
function ContestCard({ contest, index, onViewDetails }) {
  const isLive = contest.status === 'live';
  const isCompleted = contest.status === 'completed';
  const config = getContestVisualConfig(contest);
  const CardIcon = config.Icon;

  return (
    <div
      className={`cc ${config.accentClass} ${isCompleted ? 'cc--completed' : ''} ${isLive ? 'cc--live' : ''} animate-fade`}
      style={{ animationDelay: `${index * 0.06}s` }}
    >
      {/* ── Colored top border ── */}
      <div className="cc-accent" />

      {/* ── Top Row: pill + difficulty ── */}
      <div className="cc-top">
        <span className={`cc-pill ${config.pillClass}`}>
          {isLive && <span className="cc-live-dot" />}
          {config.pillText}
        </span>
        <span className={`cc-diff ${getDifficultyClass(contest.difficulty)}`}>
          {contest.difficulty}
        </span>
      </div>

      {/* ── Title + Icon Box ── */}
      <div className="cc-body">
        <div className="cc-body-text">
          <h3 className="cc-title">{contest.name}</h3>
          <div className="cc-meta-row">
            <span className="cc-meta"><FiCalendar size={18} /> {formatDate(contest.date)}</span>
            <span className="cc-meta"><FiClock size={18} /> {contest.duration}</span>
          </div>
          <div className="cc-meta-row">
            <span className="cc-meta"><FiLayers size={18} /> {contest.problems} Problems</span>
            {contest.startTime && !isLive && (
              <span className="cc-meta"><FiClock size={18} /> {contest.startTime}</span>
            )}
          </div>
          {/* Show rank/score for completed */}
          {isCompleted && contest.userRank != null && (
            <div className="cc-perf">
              <span className="cc-perf-item">
                <strong>#{contest.userRank}</strong> Rank
              </span>
              <span className="cc-perf-item">
                <strong>{contest.userScore}</strong>/{contest.totalScore} Score
              </span>
            </div>
          )}
        </div>
        <div className={`cc-iconbox ${config.iconBoxClass}`}>
          <CardIcon size={config.iconSize} />
        </div>
      </div>

      {/* ── Divider ── */}
      <div className="cc-divider" />

      {/* ── Bottom: participants + CTA ── */}
      <div className="cc-bottom">
        <div className="cc-participants">
          <div className="cc-avatars">
            <span className="cc-avatar-dot" />
            <span className="cc-avatar-dot" />
            <span className="cc-avatar-dot" />
          </div>
          <span className="cc-participant-count">
            <FiUsers size={13} /> +{contest.participants?.toLocaleString()}
          </span>
        </div>
        <div className="cc-cta">
          {isLive ? (
            <button className="cc-btn cc-btn--live" onClick={() => onViewDetails(contest)}>
              Enter Contest <FiArrowRight size={18} />
            </button>
          ) : isCompleted ? (
            <button className="cc-btn cc-btn--muted" onClick={() => onViewDetails(contest)}>
              View Results <FiChevronRight size={18} />
            </button>
          ) : (
            <button className="cc-btn cc-btn--outline" onClick={() => onViewDetails(contest)}>
              View Details <FiChevronRight size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────── */
/*  Sub-components                             */
/* ─────────────────────────────────────────── */

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
        <span className="next-meta-item"><FiCalendar size={20} /> {formatDate(contest.date)}</span>
        <span className="next-meta-item"><FiClock size={20} /> {contest.startTime}</span>
        <span className="next-meta-item"><FiClock size={20} /> {contest.duration}</span>
        <span className="next-meta-item"><FiLayers size={20} /> {contest.problems} Problems</span>
        <span className="next-meta-item"><FiUsers size={20} /> {contest.participants?.toLocaleString()}</span>
        <span className="next-meta-item"><FiZap size={20} /> {contest.difficulty}</span>
      </div>
      <div className="countdown-row">
        <div className="countdown-blocks">
          {[
            { val: days, label: 'Days' },
            { val: hours, label: 'Hours' },
            { val: minutes, label: 'Min' },
            { val: seconds, label: 'Sec' },
          ].map((b) => (
            <div className="countdown-block" key={b.label}>
              <span className="countdown-value">{String(b.val).padStart(2, '0')}</span>
              <span className="countdown-label">{b.label}</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {expired ? (
            <button className="btn-primary">Enter Contest <FiArrowRight size={18} /></button>
          ) : (
            <button className="btn-primary">Register <FiArrowRight size={18} /></button>
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
            <span className="live-meta-tag"><FiClock size={18} /> {remaining}</span>
            <span className="live-meta-tag"><FiClock size={18} /> {contest.duration}</span>
            <span className="live-meta-tag"><FiLayers size={18} /> {contest.problems} Problems</span>
            <span className="live-meta-tag"><FiUsers size={18} /> {contest.participants?.toLocaleString()}</span>
            <span className="live-meta-tag"><FiZap size={18} /> {contest.difficulty}</span>
          </div>
        </div>
        <button className="btn-primary cc-btn--live-hero" onClick={() => onViewDetails(contest)}>
          Enter Contest <FiArrowRight size={18} />
        </button>
      </div>
    </section>
  );
}

function ContestDetailModal({ contest, onClose }) {
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
          <button className="modal-close" onClick={onClose}><FiX size={22} /></button>
        </div>
        <div className="modal-body">
          <p>{contest.description || 'Contest details coming soon.'}</p>
          <div className="modal-meta-grid">
            <div className="modal-meta-item"><FiCalendar size={20} /> Date <strong>{formatDate(contest.date)}</strong></div>
            <div className="modal-meta-item"><FiClock size={20} /> Start <strong>{contest.startTime || 'TBD'}</strong></div>
            <div className="modal-meta-item"><FiClock size={20} /> Duration <strong>{contest.duration}</strong></div>
            <div className="modal-meta-item"><FiLayers size={20} /> Problems <strong>{contest.problems}</strong></div>
            <div className="modal-meta-item"><FiUsers size={20} /> Participants <strong>{contest.participants?.toLocaleString() || '—'}</strong></div>
            <div className="modal-meta-item"><FiZap size={20} /> Difficulty <strong>{contest.difficulty}</strong></div>
          </div>
          {Array.isArray(contest.rules) && contest.rules.length > 0 && (
            <>
              <h3 className="modal-sub">Rules</h3>
              <ul className="modal-rules">
                {contest.rules.map((rule, i) => (<li key={i}>{rule}</li>))}
              </ul>
            </>
          )}
          {contest.scoring && (
            <>
              <h3 className="modal-sub">Scoring</h3>
              <div className="modal-scoring">{contest.scoring}</div>
            </>
          )}
          {contest.userRank != null && (
            <>
              <h3 className="modal-sub">Your Performance</h3>
              <div className="modal-meta-grid">
                <div className="modal-meta-item"><FiAward size={20} /> Rank <strong>#{contest.userRank}</strong></div>
                <div className="modal-meta-item"><FiBarChart2 size={20} /> Score <strong>{contest.userScore}/{contest.totalScore}</strong></div>
              </div>
            </>
          )}
          <div className="modal-actions">
            {contest.status === 'upcoming' && (
              <button className="btn-primary">Register <FiArrowRight size={18} /></button>
            )}
            {contest.status === 'live' && (
              <button className="btn-primary">Enter Contest <FiArrowRight size={18} /></button>
            )}
            <button className="btn-outline" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────── */
/*  PRIZES SECTION — Premium                   */
/* ─────────────────────────────────────────── */
function PrizesSection() {
  const prizes = [
    {
      place: 'Champion',
      rank: '1st Place',
      requirement: 'Top 1 Position',
      reward: '₹3,000',
      rewardLabel: 'Cash Prize',
      badge: 'Exclusive Champion Badge',
      tier: 'gold',
      emoji: '👑',
    },
    {
      place: 'Runner Up',
      rank: '2nd–3rd Place',
      requirement: 'Top 2–3 Position',
      reward: '₹1,500',
      rewardLabel: 'Cash Prize',
      badge: 'Exclusive Runner Up Badge',
      tier: 'silver',
      emoji: '🥈',
    },
    {
      place: 'Top Performer',
      rank: '4th–10th Place',
      requirement: 'Top 4–10 Position',
      reward: '₹500',
      rewardLabel: 'Cash Prize',
      badge: 'Exclusive Performer Badge',
      tier: 'bronze',
      emoji: '🥉',
    },
  ];

  return (
    <section className="prizes-section" id="prizes-section">
      <div className="prizes-header">
        <div className="prizes-header-icon-wrap">
          <IoTrophyOutline size={26} />
        </div>
        <div>
          <h2 className="section-heading">Prizes & Rewards</h2>
          <p className="section-subheading">Compete and earn exclusive rewards for your performance</p>
        </div>
      </div>

      <div className="prize-cards">
        {prizes.map((prize) => (
          <div key={prize.place} className={`prize-card prize-card--${prize.tier}`}>
            <div className="prize-card-accent" />
            <div className="prize-card-medal">
              <span className="prize-card-emoji">{prize.emoji}</span>
            </div>
            <div className="prize-card-rank">{prize.rank}</div>
            <h3 className="prize-card-title">{prize.place}</h3>
            <div className="prize-card-amount">{prize.reward}</div>
            <div className="prize-card-label">{prize.rewardLabel}</div>
            <div className="prize-card-badge">
              <FiAward size={14} />
              <span>{prize.badge}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="prize-extras">
        <div className="prize-extra">
          <div className="prize-extra-icon"><FiStar size={18} /></div>
          <div>
            <strong>XP Points</strong>
            <p>All participants earn XP based on performance</p>
          </div>
        </div>
        <div className="prize-extra">
          <div className="prize-extra-icon"><FiTrendingUp size={18} /></div>
          <div>
            <strong>Global Rankings</strong>
            <p>Improve your rank with every contest</p>
          </div>
        </div>
        <div className="prize-extra">
          <div className="prize-extra-icon"><FiAward size={18} /></div>
          <div>
            <strong>Achievement Badges</strong>
            <p>Unlock badges for milestones and streaks</p>
          </div>
        </div>
      </div>

      <p className="prizes-disclaimer">
        * All participants earn XP Points and improve their global rankings based on relative performance.
      </p>
    </section>
  );
}
