import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button 
        className={`mobile-menu-btn ${isMenuOpen ? 'active' : ''}`}
        onClick={toggleMenu}
        aria-label="Toggle navigation menu"
      >
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
      </button>

      {/* Sidebar */}
      <nav className={`sidebar ${isMenuOpen ? 'active' : ''}`}>
        <div className="sidebar-container">
          {/* Logo/Brand */}
          <div className="sidebar-brand">
            <Link to="/" className="brand-link" onClick={closeMenu}>
              <div className="brand-logo">
                <span className="brand-icon">🏥</span>
                <span className="brand-text">AYUMANTHRA</span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="sidebar-nav">
            {/* Patient Section */}
            <div className="nav-section">
              <span className="nav-section-title">Patient Portal</span>
              <div className="nav-links">
                <Link 
                  to="/" 
                  className={`nav-link ${isActive('/') ? 'active' : ''}`}
                  onClick={closeMenu}
                >
                  <span className="nav-icon">📅</span>
                  <span className="nav-text">Check Availability</span>
                </Link>
                <Link 
                  to="/book" 
                  className={`nav-link ${isActive('/book') ? 'active' : ''}`}
                  onClick={closeMenu}
                >
                  <span className="nav-icon">📝</span>
                  <span className="nav-text">Book Appointment</span>
                </Link>
                <Link 
                  to="/myappointments" 
                  className={`nav-link ${isActive('/myappointments') ? 'active' : ''}`}
                  onClick={closeMenu}
                >
                  <span className="nav-icon">📋</span>
                  <span className="nav-text">My Appointments</span>
                </Link>
                <Link 
                  to="/my-notifications" 
                  className={`nav-link ${isActive('/my-notifications') ? 'active' : ''}`}
                  onClick={closeMenu}
                >
                  <span className="nav-icon">🔔</span>
                  <span className="nav-text">Notifications</span>
                </Link>
                <Link 
                  to="/payment" 
                  className={`nav-link ${isActive('/payment') ? 'active' : ''}`}
                  onClick={closeMenu}
                >
                  <span className="nav-icon">💳</span>
                  <span className="nav-text">Payment</span>
                </Link>
              </div>
            </div>

            {/* Doctor Section */}
            <div className="nav-section">
              <span className="nav-section-title">Doctor Portal</span>
              <div className="nav-links">
                <Link 
                  to="/doctor-appointments" 
                  className={`nav-link ${isActive('/doctor-appointments') ? 'active' : ''}`}
                  onClick={closeMenu}
                >
                  <span className="nav-icon">🩺</span>
                  <span className="nav-text">Doctor Dashboard</span>
                </Link>
                <Link 
                  to="/doctor-notifications" 
                  className={`nav-link ${isActive('/doctor-notifications') ? 'active' : ''}`}
                  onClick={closeMenu}
                >
                  <span className="nav-icon">🔔</span>
                  <span className="nav-text">Doctor Notifications</span>
                </Link>
              </div>
            </div>

            {/* Admin Section */}
            <div className="nav-section">
              <span className="nav-section-title">Admin Portal</span>
              <div className="nav-links">
                <Link 
                  to="/admin" 
                  className={`nav-link ${isActive('/admin') ? 'active' : ''}`}
                  onClick={closeMenu}
                >
                  <span className="nav-icon">⚙️</span>
                  <span className="nav-text">Admin Dashboard</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Overlay for mobile menu */}
      <div 
        className={`sidebar-overlay ${isMenuOpen ? 'active' : ''}`}
        onClick={closeMenu}
      ></div>
    </>
  );
};

export default Navbar;