import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DaddUser.css'; // reuse the popup CSS

const DupdateUser = ({ doctor, onClose, onDoctorUpdated }) => {
  const [inputs, setInputs] = useState({});

  useEffect(() => {
    setInputs(doctor); // initialize form with doctor data
  }, [doctor]);

  const handleChange = (e) => {
    setInputs(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCheckbox = () => {
    setInputs(prev => ({ ...prev, available: !prev.available }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/doctors/${doctor._id}`, {
        doctorName: String(inputs.doctorName),
        doctorPhone: String(inputs.doctorPhone),
        doctorEmail: String(inputs.doctorEmail),
        doctorPassword: String(inputs.doctorPassword),
        specialization: String(inputs.specialization),
        experienceYears: Number(inputs.experienceYears),
        available: Boolean(inputs.available),
      });
      onDoctorUpdated(); // refresh doctor list & show success
      onClose(); // close popup
    } catch (err) {
      console.error(err);
      alert('Failed to update doctor.');
    }
  };

  return (
    <div className="popup-overlay">
      <div className="popup">
        <h3>Update Doctor</h3>
        <form onSubmit={handleSubmit}>
          <label>Name:</label>
          <input type="text" name="doctorName" value={inputs.doctorName || ''} onChange={handleChange} required />

          <label>Phone:</label>
          <input type="text" name="doctorPhone" value={inputs.doctorPhone || ''} onChange={handleChange} required />

          <label>Email:</label>
          <input type="email" name="doctorEmail" value={inputs.doctorEmail || ''} onChange={handleChange} required />

          <label>Password:</label>
          <input type="password" name="doctorPassword" value={inputs.doctorPassword || ''} onChange={handleChange} required />

          <label>Specialization:</label>
          <input type="text" name="specialization" value={inputs.specialization || ''} onChange={handleChange} required />

          <label>Experience (Years):</label>
          <input type="number" name="experienceYears" value={inputs.experienceYears || ''} onChange={handleChange} required />

          <label>Available:</label>
          <input type="checkbox" name="available" checked={inputs.available || false} onChange={handleCheckbox} /><br /><br />

          <button type="submit">Update Doctor</button>
          <button type="button" onClick={onClose} style={{ marginLeft: '10px' }}>Cancel</button>
        </form>
      </div>
    </div>
  );
};

export default DupdateUser;
