import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  FiEye, FiCheckSquare, FiMessageCircle, FiStar,
  FiChevronRight, FiX, FiEdit2, FiMapPin, FiCalendar,
  FiUsers, FiUser, FiAward, FiActivity, FiTarget,
  FiZap, FiTrendingUp, FiClock, FiExternalLink,
  FiGithub, FiLinkedin, FiGlobe, FiMail, FiInfo
} from 'react-icons/fi';
import { BiNetworkChart } from 'react-icons/bi';
import { useAuth } from '../context/AuthContext';
import questions from '../data/questions';
import './ProfilePage.css';

// ---- Initials Avatar ----
function InitialsAvatar({ name, size = 96 }) {
  const initials = (name || '?')
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="pp-avatar-initials" style={{ width: size, height: size, fontSize: size * 0.38 }}>
      {initials}
    </div>
  );
}

// ---- SVG Circular Progress ----
function CircularProgress({ solved, total, size = 140, strokeWidth = 6 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = total > 0 ? solved / total : 0;
  const offset = circumference - progress * circumference;

  return (
    <div className="pp-progress-wrapper" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="pp-progress-svg">
        <circle cx={size / 2} cy={size / 2} r={radius} className="pp-progress-track" strokeWidth={strokeWidth} />
        <circle cx={size / 2} cy={size / 2} r={radius} className="pp-progress-bar" strokeWidth={strokeWidth + 1}
          strokeDasharray={circumference} strokeDashoffset={offset} />
      </svg>
      <div className="pp-progress-center">
        <span className="pp-progress-num">{solved}</span>
        <span className="pp-progress-den">/{total}</span>
        <span className="pp-progress-label"><FiCheckSquare size={12} /> Solved</span>
      </div>
    </div>
  );
}

// ---- Difficulty Progress Bar ----
function DiffBar({ label, solved, total, colorClass }) {
  const pct = total > 0 ? (solved / total) * 100 : 0;
  return (
    <div className="pp-diff-item">
      <div className="pp-diff-header">
        <span className={`pp-diff-label ${colorClass}`}>{label}</span>
        <span className="pp-diff-count">{solved}<span className="pp-diff-total">/{total}</span></span>
      </div>
      <div className="pp-diff-track">
        <div className={`pp-diff-fill ${colorClass}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// ---- Utility functions ----
function getDateStr(d) {
  return new Date(d).toISOString().split('T')[0];
}

function computeActivityMap(history) {
  const map = {};
  (history || []).forEach(a => {
    const key = getDateStr(a.date);
    map[key] = (map[key] || 0) + 1;
  });
  return map;
}

function computeStreaks(activityMap) {
  const dates = Object.keys(activityMap).sort();
  if (dates.length === 0) return { activeDays: 0, currentStreak: 0, maxStreak: 0 };
  const activeDays = dates.length;
  let maxStreak = 1, currentRun = 1;
  for (let i = 1; i < dates.length; i++) {
    const diff = (new Date(dates[i]) - new Date(dates[i - 1])) / 86400000;
    if (diff === 1) { currentRun++; maxStreak = Math.max(maxStreak, currentRun); }
    else currentRun = 1;
  }
  let currentStreak = 0, checkDate = new Date();
  checkDate.setHours(0, 0, 0, 0);
  if (!activityMap[getDateStr(checkDate)]) checkDate.setDate(checkDate.getDate() - 1);
  while (activityMap[getDateStr(checkDate)]) { currentStreak++; checkDate.setDate(checkDate.getDate() - 1); }
  return { activeDays, currentStreak, maxStreak };
}

function computeDifficultyCounts(completedIds, allQuestions) {
  const qMap = {};
  allQuestions.forEach(q => { qMap[q.id] = q; });
  const totals = { Easy: 0, Medium: 0, Hard: 0 }, solved = { Easy: 0, Medium: 0, Hard: 0 };
  allQuestions.forEach(q => { if (totals[q.difficulty] !== undefined) totals[q.difficulty]++; });
  (completedIds || []).forEach(id => { const q = qMap[id]; if (q && solved[q.difficulty] !== undefined) solved[q.difficulty]++; });
  return { totals, solved };
}

function computeBadges(activeDays, currentStreak, maxStreak, solvedCount) {
  const b = [];
  if (solvedCount >= 1)   b.push({ id: 'first',     name: 'First Solve',         desc: 'Solved your first question' });
  if (solvedCount >= 10)  b.push({ id: 'solved10',   name: '10 Questions',         desc: 'Solved 10 questions' });
  if (solvedCount >= 25)  b.push({ id: 'solved25',   name: '25 Questions',         desc: 'Solved 25 questions' });
  if (maxStreak >= 7)     b.push({ id: 'streak7',    name: '7-Day Streak',         desc: '7 consecutive active days' });
  if (maxStreak >= 30)    b.push({ id: 'streak30',   name: '30-Day Streak',        desc: '30 consecutive active days' });
  if (activeDays >= 50)   b.push({ id: 'active50',   name: '50 Active Days',       desc: 'Active for 50 days' });
  if (activeDays >= 100)  b.push({ id: 'active100',  name: '100 Active Days',      desc: 'Active for 100 days' });
  return b;
}

// ---- Heatmap ----
function Heatmap({ activityMap }) {
  const weeks = 52, days = 7;

  const { grid, monthLabels } = useMemo(() => {
    const result = [];
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - (weeks * 7 - 1) - today.getDay());
    for (let w = 0; w < weeks; w++) {
      const col = [];
      for (let d = 0; d < days; d++) {
        const cellDate = new Date(startDate);
        cellDate.setDate(startDate.getDate() + w * 7 + d);
        const key = getDateStr(cellDate);
        const count = activityMap[key] || 0;
        const level = count >= 4 ? 4 : count >= 3 ? 3 : count >= 2 ? 2 : count >= 1 ? 1 : 0;
        col.push({ level, date: key, count });
      }
      result.push(col);
    }
    const labels = [];
    let lastMonth = -1;
    for (let w = 0; w < result.length; w++) {
      const m = new Date(result[w][0].date).getMonth();
      if (m !== lastMonth) { labels.push({ month: new Date(result[w][0].date).toLocaleString('en-US', { month: 'short' }), idx: w }); lastMonth = m; }
    }
    return { grid: result, monthLabels: labels };
  }, [activityMap]);

  return (
    <div className="pp-heatmap-wrap">
      <div className="pp-heatmap-scroll">
        <div className="pp-heatmap-grid">
          {grid.map((col, wIdx) => (
            <div key={wIdx} className="pp-heatmap-col">
              {col.map((cell, dIdx) => (
                <div key={dIdx} className={`pp-heatmap-cell level-${cell.level}`}
                  title={`${cell.count} activit${cell.count === 1 ? 'y' : 'ies'} on ${new Date(cell.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
                />
              ))}
            </div>
          ))}
        </div>
        <div className="pp-heatmap-months">
          {monthLabels.map((m, i) => (
            <span key={i} style={{ gridColumnStart: m.idx + 1 }}>{m.month}</span>
          ))}
        </div>
      </div>
      <div className="pp-heatmap-legend">
        <span>Less</span>
        <div className="pp-heatmap-cell level-0" />
        <div className="pp-heatmap-cell level-1" />
        <div className="pp-heatmap-cell level-2" />
        <div className="pp-heatmap-cell level-3" />
        <div className="pp-heatmap-cell level-4" />
        <span>More</span>
      </div>
    </div>
  );
}

