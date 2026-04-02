import React from 'react';
import { ArrowRight, Play, Star, Users, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from './Button';
import './Hero.css';

const Hero = () => {
  const navigate = useNavigate();

  const handleWatchDemo = () => {
    alert('Interactive course preview is coming soon! For now, explore our live courses.');
  };

  return (
    <div className="hero-section">
      <div className="hero-content animate-fade-in">
        <div className="badge animate-fade-in">
          <Star size={14} className="star-icon" />
          <span>The Future of Learning is Here</span>
        </div>
        <h1 className="hero-title">
          Master Any Skill <br />
          <span className="gradient-text">Without Limits</span>
        </h1>
        <p className="hero-subtitle">
          Experience a premium learning environment with expert-led courses, 
          interactive content, and a community of over 50,000+ students.
        </p>
        <div className="hero-actions">
          <Button variant="primary" className="hero-btn" onClick={() => navigate('/courses')}>
            Get Started <ArrowRight size={18} />
          </Button>
          <button className="watch-demo" onClick={handleWatchDemo}>
            <div className="play-icon">
              <Play size={16} fill="currentColor" />
            </div>
            <span>Watch Demo</span>
          </button>
        </div>

        <div className="hero-stats">
          <div className="stat-item">
            <Users size={20} />
            <span>50k+ Students</span>
          </div>
          <div className="stat-item">
            <BookOpen size={20} />
            <span>200+ Courses</span>
          </div>
        </div>
      </div>

      <div className="hero-visual">
        <div className="visual-card glass main-card">
          <div className="card-header">
            <div className="dot red"></div>
            <div className="dot yellow"></div>
            <div className="dot green"></div>
          </div>
          <div className="card-body">
            <div className="skeleton-line title"></div>
            <div className="skeleton-grid">
              <div className="skeleton-item"></div>
              <div className="skeleton-item"></div>
              <div className="skeleton-item"></div>
            </div>
          </div>
        </div>
        <div className="visual-card glass floating-card-1">
          <div className="user-info">
            <div className="avatar"></div>
            <div className="user-text">
              <div className="skeleton-line sm"></div>
              <div className="skeleton-line xs"></div>
            </div>
          </div>
        </div>
        <div className="visual-card glass floating-card-2">
          <div className="progress-circle"></div>
          <div className="skeleton-line sm"></div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
