import React from 'react';
import { Award, X, Printer, Download } from 'lucide-react';
import Button from './Button';
import './CertificateModal.css';

const CertificateModal = ({ isOpen, onClose, data }) => {
  if (!isOpen || !data) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="certificate-modal-overlay animate-fade-in">
      <div className="certificate-content animate-slide-up" onClick={e => e.stopPropagation()}>
        <button className="player-close-btn" onClick={onClose}><X size={20} /></button>
        
        <div className="certificate-border">
          <div className="certificate-inner-border">
            <div className="certificate-header">
              <h1>Certificate</h1>
              <p>of Achievement</p>
            </div>
            
            <div className="certificate-body">
              <div className="presented-to">This certificate is proudly presented to</div>
              <div className="recipient-name">{data.user_name}</div>
              <div className="completion-text">
                for successfully completing the course <br />
                <span className="course-name">{data.course_title}</span>
              </div>
            </div>
            
            <div className="certificate-footer">
              <div className="footer-item signature">
                <div className="instructor-signature-name">{data.instructor_name || 'Learnify Faculty'}</div>
                <div className="signature-line"></div>
                <div className="footer-label">Authorized Signature</div>
              </div>
              
              <div className="footer-item seal">
                <div className="seal-icon">
                  <Award size={40} color="white" />
                </div>
              </div>
              
              <div className="footer-item date">
                <div className="date-value">
                  {new Date(data.issued_at).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
                <div className="signature-line"></div>
                <div className="footer-label">Date of Issuance</div>
                <div className="cert-id-badge">{data.certificate_id}</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="print-btn-container">
          <Button variant="primary" onClick={handlePrint}>
            <Printer size={18} /> Print Certificate
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CertificateModal;
