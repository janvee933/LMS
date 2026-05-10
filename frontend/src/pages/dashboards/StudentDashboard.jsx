import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { BookOpen, Award, TrendingUp, Clock, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button';
import CertificateModal from '../../components/CertificateModal';
import CourseRatingModal from '../../components/CourseRatingModal';
import Loader from '../../components/Loader';
import { Star } from 'lucide-react';
import api from '../../api/axios';
import '../Dashboard.css';

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCertOpen, setIsCertOpen] = useState(false);
  const [selectedCert, setSelectedCert] = useState(null);
  const [isRatingOpen, setIsRatingOpen] = useState(false);
  const [selectedRatingCourse, setSelectedRatingCourse] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const response = await api.get('/enrollments/my-enrollments');
        setEnrollments(response.data.data || []);
        
        // Check for persisted certificate
        const savedCertId = sessionStorage.getItem('activeCertificateCourseId');
        if (savedCertId) {
          handleViewCertificate(savedCertId);
        }
      } catch (error) {
        console.error('Error fetching enrollments', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEnrollments();
  }, []);

  const handleResume = (courseId) => {
    navigate(`/course/${courseId}/player`);
  };

  const handleViewCertificate = async (courseId) => {
    try {
      const res = await api.get(`/certificates/${courseId}`);
      if (res.data.success) {
        setSelectedCert(res.data.data);
        setIsCertOpen(true);
        sessionStorage.setItem('activeCertificateCourseId', courseId);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Certificate not ready or error fetching';
      alert(msg);
      sessionStorage.removeItem('activeCertificateCourseId');
    }
  };

  const closeCertificate = () => {
    setIsCertOpen(false);
    sessionStorage.removeItem('activeCertificateCourseId');
  };

  const handleOpenRating = (item) => {
    setSelectedRatingCourse(item);
    setIsRatingOpen(true);
  };

  return (
    <div className="dashboard-page page-content animate-fade-in">
      <header className="dashboard-header">
        <div className="welcome-text">
          <h1 className="section-title">
            <span className="gradient-text">{user?.name}</span>
          </h1>
          <p className="section-desc">
            {enrollments.length > 0 
              ? `You have ${enrollments.length} courses in progress. Keep it up!` 
              : "No courses enrolled yet. Start your journey today!"}
          </p>
        </div>
        <Button variant="primary" onClick={() => navigate('/courses')}>
          <Search size={18} /> Browse Courses
        </Button>
      </header>

      <div className="stats-grid">
        <div className="stat-card glass">
          <div className="stat-icon purple">
            <BookOpen size={24} />
          </div>
          <div className="stat-info">
            <h3>{enrollments.length}</h3>
            <p>Courses Enrolled</p>
          </div>
        </div>
        <div className="stat-card glass">
          <div className="stat-icon blue">
            <Clock size={24} />
          </div>
          <div className="stat-info">
            <h3>2h</h3>
            <p>Learning Time</p>
          </div>
        </div>
        <div className="stat-card glass">
          <div className="stat-icon orange">
            <Award size={24} />
          </div>
          <div className="stat-info">
            <h3>{enrollments.filter(e => e.progress === 100).length}</h3>
            <p>Certificates</p>
          </div>
        </div>
      </div>

      <section className="dashboard-section">
        <div className="section-header-inline">
          <h2 className="section-subtitle">Continue <span className="gradient-text">Learning</span></h2>
          <a href="#" className="view-all" onClick={(e) => { e.preventDefault(); navigate('/courses'); }}>View all</a>
        </div>
        
        {loading ? (
          <Loader fullPage={false} message="Fetching your learning progress..." />
        ) : enrollments.length > 0 ? (
          <div className="continue-grid">
            {enrollments.map(item => (
              <div key={item.id} className="continue-card glass">
                <div className="continue-main">
                  <div className="continue-thumb" 
                       style={{ backgroundImage: `url(${item.thumbnail || 'https://via.placeholder.com/300x200'})`, backgroundSize: 'cover' }}>
                  </div>
                  <div className="continue-info">
                    <h3>{item.title}</h3>
                    <div className="progress-container">
                      <div className="progress-bar" style={{ width: `${item.progress || 0}%` }}></div>
                    </div>
                    <div className="progress-text">
                      {item.progress || 0}% Complete
                      {item.progress === 100 && item.quiz_status === 'passed' && <span className="completed-label" style={{ color: '#10b981' }}><Award size={12} /> Certificate Earned</span>}
                      {item.progress === 100 && item.quiz_status !== 'passed' && <span className="completed-label" style={{ color: '#fbbf24', background: 'rgba(251, 191, 36, 0.1)', border: '1px solid rgba(251, 191, 36, 0.2)' }}><Award size={12} /> Assessment Required</span>}
                    </div>
                  </div>
                </div>
                <div className="continue-actions">
                  <Button variant="secondary" className="resume-btn" onClick={() => handleResume(item.course_id)}>
                    {item.progress === 100 ? 'Go to Course' : 'Resume'}
                  </Button>
                  
                  <Button variant="outline" className="rate-btn-dashboard" onClick={() => handleOpenRating(item)} style={{ background: 'rgba(251, 191, 36, 0.1)', color: '#fbbf24', border: '1px solid rgba(251, 191, 36, 0.2)' }}>
                    <Star size={16} fill="#fbbf24" /> Rate
                  </Button>

                  {item.quiz_status === 'passed' && (
                    <Button variant="primary" className="certificate-btn" onClick={() => handleViewCertificate(item.course_id)}>
                      <Award size={16} /> Certificate
                    </Button>
                  )}
                  {item.progress === 100 && item.quiz_status !== 'passed' && (
                    <Button variant="outline" className="certificate-btn locked-btn" onClick={() => handleResume(item.course_id)} style={{ borderColor: '#fbbf24', color: '#fbbf24' }}>
                      Take Final Assessment
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state glass">
            <p>You haven't enrolled in any courses yet.</p>
            <Button variant="secondary" onClick={() => navigate('/courses')}>Browse Courses</Button>
          </div>
        )}
      </section>

      <CertificateModal 
        isOpen={isCertOpen} 
        onClose={closeCertificate} 
        data={selectedCert} 
      />

      <CourseRatingModal
        isOpen={isRatingOpen}
        onClose={() => setIsRatingOpen(false)}
        courseId={selectedRatingCourse?.course_id}
        courseTitle={selectedRatingCourse?.title}
        onRatingSubmitted={(msg) => alert(msg)}
      />
    </div>
  );
};

export default StudentDashboard;
