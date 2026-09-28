import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../config';
import { FiUsers, FiFileText, FiCheckCircle, FiArrowRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const { memoryToken } = useAuth();
  const [stats, setStats] = useState({ totalUsers: 0, totalQuestions: 0, totalCompletions: 0 });
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const headers = {};
      if (memoryToken) headers['Authorization'] = `Bearer ${memoryToken}`;

      const [statsRes, usersRes] = await Promise.all([
        fetch(`${API_URL}/api/admin/stats`, { headers, credentials: 'include' }),
        fetch(`${API_URL}/api/admin/users`, { headers, credentials: 'include' })
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
      
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        // Sort by createdAt desc, take top 4
        const sorted = usersData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setRecentUsers(sorted.slice(0, 4));
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const chartData = useMemo(() => [
    { name: 'Users', value: stats.totalUsers, fill: '#7C5CFC' },
    { name: 'Questions', value: stats.totalQuestions, fill: '#3B82F6' },
    { name: 'Completions', value: stats.totalCompletions, fill: '#10B981' },
  ], [stats]);

  const completionRate = stats.totalUsers > 0 && stats.totalQuestions > 0
    ? ((stats.totalCompletions / (stats.totalUsers * stats.totalQuestions)) * 100).toFixed(1)
    : 0;

  const pieData = useMemo(() => [
    { name: 'Completed', value: parseFloat(completionRate) },
    { name: 'Remaining', value: 100 - parseFloat(completionRate) }
  ], [completionRate]);
  const PIE_COLORS = ['#7C5CFC', '#E2DFF0'];

  if (loading) {
    return (
      <div className="ap-loading">
        <div className="ap-spinner" />
        <span className="ap-loading-text">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="ap-dashboard" style={{ animation: 'apFadeInUp 0.4s ease' }}>
      <div className="ap-page-header" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'linear-gradient(135deg, #ffffff 0%, #f6f4ff 100%)',
        border: '1px solid #DEDAF0',
        borderRadius: '20px',
        padding: '28px 36px',
        boxShadow: '0 8px 32px rgba(124, 92, 252, 0.06)',
        position: 'relative',
        overflow: 'hidden',
        marginBottom: '24px'
      }}>
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '60%' }}>
          <h1 style={{ fontSize: '1.7rem', fontWeight: '800', color: '#0F172A', marginBottom: '8px' }}>Dashboard Overview</h1>
          <p style={{ color: '#64748B', fontSize: '1.05rem', margin: 0, lineHeight: '1.5' }}>Monitor your application's overall performance, user growth, and AI interview metrics.</p>
        </div>
        
        {/* Premium Illustration */}
        <div style={{
          height: '110px',
          width: '180px',
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end'
        }}>
          <img 
            src="/admin-illustration.jpg" 
            alt="AI Analytics Illustration" 
            style={{
              height: '150px',
              width: 'auto',
              objectFit: 'contain',
              mixBlendMode: 'multiply',
              transform: 'scale(1.1) translateX(10px) translateY(-5px)'
            }} 
          />
        </div>
        
        {/* Soft background glow for the header */}
        <div style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '200px',
          height: '200px',
          background: 'radial-gradient(circle, rgba(124,92,252,0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none'
        }} />
      </div>

      {/* Metrics Row */}
      <div className="ap-dash-metrics">
        <div className="ap-metric ap-shade-lavender">
          <div className="ap-metric-ico" style={{ background: '#EAE5FD', color: '#7C5CFC' }}>
            <FiUsers size={22} />
          </div>
          <div className="ap-metric-data">
            <span className="ap-metric-val">{stats.totalUsers}</span>
            <span className="ap-metric-lbl">Total Users</span>
          </div>
          <div className="ap-metric-glow" style={{ background: 'radial-gradient(circle, rgba(124,92,252,0.06) 0%, transparent 70%)' }} />
        </div>
        <div className="ap-metric ap-shade-blue">
          <div className="ap-metric-ico" style={{ background: '#E0EEFC', color: '#2563EB' }}>
            <FiFileText size={22} />
          </div>
          <div className="ap-metric-data">
            <span className="ap-metric-val">{stats.totalQuestions}</span>
            <span className="ap-metric-lbl">Total Questions</span>
          </div>
          <div className="ap-metric-glow" style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)' }} />
        </div>
        <div className="ap-metric ap-shade-green">
          <div className="ap-metric-ico" style={{ background: '#E2F8ED', color: '#059669' }}>
            <FiCheckCircle size={22} />
          </div>
          <div className="ap-metric-data">
            <span className="ap-metric-val">{stats.totalCompletions}</span>
            <span className="ap-metric-lbl">Total Completions</span>
          </div>
          <div className="ap-metric-glow" style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)' }} />
        </div>
      </div>

      <div className="ap-dash-grid">
        {/* Chart */}
        <div className="ap-card ap-shade-lavender">
          <div className="ap-card-header">
            <div className="ap-card-header-text">
              <h3>Performance Overview</h3>
              <p>Real-time platform metrics breakdown</p>
            </div>
          </div>
          <div className="ap-card-body" style={{ padding: '24px 24px 10px' }}>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2DFF0" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#8E90A6', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#8E90A6', fontSize: 12 }} />
                <Tooltip 
                  cursor={{ fill: 'rgba(124,92,252,0.04)' }}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #E2DFF0', boxShadow: '0 4px 16px rgba(124,92,252,0.08)', fontWeight: 600 }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={48}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="ap-card ap-shade-blue">
          <div className="ap-card-header">
            <div className="ap-card-header-text">
              <h3>Quick Actions</h3>
              <p>Jump to commonly used features</p>
            </div>
          </div>
          <div className="ap-card-body ap-qa-list">
            <Link to="/admin/users" className="ap-qa-item ap-shade-purple">
              <div className="ap-qa-ico" style={{ background: '#EAE5FD', color: '#7C5CFC' }}><FiUsers size={18} /></div>
              <div className="ap-qa-info">
                <h4>Manage Users</h4>
                <p>View and edit user accounts</p>
              </div>
              <FiArrowRight className="ap-qa-arrow" size={16} />
            </Link>
            <Link to="/admin/questions" className="ap-qa-item ap-shade-blue">
              <div className="ap-qa-ico" style={{ background: '#E0EEFC', color: '#2563EB' }}><FiFileText size={18} /></div>
              <div className="ap-qa-info">
                <h4>View Questions</h4>
                <p>Browse and add questions</p>
              </div>
              <FiArrowRight className="ap-qa-arrow" size={16} />
            </Link>
            <Link to="/admin/interviews" className="ap-qa-item ap-shade-green">
              <div className="ap-qa-ico" style={{ background: '#E2F8ED', color: '#059669' }}><FiCheckCircle size={18} /></div>
              <div className="ap-qa-info">
                <h4>Interviews</h4>
                <p>Monitor interview sessions</p>
              </div>
              <FiArrowRight className="ap-qa-arrow" size={16} />
            </Link>
            <Link to="/admin/settings" className="ap-qa-item ap-qa-item-highlight">
              <div className="ap-qa-ico"><FiUsers size={18} /></div>
              <div className="ap-qa-info">
                <h4>Admin Settings</h4>
                <p>Update profile & password</p>
              </div>
              <FiArrowRight className="ap-qa-arrow" size={16} />
            </Link>
          </div>
        </div>
      </div>

      <div className="ap-dash-grid">
        {/* Recent Users */}
        <div className="ap-card ap-shade-lavender">
          <div className="ap-card-header">
            <div className="ap-card-header-text">
              <h3>Recent Users</h3>
              <p>Latest registered accounts</p>
            </div>
          </div>
          <div className="ap-card-body" style={{ padding: 0 }}>
            {recentUsers.length > 0 ? (
              <div className="ap-recent-list">
                {recentUsers.map(u => (
                  <div key={u._id} className="ap-recent-item">
                    <div className="ap-user-cell">
                      <div className="ap-user-cell-av">{u.name?.charAt(0).toUpperCase() || '?'}</div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span className="ap-user-cell-name">{u.name}</span>
                        <span className="ap-text-sec" style={{ fontSize: '0.8rem' }}>{u.email}</span>
                      </div>
                    </div>
                    <span className={`ap-badge ${u.role === 'admin' ? 'ap-badge-admin' : 'ap-badge-user'}`}>
                      {u.role === 'admin' ? 'Admin' : 'User'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="ap-empty-state" style={{ padding: '30px' }}>
                <p>No recent users.</p>
              </div>
            )}
          </div>
        </div>

        {/* Platform Summary Pie */}
        <div className="ap-card ap-shade-blue">
          <div className="ap-card-header">
            <div className="ap-card-header-text">
              <h3>Platform Summary</h3>
              <p>Overall completion metrics</p>
            </div>
          </div>
          <div className="ap-card-body ap-pie-layout">
            <div className="ap-pie-chart-container">
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie data={pieData} innerRadius={55} outerRadius={75} dataKey="value" stroke="none" paddingAngle={2}>
                    {pieData.map((_, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index]} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="ap-pie-center">
                <span className="ap-pie-center-val">{completionRate}%</span>
                <span className="ap-pie-center-lbl">Complete</span>
              </div>
            </div>
            
            <div className="ap-pie-legend">
              <div className="ap-legend-item">
                <div className="ap-legend-dot" style={{ background: '#7C5CFC' }} />
                <span>Completion rate</span>
                <strong>{completionRate}%</strong>
              </div>
              <div className="ap-legend-item">
                <div className="ap-legend-dot" style={{ background: '#3B82F6' }} />
                <span>Active users</span>
                <strong>{stats.totalUsers}</strong>
              </div>
              <div className="ap-legend-item">
                <div className="ap-legend-dot" style={{ background: '#10B981' }} />
                <span>Total completions</span>
                <strong>{stats.totalCompletions}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