// ---- Stat Chip ----
function StatChip({ icon, value, label, accent }) {
  return (
    <div className={`pp-stat-chip ${accent || ''}`}>
      <div className="pp-stat-chip-icon">{icon}</div>
      <div className="pp-stat-chip-value">{value}</div>
      <div className="pp-stat-chip-label">{label}</div>
    </div>
  );
}

// ---- Edit Profile Modal ----
function EditProfileModal({ user, onSave, onClose }) {
  const [form, setForm] = useState({
    name: user?.name || '',
    username: user?.username || '',
    bio: user?.bio || '',
    gender: user?.gender || '',
    dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
    location: user?.location || '',
    github: user?.github || '',
    linkedin: user?.linkedin || '',
    portfolio: user?.portfolio || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.name.trim()) { setError('Name cannot be empty'); return; }
    setSaving(true); setError('');
    try {
      await onSave({ ...form, name: form.name.trim() });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  return (
    <div className="pp-modal-overlay" onClick={onClose}>
      <div className="pp-modal" onClick={e => e.stopPropagation()}>
        <div className="pp-modal-header">
          <div>
            <h2 className="pp-modal-title">Edit Profile</h2>
            <p className="pp-modal-subtitle">Update your personal information</p>
          </div>
          <button className="pp-modal-close" onClick={onClose} aria-label="Close modal"><FiX size={22} /></button>
        </div>

        {error && <div className="pp-modal-error"><FiInfo size={16} /> {error}</div>}

        <div className="pp-modal-body">
          {/* Avatar Preview */}
          <div className="pp-modal-avatar-section">
            <InitialsAvatar name={form.name} size={72} />
            <div className="pp-modal-avatar-info">
              <span className="pp-modal-avatar-name">{form.name || 'Your Name'}</span>
              <span className="pp-modal-avatar-email">{user?.email}</span>
            </div>
          </div>

          <div className="pp-modal-divider" />

          <h4 className="pp-modal-section-title"><FiUser size={16} /> Personal Information</h4>
          <div className="pp-modal-grid">
            <div className="pp-field">
              <label htmlFor="ep-name">Full Name</label>
              <div className="pp-field-input-wrap">
                <FiUser className="pp-field-icon" size={16} />
                <input id="ep-name" type="text" value={form.name} onChange={e => update('name', e.target.value)} maxLength={50} placeholder="Your full name" />
              </div>
            </div>
            <div className="pp-field">
              <label htmlFor="ep-username">Username</label>
              <div className="pp-field-input-wrap">
                <span className="pp-field-icon" style={{ fontSize: '14px', fontWeight: 600 }}>@</span>
                <input id="ep-username" type="text" value={form.username} onChange={e => update('username', e.target.value)} maxLength={30} placeholder="username" />
              </div>
            </div>
            <div className="pp-field">
              <label htmlFor="ep-email">Email</label>
              <div className="pp-field-input-wrap pp-field-disabled">
                <FiMail className="pp-field-icon" size={16} />
                <input id="ep-email" type="email" value={user?.email || ''} disabled />
              </div>
              <span className="pp-field-hint">Email cannot be changed</span>
            </div>
            <div className="pp-field">
              <label htmlFor="ep-gender">Gender</label>
              <div className="pp-field-input-wrap">
                <FiUsers className="pp-field-icon" size={16} />
                <select id="ep-gender" value={form.gender} onChange={e => update('gender', e.target.value)}>
                  <option value="">Prefer not to say</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-binary">Non-binary</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <div className="pp-field">
              <label htmlFor="ep-dob">Date of Birth</label>
              <div className="pp-field-input-wrap">
                <FiCalendar className="pp-field-icon" size={16} />
                <input id="ep-dob" type="date" value={form.dateOfBirth} onChange={e => update('dateOfBirth', e.target.value)} />
              </div>
            </div>
            <div className="pp-field">
              <label htmlFor="ep-location">Location</label>
              <div className="pp-field-input-wrap">
                <FiMapPin className="pp-field-icon" size={16} />
                <input id="ep-location" type="text" value={form.location} onChange={e => update('location', e.target.value)} maxLength={100} placeholder="City, Country" />
              </div>
            </div>
          </div>

          <div className="pp-field pp-field-full">
            <label htmlFor="ep-bio">Bio</label>
            <textarea id="ep-bio" value={form.bio} onChange={e => update('bio', e.target.value)} maxLength={300} rows={3} placeholder="Tell us about yourself..." />
            <span className="pp-field-charcount">{form.bio.length}/300</span>
          </div>

          <div className="pp-modal-divider" />

          <h4 className="pp-modal-section-title"><FiExternalLink size={16} /> Social Profiles</h4>
          <div className="pp-modal-grid">
            <div className="pp-field">
              <label htmlFor="ep-github">GitHub</label>
              <div className="pp-field-input-wrap">
                <FiGithub className="pp-field-icon" size={16} />
                <input id="ep-github" type="text" value={form.github} onChange={e => update('github', e.target.value)} maxLength={100} placeholder="github.com/username" />
              </div>
            </div>
            <div className="pp-field">
              <label htmlFor="ep-linkedin">LinkedIn</label>
              <div className="pp-field-input-wrap">
                <FiLinkedin className="pp-field-icon" size={16} />
                <input id="ep-linkedin" type="text" value={form.linkedin} onChange={e => update('linkedin', e.target.value)} maxLength={100} placeholder="linkedin.com/in/username" />
              </div>
            </div>
            <div className="pp-field pp-field-full">
              <label htmlFor="ep-portfolio">Portfolio / Website</label>
              <div className="pp-field-input-wrap">
                <FiGlobe className="pp-field-icon" size={16} />
                <input id="ep-portfolio" type="text" value={form.portfolio} onChange={e => update('portfolio', e.target.value)} maxLength={200} placeholder="https://yourwebsite.com" />
              </div>
            </div>
          </div>
        </div>

        <div className="pp-modal-footer">
          <button className="pp-btn-secondary" onClick={onClose}>Cancel</button>
          <button className="pp-btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ================================================
// MAIN PROFILE PAGE
// ================================================
export default function ProfilePage() {
  const { user, isInitializing, updateProfile } = useAuth();
  const [showEditModal, setShowEditModal] = useState(false);

  if (isInitializing) {
    return (
      <div className="pp-wrapper" id="profile-page">
        <div className="pp-loading">
          <div className="pp-spinner" />
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="pp-wrapper" id="profile-page">
        <div className="pp-loading"><p>Please log in to view your profile.</p></div>
      </div>
    );
  }

  // ---- Compute real stats ----
  const completedIds = user.completedQuestions || [];
  const activityHistory = user.activityHistory || [];
  const activityMap = computeActivityMap(activityHistory);
  const { activeDays, currentStreak, maxStreak } = computeStreaks(activityMap);
  const { totals, solved } = computeDifficultyCounts(completedIds, questions);
  const totalSolved = completedIds.length;
  const totalQuestions = questions.length;
  const totalActivities = activityHistory.length;
  const badges = computeBadges(activeDays, currentStreak, maxStreak, totalSolved);

  const questionMap = {};
  questions.forEach(q => { questionMap[q.id] = q; });
  const recentActivity = [...activityHistory].reverse().slice(0, 6).map(a => {
    const q = questionMap[a.questionId];
    return {
      questionId: a.questionId,
      title: q ? q.title : `Question #${a.questionId}`,
      difficulty: q ? q.difficulty : 'Medium',
      date: new Date(a.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    };
  });

  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : '';

  const displayName = user.username || user.name;

  return (
    <div className="pp-wrapper" id="profile-page">
      <div className="pp-container">

        {/* ===== LEFT SIDEBAR ===== */}
        <aside className="pp-sidebar">
          {/* Identity Card */}
          <div className="pp-card pp-identity-card">
            <div className="pp-identity-top">
              <div className="pp-avatar-wrap">
                <InitialsAvatar name={user.name} size={96} />
                <span className="pp-online-dot" title="Online" />
              </div>
              <h1 className="pp-name">{user.name}</h1>
              {user.username && <span className="pp-username">@{user.username}</span>}
              {user.bio && <p className="pp-bio">{user.bio}</p>}
            </div>

            <div className="pp-identity-meta">
              {user.location && (
                <span className="pp-meta-item"><FiMapPin size={14} /> {user.location}</span>
              )}
              {memberSince && (
                <span className="pp-meta-item"><FiCalendar size={14} /> Joined {memberSince}</span>
              )}
              {user.email && (
                <span className="pp-meta-item"><FiMail size={14} /> {user.email}</span>
              )}
            </div>

            {/* Social Links */}
            {(user.github || user.linkedin || user.portfolio) && (
              <div className="pp-social-links">
                {user.github && (
                  <a href={user.github.startsWith('http') ? user.github : `https://${user.github}`} target="_blank" rel="noopener noreferrer" className="pp-social-link" title="GitHub" aria-label="GitHub profile">
                    <FiGithub size={18} />
                  </a>
                )}
                {user.linkedin && (
                  <a href={user.linkedin.startsWith('http') ? user.linkedin : `https://${user.linkedin}`} target="_blank" rel="noopener noreferrer" className="pp-social-link" title="LinkedIn" aria-label="LinkedIn profile">
                    <FiLinkedin size={18} />
                  </a>
                )}
                {user.portfolio && (
                  <a href={user.portfolio.startsWith('http') ? user.portfolio : `https://${user.portfolio}`} target="_blank" rel="noopener noreferrer" className="pp-social-link" title="Portfolio" aria-label="Portfolio website">
                    <FiGlobe size={18} />
                  </a>
                )}
              </div>
            )}

            <div className="pp-follow-row">
              <div className="pp-follow-item">
                <FiUsers size={15} />
                <b>0</b> <span>Following</span>
              </div>
              <div className="pp-follow-divider" />
              <div className="pp-follow-item">
                <FiUsers size={15} />
                <b>0</b> <span>Followers</span>
              </div>
            </div>

            <button className="pp-edit-btn" onClick={() => setShowEditModal(true)} aria-label="Edit profile">
              <FiEdit2 size={15} /> Edit Profile
            </button>
          </div>

          {/* Community Stats */}
          <div className="pp-card pp-community-card">
            <h3 className="pp-section-heading"><FiActivity size={16} /> Community Stats</h3>
            <div className="pp-community-grid">
              <div className="pp-community-item">
                <FiEye size={20} className="pp-icon-blue" />
                <div className="pp-community-val">0</div>
                <div className="pp-community-label">Views</div>
              </div>
              <div className="pp-community-item">
                <FiCheckSquare size={20} className="pp-icon-green" />
                <div className="pp-community-val">{totalSolved}</div>
                <div className="pp-community-label">Solutions</div>
              </div>
              <div className="pp-community-item">
                <FiMessageCircle size={20} className="pp-icon-cyan" />
                <div className="pp-community-val">0</div>
                <div className="pp-community-label">Discuss</div>
              </div>
              <div className="pp-community-item">
                <FiStar size={20} className="pp-icon-gold" />
                <div className="pp-community-val">0</div>
                <div className="pp-community-label">Reputation</div>
              </div>
            </div>
          </div>
        </aside>

        {/* ===== RIGHT MAIN CONTENT ===== */}
        <main className="pp-main">

          {/* Solved + Badges Row */}
          <div className="pp-top-row">
            {/* Solved Card */}
            <div className="pp-card pp-solved-card">
              <div className="pp-solved-left">
                <CircularProgress solved={totalSolved} total={totalQuestions} />
              </div>
              <div className="pp-solved-right">
                <DiffBar label="Easy" solved={solved.Easy} total={totals.Easy} colorClass="easy" />
                <DiffBar label="Medium" solved={solved.Medium} total={totals.Medium} colorClass="medium" />
                <DiffBar label="Hard" solved={solved.Hard} total={totals.Hard} colorClass="hard" />
              </div>
            </div>

            {/* Badges Card */}
            <div className="pp-card pp-badges-card">
              <div className="pp-badges-header">
                <h3 className="pp-section-heading"><FiAward size={16} /> Badges</h3>
                <span className="pp-badges-count">{badges.length}</span>
              </div>
              {badges.length > 0 ? (
                <div className="pp-badge-showcase">
                  <div className="pp-badge-icon-wrap">
                    <FiAward size={24} />
                  </div>
                  <div className="pp-badge-info">
                    <span className="pp-badge-label">Latest Achievement</span>
                    <span className="pp-badge-name">{badges[0].name}</span>
                    <span className="pp-badge-desc">{badges[0].desc}</span>
                  </div>
                </div>
              ) : (
                <div className="pp-empty-state">
                  <FiAward size={32} className="pp-empty-icon" />
                  <p>No badges earned yet</p>
                  <span>Keep solving to unlock achievements</span>
                </div>
              )}
            </div>
          </div>

          {/* Activity Summary Stats */}
          <div className="pp-card pp-stats-row-card">
            <StatChip icon={<FiActivity size={20} />} value={totalActivities} label="Activities" accent="accent-orange" />
            <StatChip icon={<FiCalendar size={20} />} value={activeDays} label="Active Days" accent="accent-blue" />
            <StatChip icon={<FiTrendingUp size={20} />} value={maxStreak} label="Max Streak" accent="accent-purple" />
            <StatChip icon={<FiZap size={20} />} value={currentStreak} label="Current Streak" accent="accent-green" />
          </div>

          {/* Heatmap Card */}
          <div className="pp-card pp-heatmap-card">
            <div className="pp-heatmap-header">
              <h3 className="pp-section-heading"><FiTarget size={16} /> Activity</h3>
            </div>
            <Heatmap activityMap={activityMap} />
          </div>

          {/* Recent Activity */}
          <div className="pp-card pp-history-card">
            <div className="pp-history-header">
              <h3 className="pp-section-heading"><BiNetworkChart size={17} /> Recent Activity</h3>
            </div>
            <div className="pp-history-list">
              {recentActivity.length > 0 ? (
                recentActivity.map((a, i) => (
                  <Link to={`/questions/${a.questionId}`} key={i} className="pp-history-item">
                    <div className="pp-history-icon-wrap">
                      <FiCheckSquare size={16} />
                    </div>
                    <div className="pp-history-content">
                      <span className="pp-history-title">{a.title}</span>
                      <div className="pp-history-tags">
                        <span className={`pp-tag diff-${a.difficulty.toLowerCase()}`}>{a.difficulty}</span>
                        <span className="pp-tag tag-status">Completed</span>
                      </div>
                    </div>
                    <div className="pp-history-right">
                      <span className="pp-history-date"><FiClock size={13} /> {a.date}</span>
                      <FiChevronRight size={16} className="pp-history-arrow" />
                    </div>
                  </Link>
                ))
              ) : (
                <div className="pp-empty-state" style={{ padding: '40px 24px' }}>
                  <FiActivity size={36} className="pp-empty-icon" />
                  <p>No activity yet</p>
                  <span>Start solving questions to build your history</span>
                </div>
              )}
            </div>
          </div>

        </main>
      </div>

      {showEditModal && (
        <EditProfileModal user={user} onSave={updateProfile} onClose={() => setShowEditModal(false)} />
      )}
    </div>
  );
}
