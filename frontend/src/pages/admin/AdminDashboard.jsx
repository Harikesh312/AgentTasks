import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FiUsers, FiFileText, FiCheckCircle } from 'react-icons/fi';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalUsers: 0, totalQuestions: 0, totalCompletions: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { memoryToken } = useAuth();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const headers = {};
      if (memoryToken) {
        headers['Authorization'] = `Bearer ${memoryToken}`;
      }

      const res = await fetch('http://localhost:5000/api/admin/stats', {
        headers,
        credentials: 'include'
      });
      
      if (!res.ok) throw new Error('Failed to fetch stats');
      
      const data = await res.json();
      setStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading dashboard...</div>;
  if (error) return <div className="admin-error">Error: {error}</div>;

  return (
    <div className="admin-dashboard">
      <div className="admin-page-header">
        <h1>Dashboard Overview</h1>
        <p>Monitor your application's overall performance and metrics.</p>
      </div>

      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-icon users"><FiUsers size={24} /></div>
          <div className="admin-stat-info">
            <span className="admin-stat-value">{stats.totalUsers}</span>
            <span className="admin-stat-label">Total Users</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon questions"><FiFileText size={24} /></div>
          <div className="admin-stat-info">
            <span className="admin-stat-value">{stats.totalQuestions}</span>
            <span className="admin-stat-label">Total Questions</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon completions"><FiCheckCircle size={24} /></div>
          <div className="admin-stat-info">
            <span className="admin-stat-value">{stats.totalCompletions}</span>
            <span className="admin-stat-label">Total Completions</span>
          </div>
        </div>
      </div>
    </div>
  );
}
