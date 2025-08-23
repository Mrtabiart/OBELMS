import React, { useState } from 'react';
import './Navbar.css';
import numllogo from "./Asset/numllogo.png";
import { Outlet, Link } from "react-router-dom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
        <>
      <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <img src={numllogo} alt="NUML Logo" className="Numllogo" />
        </div>

        <div className="menu-icon" onClick={toggleMenu}>
          {isOpen ? '✕' : '☰'}
        </div>

        <ul className={`nav-menu ${isOpen ? 'active' : ''}`}>
          <li className="nav-item">
            <a href="#home" className="nav-link">Home</a>
          </li>
          <li className="nav-item">
            <a href="#id" className="nav-link">Faculty</a>
          </li>
          <li className="nav-item">
            <a href="#faculty" className="nav-link">Aboutus</a>
          </li>
          <li className="nav-item">
            <a href="#about" className="nav-link">Help</a>
          </li>
          <li className="nav-item">
            <a href="#contact" className="nav-link">Contact</a>
          </li>
        </ul>

        <div className={`auth-buttons ${isOpen ? 'active' : ''}`}>
        <Link to="/Signin" className="button-link">
        <button className="signin-btn">Contact US</button>
            </Link>
        </div>
      </div>
    </nav>
    <Outlet />
        </>
  );
};

export default Navbar;
