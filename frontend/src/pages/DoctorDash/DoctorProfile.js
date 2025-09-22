import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../../components/Nav/DocNav/DNav";
import { FaBell } from "react-icons/fa"; // ✅ Font Awesome bell icon
import "./DoctorProfile.css";
import { useNavigate } from "react-router-dom"; // ✅ Navigation hook

const DoctorProfile = () => {
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    doctorName: "",
    doctorPhone: "",
    doctorEmail: "",
    doctorPassword: "",
    specialization: "",
    experienceYears: 0,
    available: true,
  });

  const navigate = useNavigate(); // ✅ to navigate to appointments page
  const doctorId = localStorage.getItem("doctorId");

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        if (!doctorId) {
          alert("No doctor is logged in!");
          setLoading(false);
          return;
        }

        const response = await axios.get(`http://localhost:5000/doctors/${doctorId}`);
        const data = response.data.doctor;

        setDoctor(data);
        setForm({
          doctorName: data.doctorName,
          doctorPhone: data.doctorPhone,
          doctorEmail: data.doctorEmail,
          doctorPassword: data.doctorPassword,
          specialization: data.specialization,
          experienceYears: data.experienceYears,
          available: data.available,
        });
      } catch (err) {
        console.error("Error fetching doctor profile:", err);
        alert("Failed to fetch doctor profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchDoctor();
  }, [doctorId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`http://localhost:5000/doctors/${doctorId}`, form);
      setDoctor(res.data.doctor);
      setEditing(false);
      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Error updating doctor profile:", err);
      alert("Failed to update profile.");
    }
  };

  if (loading) return <p>Loading doctor profile...</p>;
  if (!doctor) return <p>No doctor found.</p>;

  return (
    <div className="doctor-page-container">
      <Sidebar />
      <div className="doctor-profile-content">
        <div className="profile-header">
          <h1>Doctor Profile</h1>

          <div className="header-actions">
            {/* ✅ My Appointments button */}
            <button
              className="appointments-btn"
              onClick={() => navigate("/doctor/appointments")}
            >
              My Appointments
            </button>

            <FaBell className="notification-bell" title="Notifications" />
          </div>
        </div>

        {!editing ? (
          <div className="profile-view">
            <p><strong>Name:</strong> {doctor.doctorName}</p>
            <p><strong>Phone:</strong> {doctor.doctorPhone}</p>
            <p><strong>Email:</strong> {doctor.doctorEmail}</p>
            <p><strong>Password:</strong> {doctor.doctorPassword}</p>
            <p><strong>Specialization:</strong> {doctor.specialization}</p>
            <p><strong>Experience:</strong> {doctor.experienceYears} {doctor.experienceYears > 1 ? "years" : "year"}</p>
            <p><strong>Available:</strong> {doctor.available ? "Yes" : "No"}</p>

            <button onClick={() => setEditing(true)}>Edit Profile</button>
          </div>
        ) : (
          <form onSubmit={handleUpdate} className="profile-edit-form">
            <label>Name:</label>
            <input type="text" name="doctorName" value={form.doctorName} onChange={handleChange} required />

            <label>Phone:</label>
            <input type="text" name="doctorPhone" value={form.doctorPhone} onChange={handleChange} required />

            <label>Email:</label>
            <input type="email" name="doctorEmail" value={form.doctorEmail} onChange={handleChange} required />

            <label>Password:</label>
            <input type="text" name="doctorPassword" value={form.doctorPassword} onChange={handleChange} required />

            <label>Specialization:</label>
            <input type="text" name="specialization" value={form.specialization} onChange={handleChange} required />

            <label>Experience (years):</label>
            <input type="number" name="experienceYears" value={form.experienceYears} onChange={handleChange} required min="0" />

            <label>
              Available:
              <input type="checkbox" name="available" checked={form.available} onChange={handleChange} />
            </label>

            <button type="submit">Save Changes</button>
            <button type="button" onClick={() => setEditing(false)}>Cancel</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default DoctorProfile;
