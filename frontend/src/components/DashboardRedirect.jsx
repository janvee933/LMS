import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DashboardRedirect = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/login');
      } else {
        // Redirect to role-specific dashboard
        const role = user.role || 'student';
        navigate(`/${role}/dashboard`);
      }
    }
  }, [user, loading, navigate]);

  return (
    <div className="loading-container">
      <div className="loading-spinner">Redirecting to your dashboard...</div>
    </div>
  );
};

export default DashboardRedirect;
