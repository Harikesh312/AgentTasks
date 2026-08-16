import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiHexagon, FiUser, FiLogOut, FiMenu, FiX, FiChevronDown, FiUsers, FiGrid } from 'react-icons/fi';
import './Navbar.css';

export default function Navbar() {
  const { isLoggedIn, toggleAuth } = useAuth();
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

  const isActive = (path) => location.pathname === path;

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
          <Link to="/" className={`nav-link ${isActive('/profile') ? 'active' : ''}`}>Dashboard</Link>
          <Link to="/questions" className={`nav-link ${isActive('/questions') ? 'active' : ''}`}>Problems</Link>
          <Link to="" className={`nav-link ${false ? 'active' : ''}`}>Contest</Link>
          <Link to="" className={`nav-link ${false ? 'active' : ''}`}>Discuss</Link>
          
          <div className="nav-dropdown-container">
            <span className="nav-link nav-dropdown-trigger">
              Interview <FiChevronDown size={14} />
            </span>
            <div className="nav-dropdown-menu">
              <Link to="" className="nav-dropdown-item">
                <FiUsers className="icon-blue" size={16} /> Online Interview
              </Link>
              <Link to="" className="nav-dropdown-item">
                <FiGrid className="icon-blue" size={16} /> Assessment
              </Link>
            </div>
          </div>
        </div>

        <div className="navbar-actions">
          {isLoggedIn ? (
            <div className="profile-dropdown" ref={dropdownRef}>
              <button className="avatar-btn" onClick={() => setDropdownOpen(!dropdownOpen)} id="profile-avatar-btn">
                <div className="avatar">AC</div>
              </button>
              {dropdownOpen && (
                <div className="dropdown-menu animate-fade">
                  <Link to="/profile" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                    <FiUser size={16} /> Profile
                  </Link>
                  <button className="dropdown-item" onClick={() => { toggleAuth(); setDropdownOpen(false); }}>
                    <FiLogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <button className="btn-outline btn-sm" onClick={toggleAuth}>Log In</button>
              <button className="btn-primary btn-sm" onClick={toggleAuth}>Sign Up</button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
