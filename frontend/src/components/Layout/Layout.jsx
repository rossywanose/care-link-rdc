import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  AlertTriangle,
  User,
  Settings,
  LogOut,
  Menu,
  ChevronRight,
  Bell,
  Search,
  Shield,
  Moon,
  Sun,
  Monitor,
  Building2,
  Baby,
  Skull,
  BarChart3,
  Activity,
  CheckCircle2,
  X,
  ChevronLeft,
  Bot,
  Command,
  ChevronRight as ChevronRightIcon
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useNotifications } from '../../context/NotificationContext';
import NotificationBell from '../notifications/NotificationBell';
import NotificationDropdown from '../notifications/NotificationDropdown';
import AIChatWidget from '../AIChatWidget/AIChatWidget';
import GlobalSearch from '../GlobalSearch/GlobalSearch';

const Layout = ({ role }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const { unreadCount } = useNotifications();

  // Sidebar collapsed state (like Kimi)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return localStorage.getItem('sidebarCollapsed') === 'true';
  });

  // Mobile sidebar open
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Search modal state — contrôlé par le parent
  const [searchOpen, setSearchOpen] = useState(false);

  // Theme: light | dark | system
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'system';
  });

  // Accent color from localStorage
  const [accentColor, setAccentColor] = useState(() => {
    return localStorage.getItem('accentColor') || 'indigo';
  });

  // Listen for accent color changes
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'accentColor') {
        setAccentColor(e.newValue || 'indigo');
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Also check periodically for same-tab changes
  useEffect(() => {
    const interval = setInterval(() => {
      const current = localStorage.getItem('accentColor') || 'indigo';
      if (current !== accentColor) setAccentColor(current);
    }, 500);
    return () => clearInterval(interval);
  }, [accentColor]);

  // Color map for dynamic classes
  const colorMap = {
    indigo: { from: 'from-indigo-600', to: 'to-violet-600', bg: 'bg-indigo-600', text: 'text-indigo-600', ring: 'ring-indigo-600', light: 'bg-indigo-50', darkLight: 'dark:bg-indigo-900/30', border: 'border-indigo-600', hover: 'hover:text-indigo-700' },
    blue: { from: 'from-blue-600', to: 'to-cyan-600', bg: 'bg-blue-600', text: 'text-blue-600', ring: 'ring-blue-600', light: 'bg-blue-50', darkLight: 'dark:bg-blue-900/30', border: 'border-blue-600', hover: 'hover:text-blue-700' },
    emerald: { from: 'from-emerald-600', to: 'to-teal-600', bg: 'bg-emerald-600', text: 'text-emerald-600', ring: 'ring-emerald-600', light: 'bg-emerald-50', darkLight: 'dark:bg-emerald-900/30', border: 'border-emerald-600', hover: 'hover:text-emerald-700' },
    amber: { from: 'from-amber-500', to: 'to-orange-600', bg: 'bg-amber-500', text: 'text-amber-500', ring: 'ring-amber-500', light: 'bg-amber-50', darkLight: 'dark:bg-amber-900/30', border: 'border-amber-500', hover: 'hover:text-amber-600' },
    rose: { from: 'from-rose-600', to: 'to-pink-600', bg: 'bg-rose-600', text: 'text-rose-600', ring: 'ring-rose-600', light: 'bg-rose-50', darkLight: 'dark:bg-rose-900/30', border: 'border-rose-600', hover: 'hover:text-rose-700' },
    violet: { from: 'from-violet-600', to: 'to-purple-600', bg: 'bg-violet-600', text: 'text-violet-600', ring: 'ring-violet-600', light: 'bg-violet-50', darkLight: 'dark:bg-violet-900/30', border: 'border-violet-600', hover: 'hover:text-violet-700' },
  };

  const c = colorMap[accentColor] || colorMap.indigo;

  // Appliquer le theme au <html>
  useEffect(() => {
    const root = document.documentElement;

    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) root.classList.add('dark');
      else root.classList.remove('dark');
    }

    localStorage.setItem('theme', theme);
  }, [theme]);

  const cycleTheme = () => {
    setTheme(prev => {
      if (prev === 'light') return 'dark';
      if (prev === 'dark') return 'system';
      return 'light';
    });
  };

  const getThemeIcon = () => {
    if (theme === 'light') return <Sun className="w-5 h-5" />;
    if (theme === 'dark') return <Moon className="w-5 h-5" />;
    return <Monitor className="w-5 h-5" />;
  };

  const getThemeLabel = () => {
    if (theme === 'light') return t('layout.theme.light');
    if (theme === 'dark') return t('layout.theme.dark');
    return t('layout.theme.system');
  };

  const toggleSidebar = () => {
    const newState = !sidebarCollapsed;
    setSidebarCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', newState);
  };

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const menuItems = {
    citizen: [
      { path: '/citizen-dashboard', label: t('layout.menu.dashboard'), icon: LayoutDashboard },
      { path: '/citizen-dashboard/certificats', label: t('layout.menu.myCerts'), icon: FileText },
      { path: '/citizen-dashboard/signalement', label: t('layout.menu.report'), icon: AlertTriangle },
      { path: '/citizen-dashboard/profil', label: t('layout.menu.profile'), icon: User },
      { path: '/citizen-dashboard/parametres', label: t('layout.menu.settings'), icon: Settings },
    ],
    hospital: [
      { path: '/hospital-dashboard', label: t('layout.menu.dashboard'), icon: LayoutDashboard },
      { path: '/hospital-dashboard/naissances', label: t('layout.menu.births'), icon: Baby },
      { path: '/hospital-dashboard/deces', label: t('layout.menu.deaths'), icon: Skull },
      { path: '/hospital-dashboard/certificats', label: t('layout.menu.certs'), icon: FileText },
      { path: '/hospital-dashboard/statistiques', label: t('layout.menu.statistics'), icon: BarChart3 },
      { path: '/hospital-dashboard/verify', label: t('layout.menu.verify'), icon: Shield }, // ← AJOUTÉ
      { path: '/hospital-dashboard/profil', label: t('layout.menu.profile'), icon: User },
      { path: '/hospital-dashboard/parametres', label: t('layout.menu.settings'), icon: Settings },
    ],
    authority: [
      { path: '/authority-dashboard', label: t('layout.menu.dashboard'), icon: LayoutDashboard },
      { path: '/authority-dashboard/hopitaux', label: t('layout.menu.hospitals'), icon: Building2 },
      { path: '/authority-dashboard/validation', label: t('layout.menu.validation'), icon: CheckCircle2 },
      { path: '/authority-dashboard/signalement', label: t('layout.menu.report'), icon: AlertTriangle },
      { path: '/authority-dashboard/audit', label: t('layout.menu.audit'), icon: Activity },
      { path: '/authority-dashboard/statistiques', label: t('layout.menu.statistics'), icon: BarChart3 },
      { path: '/authority-dashboard/verify', label: t('layout.menu.verify'), icon: Shield }, // ← AJOUTÉ
      { path: '/authority-dashboard/profil', label: t('layout.menu.profile'), icon: User },
      { path: '/authority-dashboard/parametres', label: t('layout.menu.settings'), icon: Settings },
    ],
  };

  const currentMenu = menuItems[role] || menuItems.citizen;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/connexion');
  };

  const isActive = (path) => {
    if (path === '/citizen-dashboard' || path === '/hospital-dashboard' || path === '/authority-dashboard') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const getRoleLabel = () => {
    if (role === 'citizen') return t('layout.roles.citizen');
    if (role === 'hospital') return t('layout.roles.hospital');
    return t('layout.roles.authority');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">

      {/* Mobile Overlay with fade */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden animate-in fade-in duration-200"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar with slide animation */}
      <aside className={`
        fixed lg:hidden top-0 left-0 z-50 h-screen w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800
        transform transition-all duration-300 ease-out
        ${sidebarOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}
        flex flex-col shadow-2xl
      `}>
        {/* Mobile Logo */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 bg-gradient-to-br ${c.from} ${c.to} rounded-xl flex items-center justify-center`}>
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold text-gray-900 dark:text-white">Care-Link</span>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Mobile Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {currentMenu.map((item, index) => (
            <button
              key={item.path}
              onClick={() => {
                navigate(item.path);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 animate-in slide-in-from-left-2 ${isActive(item.path)
                  ? `bg-gradient-to-r ${c.from} ${c.to} text-white shadow-lg shadow-${accentColor}-500/25`
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>

        {/* Mobile Bottom */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
            <LogOut className="w-5 h-5" />
            {t('layout.logout')}
          </button>
        </div>
      </aside>

      {/* Desktop Sidebar - Collapsible like Kimi with smooth transitions */}
      <aside
        className={`
          hidden lg:flex flex-col fixed top-0 left-0 z-30 h-screen
          bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800
          transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
          ${sidebarCollapsed ? 'w-16' : 'w-64'}
        `}
      >
        {/* Logo Area */}
        <div
          className={`
            border-b border-gray-200 dark:border-gray-800 flex items-center h-16
            transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
            ${sidebarCollapsed ? 'justify-center px-2' : 'justify-between px-4'}
          `}
        >
          {/* Logo - with smooth transition */}
          <div
            className={`
              flex items-center gap-3 overflow-hidden transition-all duration-300
              ${sidebarCollapsed ? 'w-8 opacity-100' : 'w-auto opacity-100'}
            `}
          >
            <div className={`w-8 h-8 bg-gradient-to-br ${c.from} ${c.to} rounded-lg flex items-center justify-center flex-shrink-0`}>
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div
              className={`
                overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
                ${sidebarCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}
              `}
            >
              <span className="text-base font-bold text-gray-900 dark:text-white whitespace-nowrap">Care-Link</span>
              <span className={`text-[10px] font-semibold ${c.light} ${c.darkLight} ${c.text} px-1.5 py-0.5 rounded-full ml-1 whitespace-nowrap`}>
                {getRoleLabel()}
              </span>
            </div>
          </div>

          {/* Toggle Button with hover animation */}
          <button
            onClick={toggleSidebar}
            className={`
              p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200
              hover:scale-110 active:scale-95
              ${sidebarCollapsed ? 'absolute -right-3 top-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-md' : ''}
            `}
            title={sidebarCollapsed ? t('layout.expand') : t('layout.collapse')}
          >
            <div className="transition-transform duration-300">
              {sidebarCollapsed ? (
                <ChevronRightIcon className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronLeft className="w-4 h-4 text-gray-500" />
              )}
            </div>
          </button>
        </div>

        {/* Navigation with staggered animation */}
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto overflow-x-hidden">
          {currentMenu.map((item, index) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`
                w-full flex items-center rounded-xl text-sm font-medium transition-all duration-200
                group relative
                ${sidebarCollapsed ? 'justify-center px-3 py-3' : 'px-4 py-3'}
                ${isActive(item.path)
                  ? `bg-gradient-to-r ${c.from} ${c.to} text-white shadow-lg`
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }
              `}
              title={sidebarCollapsed ? item.label : ''}
            >
              {/* Icon with subtle animation */}
              <item.icon className={`
                w-5 h-5 flex-shrink-0 transition-transform duration-200
                ${isActive(item.path) ? '' : 'group-hover:scale-110'}
              `} />

              {/* Label with smooth width transition */}
              <span
                className={`
                  overflow-hidden whitespace-nowrap transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
                  ${sidebarCollapsed ? 'w-0 opacity-0 ml-0' : 'w-auto opacity-100 ml-3'}
                `}
              >
                {item.label}
              </span>

              {/* Active indicator */}
              {!sidebarCollapsed && isActive(item.path) && (
                <ChevronRight className="w-4 h-4 ml-auto flex-shrink-0 animate-in fade-in slide-in-from-left-2 duration-200" />
              )}

              {/* Tooltip for collapsed state */}
              {sidebarCollapsed && (
                <div
                  className={`
                    absolute left-full ml-2 px-3 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900
                    text-xs font-medium rounded-lg whitespace-nowrap z-50
                    opacity-0 invisible group-hover:opacity-100 group-hover:visible
                    transition-all duration-200 translate-x-1 group-hover:translate-x-0
                    shadow-lg
                  `}
                >
                  {item.label}
                  <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-gray-900 dark:bg-white rotate-45" />
                </div>
              )}
            </button>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="p-2 border-t border-gray-200 dark:border-gray-800 space-y-1">
          <button
            onClick={cycleTheme}
            className={`
              w-full flex items-center rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400
              hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 group relative
              ${sidebarCollapsed ? 'justify-center px-3 py-3' : 'px-4 py-3'}
            `}
            title={sidebarCollapsed ? getThemeLabel() : ''}
          >
            <div className="transition-transform duration-200 group-hover:rotate-12">
              {getThemeIcon()}
            </div>
            <span
              className={`
                overflow-hidden whitespace-nowrap transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
                ${sidebarCollapsed ? 'w-0 opacity-0 ml-0' : 'w-auto opacity-100 ml-3'}
              `}
            >
              {getThemeLabel()}
            </span>

            {sidebarCollapsed && (
              <div
                className="absolute left-full ml-2 px-3 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900
                  text-xs font-medium rounded-lg whitespace-nowrap z-50
                  opacity-0 invisible group-hover:opacity-100 group-hover:visible
                  transition-all duration-200 translate-x-1 group-hover:translate-x-0 shadow-lg"
              >
                {getThemeLabel()}
                <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-gray-900 dark:bg-white rotate-45" />
              </div>
            )}
          </button>
          <button
            onClick={handleLogout}
            className={`
              w-full flex items-center rounded-xl text-sm font-medium text-red-600
              hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 group relative
              ${sidebarCollapsed ? 'justify-center px-3 py-3' : 'px-4 py-3'}
            `}
            title={sidebarCollapsed ? t('layout.logout') : ''}
          >
            <LogOut className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
            <span
              className={`
                overflow-hidden whitespace-nowrap transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
                ${sidebarCollapsed ? 'w-0 opacity-0 ml-0' : 'w-auto opacity-100 ml-3'}
              `}
            >
              {t('layout.logout')}
            </span>

            {sidebarCollapsed && (
              <div
                className="absolute left-full ml-2 px-3 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900
                  text-xs font-medium rounded-lg whitespace-nowrap z-50
                  opacity-0 invisible group-hover:opacity-100 group-hover:visible
                  transition-all duration-200 translate-x-1 group-hover:translate-x-0 shadow-lg"
              >
                {t('layout.logout')}
                <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-gray-900 dark:bg-white rotate-45" />
              </div>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content Area with smooth margin transition */}
      <div
        className={`
          flex-1 flex flex-col min-w-0
          transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
          ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}
        `}
      >

        {/* TopBar */}
        <header className="sticky top-0 z-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between px-4 sm:px-6 h-16">
            <div className="flex items-center gap-4">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Search Button avec Tooltip */}
              <div className="relative group">
                <button
                  onClick={() => setSearchOpen(true)}
                  className="hidden sm:flex items-center gap-2 bg-gray-100 dark:bg-gray-800
                    hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg px-3 py-2
                    transition-all duration-200 cursor-pointer w-64"
                >
                  <Search className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-400 flex-1 text-left">
                    {t('layout.searchPlaceholder') || 'Rechercher...'}
                  </span>
                  <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5
                    bg-white dark:bg-gray-700 rounded text-[10px] text-gray-400 font-mono">
                    <Command className="w-2.5 h-2.5" /> K
                  </kbd>
                </button>

                {/* 🔧 TOOLTIP au survol du bouton de recherche */}
                <div
                  className="absolute top-full left-0 mt-2 px-3 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900
                    text-xs font-medium rounded-lg whitespace-nowrap z-50
                    opacity-0 invisible group-hover:opacity-100 group-hover:visible
                    transition-all duration-200 translate-y-1 group-hover:translate-y-0
                    shadow-lg max-w-xs"
                >
                  {t('layout.searchTooltip') || 'Cliquez ou appuyez sur Ctrl+K pour rechercher'}
                  <div className="absolute -top-1 left-6 w-2 h-2 bg-gray-900 dark:bg-white rotate-45" />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">

              {/* Notification Bell - NEW */}
              <div className="relative">
                <NotificationBell />
                <NotificationDropdown />
              </div>

              {/* AI Assistant Button */}
              <button
                onClick={() => navigate(`/${role}-dashboard/assistant`)}
                className="relative p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200 hover:scale-105"
                title={t('layout.assistant')}
              >
                <Bot className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse" />
              </button>

              {/* User Profile */}
              <div className="flex items-center gap-3 pl-3 border-l border-gray-200 dark:border-gray-800">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {user.first_name && user.last_name
                      ? `${user.first_name} ${user.last_name}`
                      : user.first_name
                        ? user.first_name
                        : user.email || t('layout.user')}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">{getRoleLabel()}</p>
                </div>
                <div className={`w-9 h-9 bg-gradient-to-br ${c.from} ${c.to} rounded-full flex items-center justify-center text-white font-semibold text-sm transition-transform duration-200 hover:scale-105`}>
                  {(user.first_name?.[0] || user.email?.[0] || 'U').toUpperCase()}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content with fade animation on route change */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* AI Chat Widget */}
      <AIChatWidget />

      {/* GlobalSearch avec props contrôlées par le parent */}
      <GlobalSearch role={role} isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
};

export default Layout;
