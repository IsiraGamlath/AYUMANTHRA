import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { BiHome, BiLogOut } from "react-icons/bi";
import { FaUserTie } from "react-icons/fa";
import profilePic from "../images/logo.png"; // replace with actual path

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
    <div className="w-64 min-h-screen bg-green-600 text-white flex flex-col">
      {/* Logo */}
      <div className="text-center py-6 border-b border-green-500">
        <h2 className="text-2xl font-bold tracking-wide">Ayu Mantra</h2>
      </div>

      {/* Profile Section */}
      <div className="flex flex-col items-center py-6 border-b border-green-500">
        <img
          src={profilePic}
          alt="Profile"
          className="w-20 h-20 rounded-full border-2 border-white mb-2"
        />
        <p className="text-lg font-semibold">{managerName || "Manager"}</p>
      </div>

      {/* Navigation Links */}
      <ul className="flex-1 px-4 py-6 space-y-3">
        <li>
          <Link
            to="/imHome"
            className="flex items-center gap-3 px-3 py-2 rounded hover:bg-green-500 transition"
          >
            <BiHome className="text-xl" />
            Home
          </Link>
        </li>

        {managerId && (
          <li>
            <Link
              to={`/imProfile/${managerId}`}
              className="flex items-center gap-3 px-3 py-2 rounded hover:bg-green-500 transition"
            >
              <FaUserTie className="text-xl" />
              Profile
            </Link>
          </li>
        )}

        {/* Logout Button */}
        <li>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2 bg-red-500 rounded hover:bg-red-600 transition"
          >
            <BiLogOut className="text-xl" />
            Logout
          </button>
        </li>
      </ul>
    </div>
  );
};

export default IMNav;
