import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const intervalRef = useRef(null);

  // ============================================
  // FETCH NOTIFICATIONS
  // ============================================
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const response = await api.get('/notifications/');
      let data = response.data;

      // Gère 3 structures possibles de l'API
      let notifList = [];
      if (Array.isArray(data)) {
        notifList = data;
      } else if (data && Array.isArray(data.notifications)) {
        notifList = data.notifications;
      } else if (data && Array.isArray(data.results)) {
        notifList = data.results;
      }

      setNotifications(notifList);
      setUnreadCount(notifList.filter((n) => !n.is_read).length);
      setError(null);
    } catch (err) {
      console.error('Erreur fetch notifications:', err);
      setError(err.message);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // ============================================
  // FETCH UNREAD COUNT (léger, pour le polling)
  // ============================================
  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const response = await api.get('/notifications/unread-count/');
      setUnreadCount(response.data.unread_count || 0);
    } catch (err) {
      console.error('Erreur fetch unread count:', err);
    }
  }, [isAuthenticated]);

  // ============================================
  // MARK AS READ
  // ============================================
  const markAsRead = useCallback(
    async (id) => {
      try {
        await api.post(`/notifications/${id}/read/`);
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (err) {
        console.error('Erreur mark as read:', err);
      }
    },
    []
  );

  // ============================================
  // MARK ALL AS READ
  // ============================================
  const markAllAsRead = useCallback(async () => {
    try {
      await api.post('/notifications/mark-all-read/');
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Erreur mark all read:', err);
    }
  }, []);

  // ============================================
  // DELETE NOTIFICATION
  // ============================================
  const deleteNotification = useCallback(
    async (id) => {
      try {
        await api.delete(`/notifications/${id}/delete/`);
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        const deletedNotif = notifications.find((n) => n.id === id);
        if (deletedNotif && !deletedNotif.is_read) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
      } catch (err) {
        console.error('Erreur delete notification:', err);
      }
    },
    [notifications]
  );

  // ============================================
  // TOGGLE DROPDOWN ← C'EST ÇA QUI MANQUE PEUT-ÊTRE
  // ============================================
  const toggleDropdown = useCallback(() => {
    setDropdownOpen((prev) => {
        const newOpen = !prev;
        if (newOpen) {
            fetchNotifications();  // ← AJOUTER CECI
        }
        return newOpen;
    });
}, [fetchNotifications]);

  // Fermer le dropdown quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event) => {
      const dropdown = document.getElementById('notification-dropdown-container');
      if (dropdown && !dropdown.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  // ============================================
  // POLLING (toutes les 45 secondes)
  // ============================================
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      fetchUnreadCount();

      intervalRef.current = setInterval(fetchUnreadCount, 45000);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [isAuthenticated]); // ← PAS de fetchNotifications/fetchUnreadCount ici !

  // ============================================
  // GROUPED NOTIFICATIONS
  // ============================================
  const groupedNotifications = useMemo(() => {
    if (!Array.isArray(notifications)) {
      return {};
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    return notifications.reduce((groups, notification) => {
      const date = new Date(notification.created_at);
      let group = 'older';

      if (date >= today) {
        group = 'today';
      } else if (date >= yesterday) {
        group = 'yesterday';
      } else if (date >= weekAgo) {
        group = 'this_week';
      }

      if (!groups[group]) groups[group] = [];
      groups[group].push(notification);
      return groups;
    }, {});
  }, [notifications]);

  // ============================================
  // VALUE DU CONTEXT
  // ============================================
  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      loading,
      error,
      dropdownOpen,
      toggleDropdown,        // ← BIEN PRÉSENT ICI
      markAsRead,
      markAllAsRead,
      deleteNotification,
      groupedNotifications,
      refresh: fetchNotifications,
    }),
    [
      notifications,
      unreadCount,
      loading,
      error,
      dropdownOpen,
      toggleDropdown,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      groupedNotifications,
      fetchNotifications,
    ]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;