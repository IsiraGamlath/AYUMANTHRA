import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './PatientNotifications.css';

const PatientNotifications = ({ patientId }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (patientId) {
      fetchNotifications();
      // Auto-refresh notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [patientId]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`http://localhost:5000/api/patient/notifications?patientId=${patientId}`);
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.put(`http://localhost:5000/api/patient/notifications/${notificationId}/read`);
      fetchNotifications(); // Refresh to update read status
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put(`http://localhost:5000/api/patient/notifications/mark-all-read?patientId=${patientId}`);
      fetchNotifications();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'booking_confirmation': return '✅';
      case 'reminder_1day': return '📅';
      case 'reminder_2hour': return '⏰';
      case 'cancellation': return '❌';
      case 'reschedule': return '🔄';
      default: return '📱';
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="patient-notifications-container">
      <div className="notifications-header">
        <h2>📱 My Notifications</h2>
        <div className="notification-controls">
          {unreadCount > 0 && (
            <span className="unread-badge">{unreadCount} unread</span>
          )}
          {notifications.length > 0 && (
            <button 
              className="btn btn-secondary"
              onClick={markAllAsRead}
            >
              Mark All Read
            </button>
          )}
          <button 
            className="btn btn-primary"
            onClick={fetchNotifications}
            disabled={loading}
          >
            {loading ? '🔄' : '🔄'} Refresh
          </button>
        </div>
      </div>

      {loading && notifications.length === 0 ? (
        <div className="loading">Loading your notifications...</div>
      ) : notifications.length === 0 ? (
        <div className="no-notifications">
          <div className="no-notifications-icon">📭</div>
          <h3>No Notifications Yet</h3>
          <p>You'll see appointment confirmations, reminders, and updates here.</p>
        </div>
      ) : (
        <div className="notifications-list">
          {notifications.map((notification) => (
            <div 
              key={notification._id} 
              className={`notification-item ${notification.isRead ? 'read' : 'unread'}`}
              onClick={() => !notification.isRead && markAsRead(notification._id)}
            >
              <div className="notification-icon">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="notification-content">
                <h4>{notification.title}</h4>
                <p>{notification.message}</p>
                <div className="notification-time">
                  {formatTime(notification.createdAt)}
                </div>
              </div>
              {!notification.isRead && (
                <div className="unread-indicator"></div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="auto-reminder-info">
        <div className="info-card">
          <h3>🔔 Automatic Reminders</h3>
          <div className="reminder-schedule">
            <div className="reminder-item">
              <span className="reminder-icon">📅</span>
              <span>1 day before appointment</span>
            </div>
            <div className="reminder-item">
              <span className="reminder-icon">⏰</span>
              <span>2 hours before appointment</span>
            </div>
          </div>
          <p className="reminder-note">
            💡 You'll automatically receive all notifications here in your notification center
          </p>
        </div>
      </div>
    </div>
  );
};

export default PatientNotifications;