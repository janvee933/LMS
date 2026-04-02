import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Layout, Users, BookOpen, ShieldCheck, Settings, Plus, Award, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button';
import CourseForm from '../../components/CourseForm';
import Loader from '../../components/Loader';
import api from '../../api/axios';
import StudentCoursesModal from '../../components/StudentCoursesModal';
import InstructorCoursesModal from '../../components/InstructorCoursesModal';
import '../Dashboard.css';

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
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'users', 'instructors', or 'enrollments'
  const [enrollments, setEnrollments] = useState([]);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [isCreatingCourse, setIsCreatingCourse] = useState(false);
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

  const fetchEnrollments = async () => {
    try {
      setRefreshing(true);
      const res = await api.get('/enrollments/admin/all');
      if (res.data.success) {
        setEnrollments(res.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching enrollments', error);
      window.alert(`Admin Tracking API Error: ${error.response?.data?.message || error.message}`);
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

      console.log('Admin Data Fetched:', { usersCount: allUsers.length, coursesCount: (coursesRes.data?.data || []).length });
      console.log('Full User List:', allUsers);

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

  const handleViewStudentCourses = (student) => {
    setSelectedStudent(student);
    setIsStudentModalOpen(true);
  };

  const handleViewInstructorCourses = (instructor) => {
    const courses = allCourses.filter(c => Number(c.instructor_id) === Number(instructor.id));
    setSelectedInstructorCourses(courses);
    setSelectedInstructorName(instructor.name);
    setIsInstructorModalOpen(true);
  };

  useEffect(() => {
    fetchAdminData();
    fetchEnrollments();
  }, []);

  const handleDeleteUser = async (userId, userName) => {
    if (window.confirm(`Are you sure you want to delete user ${userName}?`)) {
      try {
        const res = await api.delete(`/auth/users/${userId}`);
        if (res.data.success) {
          alert('User deleted successfully');
          fetchAdminData();
        }
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    
    // Validate Phone Length
    if (newUserData.phone.length !== 10) {
      alert('Mobile number must be exactly 10 digits');
      return;
    }

    try {
      const res = await api.post('/auth/users', newUserData);
      if (res.data.success) {
        alert(`User ${newUserData.name} created successfully!`);
        setIsCreatingUser(false);
        setNewUserData({ name: '', email: '', password: '', phone: '', role: 'student' });
        fetchAdminData();
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create user');
    }
  };

  return (
    <div className="dashboard-page page-content animate-fade-in">
      <header className="dashboard-header">
        <div className="welcome-text">
          <h1 className="section-title">
            <span className="gradient-text">{user?.name}</span>
          </h1>
          <p className="section-desc">Global platform overview and system management.</p>
        </div>
        <div className="admin-actions">
          <Button variant="secondary" onClick={() => {
            if (activeTab === 'overview') setActiveTab('users');
            else if (activeTab === 'users') setActiveTab('instructors');
            else if (activeTab === 'instructors') setActiveTab('enrollments');
            else setActiveTab('overview');
          }}>
            {activeTab === 'overview' ? 'Manage Users' : activeTab === 'users' ? 'Manage Instructors' : activeTab === 'instructors' ? 'Student Progress' : 'Back to Overview'}
          </Button>
          <Button variant="primary" onClick={() => setIsCreatingCourse(!isCreatingCourse)}>
            {isCreatingCourse ? 'Cancel' : <><Plus size={18} /> Create Course</>}
          </Button>
        </div>
      </header>

      {isCreatingCourse && (
        <CourseForm 
          defaultInstructorId={user.id} 
          onSuccess={() => { setIsCreatingCourse(false); fetchAdminData(); }}
          onCancel={() => setIsCreatingCourse(false)}
        />
      )}

      {activeTab === 'overview' ? (
        <>
          <div className="stats-grid">
            <div className="stat-card glass">
              <div className="stat-icon purple">
                <BookOpen size={24} />
              </div>
              <div className="stat-info">
                <h3>{stats.courses}</h3>
                <p>Total Courses</p>
              </div>
            </div>
            <div className="stat-card glass">
              <div className="stat-icon blue">
                <Users size={24} />
              </div>
              <div className="stat-info">
                <h3>{stats.users}</h3>
                <p>Total Users</p>
              </div>
            </div>
            <div className="stat-card glass" onClick={() => setActiveTab('instructors')} style={{ cursor: 'pointer' }}>
              <div className="stat-icon orange">
                <Award size={24} />
              </div>
              <div className="stat-info">
                <h3>{stats.instructors}</h3>
                <p>Instructors</p>
              </div>
            </div>
            <div className="stat-card glass">
              <div className="stat-icon green">
                <ShieldCheck size={24} />
              </div>
              <div className="stat-info">
                <h3>{stats.students}</h3>
                <p>Active Students</p>
              </div>
            </div>
          </div>

          <section className="dashboard-section">
            <h2 className="section-subtitle">Platform <span className="gradient-text">Management</span></h2>
            <div className="admin-grid">
              <div className="admin-card glass" onClick={() => setActiveTab('enrollments')}>
                <h3>Student Progress</h3>
                <p>Track enrollments and learning progress across courses.</p>
              </div>
            </div>
          </section>
        </>
      ) : activeTab === 'users' ? (
        <section className="dashboard-section users-section animate-fade-in">
          <div className="section-header-inline">
            <h2 className="section-subtitle">User <span className="gradient-text">Management</span></h2>
            <Button variant="primary" onClick={() => setIsCreatingUser(!isCreatingUser)}>
              {isCreatingUser ? 'Cancel' : 'Add New User'}
            </Button>
          </div>

          {isCreatingUser && (
            <div className="create-user-form glass animate-slide-up" style={{ marginBottom: '30px', padding: '20px' }}>
              <form onSubmit={handleCreateUser} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <input 
                  type="text" placeholder="Name" required 
                  autoComplete="name"
                  value={newUserData.name} onChange={e => setNewUserData({...newUserData, name: e.target.value})}
                  className="admin-input"
                />
                <input 
                  type="email" placeholder="Email" required 
                  autoComplete="email"
                  value={newUserData.email} onChange={e => setNewUserData({...newUserData, email: e.target.value})}
                  className="admin-input"
                />
                <input 
                  type="tel" placeholder="Phone (10 digits)" required 
                  maxLength={10}
                  autoComplete="tel"
                  value={newUserData.phone} 
                  onChange={e => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setNewUserData({...newUserData, phone: val});
                  }}
                  className="admin-input"
                />
                <input 
                  type="password" placeholder="Password" required 
                  autoComplete="new-password"
                  value={newUserData.password} onChange={e => setNewUserData({...newUserData, password: e.target.value})}
                  className="admin-input"
                />
                <select 
                  value={newUserData.role} onChange={e => setNewUserData({...newUserData, role: e.target.value})}
                  className="admin-input"
                >
                  <option value="student">Student</option>
                  <option value="instructor">Instructor</option>
                  <option value="admin">Admin</option>
                </select>
                <div style={{ gridColumn: 'span 2' }}>
                  <Button type="submit" variant="primary">Create User</Button>
                </div>
              </form>
            </div>
          )}

          <div className="users-table-container glass">
            {loading ? (
              <Loader fullPage={false} message="Loading user data..." />
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Phone</th>
                    <th>Enrolled</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td><span className={`role-badge-small ${u.role}`}>{u.role}</span></td>
                      <td>{u.phone}</td>
                      <td>
                        {u.role === 'student' || u.role === 'instructor' ? (
                          <span className="enrollment-count-badge">{u.enrollment_count || 0} Courses</span>
                        ) : '-'}
                      </td>
                      <td>
                        <button 
                          className="delete-btn" 
                          onClick={() => handleDeleteUser(u.id, u.name)}
                          disabled={u.id === user.id}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      ) : activeTab === 'instructors' ? (
        <section className="dashboard-section instructors-section animate-fade-in">
          <div className="section-header-inline">
            <h2 className="section-subtitle">Instructor <span className="gradient-text">Management</span></h2>
            <Button variant="primary" onClick={() => setIsCreatingUser(!isCreatingUser)}>
              {isCreatingUser ? 'Cancel' : 'Add New Instructor'}
            </Button>
          </div>

          {isCreatingUser && (
            <div className="create-user-form glass animate-slide-up" style={{ marginBottom: '30px', padding: '20px' }}>
              <form onSubmit={handleCreateUser} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <input 
                  type="text" placeholder="Name" required 
                  autoComplete="name"
                  value={newUserData.name} onChange={e => setNewUserData({...newUserData, name: e.target.value, role: 'instructor'})}
                  className="admin-input"
                />
                <input 
                  type="email" placeholder="Email" required 
                  autoComplete="email"
                  value={newUserData.email} onChange={e => setNewUserData({...newUserData, email: e.target.value})}
                  className="admin-input"
                />
                <input 
                  type="tel" placeholder="Phone (10 digits)" required 
                  maxLength={10}
                  autoComplete="tel"
                  value={newUserData.phone} 
                  onChange={e => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setNewUserData({...newUserData, phone: val});
                  }}
                  className="admin-input"
                />
                <input 
                  type="password" placeholder="Password" required 
                  autoComplete="new-password"
                  value={newUserData.password} onChange={e => setNewUserData({...newUserData, password: e.target.value})}
                  className="admin-input"
                />
                <div style={{ gridColumn: 'span 2' }}>
                  <Button type="submit" variant="primary">Create Instructor</Button>
                </div>
              </form>
            </div>
          )}

          <div className="users-table-container glass">
            {loading ? (
              <Loader fullPage={false} message="Loading instructor data..." />
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Courses Created</th>
                    <th>View Courses</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.filter(u => u.role === 'instructor').map(u => (
                    <tr key={u.id}>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>{u.phone}</td>
                      <td>
                        <span className="enrollment-count-badge">{u.created_courses_count || 0} Courses</span>
                      </td>
                      <td>
                        <Button 
                          variant="secondary" 
                          size="sm"
                          onClick={() => handleViewInstructorCourses(u)}
                        >
                          View
                        </Button>
                      </td>
                      <td>
                        <button 
                          className="delete-btn" 
                          onClick={() => handleDeleteUser(u.id, u.name)}
                          disabled={u.id === user.id}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
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
              <Loader fullPage={false} message="Loading tracking data..." />
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
                  {enrollments.length > 0 ? enrollments.map((s) => (
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
                      <td colSpan="3" style={{ textAlign: 'center', padding: '30px' }}>No enrollment data found.</td>
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
