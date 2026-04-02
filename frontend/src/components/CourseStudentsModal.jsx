import React, { useState, useEffect } from 'react';
import { X, Users, Mail, Clock, CheckCircle } from 'lucide-react';
import Loader from './Loader';
import api from '../api/axios';
import './CourseStudentsModal.css';

const CourseStudentsModal = ({ isOpen, onClose, courseId, courseTitle }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && courseId) {
      fetchStudents();
    }
  }, [isOpen, courseId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/enrollments/course/${courseId}/students`);
      if (res.data.success) {
        setStudents(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching course students', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = fetchData;

  if (!isOpen) return null;

  return (
    <div className="students-modal-overlay animate-fade-in" onClick={onClose}>
      <div className="students-modal-content animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="header-info">
            <Users size={24} className="header-icon" />
            <div>
              <h2>Enrolled Students</h2>
              <p className="course-subtitle">{courseTitle}</p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="modal-body">
          {loading ? (
            <Loader fullPage={false} message="Loading students..." />
          ) : students.length > 0 ? (
            <div className="students-table-wrapper">
              <table className="students-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Enrolled Date</th>
                    <th>Status</th>
                    <th>Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(s => (
                    <tr key={s.id}>
                      <td>
                        <div className="student-profile">
                          <div className="student-initials">{s.name?.charAt(0) || '?'}</div>
                          <div className="student-info">
                            <span className="student-name">{s.name}</span>
                            <span className="student-email">{s.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="date-cell">
                        <span className="meta-text">
                          {new Date(s.enrolled_at).toLocaleDateString()}
                        </span>
                      </td>
                      <td>
                        {s.progress === 100 ? (
                          <span className="status-badge completed">Completed</span>
                        ) : (
                          <span className="status-badge active">In Progress</span>
                        )}
                      </td>
                      <td>
                        <div className="progress-container">
                          <div className="progress-bar-bg">
                            <div 
                              className="progress-bar-fill" 
                              style={{ width: `${s.progress}%`, backgroundColor: s.progress === 100 ? '#10b981' : '#6366f1' }}
                            ></div>
                          </div>
                          <span className="progress-percent">{s.progress}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="no-students">
              <Users size={48} />
              <h3>No students enrolled yet</h3>
              <p>This course doesn't have any enrollments at the moment.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseStudentsModal;
