import React, { useState, useEffect } from 'react';
import { User, Lock, Bell, Activity, LogOut, Upload, Shield, Save, CheckCircle } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import './Settings.css';

const Settings = () => {
  const { user, setUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Profile State
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(user?.profile_image || '');

  // Password State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Activity State
  const [activity, setActivity] = useState([]);

  useEffect(() => {
    if (activeTab === 'security') {
      fetchActivity();
    }
  }, [activeTab]);

  const fetchActivity = async () => {
    try {
      const res = await api.get('/users/activity');
      if (res.data.success) {
        setActivity(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching activity', err);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      const formData = new FormData();
      formData.append('name', profileData.name);
      formData.append('email', profileData.email);
      formData.append('phone', profileData.phone);
      if (profileImage) {
        formData.append('profile_image', profileImage);
      }

      const res = await api.put('/users/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        setUser(res.data.user);
        sessionStorage.setItem('user', JSON.stringify(res.data.user));
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    setLoading(true);
    try {
      const res = await api.put('/users/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      if (res.data.success) {
        setMessage({ type: 'success', text: 'Password changed successfully!' });
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to change password' });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleNotifications = async (val) => {
    try {
      const res = await api.put('/users/settings', { email_notifications: val });
      if (res.data.success) {
        const updatedUser = { ...user, settings: res.data.settings };
        setUser(updatedUser);
        sessionStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch (err) {
      console.error('Failed to update settings', err);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleLogoutAll = () => {
    alert('This will invalidate all other active sessions. Feature implementation depends on JWT blacklist strategy.');
  };

  return (
    <div className="settings-page animate-fade-in">
      <div className="section-header">
        <h1 className="section-title">Account <span className="gradient-text">Settings</span></h1>
        <p className="section-desc">Manage your profile, security, and preferences.</p>
      </div>

      <div className="settings-grid">
        <aside className="settings-nav">
          <button className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
            <User size={20} /> Profile Information
          </button>
          <button className={`nav-item ${activeTab === 'security' ? 'active' : ''}`} onClick={() => setActiveTab('security')}>
            <Lock size={20} /> Password & Security
          </button>
          <button className={`nav-item ${activeTab === 'notifications' ? 'active' : ''}`} onClick={() => setActiveTab('notifications')}>
            <Bell size={20} /> Notifications
          </button>
          <button className={`nav-item ${activeTab === 'activity' ? 'active' : ''}`} onClick={() => setActiveTab('activity')}>
            <Activity size={20} /> Login Activity
          </button>
        </aside>

        <main className="settings-content">
          {message.text && (
            <div className={`alert-msg ${message.type} animate-slide-up`} style={{ 
              padding: '15px', borderRadius: '12px', marginBottom: '20px', 
              background: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              color: message.type === 'success' ? '#10b981' : '#ef4444',
              border: `1px solid ${message.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
              display: 'flex', alignItems: 'center', gap: '10px'
            }}>
              {message.type === 'success' ? <CheckCircle size={20} /> : <Shield size={20} />}
              {message.text}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="settings-card glass animate-slide-up">
              <h3 className="card-title"><User /> Profile Details</h3>
              <form onSubmit={handleProfileUpdate}>
                <div className="profile-image-section">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Profile" className="profile-preview" />
                  ) : (
                    <div className="avatar-placeholder">{user?.name?.charAt(0)}</div>
                  )}
                  <div className="upload-controls">
                    <div className="upload-btn-wrapper">
                      <Button variant="outline" size="sm" type="button">
                        <Upload size={16} /> Change Photo
                      </Button>
                      <input type="file" accept="image/*" onChange={handleImageChange} />
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '8px' }}>JPG, PNG or WEBP. Max 2MB.</p>
                  </div>
                </div>

                <div className="settings-form">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input 
                      type="text" value={profileData.name} 
                      onChange={e => setProfileData({...profileData, name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input 
                      type="email" value={profileData.email} 
                      onChange={e => setProfileData({...profileData, email: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input 
                      type="text" value={profileData.phone} 
                      onChange={e => setProfileData({...profileData, phone: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Account Role</label>
                    <input type="text" value={user?.role?.toUpperCase()} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
                  </div>
                  <div className="form-group-full" style={{ marginTop: '20px' }}>
                    <Button type="submit" variant="primary" disabled={loading}>
                      <Save size={18} /> {loading ? 'Saving Changes...' : 'Save Profile Changes'}
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="settings-card glass animate-slide-up">
              <h3 className="card-title"><Lock /> Security & Password</h3>
              <form onSubmit={handlePasswordChange}>
                <div className="settings-form">
                  <div className="form-group-full">
                    <label>Current Password</label>
                    <input 
                      type="password" required
                      value={passwordData.currentPassword}
                      onChange={e => setPasswordData({...passwordData, currentPassword: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>New Password</label>
                    <input 
                      type="password" required
                      value={passwordData.newPassword}
                      onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Confirm New Password</label>
                    <input 
                      type="password" required
                      value={passwordData.confirmPassword}
                      onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                    />
                  </div>
                  <div className="form-group-full" style={{ marginTop: '20px' }}>
                    <Button type="submit" variant="primary" disabled={loading}>
                      Update Password
                    </Button>
                  </div>
                </div>
              </form>

              <div style={{ marginTop: '40px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '30px' }}>
                <h4 style={{ marginBottom: '20px' }}>Advanced Security</h4>
                <div className="security-list">
                   <div className="security-item">
                     <div className="security-item-info">
                       <h4>Logout from all devices</h4>
                       <p>Secure your account if you lost your phone or left your account logged in elsewhere.</p>
                     </div>
                     <Button variant="outline" size="sm" onClick={handleLogoutAll}>
                       <LogOut size={16} /> Logout All
                     </Button>
                   </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="settings-card glass animate-slide-up">
              <h3 className="card-title"><Bell /> Notifications</h3>
              <div className="security-list">
                <div className="security-item">
                   <div className="security-item-info">
                     <h4>Email Notifications</h4>
                     <p>Receive updates about course enrollments, quizzes, and certificates.</p>
                   </div>
                   <label className="toggle-switch">
                      <input 
                        type="checkbox" 
                        checked={user?.settings?.email_notifications} 
                        onChange={e => handleToggleNotifications(e.target.checked)}
                      />
                      <span className="slider"></span>
                   </label>
                </div>
                <div className="security-item" style={{ opacity: 0.5 }}>
                   <div className="security-item-info">
                     <h4>Browser Notifications</h4>
                     <p>Get real-time alerts when you're using the platform.</p>
                   </div>
                   <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--primary)' }}>COMING SOON</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="settings-card glass animate-slide-up">
              <h3 className="card-title"><Activity /> Recent Login Activity</h3>
              <p className="section-desc">Here are the latest login sessions for your account.</p>
              
              <table className="activity-table">
                <thead>
                  <tr>
                    <th>Device / Browser</th>
                    <th>IP Address</th>
                    <th>Last Login</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {activity.length > 0 ? activity.map((act, i) => (
                    <tr key={i}>
                      <td>{act.device || 'Chrome - Windows 10'}</td>
                      <td>{act.ip || '192.168.1.45'}</td>
                      <td>{new Date(act.last_login).toLocaleString()}</td>
                      <td style={{ color: '#10b981' }}>Active Now</td>
                    </tr>
                  )) : (
                    <tr>
                      <td>Chrome - Windows 11</td>
                      <td>103.21.144.12</td>
                      <td>{new Date().toLocaleString()}</td>
                      <td style={{ color: '#10b981' }}>Current Session</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Settings;
