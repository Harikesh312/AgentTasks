import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useState, useEffect } from 'react';
import {
  FiGrid, FiUsers, FiFileText, FiMessageSquare,
  FiBarChart2, FiSettings, FiLogOut, FiMenu, FiX, FiHome
} from 'react-icons/fi';
import './AdminLayout.css';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [window.location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const navItems = [
    { section: 'Main', items: [
      { path: '/admin', label: 'Dashboard', icon: <FiGrid size={18} />, exact: true },
      { path: '/admin/users', label: 'Users', icon: <FiUsers size={18} /> },
      { path: '/admin/questions', label: 'Questions', icon: <FiFileText size={18} /> },
    ]},
    { section: 'Management', items: [
      { path: '/admin/interviews', label: 'Interviews', icon: <FiMessageSquare size={18} /> },
      { path: '/admin/analytics', label: 'Analytics', icon: <FiBarChart2 size={18} /> },
      { path: '/admin/settings', label: 'Settings', icon: <FiSettings size={18} /> },
    ]},
    { section: 'Return', items: [
      { path: '/', label: 'Home', icon: <FiHome size={18} />, exact: true, isExternal: true },
    ]}
  ];

  return (
    <div className="ap-layout">
      {/* Mobile Header */}
      <div className="ap-mobile-header">
        <button className="ap-mobile-toggle" onClick={() => setIsMobileOpen(true)}>
          <FiMenu size={22} />
        </button>
        <div className="ap-mobile-brand">
          <img src="/logo02.png" alt="AgentTasks" className="ap-brand-logo-sm" />
          <span className="ap-brand-name-sm">AgentTasks</span>
        </div>
      </div>

      {/* Sidebar Overlay */}
      {isMobileOpen && (
        <div className="ap-sidebar-overlay" onClick={() => setIsMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`ap-sidebar ${isMobileOpen ? 'open' : ''}`}>
        <div className="ap-sidebar-brand">
          <img src="/logo02.png" alt="AgentTasks Logo" className="ap-brand-logo" />
          <div className="ap-brand-text">
            <span className="ap-brand-name">AgentTasks</span>
            <span className="ap-brand-badge">Admin</span>
          </div>
          {isMobileOpen && (
            <button className="ap-mobile-toggle" style={{ marginLeft: 'auto' }} onClick={() => setIsMobileOpen(false)}>
              <FiX size={20} />
            </button>
          )}
        </div>

        <nav className="ap-sidebar-nav">
          {navItems.map((group, idx) => (
            <div key={idx} style={{ marginBottom: idx === navItems.length - 1 ? 0 : '8px' }}>
              <div className="ap-nav-section-label">{group.section}</div>
              {group.items.map(item => {
                if (item.isExternal) {
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className="ap-nav-item"
                    >
                      <span className="ap-nav-icon">{item.icon}</span>
                      {item.label}
                    </Link>
                  );
                }
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.exact}
                    className={({ isActive }) => `ap-nav-item ${isActive ? 'active' : ''}`}
                  >
                    <span className="ap-nav-icon">{item.icon}</span>
                    {item.label}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="ap-sidebar-footer">
          <div className="ap-user-card">
            <div className="ap-user-avatar">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="ap-user-meta">
              <span className="ap-user-name">{user?.name || 'Admin'}</span>
              <span className="ap-user-email">{user?.email || 'admin@agenttasks.com'}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <Link to="/" className="ap-btn-secondary" style={{ flex: 1, justifyContent: 'center', padding: '9px' }}>
              <FiHome size={16} /> Home
            </Link>
            <button className="ap-logout-btn" style={{ flex: 1, marginTop: 0 }} onClick={handleLogout}>
              <FiLogOut size={16} /> Log out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="ap-main">
        <Outlet />
      </main>
    </div>
  );
}
