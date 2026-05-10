import React from 'react';
import { ShieldCheck, Lock, CreditCard, Shield, CheckCircle } from 'lucide-react';
import './PolicyPages.css';

const Security = () => {
  return (
    <div className="policy-page page-content animate-fade-in">
      <div className="policy-header">
        <div className="policy-icon-wrapper">
          <ShieldCheck size={40} className="gradient-text" />
        </div>
        <h1 className="section-title">Security <span className="gradient-text">Standards</span></h1>
        <p className="section-desc">We use industry-leading security protocols to ensure that your learning journey and personal data are always protected.</p>
      </div>

      <div className="policy-grid">
        <section className="policy-section glass">
          <div className="section-heading">
            <Lock size={24} className="primary-text" />
            <h2>Secure Authentication</h2>
          </div>
          <p>We use modern hashing algorithms and secure session management to protect your login credentials. Multi-layered authentication ensures that only you can access your account.</p>
        </section>

        <section className="policy-section glass">
          <div className="section-heading">
            <ShieldCheck size={24} className="primary-text" />
            <h2>Data Encryption</h2>
          </div>
          <p>All data transmitted between your device and our servers is encrypted using Industry-standard SSL/TLS protocols. This ensures your private information remains confidential during transit.</p>
        </section>

        <section className="policy-section glass">
          <div className="section-heading">
            <CreditCard size={24} className="primary-text" />
            <h2>Payment Security</h2>
          </div>
          <p>We do not store your credit card details on our servers. All transactions are processed through highly secure, PCI-compliant payment gateways like Razorpay, ensuring your financial data is never compromised.</p>
        </section>

        <section className="policy-section glass">
          <div className="section-heading">
            <Shield size={24} className="primary-text" />
            <h2>Access Control</h2>
          </div>
          <p>Our platform implements strict internal access controls. Only authorized personnel have access to system management tools, and all administrative actions are logged and monitored for security audits.</p>
        </section>

        <section className="policy-section glass full-width">
          <div className="section-heading">
            <CheckCircle size={24} className="primary-text" />
            <h2>Platform Reliability</h2>
          </div>
          <p>We perform regular security scans and vulnerability assessments to stay ahead of potential threats. Our infrastructure is designed for high availability and disaster recovery, providing you with a safe and uninterrupted learning experience.</p>
        </section>
      </div>
    </div>
  );
};

export default Security;
