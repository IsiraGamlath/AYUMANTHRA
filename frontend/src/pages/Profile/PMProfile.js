import React, { useEffect, useState } from "react";
import axios from "axios";
import PMNav from "../../components/Nav/IMNav/IMNav.js";
import { FaUserCircle } from "react-icons/fa";

const PMProfile = () => {
  const [manager, setManager] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    managerPhone: "",
    managerEmail: "",
    managerPassword: "",
    nic: "",
  });

  const managerId = localStorage.getItem("pmId");

  useEffect(() => {
    const fetchManager = async () => {
      try {
        if (!managerId) {
          alert("No project manager is logged in!");
          setLoading(false);
          return;
        }

        const response = await axios.get(
          `http://localhost:5000/project-managers/${managerId}`
        );
        const data = response.data.manager;

        setManager(data);
        setForm({
          firstName: data.firstName,
          lastName: data.lastName,
          managerPhone: data.managerPhone,
          managerEmail: data.managerEmail,
          managerPassword: data.managerPassword,
          nic: data.nic,
        });
      } catch (err) {
        console.error("Error fetching manager profile:", err);
        alert("Failed to fetch project manager profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchManager();
  }, [managerId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(
        `http://localhost:5000/project-managers/${managerId}`,
        form
      );
      setManager(res.data.manager);
      setEditing(false);
      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Error updating manager profile:", err);
      alert("Failed to update profile.");
    }
  };

  if (loading)
    return <p className="text-center mt-10 text-gray-500 animate-pulse">Loading profile...</p>;
  if (!manager)
    return <p className="text-center mt-10 text-red-500">No manager found.</p>;

  return (
    <div className="min-h-screen flex bg-gray-100">
      <PMNav />

      <div className="flex-1 p-6 md:p-12 flex justify-center">
        {/* Creative Card */}
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl p-10 transition-transform hover:scale-[1.02] grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Left Side: Avatar + Name + Category */}
          <div className="flex flex-col items-center justify-start gap-6">
            <FaUserCircle className="text-gray-400 text-9xl" />
            <h1 className="text-4xl font-bold text-gray-800">
              {manager.firstName} {manager.lastName}
            </h1>
            <span className="inline-block mt-2 px-4 py-1 bg-blue-100 text-blue-700 font-medium rounded-full">
              {manager.category || "N/A"}
            </span>
            <button
              onClick={() => setEditing(!editing)}
              className="px-6 py-2 bg-yellow-500 text-white font-semibold rounded-lg shadow hover:bg-yellow-600 transition mt-4"
            >
              {editing ? "Cancel Edit" : "Edit Profile"}
            </button>
          </div>

          {/* Right Side: Profile Details */}
          {!editing ? (
            <div className="flex flex-col justify-center gap-4 text-gray-700 text-lg">
              <p><strong>Phone:</strong> {manager.managerPhone}</p>
              <p><strong>Email:</strong> {manager.managerEmail}</p>
              <p><strong>Password:</strong> {manager.managerPassword}</p>
              <p><strong>NIC:</strong> {manager.nic}</p>
            </div>
          ) : (
            <form onSubmit={handleUpdate} className="flex flex-col justify-center gap-4">
              <input
                type="text"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                placeholder="First Name"
                className="w-full border px-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
              <input
                type="text"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                placeholder="Last Name"
                className="w-full border px-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
              <input
                type="text"
                name="managerPhone"
                value={form.managerPhone}
                onChange={handleChange}
                placeholder="Phone"
                className="w-full border px-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
              <input
                type="email"
                name="managerEmail"
                value={form.managerEmail}
                onChange={handleChange}
                placeholder="Email"
                className="w-full border px-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
              <input
                type="text"
                name="managerPassword"
                value={form.managerPassword}
                onChange={handleChange}
                placeholder="Password"
                className="w-full border px-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
              <input
                type="text"
                name="nic"
                value={form.nic}
                onChange={handleChange}
                placeholder="NIC"
                className="w-full border px-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
              

              <div className="flex gap-4 mt-4">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-green-600 text-white rounded-2xl shadow hover:bg-green-700 transition font-semibold"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="flex-1 py-3 bg-gray-400 text-white rounded-2xl shadow hover:bg-gray-500 transition font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default PMProfile;
