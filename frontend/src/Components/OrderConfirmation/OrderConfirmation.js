import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AyurvedicNavbar from "../AyurvedicNavbar/AyurvedicNavbar";
import { useNotification } from '../../contexts/NotificationContext';
import './OrderConfirmation.css';

function OrderConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { showWarning } = useNotification();
  
  const { orderId, orderData } = location.state || {};
  const [currentTime] = useState(new Date());

  // Redirect if no order data
  useEffect(() => {
    if (!orderId || !orderData) {
      showWarning('No order data found. Redirecting to products page.');
      setTimeout(() => {
        navigate('/products');
      }, 3000);
    }
  }, [orderId, orderData, navigate, showWarning]);

  const handleContinueShopping = () => {
    navigate('/products');
  };


  const handleViewOrders = () => {
    navigate('/track');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEstimatedDelivery = () => {
    const orderDate = new Date(orderData?.orderDate || currentTime);
    const deliveryDate = new Date(orderDate);
    deliveryDate.setDate(deliveryDate.getDate() + 7);
    
    return deliveryDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getPaymentMethodDisplay = (method) => {
    switch (method) {
      case 'cash_on_delivery':
        return 'Cash on Delivery';
      case 'bank_transfer':
        return 'Bank Transfer';
      case 'credit_card':
        return 'Credit Card';
      case 'debit_card':
        return 'Debit Card';
      default:
        return method;
    }
  };

  if (!orderId || !orderData) {
    return (
      <div className="order-confirmation-page">
        <AyurvedicNavbar />
        <div className="loading-section">
          <div className="loading-spinner"></div>
          <h2>Loading order details...</h2>
          <p>If this takes too long, you will be redirected automatically.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="order-confirmation-page">
     
      
      {/* Success Header */}
      <div className="success-header">
        <div className="success-content">
          <div className="success-icon">
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M9 12l2 2 4-4"/>
            </svg>
          </div>
          <h1>Order Placed Successfully!</h1>
          <p>Thank you for choosing Ayumanthra for your natural wellness needs</p>
          
          <div className="order-number">
            <span className="order-label">Order Number:</span>
            <span className="order-id">#{orderId.slice(-8).toUpperCase()}</span>
          </div>
        </div>
      </div>

      <div className="confirmation-content">
        {/* Main Content */}
        <div className="main-content">
          
          {/* Order Summary */}
          <div className="order-summary-section">
            <h3 className="section-title">Order Summary</h3>
            
            <div className="order-items">
              {orderData.items?.map((item, index) => (
                <div key={index} className="order-item">
                  <div className="item-details">
                    <h4>{item.productName}</h4>
                    <div className="item-specs">
                      {item.weight && <span>Weight: {item.weight}</span>}
                      {item.form && <span>Form: {item.form}</span>}
                      <span>Quantity: {item.quantity}</span>
                    </div>
                    {item.notes && (
                      <div className="item-notes">
                        <strong>Notes:</strong> {item.notes}
                      </div>
                    )}
                  </div>
                  <div className="item-price">
                    Rs {(item.price * item.quantity).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>

            <div className="order-totals">
              <div className="total-row">
                <span>Subtotal ({orderData.totals?.itemCount} items)</span>
                <span>Rs {orderData.totals?.subtotal.toLocaleString()}</span>
              </div>
              <div className="total-row">
                <span>Shipping</span>
                <span>{orderData.totals?.shipping === 0 ? 'Free' : `Rs ${orderData.totals?.shipping.toLocaleString()}`}</span>
              </div>
              <div className="total-row">
                <span>Tax</span>
                <span>Rs {orderData.totals?.tax.toLocaleString()}</span>
              </div>
              <div className="total-row total-final">
                <span>Total Amount</span>
                <span>Rs {orderData.totals?.total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Order Information */}
          <div className="order-info-section">
            <div className="info-grid">
              
              <div className="info-card">
                <div className="info-header">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                    <line x1="1" y1="10" x2="23" y2="10"/>
                  </svg>
                  <h4>Payment Method</h4>
                </div>
                <p>{getPaymentMethodDisplay(orderData.paymentMethod)}</p>
                <span className="status-badge pending">Payment Pending</span>
              </div>

              <div className="info-card">
                <div className="info-header">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  <h4>Delivery Address</h4>
                </div>
                <p>
                  {orderData.customerInfo?.firstName} {orderData.customerInfo?.lastName}<br/>
                  {orderData.customerInfo?.address}<br/>
                  {orderData.customerInfo?.city}, {orderData.customerInfo?.province} {orderData.customerInfo?.postalCode}<br/>
                  {orderData.customerInfo?.country}
                </p>
              </div>

              <div className="info-card">
                <div className="info-header">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12,6 12,12 16,14"/>
                  </svg>
                  <h4>Estimated Delivery</h4>
                </div>
                <p>{getEstimatedDelivery()}</p>
                <span className="status-badge processing">Processing</span>
              </div>

              <div className="info-card">
                <div className="info-header">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14,2 14,8 20,8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                  </svg>
                  <h4>Order Date</h4>
                </div>
                <p>{formatDate(orderData.orderDate)}</p>
                {orderData.orderNotes && (
                  <div className="order-notes-display">
                    <strong>Notes:</strong> {orderData.orderNotes}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Actions Sidebar */}
        <div className="actions-sidebar">
          <div className="actions-card">
            <h3>What's Next?</h3>
            
            <div className="next-steps">
              <div className="step">
                <div className="step-icon">📧</div>
                <div className="step-content">
                  <h4>Confirmation Email</h4>
                  <p>We've sent a confirmation email to {orderData.customerInfo?.email}</p>
                </div>
              </div>

              <div className="step">
                <div className="step-icon">📦</div>
                <div className="step-content">
                  <h4>Order Processing</h4>
                  <p>We'll prepare your herbal products with care and ship them within 1-2 business days</p>
                </div>
              </div>

              <div className="step">
                <div className="step-icon">🚚</div>
                <div className="step-content">
                  <h4>Tracking Available</h4>
                  <p>You'll receive a tracking number once your order ships</p>
                </div>
              </div>
            </div>

            <div className="action-buttons">
              <button className="btn btn-primary" onClick={handleViewOrders}>
                Track Your Order
              </button>
              <button className="btn btn-secondary" onClick={handleContinueShopping}>
                Continue Shopping
              </button>
            </div>

            <div className="support-info">
              <h4>Need Help?</h4>
              <p>Contact our customer support team if you have any questions about your order.</p>
              <div className="contact-details">
                <p>📞 +94 11 234 5678</p>
                <p>📧 support@ayumanthra.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderConfirmation;