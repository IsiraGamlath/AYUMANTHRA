import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "./AppointmentBooking.css";

const AppointmentBooking = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedDate, selectedTime, doctorId, patientId } = location.state || {};

  const [patientName, setPatientName] = useState("");
  const [patientAge, setPatientAge] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [appointmentMode, setAppointmentMode] = useState("digital");
  const [date] = useState(selectedDate || "");
  const [time] = useState(selectedTime || "");
  const [doctorFee, setDoctorFee] = useState(50);
  const [doctorName, setDoctorName] = useState("Dr. Smith");
  const [doctorSpecialization, setDoctorSpecialization] = useState("General Medicine");
  const [supportedAppointmentModes, setSupportedAppointmentModes] = useState(['digital', 'physical']);

  // Fetch doctor information when component mounts
  useEffect(() => {
    const fetchDoctorInfo = async () => {
      if (doctorId) {
        try {
          const response = await axios.get(`http://localhost:3000/api/doctors/${doctorId}`);
          const doctor = response.data.doctor;
          if (doctor) {
            setDoctorName(`Dr. ${doctor.name}`);
            setDoctorSpecialization(doctor.specialization);
            setDoctorFee(doctor.consultationFee);
            setSupportedAppointmentModes(doctor.supportedAppointmentModes || ['digital', 'physical']);
            
            // Set default appointment mode based on doctor's first supported mode
            if (doctor.supportedAppointmentModes && doctor.supportedAppointmentModes.length > 0) {
              setAppointmentMode(doctor.supportedAppointmentModes[0]);
            }
          }
        } catch (error) {
          console.error("Error fetching doctor info:", error);
        }
      }
    };

    fetchDoctorInfo();
  }, [doctorId]);

  // Handle name input with real-time validation
  const handleNameChange = (e) => {
    const value = e.target.value;
    // Allow only letters and spaces, prevent numbers and special characters
    const filteredValue = value.replace(/[^A-Za-z\s]/g, '');
    setPatientName(filteredValue);
  };

  // Handle age input with real-time validation
  const handleAgeChange = (e) => {
    const value = e.target.value;
    // Allow only positive integers, no decimals or negative numbers
    if (value === '' || (/^[1-9]\d*$/.test(value) && parseInt(value) <= 120)) {
      setPatientAge(value);
    }
  };

  const handleBooking = (e) => {
    e.preventDefault();

    console.log('Appointment mode selected:', appointmentMode);
    
    // ✅ Patient name validation - only letters and spaces allowed
    const nameRegex = /^[A-Za-z\s]+$/;
    if (!nameRegex.test(patientName.trim())) {
      alert("Patient name should only contain letters and spaces. No numbers or special characters allowed.");
      return;
    }

    // ✅ Check for minimum name length
    if (patientName.trim().length < 2) {
      alert("Patient name must be at least 2 characters long.");
      return;
    }

    // ✅ Age validation with detailed error messages
    const ageNum = Number(patientAge);
    if (!patientAge || patientAge.trim() === '') {
      alert("Please enter the patient's age.");
      return;
    }
    if (isNaN(ageNum) || !Number.isInteger(ageNum)) {
      alert("Age must be a whole number.");
      return;
    }
    if (ageNum < 1) {
      alert("Age must be at least 1 year.");
      return;
    }
    if (ageNum > 120) {
      alert("Age cannot exceed 120 years.");
      return;
    }

    // ✅ Sri Lankan phone number validation
    const sriLankaPhoneRegex = /^(?:\+94\d{9}|07\d{8})$/;
    if (!sriLankaPhoneRegex.test(phoneNumber)) {
      alert("Please enter a valid phone number (e.g., 07XXXXXXXX).");
      return;
    }

    if (!patientName || !patientAge || !phoneNumber || !date || !time) {
      alert("Please fill in all required fields");
      return;
    }

    // ✅ Navigate to payment if everything is valid
    navigate("/payment", {
      state: {
        doctorId,
        patientId,
        patientName,
        patientAge,
        phoneNumber,
        appointmentMode, // Pass appointment mode to payment
        date,
        time,
        doctorFee,
        doctorName,
        doctorSpecialization,
      },
    });
  };

  return (
    <div className="appointment-container">
      <h2>Appointment Booking Form</h2>
      <form onSubmit={handleBooking} className="appointment-form">
        <label>
          Patient Name:
          <input
            type="text"
            value={patientName}
            onChange={handleNameChange}
            required
            placeholder="Enter patient name"
            maxLength="100"
          />
        </label>

        <label>
          Patient Age:
          <input
            type="number"
            value={patientAge}
            onChange={handleAgeChange}
            required
            min="1"
            max="120"
            placeholder="Enter patient age"
            step="1"
          />
        </label>

        <label>
          Phone Number:
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
            placeholder="07XXXXXXXX"
          />
        </label>

        {/* Appointment Mode Dropdown - restricted based on doctor's supported modes */}
        <label>
          Appointment Mode:
          <select
            value={appointmentMode}
            onChange={(e) => setAppointmentMode(e.target.value)}
            className="appointment-mode-select"
            disabled={supportedAppointmentModes.length === 1} // Disable if only one mode is supported
          >
            {supportedAppointmentModes.includes('digital') && (
              <option value="digital">Digital (Online Consultation)</option>
            )}
            {supportedAppointmentModes.includes('physical') && (
              <option value="physical">Physical (In-person Visit)</option>
            )}
          </select>
          {supportedAppointmentModes.length === 1 && (
            <p className="mode-restriction-note">
              This doctor only offers {supportedAppointmentModes[0] === 'digital' ? 'digital (online)' : 'physical (in-person)'} consultations.
            </p>
          )}
        </label>

        <label>
          Date:
          <input type="text" value={date} readOnly />
        </label>

        <label>
          Time:
          <input type="text" value={time} readOnly />
        </label>

        <label>
          Doctor Fee:
          <input type="number" value={doctorFee} readOnly />
        </label>

        <button type="submit">Review & Pay</button>
      </form>
    </div>
  );
};

export default AppointmentBooking;