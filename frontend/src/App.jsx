import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

import Home from './pages/Home';
import CourseCard from './components/CourseCard';
import Courses from './pages/Courses';
import AuthForm from './components/AuthForm';
import DashboardRedirect from './components/DashboardRedirect';
import StudentDashboard from './pages/dashboards/StudentDashboard';
import InstructorDashboard from './pages/dashboards/InstructorDashboard';
import AdminDashboard from './pages/dashboards/AdminDashboard';
import Settings from './pages/Settings';
import CoursePlayer from './pages/CoursePlayer';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Security from './pages/Security';
import Loader from './components/Loader';
import ScrollToTop from './components/ScrollToTop';
import { useAuth } from './context/AuthContext';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return children;
};

// Role-based Route Component
const RoleRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  if (loading) return <Loader message="Setting up your experience..." />;
  if (!user) return <Navigate to="/login" />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/dashboard" />;
  return children;
};

function App() {
  const { loading } = useAuth();

  if (loading) {
    return <Loader message="Setting up your experience..." />;
  }

  return (
    <Router>
      <ScrollToTop />
      <div className="app-container">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/login" element={<AuthForm type="login" />} />
            <Route path="/signup" element={<AuthForm type="signup" />} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/security" element={<Security />} />
            
            {/* Generic Dashboard Redirector */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardRedirect />
                </ProtectedRoute>
              } 
            />

            {/* Role-Specific Dashboards */}
            <Route 
              path="/student/dashboard" 
              element={
                <RoleRoute allowedRoles={['student']}>
                  <StudentDashboard />
                </RoleRoute>
              } 
            />
            <Route 
              path="/instructor/dashboard" 
              element={
                <RoleRoute allowedRoles={['instructor']}>
                  <InstructorDashboard />
                </RoleRoute>
              } 
            />
            <Route 
              path="/admin/dashboard" 
              element={
                <RoleRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </RoleRoute>
              } 
            />
            <Route 
              path="/course/:courseId/player" 
              element={
                <ProtectedRoute>
                  <CoursePlayer />
                </ProtectedRoute>
              } 
            />
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        <Footer />
      </div>

    </Router>
  );
}

export default App;
