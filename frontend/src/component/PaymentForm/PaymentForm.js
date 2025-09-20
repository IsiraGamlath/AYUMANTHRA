import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "./PaymentForm.css";

const PaymentForm = () => {
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

  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardHolderName, setCardHolderName] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simple validation
    if (!cardNumber || !expiryDate || !cvv || !cardHolderName) {
      alert("Please fill in all card details");
      setIsProcessing(false);
      return;
    }

    // Simulate payment processing delay
    setTimeout(async () => {
      try {
        console.log('Sending appointment with mode:', appointmentMode);
        const { data } = await axios.post("http://localhost:3000/api/appointment", {
          doctorId,
          patientId,
          patientName,
          patientAge: parseInt(patientAge, 10),
          phoneNumber,
          appointmentMode,
          date,
          time,
          doctorFee,
          doctorName,
          doctorSpecialization
        });

        alert(data.message || "Payment successful. Appointment booked!");
        navigate("/myappointments");
      } catch (err) {
        console.error(err);
        alert(err.response?.data?.message || "Payment/Booking failed");
      } finally {
        setIsProcessing(false);
      }
    }, 2000); // Simulate 2 seconds processing time
  };

  const handleCancel = () => {
    navigate("/payment");
  };

  const formatCardNumber = (value) => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, '');
    // Format as xxxx xxxx xxxx xxxx
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
  };

  const handleCardNumberChange = (e) => {
    const formatted = formatCardNumber(e.target.value);
    // Limit to 19 characters (16 digits + 3 spaces)
    if (formatted.length <= 19) {
      setCardNumber(formatted);
    }
  };

  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 3) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    setExpiryDate(value);
  };

  const handleCvvChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 4) {
      setCvv(value);
    }
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
      <p className="payment-subtitle">Enter your card details to complete the payment.</p>

      <div className="payment-portal">
        <h3>Enter Card Details</h3>
        <form onSubmit={handlePaymentSubmit} className="payment-form">
          <div className="form-group">
            <label>Card Number</label>
            <input
              type="text"
              value={cardNumber}
              onChange={handleCardNumberChange}
              placeholder="xxxx xxxx xxxx xxxx"
              maxLength="19"
              required
              className="form-input"
            />
          </div>
          
          <div className="form-row">
            <div className="form-group half-width">
              <label>Expiry Date</label>
              <input
                type="text"
                value={expiryDate}
                onChange={handleExpiryChange}
                placeholder="MM/YY"
                maxLength="5"
                required
                className="form-input"
              />
            </div>
            
            <div className="form-group half-width">
              <label>CVV</label>
              <input
                type="password"
                value={cvv}
                onChange={handleCvvChange}
                placeholder="123"
                maxLength="4"
                required
                className="form-input"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>Cardholder Name</label>
            <input
              type="text"
              value={cardHolderName}
              onChange={(e) => setCardHolderName(e.target.value)}
              placeholder="Name on card"
              required
              className="form-input"
            />
          </div>
          
          <div className="payment-buttons">
            <button 
              type="submit" 
              className="btn btn-confirm" 
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : "Pay Now"}
            </button>
            <button 
              type="button" 
              className="btn btn-cancel" 
              onClick={handleCancel}
              disabled={isProcessing}
            >
              Back
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentForm;