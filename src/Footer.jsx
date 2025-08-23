import React from 'react';
import './Footer.css';
import numllogo from "./Asset/numllogo.png";

const Footer = () => {
  const quickLinks = [
    { name: "About Us", href: "#" },
    { name: "Campus Life", href: "#" },
    { name: "Research", href: "#" },
    { name: "News & Events", href: "#" },
    { name: "Contact Us", href: "#" },
  ];
  const academics = [
    { name: "Programs", href: "#" },
    { name: "Departments", href: "#" },
    { name: "Faculty", href: "#" },
    { name: "Academic Calendar", href: "#" },
    { name: "Library", href: "#" },
  ];
  const admissions = [
    { name: "Apply Now", href: "#" },
    { name: "Tuition & Aid", href: "#" },
    { name: "Visit Campus", href: "#" },
    { name: "International Students", href: "#" },
    { name: "Transfer Students", href: "#" },
  ];
  const resources = [
    { name: "Student Portal", href: "#" },
    { name: "Career Services", href: "#" },
    { name: "IT Support", href: "#" },
    { name: "Campus Safety", href: "#" },
    { name: "Directory", href: "#" },
  ];
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-grid">
          <div className="footer-logo-section">
            <div className="university-logo">
              <img src={numllogo} alt="NUML Logo" className="Numllogo" />
            </div>
            <p className="university-description">
              Empowering minds, shaping futures, and fostering innovation through excellence in education.
            </p>
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
          <div className="footer-links-section">
            <h3>Quick Links</h3>
            <ul>
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a href={link.href}>{link.name}</a>
                </li>
              ))}
            </ul>
          </div>
          <div className="footer-links-section">
            <h3>Academics</h3>
            <ul>
              {academics.map((link) => (
                <li key={link.name}>
                  <a href={link.href}>{link.name}</a>
                </li>
              ))}
            </ul>
          </div>
          <div className="footer-links-section">
            <h3>Admissions</h3>
            <ul>
              {admissions.map((link) => (
                <li key={link.name}>
                  <a href={link.href}>{link.name}</a>
                </li>
              ))}
            </ul>
          </div>
          <div className="footer-links-section">
            <h3>Resources</h3>
            <ul>
              {resources.map((link) => (
                <li key={link.name}>
                  <a href={link.href}>{link.name}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="contact-section">
          <div className="contact-grid">
            <div className="contact-info">
              <h4>Address</h4>
              <p>5 KM Main Jaranwala Road Near Sadar Police Station<br />City Fasialabad</p>
            </div>
            <div className="contact-info">
              <h4>Contact</h4>
              <p>Phone: 123456789<br />Email: Numl@university.edu</p>
            </div>
            <div className="contact-info">
              <h4>Emergency</h4>
              <p>Campus Police: 12223334445<br />Email: Numl@university.edu</p>
            </div>
          </div>
        </div>
        <div className="copyright-bar">
          <p>&copy; {new Date().getFullYear()} NATIONAL UNIVERSRSITY OF MODERN LANGUAGES. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
export default Footer;