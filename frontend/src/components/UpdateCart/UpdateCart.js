import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router';
import { useNavigate } from 'react-router';
import Nav from "../Nav/Nav";
import "./UpdateCart.css";

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
        <Nav />
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
      <Nav />
      
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