import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import axios from 'axios';
import { API_CONFIG } from '../config/env.config.js';

const NotificationContext = createContext({ notifications: [], unreadCount: 0, refresh: () => {}, markRead: async () => {} });

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const computeUnread = useCallback((list) => list.filter(n => !n.read).length, []);

  const formatTimeAgo = useCallback((timestamp) => {
    if (!timestamp) return '';
    const now = Date.now();
    const diff = now - new Date(timestamp).getTime();

    const minutes = Math.round(diff / (1000 * 60));
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.round(minutes / 60);
    if (hours < 24) return `${hours} hr${hours > 1 ? 's' : ''} ago`;
    const days = Math.round(hours / 24);
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
    const weeks = Math.round(days / 7);
    if (weeks < 5) return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    const months = Math.round(days / 30);
    if (months < 12) return `${months} mo${months > 1 ? 's' : ''} ago`;
    const years = Math.round(days / 365);
    return `${years} yr${years > 1 ? 's' : ''} ago`;
  }, []);

  // Store refresh implementation in ref to prevent identity changes
  const refreshRef = useRef();

  refreshRef.current = async () => {
    try {
      const res = await axios.get(`${API_CONFIG.BASE_URL}/api/notifications`, { withCredentials: true });
      const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      const decorated = list.map((item) => ({
        ...item,
        timeAgo: formatTimeAgo(item.createdAt),
      }));
      setNotifications(decorated);
      setUnreadCount(computeUnread(decorated));
    } catch (err) {
      console.error('Failed to refresh notifications:', err);
    }
  };

  // Stable reference that never changes identity
  const refresh = useCallback(() => refreshRef.current(), []);

  const markRead = useCallback(async (id) => {
    try {
      await axios.patch(`${API_CONFIG.BASE_URL}/api/notifications/${id}/read`, {}, { withCredentials: true });
      setNotifications(prev => prev.map(n => (n._id === id || n.id === id) ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) { console.error('Failed to mark notification as read:', err); }
  }, []);

  // Fetch once on mount - empty deps, no infinite loop
  useEffect(() => {
    refreshRef.current();
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, refresh, markRead }}>
      {children}
    </NotificationContext.Provider>
  );
};


