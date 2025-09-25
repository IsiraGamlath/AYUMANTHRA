import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DupdateUser = ({ doctor, onClose, onDoctorUpdated }) => {
  const [inputs, setInputs] = useState({});

  const specializations = [
    "VOG",
    "Neurologist",
    "Pediatrics",
    "Cardiology",
    "Orthopedics",
    "Dermatologist",
    "Psychiatry",
    "ENT",
    "General Physician"
  ];

  useEffect(() => {
    setInputs(doctor);
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
        mode: String(inputs.mode || "Physical"),
        available: Boolean(inputs.available),
      });

      onDoctorUpdated();
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to update doctor.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-11/12 md:w-2/3 lg:w-1/2 p-4 relative">
        <button
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-800 font-bold text-xl"
          onClick={onClose}
        >
          ×
        </button>
        <h3 className="text-xl font-semibold mb-3 text-gray-800">Update Doctor</h3>

        <form onSubmit={handleSubmit} className="space-y-2 text-sm">

          {/* Name & Phone Row */}
          <div className="flex gap-2">
            <input
              type="text"
              name="doctorName"
              value={inputs.doctorName || ''}
              onChange={handleChange}
              placeholder="Name"
              className="flex-1 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="text"
              name="doctorPhone"
              value={inputs.doctorPhone || ''}
              onChange={handleChange}
              placeholder="Phone"
              className="flex-1 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Email & Password Row */}
          <div className="flex gap-2">
            <input
              type="email"
              name="doctorEmail"
              value={inputs.doctorEmail || ''}
              onChange={handleChange}
              placeholder="Email"
              className="flex-1 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="password"
              name="doctorPassword"
              value={inputs.doctorPassword || ''}
              onChange={handleChange}
              placeholder="Password"
              className="flex-1 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Specialization & Mode Row */}
          <div className="flex gap-2">
            <select
              name="specialization"
              value={inputs.specialization || ''}
              onChange={handleChange}
              className="flex-1 border border-gray-300 rounded px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Specialization</option>
              {specializations.map((spec, idx) => (
                <option key={idx} value={spec}>{spec}</option>
              ))}
            </select>
            <select
              name="mode"
              value={inputs.mode || "Physical"}
              onChange={handleChange}
              className="flex-1 border border-gray-300 rounded px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Physical">Physical</option>
              <option value="Digital">Digital</option>
            </select>
          </div>

          {/* Experience & Availability Row */}
          <div className="flex items-center gap-2">
            <input
              type="number"
              name="experienceYears"
              value={inputs.experienceYears || ''}
              onChange={handleChange}
              placeholder="Experience (yrs)"
              min="0"
              className="flex-1 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <label className="flex items-center gap-1">
              <input
                type="checkbox"
                name="available"
                checked={inputs.available || false}
                onChange={handleCheckbox}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-gray-700 text-sm">Available</span>
            </label>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 mt-2">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3 py-1 rounded shadow transition duration-200 text-sm"
            >
              Update
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold px-3 py-1 rounded shadow transition duration-200 text-sm"
            >
              Cancel
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default DupdateUser;