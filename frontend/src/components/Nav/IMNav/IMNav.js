import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { BiHome, BiLogOut } from "react-icons/bi";
import { FaUserTie } from "react-icons/fa"; // icon for profile
import profilePic from "../images/logo.png"; // replace with actual logo/image path
import "./IMNav.css"; // new CSS file for inventory manager nav

const IMNav = () => {
  const navigate = useNavigate();
  const managerId = localStorage.getItem("managerId");
  const managerName = localStorage.getItem("managerName");

  const handleLogout = () => {
    localStorage.removeItem("managerId");
    localStorage.removeItem("managerName");
    alert("You have been logged out.");
    navigate("/loginH"); // redirect to login
  };

  return (
    <div className="im-sidebar">
      {/* Logo */}
      <h2 className="im-logo">Ayu Mantra</h2>

      {/* Profile Section */}
      <div className="im-profile-section">
        <img src={profilePic} alt="Profile" className="im-profile-pic" />
        <p className="im-profile-name">{managerName || "Manager"}</p>
      </div>

      {/* Navigation Links */}
      <ul className="im-nav-links">
        <li>
          <Link to="/imHome" className="im-nav-link">
            <BiHome className="icon" /> Home
          </Link>
        </li>

        {managerId && (
          <li>
            <Link to={`/imProfile/${managerId}`} className="im-nav-link">
              <FaUserTie className="icon" /> Profile
            </Link>
          </li>
        )}

        <li>
          <button onClick={handleLogout} className="im-logout-btn">
            <BiLogOut className="icon" /> Logout
          </button>
        </li>
      </ul>
    </div>
  );
};

export default IMNav;
