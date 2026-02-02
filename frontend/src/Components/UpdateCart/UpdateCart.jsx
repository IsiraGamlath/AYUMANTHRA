import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router';
import { useNavigate } from 'react-router';
import AyurvedicNavbar from "../AyurvedicNavbar/AyurvedicNavbar";


function UpdateCart() {
  const [inputs, setInputs] = useState({
    quantity: '',
    weight: '',
    form: '',
    notes: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [originalData, setOriginalData] = useState({});
  
  const history = useNavigate();
  const id = useParams().id;

  useEffect(() => {
    const fetchHandler = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`http://localhost:5000/carts/${id}`);
        const cartData = response.data.cart;
        
        setInputs({
          quantity: cartData.quantity || '',
          weight: cartData.weight || '',
          form: cartData.form || '',
          notes: cartData.notes || ''
        });
        setOriginalData(cartData);
      } catch (error) {
        console.error('Error fetching cart data:', error);
        alert('Error loading cart item. Please try again.');
        history('/cartdetails');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchHandler();
  }, [id, history]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!inputs.quantity || inputs.quantity <= 0) {
      newErrors.quantity = "Please enter a valid quantity";
    }
    
    if (!String(inputs.weight || '').trim()) {
      newErrors.weight = "Please enter the weight";
    }
    
    if (!String(inputs.form || '').trim()) {
      newErrors.form = "Please specify the form";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const sendRequest = async () => {
    await axios.put(`http://localhost:5000/carts/${id}`, {
      quantity: Number(inputs.quantity),
      weight: String(inputs.weight),
      form: String(inputs.form),
      notes: String(inputs.notes),
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs((prevState) => ({
      ...prevState,
      [name]: value,
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log(inputs);
      await sendRequest();
      
      // Navigate immediately without blocking alert
      history('/cartdetails');
    } catch (error) {
      console.error('Error updating cart item:', error);
      alert('Failed to update cart item. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setInputs({
      quantity: originalData.quantity || '',
      weight: originalData.weight || '',
      form: originalData.form || '',
      notes: originalData.notes || ''
    });
    setErrors({});
  };

  const handleCancel = () => {
    history('/cartdetails');
  };

  const commonForms = [
    "Powder",
    "Capsule", 
    "Tea",
    "Extract",
    "Oil",
    "Raw",
    "Tablet",
    "Tincture"
  ];

  if (isLoading) {
    return (
      <div className="update-cart-container">
        <AyurvedicNavbar />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <h2>Loading cart item...</h2>
          <p>Please wait while we fetch the item details</p>
        </div>
      </div>
    );
  }

  return (
    <div className="update-cart-container">
      <style>
        {
          `/* UpdateCart.css - Modern Herbal Style */

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.update-cart-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f0f9f0 0%, #e8f5e8 100%);
  font-family: 'Segoe UI', 'Arial', sans-serif;
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
}

.update-cart-wrapper {
  background: linear-gradient(135deg, #ffffff 0%, #fefffe 100%);
  border-radius: 20px;
  padding: 0;
  max-width: 700px;
  width: 100%;
  margin: 0 auto;
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.15),
    0 8px 25px rgba(0, 0, 0, 0.08);
  border: 2px solid #f0f8f0;
  overflow: hidden;
  position: relative;
}

.update-cart-wrapper::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 6px;
  background: linear-gradient(90deg, #4a7c59, #6ab04c, #4a7c59);
}

/* Loading State */
.loading-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  gap: 25px;
  text-align: center;
  padding: 40px;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #e8f5e8;
  border-top: 4px solid #4a7c59;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-container h2 {
  color: #2d5016;
  font-size: 1.8rem;
  font-weight: 600;
}

.loading-container p {
  color: #666;
  font-size: 1.1rem;
}

/* Header Section */
.update-cart-header {
  background: linear-gradient(135deg, #f8fdf8 0%, #f0f9f0 100%);
  padding: 40px 30px;
  text-align: center;
  border-bottom: 1px solid #e8f0e8;
}

.header-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
  border-radius: 50%;
  margin-bottom: 20px;
  box-shadow: 0 8px 25px rgba(0, 123, 255, 0.3);
  color: white;
}

.update-cart-title {
  color: #2d5016;
  font-size: 2.2rem;
  font-weight: 700;
  margin-bottom: 10px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.update-cart-subtitle {
  color: #666;
  font-size: 1.1rem;
  line-height: 1.5;
  max-width: 400px;
  margin: 0 auto 25px auto;
}

/* Item Info Card */
.item-info-card {
  background: linear-gradient(135deg, #e8f5e8 0%, #d4edda 100%);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid #c3e6c3;
  max-width: 400px;
  margin: 0 auto;
}

.info-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.info-label {
  color: #4a7c59;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  color: #2d5016;
  font-size: 1rem;
  font-weight: 600;
  font-family: 'Courier New', monospace;
}

/* Form Section */
.update-cart-form {
  padding: 40px 30px;
}

.form-group {
  margin-bottom: 30px;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #2d5016;
  font-weight: 600;
  font-size: 1rem;
  margin-bottom: 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.form-label svg {
  color: #4a7c59;
  width: 20px;
  height: 20px;
}

.optional-label {
  color: #999;
  font-weight: 400;
  text-transform: none;
  font-size: 0.9rem;
  margin-left: 8px;
}

.form-input,
.form-textarea {
  width: 100%;
  background: linear-gradient(135deg, #ffffff 0%, #fafafa 100%);
  border: 2px solid #e0e6e0;
  border-radius: 12px;
  padding: 16px 20px;
  font-size: 1rem;
  color: #333;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.06);
  font-family: inherit;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #4a7c59;
  box-shadow: 
    inset 0 2px 4px rgba(0, 0, 0, 0.06),
    0 0 0 4px rgba(74, 124, 89, 0.15),
    0 4px 15px rgba(74, 124, 89, 0.2);
  background: #ffffff;
  transform: translateY(-1px);
}

.form-input.error,
.form-textarea.error {
  border-color: #dc3545;
  box-shadow: 
    inset 0 2px 4px rgba(0, 0, 0, 0.06),
    0 0 0 4px rgba(220, 53, 69, 0.15);
}

.form-textarea {
  resize: vertical;
  min-height: 120px;
  line-height: 1.6;
}

.form-input-wrapper {
  position: relative;
}

.input-hint {
  color: #999;
  font-size: 0.85rem;
  margin-top: 6px;
  display: block;
}

.error-message {
  color: #dc3545;
  font-size: 0.85rem;
  margin-top: 6px;
  display: block;
  font-weight: 500;
}

/* Quick Select Section */
.quick-select {
  margin-top: 15px;
}

.quick-select-label {
  color: #4a7c59;
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 10px;
  display: block;
}

.quick-select-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.quick-btn {
  background: linear-gradient(135deg, #f8fdf8 0%, #f0f9f0 100%);
  border: 2px solid #e0e6e0;
  border-radius: 20px;
  padding: 8px 16px;
  font-size: 0.85rem;
  font-weight: 500;
  color: #4a7c59;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: none;
}

.quick-btn:hover {
  background: linear-gradient(135deg, #e8f5e8 0%, #d4edda 100%);
  border-color: #4a7c59;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(74, 124, 89, 0.2);
}

.quick-btn.active {
  background: linear-gradient(135deg, #4a7c59 0%, #5a8f6b 100%);
  border-color: #4a7c59;
  color: white;
  box-shadow: 0 4px 15px rgba(74, 124, 89, 0.3);
}

/* Action Buttons */
.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 40px;
}

.btn-cancel,
.btn-reset,
.btn-update {
  flex: 1;
  padding: 16px 24px;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-transform: uppercase;
  letter-spacing: 0.8px;
  min-height: 54px;
  border: none;
  position: relative;
  overflow: hidden;
}

.btn-update {
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
  color: white;
  box-shadow: 0 8px 25px rgba(0, 123, 255, 0.3);
}

.btn-update::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.6s;
}

.btn-update:hover::before {
  left: 100%;
}

.btn-update:hover {
  background: linear-gradient(135deg, #0056b3 0%, #004085 100%);
  box-shadow: 0 12px 35px rgba(0, 123, 255, 0.4);
  transform: translateY(-3px);
}

.btn-reset {
  background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%);
  color: white;
  box-shadow: 0 6px 20px rgba(108, 117, 125, 0.3);
}

.btn-reset:hover {
  background: linear-gradient(135deg, #5a6268 0%, #495057 100%);
  box-shadow: 0 8px 25px rgba(108, 117, 125, 0.4);
  transform: translateY(-2px);
}

.btn-cancel {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  color: #dc3545;
  border: 2px solid #dc3545;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.btn-cancel:hover {
  background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%);
  box-shadow: 0 8px 25px rgba(220, 53, 69, 0.2);
  transform: translateY(-2px);
}

.btn-update:disabled,
.btn-reset:disabled,
.btn-cancel:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.btn-update svg,
.btn-reset svg,
.btn-cancel svg {
  width: 16px;
  height: 16px;
}

/* Loading Spinner in Button */
.btn-update .loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* Help Section */
.help-section {
  background: linear-gradient(135deg, #f0f8f0 0%, #e8f5e8 100%);
  padding: 25px 30px;
  border-top: 1px solid #e8f0e8;
}

.help-item {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  color: #4a7c59;
}

.help-item svg {
  width: 20px;
  height: 20px;
  color: #4a7c59;
  margin-top: 2px;
  flex-shrink: 0;
}

.help-item strong {
  color: #2d5016;
  display: block;
  margin-bottom: 4px;
  font-size: 1rem;
}

.help-item p {
  color: #666;
  font-size: 0.9rem;
  line-height: 1.5;
  margin: 0;
}

/* Responsive Design */
@media (max-width: 768px) {
  .update-cart-container {
    padding: 20px 15px;
  }
  
  .update-cart-wrapper {
    max-width: 100%;
  }
  
  .update-cart-header {
    padding: 30px 20px;
  }
  
  .header-icon {
    width: 60px;
    height: 60px;
    margin-bottom: 15px;
  }
  
  .header-icon svg {
    width: 32px;
    height: 32px;
  }
  
  .update-cart-title {
    font-size: 1.8rem;
  }
  
  .update-cart-subtitle {
    font-size: 1rem;
  }
  
  .item-info-card {
    flex-direction: column;
    gap: 15px;
    padding: 15px;
  }
  
  .info-item {
    flex-direction: row;
    justify-content: space-between;
    width: 100%;
  }
  
  .update-cart-form {
    padding: 30px 20px;
  }
  
  .form-group {
    margin-bottom: 25px;
  }
  
  .form-input,
  .form-textarea {
    padding: 14px 16px;
  }
  
  .form-actions {
    flex-direction: column;
    gap: 12px;
  }
  
  .btn-update,
  .btn-reset,
  .btn-cancel {
    min-height: 48px;
  }
  
  .quick-select-buttons {
    gap: 6px;
  }
  
  .quick-btn {
    padding: 6px 12px;
    font-size: 0.8rem;
  }
  
  .help-section {
    padding: 20px;
  }
}

@media (max-width: 480px) {
  .update-cart-container {
    padding: 15px 10px;
  }
  
  .update-cart-header {
    padding: 25px 15px;
  }
  
  .update-cart-title {
    font-size: 1.5rem;
  }
  
  .update-cart-form {
    padding: 25px 15px;
  }
  
  .form-input,
  .form-textarea {
    padding: 12px 14px;
    font-size: 0.95rem;
  }
  
  .btn-update,
  .btn-reset,
  .btn-cancel {
    padding: 14px 20px;
    font-size: 0.9rem;
    min-height: 44px;
  }
  
  .quick-select-buttons {
    justify-content: center;
  }
  
  .help-section {
    padding: 15px;
  }
}

/* Form Focus States for Accessibility */
.form-input:focus,
.form-textarea:focus,
.btn-update:focus,
.btn-reset:focus,
.btn-cancel:focus,
.quick-btn:focus {
  outline: 3px solid rgba(74, 124, 89, 0.3);
  outline-offset: 2px;
}

/* Print Styles */
@media print {
  .update-cart-container {
    background: white;
    padding: 0;
  }
  
  .update-cart-wrapper {
    box-shadow: none;
    border: 1px solid #ccc;
  }
  
  .form-actions {
    display: none;
  }
}
          `
        }
      </style>
      <AyurvedicNavbar />
      
      <div className="update-cart-wrapper">
        {/* Header Section */}
        <div className="update-cart-header">
          <div className="header-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" 
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z" 
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="update-cart-title">Update Herbal Product</h1>
          <p className="update-cart-subtitle">Modify your herbal remedy details and preferences</p>
          
          {/* Item Info */}
          <div className="item-info-card">
            <div className="info-item">
              <span className="info-label">Product ID:</span>
              <span className="info-value">{id?.slice(-8) || 'N/A'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Last Updated:</span>
              <span className="info-value">{new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="update-cart-form">
          {/* Quantity Field */}
          <div className="form-group">
            <label className="form-label">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                <path d="M9 9H15M9 15H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Quantity of Items
            </label>
            <input
              type="number"
              name="quantity"
              className={`form-input ${errors.quantity ? 'error' : ''}`}
              onChange={handleChange}
              value={inputs.quantity}
              placeholder="Enter quantity (e.g., 2)"
              min="1"
              required
            />
            {errors.quantity && <span className="error-message">{errors.quantity}</span>}
          </div>

          {/* Weight Field */}
          <div className="form-group">
            <label className="form-label">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 3L2 12H5V20H19V12H22L12 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Item Weight
            </label>
            <input
              type="text"
              name="weight"
              className={`form-input ${errors.weight ? 'error' : ''}`}
              onChange={handleChange}
              value={inputs.weight}
              placeholder="e.g., 250g, 1kg, 500ml"
              required
            />
            {errors.weight && <span className="error-message">{errors.weight}</span>}
            <span className="input-hint">Specify weight with unit (g, kg, ml, oz)</span>
          </div>

          {/* Form Field */}
          <div className="form-group">
            <label className="form-label">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M21 16V8C21 6.9 20.1 6 19 6H5C3.9 6 3 6.9 3 8V16C3 17.1 3.9 18 5 18H19C20.1 18 21 17.1 21 16Z" stroke="currentColor" strokeWidth="2"/>
                <path d="M7 10L12 13L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Product Form
            </label>
            <div className="form-input-wrapper">
              <input
                type="text"
                name="form"
                className={`form-input ${errors.form ? 'error' : ''}`}
                onChange={handleChange}
                value={inputs.form}
                placeholder="Select or type form"
                list="form-options"
                required
              />
              <datalist id="form-options">
                {commonForms.map((form, index) => (
                  <option key={index} value={form} />
                ))}
              </datalist>
            </div>
            {errors.form && <span className="error-message">{errors.form}</span>}
            
            {/* Quick Select Buttons */}
            <div className="quick-select">
              <span className="quick-select-label">Quick Select:</span>
              <div className="quick-select-buttons">
                {commonForms.slice(0, 4).map((form, index) => (
                  <button
                    key={index}
                    type="button"
                    className={`quick-btn ${inputs.form === form ? 'active' : ''}`}
                    onClick={() => setInputs(prev => ({ ...prev, form }))}
                  >
                    {form}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Notes Field */}
          <div className="form-group">
            <label className="form-label">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2"/>
                <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2"/>
                <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2"/>
                <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2"/>
              </svg>
              Special Notes
              <span className="optional-label">(Optional)</span>
            </label>
            <textarea
              name="notes"
              className="form-textarea"
              onChange={handleChange}
              value={inputs.notes}
              rows="4"
              placeholder="Any special instructions, allergies, or preferences..."
            />
            <span className="input-hint">Add any special requirements or notes for this product</span>
          </div>

          {/* Action Buttons */}
          <div className="form-actions">
            <button 
              type="button" 
              className="btn-cancel"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Cancel
            </button>

            <button 
              type="button" 
              className="btn-reset"
              onClick={handleReset}
              disabled={isSubmitting}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12Z" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 7V12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Reset
            </button>

            <button 
              type="submit" 
              className="btn-update"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="loading-spinner"></div>
                  Updating...
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" 
                          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z" 
                          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Update Item
                </>
              )}
            </button>
          </div>
        </form>

        {/* Help Section */}
        <div className="help-section">
          <div className="help-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              <path d="M9.09 9C9.3251 8.33167 9.78915 7.76811 10.4 7.40913C11.0108 7.05016 11.7289 6.91894 12.4272 7.03871C13.1255 7.15849 13.7588 7.52152 14.2151 8.06353C14.6713 8.60553 14.9211 9.29152 14.92 10C14.92 12 11.92 13 11.92 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="17" r="1" fill="currentColor"/>
            </svg>
            <div>
              <strong>Need Help?</strong>
              <p>Contact our herbal specialists if you need assistance with product modifications</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UpdateCart;
