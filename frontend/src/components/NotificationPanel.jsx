import React, { useEffect, useRef } from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import { Link } from 'react-router-dom';
import { FiBell, FiCheck, FiInfo, FiAlertCircle, FiAward, FiClock, FiXCircle } from 'react-icons/fi';

const NotificationPanel = ({ isOpen, onClose }) => {
  const { notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead, loading } = useNotifications();
  const panelRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'SUCCESS': return <FiCheck className="text-emerald-500" />;
      case 'WARNING': return <FiAlertCircle className="text-amber-500" />;
      case 'INFO': return <FiInfo className="text-blue-500" />;
      case 'REMINDER': return <FiClock className="text-purple-500" />;
      case 'ACHIEVEMENT': return <FiAward className="text-yellow-500" />;
      case 'FAILURE': return <FiXCircle className="text-red-500" />;
      default: return <FiBell className="text-slate-500" />;
    }
  };

  const getPriorityBg = (priority, isRead) => {
    if (isRead) return 'bg-white';
    switch (priority) {
      case 'SUCCESS': return 'bg-emerald-50';
      case 'WARNING': return 'bg-amber-50';
      case 'INFO': return 'bg-blue-50';
      case 'REMINDER': return 'bg-purple-50';
      case 'ACHIEVEMENT': return 'bg-yellow-50';
      case 'FAILURE': return 'bg-red-50';
      default: return 'bg-slate-50';
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      ref={panelRef} 
      className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden flex flex-col max-h-[80vh]"
    >
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
          Notifications
          {unreadCount > 0 && (
            <span className="bg-emerald-100 text-emerald-800 text-xs py-0.5 px-2 rounded-full font-medium">
              {unreadCount} new
            </span>
          )}
        </h3>
        {unreadCount > 0 && (
          <button 
            onClick={markAllAsRead}
            className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className="overflow-y-auto flex-1">
        {loading && notifications.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500 mx-auto mb-2"></div>
            Loading...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <FiBell className="mx-auto text-3xl text-slate-300 mb-2" />
            <p>No notifications yet</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {notifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`p-4 transition-colors hover:bg-slate-50 ${getPriorityBg(notification.priority, notification.read)}`}
                onClick={() => {
                  if (!notification.read) markAsRead(notification.id);
                }}
              >
                <div className="flex gap-3">
                  <div className="mt-1 flex-shrink-0 text-xl">
                    {getPriorityIcon(notification.priority)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 mb-1">
                      {notification.title}
                    </p>
                    <p className="text-xs text-slate-600 line-clamp-2 mb-2">
                      {notification.description}
                    </p>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400 font-medium">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </span>
                      {notification.actionLink && (
                        <Link 
                          to={notification.actionLink}
                          className="text-emerald-600 hover:text-emerald-700 font-medium"
                          onClick={() => onClose()}
                        >
                          View Details &rarr;
                        </Link>
                      )}
                    </div>
                  </div>
                  {!notification.read && (
                    <div className="flex-shrink-0 mt-1.5">
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;
