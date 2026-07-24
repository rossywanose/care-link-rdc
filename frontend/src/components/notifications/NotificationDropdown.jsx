import React from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { useLanguage } from '../../context/LanguageContext';
import { useNavigate, useLocation } from 'react-router-dom';
import NotificationItem from './NotificationItem';

const NotificationDropdown = () => {
  const {
    dropdownOpen,
    notifications,
    unreadCount,
    markAllAsRead,
    loading,
  } = useNotifications();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const getCurrentRole = () => {
    if (location.pathname.startsWith('/citizen-dashboard')) return 'citizen';
    if (location.pathname.startsWith('/hospital-dashboard')) return 'hospital';
    if (location.pathname.startsWith('/authority-dashboard')) return 'authority';
    return 'citizen';
  };

  const handleViewAll = () => {
    const role = getCurrentRole();
    navigate(`/${role}-dashboard/notifications`);
    // Fermer le dropdown
    document.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
  };

  if (!dropdownOpen) return null;

  return (
    <div className="absolute right-0 mt-2 w-80 sm:w-96 max-w-[calc(100vw-1rem)] bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
          {t('layout.notifications.title') || 'Notifications'}
          {unreadCount > 0 && (
            <span className="ml-2 px-2 py-0.5 text-xs font-medium text-white bg-red-500 rounded-full">
              {unreadCount}
            </span>
          )}
        </h3>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors whitespace-nowrap ml-2"
          >
            {t('layout.notifications.mark_all_read') || 'Tout marquer comme lu'}
          </button>
        )}
      </div>

      {/* Content */}
      <div className="max-h-[60vh] sm:max-h-[400px] overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-8 text-gray-500 dark:text-gray-400">
            <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-sm">{t('common.loading') || 'Chargement...'}</span>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-gray-400 dark:text-gray-500 px-4">
            <svg className="w-10 h-10 sm:w-12 sm:h-12 mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 text-center">
              {t('layout.notifications.no_notifications') || 'Aucune notification'}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 text-center">
              {t('layout.notifications.check_back_later') || 'Revenez plus tard'}
            </p>
          </div>
        ) : (
          notifications.slice(0, 5).map((notification) => (
            <NotificationItem key={notification.id} notification={notification} />
          ))
        )}
      </div>

      {/* Footer */}
      <div className="px-3 sm:px-4 py-2.5 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <button
          onClick={handleViewAll}
          className="w-full text-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors py-1 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
        >
          {t('layout.notifications.view_all') || 'Voir toutes les notifications'}
        </button>
      </div>
    </div>
  );
};

export default NotificationDropdown;