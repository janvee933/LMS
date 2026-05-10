import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Layout, Users, BookOpen, ShieldCheck, Settings, Plus, 
  Award, Star, Search, Bell, Activity, ArrowUpRight, 
  ArrowDownRight, Trash2, ExternalLink, RefreshCcw,
  MoreVertical, CheckCircle2, Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button';
import CourseForm from '../../components/CourseForm';
import Loader from '../../components/Loader';
import api from '../../api/axios';
import StudentCoursesModal from '../../components/StudentCoursesModal';
import InstructorCoursesModal from '../../components/InstructorCoursesModal';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    courses: 0,
    users: 0,
    students: 0,
    instructors: 0
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState(() => sessionStorage.getItem('adminActiveTab') || 'overview'); 
  const [enrollments, setEnrollments] = useState([]);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [isCreatingCourse, setIsCreatingCourse] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newUserData, setNewUserData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'student'
  });
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [allCourses, setAllCourses] = useState([]);
  const [isInstructorModalOpen, setIsInstructorModalOpen] = useState(false);
  const [selectedInstructorCourses, setSelectedInstructorCourses] = useState([]);
  const [selectedInstructorName, setSelectedInstructorName] = useState('');

  // Mock data for monitoring
  const [activityLogs] = useState([
    { id: 1, type: 'registration', user: 'Rahul Sharma', time: '2 mins ago', color: '#818cf8' },
    { id: 2, type: 'enrollment', user: 'Priya Singh', time: '15 mins ago', color: '#10b981' },
    { id: 3, type: 'course_creation', user: 'Dr. Amit Kumar', time: '1 hour ago', color: '#f59e0b' },
    { id: 4, type: 'completion', user: 'Sanjay Gupta', time: '3 hours ago', color: '#ec4899' },
  ]);

  const [revenueData] = useState([
    { day: 'Mon', value: 65 },
    { day: 'Tue', value: 85 },
    { day: 'Wed', value: 45 },
    { day: 'Thu', value: 95 },
    { day: 'Fri', value: 75 },
    { day: 'Sat', value: 55 },
    { day: 'Sun', value: 90 },
  ]);

  const fetchEnrollments = async () => {
    try {
      setRefreshing(true);
      const res = await api.get('/enrollments/admin/all');
      if (res.data.success) {
        setEnrollments(res.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching enrollments', error);
    } finally {
      setRefreshing(false);
    }
  };

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const coursesRes = await api.get('/courses');
      const usersRes = await api.get('/auth/users');
      
      const allUsers = usersRes.data?.users || [];
      const students = allUsers.filter(u => u.role === 'student');
      const instructors = allUsers.filter(u => u.role === 'instructor');

      const coursesData = coursesRes.data?.data || [];
      setAllCourses(coursesData);
      setUsers(allUsers);
      setStats({
        courses: coursesData.length,
        users: allUsers.length,
        students: students.length,
        instructors: instructors.length
      });
    } catch (error) {
      console.error('Error fetching admin data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
    fetchEnrollments();
  }, []);

  useEffect(() => {
    sessionStorage.setItem('adminActiveTab', activeTab);
  }, [activeTab]);

  const filteredUsers = useMemo(() => {
    return users.filter(u => 
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [users, searchQuery]);

  const handleDeleteUser = async (userId, userName) => {
    if (window.confirm(`Are you sure you want to delete user ${userName}?`)) {
      try {
        const res = await api.delete(`/auth/users/${userId}`);
        if (res.data.success) {
          fetchAdminData();
        }
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (newUserData.phone.length !== 10) {
      alert('Mobile number must be exactly 10 digits');
      return;
    }
    try {
      const res = await api.post('/auth/users', newUserData);
      if (res.data.success) {
        setIsCreatingUser(false);
        setNewUserData({ name: '', email: '', password: '', phone: '', role: 'student' });
        fetchAdminData();
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create user');
    }
  };

  const handleViewStudentCourses = (student) => {
    setSelectedStudent(student);
    setIsStudentModalOpen(true);
  };

  const handleViewInstructorCourses = (instructor) => {
    const courses = allCourses.filter(c => String(c.instructor_id) === String(instructor.id));
    setSelectedInstructorCourses(courses);
    setSelectedInstructorName(instructor.name);
    setIsInstructorModalOpen(true);
  };

  if (loading) return <Loader fullPage message="Initializing Admin Panel..." />;

  return (
    <div className="admin-dashboard-container">
      {/* Premium Sidebar */}
      <aside className="admin-sidebar-premium">
        <div className="sidebar-logo">
          <ShieldCheck size={32} />
          <span>Antigravity LMS</span>
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
            className={`nav-item-premium ${activeTab === 'users' ? 'active' : ''}`} 
            onClick={() => setActiveTab('users')}
          >
            <div className="icon-wrapper"><Users size={18} /></div>
            <span>Students</span>
          </button>
          <button 
            className={`nav-item-premium ${activeTab === 'instructors' ? 'active' : ''}`} 
            onClick={() => setActiveTab('instructors')}
          >
            <div className="icon-wrapper"><Award size={18} /></div>
            <span>Instructors</span>
          </button>
          <button 
            className={`nav-item-premium ${activeTab === 'enrollments' ? 'active' : ''}`} 
            onClick={() => setActiveTab('enrollments')}
          >
            <div className="icon-wrapper"><Clock size={18} /></div>
            <span>Progress Tracking</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile-compact">
            <div className="avatar-circle">{user?.name?.charAt(0)}</div>
            <div className="user-info-text">
              <h4>{user?.name}</h4>
              <p>System Administrator</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="admin-content-premium">
        <header className="admin-header-premium">
          <div className="header-title-area">
            <h1>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
            <p>Welcome back, {user?.name}. Here's what's happening today.</p>
          </div>
          
          <div className="header-actions">
            <div className="search-wrapper-premium">
              <Search className="search-icon" size={18} />
              <input 
                type="text" 
                placeholder="Search anything..." 
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
              defaultInstructorId={user.id} 
              onSuccess={() => { setIsCreatingCourse(false); fetchAdminData(); }}
              onCancel={() => setIsCreatingCourse(false)}
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
                <div className="stat-value">{stats.courses}</div>
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
                <div className="stat-value">{stats.users}</div>
                <div className="stat-label">System Users</div>
              </div>

              <div className="premium-stat-card">
                <div className="stat-header">
                  <div className="stat-icon-box" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                    <Award size={24} />
                  </div>
                  <div className="stat-trend down">
                    <ArrowDownRight size={14} /> 2%
                  </div>
                </div>
                <div className="stat-value">{stats.instructors}</div>
                <div className="stat-label">Active Instructors</div>
              </div>

              <div className="premium-stat-card">
                <div className="stat-header">
                  <div className="stat-icon-box" style={{ background: 'rgba(236, 72, 153, 0.1)', color: '#ec4899' }}>
                    <ShieldCheck size={24} />
                  </div>
                  <div className="status-badge online">
                    <div className="status-dot"></div> Online
                  </div>
                </div>
                <div className="stat-value">99.9%</div>
                <div className="stat-label">System Uptime</div>
              </div>
            </div>

            {/* Monitoring Section */}
            <div className="monitoring-grid">
              <div className="premium-section-card">
                <div className="section-header">
                  <h2>Engagement Growth</h2>
                  <div className="status-badge online">Weekly View</div>
                </div>
                <div className="chart-container-mock">
                  {revenueData.map((d, i) => (
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
                    onClick={fetchAdminData}
                    style={{ cursor: 'pointer', color: '#64748b' }}
                  />
                </div>
                <div className="activity-list">
                  {activityLogs.map(log => (
                    <div key={log.id} className="activity-item">
                      <div className="activity-point" style={{ background: log.color }}></div>
                      <div className="activity-content">
                        <div className="activity-title">{log.user} <span style={{ fontWeight: 400, color: '#64748b' }}>{log.type === 'registration' ? 'joined the platform' : log.type === 'enrollment' ? 'enrolled in a course' : 'updated content'}</span></div>
                        <div className="activity-time">{log.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="animate-slide-up">
            <div className="section-header">
              <h2>Student Directory</h2>
              <Button variant="primary" onClick={() => setIsCreatingUser(!isCreatingUser)}>
                {isCreatingUser ? 'Cancel' : 'Add Student'}
              </Button>
            </div>

            {isCreatingUser && (
              <div className="premium-section-card animate-slide-up" style={{ marginBottom: '2rem' }}>
                <form onSubmit={handleCreateUser} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <input className="admin-input" placeholder="Name" required value={newUserData.name} onChange={e => setNewUserData({...newUserData, name: e.target.value})} />
                  <input className="admin-input" placeholder="Email" type="email" required value={newUserData.email} onChange={e => setNewUserData({...newUserData, email: e.target.value})} />
                  <input className="admin-input" placeholder="Phone" required value={newUserData.phone} onChange={e => setNewUserData({...newUserData, phone: e.target.value})} />
                  <input className="admin-input" placeholder="Password" type="password" required value={newUserData.password} onChange={e => setNewUserData({...newUserData, password: e.target.value})} />
                  <div style={{ gridColumn: '1 / -1' }}>
                    <Button type="submit" variant="primary">Create Account</Button>
                  </div>
                </form>
              </div>
            )}

            <div className="premium-table-container">
              <table className="premium-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Contact</th>
                    <th>Status</th>
                    <th>Courses</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.filter(u => u.role === 'student').map(u => (
                    <tr key={u.id}>
                      <td>
                        <div className="user-cell">
                          <div className="user-avatar-small">{u.name.charAt(0)}</div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'white' }}>{u.name}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>ID: {u.id.slice(-6)}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.875rem' }}>{u.email}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{u.phone}</div>
                      </td>
                      <td>
                        <span className="status-badge online">Active</span>
                      </td>
                      <td>
                        <div className="enrollment-count-badge" onClick={() => handleViewStudentCourses(u)} style={{ cursor: 'pointer' }}>
                          {u.enrollment_count || 0} Enrolled
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => handleDeleteUser(u.id, u.name)} className="delete-btn"><Trash2 size={14} /></button>
                          <button onClick={() => handleViewStudentCourses(u)} className="nav-item-premium" style={{ padding: '6px' }}><ExternalLink size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'instructors' && (
          <div className="animate-slide-up">
            <div className="section-header">
              <h2>Faculty Management</h2>
              <Button variant="primary" onClick={() => setIsCreatingUser(true)}>Add Instructor</Button>
            </div>

            <div className="premium-table-container">
              <table className="premium-table">
                <thead>
                  <tr>
                    <th>Instructor</th>
                    <th>Email</th>
                    <th>Courses</th>
                    <th>Performance</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.filter(u => u.role === 'instructor').map(u => (
                    <tr key={u.id}>
                      <td>
                        <div className="user-cell">
                          <div className="user-avatar-small" style={{ background: 'var(--gradient-primary)' }}>{u.name.charAt(0)}</div>
                          <div style={{ fontWeight: 600, color: 'white' }}>{u.name}</div>
                        </div>
                      </td>
                      <td>{u.email}</td>
                      <td>
                        <span className="enrollment-count-badge">{u.created_courses_count || 0} Courses</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '4px', color: '#f59e0b' }}>
                          {[1,2,3,4,5].map(s => <Star key={s} size={12} fill={s <= 4 ? "#f59e0b" : "none"} />)}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <Button variant="secondary" size="sm" onClick={() => handleViewInstructorCourses(u)}>View Portfolio</Button>
                          <button onClick={() => handleDeleteUser(u.id, u.name)} className="delete-btn"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'enrollments' && (
          <div className="animate-slide-up">
            <div className="section-header">
              <h2>Global Progress Tracking</h2>
              <Button variant="secondary" onClick={fetchEnrollments} disabled={refreshing}>
                <RefreshCcw size={16} className={refreshing ? 'animate-spin' : ''} /> Refresh
              </Button>
            </div>

            <div className="premium-table-container">
              <table className="premium-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Pathways</th>
                    <th>Completion</th>
                    <th>Insights</th>
                  </tr>
                </thead>
                <tbody>
                  {enrollments.map((s) => (
                    <tr key={s.student_email}>
                      <td>
                        <div style={{ fontWeight: 600, color: 'white' }}>{s.student_name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{s.student_email}</div>
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
                        <Button variant="secondary" size="sm" onClick={() => handleViewStudentCourses(s)}>View Analytics</Button>
                      </td>
                    </tr>
                  ))}
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
      />
      <InstructorCoursesModal 
        isOpen={isInstructorModalOpen}
        onClose={() => { setIsInstructorModalOpen(false); setSelectedInstructorCourses([]); }}
        instructorName={selectedInstructorName}
        courses={selectedInstructorCourses}
      />
    </div>
  );
};

export default AdminDashboard;
