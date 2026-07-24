import React, { useState, useEffect } from 'react';
import {
  Settings,
  Bell,
  Moon,
  Sun,
  Globe,
  Monitor,
  CheckCircle2,
  AlertTriangle,
  Mail,
  Smartphone,
  Shield,
  Lock,
  Volume2,
  VolumeX,
  Loader2,
  AlertCircle,
  RefreshCw,
  X,
  Palette,
  Eye,
  EyeOff,
  ChevronRight
} from 'lucide-react';
import { userAPI } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';

const AuthorityParametres = () => {
  const { user: authUser } = useAuth();
  const { t, currentLanguage, changeLanguage, languages } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [showSuccess, setShowSuccess] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Parametres generaux
  const [generalSettings, setGeneralSettings] = useState({
    language: currentLanguage || 'fr',
    theme: 'system',
    timezone: 'Africa/Kinshasa',
    dateFormat: 'DD/MM/YYYY',
    notifications: true,
    soundEffects: true
  });

  // Parametres de notification
  const [notificationSettings, setNotificationSettings] = useState({
    emailNewCertificate: true,
    emailValidation: true,
    emailReport: false,
    emailDailySummary: true,
    pushNewCertificate: true,
    pushValidation: true,
    pushUrgent: true,
    pushSystem: false
  });

  // Parametres de securite
  const [securitySettings, setSecuritySettings] = useState({
    twoFactor: false,
    sessionTimeout: 30,
    loginAlerts: true,
    ipRestriction: false
  });

  // Parametres d'affichage
  const [displaySettings, setDisplaySettings] = useState({
    compactMode: false,
    showAnimations: true,
    sidebarCollapsed: false,
    tableDensity: 'comfortable'
  });

  useEffect(() => {
    setMounted(true);
    fetchSettings();
  }, []);

  // Synchroniser language avec LanguageContext
  useEffect(() => {
    setGeneralSettings(prev => ({ ...prev, language: currentLanguage }));
  }, [currentLanguage]);

  const fetchSettings = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await userAPI.getProfile();
      const user = res.data;

      setGeneralSettings(prev => ({
        ...prev,
        language: user.language || currentLanguage || 'fr',
        theme: user.theme || 'system',
        notifications: user.notifications_enabled ?? true
      }));

      applyTheme(user.theme || 'system');
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError(t('authority.parametres.errorLoad'));
    } finally {
      setLoading(false);
    }
  };

  const applyTheme = (themeValue) => {
    const root = document.documentElement;
    if (themeValue === 'dark') {
      root.classList.add('dark');
    } else if (themeValue === 'light') {
      root.classList.remove('dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      prefersDark ? root.classList.add('dark') : root.classList.remove('dark');
    }
  };

  const handleGeneralChange = (key, value) => {
    setGeneralSettings(prev => ({ ...prev, [key]: value }));
    if (key === 'theme') applyTheme(value);
    if (key === 'language') changeLanguage(value);
  };

  const handleNotificationChange = (key) => {
    setNotificationSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSecurityChange = (key, value) => {
    if (key === 'twoFactor' && value === true) {
      setShow2FAModal(true);
      return;
    }
    setSecuritySettings(prev => ({ ...prev, [key]: value }));
  };

  const handleDisplayChange = (key, value) => {
    setDisplaySettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError('');
    try {
      const backendData = {
        language: generalSettings.language,
        theme: generalSettings.theme,
        notifications_enabled: generalSettings.notifications
      };

      await userAPI.updateProfile(backendData);

      localStorage.setItem('theme', generalSettings.theme);
      localStorage.setItem('language', generalSettings.language);
      localStorage.setItem('notifications_enabled', generalSettings.notifications);
      localStorage.setItem('notificationSettings', JSON.stringify(notificationSettings));
      localStorage.setItem('securitySettings', JSON.stringify(securitySettings));
      localStorage.setItem('displaySettings', JSON.stringify(displaySettings));

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
      setError(t('authority.parametres.errorSave'));
    } finally {
      setIsSaving(false);
    }
  };

  const timezones = [
    { value: 'Africa/Kinshasa', label: t('authority.parametres.timezones.kinshasa') },
    { value: 'Africa/Lubumbashi', label: t('authority.parametres.timezones.lubumbashi') },
    { value: 'Africa/Goma', label: t('authority.parametres.timezones.goma') }
  ];

  const dateFormats = [
    { value: 'DD/MM/YYYY', label: t('authority.parametres.dateFormats.european') },
    { value: 'MM/DD/YYYY', label: t('authority.parametres.dateFormats.american') },
    { value: 'YYYY-MM-DD', label: t('authority.parametres.dateFormats.iso') }
  ];

  const tabs = [
    { id: 'general', label: t('authority.parametres.tabs.general'), icon: Settings },
    { id: 'notifications', label: t('authority.parametres.tabs.notifications'), icon: Bell },
    { id: 'security', label: t('authority.parametres.tabs.security'), icon: Shield },
    { id: 'display', label: t('authority.parametres.tabs.display'), icon: Monitor }
  ];

  const themes = [
    { value: 'light', label: t('authority.parametres.theme.light'), icon: Sun },
    { value: 'dark', label: t('authority.parametres.theme.dark'), icon: Moon },
    { value: 'system', label: t('authority.parametres.theme.system'), icon: Monitor }
  ];

  const languageList = Object.values(languages);

  const Toggle = ({ checked, onChange }) => (
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-12 h-7 rounded-full transition-colors ${
        checked ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'
      }`}
    >
      <div
        className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-0.5'
        }`}
      />
    </button>
  );

  if (loading) {
    return (
      <div className={`flex items-center justify-center py-20 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`space-y-6 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 flex items-center gap-3 animate-shake">
          <AlertTriangle className="w-6 h-6 text-red-600" />
          <div>
            <p className="text-red-700 dark:text-red-400 font-medium">{error}</p>
            <button onClick={fetchSettings} className="text-sm text-red-600 hover:underline mt-1 flex items-center gap-1 transition-all hover:scale-105">
              <RefreshCw className="w-3 h-3" /> {t('authority.parametres.retry')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 max-w-5xl mx-auto transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-slide-in-from-top">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center shadow-lg">
              <Settings className="w-5 h-5 text-white" />
            </div>
            {t('authority.parametres.title')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{t('authority.parametres.subtitle')}</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl font-medium hover:shadow-lg transition-all hover:scale-[1.02] active:scale-95 text-sm disabled:opacity-70"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {t('authority.parametres.saving')}
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              {t('authority.parametres.save')}
            </>
          )}
        </button>
      </div>

      {/* Success Alert */}
      {showSuccess && (
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 flex items-center gap-3 animate-slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <p className="text-sm text-emerald-700 dark:text-emerald-400">{t('authority.parametres.success')}</p>
        </div>
      )}

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar tabs */}
        <div className="lg:col-span-1 animate-slide-in-from-bottom-1">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden transition-all duration-500 hover:shadow-lg">
            <nav className="p-2 space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3 space-y-6 animate-slide-in-from-bottom-2">
          {/* General */}
          {activeTab === 'general' && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 space-y-6 transition-all duration-500 hover:shadow-lg">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-indigo-600" />
                {t('authority.parametres.sections.general')}
              </h2>

              {/* Langue */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  {t('authority.parametres.languageLabel')}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {languageList.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleGeneralChange('language', lang.code)}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all hover:scale-[1.02] ${
                        generalSettings.language === lang.code
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-2xl">{lang.flag}</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{lang.name}</span>
                      {generalSettings.language === lang.code && (
                        <CheckCircle2 className="w-4 h-4 text-indigo-600 ml-auto" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Theme */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  {t('authority.parametres.themeLabel')}
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {themes.map((theme) => (
                    <button
                      key={theme.value}
                      onClick={() => handleGeneralChange('theme', theme.value)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all hover:scale-[1.02] ${
                        generalSettings.theme === theme.value
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <theme.icon className={`w-6 h-6 ${
                        generalSettings.theme === theme.value ? 'text-indigo-600' : 'text-gray-400'
                      }`} />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{theme.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Fuseau horaire */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('authority.parametres.timezone')}
                </label>
                <select
                  value={generalSettings.timezone}
                  onChange={(e) => handleGeneralChange('timezone', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                >
                  {timezones.map(tz => (
                    <option key={tz.value} value={tz.value}>{tz.label}</option>
                  ))}
                </select>
              </div>

              {/* Format de date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('authority.parametres.dateFormat')}
                </label>
                <select
                  value={generalSettings.dateFormat}
                  onChange={(e) => handleGeneralChange('dateFormat', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                >
                  {dateFormats.map(df => (
                    <option key={df.value} value={df.value}>{df.label}</option>
                  ))}
                </select>
              </div>

              {/* Toggles */}
              <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{t('authority.parametres.notificationsGeneral')}</p>
                    <p className="text-xs text-gray-500">{t('authority.parametres.notificationsGeneralDesc')}</p>
                  </div>
                  <Toggle checked={generalSettings.notifications} onChange={(v) => handleGeneralChange('notifications', v)} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{t('authority.parametres.soundEffects')}</p>
                    <p className="text-xs text-gray-500">{t('authority.parametres.soundEffectsDesc')}</p>
                  </div>
                  <Toggle checked={generalSettings.soundEffects} onChange={(v) => handleGeneralChange('soundEffects', v)} />
                </div>
              </div>
            </div>
          )}

          {/* Notifications */}
          {activeTab === 'notifications' && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 space-y-6 transition-all duration-500 hover:shadow-lg">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Bell className="w-5 h-5 text-indigo-600" />
                {t('authority.parametres.sections.notifications')}
              </h2>

              {/* Email */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">{t('authority.parametres.email')}</h3>
                </div>
                <div className="space-y-3">
                  {[
                    { key: 'emailNewCertificate', label: t('authority.parametres.emailNewCert'), desc: t('authority.parametres.emailNewCertDesc') },
                    { key: 'emailValidation', label: t('authority.parametres.emailValidation'), desc: t('authority.parametres.emailValidationDesc') },
                    { key: 'emailReport', label: t('authority.parametres.emailReport'), desc: t('authority.parametres.emailReportDesc') },
                    { key: 'emailDailySummary', label: t('authority.parametres.emailDailySummary'), desc: t('authority.parametres.emailDailySummaryDesc') }
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all hover:scale-[1.01]">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{item.label}</p>
                        <p className="text-xs text-gray-500">{item.desc}</p>
                      </div>
                      <Toggle checked={notificationSettings[item.key]} onChange={() => handleNotificationChange(item.key)} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Smartphone className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">{t('authority.parametres.push')}</h3>
                </div>
                <div className="space-y-3">
                  {[
                    { key: 'pushNewCertificate', label: t('authority.parametres.pushNewCert'), desc: t('authority.parametres.pushNewCertDesc') },
                    { key: 'pushValidation', label: t('authority.parametres.pushValidation'), desc: t('authority.parametres.pushValidationDesc') },
                    { key: 'pushUrgent', label: t('authority.parametres.pushUrgent'), desc: t('authority.parametres.pushUrgentDesc') },
                    { key: 'pushSystem', label: t('authority.parametres.pushSystem'), desc: t('authority.parametres.pushSystemDesc') }
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all hover:scale-[1.01]">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{item.label}</p>
                        <p className="text-xs text-gray-500">{item.desc}</p>
                      </div>
                      <Toggle checked={notificationSettings[item.key]} onChange={() => handleNotificationChange(item.key)} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Securite */}
          {activeTab === 'security' && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 space-y-6 transition-all duration-500 hover:shadow-lg">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-600" />
                {t('authority.parametres.sections.security')}
              </h2>

              {/* 2FA */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-800 transition-all hover:shadow-md">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center">
                    <Lock className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{t('authority.parametres.twoFactor')}</p>
                    <p className="text-xs text-gray-500">{t('authority.parametres.twoFactorDesc')}</p>
                  </div>
                </div>
                <Toggle checked={securitySettings.twoFactor} onChange={(v) => handleSecurityChange('twoFactor', v)} />
              </div>

              {/* Timeout */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('authority.parametres.sessionTimeout')}
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="5"
                    max="120"
                    step="5"
                    value={securitySettings.sessionTimeout}
                    onChange={(e) => handleSecurityChange('sessionTimeout', parseInt(e.target.value))}
                    className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <span className="text-sm font-medium text-gray-900 dark:text-white w-16 text-right">
                    {securitySettings.sessionTimeout} min
                  </span>
                </div>
              </div>

              {/* Autres options */}
              <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{t('authority.parametres.loginAlerts')}</p>
                    <p className="text-xs text-gray-500">{t('authority.parametres.loginAlertsDesc')}</p>
                  </div>
                  <Toggle checked={securitySettings.loginAlerts} onChange={(v) => handleSecurityChange('loginAlerts', v)} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{t('authority.parametres.ipRestriction')}</p>
                    <p className="text-xs text-gray-500">{t('authority.parametres.ipRestrictionDesc')}</p>
                  </div>
                  <Toggle checked={securitySettings.ipRestriction} onChange={(v) => handleSecurityChange('ipRestriction', v)} />
                </div>
              </div>

              {/* Sessions actives */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">{t('authority.parametres.activeSessions')}</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl transition-all hover:scale-[1.01]">
                    <div className="flex items-center gap-3">
                      <Monitor className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Chrome - Windows</p>
                        <p className="text-xs text-gray-500">{t('authority.parametres.location')} • 196.223.45.12</p>
                      </div>
                    </div>
                    <span className="px-2 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 text-xs font-medium rounded-full">
                      {t('authority.parametres.current')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Affichage */}
          {activeTab === 'display' && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 space-y-6 transition-all duration-500 hover:shadow-lg">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Monitor className="w-5 h-5 text-indigo-600" />
                {t('authority.parametres.sections.display')}
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all hover:scale-[1.01]">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{t('authority.parametres.compactMode')}</p>
                    <p className="text-xs text-gray-500">{t('authority.parametres.compactModeDesc')}</p>
                  </div>
                  <Toggle checked={displaySettings.compactMode} onChange={(v) => handleDisplayChange('compactMode', v)} />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all hover:scale-[1.01]">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{t('authority.parametres.showAnimations')}</p>
                    <p className="text-xs text-gray-500">{t('authority.parametres.showAnimationsDesc')}</p>
                  </div>
                  <Toggle checked={displaySettings.showAnimations} onChange={(v) => handleDisplayChange('showAnimations', v)} />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all hover:scale-[1.01]">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{t('authority.parametres.sidebarCollapsed')}</p>
                    <p className="text-xs text-gray-500">{t('authority.parametres.sidebarCollapsedDesc')}</p>
                  </div>
                  <Toggle checked={displaySettings.sidebarCollapsed} onChange={(v) => handleDisplayChange('sidebarCollapsed', v)} />
                </div>
              </div>

              {/* Densite tableau */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  {t('authority.parametres.tableDensity')}
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'compact', label: t('authority.parametres.density.compact'), desc: t('authority.parametres.density.compactDesc') },
                    { value: 'comfortable', label: t('authority.parametres.density.comfortable'), desc: t('authority.parametres.density.comfortableDesc') },
                    { value: 'spacious', label: t('authority.parametres.density.spacious'), desc: t('authority.parametres.density.spaciousDesc') }
                  ].map((density) => (
                    <button
                      key={density.value}
                      onClick={() => handleDisplayChange('tableDensity', density.value)}
                      className={`p-4 rounded-xl border text-left transition-all hover:scale-[1.02] ${
                        displaySettings.tableDensity === density.value
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{density.label}</p>
                      <p className="text-xs text-gray-500 mt-1">{density.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal 2FA */}
      {show2FAModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl max-w-md w-full p-6 animate-slide-in-from-bottom-1">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center">
                  <Shield className="w-5 h-5 text-indigo-600" />
                </div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t('authority.parametres.twoFactorModalTitle')}</h2>
              </div>
              <button
                onClick={() => setShow2FAModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all hover:scale-110"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center space-y-4">
              <div className="w-48 h-48 mx-auto bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <div className="w-32 h-32 mx-auto border-4 border-indigo-600 rounded-lg flex items-center justify-center">
                    <span className="text-xs text-gray-400">QR Code</span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('authority.parametres.twoFactorModalDesc')}
              </p>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">{t('authority.parametres.backupCode')}</p>
                <p className="font-mono text-sm text-gray-900 dark:text-white">XXXX-XXXX-XXXX-XXXX</p>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShow2FAModal(false)}
                  className="flex-1 py-3 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all hover:scale-[1.02]"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={() => {
                    setSecuritySettings(prev => ({ ...prev, twoFactor: true }));
                    setShow2FAModal(false);
                  }}
                  className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-medium hover:shadow-lg transition-all hover:scale-[1.02]"
                >
                  {t('authority.parametres.activate')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthorityParametres;
