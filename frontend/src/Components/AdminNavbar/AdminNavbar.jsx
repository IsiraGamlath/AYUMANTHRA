import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { BiLogOut, BiUser } from "react-icons/bi";
import { FaUsers, FaUserMd } from "react-icons/fa";
import { RiAdminFill, RiDashboardFill } from "react-icons/ri";
import { useAuth } from '../../contexts/AuthContext';
import './AdminNavbar.css';

const AdminNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout(); 
    alert("You have been logged out.");
    navigate("/LoginH");
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="admin-navbar">
      {/* Admin Profile Section */}
      <div className="admin-profile-section">
        <div className="admin-profile-icon"></div>
        <p className="admin-profile-name">Admin</p>
      </div>

      {/* Navigation Links */}
      <nav className="admin-nav-links">
        <ul>
          <li className="admin-nav-item">
            <Link
              to="/adminHome"
              className={`admin-nav-link ${isActive('/adminHome') ? 'active' : ''}`}
            >
              <RiDashboardFill className="admin-nav-icon" />
              <span>Admin Dashboard</span>
            </Link>
          </li>
          
          <li className="admin-nav-item">
            <Link
              to="/doctorHome"
              className={`admin-nav-link ${isActive('/doctorHome') ? 'active' : ''}`}
            >
              <FaUsers className="admin-nav-icon" />
              <span>Doctor Management</span>
            </Link>
          </li>
          
          <li className="admin-nav-item">
            <Link
              to="/UserHome"
              className={`admin-nav-link ${isActive('/UserHome') ? 'active' : ''}`}
            >
              <BiUser className="admin-nav-icon" />
              <span>User Management</span>
            </Link>
          </li>
          
          <li className="admin-nav-item">
            <Link
              to="/supplierHome"
              className={`admin-nav-link ${isActive('/supplierHome') ? 'active' : ''}`}
            >
              <BiUser className="admin-nav-icon" />
              <span>Supplier Management</span>
            </Link>
          </li>
          
          <li className="admin-nav-item">
            <Link
              to="/admin"
              className={`admin-nav-link ${isActive('/admin') ? 'active' : ''}`}
            >
              <FaUserMd className="admin-nav-icon" />
              <span>Doctor Appointment Management</span>
            </Link>
          </li>
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="admin-logout-section">
        <button
          onClick={handleLogout}
          className="admin-logout-btn"
        >
          <BiLogOut className="admin-nav-icon" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default AdminNavbar;
