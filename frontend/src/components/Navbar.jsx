import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, BookOpen, LogIn, UserPlus, LayoutDashboard, LogOut, Settings as SettingsIcon, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on location change
  useEffect(() => {
    setShowProfileMenu(false);
    setIsOpen(false);
  }, [location]);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" onClick={() => setIsOpen(false)}>
          <BookOpen className="logo-icon" />
          <span className="logo-text">Learn<span className="gradient-text">ify</span></span>
        </Link>

        {/* Main Navigation */}
        <div className="navbar-main">
          <Link to="/" className={`navbar-link ${location.pathname === '/' ? 'active' : ''}`}>Home</Link>
          <Link to="/courses" className={`navbar-link ${location.pathname === '/courses' ? 'active' : ''}`}>Courses</Link>
        </div>

        {/* Action Group */}
        <div className="navbar-actions">
          <button className="theme-toggle-btn" onClick={toggleTheme} title="Toggle Theme">
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <div className="navbar-divider"></div>

          {user ? (
            <div className="user-profile-wrapper">
              <div 
                className={`user-profile ${showProfileMenu ? 'active' : ''}`}
                onClick={() => setShowProfileMenu(!showProfileMenu)}
              >
                <div className="user-avatar">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="user-details">
                  <span className="user-name">{user.name}</span>
                </div>
              </div>

              {showProfileMenu && (
                <div className="profile-dropdown">
                  <Link to={`/${user.role}/dashboard`} className="dropdown-item">
                    <LayoutDashboard size={18} /> Dashboard
                  </Link>
                  <Link to="/settings" className="dropdown-item">
                    <SettingsIcon size={18} /> Settings
                  </Link>
                  <div className="dropdown-divider"></div>
                  <button className="dropdown-item logout-item" onClick={logout}>
                    <LogOut size={18} /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-actions">
              <Link to="/login" className="login-link">Login</Link>
              <Link to="/signup" className="btn-premium signup-btn">Join Now</Link>
            </div>
          )}

          {/* Mobile Toggle */}
          <div className="mobile-toggle" onClick={toggleMenu}>
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${isOpen ? 'open' : ''}`}>
        <div className="mobile-menu-header">
          <Link to="/" onClick={toggleMenu} className="navbar-logo">
            <BookOpen className="logo-icon" />
            <span className="logo-text">Learn<span className="gradient-text">ify</span></span>
          </Link>
          <div className="mobile-close" onClick={toggleMenu}>
            <X size={28} />
          </div>
        </div>

        <div className="mobile-nav-links">
          <Link to="/" onClick={toggleMenu}>Home</Link>
          <Link to="/courses" onClick={toggleMenu}>Courses</Link>
          {user ? (
            <>
              <Link to={`/${user.role}/dashboard`} onClick={toggleMenu}>Dashboard</Link>
              <Link to="/settings" onClick={toggleMenu}>Settings</Link>
              <button className="mobile-logout-btn" onClick={() => { logout(); toggleMenu(); }}>
                <LogOut size={20} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={toggleMenu}>Login</Link>
              <Link to="/signup" className="btn-premium" onClick={toggleMenu}>Join Now</Link>
            </>
          )}
        </div>

        <div className="mobile-menu-footer">
          <button className="mobile-theme-toggle" onClick={() => { toggleTheme(); toggleMenu(); }}>
            {theme === 'dark' ? <><Sun size={20} /> Light Mode</> : <><Moon size={20} /> Dark Mode</>}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
