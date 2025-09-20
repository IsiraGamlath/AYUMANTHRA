import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Payment.css"; // Import the CSS file

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    doctorId,
    patientId,
    patientName,
    patientAge,
    phoneNumber,
    appointmentMode,
    date,
    time,
    doctorFee,
    doctorName,
    doctorSpecialization
  } = location.state || {};

  const handleConfirmPay = () => {
    // Navigate to the payment form page with all the appointment details
    navigate("/payment-form", {
      state: {
        doctorId,
        patientId,
        patientName,
        patientAge,
        phoneNumber,
        appointmentMode,
        date,
        time,
        doctorFee,
        doctorName,
        doctorSpecialization
      }
    });
  };

  const handleCancel = () => {
    navigate(-1);
  };

  if (!doctorId || !patientId || !patientName || !patientAge || !phoneNumber || !date || !time) {
    return (
      <div className="payment-container">
        <h3>Payment</h3>
        <p>Missing appointment details. Please go back and select a slot.</p>
        <button className="btn btn-cancel" onClick={() => navigate("/")}>Go to Availability</button>
      </div>
    );
  }

  return (
    <div className="payment-container">
      <h2>Payment</h2>
      <p className="payment-subtitle">Review your appointment summary before confirming payment.</p>

      <div className="appointment-summary">
        <div><strong>Patient Name:</strong> {patientName}</div>
        <div><strong>Patient Age:</strong> {patientAge}</div>
        <div><strong>Phone Number:</strong> {phoneNumber}</div>
        <div><strong>Doctor's Name:</strong> {doctorName}</div>
        <div><strong>Specialization:</strong> {doctorSpecialization}</div>
        <div><strong>Appointment Mode:</strong> {appointmentMode === 'digital' ? 'Digital (Online Consultation)' : 'Physical (In-person Visit)'} [{appointmentMode}]</div>
        <div><strong>Date:</strong> {date}</div>
        <div><strong>Time:</strong> {time}</div>
        <div><strong>Fee:</strong> Rs. {doctorFee}</div>
      </div>

      <div className="payment-buttons">
        <button className="btn btn-confirm" onClick={handleConfirmPay}>Confirm & Pay</button>
        <button className="btn btn-cancel" onClick={handleCancel}>Cancel</button>
      </div>
    </div>
  );
};

export default Payment;