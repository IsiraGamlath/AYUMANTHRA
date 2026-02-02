import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const DoctorNotifications = ({ doctorId }) => {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // All inline styles
  const styles = {
    container: {
      maxWidth: '800px',
      margin: '0 auto',
      padding: '20px',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    },
    notificationsHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '30px',
      flexWrap: 'wrap',
      gap: '15px'
    },
    headerH2: {
      color: '#ffffff',
      margin: '0'
    },
    notificationControls: {
      display: 'flex',
      gap: '10px',
      alignItems: 'center'
    },
    btn: {
      padding: '8px 16px',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
      fontWeight: 'bold',
      transition: 'background-color 0.3s ease'
    },
    btnPrimary: {
      backgroundColor: '#3498db',
      color: 'white'
    },
    btnSecondary: {
      backgroundColor: '#95a5a6',
      color: 'white'
    },
    btnDisabled: {
      backgroundColor: '#bdc3c7',
      cursor: 'not-allowed'
    },
    unreadBadge: {
      backgroundColor: '#e74c3c',
      color: 'white',
      padding: '5px 10px',
      borderRadius: '12px',
      fontSize: '0.9rem',
      fontWeight: 'bold'
    },
    loading: {
      textAlign: 'center',
      padding: '40px',
      color: '#7f8c8d',
      fontStyle: 'italic'
    },
    noNotifications: {
      textAlign: 'center',
      padding: '60px 20px',
      backgroundColor: '#f8f9fa',
      borderRadius: '10px'
    },
    noNotificationsIcon: {
      fontSize: '4rem',
      marginBottom: '20px'
    },
    noNotificationsH3: {
      color: '#2c3e50',
      marginBottom: '10px'
    },
    noNotificationsP: {
      color: '#7f8c8d'
    },
    notificationsList: {
      marginBottom: '40px'
    },
    notificationItem: {
      background: 'white',
      borderRadius: '8px',
      padding: '20px',
      marginBottom: '15px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      display: 'flex',
      alignItems: 'flex-start',
      cursor: 'pointer',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      position: 'relative',
      borderLeft: '4px solid #3498db'
    },
    notificationItemUnread: {
      backgroundColor: '#e8f4fc',
      borderLeftColor: '#e74c3c'
    },
    notificationIcon: {
      fontSize: '1.5rem',
      marginRight: '15px',
      marginTop: '3px'
    },
    notificationContent: {
      flex: '1'
    },
    notificationContentH4: {
      margin: '0 0 8px 0',
      color: '#2c3e50'
    },
    notificationContentP: {
      margin: '0 0 10px 0',
      color: '#34495e',
      lineHeight: '1.5'
    },
    notificationTime: {
      fontSize: '0.85rem',
      color: '#7f8c8d'
    },
    unreadIndicator: {
      position: 'absolute',
      top: '15px',
      right: '15px',
      width: '12px',
      height: '12px',
      backgroundColor: '#e74c3c',
      borderRadius: '50%'
    },
    autoReminderInfo: {
      backgroundColor: '#f8f9fa',
      borderRadius: '10px',
      padding: '25px'
    },
    infoCardH3: {
      color: '#2c3e50',
      marginTop: '0',
      marginBottom: '20px',
      textAlign: 'center'
    },
    reminderSchedule: {
      display: 'flex',
      justifyContent: 'space-around',
      flexWrap: 'wrap',
      gap: '20px',
      marginBottom: '20px'
    },
    reminderItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      backgroundColor: 'white',
      padding: '15px',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      flex: '1',
      minWidth: '200px'
    },
    reminderIcon: {
      fontSize: '1.5rem'
    },
    reminderNote: {
      textAlign: 'center',
      color: '#7f8c8d',
      fontStyle: 'italic',
      margin: '0'
    }
  };

  useEffect(() => {
    const storedDoctorId = typeof window !== 'undefined' ? localStorage.getItem('doctorId') : null;
    const actualDoctorId = storedDoctorId || user?._id || doctorId;
    console.log('🔍 DoctorNotifications -> isAuthenticated:', isAuthenticated);
    console.log('🔍 DoctorNotifications -> user:', user);
    console.log('🔍 DoctorNotifications -> resolved doctorId:', actualDoctorId);
    if (actualDoctorId) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 5000);
      return () => clearInterval(interval);
    }
  }, [user, doctorId, isAuthenticated]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const storedDoctorId = typeof window !== 'undefined' ? localStorage.getItem('doctorId') : null;
      const actualDoctorId = storedDoctorId || user?._id || doctorId;
      console.log('🔗 Fetching doctor notifications for:', actualDoctorId);
      const { data } = await axios.get(`http://localhost:5000/api/appointment/doctor/notifications?doctorId=${actualDoctorId}`);
      console.log('📬 Doctor notifications count:', data?.notifications?.length || 0);
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.put(`http://localhost:5000/api/appointment/doctor/notifications/${notificationId}/read`);
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const storedDoctorId = typeof window !== 'undefined' ? localStorage.getItem('doctorId') : null;
      const actualDoctorId = storedDoctorId || user?._id || doctorId;
      await axios.put(`http://localhost:5000/api/appointment/doctor/notifications/mark-all-read?doctorId=${actualDoctorId}`);
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
    <div style={styles.container}>
      <div style={styles.notificationsHeader}>
        <h2 style={styles.headerH2}>📱 My Notifications</h2>
        <div style={styles.notificationControls}>
          {unreadCount > 0 && (
            <span style={styles.unreadBadge}>{unreadCount} unread</span>
          )}
          {notifications.length > 0 && (
            <button 
              style={{...styles.btn, ...styles.btnSecondary}}
              onClick={markAllAsRead}
              onMouseOver={(e) => e.target.style.backgroundColor = '#7f8c8d'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#95a5a6'}
            >
              Mark All Read
            </button>
          )}
          <button 
            style={{...styles.btn, ...(loading ? {...styles.btnPrimary, ...styles.btnDisabled} : styles.btnPrimary)}}
            onClick={fetchNotifications}
            disabled={loading}
            onMouseOver={(e) => !loading && (e.target.style.backgroundColor = '#2980b9')}
            onMouseOut={(e) => !loading && (e.target.style.backgroundColor = '#3498db')}
          >
            {loading ? '🔄' : '🔄'} Refresh
          </button>
        </div>
      </div>

      {loading && notifications.length === 0 ? (
        <div style={styles.loading}>Loading your notifications...</div>
      ) : notifications.length === 0 ? (
        <div style={styles.noNotifications}>
          <div style={styles.noNotificationsIcon}>📭</div>
          <h3 style={styles.noNotificationsH3}>No Notifications Yet</h3>
          <p style={styles.noNotificationsP}>You'll see appointment reminders and updates here.</p>
        </div>
      ) : (
        <div style={styles.notificationsList}>
          {notifications.map((notification) => (
            <div 
              key={notification._id} 
              style={notification.isRead ? styles.notificationItem : {...styles.notificationItem, ...styles.notificationItemUnread}}
              onClick={() => !notification.isRead && markAsRead(notification._id)}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
              }}
            >
              <div style={styles.notificationIcon}>
                {getNotificationIcon(notification.type)}
              </div>
              <div style={styles.notificationContent}>
                <h4 style={styles.notificationContentH4}>{notification.title}</h4>
                <p style={styles.notificationContentP}>{notification.message}</p>
                <div style={styles.notificationTime}>
                  {formatTime(notification.createdAt)}
                </div>
              </div>
              {!notification.isRead && (
                <div style={styles.unreadIndicator}></div>
              )}
            </div>
          ))}
        </div>
      )}

      <div style={styles.autoReminderInfo}>
        <div>
          <h3 style={styles.infoCardH3}>🔔 Automatic Reminders</h3>
          <div style={styles.reminderSchedule}>
            <div style={styles.reminderItem}>
              <span style={styles.reminderIcon}>📅</span>
              <span>1 day before appointment</span>
            </div>
            <div style={styles.reminderItem}>
              <span style={styles.reminderIcon}>⏰</span>
              <span>2 hours before appointment</span>
            </div>
          </div>
          <p style={styles.reminderNote}>
            💡 You'll automatically receive all notifications here in your notification center
          </p>
        </div>
      </div>
    </div>
  );
};

export default DoctorNotifications;