import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import CourseCard from '../components/CourseCard';
import CourseStudentsModal from '../components/CourseStudentsModal';
import CourseForm from '../components/CourseForm';
import CourseContentModal from '../components/CourseContentModal';
import CourseDetailModal from '../components/CourseDetailModal';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';
import './Courses.css';

const Courses = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [isStudentsModalOpen, setIsStudentsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const [selectedContentCourse, setSelectedContentCourse] = useState(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [selectedPreviewCourse, setSelectedPreviewCourse] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch courses
      const coursesRes = await api.get('/courses');
      const coursesData = coursesRes.data.data || [];
      setCourses(coursesData);
      setFilteredCourses(coursesData);

      // Fetch enrollments if user is logged in
      if (user) {
        const enrollRes = await api.get('/enrollments/my-enrollments');
        setEnrollments(enrollRes.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching data', error);
      setCourses([]);
      setFilteredCourses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleFilter = (category) => {
    setActiveFilter(category);
    if (category === 'All') {
      setFilteredCourses(courses);
    } else {
      const filtered = courses.filter(course => 
        course.title.toLowerCase().includes(category.toLowerCase()) || 
        course.description.toLowerCase().includes(category.toLowerCase())
      );
      setFilteredCourses(filtered);
    }
  };

  const handleViewStudents = (course) => {
    setSelectedCourse(course);
    setIsStudentsModalOpen(true);
  };

  const handleEdit = (course) => {
    setSelectedCourse(course);
    setIsEditModalOpen(true);
  };

  const handleManageContent = (course) => {
    setSelectedContentCourse(course);
    setIsContentModalOpen(true);
  };

  const handleOpenPreview = (course) => {
    setSelectedPreviewCourse(course);
    setIsPreviewModalOpen(true);
  };

  const handleEnrollFromPreview = async (course) => {
    if (enrollments.some(e => e.course_id === course.id)) {
      navigate(`/course/${course.id}/player`);
      return;
    }

    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const response = await api.post('/enrollments/enroll', { course_id: course.id });
      if (response.data.success) {
        alert('Successfully enrolled in ' + course.title);
        setIsPreviewModalOpen(false);
        fetchData(); // Refresh enrollments
        navigate(`/course/${course.id}/player`);
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Enrollment failed');
    }
  };

  const handleDelete = async (course) => {
    if (!window.confirm(`Are you sure you want to delete "${course.title}"?`)) {
      return;
    }

    try {
      const res = await api.delete(`/courses/${course.id}`);
      if (res.data.success) {
        alert('Course deleted successfully');
        fetchData();
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete course');
    }
  };

  const handleEditSuccess = () => {
    setIsEditModalOpen(false);
    setSelectedCourse(null);
    fetchData();
  };

  return (
    <div className="courses-page page-content animate-fade-in">
      <div className="section-header">
        <h1 className="section-title">All <span className="gradient-text">Courses</span></h1>
        <p className="section-desc">Browse our curated collection of industry-leading courses.</p>
      </div>

      <div className="courses-filters glass">
        {['All', 'Web Development', 'Design', 'Business'].map(cat => (
          <button 
            key={cat}
            className={`filter-btn ${activeFilter === cat ? 'active' : ''}`}
            onClick={() => handleFilter(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <Loader fullPage={false} message="Exploring our course catalog..." />
      ) : (
        <div className="courses-grid">
          {filteredCourses.length > 0 ? (
            filteredCourses.map(course => (
                <CourseCard 
                  key={course.id} 
                  course={course} 
                  isEnrolled={enrollments.some(e => e.course_id === course.id)}
                  onOpen={handleOpenPreview}
                  onViewStudents={handleViewStudents}
                  onEdit={handleEdit}
                  onManageContent={handleManageContent}
                  onDelete={handleDelete}
                />
            ))
          ) : (
            <div className="no-results glass animate-fade-in">
              <h3>No courses found in this category.</h3>
              <p>Try searching for something else or browse all courses.</p>
              <button className="filter-btn active" onClick={() => handleFilter('All')}>Show All Courses</button>
            </div>
          )}
        </div>
      )}

      <CourseStudentsModal
        isOpen={isStudentsModalOpen}
        onClose={() => setIsStudentsModalOpen(false)}
        courseId={selectedCourse?.id}
        courseTitle={selectedCourse?.title}
      />

      {isEditModalOpen && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, overflowY: 'auto', padding: '40px 20px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <CourseForm 
              key={selectedCourse?.id || 'new'}
              initialData={selectedCourse} 
              onSuccess={handleEditSuccess} 
              onCancel={() => setIsEditModalOpen(false)} 
              defaultInstructorId={user?.id}
            />
          </div>
        </div>
      )}

      <CourseContentModal 
        isOpen={isContentModalOpen}
        onClose={() => { setIsContentModalOpen(false); setSelectedContentCourse(null); }}
        course={selectedContentCourse}
      />

      <CourseDetailModal
        isOpen={isPreviewModalOpen}
        onClose={() => { setIsPreviewModalOpen(false); setSelectedPreviewCourse(null); }}
        course={selectedPreviewCourse}
        isEnrolled={enrollments.some(e => e.course_id === selectedPreviewCourse?.id)}
        onEnroll={handleEnrollFromPreview}
      />
    </div>
  );
};

export default Courses;
