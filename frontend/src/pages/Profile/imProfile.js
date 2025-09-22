// pages/Profile/imProfile.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import IMNav from "../../components/Nav/IMNav/IMNav.js"; // ✅ use IMNav instead of Sidebar
import "./IMProfile.css"; // Create a separate CSS file for styling

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
    category: "",
  });

  const managerId = localStorage.getItem("managerId"); // Logged-in inventory manager ID

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
          category: data.category,
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

  if (loading) return <p>Loading inventory manager profile...</p>;
  if (!manager) return <p>No manager found.</p>;

  return (
    <div className="im-page-container">
      <IMNav />
      <div className="im-profile-content">
        <h1>Inventory Manager Profile</h1>

        {!editing ? (
          <div className="profile-view">
            <p>
              <strong>First Name:</strong> {manager.firstName}
            </p>
            <p>
              <strong>Last Name:</strong> {manager.lastName}
            </p>
            <p>
              <strong>Phone:</strong> {manager.managerPhone}
            </p>
            <p>
              <strong>Email:</strong> {manager.managerEmail}
            </p>
            <p>
              <strong>Password:</strong> {manager.managerPassword}
            </p>
            <p>
              <strong>NIC:</strong> {manager.nic}
            </p>
            <p>
              <strong>Category:</strong> {manager.category}
            </p>

            <button onClick={() => setEditing(true)}>Edit Profile</button>
          </div>
        ) : (
          <form onSubmit={handleUpdate} className="profile-edit-form">
            <label>First Name:</label>
            <input
              type="text"
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              required
            />

            <label>Last Name:</label>
            <input
              type="text"
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              required
            />

            <label>Phone:</label>
            <input
              type="text"
              name="managerPhone"
              value={form.managerPhone}
              onChange={handleChange}
              required
            />

            <label>Email:</label>
            <input
              type="email"
              name="managerEmail"
              value={form.managerEmail}
              onChange={handleChange}
              required
            />

            <label>Password:</label>
            <input
              type="text"
              name="managerPassword"
              value={form.managerPassword}
              onChange={handleChange}
              required
            />

            <label>NIC:</label>
            <input
              type="text"
              name="nic"
              value={form.nic}
              onChange={handleChange}
              required
            />

            <label>Category:</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              required
            >
              <option value="">Select Category</option>
              <option value="Pharmacy">Pharmacy</option>
              <option value="Surgery">Surgery</option>
              <option value="General Supplies">General Supplies</option>
              <option value="Equipment">Equipment</option>
            </select>

            <button type="submit">Save Changes</button>
            <button type="button" onClick={() => setEditing(false)}>
              Cancel
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default IMProfile;
