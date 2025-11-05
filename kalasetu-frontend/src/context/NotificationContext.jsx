import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { API_CONFIG } from '../config/env.config.js';

const NotificationContext = createContext({ notifications: [], unreadCount: 0, refresh: () => {}, markRead: async () => {} });

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const computeUnread = useCallback((list) => list.filter(n => !n.read).length, []);

  const refresh = useCallback(async () => {
    try {
      const res = await axios.get(`${API_CONFIG.BASE_URL}/api/notifications`, { withCredentials: true });
      const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setNotifications(list);
      setUnreadCount(computeUnread(list));
    } catch (_) {}
  }, [computeUnread]);

  const markRead = useCallback(async (id) => {
    try {
      await axios.patch(`${API_CONFIG.BASE_URL}/api/notifications/${id}/read`, {}, { withCredentials: true });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (_) {}
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, refresh, markRead }}>
      {children}
    </NotificationContext.Provider>
  );
};


