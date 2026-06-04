import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  BookOpen, Users, Plus, Star, BarChart, Activity, 
  Search, Bell, ArrowUpRight, ArrowDownRight, RefreshCcw,
  Clock, Layout, Settings, ExternalLink, Trash2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button';
import CourseCard from '../../components/CourseCard';
import CourseForm from '../../components/CourseForm';
import Loader from '../../components/Loader';
import api from '../../api/axios';
import StudentCoursesModal from '../../components/StudentCoursesModal';
import CourseContentModal from '../../components/CourseContentModal';
import './InstructorDashboard.css';

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
  const [activeTab, setActiveTab] = useState(() => sessionStorage.getItem('instructorActiveTab') || 'overview');
  const [enrollments, setEnrollments] = useState([]);
  const [isCreatingCourse, setIsCreatingCourse] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const [selectedContentCourse, setSelectedContentCourse] = useState(null);

  // Derived dynamic data for monitoring
  const activityLogs = useMemo(() => {
    const allCourses = enrollments.flatMap(s => s.courses.map(c => ({
      ...c,
      student_name: s.student_name,
      type: c.progress === 100 ? 'completion' : 'enrollment'
    })));
    
    // Sort by enrolled_at/completed_at descending (mocking recent activity)
    allCourses.sort((a, b) => new Date(b.enrolled_at) - new Date(a.enrolled_at));
    
    return allCourses.slice(0, 5).map((c, i) => ({
      id: c.id,
      type: c.type,
      user: c.student_name,
      time: new Date(c.enrolled_at).toLocaleDateString(),
      color: c.type === 'completion' ? '#10b981' : '#818cf8',
      course: c.course_title
    }));
  }, [enrollments]);

  const engagementData = useMemo(() => {
    // Generate engagement growth based on enrollments count per day of week
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const counts = { Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0 };
    
    enrollments.forEach(s => {
      s.courses.forEach(c => {
        if (c.enrolled_at) {
          const day = days[new Date(c.enrolled_at).getDay()];
          counts[day] += 15; // Multiply by 15 for visibility in graph
        }
      });
    });
    
    return days.map(day => ({
      day,
      value: Math.min(counts[day] || 5, 100) // Default to small value if 0, max 100
    }));
  }, [enrollments]);

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
      const statsRes = await api.get('/courses/instructor-stats');
      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
        setMyCourses(statsRes.data.myCourses || []);
      }
    } catch (error) {
      console.error('Error fetching instructor dashboard data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchEnrollments();
  }, [user?.id]);

  useEffect(() => {
    sessionStorage.setItem('instructorActiveTab', activeTab);
  }, [activeTab]);

  const handleEditCourse = (course) => {
    setEditingCourse(course);
    setIsCreatingCourse(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteCourse = async (course) => {
    if (!window.confirm(`Are you sure you want to delete "${course.title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const res = await api.delete(`/courses/${course.id}`);
      if (res.data.success) {
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
        if (selectedStudent) {
          const updatedEnrollments = await api.get('/enrollments/instructor/all');
          const newStudentData = updatedEnrollments.data.data.find(s => s.student_email === selectedStudent.student_email);
          if (newStudentData) setSelectedStudent(newStudentData);
        }
      }
    } catch (error) {
      console.error('Error granting attempt', error);
      alert(error.response?.data?.message || 'Failed to grant attempt');
    } finally {
      setRefreshing(false);
    }
  };

  const filteredCourses = useMemo(() => {
    return myCourses.filter(c => 
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [myCourses, searchQuery]);

  if (loading) return <Loader fullPage message="Initializing Instructor Dashboard..." />;

  return (
    <div className="instructor-dashboard-container">
      {/* Premium Sidebar */}
      <aside className="instructor-sidebar-premium">
        <div className="sidebar-logo">
          <BookOpen size={32} />
          <span>Instructor Panel</span>
        </div>
        
        <nav className="sidebar-nav-premium">
          <button 
            className={`nav-item-premium ${activeTab === 'overview' ? 'active' : ''}`} 
            onClick={() => setActiveTab('overview')}
          >
            <div className="icon-wrapper"><Activity size={18} /></div>
            <span>Monitoring</span>
          </button>
          <button 
            className={`nav-item-premium ${activeTab === 'courses' ? 'active' : ''}`} 
            onClick={() => setActiveTab('courses')}
          >
            <div className="icon-wrapper"><Layout size={18} /></div>
            <span>My Courses</span>
          </button>
          <button 
            className={`nav-item-premium ${activeTab === 'students' ? 'active' : ''}`} 
            onClick={() => setActiveTab('students')}
          >
            <div className="icon-wrapper"><Users size={18} /></div>
            <span>Students</span>
          </button>
          <button 
            className={`nav-item-premium ${activeTab === 'settings' ? 'active' : ''}`} 
            onClick={() => navigate('/settings')}
          >
            <div className="icon-wrapper"><Settings size={18} /></div>
            <span>Settings</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile-compact">
            <div className="avatar-circle">{user?.name?.charAt(0)}</div>
            <div className="user-info-text">
              <h4>{user?.name}</h4>
              <p>Course Instructor</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="instructor-content-premium">
        <header className="instructor-header-premium">
          <div className="header-title-area">
            <h1>{activeTab === 'overview' ? 'Monitoring' : activeTab === 'courses' ? 'My Courses' : 'Student Management'}</h1>
            <p>Welcome back, {user?.name}. Here's your teaching summary.</p>
          </div>
          
          <div className="header-actions">
            <div className="search-wrapper-premium">
              <Search className="search-icon" size={18} />
              <input 
                type="text" 
                placeholder="Search courses..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="nav-item-premium" style={{ padding: '10px' }}>
              <Bell size={20} />
            </button>
            <Button variant="primary" onClick={() => setIsCreatingCourse(true)}>
              <Plus size={18} /> Create Course
            </Button>
          </div>
        </header>

        {isCreatingCourse && (
          <div className="animate-slide-up" style={{ marginBottom: '2rem' }}>
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
          </div>
        )}

        {activeTab === 'overview' && (
          <div className="animate-fade-in">
            {/* Stats Grid */}
            <div className="premium-stats-grid">
              <div className="premium-stat-card">
                <div className="stat-header">
                  <div className="stat-icon-box" style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#818cf8' }}>
                    <BookOpen size={24} />
                  </div>
                  <div className="stat-trend up">
                    <ArrowUpRight size={14} /> 12%
                  </div>
                </div>
                <div className="stat-value">{stats.totalCourses}</div>
                <div className="stat-label">Total Courses</div>
              </div>
              
              <div className="premium-stat-card">
                <div className="stat-header">
                  <div className="stat-icon-box" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                    <Users size={24} />
                  </div>
                  <div className="stat-trend up">
                    <ArrowUpRight size={14} /> 8%
                  </div>
                </div>
                <div className="stat-value">{stats.activeStudents}</div>
                <div className="stat-label">Active Students</div>
              </div>

              <div className="premium-stat-card">
                <div className="stat-header">
                  <div className="stat-icon-box" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                    <Star size={24} />
                  </div>
                  <div className="stat-trend up">
                    <ArrowUpRight size={14} /> 0.2
                  </div>
                </div>
                <div className="stat-value">{stats.avgRating}</div>
                <div className="stat-label">Avg. Rating</div>
              </div>

              <div className="premium-stat-card">
                <div className="stat-header">
                  <div className="stat-icon-box" style={{ background: 'rgba(236, 72, 153, 0.1)', color: '#ec4899' }}>
                    <BarChart size={24} />
                  </div>
                  <div className="status-badge online">
                    <div className="status-dot"></div> Active
                  </div>
                </div>
                <div className="stat-value">₹{stats.totalRevenue.toLocaleString()}</div>
                <div className="stat-label">Total Revenue</div>
              </div>
            </div>

            {/* Monitoring Section */}
            <div className="monitoring-grid">
              <div className="premium-section-card">
                <div className="section-header">
                  <h2>Student Engagement</h2>
                  <div className="status-badge online">Weekly View</div>
                </div>
                <div className="chart-container-mock">
                  {engagementData.map((d, i) => (
                    <div key={i} className="bar-wrapper">
                      <div 
                        className="bar-fill" 
                        style={{ height: `${d.value}%` }}
                        data-value={d.value}
                      ></div>
                      <span className="bar-label">{d.day}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="premium-section-card">
                <div className="section-header">
                  <h2>Recent Activity</h2>
                  <RefreshCcw 
                    size={16} 
                    className={refreshing ? 'animate-spin' : ''} 
                    onClick={fetchDashboardData}
                    style={{ cursor: 'pointer', color: '#64748b' }}
                  />
                </div>
                <div className="activity-list">
                  {activityLogs.map(log => (
                    <div key={log.id} className="activity-item">
                      <div className="activity-point" style={{ background: log.color }}></div>
                      <div className="activity-content">
                        <div className="activity-title">
                          {log.user} 
                          <span style={{ fontWeight: 400, color: '#64748b' }}> 
                            {log.type === 'enrollment' ? 'enrolled in' : log.type === 'quiz_completion' ? 'completed quiz in' : 'left a review for'} 
                          </span> 
                          {log.course}
                        </div>
                        <div className="activity-time">{log.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'courses' && (
          <div className="animate-slide-up">
            <div className="section-header">
              <h2>My Course Portfolio</h2>
              <p style={{ color: 'var(--text-muted)' }}>{filteredCourses.length} courses published</p>
            </div>
            
            <div className="courses-premium-grid">
              {filteredCourses.length > 0 ? filteredCourses.map(course => (
                <CourseCard 
                  key={course.id} 
                  course={course} 
                  onEdit={handleEditCourse}
                  onManageContent={handleManageContent}
                  onDelete={handleDeleteCourse}
                />
              )) : (
                <div className="premium-section-card" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem' }}>
                  <BookOpen size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
                  <h3>No courses found</h3>
                  <p>Start sharing your knowledge by creating your first course.</p>
                  <Button variant="primary" style={{ marginTop: '1.5rem' }} onClick={() => setIsCreatingCourse(true)}>Create Course</Button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'students' && (
          <div className="animate-slide-up">
            <div className="section-header">
              <h2>Student Progress Tracking</h2>
              <Button variant="secondary" onClick={fetchEnrollments} disabled={refreshing}>
                <RefreshCcw size={16} className={refreshing ? 'animate-spin' : ''} /> Refresh
              </Button>
            </div>

            <div className="premium-table-container">
              <table className="premium-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Courses</th>
                    <th>Average Progress</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {enrollments.length > 0 ? enrollments.map((s) => (
                    <tr key={s.student_email}>
                      <td>
                        <div className="user-cell">
                          <div className="user-avatar-small">{s.student_name.charAt(0)}</div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'white' }}>{s.student_name}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{s.student_email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="enrollment-count-badge" onClick={() => handleViewStudentCourses(s)} style={{ cursor: 'pointer' }}>
                          {s.courses_count} {s.courses_count === 1 ? 'Course' : 'Courses'}
                        </div>
                      </td>
                      <td>
                        <div className="progress-cell">
                          <div className="progress-bar-container" style={{ width: '120px', background: 'rgba(255,255,255,0.05)' }}>
                            <div className="progress-bar-fill" style={{ width: `${s.avg_progress}%`, background: s.avg_progress === 100 ? '#10b981' : 'var(--gradient-primary)' }}></div>
                          </div>
                          <span style={{ fontWeight: 700, color: s.avg_progress === 100 ? '#10b981' : 'white' }}>{s.avg_progress}%</span>
                        </div>
                      </td>
                      <td>
                        <Button variant="secondary" size="sm" onClick={() => handleViewStudentCourses(s)}>View Details</Button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', padding: '3rem' }}>
                        No students enrolled in your courses yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
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
