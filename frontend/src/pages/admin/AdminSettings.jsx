import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FiUser, FiLock, FiSave, FiCheckCircle, FiAlertCircle, FiShield, FiActivity, FiUsers, FiFileText, FiMessageSquare, FiHome, FiLogOut } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import { API_URL } from '../../config';
import './AdminSettings.css';

export default function AdminSettings() {
  const { user, memoryToken, updateProfile, logout } = useAuth();
  const navigate = useNavigate();

  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [stats, setStats] = useState({ totalUsers: 0, totalQuestions: 0, totalCompletions: 0 });

  useEffect(() => {
    fetchStats();
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

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileSuccess('');
    setProfileError('');

    try {
      await updateProfile({ name: profileForm.name });
      setProfileSuccess('Profile updated successfully!');
    } catch (err) {
      setProfileError(err.message || 'Failed to update profile.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordSuccess('');
    setPasswordError('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match.');
      setPasswordLoading(false);
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters.');
      setPasswordLoading(false);
      return;
    }

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (memoryToken) headers['Authorization'] = `Bearer ${memoryToken}`;

      const res = await fetch(`${API_URL}/api/auth/profile`, {
        method: 'PUT',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to change password.');
      }

      setPasswordSuccess('Password changed successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPasswordError(err.message || 'Failed to change password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <div className="ap-settings" style={{ animation: 'apFadeInUp 0.4s ease forwards' }}>
      <div className="ap-page-header">
        <h1>Settings</h1>
        <p>Manage your admin account preferences and view platform status.</p>
      </div>

      <div className="ap-settings-grid">
        {/* Left Column: Forms */}
        <div className="ap-settings-main">
          {/* Profile Settings */}
          <div className="ap-card ap-settings-card ap-shade-purple">
            <div className="ap-card-header">
              <div className="ap-section-icon">
                <FiUser size={18} />
              </div>
              <div className="ap-card-header-text">
                <h3>Profile Information</h3>
                <p>Update your admin account details.</p>
              </div>
            </div>
            <div className="ap-card-body">
              {profileSuccess && (
                <div className="ap-success-msg">
                  <FiCheckCircle size={17} />
                  {profileSuccess}
                </div>
              )}
              {profileError && (
                <div className="ap-error-msg">
                  <FiAlertCircle size={17} />
                  {profileError}
                </div>
              )}
              <form onSubmit={handleProfileSubmit} className="ap-settings-form">
                <div className="ap-form-group">
                  <label className="ap-form-label">Full Name</label>
                  <input
                    type="text"
                    className="ap-form-input"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    placeholder="Your name"
                    required
                  />
                </div>
                <div className="ap-form-group">
                  <label className="ap-form-label">Email Address</label>
                  <input
                    type="email"
                    className="ap-form-input"
                    value={profileForm.email}
                    disabled
                  />
                  <span style={{ fontSize: '0.78rem', color: 'var(--ap-text-muted)', marginTop: '4px' }}>
                    Email cannot be changed for security reasons.
                  </span>
                </div>
                <div className="ap-form-actions">
                  <button type="submit" className="ap-btn-primary" disabled={profileLoading}>
                    <FiSave size={15} />
                    {profileLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Password Change */}
          <div className="ap-card ap-settings-card ap-shade-blue">
            <div className="ap-card-header">
              <div className="ap-section-icon">
                <FiLock size={18} />
              </div>
              <div className="ap-card-header-text">
                <h3>Change Password</h3>
                <p>Ensure your account is using a long, random password.</p>
              </div>
            </div>
            <div className="ap-card-body">
              {passwordSuccess && (
                <div className="ap-success-msg">
                  <FiCheckCircle size={17} />
                  {passwordSuccess}
                </div>
              )}
              {passwordError && (
                <div className="ap-error-msg">
                  <FiAlertCircle size={17} />
                  {passwordError}
                </div>
              )}
              <form onSubmit={handlePasswordSubmit} className="ap-settings-form">
                <div className="ap-form-group">
                  <label className="ap-form-label">Current Password</label>
                  <input
                    type="password"
                    className="ap-form-input"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    required
                    placeholder="••••••••"
                  />
                </div>
                <div className="ap-settings-form-row">
                  <div className="ap-form-group">
                    <label className="ap-form-label">New Password</label>
                    <input
                      type="password"
                      className="ap-form-input"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      required
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="ap-form-group">
                    <label className="ap-form-label">Confirm New Password</label>
                    <input
                      type="password"
                      className="ap-form-input"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      required
                      placeholder="••••••••"
                    />
                  </div>
                </div>
                <div className="ap-form-actions">
                  <button type="submit" className="ap-btn-primary" disabled={passwordLoading}>
                    <FiLock size={15} />
                    {passwordLoading ? 'Changing...' : 'Update Password'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Right Column: Info Cards */}
        <div className="ap-settings-sidebar">
          {/* Admin Account Details */}
          <div className="ap-card ap-shade-green">
            <div className="ap-card-header">
              <div className="ap-section-icon" style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981' }}>
                <FiShield size={18} />
              </div>
              <div className="ap-card-header-text">
                <h3>Admin Account</h3>
                <p>Current session details</p>
              </div>
            </div>
            <div className="ap-card-body ap-account-summary">
              <div className="ap-account-avatar">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="ap-account-info">
                <h4>{user?.name || 'Admin'}</h4>
                <p>{user?.email || 'admin@agenttasks.com'}</p>
                <div className="ap-account-badges">
                  <span className="ap-badge ap-badge-admin">Administrator</span>
                  <span className="ap-badge ap-badge-easy">Active</span>
                </div>
              </div>
            </div>
            
            <div style={{ padding: '0 22px 22px', display: 'flex', gap: '8px' }}>
              <Link to="/" className="ap-btn-secondary" style={{ flex: 1, justifyContent: 'center', padding: '10px' }}>
                <FiHome size={16} /> Home
              </Link>
              <button className="ap-logout-btn" onClick={handleLogout} style={{ flex: 1, marginTop: 0, padding: '10px', justifyContent: 'center' }}>
                <FiLogOut size={16} /> Log out
              </button>
            </div>
          </div>

          {/* System Overview */}
          <div className="ap-card ap-shade-orange">
            <div className="ap-card-header">
              <div className="ap-section-icon" style={{ background: 'rgba(59,130,246,0.1)', color: '#3B82F6' }}>
                <FiActivity size={18} />
              </div>
              <div className="ap-card-header-text">
                <h3>Platform Overview</h3>
                <p>Quick status of your application</p>
              </div>
            </div>
            <div className="ap-card-body" style={{ padding: '0' }}>
              <div className="ap-sys-metric-list">
                <div className="ap-sys-metric-item">
                  <div className="ap-sys-metric-ico"><FiUsers size={16} /></div>
                  <span className="ap-sys-metric-lbl">Total Registered Users</span>
                  <strong className="ap-sys-metric-val">{stats.totalUsers}</strong>
                </div>
                <div className="ap-sys-metric-item">
                  <div className="ap-sys-metric-ico"><FiFileText size={16} /></div>
                  <span className="ap-sys-metric-lbl">Questions Database</span>
                  <strong className="ap-sys-metric-val">{stats.totalQuestions}</strong>
                </div>
                <div className="ap-sys-metric-item">
                  <div className="ap-sys-metric-ico"><FiMessageSquare size={16} /></div>
                  <span className="ap-sys-metric-lbl">Completed Sessions</span>
                  <strong className="ap-sys-metric-val">{stats.totalCompletions}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
