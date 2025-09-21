import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import Nav from "../Nav/Nav";
import { useNotification } from '../../contexts/NotificationContext';
import './DeliveryTrackingSystem.css';

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
    const fetchCarts = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get('http://localhost:5000/carts');
        const carts = res.data?.carts || [];
        // Map backend carts to orders shape expected by UI
        const mapped = carts.map((c) => ({
          id: c._id,
          customerName: c.customerName || 'Customer',
          customerEmail: c.customerEmail || '',
          items: c.items || [c.form ? `${c.form}` : 'Item'],
          totalAmount: c.totalAmount || 0,
          orderDate: c.orderDate || '',
          currentStatus: c.currentStatus || 'placed',
          estimatedDelivery: c.estimatedDelivery || '',
          trackingNumber: c.trackingNumber || c._id,
          address: c.address || '',
          statusHistory: Array.isArray(c.statusHistory) ? c.statusHistory : [],
        }));
        setOrders(mapped);
      } catch (e) {
        console.error('Failed to load carts', e);
        showError('Error loading tracking data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchCarts();
  }, [showError]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const fromQuery = params.get('orderId') || params.get('tracking') || '';
    if (fromQuery) {
      setSelectedOrderId(fromQuery);
      const found = orders.find(o => (o.id && o.id.includes(fromQuery)) || (o.trackingNumber && o.trackingNumber.includes(fromQuery)));
      if (found) {
        setSelectedOrderId(found.id);
        setCurrentView('customer');
      }
    }
  }, [location.search, orders]);

  const statusConfig = {
    placed: { label: 'Order Placed', icon: Package, colorHex: '#2563eb', bgHex: '#dbeafe' },
    packed: { label: 'Packed', icon: Package, colorHex: '#ea580c', bgHex: '#ffedd5' },
    shipped: { label: 'Shipped', icon: Truck, colorHex: '#7c3aed', bgHex: '#ede9fe' },
    out_for_delivery: { label: 'Out for Delivery', icon: MapPin, colorHex: '#ca8a04', bgHex: '#fef9c3' },
    delivered: { label: 'Delivered', icon: CheckCircle, colorHex: '#16a34a', bgHex: '#dcfce7' }
  };

  const statusOrder = ['placed', 'packed', 'shipped', 'out_for_delivery', 'delivered'];

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
      await axios.patch(`http://localhost:5000/carts/${orderId}/status`, {
        newStatus,
        note
      });
      showSuccess('Order status updated successfully!');
    } catch (e) {
      console.error('Failed to update status', e);
      showError('Failed to update order status. Please try again.');
      // On failure, refetch to sync
      try {
        const res = await axios.get('http://localhost:5000/carts');
        const carts = res.data?.carts || [];
        const mapped = carts.map((c) => ({
          id: c._id,
          customerName: c.customerName || 'Customer',
          customerEmail: c.customerEmail || '',
          items: c.items || [c.form ? `${c.form}` : 'Item'],
          totalAmount: c.totalAmount || 0,
          orderDate: c.orderDate || '',
          currentStatus: c.currentStatus || 'placed',
          estimatedDelivery: c.estimatedDelivery || '',
          trackingNumber: c.trackingNumber || c._id,
          address: c.address || '',
          statusHistory: Array.isArray(c.statusHistory) ? c.statusHistory : [],
        }));
        setOrders(mapped);
      } catch (refetchErr) {
        console.error('Failed to refetch after status update error', refetchErr);
      }
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
        <Nav />
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
      <Nav />
      
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
