import React, { useEffect } from 'react';
import '../css/Notification.css';

function Notification({ notification, onClose }) {
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [notification, onClose]);

  if (!notification) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': 
      default: return 'ℹ️';
    }
  };

  return (
    <div className={`notification notification-${notification.type}`}>
      <div className="notification-content">
        <span className="notification-icon">
          {getIcon(notification.type)}
        </span>
        <span className="notification-message">
          {notification.message}
        </span>
        <button 
          className="notification-close" 
          onClick={onClose}
          aria-label="Fermer la notification"
        >
          ×
        </button>
      </div>
    </div>
  );
}

export default Notification;