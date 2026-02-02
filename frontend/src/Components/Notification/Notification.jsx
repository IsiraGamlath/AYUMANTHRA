import React, { useState, useEffect } from 'react';


const Notification = ({ message, type = 'info', duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onClose) onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [message, duration, onClose]);

  if (!isVisible || !message) return null;

  return (
    <div className={`notification notification-${type}`}>
      <style>
      {
        `.notification {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 10000;
  max-width: 400px;
  min-width: 300px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: slideIn 0.3s ease-out;
  border-left: 4px solid #4a7c59;
}

.notification-info {
  border-left-color: #2563eb;
}

.notification-success {
  border-left-color: #16a34a;
}

.notification-warning {
  border-left-color: #ea580c;
}

.notification-error {
  border-left-color: #dc2626;
}

.notification-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
}

.notification-message {
  color: #333;
  font-size: 14px;
  line-height: 1.4;
  flex: 1;
  margin-right: 12px;
}

.notification-close {
  background: none;
  border: none;
  font-size: 20px;
  color: #666;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.notification-close:hover {
  background-color: #f3f4f6;
  color: #333;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideOut {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}

.notification.slide-out {
  animation: slideOut 0.3s ease-in forwards;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .notification {
    top: 10px;
    right: 10px;
    left: 10px;
    max-width: none;
    min-width: auto;
  }
}
        `
      }
    </style>
      <div className="notification-content">
        <span className="notification-message">{message}</span>
        <button 
          className="notification-close" 
          onClick={() => {
            setIsVisible(false);
            if (onClose) onClose();
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default Notification;
