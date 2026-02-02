import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

import { useNotification } from '../../contexts/NotificationContext';


// Inline lightweight icons to avoid external dependency
const makeIcon = (d) => ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d={d} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Package = makeIcon("M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16zM3.27 7.96L12 13l8.73-5.04M12 22V13");
const Truck = makeIcon("M3 7h11v7H3zM14 10h4l3 3v4h-3M5 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm12 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4z");
const CheckCircle = makeIcon("M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4L12 14.01l-3-3");
const MapPin = makeIcon("M21 10c0 5.25-9 12-9 12S3 15.25 3 10a9 9 0 1 1 18 0zM12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z");
const Edit = makeIcon("M12 20h9M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z");
const X = makeIcon("M18 6 6 18M6 6l12 12");

const DeliveryTrackingSystem = () => {
  // Load real orders from backend
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showError, showSuccess, showWarning } = useNotification();

  const location = useLocation();
  const [currentView, setCurrentView] = useState('customer'); // 'customer' or 'admin'
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [editingOrder, setEditingOrder] = useState(null);
  const [newStatusNote, setNewStatusNote] = useState('');

  useEffect(() => {
  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get('http://localhost:5000/orders');
      const ordersList = res.data?.orders || [];
      
      // Map orders to the format expected by UI
      const mapped = ordersList.map((o) => ({
        id: o._id,
        orderId: o.orderId,
        customerName: `${o.customerInfo?.firstName} ${o.customerInfo?.lastName}`,
        customerEmail: o.customerInfo?.email || '',
        items: o.items?.map(item => item.productName) || [],
        totalAmount: o.totals?.total || 0,
        orderDate: new Date(o.orderDate).toLocaleDateString(),
        currentStatus: o.orderStatus || 'pending',
        estimatedDelivery: o.estimatedDelivery || 'TBD',
        trackingNumber: o.trackingNumbers?.[0] || o.orderId,
        address: `${o.customerInfo?.address}, ${o.customerInfo?.city}, ${o.customerInfo?.province}`,
        statusHistory: Array.isArray(o.statusHistory) ? o.statusHistory : [],
      }));
      setOrders(mapped);
    } catch (e) {
      console.error('Failed to load orders', e);
      showError('Error loading tracking data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  fetchOrders();
}, [showError]);

  useEffect(() => {
  const params = new URLSearchParams(location.search);
  const fromQuery = params.get('orderId') || params.get('tracking') || '';
  if (fromQuery) {
    const found = orders.find(o => 
      (o.id && o.id.includes(fromQuery)) || 
      (o.trackingNumber && o.trackingNumber.includes(fromQuery)) ||
      o.trackingNumber === fromQuery ||
      (o.orderId && o.orderId === fromQuery)
    );
    if (found) {
      setSelectedOrderId(found.id);
      setCurrentView('customer');
    } else {
      setSelectedOrderId(fromQuery);
    }
  }
}, [location.search, orders]);

  const statusConfig = {
  pending: { label: 'Order Pending', icon: Package, colorHex: '#6b7280', bgHex: '#f3f4f6' },
  processing: { label: 'Processing', icon: Package, colorHex: '#f59e0b', bgHex: '#fef3c7' },
  placed: { label: 'Order Placed', icon: Package, colorHex: '#2563eb', bgHex: '#dbeafe' },
  packed: { label: 'Packed', icon: Package, colorHex: '#ea580c', bgHex: '#ffedd5' },
  shipped: { label: 'Shipped', icon: Truck, colorHex: '#7c3aed', bgHex: '#ede9fe' },
  out_for_delivery: { label: 'Out for Delivery', icon: MapPin, colorHex: '#ca8a04', bgHex: '#fef9c3' },
  delivered: { label: 'Delivered', icon: CheckCircle, colorHex: '#16a34a', bgHex: '#dcfce7' }
};

  const statusOrder = ['pending', 'processing', 'placed', 'packed', 'shipped', 'out_for_delivery', 'delivered'];

  const updateOrderStatus = async (orderId, newStatus, note = '') => {
  // Optimistic update
  setOrders(prev => prev.map(order => {
    if (order.id === orderId) {
      const timestamp = new Date().toLocaleString();
      return {
        ...order,
        currentStatus: newStatus,
        statusHistory: [
          ...order.statusHistory,
          { status: newStatus, timestamp, note: note || statusConfig[newStatus].label }
        ]
      };
    }
    return order;
  }));

  try {
    await axios.put(`http://localhost:5000/orders/${orderId}/status`, {
      orderStatus: newStatus
    });
    showSuccess('Order status updated successfully!');
  } catch (e) {
    console.error('Failed to update status', e);
    showError('Failed to update order status. Please try again.');
  }
};
  const getStatusProgress = (currentStatus) => {
    const currentIndex = statusOrder.indexOf(currentStatus);
    return ((currentIndex + 1) / statusOrder.length) * 100;
  };

  const TrackingProgressBar = ({ order }) => {
    const currentIndex = statusOrder.indexOf(order.currentStatus);

    return (
      <div className="tracking-progress-container">
        <div className="progress-steps">
          {statusOrder.map((status, index) => {
            const config = statusConfig[status];
            const Icon = config.icon;
            const isCompleted = index <= currentIndex;
            const isCurrent = index === currentIndex;
            
            return (
              <div key={status} className="progress-step">
                <div className={`step-dot ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}>
                  <Icon size={20} />
                </div>
                <span className={`step-label ${isCompleted ? 'completed' : ''}`}>
                  {config.label}
                </span>
              </div>
            );
          })}
        </div>
        <div className="progress-bar-wrapper">
          <div className="progress-bar-bg"></div>
          <div 
            className="progress-bar-fill" 
            style={{ width: `${getStatusProgress(order.currentStatus)}%` }}
          ></div>
        </div>
      </div>
    );
  };

  const CustomerTrackingView = () => {
    const selectedOrder = orders.find(order => order.id === selectedOrderId);

    return (
      <div className="customer-tracking-container">
        <style>
          {`
          /* DeliveryTrackingSystem.css - Modern Herbal Style */

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.tracking-system-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f0f9f0 0%, #e8f5e8 100%);
  font-family: 'Segoe UI', 'Arial', sans-serif;
}

/* Loading State */
.loading-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 70vh;
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

/* System Header */
.tracking-system-header {
  background: linear-gradient(135deg, #ffffff 0%, #f8fdf8 100%);
  border-bottom: 3px solid #4a7c59;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 30px 40px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1400px;
  margin: 0 auto;
}

.system-title {
  color: #2d5016;
  font-size: 2.2rem;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.view-toggle-section {
  display: flex;
  background: #f0f8f0;
  border-radius: 12px;
  padding: 6px;
  gap: 4px;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
}

.view-toggle-btn {
  background: transparent;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1rem;
  font-weight: 600;
  color: #4a7c59;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.view-toggle-btn.active {
  background: linear-gradient(135deg, #4a7c59 0%, #5a8f6b 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(74, 124, 89, 0.3);
}

.view-toggle-btn:hover:not(.active) {
  background: #e8f5e8;
  transform: translateY(-1px);
}

/* Customer Tracking View */
.customer-tracking-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 40px 30px;
}

.tracking-header {
  text-align: center;
  margin-bottom: 40px;
}

.header-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);
  border-radius: 50%;
  margin-bottom: 20px;
  box-shadow: 0 8px 25px rgba(23, 162, 184, 0.3);
  color: white;
}

.header-icon.admin {
  background: linear-gradient(135deg, #ffc107 0%, #e0a800 100%);
  box-shadow: 0 8px 25px rgba(255, 193, 7, 0.3);
  color: #212529;
}

.tracking-title {
  color: #2d5016;
  font-size: 2.2rem;
  font-weight: 700;
  margin-bottom: 10px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.tracking-subtitle {
  color: #666;
  font-size: 1.1rem;
  line-height: 1.5;
}

/* Search Section */
.search-input-group {
  display: flex;
  gap: 15px;
  align-items: stretch;
}

.search-input {
  flex: 1;
  background: linear-gradient(135deg, #ffffff 0%, #fafafa 100%);
  border: 2px solid #e0e6e0;
  border-radius: 12px;
  padding: 16px 20px;
  font-size: 1rem;
  color: #333;
  transition: all 0.3s ease;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.06);
}

.search-input:focus {
  outline: none;
  border-color: #4a7c59;
  box-shadow: 
    inset 0 2px 4px rgba(0, 0, 0, 0.06),
    0 0 0 4px rgba(74, 124, 89, 0.15);
  background: #ffffff;
  transform: translateY(-1px);
}

.search-button {
  background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);
  color: white;
  border: none;
  padding: 16px 24px;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 6px 20px rgba(23, 162, 184, 0.3);
  text-transform: uppercase;
  letter-spacing: 0.8px;
  min-width: 140px;
  justify-content: center;
}

.search-button:hover {
  background: linear-gradient(135deg, #138496 0%, #10707f 100%);
  box-shadow: 0 8px 25px rgba(23, 162, 184, 0.4);
  transform: translateY(-2px);
}

/* Order Details Card */
.order-details-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8fdf8 100%);
  border-radius: 20px;
  padding: 0;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.1);
  border: 2px solid #f0f8f0;
  overflow: hidden;
  position: relative;
}

.order-details-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 6px;
  background: linear-gradient(90deg, #4a7c59, #6ab04c, #4a7c59);
}

.order-info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  padding: 40px 30px 30px 30px;
}

.order-details-section,
.delivery-info-section {
  background: linear-gradient(135deg, #f8fdf8 0%, #f0f9f0 100%);
  border-radius: 12px;
  padding: 25px;
  border-left: 4px solid #4a7c59;
}

.section-title {
  color: #2d5016;
  font-size: 1.3rem;
  font-weight: 700;
  margin-bottom: 20px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid rgba(74, 124, 89, 0.1);
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  color: #4a7c59;
  font-weight: 600;
  font-size: 0.95rem;
}

.info-value {
  color: #333;
  font-weight: 500;
  font-size: 1rem;
  text-align: right;
  max-width: 60%;
}

.info-value.address {
  text-align: right;
  line-height: 1.4;
}

.current-status {
  margin-top: 15px;
  text-align: center;
}

.status-badge {
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: inline-block;
}

.status-badge.status-placed {
  background: #dbeafe;
  color: #2563eb;
  border: 2px solid #2563eb;
}

.status-badge.status-packed {
  background: #ffedd5;
  color: #ea580c;
  border: 2px solid #ea580c;
}

.status-badge.status-shipped {
  background: #ede9fe;
  color: #7c3aed;
  border: 2px solid #7c3aed;
}

.status-badge.status-out_for_delivery {
  background: #fef9c3;
  color: #ca8a04;
  border: 2px solid #ca8a04;
}

.status-badge.status-delivered {
  background: #dcfce7;
  color: #16a34a;
  border: 2px solid #16a34a;
}
  .status-badge.status-pending {
  background: #f3f4f6;
  color: #6b7280;
  border: 2px solid #6b7280;
}

.status-badge.status-processing {
  background: #fef3c7;
  color: #f59e0b;
  border: 2px solid #f59e0b;
}

.history-icon.status-pending {
  background: #f3f4f6;
  color: #6b7280;
}

.history-icon.status-processing {
  background: #fef3c7;
  color: #f59e0b;
}

/* Tracking Progress Bar */
.tracking-progress-container {
  margin: 30px;
  padding: 30px;
  background: linear-gradient(135deg, #f0f8f0 0%, #e8f5e8 100%);
  border-radius: 16px;
  border: 1px solid #d4edda;
}

.progress-steps {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  position: relative;
}

.progress-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  text-align: center;
}

.step-dot {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  background: #e5e7eb;
  color: #9ca3af;
  transition: all 0.3s ease;
  border: 3px solid transparent;
}

.step-dot.completed {
  background: linear-gradient(135deg, #4a7c59 0%, #5a8f6b 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(74, 124, 89, 0.3);
}

.step-dot.current {
  border-color: #6ab04c;
  box-shadow: 0 0 0 4px rgba(106, 176, 76, 0.2);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.step-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.step-label.completed {
  color: #4a7c59;
}

.progress-bar-wrapper {
  position: relative;
  height: 8px;
}

.progress-bar-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #e5e7eb;
  border-radius: 4px;
}

.progress-bar-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: linear-gradient(90deg, #4a7c59, #6ab04c);
  border-radius: 4px;
  transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Order History */
.order-history-section {
  padding: 30px;
  border-top: 1px solid #e8f0e8;
}

.history-timeline {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.history-item {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  padding: 20px;
  background: linear-gradient(135deg, #ffffff 0%, #f8fdf8 100%);
  border-radius: 12px;
  border-left: 4px solid #4a7c59;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.history-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.history-icon.status-placed {
  background: #dbeafe;
  color: #2563eb;
}

.history-icon.status-packed {
  background: #ffedd5;
  color: #ea580c;
}

.history-icon.status-shipped {
  background: #ede9fe;
  color: #7c3aed;
}

.history-icon.status-out_for_delivery {
  background: #fef9c3;
  color: #ca8a04;
}

.history-icon.status-delivered {
  background: #dcfce7;
  color: #16a34a;
}

.history-content {
  flex: 1;
}

.history-title {
  color: #2d5016;
  font-weight: 700;
  font-size: 1.1rem;
  margin-bottom: 4px;
}

.history-note {
  color: #666;
  font-size: 0.95rem;
  margin-bottom: 4px;
  line-height: 1.4;
}

.history-timestamp {
  color: #999;
  font-size: 0.85rem;
  font-weight: 500;
}

/* No Order Found */
.no-order-found {
  text-align: center;
  padding: 60px 30px;
  background: linear-gradient(135deg, #ffffff 0%, #f8fdf8 100%);
  border-radius: 16px;
  border: 2px dashed #4a7c59;
  color: #4a7c59;
}

.no-order-found svg {
  margin-bottom: 20px;
  color: #4a7c59;
}

.no-order-found h3 {
  color: #2d5016;
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 10px;
}

.no-order-found p {
  color: #666;
  font-size: 1rem;
}

/* Admin Management View */
.admin-tracking-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 30px;
}

.admin-header {
  text-align: center;
  margin-bottom: 40px;
}

.admin-title {
  color: #2d5016;
  font-size: 2.2rem;
  font-weight: 700;
  margin-bottom: 10px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.admin-subtitle {
  color: #666;
  font-size: 1.1rem;
}

.orders-grid {
  display: grid;
  gap: 25px;
}

.admin-order-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8fdf8 100%);
  border-radius: 16px;
  padding: 0;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
  border: 2px solid #f0f8f0;
  overflow: hidden;
  position: relative;
  transition: all 0.3s ease;
}

.admin-order-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #4a7c59, #6ab04c, #4a7c59);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.admin-order-card:hover::before {
  opacity: 1;
}

.admin-order-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.12);
}

.order-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 25px 30px 20px 30px;
  background: linear-gradient(135deg, #f8fdf8 0%, #f0f9f0 100%);
  border-bottom: 1px solid #e8f0e8;
}

.order-card-info h3.order-id {
  color: #2d5016;
  font-size: 1.3rem;
  font-weight: 700;
  margin-bottom: 6px;
  font-family: 'Courier New', monospace;
}

.customer-info {
  color: #666;
  font-size: 0.95rem;
  font-weight: 500;
}

.order-card-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.edit-button {
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
  color: white;
  border: none;
  padding: 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
}

.edit-button:hover {
  background: linear-gradient(135deg, #0056b3 0%, #004085 100%);
  box-shadow: 0 6px 18px rgba(0, 123, 255, 0.4);
  transform: translateY(-2px);
}

.order-card-details {
  padding: 20px 30px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-label {
  color: #4a7c59;
  font-weight: 600;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-value {
  color: #333;
  font-weight: 500;
  font-size: 1rem;
}

/* Edit Status Section */
.edit-status-section {
  margin: 20px 30px 30px 30px;
  padding: 25px;
  background: linear-gradient(135deg, #f0f8f0 0%, #e8f5e8 100%);
  border-radius: 12px;
  border: 1px solid #d4edda;
}

.edit-title {
  color: #2d5016;
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 15px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 15px;
}

.status-update-btn {
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-update-btn.current {
  background: linear-gradient(135deg, #4a7c59 0%, #5a8f6b 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(74, 124, 89, 0.3);
}

.status-update-btn.can-update {
  background: #e5e7eb;
  color: #374151;
}

.status-update-btn.can-update:hover {
  background: linear-gradient(135deg, #d1d5db 0%, #e5e7eb 100%);
  transform: translateY(-1px);
}

.status-update-btn.disabled {
  background: #f3f4f6;
  color: #9ca3af;
  cursor: not-allowed;
}

.note-input-section {
  display: flex;
  gap: 10px;
  align-items: center;
}

.note-input {
  flex: 1;
  background: white;
  border: 2px solid #e0e6e0;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 0.95rem;
  color: #333;
  transition: all 0.3s ease;
}

.note-input:focus {
  outline: none;
  border-color: #4a7c59;
  box-shadow: 0 0 0 3px rgba(74, 124, 89, 0.15);
}

.close-edit-btn {
  background: #dc3545;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.close-edit-btn:hover {
  background: #c82333;
  transform: translateY(-1px);
}

/* Order History Details */
.order-history-details {
  margin: 20px 30px 30px 30px;
  font-size: 0.95rem;
}

.history-summary {
  color: #2d5016;
  font-weight: 700;
  cursor: pointer;
  padding: 10px 0;
  border-bottom: 1px solid #e8f0e8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.history-summary:hover {
  color: #4a7c59;
}

.history-list {
  margin-top: 15px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.history-entry {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: white;
  border-radius: 8px;
  border-left: 3px solid #4a7c59;
}

.history-main {
  flex: 1;
}

.history-status {
  font-weight: 600;
  color: #2d5016;
}

.history-note-text {
  color: #666;
}

.history-time {
  color: #999;
  font-size: 0.85rem;
  font-weight: 500;
}

/* No Orders */
.no-orders {
  text-align: center;
  padding: 80px 40px;
  background: linear-gradient(135deg, #ffffff 0%, #f8fdf8 100%);
  border-radius: 20px;
  border: 3px dashed #4a7c59;
  color: #4a7c59;
}

.no-orders svg {
  margin-bottom: 25px;
}

.no-orders h3 {
  color: #2d5016;
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 15px;
}

.no-orders p {
  color: #666;
  font-size: 1.1rem;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .order-info-grid,
  .order-card-details {
    grid-template-columns: 1fr;
    gap: 20px;
  }
}

@media (max-width: 768px) {
  .tracking-system-header {
    padding: 25px 20px;
  }
  
  .header-content {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }
  
  .system-title {
    font-size: 1.8rem;
  }
  
  .view-toggle-section {
    width: 100%;
  }
  
  .view-toggle-btn {
    flex: 1;
    justify-content: center;
  }
  
  .customer-tracking-container,
  .admin-tracking-container {
    padding: 30px 20px;
  }
  
  .tracking-title,
  .admin-title {
    font-size: 1.8rem;
  }
  
  .search-input-group {
    flex-direction: column;
    gap: 12px;
  }
  
  .search-button {
    min-width: auto;
  }
  
  .order-card-header {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }
  
  .order-card-actions {
    align-self: stretch;
    justify-content: space-between;
  }
  
  .progress-steps {
    flex-direction: column;
    gap: 20px;
  }
  
  .step-dot {
    width: 40px;
    height: 40px;
  }
  
  .progress-bar-wrapper {
    display: none;
  }
}

@media (max-width: 480px) {
  .tracking-system-header {
    padding: 20px 15px;
  }
  
  .system-title {
    font-size: 1.5rem;
  }
  
  .customer-tracking-container,
  .admin-tracking-container {
    padding: 25px 15px;
  }
  
  .search-section,
  .order-details-card,
  .admin-order-card {
    padding: 20px 15px;
  }
  
  .order-info-grid {
    padding: 30px 20px 20px 20px;
  }
  
  .tracking-progress-container {
    margin: 20px 15px;
    padding: 20px 15px;
  }
  
  .order-history-section {
    padding: 20px 15px;
  }
  
  .status-buttons {
    flex-direction: column;
    gap: 6px;
  }
  
  .status-update-btn {
    width: 100%;
    text-align: center;
  }
}section {
  background: linear-gradient(135deg, #ffffff 0%, #f8fdf8 100%);
  border-radius: 16px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
  border: 2px solid #f0f8f0;
}

.search-label {
  display: block;
  color: #2d5016;
  font-weight: 600;
  font-size: 1.1rem;
  margin-bottom: 15px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}


          `}
        </style>
        <div className="tracking-header">
          <div className="header-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <path d="M21 10c0 5.25-9 12-9 12S3 15.25 3 10a9 9 0 1 1 18 0z" 
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
          <h2 className="tracking-title">Track Your Herbal Order</h2>
          <p className="tracking-subtitle">Monitor your natural wellness products delivery</p>
        </div>
        
        <div className="search-section">
          <label className="search-label">
            Enter Order ID or Tracking Number
          </label>
          <div className="search-input-group">
            <input
              type="text"
              value={selectedOrderId}
              onChange={(e) => setSelectedOrderId(e.target.value)}
              placeholder="e.g., Order ID or Tracking Number"
              className="search-input"
            />
            <button 
              onClick={() => {
                const found = orders.find(o => 
                  (o.id && o.id.includes(selectedOrderId)) || (o.trackingNumber && o.trackingNumber.includes(selectedOrderId))
                );
                if (found) {
                  setSelectedOrderId(found.id);
                } else {
                  showWarning('Order not found. Please check your Order ID or Tracking Number.');
                }
              }}
              className="search-button"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Track Order
            </button>
          </div>
        </div>

        {selectedOrder && (
          <div className="order-details-card">
            <div className="order-info-grid">
              <div className="order-details-section">
                <h3 className="section-title">Order Details</h3>
                <div className="info-list">
                  <div className="info-item">
                    <span className="info-label">Order ID:</span>
                    <span className="info-value">{selectedOrder.id?.slice(-8) || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Tracking Number:</span>
                    <span className="info-value">{selectedOrder.trackingNumber?.slice(-8) || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Order Date:</span>
                    <span className="info-value">{selectedOrder.orderDate || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Items:</span>
                    <span className="info-value">{selectedOrder.items.join(', ') || 'N/A'}</span>
                  </div>
                </div>
              </div>
              
              <div className="delivery-info-section">
                <h3 className="section-title">Delivery Information</h3>
                <div className="info-list">
                  <div className="info-item">
                    <span className="info-label">Estimated Delivery:</span>
                    <span className="info-value">{selectedOrder.estimatedDelivery || 'TBD'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Delivery Address:</span>
                    <span className="info-value address">{selectedOrder.address || 'Address not provided'}</span>
                  </div>
                  <div className="current-status">
                    <span className={`status-badge status-${selectedOrder.currentStatus}`}>
                      {statusConfig[selectedOrder.currentStatus].label}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <TrackingProgressBar order={selectedOrder} />

            <div className="order-history-section">
              <h3 className="section-title">Order History</h3>
              <div className="history-timeline">
                {selectedOrder.statusHistory.map((history, index) => {
                  const config = statusConfig[history.status] || statusConfig.placed;
                  const Icon = config.icon;
                  return (
                    <div key={index} className="history-item">
                      <div className={`history-icon status-${history.status}`}>
                        <Icon size={16} />
                      </div>
                      <div className="history-content">
                        <div className="history-title">{config.label}</div>
                        <div className="history-note">{history.note}</div>
                        <div className="history-timestamp">{history.timestamp}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {!selectedOrder && selectedOrderId && (
          <div className="no-order-found">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="2"/>
              <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" strokeWidth="2"/>
            </svg>
            <h3>Order Not Found</h3>
            <p>Please check your Order ID or Tracking Number and try again.</p>
          </div>
        )}
      </div>
    );
  };

  const AdminManagementView = () => {
    return (
      <div className="admin-tracking-container">
        
        <div className="admin-header">
          <div className="header-icon admin">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" 
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 className="admin-title">Sales Management - Order Tracking</h2>
          <p className="admin-subtitle">Manage and update herbal product deliveries</p>
        </div>
        
        <div className="orders-grid">
          {orders.map((order) => (
            <div key={order.id} className="admin-order-card">
              <div className="order-card-header">
                <div className="order-card-info">
                  <h3 className="order-id">{order.id?.slice(-8) || 'N/A'}</h3>
                  <p className="customer-info">
                    {order.customerName}
                    {order.customerEmail && ` - ${order.customerEmail}`}
                  </p>
                </div>
                <div className="order-card-actions">
                  <span className={`status-badge status-${order.currentStatus}`}>
                    {statusConfig[order.currentStatus].label}
                  </span>
                  <button
                    onClick={() => setEditingOrder(editingOrder === order.id ? null : order.id)}
                    className="edit-button"
                    title="Edit Order Status"
                  >
                    <Edit size={16} />
                  </button>
                </div>
              </div>

              <div className="order-card-details">
                <div className="detail-item">
                  <span className="detail-label">Items:</span>
                  <span className="detail-value">{order.items.join(', ') || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Order Date:</span>
                  <span className="detail-value">{order.orderDate || 'N/A'}</span>
                </div>
              </div>

              <TrackingProgressBar order={order} />

              {editingOrder === order.id && (
                <div className="edit-status-section">
                  <h4 className="edit-title">Update Order Status</h4>
                  <div className="status-buttons">
                    {statusOrder.map((status) => {
                      const config = statusConfig[status];
                      const canUpdate = statusOrder.indexOf(status) >= statusOrder.indexOf(order.currentStatus);
                      
                      return (
                        <button
                          key={status}
                          disabled={!canUpdate && status !== order.currentStatus}
                          onClick={() => {
                            if (status !== order.currentStatus) {
                              updateOrderStatus(order.id, status, newStatusNote);
                              setNewStatusNote('');
                              setEditingOrder(null);
                            }
                          }}
                          className={`status-update-btn ${status === order.currentStatus ? 'current' : ''} ${canUpdate ? 'can-update' : 'disabled'}`}
                        >
                          {config.label}
                        </button>
                      );
                    })}
                  </div>
                  <div className="note-input-section">
                    <input
                      type="text"
                      value={newStatusNote}
                      onChange={(e) => setNewStatusNote(e.target.value)}
                      placeholder="Add a note (optional)"
                      className="note-input"
                    />
                    <button
                      onClick={() => setEditingOrder(null)}
                      className="close-edit-btn"
                      title="Close Editor"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              )}

              <details className="order-history-details">
                <summary className="history-summary">Order History</summary>
                <div className="history-list">
                  {order.statusHistory.map((history, index) => (
                    <div key={index} className="history-entry">
                      <div className="history-main">
                        <span className="history-status">
                          {(statusConfig[history.status] || statusConfig.placed).label}
                        </span>
                        {history.note && (
                          <span className="history-note-text"> - {history.note}</span>
                        )}
                      </div>
                      <span className="history-time">{history.timestamp}</span>
                    </div>
                  ))}
                </div>
              </details>
            </div>
          ))}
        </div>

        {orders.length === 0 && !isLoading && (
          <div className="no-orders">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
              <path d="M3 3h5l5.4 5M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17M17 13v4a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-4m8 0V9a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v4.01" 
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <h3>No Orders Found</h3>
            <p>There are currently no orders to track in the system.</p>
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="tracking-system-container">
        
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <h2>Loading tracking system...</h2>
          <p>Please wait while we fetch order data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tracking-system-container">
      
      
      <div className="tracking-system-header">
        <div className="header-content">
          <h1 className="system-title">Delivery Tracking System</h1>
          <div className="view-toggle-section">
            <button
              onClick={() => setCurrentView('customer')}
              className={`view-toggle-btn ${currentView === 'customer' ? 'active' : ''}`}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
              </svg>
              Customer View
            </button>
            <button
              onClick={() => setCurrentView('admin')}
              className={`view-toggle-btn ${currentView === 'admin' ? 'active' : ''}`}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" 
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Sales Management
            </button>
          </div>
        </div>
      </div>

      {currentView === 'customer' ? <CustomerTrackingView /> : <AdminManagementView />}
       
    </div>
    
  );
};

export default DeliveryTrackingSystem;
