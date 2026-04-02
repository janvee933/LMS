import React from 'react';
import { X, BookOpen, User, DollarSign, Users } from 'lucide-react';
import './InstructorCoursesModal.css';

const InstructorCoursesModal = ({ isOpen, onClose, instructorName, courses }) => {
  if (!isOpen) return null;

  return (
    <div className="instructor-modal-overlay animate-fade-in" onClick={onClose}>
      <div className="instructor-modal-content animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="header-info">
            <BookOpen size={24} className="header-icon" />
            <div>
              <h2>Instructor's Courses</h2>
              <p className="instructor-subtitle">Courses created by <strong>{instructorName}</strong></p>
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
                    <th>Title</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Students</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map(course => (
                    <tr key={course.id}>
                      <td>
                        <div className="course-title-cell">
                          <span className="course-name">{course.title}</span>
                          <span className="level-badge">{course.level}</span>
                        </div>
                      </td>
                      <td>
                        <span className="category-tag">{course.category}</span>
                      </td>
                      <td className="price-cell">
                        <DollarSign size={12} className="inline-icon" />
                        {course.price}
                      </td>
                      <td>
                        <div className="student-count-badge">
                          <Users size={12} className="inline-icon" />
                          {course.student_count || 0} Students
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="no-courses">
              <BookOpen size={48} />
              <h3>No Courses Found</h3>
              <p>This instructor has not created any courses yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InstructorCoursesModal;
