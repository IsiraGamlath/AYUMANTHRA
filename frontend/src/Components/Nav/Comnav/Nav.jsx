import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { BiHome, BiLogOut, BiUser } from "react-icons/bi";
import { FaUsers } from "react-icons/fa";
import { RiAdminFill } from "react-icons/ri";
import profilePic from "../images/logo.png"; // replace with actual logo/image path
import { useAuth } from '../../../contexts/AuthContext';

const Sidebar = () => {
  const navigate = useNavigate();
   const { logout } = useAuth();

  const handleLogout = () => {
    logout(); 
    alert("You have been logged out.");
    navigate("/LoginH")
  };

  return (
    <div className="fixed left-0 top-0 h-screen w-64 bg-gray-900 text-white flex flex-col justify-between shadow-lg p-5 transition-all">
      <style>
        {
          `/* Nav.css */

/* Sidebar Container */
.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  width: 250px;
  height: 100vh;
  background: #1e272e;
  color: #fff;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  padding: 20px 15px;
  transition: all 0.3s ease-in-out;
}

/* Logo / Title */
.sidebar .logo {
  text-align: center;
  font-size: 22px;
  font-weight: bold;
  color: #27ae60;
  margin-bottom: 30px;
  letter-spacing: 1px;
}

/* Profile Section */
.profile-section {
  text-align: center;
  margin-bottom: 25px;
}

.profile-pic {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #27ae60;
  margin-bottom: 8px;
}

.profile-name {
  font-size: 16px;
  font-weight: 600;
  color: #ecf0f1;
}

/* Navigation Links */
.nav-links {
  list-style: none;
  padding: 0;
  margin: 0;
  flex: 1;
}

.nav-links li {
  margin: 12px 0;
}

.nav-links a,
.logout-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: #dcdde1;
  font-size: 16px;
  padding: 10px 12px;
  border-radius: 8px;
  transition: background 0.3s, color 0.3s;
}

.nav-links a:hover,
.logout-btn:hover {
  background: #27ae60;
  color: #fff;
}

.icon {
  font-size: 18px;
}

/* Logout Button Style */
.logout {
  margin-top: 20px;
}

.logout-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  text-align: left;
  width: 100%;
  font-size: 16px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .sidebar {
    width: 200px;
    padding: 15px 10px;
  }

  .sidebar .logo {
    font-size: 18px;
  }

  .profile-pic {
    width: 60px;
    height: 60px;
  }

  .nav-links a,
  .logout-btn {
    font-size: 14px;
  }
}

          `
        }
        </style>{/* Logo */}
      <h2 className="text-center text-2xl font-bold text-green-500 mb-8 tracking-wide">
       
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
            to="/admin"
            className="flex items-center gap-3 p-2 rounded hover:bg-green-500 hover:text-white transition"
          >
            <BiUser className="text-lg" />
            Doctor Appointment Management
          </Link>
        </li>
      </ul>

    </div>
  );
};

export default Sidebar;
