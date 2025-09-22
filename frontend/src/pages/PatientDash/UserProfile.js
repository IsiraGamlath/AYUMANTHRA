import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaBell } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./UserProfile.css";

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
    navigate("/LoginH"); // navigate to Login page
  };

  if (loading) return <p>Loading user profile...</p>;
  if (!user) return <p>No user found.</p>;

  return (
    <div className="user-page-container">
      <div className="user-profile-content">
        <div className="profile-header">
          <div>
            <h1>Welcome to</h1>
            <h2>{user.userName}</h2>
          </div>
          <div className="header-actions">
            <button className="home-btn" onClick={() => navigate("/userHome")}>
              Home
            </button>
            <button
              className="appointments-btn"
              onClick={() => navigate("/user/appointments")}
            >
              My Appointments
            </button>
            <FaBell className="notification-bell" title="Notifications" />
          </div>
        </div>

        {!editing ? (
          <div className="profile-view">
            <p><strong>Name:</strong> {user.userName}</p>
            <p><strong>Phone:</strong> {user.userPhone}</p>
            <p><strong>Email:</strong> {user.userGmail}</p>
            <p><strong>Password:</strong> {user.userPassword}</p>
            <p><strong>Agreement:</strong> {user.UserAgree ? "Accepted" : "Not Accepted"}</p>
            <p><strong>Status:</strong> {user.isActive ? "Active" : "Deactivated"}</p>

            <div className="profile-buttons">
              <button className="edit-btn" onClick={() => setEditing(true)}>
                Edit Profile
              </button>
              <button className="logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleUpdate} className="profile-edit-form">
            <label>Name:</label>
            <input name="userName" value={form.userName} onChange={handleChange} required />

            <label>Phone:</label>
            <input name="userPhone" value={form.userPhone} onChange={handleChange} required />

            <label>Email:</label>
            <input name="userGmail" type="email" value={form.userGmail} onChange={handleChange} required />

            <label>Password:</label>
            <input name="userPassword" type="text" value={form.userPassword} onChange={handleChange} required />

            <label>
              Accept Terms:
              <input type="checkbox" name="UserAgree" checked={form.UserAgree} onChange={handleChange} />
            </label>

            <label>
              Active:
              <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} />
            </label>

            <button type="submit">Save Changes</button>
            <button type="button" onClick={() => setEditing(false)}>Cancel</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
