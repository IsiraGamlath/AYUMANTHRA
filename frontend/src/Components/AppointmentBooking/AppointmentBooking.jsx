import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";


const AppointmentBooking = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedDate, selectedTime, doctorId, patientId, consultationMode } = location.state || {};
  
  console.log('Booking form received state:', { selectedDate, selectedTime, doctorId, patientId, consultationMode });

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
    console.log('🔄 useEffect triggered with doctorId:', doctorId);
    const fetchDoctorInfo = async () => {
      console.log(
        "🔍 useEffect running with consultationMode:",
        consultationMode
      ); // ✅ Debug

      // ✅ Set consultationMode FIRST if it exists
      if (consultationMode) {
        const normalizedMode = consultationMode.toLowerCase();
        console.log("✅ Setting appointmentMode to:", normalizedMode); // ✅ Debug
        setAppointmentMode(normalizedMode);
      }

      // Then fetch doctor info
      if (doctorId) {
        console.log('Fetching doctor info for ID:', doctorId);
        try {
          const response = await axios.get(
            `http://localhost:5000/doctors/${doctorId}`
          );
          console.log('API response:', response.data);
          const doctor = response.data.doctor;
          if (doctor) {
            console.log('Doctor data received in booking form:', doctor);
            setDoctorName(`Dr. ${doctor.doctorName || doctor.name}`);
            setDoctorSpecialization(doctor.specialization);
            const fee = doctor.doctorFee || doctor.consultationFee || 50;
            console.log('Setting doctor fee to:', fee);
            setDoctorFee(fee);
            console.log('Doctor fee state updated to:', fee);
            setSupportedAppointmentModes(
              doctor.supportedAppointmentModes || ["digital", "physical"]
            );

            // Only override appointmentMode if no consultationMode was provided
            if (
              !consultationMode &&
              doctor.supportedAppointmentModes &&
              doctor.supportedAppointmentModes.length > 0
            ) {
              setAppointmentMode(doctor.supportedAppointmentModes[0]);
            }
          }
        } catch (error) {
          console.error("Error fetching doctor info:", error);
          // Even if API fails, consultationMode is already set above
        }
      }
    };

    fetchDoctorInfo();
  }, [doctorId, consultationMode]);

  console.log('Current appointmentMode state:', appointmentMode);
  console.log('Received consultationMode:', consultationMode);
  console.log('Current doctorFee in render:', doctorFee);


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

    // Sri Lanka phone number validation (mobile + landline)
const sriLankaPhoneRegex = /^(?:\+94|0)(?:7\d{8}|1\d{8}|2\d{8}|3\d{8}|4\d{8}|5\d{8}|6\d{8}|8\d{8}|9\d{8})$/;

