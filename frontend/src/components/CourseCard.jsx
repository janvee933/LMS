import React, { useState, useEffect } from 'react';
import { Clock, Book, Star, ChevronRight, Loader2, CheckCircle, Users, Play, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import PaymentModal from './PaymentModal';
import './CourseCard.css';

const CourseCard = ({ course, isEnrolled = false, onOpen, onViewStudents, onEdit, onManageContent, onDelete }) => {
  const { id, title, description, thumbnail, duration, level, rating, price, instructor_id } = course;
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [localEnrolled, setLocalEnrolled] = useState(isEnrolled);

  useEffect(() => {
    setLocalEnrolled(isEnrolled);
  }, [isEnrolled]);

  const handleEnrollClick = (e) => {
    e.stopPropagation(); // Prevent card click
    e.preventDefault();
    
    if (localEnrolled) {
      navigate(`/course/${id}/player`);
      return;
    }

    if (!user) {
      navigate('/login');
      return;
    }

    setShowPayment(true);
  };

  const processEnrollment = async () => {
    try {
      setLoading(true);
      const response = await api.post('/enrollments/enroll', { course_id: id });
      
      if (response.data.success) {
        setShowPayment(false);
        setLocalEnrolled(true);
        // We will not navigate immediately so the user can see the "Enrolled" button state.
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Enrollment failed. Please try again.';
      alert(message);
    } finally {
      setLoading(false);
    }
  };


  const isAdmin = user?.role === 'admin';
  const isOwner = user?.id && instructor_id && String(user?.id) === String(instructor_id);
  const showInstructorControls = isAdmin || isOwner;

  return (
    <div 
      className="course-card glass animate-fade-in" 
      onClick={() => onOpen && onOpen(course)}
      style={{ cursor: 'pointer' }}
    >
      <div className="card-image">
        <img src={thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80'} alt={title} />
        <div className="card-badge">{level}</div>
      </div>
      <div className="card-content">
        <div className="card-meta">
          <span className="rating">
            <Star size={14} fill="currentColor" /> 
            {course.average_rating > 0 ? Number(course.average_rating).toFixed(1) : '5.0'}
          </span>
          <span className="duration"><Clock size={14} /> {duration || '12h 30m'}</span>
        </div>
        <h3 className="card-title">{title}</h3>
        <p className="card-description">{description?.substring(0, 80)}...</p>
        
        <div className="card-footer">
          <div className="price-tag">
            <span className="currency">₹</span>
            <span className="amount">{price || '49.99'}</span>
          </div>
          
          <div className="card-actions">
            {showInstructorControls ? (
              <div className="instructor-actions-group">
                <button 
                  onClick={(e) => { e.stopPropagation(); e.preventDefault(); onEdit && onEdit(course); }} 
                  className="edit-btn"
                  title="Edit Course"
                >
                  Edit
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); e.preventDefault(); onManageContent && onManageContent(course); }} 
                  className="manage-btn"
                  title="Manage Lessons & Quizzes"
                  style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', border: '1px solid rgba(99, 102, 241, 0.2)', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer' }}
                >
                  Manage Content
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); e.preventDefault(); navigate(`/course/${id}/player`); }} 
                  className="view-btn instructor-view"
                  title="View Course"
                >
                  View
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); e.preventDefault(); onDelete && onDelete(course); }} 
                  className="delete-btn-course"
                  title="Delete Course"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ) : (
              <button 
                onClick={handleEnrollClick} 
                className={`enroll-card-btn ${localEnrolled ? 'already-enrolled' : ''}`}
                disabled={loading}
              >
                {loading ? (
                  <>Enrolling... <Loader2 size={16} className="animate-spin" /></>
                ) : localEnrolled ? (
                  <>Enrolled <CheckCircle size={16} /></>
                ) : (
                  <>Enroll Now <ChevronRight size={18} /></>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
      
      {showPayment && (
        <PaymentModal
          isOpen={showPayment}
          onClose={(e) => {
            if(e) e.stopPropagation();
            setShowPayment(false);
          }}
          course={course}
          onConfirm={processEnrollment}
        />
      )}
    </div>
  );
};

export default CourseCard;
