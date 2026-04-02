import React, { useState } from 'react';
import api from '../api/axios';
import Button from './Button';

const CourseForm = ({ onSuccess, onCancel, defaultInstructorId, initialData }) => {
  const [formData, setFormData] = useState({
    id: initialData?.id || null,
    title: initialData?.title || '',
    description: initialData?.description || '',
    instructor_id: initialData?.instructor_id || defaultInstructorId,
    price: initialData?.price || '',
    level: initialData?.level || 'Beginner',
    category: initialData?.category || 'Development',
    thumbnail: initialData?.thumbnail || '',
    video_url: initialData?.video_url || ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (formData.id) {
        // Update existing course
        const res = await api.put(`/courses/${formData.id}`, formData);
        if (res.data.success) {
          alert('Course updated successfully!');
          onSuccess && onSuccess();
        }
      } else {
        // Create new course
        const res = await api.post('/courses', formData);
        if (res.data.success) {
          alert('Course created successfully!');
          onSuccess && onSuccess();
        }
      }
    } catch (error) {
      alert(error.response?.data?.message || `Failed to ${formData.id ? 'update' : 'create'} course`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="course-form glass animate-slide-up" style={{ padding: '30px', marginBottom: '30px' }}>
      <h3 style={{ marginBottom: '20px' }}>{formData.id ? 'Edit' : 'Create New'} <span className="gradient-text">Course</span></h3>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div className="form-group">
            <label>Course Title</label>
            <input 
              type="text" required value={formData.title} 
              onChange={e => setFormData({...formData, title: e.target.value})}
              className="admin-input" placeholder="e.g. Master React in 30 Days"
            />
          </div>
          <div className="form-group">
            <label>Category</label>
            <select 
              value={formData.category} 
              onChange={e => setFormData({...formData, category: e.target.value})}
              className="admin-input"
            >
              <option value="Development">Development</option>
              <option value="Design">Design</option>
              <option value="Business">Business</option>
              <option value="Marketing">Marketing</option>
            </select>
          </div>
          <div className="form-group">
            <label>Price (₹)</label>
            <input 
              type="number" required value={formData.price} 
              onChange={e => setFormData({...formData, price: e.target.value})}
              className="admin-input"
            />
          </div>
          <div className="form-group">
            <label>Difficulty Level</label>
            <select 
              value={formData.level} 
              onChange={e => setFormData({...formData, level: e.target.value})}
              className="admin-input"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
        </div>
        
        <div className="form-group">
          <label>Description</label>
          <textarea 
            required rows="4" value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
            className="admin-input" placeholder="What will students learn in this course?"
          ></textarea>
        </div>

        <div className="form-group">
          <label>Thumbnail URL</label>
          <input 
            type="url" value={formData.thumbnail}
            onChange={e => setFormData({...formData, thumbnail: e.target.value})}
            className="admin-input"
          />
        </div>

        <div className="form-group">
          <label>Introduction Video URL (e.g. YouTube/Vimeo Link)</label>
          <input 
            type="url" value={formData.video_url}
            onChange={e => setFormData({...formData, video_url: e.target.value})}
            className="admin-input"
            placeholder="https://www.youtube.com/watch?v=..."
          />
        </div>

        <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? (formData.id ? 'Updating...' : 'Creating...') : (formData.id ? 'Update Course' : 'Publish Course')}
          </Button>
          <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        </div>
      </form>
    </div>
  );
};

export default CourseForm;
