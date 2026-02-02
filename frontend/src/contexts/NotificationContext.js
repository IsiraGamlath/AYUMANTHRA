import React, { createContext, useContext, useState, useCallback } from 'react';
import Notification from '../Components/Notification/Notification';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random();
    setNotifications(prev => [...prev, { id, message, type, duration }]);
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const showSuccess = useCallback((message, duration) => {
    addNotification(message, 'success', duration);
  }, [addNotification]);

  const showError = useCallback((message, duration) => {
    addNotification(message, 'error', duration);
  }, [addNotification]);

  const showWarning = useCallback((message, duration) => {
    addNotification(message, 'warning', duration);
  }, [addNotification]);

  const showInfo = useCallback((message, duration) => {
    addNotification(message, 'info', duration);
  }, [addNotification]);

  return (
    <NotificationContext.Provider value={{
      addNotification,
      removeNotification,
      showSuccess,
      showError,
      showWarning,
      showInfo
    }}>
      {children}
      {notifications.map(notification => (
        <Notification
          key={notification.id}
          message={notification.message}
          type={notification.type}
          duration={notification.duration}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </NotificationContext.Provider>
  );
};
