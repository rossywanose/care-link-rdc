import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Home, 
  Users, 
  Baby, 
  Skull, 
  FileText, 
  CreditCard, 
  BarChart3, 
  Bell, 
  Settings, 
  UserCircle, 
  LogOut,
  X,
  ShieldCheck,
  Building2,
  ClipboardCheck,
  FileBarChart,
  Search
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose, userRole }) => {
  const { t } = useLanguage();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Menu items par rôle
  const menuItems = {
    CITIZEN: [
      { path: '/citizen-dashboard', icon: Home, label: t('nav.dashboard') },
      { path: '/citizen-dashboard/certificats', icon: FileText, label: t('nav.certificates') },
      { path: '/citizen-dashboard/signalement', icon: Bell, label: t('nav.notifications') },
    ],
    HOSPITAL: [
      { path: '/hospital-dashboard', icon: Home, label: t('nav.dashboard') },
      { path: '/hospital-dashboard/naissances', icon: Baby, label: t('nav.births') },
      { path: '/hospital-dashboard/deces', icon: Skull, label: t('nav.deaths') },
      { path: '/hospital-dashboard/certificats', icon: FileText, label: t('nav.certificates') },
      { path: '/hospital-dashboard/statistiques', icon: BarChart3, label: t('nav.statistics') },
      { path: '/hospital-dashboard/paiements', icon: CreditCard, label: t('nav.payments') },
    ],
    AUTHORITY: [
      { path: '/authority-dashboard', icon: Home, label: t('nav.dashboard') },
      { path: '/authority-dashboard/hopitaux', icon: Building2, label: t('nav.hospitals') },
      { path: '/authority-dashboard/validation', icon: ClipboardCheck, label: t('nav.validation') },
      { path: '/authority-dashboard/rapports', icon: FileBarChart, label: t('nav.reports') },
      { path: '/authority-dashboard/audit', icon: Search, label: t('nav.audit') },
      { path: '/authority-dashboard/statistiques', icon: BarChart3, label: t('nav.statistics') },
    ],
  };

  const items = menuItems[userRole] || menuItems.CITIZEN;

  return (
    <aside 
      className={`
        fixed top-0 left-0 z-40 h-screen w-64 
        bg-white dark:bg-gray-800 
        border-r border-gray-200 dark:border-gray-700
        transform transition-transform duration-300 ease-in-out
        lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
    >
      {/* Header Sidebar */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">CL</span>
          </div>
          <span className="font-bold text-lg text-gray-900 dark:text-white">Care-Link</span>
        </div>
        <button 
          onClick={onClose}
          className="lg:hidden p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-1">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onClose}
            className={({ isActive }) => `
              flex items-center gap-3 px-4 py-3 rounded-lg
              transition-colors duration-200
              ${isActive 
                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }
            `}
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer Sidebar */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
        <NavLink
          to={`/${userRole?.toLowerCase()}-dashboard/profil`}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
        >
          <UserCircle className="w-5 h-5" />
          <span className="font-medium">{t('nav.profile')}</span>
        </NavLink>
        <NavLink
          to={`/${userRole?.toLowerCase()}-dashboard/parametres`}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
        >
          <Settings className="w-5 h-5" />
          <span className="font-medium">{t('nav.settings')}</span>
        </NavLink>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors mt-1"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">{t('nav.logout')}</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;