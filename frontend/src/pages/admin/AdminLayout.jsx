import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiHome, FiUsers, FiFileText, FiLogOut } from 'react-icons/fi';
import './AdminLayout.css';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <h2>Admin Panel</h2>
          <span className="admin-badge">Admin</span>
        </div>
        
        <nav className="admin-nav">
          <NavLink to="/admin" end className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
            <FiHome size={20} />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/admin/users" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
            <FiUsers size={20} />
            <span>Users</span>
          </NavLink>
          <NavLink to="/admin/questions" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
            <FiFileText size={20} />
            <span>Questions</span>
          </NavLink>
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-user-info">
            <div className="admin-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
            <div className="admin-details">
              <span className="admin-name">{user?.name}</span>
              <span className="admin-email">{user?.email}</span>
            </div>
          </div>
          <button onClick={handleLogout} className="admin-logout-btn">
            <FiLogOut size={18} />
            <span>Log out</span>
          </button>
        </div>
      </aside>

      <main className="admin-main-content">
        <Outlet />
      </main>
    </div>
  );
}
