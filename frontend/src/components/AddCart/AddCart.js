import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNotification } from '../../contexts/NotificationContext';
import "./AddCart.css";

function AddCart() {
  const history = useNavigate();
  const { showError, showSuccess } = useNotification();
  const [inputs, setInputs] = useState({
    quantity: "",
    weight: "",
    form: "",
    notes: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

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

  const validateForm = () => {
    const newErrors = {};
    
    if (!inputs.quantity || inputs.quantity <= 0) {
      newErrors.quantity = "Please enter a valid quantity";
    }
    
    if (!inputs.weight.trim()) {
      newErrors.weight = "Please enter the weight";
    }
    
    if (!inputs.form.trim()) {
      newErrors.form = "Please specify the form";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log(inputs);
      await sendRequest();
      
      // Show success notification and navigate
      showSuccess("Item added to cart successfully!");
      history("/cartdetails");
    } catch (error) {
      console.error("Error adding item to cart:", error);
      showError("Failed to add item to cart. Please try again.");
      setIsLoading(false);
    }
  };

  const sendRequest = async () => {
    await axios
      .post("http://localhost:5000/carts", {
        quantity: Number(inputs.quantity),
        weight: String(inputs.weight),
        form: String(inputs.form),
        notes: String(inputs.notes),
      })
      .then((res) => res.data);
  };

  const handleReset = () => {
    setInputs({
      quantity: "",
      weight: "",
      form: "",
      notes: "",
    });
    setErrors({});
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

  return (
    <div className="add-cart-container">
      <div className="add-cart-wrapper">
        {/* Header Section */}
        <div className="add-cart-header">
          <div className="header-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <path d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.7 15.3C4.3 15.7 4.6 16.5 5.1 16.5H17M17 13V17C17 18.1 16.1 19 15 19H9C7.9 19 7 18.1 7 17V13M17 13H7" 
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="add-cart-title">Add Herbal Product to Cart</h1>
          <p className="add-cart-subtitle">Select your preferred herbal remedy and customize your order</p>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="add-cart-form">
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

          {/* Form Field with Dropdown */}
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
              className="btn-secondary"
              onClick={handleReset}
              disabled={isLoading}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12Z" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 7V12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Reset Form
            </button>

            <button 
              type="submit" 
              className="btn-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="loading-spinner"></div>
                  Adding...
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.7 15.3C4.3 15.7 4.6 16.5 5.1 16.5H17M17 13V17C17 18.1 16.1 19 15 19H9C7.9 19 7 18.1 7 17V13M17 13H7" 
                          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Add to Cart
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
              <p>Contact our herbal specialists for product recommendations</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddCart;