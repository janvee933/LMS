import React, { useState, useEffect } from 'react';
import { Star, X, CheckCircle, Send } from 'lucide-react';
import api from '../api/axios';
import Button from './Button';
import './CourseRatingModal.css';

const CourseRatingModal = ({ isOpen, onClose, courseId, courseTitle, onRatingSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(false);
  const [existingRating, setExistingRating] = useState(null);

  useEffect(() => {
    if (isOpen && courseId) {
      fetchExistingRating();
    }
  }, [isOpen, courseId]);

  const fetchExistingRating = async () => {
    try {
      const res = await api.get(`/ratings/user/${courseId}`);
      if (res.data.success && res.data.data) {
        setExistingRating(res.data.data);
        setRating(res.data.data.rating);
        setReview(res.data.data.review || '');
      }
    } catch (err) {
      console.log('No existing rating found');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      alert('Please select a star rating');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/ratings', {
        courseId,
        rating,
        review
      });

      if (res.data.success) {
        onRatingSubmitted && onRatingSubmitted(res.data.message);
        onClose();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit rating');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="rating-modal-overlay animate-fade-in" onClick={onClose}>
      <div className="rating-modal-container glass animate-slide-up" onClick={e => e.stopPropagation()}>
        <button className="rating-modal-close" onClick={onClose}><X size={20} /></button>
        
        <div className="rating-modal-header">
           <Star size={40} color="#fbbf24" fill="#fbbf24" className="header-star" />
           <h2>Rate this Course</h2>
           <p className="modal-subtitle">{courseTitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="rating-form">
          <div className="star-selection-area">
            <p>How was your learning experience?</p>
            <div className="star-group">
              {[1, 2, 3, 4, 5].map((index) => {
                const isFilled = index <= (hover || rating);
                return (
                  <button
                    key={index}
                    type="button"
                    className={`star-btn ${isFilled ? 'filled' : ''}`}
                    onClick={() => setRating(index)}
                    onMouseEnter={() => setHover(index)}
                    onMouseLeave={() => setHover(0)}
                  >
                    <Star 
                      size={36} 
                      fill={isFilled ? "#fbbf24" : "transparent"} 
                      color={isFilled ? "#fbbf24" : "var(--text-dim)"}
                      strokeWidth={1.5}
                    />
                  </button>
                );
              })}
            </div>
            <span className="rating-desc-text">
              {rating === 1 && "Poor"}
              {rating === 2 && "Fair"}
              {rating === 3 && "Good"}
              {rating === 4 && "Great"}
              {rating === 5 && "Excellent!"}
            </span>
          </div>

          <div className="review-area">
            <label>Share your thoughts (Optional)</label>
            <textarea
              placeholder="What did you like or dislike about this course?"
              value={review}
              onChange={e => setReview(e.target.value)}
              rows={4}
            />
          </div>

          <div className="rating-modal-footer">
            <Button 
                type="submit" 
                variant="primary" 
                fullWidth 
                disabled={loading || rating === 0}
            >
              {loading ? "Submitting..." : (existingRating ? "Update Review" : "Submit Feedback")} <Send size={16} />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CourseRatingModal;
