import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";


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
        const { data } = await axios.post("http://localhost:5000/api/appointment", {
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
      <style>
      {
        `/* ===== Payment Form Styles ===== */

:root {
  /* Payment Theme Colors */
  --payment-primary: #2563eb;
  --payment-primary-dark: #1d4ed8;
  --payment-success: #10b981;
  --payment-danger: #ef4444;
  --payment-warning: #f59e0b;
  --payment-gray-50: #f9fafb;
  --payment-gray-100: #f3f4f6;
  --payment-gray-200: #e5e7eb;
  --payment-gray-300: #d1d5db;
  --payment-gray-400: #9ca3af;
  --payment-gray-500: #6b7280;
  --payment-gray-600: #4b5563;
  --payment-gray-700: #374151;
  --payment-gray-800: #1f2937;
  --payment-gray-900: #111827;
  
  /* Card Colors */
  --card-bg: #ffffff;
  --card-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  --card-border: #e5e7eb;
  
  /* Input Colors */
  --input-bg: #ffffff;
  --input-border: #d1d5db;
  --input-border-focus: #2563eb;
  --input-text: #111827;
  --input-placeholder: #9ca3af;
  
  /* Animation */
  --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.payment-container {
  max-width: 600px;
  margin: 2rem auto;
  padding: 2rem;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background: linear-gradient(135deg, var(--payment-gray-50) 0%, #ffffff 100%);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.payment-container h2 {
  font-size: 2.25rem;
  font-weight: 800;
  color: var(--payment-gray-900);
  margin-bottom: 0.5rem;
  text-align: center;
  letter-spacing: -0.025em;
}

.payment-subtitle {
  font-size: 1.125rem;
  color: var(--payment-gray-600);
  text-align: center;
  margin-bottom: 2.5rem;
  font-weight: 500;
}

/* ===== Payment Portal Card ===== */
.payment-portal {
  background: var(--card-bg);
  border-radius: 20px;
  box-shadow: var(--card-shadow);
  border: 1px solid var(--card-border);
  padding: 2.5rem;
  width: 100%;
  max-width: 500px;
  position: relative;
  overflow: hidden;
}

.payment-portal::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--payment-primary), var(--payment-success), var(--payment-primary));
  border-radius: 20px 20px 0 0;
}

.payment-portal h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--payment-gray-900);
  margin-bottom: 2rem;
  text-align: center;
  position: relative;
}

.payment-portal h3::after {
  content: '💳';
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.25rem;
  opacity: 0.7;
}

/* ===== Form Styles ===== */
.payment-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--payment-gray-700);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.form-input {
  padding: 1rem 1.25rem;
  border: 2px solid var(--input-border);
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 500;
  color: var(--input-text);
  background: var(--input-bg);
  transition: var(--transition);
  outline: none;
  font-family: inherit;
}

.form-input::placeholder {
  color: var(--input-placeholder);
  font-weight: 400;
}

.form-input:focus {
  border-color: var(--input-border-focus);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  transform: translateY(-1px);
}

.form-input:hover:not(:focus) {
  border-color: var(--payment-gray-300);
}

/* ===== Form Row for Expiry and CVV ===== */
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group.half-width {
  width: 100%;
}

/* ===== Button Styles ===== */
.payment-buttons {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  flex-direction: column;
}

.btn {
  padding: 1rem 2rem;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  position: relative;
  overflow: hidden;
  outline: none;
  font-family: inherit;
  min-height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  transition: all 0.4s ease;
  transform: translate(-50%, -50%);
}

.btn:hover::before {
  width: 300px;
  height: 300px;
}

.btn:active {
  transform: translateY(1px);
}

.btn-confirm {
  background: linear-gradient(135deg, var(--payment-primary) 0%, var(--payment-primary-dark) 100%);
  color: white;
  box-shadow: 0 4px 15px -3px rgba(37, 99, 235, 0.4);
  border: 2px solid transparent;
}

.btn-confirm:hover:not(:disabled) {
  background: linear-gradient(135deg, var(--payment-primary-dark) 0%, #1e40af 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px -3px rgba(37, 99, 235, 0.5);
}

.btn-confirm:disabled {
  background: var(--payment-gray-400);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.btn-confirm:disabled::before {
  display: none;
}

.btn-cancel {
  background: var(--payment-gray-100);
  color: var(--payment-gray-700);
  border: 2px solid var(--payment-gray-200);
}

.btn-cancel:hover:not(:disabled) {
  background: var(--payment-gray-200);
  border-color: var(--payment-gray-300);
  transform: translateY(-1px);
}

.btn-cancel:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* ===== Loading State ===== */
.btn-confirm:disabled {
  position: relative;
}

.btn-confirm:disabled::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 50%;
  width: 20px;
  height: 20px;
  border: 2px solid transparent;
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  transform: translate(-50%, -50%);
  margin-left: 8px;
}

@keyframes spin {
  0% { transform: translate(-50%, -50%) rotate(0deg); }
  100% { transform: translate(-50%, -50%) rotate(360deg); }
}

/* ===== Card Security Indicators ===== */
.form-input[type="password"] {
  font-family: 'Courier New', monospace;
  letter-spacing: 2px;
}

.form-input[maxlength="19"] {
  font-family: 'Courier New', monospace;
  letter-spacing: 1px;
}

/* ===== Error States ===== */
.form-input:invalid:not(:focus):not(:placeholder-shown) {
  border-color: var(--payment-danger);
  background-color: rgba(239, 68, 68, 0.05);
}

.form-input:valid:not(:focus):not(:placeholder-shown) {
  border-color: var(--payment-success);
  background-color: rgba(16, 185, 129, 0.05);
}

/* ===== Missing Details Error ===== */
.payment-container p {
  color: var(--payment-gray-600);
  font-size: 1.125rem;
  text-align: center;
  margin: 2rem 0;
  line-height: 1.6;
}

/* ===== Security Badge ===== */
.payment-portal::after {
  content: '🔒 Secure Payment';
  position: absolute;
  bottom: 1rem;
  right: 1.5rem;
  font-size: 0.75rem;
  color: var(--payment-gray-500);
  font-weight: 500;
}

/* ===== Responsive Design ===== */
@media (max-width: 640px) {
  .payment-container {
    margin: 1rem auto;
    padding: 1rem;
  }
  
  .payment-portal {
    padding: 1.5rem;
  }
  
  .payment-container h2 {
    font-size: 1.875rem;
  }
  
  .payment-subtitle {
    font-size: 1rem;
    margin-bottom: 1.5rem;
  }
  
  .form-row {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .payment-buttons {
    gap: 0.75rem;
  }
  
  .btn {
    padding: 0.875rem 1.5rem;
    font-size: 0.875rem;
  }
}

@media (max-width: 480px) {
  .payment-container {
    padding: 0.5rem;
  }
  
  .payment-portal {
    padding: 1rem;
    border-radius: 16px;
  }
  
  .payment-container h2 {
    font-size: 1.5rem;
  }
  
  .form-input {
    padding: 0.875rem 1rem;
  }
  
  .payment-portal h3::after {
    display: none;
  }
  
  .payment-portal::after {
    display: none;
  }
}

/* ===== Focus Trap for Accessibility ===== */
.payment-form:focus-within .payment-portal {
  box-shadow: 
    var(--card-shadow),
    0 0 0 3px rgba(37, 99, 235, 0.1);
}

/* ===== High Contrast Mode Support ===== */
@media (prefers-contrast: high) {
  .form-input {
    border-width: 3px;
  }
  
  .btn {
    border-width: 3px;
  }
  
  .btn-confirm {
    background: var(--payment-primary);
  }
}

/* ===== Reduced Motion Support ===== */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  
  .btn::before {
    display: none;
  }
}

/* ===== Print Styles ===== */
@media print {
  .payment-container {
    background: white;
    box-shadow: none;
  }
  
  .payment-portal {
    box-shadow: none;
    border: 2px solid var(--payment-gray-300);
  }
  
  .btn {
    display: none;
  }
}
        `
      }
    </style>
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