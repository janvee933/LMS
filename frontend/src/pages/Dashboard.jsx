import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Award, TrendingUp, Clock, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import api from '../api/axios';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    enrolled: 0,
    created: 0,
    time: '2h',
    score: '0%'
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        if (user.role === 'instructor') {
          // Fetch courses created by this instructor
          const response = await api.get('/courses');
          const myCourses = (response.data.data || []).filter(c => c.instructor_id === user.id);
          setData(myCourses);
          setStats(prev => ({ ...prev, created: myCourses.length }));
        } else if (user.role === 'admin') {
          // Fetch all courses for admin
          const response = await api.get('/courses');
          const allCourses = response.data.data || [];
          setData(allCourses);
          setStats(prev => ({ ...prev, created: allCourses.length }));
        } else {
          // Fetch enrollments for student
          const response = await api.get('/enrollments/my-enrollments');
          const enrollments = response.data.data || [];
          setData(enrollments);
          setStats(prev => ({ ...prev, enrolled: enrollments.length }));
        }
      } catch (error) {
        console.error('Error fetching dashboard data', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchDashboardData();
  }, [user]);

  const handleResume = (courseTitle) => {
    alert(`Getting ready to resume: ${courseTitle}. Course viewer is under development!`);
  };

  const isInstructorOrAdmin = user?.role === 'instructor' || user?.role === 'admin';

  return (
    <div className="dashboard-page page-content animate-fade-in">
      <header className="dashboard-header">
        <div className="welcome-text">
          <h1 className="section-title">
            Welcome back, <span className="gradient-text">{user?.name || 'User'}</span>
            <span className="role-tag">{user?.role}</span>
          </h1>
          <p className="section-desc">
            {user.role === 'student' 
              ? (data.length > 0 ? `You have ${data.length} courses in progress.` : "Start your journey today!")
              : `You are logged in as an ${user.role}. Manage your content below.`}
          </p>
        </div>
        {isInstructorOrAdmin && (
          <Button variant="primary" onClick={() => alert('Course creation panel is coming soon!')}>
            <Plus size={18} /> Create Course
          </Button>
        )}
        {user.role === 'student' && (
          <Button variant="primary" onClick={() => navigate('/courses')}>
            <BookOpen size={18} /> Browse Courses
          </Button>
        )}
      </header>

      <div className="stats-grid">
        <div className="stat-card glass">
          <div className="stat-icon purple">
            <BookOpen size={24} />
          </div>
          <div className="stat-info">
            <h3>{user.role === 'student' ? stats.enrolled : stats.created}</h3>
            <p>{user.role === 'student' ? 'Courses Enrolled' : 'Courses Created'}</p>
          </div>
        </div>
        <div className="stat-card glass">
          <div className="stat-icon blue">
            <Clock size={24} />
          </div>
          <div className="stat-info">
            <h3>{stats.time}</h3>
            <p>Activity Time</p>
          </div>
        </div>
        <div className="stat-card glass">
          <div className="stat-icon orange">
            <Award size={24} />
          </div>
          <div className="stat-info">
            <h3>0</h3>
            <p>Achievements</p>
          </div>
        </div>
        <div className="stat-card glass">
          <div className="stat-icon green">
            <TrendingUp size={24} />
          </div>
          <div className="stat-info">
            <h3>{stats.score}</h3>
            <p>Overall Performance</p>
          </div>
        </div>
      </div>

      <section className="dashboard-section">
        <div className="section-header-inline">
          <h2 className="section-subtitle">
            {user.role === 'student' ? 'Continue ' : 'Manage '}
            <span className="gradient-text">{user.role === 'student' ? 'Learning' : 'Courses'}</span>
          </h2>
          <a href="#" className="view-all" onClick={(e) => { e.preventDefault(); navigate('/courses'); }}>View all</a>
        </div>
        
        {loading ? (
          <div className="loading-spinner">Loading...</div>
        ) : data.length > 0 ? (
          <div className="continue-grid">
            {data.map(item => (
              <div key={item.id} className="continue-card glass">
                <div className="continue-thumb" 
                     style={{ backgroundImage: `url(${item.thumbnail || 'https://via.placeholder.com/300x200'})`, backgroundSize: 'cover' }}>
                </div>
                <div className="continue-info">
                  <h3>{item.title}</h3>
                  <p>{user.role === 'student' ? 'In Progress • Beginner' : 'Published • Active'}</p>
                  {user.role === 'student' && (
                    <>
                      <div className="progress-container">
                        <div className="progress-bar" style={{ width: '10%' }}></div>
                      </div>
                      <div className="progress-text">10% Complete</div>
                    </>
                  )}
                </div>
                <Button 
                  variant="secondary" 
                  className="resume-btn" 
                  onClick={() => user.role === 'student' ? handleResume(item.title) : alert('Course management panel coming soon!')}
                >
                  {user.role === 'student' ? 'Resume' : 'Edit Course'}
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state glass">
            <p>
              {user.role === 'student' 
                ? "You haven't enrolled in any courses yet." 
                : "You haven't created any courses yet."}
            </p>
            <Button variant="secondary" onClick={() => navigate('/courses')}>
              {user.role === 'student' ? 'Browse Courses' : 'Create Your First Course'}
            </Button>
          </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
