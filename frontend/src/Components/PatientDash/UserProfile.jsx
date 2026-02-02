import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  User,
  Phone,
  Mail,
  Lock,
  Shield,
  CheckCircle,
  Edit3,
  Save,
  X,
  Home,
  Calendar,
  Bell,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    userName: "",
    userPhone: "",
    userGmail: "",
    userPassword: "",
    UserAgree: false,
    isActive: true,
  });

  const navigate = useNavigate();
  const { isAuthenticated, user: authUser } = useAuth();
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Check if user is authenticated and has valid token
        const token = localStorage.getItem("token");
        if (!isAuthenticated || !token) {
          console.log("User not authenticated, redirecting to login");
          navigate("/loginH");
          return;
        }
        
        if (!userId) {
          console.log("User ID not found, redirecting to login");
          navigate("/loginH");
          return;
        }
        const res = await axios.get(`http://localhost:5000/users/${userId}`);
        const data = res.data.user;
        setUser(data);
        setForm({
          userName: data.userName,
          userPhone: data.userPhone,
          userGmail: data.userGmail,
          userPassword: data.userPassword,
          UserAgree: data.UserAgree,
          isActive: data.isActive,
        });
      } catch (err) {
        console.error("Error fetching user profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [userId, navigate, isAuthenticated]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(
        `http://localhost:5000/users/${userId}`,
        form
      );
      setUser(res.data.user);
      setEditing(false);
      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Error updating user profile:", err);
      alert("Failed to update profile.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50">
        <p className="text-red-500 font-medium">No user found.</p>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
        }
        .shimmer-effect {
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          background-size: 1000px 100%;
          animation: shimmer 3s infinite;
        }
        .leaf-pattern {
          background-image: 
            radial-gradient(circle at 20% 30%, rgba(16, 185, 129, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(13, 148, 136, 0.08) 0%, transparent 50%);
        }
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 leaf-pattern py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Header Section */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-emerald-100 p-8 mb-6 animate-fadeIn">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex items-center space-x-4 mb-4 md:mb-0">
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full opacity-30 blur"></div>
                  <div className="relative w-20 h-20 bg-gradient-to-br from-emerald-600 via-green-600 to-teal-600 rounded-full flex items-center justify-center">
                    <User className="w-10 h-10 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent">
                    {user.userName}
                  </h1>
                  <p className="text-gray-600 mt-1">Welcome to your profile</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => navigate("/display-routines")}
                  className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-300 hover:scale-105"
                >
                  <Home className="w-4 h-4" />
                  <span className="font-medium">My Routines</span>
                </button>
                <button
                  onClick={() => navigate("/myappointments")}
                  className="flex items-center space-x-2 px-5 py-2.5 border-2 border-emerald-600 text-emerald-700 rounded-xl hover:bg-emerald-50 transition-all duration-300"
                >
                  <Calendar className="w-4 h-4" />
                  <span className="font-medium">Appointments</span>
                </button>
                <button
                  onClick={() => navigate("/my-orders")}
                  className="flex items-center space-x-2 px-5 py-2.5 border-2 border-purple-600 text-purple-700 rounded-xl hover:bg-purple-50 transition-all duration-300"
                >
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                  <span className="font-medium">My Orders</span>
                </button>

                <button
                  onClick={() => navigate("/my-notifications")}
                  className="p-2.5 border-2 border-gray-300 text-gray-600 rounded-xl hover:bg-gray-50 transition-all duration-300 relative"
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
                </button>
              </div>
            </div>
          </div>

          {/* Profile Details Section */}
          <div
            className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-emerald-100 p-8 animate-fadeIn"
            style={{ animationDelay: "0.1s" }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Profile Information
              </h2>
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center space-x-2 px-5 py-2.5 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 transition-all duration-300 hover:scale-105"
                >
                  <Edit3 className="w-4 h-4" />
                  <span className="font-medium">Edit Profile</span>
                </button>
              ) : null}
            </div>

            {!editing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-5 rounded-2xl border border-emerald-100">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="p-2 bg-emerald-600 rounded-lg">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                      Full Name
                    </p>
                  </div>
                  <p className="text-lg font-semibold text-gray-900 ml-11">
                    {user.userName}
                  </p>
                </div>

                {/* Phone */}
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-5 rounded-2xl border border-emerald-100">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="p-2 bg-emerald-600 rounded-lg">
                      <Phone className="w-4 h-4 text-white" />
                    </div>
                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                      Phone Number
                    </p>
                  </div>
                  <p className="text-lg font-semibold text-gray-900 ml-11">
                    {user.userPhone}
                  </p>
                </div>

                {/* Email */}
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-5 rounded-2xl border border-emerald-100">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="p-2 bg-emerald-600 rounded-lg">
                      <Mail className="w-4 h-4 text-white" />
                    </div>
                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                      Email Address
                    </p>
                  </div>
                  <p className="text-lg font-semibold text-gray-900 ml-11 break-all">
                    {user.userGmail}
                  </p>
                </div>

                {/* Password */}
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-5 rounded-2xl border border-emerald-100">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="p-2 bg-emerald-600 rounded-lg">
                      <Lock className="w-4 h-4 text-white" />
                    </div>
                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                      Password
                    </p>
                  </div>
                  <p className="text-lg font-semibold text-gray-900 ml-11">
                    ••••••••
                  </p>
                </div>

                {/* Agreement Status */}
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-5 rounded-2xl border border-emerald-100">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="p-2 bg-emerald-600 rounded-lg">
                      <Shield className="w-4 h-4 text-white" />
                    </div>
                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                      Terms Agreement
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 ml-11">
                    {user.UserAgree ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-lg font-semibold text-green-700">
                          Accepted
                        </span>
                      </>
                    ) : (
                      <>
                        <X className="w-5 h-5 text-red-600" />
                        <span className="text-lg font-semibold text-red-700">
                          Not Accepted
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Account Status */}
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-5 rounded-2xl border border-emerald-100">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="p-2 bg-emerald-600 rounded-lg">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                      Account Status
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 ml-11">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                        user.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {user.isActive ? "Active" : "Deactivated"}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleUpdate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name Input */}
                  <div>
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                      <User className="w-4 h-4 text-emerald-600" />
                      <span>Full Name</span>
                    </label>
                    <input
                      name="userName"
                      value={form.userName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
                    />
                  </div>

                  {/* Phone Input */}
                  <div>
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                      <Phone className="w-4 h-4 text-emerald-600" />
                      <span>Phone Number</span>
                    </label>
                    <input
                      name="userPhone"
                      value={form.userPhone}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
                    />
                  </div>

                  {/* Email Input */}
                  <div>
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                      <Mail className="w-4 h-4 text-emerald-600" />
                      <span>Email Address</span>
                    </label>
                    <input
                      name="userGmail"
                      type="email"
                      value={form.userGmail}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
                    />
                  </div>

                  {/* Password Input */}
                  <div>
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                      <Lock className="w-4 h-4 text-emerald-600" />
                      <span>Password</span>
                    </label>
                    <input
                      name="userPassword"
                      type="text"
                      value={form.userPassword}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
                    />
                  </div>
                </div>

                {/* Checkboxes */}
                <div className="flex flex-wrap gap-6 pt-4 border-t border-gray-200">
                  <label className="flex items-center space-x-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      name="UserAgree"
                      checked={form.UserAgree}
                      onChange={handleChange}
                      className="w-5 h-5 text-emerald-600 border-2 border-gray-300 rounded focus:ring-2 focus:ring-emerald-500"
                    />
                    <span className="text-gray-700 font-medium group-hover:text-emerald-600 transition-colors">
                      Accept Terms & Conditions
                    </span>
                  </label>

                  <label className="flex items-center space-x-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={form.isActive}
                      onChange={handleChange}
                      className="w-5 h-5 text-emerald-600 border-2 border-gray-300 rounded focus:ring-2 focus:ring-emerald-500"
                    />
                    <span className="text-gray-700 font-medium group-hover:text-emerald-600 transition-colors">
                      Keep Account Active
                    </span>
                  </label>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4 pt-6">
                  <button
                    type="submit"
                    className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-300 hover:scale-105"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="flex items-center space-x-2 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default UserProfile;