if (!sriLankaPhoneRegex.test(phoneNumber)) {
  alert("Please enter a valid Sri Lankan phone number (e.g., 0712345678 or 0112345678).");
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
      <style>
        {`

/* Import Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Cormorant+Garamond:wght@400;500;600;700&display=swap');


:root {
  /* Ayurvedic-inspired color palette */
  --primary-color: #62e7b4;       /* Earthy green */
  --secondary-color: #c19a6b;     /* Warm sand */
  --accent-color: #d4a373;        /* Turmeric */
  --light-accent: #e9edc9;        /* Soft herb */
  --dark-accent: #46ad7a;         /* Deep forest */
  
  /* Neutral colors */
  --white: #ffffff;
  --light-gray: #f8f9fa;
  --medium-gray: #e9ecef;
  --dark-gray: #6c757d;
  --black: #212529;
  
  /* Status colors */
  --success: #588157;             /* Natural green */
  --warning: #e6c74c;             /* Saffron yellow */
  --error: #bc4749;               /* Medicinal red */
  
  /* Font families */
  --font-primary: 'Poppins', sans-serif;
  --font-secondary: 'Cormorant Garamond', serif;
}

/* ================================
   BASE STYLES
   ================================ */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  min-height: 100vh;
  background: #e9edc9;
}

body {
  font-family: var(--font-primary);
  background: #e9edc9;
  line-height: 1.6;
  color: var(--black);
  min-height: 100vh;
}

/* Root container for the entire page */
#root {
  min-height: 100vh;
  background: #e9edc9;
  padding: 2rem 0;
}

/* Fallback for any container */
.App {
  min-height: 100vh;
  background: #e9edc9;
  padding: 2rem 0;
}

/* ================================
   APPOINTMENT CONTAINER
   ================================ */
.appointment-container {
  max-width: 600px;
  margin: 2rem auto;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(90, 143, 123, 0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(90, 143, 123, 0.1);
  position: relative;
  overflow: hidden;
}

.appointment-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 5px;
  background: linear-gradient(90deg, var(--primary-color), var(--accent-color), var(--secondary-color));
  border-radius: 20px 20px 0 0;
}

/* ================================
   TYPOGRAPHY
   ================================ */
.appointment-container h2 {
  font-family: var(--font-secondary);
  font-size: 2.2rem;
  color: var(--dark-accent);
  text-align: center;
  margin-bottom: 2rem;
  position: relative;
  padding-bottom: 1rem;
}

.appointment-container h2::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 3px;
  background: linear-gradient(90deg, var(--accent-color), var(--secondary-color));
  border-radius: 2px;
}

/* ================================
   FORM STYLES
   ================================ */
.appointment-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.appointment-form label {
  display: flex;
  flex-direction: column;
  font-weight: 500;
  color: var(--dark-accent);
  font-size: 1rem;
  gap: 0.5rem;
}

/* ================================
   INPUT STYLES
   ================================ */
.appointment-form input,
.appointment-form select {
  padding: 1rem;
  border: 2px solid var(--medium-gray);
  border-radius: 12px;
  font-size: 1rem;
  font-family: var(--font-primary);
  background-color: var(--white);
  transition: all 0.3s ease;
  outline: none;
}

.appointment-form input:focus,
.appointment-form select:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(90, 143, 123, 0.1);
  transform: translateY(-1px);
}

.appointment-form input:hover,
.appointment-form select:hover {
  border-color: var(--accent-color);
}

/* Read-only inputs */
.appointment-form input[readonly] {
  background-color: rgba(233, 237, 201, 0.3);
  color: var(--dark-accent);
  cursor: not-allowed;
  border-color: rgba(233, 237, 201, 0.5);
}

.appointment-form input[readonly]:hover {
  border-color: rgba(233, 237, 201, 0.5);
}

/* ================================
   APPOINTMENT MODE SELECT
   ================================ */
.appointment-mode-select {
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  background-size: 1rem;
  padding-right: 3rem;
  appearance: none;
  cursor: pointer;
}

.appointment-mode-select:disabled {
  background-color: var(--light-gray);
  color: var(--dark-gray);
  cursor: not-allowed;
  opacity: 0.7;
}

/* ================================
   MODE RESTRICTION NOTE
   ================================ */
.mode-restriction-note {
  font-size: 0.875rem;
  color: var(--secondary-color);
  margin-top: 0.5rem;
  padding: 0.75rem;
  background-color: rgba(193, 154, 107, 0.1);
  border-left: 3px solid var(--secondary-color);
  border-radius: 0 8px 8px 0;
  font-style: italic;
}

/* ================================
   SUBMIT BUTTON
   ================================ */
.appointment-form button[type="submit"] {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--dark-accent) 100%);
  color: var(--white);
  padding: 1.2rem 2rem;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  font-family: var(--font-primary);
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 1rem;
  position: relative;
  overflow: hidden;
}

.appointment-form button[type="submit"]:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(90, 143, 123, 0.3);
}

.appointment-form button[type="submit"]:active {
  transform: translateY(0);
}

.appointment-form button[type="submit"]::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

.appointment-form button[type="submit"]:hover::before {
  left: 100%;
}

/* ================================
   INPUT VALIDATION STATES
   ================================ */
.appointment-form input:invalid {
  border-color: var(--error);
}

.appointment-form input:valid {
  border-color: var(--success);
}

/* ================================
   PLACEHOLDER STYLES
   ================================ */
.appointment-form input::placeholder {
  color: var(--dark-gray);
  opacity: 0.7;
}

/* ================================
   RESPONSIVE DESIGN
   ================================ */
@media (max-width: 768px) {
  .appointment-container {
    margin: 1rem;
    padding: 1.5rem;
  }
  
  .appointment-container h2 {
    font-size: 1.8rem;
  }
  
  .appointment-form input,
  .appointment-form select {
    padding: 0.875rem;
    font-size: 0.95rem;
  }
  
  .appointment-form button[type="submit"] {
    padding: 1rem 1.5rem;
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .appointment-container {
    margin: 0.5rem;
    padding: 1rem;
  }
  
  .appointment-container h2 {
    font-size: 1.5rem;
  }
  
  .appointment-form {
    gap: 1.25rem;
  }
}

/* ================================
   ACCESSIBILITY IMPROVEMENTS
   ================================ */
@media (prefers-reduced-motion: reduce) {
  .appointment-form input,
  .appointment-form select,
  .appointment-form button,
  .appointment-container {
    transition: none;
  }
  
  .appointment-form button[type="submit"]::before {
    transition: none;
  }
}

/* Focus visible for keyboard navigation */
.appointment-form input:focus-visible,
.appointment-form select:focus-visible,
.appointment-form button:focus-visible {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}

/* ================================
   LOADING STATES
   ================================ */
.appointment-form button[type="submit"]:disabled {
  background: var(--medium-gray);
  cursor: not-allowed;
  transform: none;
}

.appointment-form button[type="submit"]:disabled:hover {
  transform: none;
  box-shadow: none;
}
        
        
        `}
      </style>

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
            disabled={!!consultationMode}
          >
            {appointmentMode === "physical" ? (
              <>
                <option value="physical">Physical (In-person Visit)</option>
                {!consultationMode &&
                  supportedAppointmentModes.includes("digital") && (
                    <option value="digital">
                      Digital (Online Consultation)
                    </option>
                  )}
              </>
            ) : (
              <>
                <option value="digital">Digital (Online Consultation)</option>
                {!consultationMode &&
                  supportedAppointmentModes.includes("physical") && (
                    <option value="physical">Physical (In-person Visit)</option>
                  )}
              </>
            )}
          </select>
          {consultationMode && (
            <p className="mode-restriction-note">
              ✓ You selected{" "}
              {consultationMode === "Digital" || consultationMode === "digital"
                ? "Online"
                : "Physical"}{" "}
              consultation from the menu. This cannot be changed during booking.
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