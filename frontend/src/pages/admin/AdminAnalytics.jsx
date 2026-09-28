import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../config';
import { FiUsers, FiFileText, FiCheckCircle, FiTrendingUp, FiActivity } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import './AdminAnalytics.css';

export default function AdminAnalytics() {
  const { memoryToken } = useAuth();
  const [stats, setStats] = useState({ totalUsers: 0, totalQuestions: 0, totalCompletions: 0 });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchStats(), fetchUsers()]).then(() => setLoading(false));
  }, []);

  const fetchStats = async () => {
    try {
      const headers = {};
      if (memoryToken) headers['Authorization'] = `Bearer ${memoryToken}`;
      const res = await fetch(`${API_URL}/api/admin/stats`, { headers, credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) { /* non-critical */ }
  };

  const fetchUsers = async () => {
    try {
      const headers = {};
      if (memoryToken) headers['Authorization'] = `Bearer ${memoryToken}`;
      const res = await fetch(`${API_URL}/api/admin/users`, { headers, credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) { /* non-critical */ }
  };

  const roleDistribution = useMemo(() => {
    const admins = users.filter(u => u.role === 'admin').length;
    const regularUsers = users.filter(u => u.role === 'user').length;
    return [
      { name: 'Admin', value: admins },
      { name: 'User', value: regularUsers },
    ];
  }, [users]);

  const completionDistribution = useMemo(() => {
    const groups = { '0': 0, '1-2': 0, '3-5': 0, '6+': 0 };
    users.forEach(u => {
      const count = u.completedQuestions?.length || 0;
      if (count === 0) groups['0']++;
      else if (count <= 2) groups['1-2']++;
      else if (count <= 5) groups['3-5']++;
      else groups['6+']++;
    });
    return Object.entries(groups).map(([name, value]) => ({ name, value }));
  }, [users]);

  const userGrowthData = useMemo(() => {
    const months = {};
    users.forEach(u => {
      if (u.createdAt) {
        const date = new Date(u.createdAt);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const label = date.toLocaleString('default', { month: 'short' });
        if (!months[key]) months[key] = { name: label, count: 0 };
        months[key].count++;
      }
    });
    const sorted = Object.entries(months).sort(([a], [b]) => a.localeCompare(b));
    let total = 0;
    return sorted.map(([_, val]) => {
      total += val.count;
      return { name: val.name, users: total };
    });
  }, [users]);

  const ROLE_COLORS = ['#3B82F6', '#E2DFF0'];
  const COMPLETION_COLORS = ['#E2DFF0', '#93C5FD', '#7C5CFC', '#10B981'];

  const completionRate = stats.totalUsers > 0 && stats.totalQuestions > 0
    ? ((stats.totalCompletions / (stats.totalUsers * stats.totalQuestions)) * 100).toFixed(1)
    : 0;

  const avgCompletions = stats.totalUsers > 0
    ? (stats.totalCompletions / stats.totalUsers).toFixed(1)
    : 0;

  if (loading) {
    return (
      <div className="ap-loading">
        <div className="ap-spinner" />
        <span className="ap-loading-text">Loading analytics...</span>
      </div>
    );
  }

  return (
    <div className="ap-analytics" style={{ animation: 'apFadeInUp 0.4s ease forwards' }}>
      <div className="ap-page-header">
        <h1>Analytics</h1>
        <p>Detailed insights into platform usage and performance.</p>
      </div>

      <div className="ap-a-stats">
        <div className="ap-metric ap-shade-lavender">
          <div className="ap-metric-ico" style={{ background: '#EAE5FD', color: '#7C5CFC' }}>
            <FiUsers size={20} />
          </div>
          <div className="ap-metric-data">
            <span className="ap-metric-val">{stats.totalUsers}</span>
            <span className="ap-metric-lbl">Total Users</span>
          </div>
          <div className="ap-metric-glow" style={{ background: 'radial-gradient(circle, rgba(124,92,252,0.06) 0%, transparent 70%)' }} />
        </div>
        <div className="ap-metric ap-shade-blue">
          <div className="ap-metric-ico" style={{ background: '#E0EEFC', color: '#3B82F6' }}>
            <FiFileText size={20} />
          </div>
          <div className="ap-metric-data">
            <span className="ap-metric-val">{stats.totalQuestions}</span>
            <span className="ap-metric-lbl">Total Questions</span>
          </div>
          <div className="ap-metric-glow" style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)' }} />
        </div>
        <div className="ap-metric ap-shade-green">
          <div className="ap-metric-ico" style={{ background: '#E2F8ED', color: '#10B981' }}>
            <FiCheckCircle size={20} />
          </div>
          <div className="ap-metric-data">
            <span className="ap-metric-val">{stats.totalCompletions}</span>
            <span className="ap-metric-lbl">Completions</span>
          </div>
          <div className="ap-metric-glow" style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)' }} />
        </div>
        <div className="ap-metric ap-shade-orange">
          <div className="ap-metric-ico" style={{ background: '#FEF7ED', color: '#F59E0B' }}>
            <FiTrendingUp size={20} />
          </div>
          <div className="ap-metric-data">
            <span className="ap-metric-val">{completionRate}%</span>
            <span className="ap-metric-lbl">Completion Rate</span>
          </div>
          <div className="ap-metric-glow" style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 70%)' }} />
        </div>
      </div>

      <div className="ap-a-grid">
        {/* User Growth */}
        <div className="ap-card ap-shade-lavender">
          <div className="ap-card-header">
            <div className="ap-section-icon" style={{ background: '#EAE5FD', color: '#7C5CFC', width: 32, height: 32 }}><FiActivity size={16} /></div>
            <div className="ap-card-header-text">
              <h3>User Growth</h3>
              <p>Cumulative registered users</p>
            </div>
          </div>
          <div className="ap-card-body">
            {userGrowthData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={userGrowthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradientUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7C5CFC" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#7C5CFC" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2DFF0" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#8E90A6', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#8E90A6', fontSize: 12 }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ background: '#fff', border: '1px solid #E2DFF0', borderRadius: '12px', boxShadow: '0 4px 16px rgba(124,92,252,0.08)' }}
                  />
                  <Area type="monotone" dataKey="users" stroke="#7C5CFC" strokeWidth={2} fill="url(#gradientUsers)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="ap-empty-state" style={{ padding: '40px' }}><p>No data</p></div>
            )}
          </div>
        </div>

        {/* Completions */}
        <div className="ap-card ap-shade-green">
          <div className="ap-card-header">
            <div className="ap-section-icon" style={{ background: '#E2F8ED', color: '#10B981', width: 32, height: 32 }}><FiCheckCircle size={16} /></div>
            <div className="ap-card-header-text">
              <h3>Completion Distribution</h3>
              <p>By number of completions</p>
            </div>
          </div>
          <div className="ap-card-body">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={completionDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2DFF0" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#8E90A6', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#8E90A6', fontSize: 12 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: '#fff', border: '1px solid #E2DFF0', borderRadius: '12px', boxShadow: '0 4px 16px rgba(124,92,252,0.08)' }}
                  cursor={{ fill: 'rgba(124,92,252,0.04)' }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={48}>
                  {completionDistribution.map((_, index) => <Cell key={index} fill={COMPLETION_COLORS[index]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Role Distribution Pie */}
        <div className="ap-card ap-shade-purple">
          <div className="ap-card-header">
            <div className="ap-section-icon" style={{ background: '#E0EEFC', color: '#3B82F6', width: 32, height: 32 }}><FiUsers size={16} /></div>
            <div className="ap-card-header-text">
              <h3>Role Distribution</h3>
              <p>Admin vs regular users</p>
            </div>
          </div>
          <div className="ap-card-body ap-a-pie-body">
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie data={roleDistribution} innerRadius={55} outerRadius={75} paddingAngle={2} dataKey="value" stroke="none">
                  {roleDistribution.map((_, index) => <Cell key={index} fill={ROLE_COLORS[index]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #E2DFF0' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="ap-a-pie-legend">
              {roleDistribution.map((item, i) => (
                <div key={item.name} className="ap-a-pie-item">
                  <div className="ap-a-pie-dot" style={{ background: ROLE_COLORS[i] }} />
                  <span className="ap-a-pie-lbl">{item.name}</span>
                  <strong className="ap-a-pie-val">{item.value}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="ap-card ap-shade-orange">
          <div className="ap-card-header">
            <div className="ap-section-icon" style={{ background: '#FEF7ED', color: '#F59E0B', width: 32, height: 32 }}><FiTrendingUp size={16} /></div>
            <div className="ap-card-header-text">
              <h3>Key Metrics</h3>
              <p>Platform performance indicators</p>
            </div>
          </div>
          <div className="ap-card-body" style={{ padding: '0' }}>
            <div className="ap-a-metrics-list">
              <div className="ap-a-metric-item">
                <div className="ap-a-metric-dot" style={{ background: '#7C5CFC' }} />
                <span className="ap-a-metric-lbl">Avg. completions per user</span>
                <strong className="ap-a-metric-val">{avgCompletions}</strong>
              </div>
              <div className="ap-a-metric-item">
                <div className="ap-a-metric-dot" style={{ background: '#10B981' }} />
                <span className="ap-a-metric-lbl">Completion rate</span>
                <strong className="ap-a-metric-val">{completionRate}%</strong>
              </div>
              <div className="ap-a-metric-item">
                <div className="ap-a-metric-dot" style={{ background: '#3B82F6' }} />
                <span className="ap-a-metric-lbl">Total questions available</span>
                <strong className="ap-a-metric-val">{stats.totalQuestions}</strong>
              </div>
              <div className="ap-a-metric-item">
                <div className="ap-a-metric-dot" style={{ background: '#F59E0B' }} />
                <span className="ap-a-metric-lbl">Active users</span>
                <strong className="ap-a-metric-val">
                  {users.filter(u => (u.completedQuestions?.length || 0) > 0).length}
                </strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
