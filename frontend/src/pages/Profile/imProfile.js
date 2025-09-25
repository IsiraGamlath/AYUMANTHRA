import React, { useEffect, useState } from "react";
import axios from "axios";
import IMNav from "../../components/Nav/IMNav/IMNav.js";

const IMProfile = () => {
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

  const managerId = localStorage.getItem("managerId");

  useEffect(() => {
    const fetchManager = async () => {
      try {
        if (!managerId) {
          alert("No inventory manager is logged in!");
          setLoading(false);
          return;
        }

        const response = await axios.get(
          `http://localhost:5000/inventory-managers/${managerId}`
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
        alert("Failed to fetch inventory manager profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchManager();
  }, [managerId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value,
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(
        `http://localhost:5000/inventory-managers/${managerId}`,
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
    return (
      <p className="text-center mt-10 text-gray-500 animate-pulse">
        Loading inventory manager profile...
      </p>
    );
  if (!manager)
    return (
      <p className="text-center mt-10 text-red-500">No manager found.</p>
    );

  return (
    <div className="min-h-screen flex bg-gray-100">
      <IMNav />

      <div
        className="flex-1 p-6 md:p-12 flex justify-start"
        style={{ marginLeft: "245px" }}
      >
        <div className="w-full max-w-lg">
          {/* Gradient Header */}
          <div className="bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-t-lg shadow-lg p-6 text-center">
            <h1 className="text-2xl font-bold">Inventory Manager Profile</h1>
            <p className="mt-2 opacity-80">Manage your account details</p>
          </div>

          {/* Profile View / Edit */}
          {!editing ? (
            <div className="bg-white shadow-lg rounded-b-lg p-6 space-y-3 transition transform hover:scale-[1.01]">
              <div className="space-y-2">
                <p className="text-gray-700"><strong>First Name:</strong> {manager.firstName}</p>
                <p className="text-gray-700"><strong>Last Name:</strong> {manager.lastName}</p>
                <p className="text-gray-700"><strong>Phone:</strong> {manager.managerPhone}</p>
                <p className="text-gray-700"><strong>Email:</strong> {manager.managerEmail}</p>
                <p className="text-gray-700"><strong>Password:</strong> {manager.managerPassword}</p>
                <p className="text-gray-700"><strong>NIC:</strong> {manager.nic}</p>
              </div>

              <button
                className="mt-4 w-full px-4 py-2 bg-yellow-500 text-white rounded-lg shadow hover:bg-yellow-600 transition"
                onClick={() => setEditing(true)}
              >
                Edit Profile
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleUpdate}
              className="bg-white shadow-lg rounded-b-lg p-6 space-y-4"
            >
              <div>
                <label className="block text-gray-700 font-medium mb-1">First Name:</label>
                <input
                  type="text"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-400 transition"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">Last Name:</label>
                <input
                  type="text"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-400 transition"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">Phone:</label>
                <input
                  type="text"
                  name="managerPhone"
                  value={form.managerPhone}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-400 transition"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">Email:</label>
                <input
                  type="email"
                  name="managerEmail"
                  value={form.managerEmail}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-400 transition"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">Password:</label>
                <input
                  type="text"
                  name="managerPassword"
                  value={form.managerPassword}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-400 transition"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">NIC:</label>
                <input
                  type="text"
                  name="nic"
                  value={form.nic}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-400 transition"
                />
              </div>

              <div className="flex space-x-4 mt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded shadow hover:bg-green-700 transition"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="flex-1 px-4 py-2 bg-gray-400 text-white rounded shadow hover:bg-gray-500 transition"
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

export default IMProfile;
