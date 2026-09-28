import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../config';
import { FiMessageSquare, FiSearch, FiCheckCircle, FiClock, FiEye, FiActivity } from 'react-icons/fi';
import './AdminInterviews.css';

export default function AdminInterviews() {
  const { memoryToken } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchInterviewData();
  }, []);

  const fetchInterviewData = async () => {
    try {
      const headers = {};
      if (memoryToken) headers['Authorization'] = `Bearer ${memoryToken}`;
      const res = await fetch(`${API_URL}/api/admin/users`, { headers, credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      // Non-critical
    } finally {
      setLoading(false);
    }
  };

  const interviewData = useMemo(() => {
    return users
      .filter(u => u.completedQuestions && u.completedQuestions.length > 0)
      .map(u => ({
        _id: u._id,
        name: u.name,
        email: u.email,
        completions: u.completedQuestions.length,
        status: u.completedQuestions.length >= 3 ? 'Completed' : 'In Progress',
        lastActive: u.updatedAt || u.createdAt
      }))
      .filter(u =>
        u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => new Date(b.lastActive) - new Date(a.lastActive));
  }, [users, searchQuery]);

  const stats = useMemo(() => {
    const total = interviewData.length;
    const completed = interviewData.filter(i => i.status === 'Completed').length;
    const inProgress = total - completed;
    return { total, completed, inProgress };
  }, [interviewData]);

  const handleView = () => {
    alert("Detailed interview view requires further backend implementation.");
  }

  if (loading) {
    return (
      <div className="ap-loading">
        <div className="ap-spinner" />
        <span className="ap-loading-text">Loading interview sessions...</span>
      </div>
    );
  }

  return (
    <div className="ap-interviews" style={{ animation: 'apFadeInUp 0.4s ease forwards' }}>
      <div className="ap-page-header">
        <h1>Interviews</h1>
        <p>Monitor user interview sessions and progress.</p>
      </div>

      {/* Summary Cards */}
      <div className="ap-i-stats">
        <div className="ap-metric ap-shade-blue">
          <div className="ap-metric-ico" style={{ background: '#E0EEFC', color: '#3B82F6' }}>
            <FiActivity size={20} />
          </div>
          <div className="ap-metric-data">
            <span className="ap-metric-val">{stats.total}</span>
            <span className="ap-metric-lbl">Total Sessions</span>
          </div>
        </div>
        <div className="ap-metric ap-shade-green">
          <div className="ap-metric-ico" style={{ background: '#E2F8ED', color: '#10B981' }}>
            <FiCheckCircle size={20} />
          </div>
          <div className="ap-metric-data">
            <span className="ap-metric-val">{stats.completed}</span>
            <span className="ap-metric-lbl">Completed (3+ questions)</span>
          </div>
        </div>
        <div className="ap-metric ap-shade-orange">
          <div className="ap-metric-ico" style={{ background: '#FEF7ED', color: '#F59E0B' }}>
            <FiClock size={20} />
          </div>
          <div className="ap-metric-data">
            <span className="ap-metric-val">{stats.inProgress}</span>
            <span className="ap-metric-lbl">In Progress</span>
          </div>
        </div>
      </div>

      <div className="ap-card ap-shade-green">
        <div className="ap-card-header" style={{ padding: '16px 22px' }}>
          <div className="ap-search-wrap" style={{ maxWidth: '400px' }}>
            <FiSearch size={16} className="ap-search-ico" />
            <input
              type="text"
              className="ap-search"
              placeholder="Search candidate name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="ap-table-wrapper" style={{ border: 'none', boxShadow: 'none', borderRadius: 0 }}>
          {interviewData.length > 0 ? (
            <table className="ap-table">
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Questions Completed</th>
                  <th>Last Active</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {interviewData.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <div className="ap-user-cell">
                        <div className="ap-user-cell-av">
                          {item.name?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span className="ap-user-cell-name">{item.name}</span>
                          <span className="ap-text-sec" style={{ fontSize: '0.8rem' }}>{item.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <strong style={{ color: 'var(--ap-text)' }}>{item.completions}</strong>
                    </td>
                    <td>
                      <span className="ap-text-sec">
                        {item.lastActive ? new Date(item.lastActive).toLocaleDateString() : 'N/A'}
                      </span>
                    </td>
                    <td>
                      <span className={`ap-badge ${item.status === 'Completed' ? 'ap-badge-easy' : 'ap-badge-medium'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td>
                      <div className="ap-action-btns">
                        <button className="ap-btn-ghost" onClick={handleView} title="View Session">
                          <FiEye size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="ap-empty-state">
              <div className="ap-empty-icon">
                <FiMessageSquare size={24} />
              </div>
              <h3>No interview sessions found</h3>
              <p>Candidates who complete questions will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
