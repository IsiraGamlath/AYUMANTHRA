import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AdminProfile.css";

const AdminProfile = () => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    nic: "",
    adminPhone: "",
    adminEmail: "",
  });

  // Fetch admin profile (use actual logged-in admin ID here)
  const adminId = "68b3cdade4f6ffc24a40a9e8"; // 👉 replace with real admin id (or from auth)

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/admins/${adminId}`);
        setAdmin(res.data.admin);
        setForm({
          firstName: res.data.admin.firstName,
          lastName: res.data.admin.lastName,
          nic: res.data.admin.nic,
          adminPhone: res.data.admin.adminPhone,
          adminEmail: res.data.admin.adminEmail,
        });
      } catch (err) {
        console.error(err);
        alert("Failed to fetch admin profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchAdmin();
  }, [adminId]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`http://localhost:5000/admins/${adminId}`, form);
      setAdmin(res.data.admin);
      setEditing(false);
      alert("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to update profile.");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="admin-profile">
      <h2>Admin Profile</h2>

      {!editing ? (
        <div className="profile-view">
          <p><strong>First Name:</strong> {admin.firstName}</p>
          <p><strong>Last Name:</strong> {admin.lastName}</p>
          <p><strong>NIC:</strong> {admin.nic}</p>
          <p><strong>Phone:</strong> {admin.adminPhone}</p>
          <p><strong>Email:</strong> {admin.adminEmail}</p>

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

          <label>NIC:</label>
          <input
            type="text"
            name="nic"
            value={form.nic}
            onChange={handleChange}
            required
          />

          <label>Phone:</label>
          <input
            type="text"
            name="adminPhone"
            value={form.adminPhone}
            onChange={handleChange}
            required
          />

          <label>Email:</label>
          <input
            type="email"
            name="adminEmail"
            value={form.adminEmail}
            onChange={handleChange}
            required
          />

          <button type="submit">Save Changes</button>
          <button type="button" onClick={() => setEditing(false)}>
            Cancel
          </button>
        </form>
      )}
    </div>
  );
};

export default AdminProfile;
