import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Hero from '../components/Hero';
import CourseCard from '../components/CourseCard';
import Loader from '../components/Loader';
import CourseForm from '../components/CourseForm';
import CourseContentModal from '../components/CourseContentModal';
import CourseDetailModal from '../components/CourseDetailModal';
import PaymentModal from '../components/PaymentModal';
import { useAuth } from '../context/AuthContext';
import './Home.css';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const [selectedContentCourse, setSelectedContentCourse] = useState(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [selectedPreviewCourse, setSelectedPreviewCourse] = useState(null);
  const [paymentCourse, setPaymentCourse] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const promises = [api.get('/courses')];
      if (user) {
        promises.push(api.get('/enrollments/my-enrollments'));
      }

      const [coursesRes, enrollRes] = await Promise.all(promises);
      
      let allCourses = coursesRes.data.data || [];
      
      // If user is instructor, show only their courses
      if (user && user.role === 'instructor') {
        allCourses = allCourses.filter(c => c.instructor_id === user.id);
      }
      
      setCourses(allCourses);

      if (user && enrollRes) {
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

    setPaymentCourse(course);
  };

  const processPaymentEnrollment = async (course) => {
    try {
      const response = await api.post('/enrollments/enroll', { course_id: course.id });
      if (response.data.success) {
        setPaymentCourse(null);
        fetchData(); // Refresh enrollments, UI updates to "Enrolled"
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
                      onOpen={handleOpenPreview}
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

      <section className="stats-content-section page-content animate-fade-in">
        <div className="stats-content-wrapper">
          <div className="stats-text-content">
            <h2 className="stats-main-heading">Empowering Futures Through <span className="gradient-text">Quality Education</span></h2>
            <p className="stats-subtitle">Trusted by thousands of learners worldwide to bridge the gap between ambition and success.</p>
            
            <div className="stats-description">
              <p>
                At our platform, we believe that education is the foundation of progress. By combining industry-leading expertise with a flexible learning environment, we empower students to master in-demand skills at their own pace. Our mission is to provide accessible, high-quality education that transforms careers and opens new doors of opportunity in an ever-evolving global market.
              </p>
              <p>
                Our success is reflected in the growth of our community. With a curriculum curated by seasoned professionals, we ensure that every learner receives practical, real-world knowledge. Whether you are looking to start a new career or level up your current skills, our comprehensive resources and dedicated mentorship are designed to guide you every step of the way toward achieving your professional goals.
              </p>
            </div>
          </div>
          
          <div className="stats-grid-visual">
            <div className="stat-card-premium glass">
              <h3 className="stat-count">10,000+</h3>
              <p className="stat-name">Total Students</p>
            </div>
            <div className="stat-card-premium glass">
              <h3 className="stat-count">250+</h3>
              <p className="stat-name">Courses</p>
            </div>
            <div className="stat-card-premium glass">
              <h3 className="stat-count">50+</h3>
              <p className="stat-name">Expert Teachers</p>
            </div>
            <div className="stat-card-premium glass">
              <h3 className="stat-count">5,000+</h3>
              <p className="stat-name">Certificates Issued</p>
            </div>
          </div>
        </div>
      </section>

      <section className="testimonials-section page-content animate-fade-in">
        <div className="section-header">
          <h2 className="section-title">What Our <span className="gradient-text">Students Say</span></h2>
          <p className="section-desc">Hear from our community of learners who have transformed their careers through our platform.</p>
        </div>

        <div className="testimonials-grid">
          <div className="testimonial-card glass animate-slide-up">
            <div className="quote-icon">"</div>
            <div className="testimonial-content">
              <p>The Python Data Science course was a game-changer for me. The instructors break down complex concepts into simple steps. I landed my first Junior Data Analyst role within two months of completing the certification!</p>
            </div>
            <div className="testimonial-footer">
              <img src="https://i.pravatar.cc/150?u=rahul" alt="Rahul Sharma" className="student-photo" />
              <div className="student-info">
                <h4 className="student-name">Rahul Sharma</h4>
                <p className="student-meta">Data Analyst @ TechCorp</p>
                <div className="star-rating">
                  {[1, 2, 3, 4, 5].map(s => <span key={s} className="star">★</span>)}
                </div>
              </div>
            </div>
          </div>

          <div className="testimonial-card glass animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="quote-icon">"</div>
            <div className="testimonial-content">
              <p>I loved the flexibility of the self-paced learning. The Full Stack Web Development bootcamp is incredibly comprehensive. The community support and real-world projects helped me build a portfolio I'm proud of.</p>
            </div>
            <div className="testimonial-footer">
              <img src="https://i.pravatar.cc/150?u=priya" alt="Priya Singh" className="student-photo" />
              <div className="student-info">
                <h4 className="student-name">Priya Singh</h4>
                <p className="student-meta">Frontend Developer</p>
                <div className="star-rating">
                  {[1, 2, 3, 4, 5].map(s => <span key={s} className="star">★</span>)}
                </div>
              </div>
            </div>
          </div>

          <div className="testimonial-card glass animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="quote-icon">"</div>
            <div className="testimonial-content">
              <p>The instructors here are truly experts in their fields. Their hands-on approach and constant feedback made even the most difficult modules manageable. This platform is worth every penny for professional growth.</p>
            </div>
            <div className="testimonial-footer">
              <img src="https://i.pravatar.cc/150?u=amit" alt="Amit Kumar" className="student-photo" />
              <div className="student-info">
                <h4 className="student-name">Amit Kumar</h4>
                <p className="student-meta">Senior Software Engineer</p>
                <div className="star-rating">
                  {[1, 2, 3, 4, 5].map(s => <span key={s} className="star">★</span>)}
                </div>
              </div>
            </div>
          </div>
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

      <CourseDetailModal
        isOpen={isPreviewModalOpen}
        onClose={() => { setIsPreviewModalOpen(false); setSelectedPreviewCourse(null); }}
        course={selectedPreviewCourse}
        isEnrolled={enrollments.some(e => e.course_id === selectedPreviewCourse?.id)}
        onEnroll={handleEnrollFromPreview}
      />

      <PaymentModal
        isOpen={!!paymentCourse}
        onClose={() => setPaymentCourse(null)}
        course={paymentCourse}
        onConfirm={processPaymentEnrollment}
      />
    </div>
  );
};

export default Home;
