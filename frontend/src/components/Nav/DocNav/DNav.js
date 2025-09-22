import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { BiHome, BiLogOut } from "react-icons/bi";
import { FaUsers } from "react-icons/fa";
import profilePic from "../images/logo.png"; // replace with your actual logo/image path
import "./DNav.css"; // make sure this CSS file exists

const Sidebar = () => {
  const navigate = useNavigate();
  const doctorId = localStorage.getItem("doctorId");
  const doctorName = localStorage.getItem("doctorName");

  // ✅ Logout function
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("doctorId");
    localStorage.removeItem("doctorName");
    alert("You have been logged out.");
    navigate("/LoginH");
  };

  return (
    <div className="sidebar">
      {/* Logo */}
      <h2 className="logo">Ayu Mantra</h2>

      {/* Profile Section */}
      <div className="profile-section">
        <img src={profilePic} alt="Profile" className="profile-pic" />
        <p className="profile-name">{doctorName || "Admin"}</p>
      </div>

      {/* Navigation Links */}
      <ul className="nav-links">
        <li>
          <Link to="/AmainHome" className="nav-link">
            <BiHome className="icon" /> Home
          </Link>
        </li>

        {/* Doctor Profile link only if logged in */}
        {doctorId && (
          <li>
            <Link to={`/doctorprofile/${doctorId}`} className="nav-link">
              <FaUsers className="icon" /> Doctor Profile
            </Link>
          </li>
        )}

        {/* Logout Button */}
        <li>
          <button onClick={handleLogout} className="logout-btn">
            <BiLogOut className="icon" /> Log Out
          </button>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
