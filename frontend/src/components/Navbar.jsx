import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiHexagon, FiUser, FiLogOut, FiMenu, FiX } from 'react-icons/fi';
import './Navbar.css';

export default function Navbar() {
  const { isLoggedIn, logout, user } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location]);

  if (location.pathname === '/login' || location.pathname === '/signup') {
    return null;
  }

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="navbar" id="main-navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">
          <FiHexagon className="logo-icon" />
          <span className="logo-text">AgentPrep</span>
        </Link>

        <button className="mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
          {mobileOpen ? <FiX size={22} /> : <FiMenu size={22} />}
        </button>

        <div className={`navbar-links ${mobileOpen ? 'mobile-open' : ''}`}>
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>Dashboard</Link>
          <Link to="/questions" className={`nav-link ${isActive('/questions') ? 'active' : ''}`}>Problems</Link>
          <Link to="/contest" className={`nav-link ${isActive('/contest') ? 'active' : ''}`}>Contest</Link>
          <Link to="/discuss" className={`nav-link ${isActive('/discuss') ? 'active' : ''}`}>Discuss</Link>
          <Link to="/profile" className={`nav-link ${isActive('/profile') ? 'active' : ''}`}>Profile</Link>
        </div>

        <div className="navbar-actions">
          {isLoggedIn ? (
            <div className="profile-dropdown" ref={dropdownRef}>
              <button className="avatar-btn" onClick={() => setDropdownOpen(!dropdownOpen)} id="profile-avatar-btn">
                <div className="avatar">{user?.name ? user.name.charAt(0).toUpperCase() : 'U'}</div>
              </button>
              {dropdownOpen && (
                <div className="dropdown-menu animate-fade">
                  <Link to="/profile" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                    <FiUser size={20} /> Profile
                  </Link>
                  <button className="dropdown-item" onClick={() => { logout(); setDropdownOpen(false); }}>
                    <FiLogOut size={20} /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn-outline btn-sm">Log In</Link>
              <Link to="/signup" className="btn-primary btn-sm">Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
