import React, { useState, useEffect, useCallback } from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { useLanguage } from '../../context/LanguageContext';
import NotificationItem from './NotificationItem';

const NotificationPage = () => {
  const {
    notifications,
    loading,
    error,
    markAllAsRead,
    deleteNotification,
    groupedNotifications,
    refresh,
  } = useNotifications();
  const { t } = useLanguage();

  const [filter, setFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [deletingId, setDeletingId] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [mounted, setMounted] = useState(false);

  // ============================================
  // ANIMATION : Montage progressif de la page
  // ============================================
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // ============================================
  // AJOUT : Rafraichir les notifications au chargement de la page
  // ============================================
  useEffect(() => {
    refresh();
  }, [refresh]);

  // ============================================
  // ANIMATION : Rafraichissement avec animation du spinner
  // ============================================
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await refresh();
    setTimeout(() => setIsRefreshing(false), 600);
  }, [refresh]);

  // ============================================
  // ANIMATION : Suppression avec animation de sortie
  // ============================================
  const handleDelete = useCallback((id) => {
    setDeletingId(id);
    setTimeout(() => {
      deleteNotification(id);
      setDeletingId(null);
    }, 300);
  }, [deleteNotification]);

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread' && n.is_read) return false;
    if (filter === 'read' && !n.is_read) return false;
    if (typeFilter !== 'all' && n.notification_type !== typeFilter) return false;
    return true;
  });

  // ============================================
  // ANIMATION : Regroupement filtre avec animations
  // ============================================
  const getFilteredGroupedNotifications = () => {
    const filtered = {};
    Object.entries(groupedNotifications).forEach(([group, groupNotifications]) => {
      const groupFiltered = groupNotifications.filter((n) => {
        if (filter === 'unread' && n.is_read) return false;
        if (filter === 'read' && !n.is_read) return false;
        if (typeFilter !== 'all' && n.notification_type !== typeFilter) return false;
        return true;
      });
      if (groupFiltered.length > 0) {
        filtered[group] = groupFiltered;
      }
    });
    return filtered;
  };

  const filteredGrouped = getFilteredGroupedNotifications();

  const getGroupLabel = (group) => {
    switch (group) {
      case 'today': return t('layout.notifications.today') || "Aujourd'hui";
      case 'yesterday': return t('layout.notifications.yesterday') || 'Hier';
      case 'this_week': return t('layout.notifications.this_week') || 'Cette semaine';
      case 'older': return t('layout.notifications.older') || 'Plus ancien';
      default: return group;
    }
  };

  // ============================================
  // ANIMATION : Icone animee selon le type
  // ============================================
  const getTypeIcon = (type) => {
    const icons = {
      certificate: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      validation: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      payment: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
      report: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      system: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      alert: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      ),
    };
    return icons[type] || icons.system;
  };

  // ============================================
  // ANIMATION : Couleur selon le type
  // ============================================
  const getTypeColor = (type) => {
    const colors = {
      certificate: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
      validation: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
      payment: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
      report: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
      system: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
      alert: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
    };
    return colors[type] || colors.system;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-gray-500 dark:text-gray-400 px-4">
        <svg className="animate-spin h-8 w-8 mr-3" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span className="text-lg">{t('common.loading') || 'Chargement...'}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-red-500 dark:text-red-400 px-4">
        <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <p className="text-center text-lg font-medium">{error}</p>
        <button
          onClick={handleRefresh}
          className="mt-4 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all duration-200"
        >
          {t('common.retry') || 'Reessayer'}
        </button>
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className={"max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6 transition-all duration-500 " + (mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4')}>

      {/* ============================================
          HEADER AMELIORE avec badge anime et actions
          ============================================ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
              {t('layout.notifications.title') || 'Notifications'}
            </h1>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-3 flex h-5 w-5 items-center justify-center">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-[10px] text-white items-center justify-center font-bold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Bouton de rafraichissement anime */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={"p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 " + (isRefreshing ? 'animate-spin' : '')}
            title={t('common.refresh') || 'Rafraichir'}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>

          {/* Bouton toggle filtres */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={"p-2 rounded-lg transition-all duration-200 " + (showFilters ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700')}
            title={t('common.filters') || 'Filtres'}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
          </button>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all duration-200 hover:scale-105 active:scale-95 w-full sm:w-auto"
            >
              {t('layout.notifications.mark_all_read') || 'Tout marquer comme lu'}
            </button>
          )}
        </div>
      </div>

      {/* ============================================
          BARRE DE PROGRESSION DES NON-LUES
          ============================================ */}
      {notifications.length > 0 && (
        <div className="mb-4 sm:mb-6">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1.5">
            <span>{t('Progression de lecture') || 'Progression de lecture'}</span>
            <span>{notifications.length - unreadCount} / {notifications.length}</span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-700 ease-out"
              style={{ width: String(((notifications.length - unreadCount) / notifications.length) * 100) + '%' }}
            />
          </div>
        </div>
      )}

      {/* ============================================
          FILTRES ANIMES (accordeon)
          ============================================ */}
      <div className={"overflow-hidden transition-all duration-300 ease-in-out " + (showFilters ? 'max-h-40 opacity-100 mb-4 sm:mb-6' : 'max-h-0 opacity-0 mb-0')}>
        <div className="flex flex-wrap gap-2 sm:gap-3 p-3 sm:p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-2 sm:px-3 py-2 text-xs sm:text-sm bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 hover:border-blue-400"
            >
              <option value="all">{t('layout.notifications.all') || 'Toutes'}</option>
              <option value="unread">{t('layout.notifications.unread_only') || 'Non lues'}</option>
              <option value="read">{t('layout.notifications.read_only') || 'Lues'}</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-2 sm:px-3 py-2 text-xs sm:text-sm bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 hover:border-blue-400"
            >
              <option value="all">{t('layout.notifications.all_types') || 'Tous les types'}</option>
              <option value="certificate">{t('layout.notifications.types.certificate') || 'Certificat'}</option>
              <option value="validation">{t('layout.notifications.types.validation') || 'Validation'}</option>
              <option value="payment">{t('layout.notifications.types.payment') || 'Paiement'}</option>
              <option value="report">{t('layout.notifications.types.report') || 'Rapport'}</option>
              <option value="system">{t('layout.notifications.types.system') || 'Systeme'}</option>
              <option value="alert">{t('layout.notifications.types.alert') || 'Alerte'}</option>
            </select>
          </div>

          {/* Reinitialiser les filtres */}
          {(filter !== 'all' || typeFilter !== 'all') && (
            <button
              onClick={() => { setFilter('all'); setTypeFilter('all'); }}
              className="px-3 py-2 text-xs font-medium text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
            >
              {t('Reinitialiser') || 'Reinitialiser'}
            </button>
          )}
        </div>
      </div>

      {/* ============================================
          LISTE DES NOTIFICATIONS AVEC ANIMATIONS
          ============================================ */}
      {filteredNotifications.length === 0 ? (
        <div className={"flex flex-col items-center justify-center py-12 sm:py-16 text-gray-400 dark:text-gray-500 px-4 transition-all duration-500 " + (mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95')}>
          <div className="relative mb-4">
            <svg className="w-16 h-16 sm:w-20 sm:h-20 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {filter === 'unread' && (
              <svg className="absolute -top-1 -right-1 w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>
          <p className="text-base sm:text-lg font-medium text-gray-500 dark:text-gray-400 text-center">
            {filter === 'unread' 
              ? (t('Aucune notification non lue') || 'Aucune notification non lue')
              : filter === 'read'
              ? (t('Aucune notification lue') || 'Aucune notification lue')
              : typeFilter !== 'all'
              ? (t('Aucune notification de ce type') || 'Aucune notification de ce type')
              : (t('layout.notifications.no_notifications') || 'Aucune notification')
            }
          </p>
          <p className="text-xs sm:text-sm text-gray-400 dark:text-gray-500 mt-1 text-center">
            {t('layout.notifications.check_back_later') || 'Revenez plus tard'}
          </p>
          {(filter !== 'all' || typeFilter !== 'all') && (
            <button
              onClick={() => { setFilter('all'); setTypeFilter('all'); }}
              className="mt-4 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all duration-200"
            >
              {t('Afficher tout') || 'Afficher tout'}
            </button>
          )}
        </div>
      ) : (
        Object.entries(filteredGrouped).map(([group, groupNotifications], groupIndex) => {
          if (groupNotifications.length === 0) return null;
          return (
            <div 
              key={group} 
              className="mb-4 sm:mb-6"
              style={{ 
                animationDelay: String(groupIndex * 100) + 'ms',
              }}
            >
              {/* En-tete de groupe avec animation */}
              <h3 className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 sm:mb-3 px-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
                {getGroupLabel(group)}
                <span className="text-[10px] bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded-full">
                  {groupNotifications.length}
                </span>
              </h3>

              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
                {groupNotifications.map((notification, index) => (
                  <div 
                    key={notification.id} 
                    className={"relative group transition-all duration-300 " +
                      (deletingId === notification.id 
                        ? 'opacity-0 -translate-x-full scale-95' 
                        : 'opacity-100 translate-x-0 scale-100'
                      ) + " " +
                      (index !== groupNotifications.length - 1 
                        ? 'border-b border-gray-100 dark:border-gray-700/50' 
                        : ''
                      )
                    }
                    style={{ 
                      transitionDelay: String(index * 50) + 'ms',
                      animation: mounted ? 'slideIn 0.4s ease-out ' + String(index * 50) + 'ms both' : 'none'
                    }}
                  >
                    {/* Indicateur non-lu */}
                    {!notification.is_read && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l"></div>
                    )}

                    <div className={"pl-3 pr-2 py-3 transition-all duration-200 " + (!notification.is_read ? 'bg-blue-50/50 dark:bg-blue-900/5' : '') + " hover:bg-gray-50 dark:hover:bg-gray-700/30"}>
                      <NotificationItem notification={notification} />
                    </div>

                    {/* Bouton supprimer avec animation amelioree */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(notification.id);
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 hover:scale-110 active:scale-90"
                      title={t('common.delete') || 'Supprimer'}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })
      )}

      {/* ============================================
          FOOTER : Resume et actions rapides
          ============================================ */}
      {notifications.length > 0 && (
        <div className={"mt-6 text-center transition-all duration-500 delay-300 " + (mounted ? 'opacity-100' : 'opacity-0')}>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            {String(notifications.length) + ' notification(s) au total'}
            {unreadCount > 0 ? ' - ' + String(unreadCount) + ' non lue(s)' : ''}
          </p>
        </div>
      )}
    </div>
  );
};

export default NotificationPage;