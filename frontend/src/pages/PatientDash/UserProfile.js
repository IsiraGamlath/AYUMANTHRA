import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaBell } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

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
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (!userId) {
          alert("No user is logged in!");
          navigate("/login");
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
  }, [userId, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`http://localhost:5000/users/${userId}`, form);
      setUser(res.data.user);
      setEditing(false);
      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Error updating user profile:", err);
      alert("Failed to update profile.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("authToken");
    alert("You have been logged out.");
    navigate("/LoginH");
  };

  if (loading)
    return (
      <p className="text-center mt-10 text-gray-500">
        Loading user profile...
      </p>
    );
  if (!user)
    return (
      <p className="text-center mt-10 text-red-500">No user found.</p>
    );

  return (
    <div className="min-h-screen flex justify-center items-start bg-gray-100 py-10">
      {/* Profile Card */}
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-2xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-700">Hello, {user.userName}</h1>
            <p className="text-gray-500">Welcome to your profile</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              className="px-4 py-2 bg-green-600 text-white rounded shadow hover:bg-green-700 transition"
              onClick={() => navigate("/userHome")}
            >
              Home
            </button>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition"
              onClick={() => navigate("/user/appointments")}
            >
              Appointments
            </button>
            <FaBell className="text-gray-600 text-2xl" title="Notifications" />
          </div>
        </div>

        {/* Profile Details */}
        {!editing ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-lg shadow">
            <div>
              <p className="text-gray-700 font-semibold">Name</p>
              <p className="text-gray-900">{user.userName}</p>
            </div>
            <div>
              <p className="text-gray-700 font-semibold">Phone</p>
              <p className="text-gray-900">{user.userPhone}</p>
            </div>
            <div>
              <p className="text-gray-700 font-semibold">Email</p>
              <p className="text-gray-900">{user.userGmail}</p>
            </div>
            <div>
              <p className="text-gray-700 font-semibold">Password</p>
              <p className="text-gray-900">{user.userPassword}</p>
            </div>
            <div>
              <p className="text-gray-700 font-semibold">Agreement</p>
              <p className="text-gray-900">{user.UserAgree ? "Accepted" : "Not Accepted"}</p>
            </div>
            <div>
              <p className="text-gray-700 font-semibold">Status</p>
              <p className="text-gray-900">{user.isActive ? "Active" : "Deactivated"}</p>
            </div>

            <div className="col-span-full flex space-x-4 mt-4">
              <button
                className="px-4 py-2 bg-yellow-500 text-white rounded shadow hover:bg-yellow-600 transition"
                onClick={() => setEditing(true)}
              >
                Edit Profile
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded shadow hover:bg-red-600 transition"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-lg shadow">
            <div>
              <label className="block text-gray-700 font-medium mb-1">Name</label>
              <input
                name="userName"
                value={form.userName}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Phone</label>
              <input
                name="userPhone"
                value={form.userPhone}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Email</label>
              <input
                name="userGmail"
                type="email"
                value={form.userGmail}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Password</label>
              <input
                name="userPassword"
                type="text"
                value={form.userPassword}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="UserAgree"
                  checked={form.UserAgree}
                  onChange={handleChange}
                  className="form-checkbox h-5 w-5 text-green-600"
                />
                <span className="text-gray-700">Accept Terms</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={form.isActive}
                  onChange={handleChange}
                  className="form-checkbox h-5 w-5 text-green-600"
                />
                <span className="text-gray-700">Active</span>
              </label>
            </div>

            <div className="col-span-full flex space-x-4 mt-4">
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded shadow hover:bg-green-700 transition"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="px-4 py-2 bg-gray-400 text-white rounded shadow hover:bg-gray-500 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
