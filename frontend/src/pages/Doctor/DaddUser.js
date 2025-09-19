import React, { useState } from "react";
import axios from "axios";
import "./DaddUser.css";

const DaddUser = ({ onClose, onDoctorAdded }) => {
  const [inputs, setInputs] = useState({
    doctorName: "",
    doctorPhone: "",
    doctorEmail: "",
    doctorPassword: "",
    specialization: "",
    experienceYears: "",
    available: true,
  });

  const handleChange = (e) => {
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCheckbox = () => {
    setInputs((prev) => ({ ...prev, available: !prev.available }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post("http://localhost:5000/doctors", {
        doctorName: String(inputs.doctorName),
        doctorPhone: String(inputs.doctorPhone),
        doctorEmail: String(inputs.doctorEmail),
        doctorPassword: String(inputs.doctorPassword),
        specialization: String(inputs.specialization),
        experienceYears: Number(inputs.experienceYears),
        available: Boolean(inputs.available),
      });

      // ✅ Reset fields after success
      setInputs({
        doctorName: "",
        doctorPhone: "",
        doctorEmail: "",
        doctorPassword: "",
        specialization: "",
        experienceYears: "",
        available: true,
      });

      onDoctorAdded(); // refresh doctor list
      onClose(); // close popup
    } catch (err) {
      console.error(err);

      if (err.response && err.response.status === 400) {
        alert(err.response.data.message); // ✅ Show duplicate error from backend
      } else {
        alert("Failed to add doctor. Please try again.");
      }
    }
  };

  return (
    <div className="popup-overlay">
      <div className="popup">
        <h3>Add Doctor</h3>
        <form onSubmit={handleSubmit}>
          <label>Name:</label>
          <input
            type="text"
            name="doctorName"
            value={inputs.doctorName}
            onChange={handleChange}
            required
          />

          <label>Phone:</label>
          <input
            type="text"
            name="doctorPhone"
            value={inputs.doctorPhone}
            onChange={handleChange}
            required
          />

          <label>Email:</label>
          <input
            type="email"
            name="doctorEmail"
            value={inputs.doctorEmail}
            onChange={handleChange}
            required
          />

          <label>Password:</label>
          <input
            type="password"
            name="doctorPassword"
            value={inputs.doctorPassword}
            onChange={handleChange}
            required
          />

          <label>Specialization:</label>
          <input
            type="text"
            name="specialization"
            value={inputs.specialization}
            onChange={handleChange}
            required
          />

          <label>Experience (Years):</label>
          <input
            type="number"
            name="experienceYears"
            value={inputs.experienceYears}
            onChange={handleChange}
            required
          />

          <label>Available:</label>
          <input
            type="checkbox"
            name="available"
            checked={inputs.available}
            onChange={handleCheckbox}
          />
          <br />
          <br />

          <button type="submit">Register Doctor</button>
          <button
            type="button"
            onClick={onClose}
            style={{ marginLeft: "10px" }}
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

export default DaddUser;
