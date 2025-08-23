import React from 'react';
import './Topbar.css';

const TopBar = () => {
  return (
    <header className="topbar-wrapper">
      <nav className="topbar">
        <h1 className="website-name">National Univeristy Of Modern Languages</h1>
        
        <div className="right-section">
          <a href="mailto:contact@techsolutions.com" className="email-link">
            Numl@edu.gmail.com
          </a>
          <div className="social-links">
            <a href="https://twitter.com" className="social-link" target="_blank" rel="noopener noreferrer" title="Follow us on Twitter">
              <span className="social-icon">𝕏</span>
            </a>
            <a href="https://linkedin.com" className="social-link" target="_blank" rel="noopener noreferrer" title="Connect on LinkedIn">
              <span className="social-icon">in</span>
            </a>
            <a href="https://facebook.com" className="social-link" target="_blank" rel="noopener noreferrer" title="Like us on Facebook">
              <span className="social-icon">f</span>
            </a>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default TopBar;