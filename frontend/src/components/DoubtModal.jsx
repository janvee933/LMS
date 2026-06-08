import React, { useState } from 'react';
import { X, MessageSquare, Loader2 } from 'lucide-react';
import Button from './Button';
import api from '../api/axios';
import './CourseDetailModal.css'; // Reusing some base styles

const DoubtModal = ({ isOpen, onClose, courseId, courseTitle }) => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    setLoading(true);
    try {
      const res = await api.post('/doubts', { course_id: courseId, message });
      if (res.data.success) {
        alert('Your doubt has been submitted. The instructor will respond soon.');
        setMessage('');
        onClose();
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to submit doubt.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="course-detail-overlay animate-fade-in" onClick={onClose}>
      <div className="course-detail-container glass animate-slide-up" style={{ maxWidth: '500px', padding: '30px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-close" onClick={onClose}><X size={24} /></div>
        
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'inline-flex', padding: '15px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '50%', color: '#6366f1', marginBottom: '15px' }}>
            <MessageSquare size={32} />
          </div>
          <h2 style={{ marginBottom: '5px' }}>Ask a Doubt</h2>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>Regarding: <strong style={{ color: 'white' }}>{courseTitle}</strong></p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <textarea
            className="admin-input"
            rows="5"
            placeholder="Type your question or doubt here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            style={{ resize: 'vertical' }}
          ></textarea>
          
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <Button type="submit" variant="primary" style={{ flex: 1 }} disabled={loading || !message.trim()}>
              {loading ? <Loader2 size={18} className="animate-spin" /> : 'Submit Doubt'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DoubtModal;
