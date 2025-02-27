import React from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

const Notifications: React.FC = () => {
  const { notifications, removeNotification } = useApp();

  return (
    <div className="fixed top-24 right-4 z-50 space-y-4">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`flex items-center gap-3 p-4 rounded-lg shadow-lg backdrop-blur-sm animate-slideIn ${
            notification.type === 'success' ? 'bg-green-500/90 text-white' :
            notification.type === 'error' ? 'bg-red-500/90 text-white' :
            'bg-blue-500/90 text-white'
          }`}
        >
          {notification.type === 'success' && <CheckCircle size={20} />}
          {notification.type === 'error' && <AlertCircle size={20} />}
          {notification.type === 'info' && <Info size={20} />}
          <span>{notification.message}</span>
          <button
            onClick={() => removeNotification(notification.id)}
            className="ml-2 hover:opacity-80 transition-opacity"
          >
            <X size={16} />
          </button>
        </div>
      ))}

      <style>
        {`
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

          .animate-slideIn {
            animation: slideIn 0.3s ease-out forwards;
          }
        `}
      </style>
    </div>
  );
};

export default Notifications;