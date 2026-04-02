import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { BookOpen, Users, Plus, Star, BarChart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button';
import CourseCard from '../../components/CourseCard';
import CourseForm from '../../components/CourseForm';
import Loader from '../../components/Loader';
import api from '../../api/axios';
import StudentCoursesModal from '../../components/StudentCoursesModal';
import CourseContentModal from '../../components/CourseContentModal';
import '../Dashboard.css';

const InstructorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [myCourses, setMyCourses] = useState([]);
  const [stats, setStats] = useState({
    totalCourses: 0,
    activeStudents: 0,
    avgRating: 4.8,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('courses'); // 'courses' or 'students'
  const [enrollments, setEnrollments] = useState([]);
  const [isCreatingCourse, setIsCreatingCourse] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const [selectedContentCourse, setSelectedContentCourse] = useState(null);

  const fetchEnrollments = async () => {
    try {
      setRefreshing(true);
      const res = await api.get('/enrollments/instructor/all');
      if (res.data.success) {
        setEnrollments(res.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching instructor enrollments', error);
    } finally {
      setRefreshing(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch stats
      const statsRes = await api.get('/courses/instructor-stats');
      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
      }

      // Fetch courses (for the list)
      const coursesRes = await api.get('/courses');
      const allCourses = coursesRes.data.data || [];
      const filtered = allCourses.filter(c => Number(c.instructor_id) === Number(user?.id) || user?.role === 'admin');
      setMyCourses(filtered);
    } catch (error) {
      console.error('Error fetching instructor dashboard data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditCourse = (course) => {
    setEditingCourse(course);
    setIsCreatingCourse(true); // Re-use the form container
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteCourse = async (course) => {
    if (!window.confirm(`Are you sure you want to delete "${course.title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const res = await api.delete(`/courses/${course.id}`);
      if (res.data.success) {
        alert('Course deleted successfully');
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Error deleting course', error);
      alert(error.response?.data?.message || 'Failed to delete course');
    }
  };
  
  const handleViewStudentCourses = (student) => {
    setSelectedStudent(student);
    setIsStudentModalOpen(true);
  };

  const handleManageContent = (course) => {
    setSelectedContentCourse(course);
    setIsContentModalOpen(true);
  };

  const handleGrantAttempt = async (userId, courseId) => {
    if (!window.confirm('Are you sure you want to grant an extra attempt to this student?')) return;
    
    try {
      setRefreshing(true);
      const res = await api.post('/quizzes/grant-attempt', { userId, courseId });
      if (res.data.success) {
        alert('Extra attempt granted successfully');
        await fetchEnrollments();
        
        // Also update the selectedStudent if modal is open to reflect changes immediately
        if (selectedStudent) {
          const updatedEnrollments = await api.get('/enrollments/instructor/all');
          const newStudentData = updatedEnrollments.data.data.find(s => s.student_email === selectedStudent.student_email);
          if (newStudentData) {
            setSelectedStudent(newStudentData);
          }
        }
      }
    } catch (error) {
      console.error('Error granting attempt', error);
      alert(error.response?.data?.message || 'Failed to grant attempt');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchEnrollments();
  }, [user?.id]);

  return (
    <div className="dashboard-page page-content animate-fade-in">
      <header className="dashboard-header">
        <div className="welcome-text">
          <h1 className="section-title">
            <span className="gradient-text">{user?.name}</span>
          </h1>
          <p className="section-desc">Manage your content and track student progress below.</p>
        </div>
        <div className="admin-actions" style={{ display: 'flex', gap: '10px' }}>
          <Button variant="secondary" onClick={() => setActiveTab(activeTab === 'courses' ? 'students' : 'courses')}>
            {activeTab === 'courses' ? 'Student Progress' : 'My Courses'}
          </Button>
          <Button variant="primary" onClick={() => setIsCreatingCourse(!isCreatingCourse)}>
            {isCreatingCourse ? 'Cancel' : <><Plus size={18} /> Create New Course</>}
          </Button>
        </div>
      </header>

      {isCreatingCourse && (
        <CourseForm 
          key={editingCourse?.id || 'new'}
          defaultInstructorId={user.id} 
          initialData={editingCourse}
          onSuccess={() => { 
            setIsCreatingCourse(false); 
            setEditingCourse(null);
            fetchDashboardData(); 
          }}
          onCancel={() => {
            setIsCreatingCourse(false);
            setEditingCourse(null);
          }}
        />
      )}

      <div className="stats-grid">
        <div className="stat-card glass">
          <div className="stat-icon purple">
            <BookOpen size={24} />
          </div>
          <div className="stat-info">
            <h3>{stats.totalCourses}</h3>
            <p>Total Courses</p>
          </div>
        </div>
        <div className="stat-card glass">
          <div className="stat-icon blue">
            <Users size={24} />
          </div>
          <div className="stat-info">
            <h3>{stats.activeStudents}</h3>
            <p>Active Students</p>
          </div>
        </div>
        <div className="stat-card glass">
          <div className="stat-icon orange">
            <Star size={24} />
          </div>
          <div className="stat-info">
            <h3>{stats.avgRating}</h3>
            <p>Avg. Rating</p>
          </div>
        </div>
        <div className="stat-card glass">
          <div className="stat-icon green">
            <BarChart size={24} />
          </div>
          <div className="stat-info">
            <h3>₹{stats.totalRevenue.toLocaleString()}</h3>
            <p>Total Revenue</p>
          </div>
        </div>
      </div>

      {activeTab === 'courses' ? (
        <section className="dashboard-section">
          <div className="section-header-inline">
            <h2 className="section-subtitle">Manage <span className="gradient-text">Your Courses</span></h2>
          </div>
          
          {loading ? (
            <Loader fullPage={false} message="Loading your courses..." />
          ) : myCourses.length > 0 ? (
            <div className="courses-grid">
              {myCourses.map(course => (
                <CourseCard 
                  key={course.id} 
                  course={course} 
                  onEdit={handleEditCourse}
                  onManageContent={handleManageContent}
                  onDelete={handleDeleteCourse}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state glass">
              <p>You haven't created any courses yet. Start sharing your knowledge!</p>
              <Button variant="secondary" onClick={() => alert('Create course panel coming soon!')}>Create Your First Course</Button>
            </div>
          )}
        </section>
      ) : (
        <section className="dashboard-section enrollments-section animate-fade-in">
          <div className="section-header-inline">
            <h2 className="section-subtitle">Student <span className="gradient-text">Progress Tracking</span></h2>
            <Button variant="secondary" onClick={() => fetchEnrollments()} disabled={refreshing}>
               {refreshing ? 'Refreshing...' : 'Refresh Data'}
            </Button>
          </div>

          <div className="users-table-container glass">
            {loading ? (
              <div className="loading-spinner">Loading tracking data...</div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Courses Enrolled</th>
                    <th>Overall Progress</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {enrollments.length > 0 ? enrollments.map(s => (
                    <tr key={s.student_email}>
                      <td>
                        <div className="user-info-cell">
                          <span className="user-name">{s.student_name}</span>
                          <span className="user-email">{s.student_email}</span>
                        </div>
                      </td>
                      <td>
                        <div className="enrollment-count-badge" style={{ cursor: 'pointer', display: 'inline-block' }} onClick={() => handleViewStudentCourses(s)}>
                          {s.courses_count} {s.courses_count === 1 ? 'Course' : 'Courses'}
                        </div>
                      </td>
                      <td>
                        <div className="progress-cell">
                          <div className="progress-bar-container" style={{ width: '100px' }}>
                            <div className={`progress-bar-fill ${s.avg_progress === 100 ? 'completed' : ''}`} style={{ width: `${s.avg_progress}%` }}></div>
                          </div>
                          <span className="progress-percent" style={{ color: s.avg_progress === 100 ? '#10b981' : 'inherit' }}>{s.avg_progress}%</span>
                        </div>
                      </td>
                      <td>
                        <Button 
                          variant="secondary" 
                          size="sm"
                          onClick={() => handleViewStudentCourses(s)}
                        >
                          View Progress
                        </Button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="3" style={{ textAlign: 'center', padding: '30px' }}>No student enrollment data found for your courses.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </section>
      )}
      <StudentCoursesModal 
        isOpen={isStudentModalOpen}
        onClose={() => { setIsStudentModalOpen(false); setSelectedStudent(null); }}
        studentName={selectedStudent?.student_name}
        courses={selectedStudent?.courses}
        onGrantAttempt={handleGrantAttempt}
      />
      <CourseContentModal 
        isOpen={isContentModalOpen}
        onClose={() => { setIsContentModalOpen(false); setSelectedContentCourse(null); }}
        course={selectedContentCourse}
      />
    </div>
  );
};

export default InstructorDashboard;
