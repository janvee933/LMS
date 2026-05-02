import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import Hero from '../components/Hero';
import CourseCard from '../components/CourseCard';
import Loader from '../components/Loader';
import CourseForm from '../components/CourseForm';
import CourseContentModal from '../components/CourseContentModal';
import { useAuth } from '../context/AuthContext';
import './Home.css';

const Home = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const [selectedContentCourse, setSelectedContentCourse] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const coursesRes = await api.get('/courses');
      setCourses(coursesRes.data.data || []);

      if (user) {
        const enrollRes = await api.get('/enrollments/my-enrollments');
        setEnrollments(enrollRes.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching data', error);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleEdit = (course) => {
    setSelectedCourse(course);
    setIsEditModalOpen(true);
  };

  const handleManageContent = (course) => {
    setSelectedContentCourse(course);
    setIsContentModalOpen(true);
  };

  const handleEditSuccess = () => {
    setIsEditModalOpen(false);
    setSelectedCourse(null);
    fetchData();
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

  return (
    <div className="home-page animate-fade-in">
      <Hero />
      <section className="featured-courses page-content">
        <div className="section-header">
          <h2 className="section-title">Explore Our <span className="gradient-text">Top Courses</span></h2>
          <p className="section-desc">Choose from over 200+ premium courses designed by industry experts.</p>
        </div>
        <div className="categories-container">
          {loading ? (
            <div className="courses-grid">
              {[1, 2, 3].map((id) => (
                <div key={id} className="course-card-skeleton glass">
                  <div className="skeleton-img"></div>
                  <div className="skeleton-content">
                    <div className="skeleton-line sm"></div>
                    <div className="skeleton-line md"></div>
                    <div className="skeleton-line lg"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Group by category
            Object.entries(
              courses.reduce((acc, course) => {
                const cat = course.category || 'Other';
                if (!acc[cat]) acc[cat] = [];
                acc[cat].push(course);
                return acc;
              }, {})
            ).map(([category, categoryCourses]) => (
              <div key={category} className="category-section animate-slide-up">
                <h3 className="category-title">{category}</h3>
                <div className="courses-grid">
                  {categoryCourses.map(course => (
                    <CourseCard 
                      key={course.id} 
                      course={course} 
                      isEnrolled={enrollments.some(e => e.course_id === course.id)}
                      onEdit={handleEdit}
                      onManageContent={handleManageContent}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

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
    </div>
  );
};

export default Home;
