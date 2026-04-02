import React from 'react';
import { X, BookOpen, Clock, CheckCircle } from 'lucide-react';
import './StudentCoursesModal.css';

const StudentCoursesModal = ({ isOpen, onClose, studentName, courses, onGrantAttempt }) => {
  if (!isOpen) return null;

  return (
    <div className="student-modal-overlay animate-fade-in" onClick={onClose}>
      <div className="student-modal-content animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="header-info">
            <BookOpen size={24} className="header-icon" />
            <div>
              <h2>Enrollment Details</h2>
              <p className="student-subtitle">Courses taken by <strong>{studentName}</strong></p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {courses && courses.length > 0 ? (
            <div className="courses-table-wrapper">
              <table className="courses-table">
                <thead>
                  <tr>
                    <th>Course Title</th>
                    <th>Certificate</th>
                    <th>Quiz Attempts</th>
                    <th>Progress</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map(course => (
                    <tr key={course.id}>
                      <td>
                        <div className="course-info">
                          <span className="course-name">{course.course_title}</span>
                          <span className="meta-text" style={{ fontSize: '10px' }}>
                             Enrolled: {new Date(course.enrolled_at).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td>
                        {course.completed_at ? (
                          <span className="status-badge completed">
                            <CheckCircle size={10} style={{ marginRight: '4px', display: 'inline' }} />
                            Issued
                          </span>
                        ) : (
                          <span className="status-badge inactive">Not Issued</span>
                        )}
                      </td>
                      <td>
                        <div className="quiz-info-cell">
                          <span className={`attempts-count ${((course.quiz_attempts || 0) >= 3 && course.quiz_status !== 'passed') ? 'limit-reached' : ''}`}>
                            {course.quiz_attempts || 0}/3 Attempts
                          </span>
                          <span className={`quiz-status-mini ${course.quiz_status || 'not_started'}`}>
                            {(course.quiz_status || 'not_started').replace('_', ' ')}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="progress-container">
                          <div className="progress-bar-bg">
                            <div 
                              className="progress-bar-fill" 
                              style={{ 
                                width: `${course.progress}%`, 
                                backgroundColor: course.progress === 100 ? '#10b981' : '#6366f1' 
                              }}
                            ></div>
                          </div>
                          <span className="progress-percent">{course.progress}%</span>
                        </div>
                      </td>
                      <td>
                        {course.quiz_attempts >= 3 && course.quiz_status !== 'passed' ? (
                          <button 
                            className="grant-attempt-btn"
                            onClick={() => onGrantAttempt(course.student_id, course.course_id)}
                            title="Grant 1 extra attempt"
                          >
                             Grant Chance
                          </button>
                        ) : (
                          <span className="no-action">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="no-courses">
              <BookOpen size={48} />
              <h3>No courses found</h3>
              <p>This student is not currently enrolled in any courses.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentCoursesModal;
