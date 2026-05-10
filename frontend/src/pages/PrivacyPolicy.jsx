import React from 'react';
import { Shield, Lock, Eye, FileText, UserCheck } from 'lucide-react';
import './PolicyPages.css';

const PrivacyPolicy = () => {
  return (
    <div className="policy-page page-content animate-fade-in">
      <div className="policy-header">
        <div className="policy-icon-wrapper">
          <Eye size={40} className="gradient-text" />
        </div>
        <h1 className="section-title">Privacy <span className="gradient-text">Policy</span></h1>
        <p className="section-desc">At Learnify, your privacy is our priority. We are committed to protecting your personal data and ensuring a transparent learning experience.</p>
      </div>

      <div className="policy-grid">
        <section className="policy-section glass">
          <div className="section-heading">
            <FileText size={24} className="primary-text" />
            <h2>Data Collection</h2>
          </div>
          <p>We collect information that you provide directly to us when you create an account, enroll in a course, or communicate with our support team. This includes:</p>
          <ul>
            <li>Personal identifiers (Name, Email, Phone Number)</li>
            <li>Profile information and educational preferences</li>
            <li>Learning progress and assessment data</li>
            <li>Communication history with instructors and support</li>
          </ul>
        </section>

        <section className="policy-section glass">
          <div className="section-heading">
            <UserCheck size={24} className="primary-text" />
            <h2>How We Use Data</h2>
          </div>
          <p>Your data allows us to provide a personalized and effective learning journey. We use your information to:</p>
          <ul>
            <li>Manage your account and course enrollments</li>
            <li>Provide personalized course recommendations</li>
            <li>Track your progress and issue certifications</li>
            <li>Improve our platform features and user experience</li>
            <li>Send important updates regarding your courses</li>
          </ul>
        </section>

        <section className="policy-section glass">
          <div className="section-heading">
            <Lock size={24} className="primary-text" />
            <h2>Data Protection</h2>
          </div>
          <p>We implement robust technical and organizational measures to safeguard your information against unauthorized access, alteration, or disclosure. Your data is stored on secure servers with restricted access protocols.</p>
        </section>

        <section className="policy-section glass">
          <div className="section-heading">
            <Shield size={24} className="primary-text" />
            <h2>Cookies & Tracking</h2>
          </div>
          <p>We use cookies to enhance your browsing experience. Cookies help us remember your login state, understand how you interact with our content, and save your preferences for future visits. You can manage cookie settings through your browser at any time.</p>
        </section>

        <section className="policy-section glass full-width">
          <div className="section-heading">
            <Shield size={24} className="primary-text" />
            <h2>Your Rights & Control</h2>
          </div>
          <p>You have full control over your personal information. You can access, update, or request the deletion of your account and associated data through your Profile Settings. We respect your right to data portability and transparency in how your information is handled.</p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
