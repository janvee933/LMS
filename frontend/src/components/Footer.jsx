import React from 'react';
import { Mail, Globe, Share2, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="dashboard-footer glass">
      <div className="footer-content">
        <div className="footer-brand">
          <h2 className="footer-logo">Learn<span className="gradient-text">ify</span></h2>
          <p className="footer-tagline">Empowering the next generation of digital creators and innovators.</p>
        </div>

        <div className="link-group">
          <h4>Platform</h4>
          <Link to="/courses">All Courses</Link>
          <Link to="/dashboard">My Dashboard</Link>
          <a href="#support">Support Center</a>
        </div>
        
        <div className="link-group">
          <h4>Resources</h4>
          <a href="#api">API Documentation</a>
          <a href="#blog">Learning Blog</a>
          <a href="#terms">Terms of Service</a>
        </div>

        <div className="footer-social">
          <h4>Connect</h4>
          <div className="social-icons">
            <a href="#" className="social-icon"><Phone size={18} /></a>
            <a href="#" className="social-icon"><Globe size={18} /></a>
            <a href="#" className="social-icon"><Share2 size={18} /></a>
            <a href="mailto:support@learnify.com" className="social-icon"><Mail size={18} /></a>
          </div>
          <p className="contact-email">support@learnify.com</p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {currentYear} Learnify. All rights reserved.</p>
        <div className="footer-legal">
          <Link to="/privacy-policy">Privacy Policy</Link>
          <span className="dot"></span>
          <Link to="/security">Security</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
