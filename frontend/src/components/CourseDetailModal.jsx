import React from 'react';
import { X, Clock, BookOpen, Star, Users, CheckCircle, Play, ChevronRight } from 'lucide-react';
import Button from './Button';
import './CourseDetailModal.css';

const CourseDetailModal = ({ isOpen, onClose, course, isEnrolled, onEnroll }) => {
  if (!isOpen || !course) return null;

  const { title, description, thumbnail, duration, level, rating, price, instructor_name, student_count } = course;

  const getMediaUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('/uploads/')) {
      return `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${url}`;
    }
    return url;
  };

  return (
    <div className="course-detail-overlay animate-fade-in" onClick={onClose}>
      <div className="course-detail-container glass animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="modal-close" onClick={onClose}><X size={24} /></div>
        
        <div className="modal-grid">
          <div className="modal-visuals">
            <div className="preview-image-wrapper">
              <img src={getMediaUrl(thumbnail) || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80'} alt={title} />
              <div className="image-overlay-badge">{level}</div>
            </div>
            
            <div className="stats-strip glass">
              <div className="stat-pill">
                <Star size={16} color="#fbbf24" fill="#fbbf24" />
                <span>{course.average_rating > 0 ? Number(course.average_rating).toFixed(1) : '5.0'} Rating</span>
              </div>
              <div className="stat-pill">
                <Users size={16} color="#6366f1" />
                <span>{student_count || '0'} Students</span>
              </div>
              <div className="stat-pill">
                <Clock size={16} color="#ef4444" />
                <span>{duration || '12h 30m'}</span>
              </div>
            </div>
          </div>

          <div className="modal-info">
            <div className="info-header">
              <span className="category-tag">{course.category || 'Development'}</span>
              <h1>{title}</h1>
              <p className="instructor-by">By <strong>{instructor_name || 'Admin Instructor'}</strong></p>
            </div>

            <div className="info-body">
              <h3>About this course</h3>
              <p className="full-description">
                {description || 'Discover the comprehensive curriculum designed to take you from a beginner to an expert in this field. This course covers everything you need to know with hands-on projects and professional guidance.'}
              </p>

              <div className="course-highlights">
                <div className="highlight"><CheckCircle size={16} /> Full 2 years access</div>
                <div className="highlight"><CheckCircle size={16} /> Access on any smart device</div>
                <div className="highlight"><CheckCircle size={16} /> Certificate of completion</div>
              </div>
            </div>

            <div className="info-footer">
              <div className="modal-price">
                <span className="price-label">{isEnrolled ? 'Status' : 'Investment'}</span>
                {isEnrolled ? (
                  <div className="price-val" style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <CheckCircle size={20} /> Enrolled
                  </div>
                ) : (
                  <div className="price-val">₹{price || '49.99'}</div>
                )}
              </div>
              
              <div className="modal-cta-group">
                {isEnrolled ? (
                  <Button variant="primary" size="lg" onClick={() => onEnroll(course)}>
                     Start Study <Play size={18} style={{ marginLeft: '8px' }} />
                  </Button>
                ) : (
                  <Button variant="primary" size="lg" onClick={() => onEnroll(course)}>
                    Enroll Now <ChevronRight size={18} />
                  </Button>
                )}
                <Button variant="outline" size="lg" onClick={onClose}>{isEnrolled ? 'Close' : 'Maybe Later'}</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailModal;
