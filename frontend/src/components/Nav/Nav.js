import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Nav.css";
import { BiHome, BiLogOut, BiUser } from "react-icons/bi";
import { FaUsers } from "react-icons/fa";
import { RiAdminFill } from "react-icons/ri";
import profilePic from "./images/logo.png";

const Sidebar = ({ onProfileClick }) => {
  const navigate = useNavigate();

  // ✅ Logout handler
  const handleLogout = () => {
    // Remove token if you stored it in localStorage
    localStorage.removeItem("authToken");
    alert("You have been logged out.");
    navigate("/LoginH"); // ✅ Go back to login page
  };

  return (
    <div className="sidebar">
      <h2 className="logo">Ayu Mantra</h2>

      {/* Profile Section */}
      <div className="profile-section">
        <img src={profilePic} alt="Profile" className="profile-pic" />
        <p className="profile-name">Admin</p>
      </div>

      <ul className="nav-links">
        <li>
          <Link to="/AmainHome">
            <BiHome className="icon" />
            Home
          </Link>
        </li>
        <li>
          <Link to="/adminHome">
            <RiAdminFill className="icon" />
            Admin Dashboard
          </Link>
        </li>
        <li>
          <Link to="/doctorHome">
            <FaUsers className="icon" />
            Doctor Management
          </Link>
        </li>
        <li>
          <Link to="/UserHome">
            <BiUser className="icon" />
            User Management
          </Link>
        </li>

        {/* ✅ Logout with onClick */}
        <li className="logout">
          <button onClick={handleLogout} className="logout-btn">
            <BiLogOut className="icon" />
            Log Out
          </button>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
