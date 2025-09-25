import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { BiHome, BiLogOut, BiUser } from "react-icons/bi";
import { FaUsers } from "react-icons/fa";
import { RiAdminFill } from "react-icons/ri";
import profilePic from "../images/logo.png"; // replace with actual logo/image path

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("authToken");
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
        <p className="font-semibold text-gray-200">Admin</p>
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
        <li className="mb-4">
          <Link
            to="/adminHome"
            className="flex items-center gap-3 p-2 rounded hover:bg-green-500 hover:text-white transition"
          >
            <RiAdminFill className="text-lg" />
            Admin Dashboard
          </Link>
        </li>
        <li className="mb-4">
          <Link
            to="/doctorHome"
            className="flex items-center gap-3 p-2 rounded hover:bg-green-500 hover:text-white transition"
          >
            <FaUsers className="text-lg" />
            Doctor Management
          </Link>
        </li>
        <li className="mb-4">
          <Link
            to="/UserHome"
            className="flex items-center gap-3 p-2 rounded hover:bg-green-500 hover:text-white transition"
          >
            <BiUser className="text-lg" />
            User Management
          </Link>
        </li>
        <li className="mb-4">
          <Link
            to="/supplierHome"
            className="flex items-center gap-3 p-2 rounded hover:bg-green-500 hover:text-white transition"
          >
            <BiUser className="text-lg" />
            Supplier Management
          </Link>
        </li>
        <li className="mb-4">
          <Link
            to="/appointments"
            className="flex items-center gap-3 p-2 rounded hover:bg-green-500 hover:text-white transition"
          >
            <BiUser className="text-lg" />
            Appointments
          </Link>
        </li>
        <li className="mb-4">
          <Link
            to="/doctorAvailability"
            className="flex items-center gap-3 p-2 rounded hover:bg-green-500 hover:text-white transition"
          >
            <BiUser className="text-lg" />
            Doctor Availability
          </Link>
        </li>
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
