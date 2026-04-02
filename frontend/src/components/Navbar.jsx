import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, BookOpen, LogIn, UserPlus, LayoutDashboard, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" onClick={() => setIsOpen(false)}>
          <BookOpen className="logo-icon" />
          <span className="logo-text">Learn<span className="gradient-text">ify</span></span>
        </Link>

        {/* Desktop Menu */}
        <div className="navbar-links">
          <Link to="/" className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}>Home</Link>
          <Link to="/courses" className={`nav-item ${location.pathname === '/courses' ? 'active' : ''}`}>Courses</Link>
          {user ? (
            <>
              <Link 
                to={`/${user.role}/dashboard`} 
                className={`nav-item ${location.pathname.includes('dashboard') ? 'active' : ''}`}
              >
                <LayoutDashboard size={18} /> Dashboard
              </Link>
              <div className="user-info-chip">
                <span className="nav-item user-name">{user.name}</span>
              </div>
              <button className="nav-item logout-btn" onClick={logout}>
                <LogOut size={18} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-item login-link">
                <LogIn size={18} /> Login
              </Link>
              <Link to="/signup" className="btn-premium signup-btn">
                <UserPlus size={18} /> Join Now
              </Link>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <div className="mobile-toggle" onClick={toggleMenu}>
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${isOpen ? 'open' : ''}`}>
        <Link to="/" onClick={toggleMenu}>Home</Link>
        <Link to="/courses" onClick={toggleMenu}>Courses</Link>
        {user ? (
          <>
            <Link to={`/${user.role}/dashboard`} className="nav-link" onClick={toggleMenu}>
              Dashboard
            </Link>
            <button className="mobile-logout-btn" onClick={() => { logout(); toggleMenu(); }}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" onClick={toggleMenu}>Login</Link>
            <Link to="/signup" className="btn-premium" onClick={toggleMenu}>Join Now</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
