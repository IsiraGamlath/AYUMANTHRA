import React, { useState } from "react";
import axios from "axios";

const DaddUser = ({ onClose, onDoctorAdded }) => {
  const [inputs, setInputs] = useState({
    doctorName: "",
    doctorPhone: "",
    doctorEmail: "",
    doctorPassword: "",
    specialization: "",
    experienceYears: "",
    available: true,
    mode: "Physical",
  });

  const [errors, setErrors] = useState({});

  const validateField = (name, value) => {
    let error = "";

    switch (name) {
      case "doctorName":
        if (!value.trim()) error = "Name is required.";
        else if (!/^[A-Za-z\s]{3,}$/.test(value))
          error = "Name must be at least 3 letters and contain only alphabets.";
        break;

      case "doctorPhone":
        if (!value.trim()) error = "Phone is required.";
        else if (!/^[0-9]{10}$/.test(value))
          error = "Phone must be exactly 10 digits.";
        break;

      case "doctorEmail":
        if (!value.trim()) error = "Email is required.";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          error = "Enter a valid email address.";
        break;

      case "doctorPassword":
        if (!value.trim()) error = "Password is required.";
        else if (value.length < 6)
          error = "Password must be at least 6 characters long.";
        break;

      case "specialization":
        if (!value) error = "Please select a specialization.";
        break;

      case "experienceYears":
        if (value === "") error = "Experience is required.";
        else if (Number(value) < 0)
          error = "Experience cannot be a negative number.";
        break;

      default:
        break;
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
    return error === "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleCheckbox = () => {
    setInputs((prev) => ({ ...prev, available: !prev.available }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields before submit
    let allValid = true;
    Object.keys(inputs).forEach((key) => {
      if (key !== "available" && key !== "mode") {
        const isValid = validateField(key, inputs[key]);
        if (!isValid) allValid = false;
      }
    });

    if (!allValid) return; // Stop if any field is invalid

    try {
      await axios.post("http://localhost:5000/doctors", inputs);

      // Reset form after submit
      setInputs({
        doctorName: "",
        doctorPhone: "",
        doctorEmail: "",
        doctorPassword: "",
        specialization: "",
        experienceYears: "",
        available: true,
        mode: "Physical",
      });

      setErrors({});
      onDoctorAdded();
      onClose();
    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 400) {
        alert(err.response.data.message);
      } else {
        alert("Failed to add doctor. Please try again.");
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-11/12 md:w-1/2 lg:w-1/3 p-5">
        <h3 className="text-xl font-bold text-gray-800 mb-3 text-center">
          Add Doctor
        </h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Name + Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Name:
              </label>
              <input
                type="text"
                name="doctorName"
                value={inputs.doctorName}
                onChange={handleChange}
                className={`w-full border ${
                  errors.doctorName ? "border-red-500" : "border-gray-300"
                } rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm`}
              />
              {errors.doctorName && (
                <p className="text-red-500 text-xs mt-1">{errors.doctorName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Phone:
              </label>
              <input
                type="text"
                name="doctorPhone"
                value={inputs.doctorPhone}
                onChange={handleChange}
                className={`w-full border ${
                  errors.doctorPhone ? "border-red-500" : "border-gray-300"
                } rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm`}
              />
              {errors.doctorPhone && (
                <p className="text-red-500 text-xs mt-1">{errors.doctorPhone}</p>
              )}
            </div>
          </div>

          {/* Email + Password */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email:
              </label>
              <input
                type="email"
                name="doctorEmail"
                value={inputs.doctorEmail}
                onChange={handleChange}
                className={`w-full border ${
                  errors.doctorEmail ? "border-red-500" : "border-gray-300"
                } rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm`}
              />
              {errors.doctorEmail && (
                <p className="text-red-500 text-xs mt-1">{errors.doctorEmail}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password:
              </label>
              <input
                type="password"
                name="doctorPassword"
                value={inputs.doctorPassword}
                onChange={handleChange}
                className={`w-full border ${
                  errors.doctorPassword ? "border-red-500" : "border-gray-300"
                } rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm`}
              />
              {errors.doctorPassword && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.doctorPassword}
                </p>
              )}
            </div>
          </div>

          {/* Specialization + Experience */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Specialization:
              </label>
              <select
                name="specialization"
                value={inputs.specialization}
                onChange={handleChange}
                className={`w-full border ${
                  errors.specialization ? "border-red-500" : "border-gray-300"
                } rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm`}
              >
                <option value="">Select Specialization</option>
                <option value="VOG">VOG</option>
                <option value="Neurologist">Neurologist</option>
                <option value="Pediatrics">Pediatrics</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Orthopedics">Orthopedics</option>
                <option value="Dermatologist">Dermatologist</option>
                <option value="Ayurvedic Specialist">Ayurvedic Specialist</option>
              </select>
              {errors.specialization && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.specialization}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Experience (Years):
              </label>
              <input
                type="number"
                name="experienceYears"
                value={inputs.experienceYears}
                onChange={handleChange}
                min="0"
                className={`w-full border ${
                  errors.experienceYears ? "border-red-500" : "border-gray-300"
                } rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm`}
              />
              {errors.experienceYears && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.experienceYears}
                </p>
              )}
            </div>
          </div>

          {/* Mode + Availability */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Mode:
              </label>
              <select
                name="mode"
                value={inputs.mode}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
              >
                <option value="Physical">Physical</option>
                <option value="Digital">Digital</option>
              </select>
            </div>
            <div className="flex items-center mt-3 md:mt-6">
              <input
                type="checkbox"
                name="available"
                checked={inputs.available}
                onChange={handleCheckbox}
                className="h-4 w-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
              />
              <label className="ml-2 text-sm font-medium text-gray-700">
                Available
              </label>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 mt-3">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-md shadow text-sm transition duration-200"
            >
              Register
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 rounded-md shadow text-sm transition duration-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DaddUser;
