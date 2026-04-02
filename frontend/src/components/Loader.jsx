import React from 'react';
import { Loader2 } from 'lucide-react';
import './Loader.css';

const Loader = ({ fullPage = true, message = "Loading..." }) => {
  return (
    <div className={`loader-wrapper ${fullPage ? 'full-page' : ''}`}>
      <div className="loader-content">
        <div className="spinner-container">
          <div className="spinner-outer"></div>
          <div className="spinner-inner"></div>
          <Loader2 size={40} className="animate-spin main-spinner" />
          <div className="spinner-glow"></div>
        </div>
        <p className="loader-message">{message}</p>
      </div>
    </div>
  );
};

export default Loader;
