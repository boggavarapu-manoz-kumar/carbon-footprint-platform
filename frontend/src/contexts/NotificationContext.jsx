import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import NotificationService from '../services/NotificationService';
import { useAuth } from './AuthContext';
import BadgeUnlockModal from '../components/BadgeUnlockModal';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeAchievementNotification, setActiveAchievementNotification] = useState(null);

  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const count = await NotificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Error fetching unread count', error);
    }
  }, [isAuthenticated]);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const data = await NotificationService.getNotifications(false, 0, 50);
      const fetchedNotifications = data.content || [];
      setNotifications(fetchedNotifications);
      
      // Look for unread achievements to pop up
      if (!activeAchievementNotification) {
        const unreadAchievement = fetchedNotifications.find(n => !n.read && n.notificationType === 'ACHIEVEMENT_UNLOCKED');
        if (unreadAchievement) {
          setActiveAchievementNotification(unreadAchievement);
        }
      }
    } catch (error) {
      console.error('Error fetching notifications', error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount();
    } else {
      setUnreadCount(0);
      setNotifications([]);
    }
  }, [isAuthenticated, fetchUnreadCount]);

  const markAsRead = async (id) => {
    try {
      await NotificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking as read', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await NotificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read', error);
    }
  };

  return (
    <NotificationContext.Provider value={{ unreadCount, notifications, loading, fetchNotifications, markAsRead, markAllAsRead }}>
      {children}
      {activeAchievementNotification && (
        <BadgeUnlockModal 
          notification={activeAchievementNotification}
          onClose={() => {
            markAsRead(activeAchievementNotification.id);
            setActiveAchievementNotification(null);
          }}
        />
      )}
    </NotificationContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useNotifications = () => useContext(NotificationContext);
