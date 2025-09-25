import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { BiHome, BiLogOut } from "react-icons/bi";
import { FaUsers } from "react-icons/fa";
import profilePic from "../images/logo.png"; // replace with your actual logo/image path

const Sidebar = () => {
  const navigate = useNavigate();
  const doctorId = localStorage.getItem("doctorId");
  const doctorName = localStorage.getItem("doctorName");

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("doctorId");
    localStorage.removeItem("doctorName");
    alert("You have been logged out.");
    navigate("/LoginH");
  };

  return (
    <div className="fixed left-0 top-0 h-screen w-64 bg-gray-900 text-white flex flex-col justify-between shadow-lg p-5 transition-all">
      {/* Logo */}
      <h2 className="text-center text-2xl font-bold text-green-500 mb-8 tracking-wide">
        Ayu Mantra
      </h2>

      {/* Profile Section */}
      <div className="text-center mb-8">
        <img
          src={profilePic}
          alt="Profile"
          className="w-16 h-16 rounded-full object-cover border-2 border-green-500 mx-auto mb-2"
        />
        <p className="font-semibold text-gray-200">{doctorName || "Doctor"}</p>
      </div>

      {/* Navigation Links */}
      <ul className="flex-1">
        <li className="mb-4">
          <Link
            to="/AmainHome"
            className="flex items-center gap-3 p-2 rounded hover:bg-green-500 hover:text-white transition"
          >
            <BiHome className="text-lg" />
            Home
          </Link>
        </li>

        {doctorId && (
          <li className="mb-4">
            <Link
              to={`/doctorprofile/${doctorId}`}
              className="flex items-center gap-3 p-2 rounded hover:bg-green-500 hover:text-white transition"
            >
              <FaUsers className="text-lg" />
              Doctor Profile
            </Link>
          </li>
        )}
      </ul>

      {/* Logout Button */}
      <div className="mt-4">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full p-2 rounded hover:bg-red-500 hover:text-white transition text-left"
        >
          <BiLogOut className="text-lg" />
          Log Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
