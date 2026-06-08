import React, { useState } from 'react';
import { Mail, Lock, User, Phone, ArrowRight, Loader2, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from './Button';
import './AuthForm.css';

const AuthForm = ({ type = 'login' }) => {
  const [isLogin, setIsLogin] = useState(type === 'login');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'student'
  });

  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'phone') {
      // Only allow numbers and limit to 10 digits
      const cleanedValue = value.replace(/\D/g, '').slice(0, 10);
      setFormData({ ...formData, [name]: cleanedValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    
    if (error) setError('');
  };

  const handleRoleChange = (role) => {
    setFormData({ ...formData, role });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    let result;
    if (isLogin) {
      result = await login(formData.email, formData.password);
    } else {
      result = await signup(formData);
    }

    if (result.success) {
      // Redirect to role-specific dashboard
      const userRole = result.user?.role || (isLogin ? '' : formData.role) || 'student';
      navigate(`/${userRole}/dashboard`);
    } else {
      setError(result.message);
    }
    setLoading(false);
  };
  return (
    <div className="auth-wrapper">
      <div className="auth-container glass animate-fade-in">
      <div className="auth-header">
        <h2 className="auth-title">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
        <p className="auth-subtitle">
          {isLogin ? "Enter your credentials to access your account" : "Join our community and start your learning journey"}
        </p>
      </div>

      {error && (
        <div className="auth-error animate-fade-in">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <form className="auth-form" onSubmit={handleSubmit}>
        {!isLogin && (
          <div className="input-group">
            <User className="input-icon" size={20} />
            <input 
              type="text" 
              name="name" 
              placeholder="Full Name" 
              required 
              value={formData.name}
              onChange={handleChange}
            />
          </div>
        )}

        <div className="input-group">
          <Mail className="input-icon" size={20} />
          <input 
            type="email" 
            name="email" 
            placeholder="Email Address" 
            required 
            autoComplete="off"
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        {!isLogin && (
          <div className="input-group">
            <Phone className="input-icon" size={20} />
            <input 
              type="tel" 
              name="phone" 
              placeholder="Phone Number (10 digits)" 
              maxLength={10}
              autoComplete="off"
              required 
              value={formData.phone}
              onChange={handleChange}
            />
          </div>
        )}

        <div className="input-group">
          <Lock className="input-icon" size={20} />
          <input 
            type={showPassword ? "text" : "password"} 
            name="password" 
            placeholder="Password" 
            required 
            value={formData.password}
            onChange={handleChange}
          />
          <div className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </div>
        </div>

        {isLogin && (
          <div className="forgot-password">
            <a href="#" onClick={(e) => { e.preventDefault(); alert('Password reset functionality is coming soon!'); }}>Forgot password?</a>
          </div>
        )}

        <Button variant="primary" className="auth-btn" disabled={loading}>
          {loading ? <Loader2 className="spinner" size={20} /> : (
            <>
              {isLogin ? 'Login' : 'Signup'} <ArrowRight size={18} />
            </>
          )}
        </Button>
      </form>

      <div className="auth-footer">
        <p>
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <button className="toggle-auth" onClick={() => { setIsLogin(!isLogin); setError(''); }}>
            {isLogin ? 'Sign up' : 'Login'}
          </button>
        </p>
      </div>
      </div>
    </div>
  );
};

export default AuthForm;
