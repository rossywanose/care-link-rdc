import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings,
  Palette,
  Globe,
  Bell,
  Moon,
  Sun,
  Monitor,
  CheckCircle2,
  Volume2,
  VolumeX,
  Mail,
  Smartphone,
  AlertTriangle,
  Shield,
  AlertCircle,
  Loader2,
  Lock,
  Eye,
  EyeOff,
  Key,
  Fingerprint,
  Clock,
  Laptop,
  LogOut,
  Trash2,
  Save
} from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { userAPI } from '../../../services/api';

const HospitalParametres = () => {
  const navigate = useNavigate();
  const { currentLanguage, changeLanguage, languages, t } = useLanguage();
  const [activeTab, setActiveTab] = useState('appearance');
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Appearance settings
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'system');
  const [accentColor, setAccentColor] = useState(() => localStorage.getItem('accentColor') || 'indigo');

  // Language settings - sync with LanguageContext
  const [language, setLanguage] = useState(currentLanguage);
  const [autoTranslate, setAutoTranslate] = useState(() => localStorage.getItem('autoTranslate') === 'true');

  // Notification settings
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('notifications');
    return saved ? JSON.parse(saved) : {
      email: true, sms: false, push: true,
      naissances: true, deces: true, certificats: true,
      paiements: true, rapports: false, newsletters: false,
      securityAlert: true, newFeature: false
    };
  });

  const [soundEnabled, setSoundEnabled] = useState(() => localStorage.getItem('soundEnabled') !== 'false');

  // Security settings
  const [security, setSecurity] = useState({
    twoFactor: false,
    biometric: false,
    sessionTimeout: '30',
    passwordLastChanged: '2024-01-15'
  });

  // Password change
  const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });

  // Display settings
  const [display, setDisplay] = useState(() => {
    const saved = localStorage.getItem('display');
    return saved ? JSON.parse(saved) : {
      compactMode: false,
      showStats: true,
      autoRefresh: '5',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '24h'
    };
  });

  // Sync language with LanguageContext
  useEffect(() => {
    setLanguage(currentLanguage);
  }, [currentLanguage]);

  // Apply theme
  const applyTheme = (newTheme) => {
    const root = document.documentElement;
    if (newTheme === 'dark') {
      root.classList.add('dark');
    } else if (newTheme === 'light') {
      root.classList.remove('dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      prefersDark ? root.classList.add('dark') : root.classList.remove('dark');
    }
  };

  // Fetch settings from backend
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await userAPI.getProfile();
      const userData = response.data;

      if (userData.theme) {
        setTheme(userData.theme);
        localStorage.setItem('theme', userData.theme);
      }
      if (userData.language) {
        setLanguage(userData.language);
        changeLanguage(userData.language);
      }
      if (userData.notifications_enabled !== undefined) {
        setNotifications(prev => ({
          ...prev,
          email: userData.notifications_enabled,
          push: userData.notifications_enabled
        }));
      }
      applyTheme(userData.theme || theme);
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError(t('hospital.settings.errorLoad'));
      applyTheme(theme);
    } finally {
      setIsLoading(false);
    }
  };

  // Translated data (inside component for t() access)
  const themes = [
    { value: 'light', label: t('hospital.settings.theme.light'), icon: Sun, desc: t('hospital.settings.theme.lightDesc') },
    { value: 'dark', label: t('hospital.settings.theme.dark'), icon: Moon, desc: t('hospital.settings.theme.darkDesc') },
    { value: 'system', label: t('hospital.settings.theme.system'), icon: Monitor, desc: t('hospital.settings.theme.systemDesc') }
  ];

  const accentColors = [
    { value: 'indigo', label: t('hospital.settings.accentColor.indigo'), color: 'bg-indigo-600', ring: 'ring-indigo-600', text: 'text-indigo-600' },
    { value: 'blue', label: t('hospital.settings.accentColor.blue'), color: 'bg-blue-600', ring: 'ring-blue-600', text: 'text-blue-600' },
    { value: 'emerald', label: t('hospital.settings.accentColor.emerald'), color: 'bg-emerald-600', ring: 'ring-emerald-600', text: 'text-emerald-600' },
    { value: 'amber', label: t('hospital.settings.accentColor.amber'), color: 'bg-amber-500', ring: 'ring-amber-500', text: 'text-amber-500' },
    { value: 'rose', label: t('hospital.settings.accentColor.rose'), color: 'bg-rose-600', ring: 'ring-rose-600', text: 'text-rose-600' },
    { value: 'violet', label: t('hospital.settings.accentColor.violet'), color: 'bg-violet-600', ring: 'ring-violet-600', text: 'text-violet-600' }
  ];

  const languageList = Object.values(languages);

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    applyTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const handleLanguageChange = (langCode) => {
    setLanguage(langCode);
    changeLanguage(langCode);
  };

  const handleNotificationChange = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError('');
    setSuccessMessage('');

    try {
      const backendData = {
        theme: theme,
        language: language,
        notifications_enabled: notifications.email || notifications.push
      };

      await userAPI.updateProfile(backendData);

      localStorage.setItem('theme', theme);
      localStorage.setItem('accentColor', accentColor);
      localStorage.setItem('language', language);
      localStorage.setItem('autoTranslate', autoTranslate);
      localStorage.setItem('notifications', JSON.stringify(notifications));
      localStorage.setItem('soundEnabled', soundEnabled);
      localStorage.setItem('display', JSON.stringify(display));

      applyTheme(theme);

      const selectedColor = accentColors.find(c => c.value === accentColor);
      if (selectedColor) {
        document.documentElement.style.setProperty('--accent-color', selectedColor.value);
      }

      changeLanguage(language);

      setSuccessMessage(t('hospital.settings.saved'));
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
      setError(t('hospital.settings.errorSave'));
    } finally {
      setIsSaving(false);
    }
  };

  const getActiveColor = () => {
    const color = accentColors.find(c => c.value === accentColor);
    return color || accentColors[0];
  };

  const activeColor = getActiveColor();

  const tabs = [
    { id: 'appearance', label: t('hospital.settings.tabs.appearance'), icon: Palette },
    { id: 'language', label: t('hospital.settings.tabs.language'), icon: Globe },
    { id: 'notifications', label: t('hospital.settings.tabs.notifications'), icon: Bell },
    { id: 'security', label: t('hospital.settings.tabs.security'), icon: Shield },
    { id: 'display', label: t('hospital.settings.tabs.display'), icon: Monitor }
  ];

  // ── RENDER SECTIONS ──

  const renderAppearance = () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('hospital.settings.theme.title')}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {themes.map((th) => (
            <button
              key={th.value}
              onClick={() => handleThemeChange(th.value)}
              className={`flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${theme === th.value
                  ? `border-${activeColor.value}-600 bg-${activeColor.value}-50 dark:bg-${activeColor.value}-900/20`
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${theme === th.value ? `${activeColor.color} text-white` : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                }`}>
                <th.icon className="w-6 h-6" />
              </div>
              <div>
                <p className={`font-medium ${theme === th.value ? activeColor.text : 'text-gray-900 dark:text-white'}`}>
                  {th.label}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{th.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('hospital.settings.accentColor.title')}</h3>
        <div className="flex flex-wrap gap-3">
          {accentColors.map((c) => (
            <button
              key={c.value}
              onClick={() => setAccentColor(c.value)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${accentColor === c.value
                  ? 'border-gray-900 dark:border-white bg-gray-50 dark:bg-gray-800 ring-2 ring-offset-2 ' + c.ring
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }`}
            >
              <div className={`w-6 h-6 rounded-full ${c.color}`} />
              <span className={`text-sm font-medium ${accentColor === c.value ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'
                }`}>
                {c.label}
              </span>
              {accentColor === c.value && <CheckCircle2 className="w-4 h-4 text-emerald-500 ml-1" />}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('hospital.settings.preview.title')}</h3>
        <div className="p-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 ${activeColor.color} rounded-xl flex items-center justify-center`}>
              <Palette className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">{t('hospital.settings.preview.yourTheme')}</p>
              <p className="text-sm text-gray-500">
                {t('hospital.settings.preview.themeLabel')}: {theme === 'light' ? t('hospital.settings.theme.light') : theme === 'dark' ? t('hospital.settings.theme.dark') : t('hospital.settings.theme.system')} •
                {t('hospital.settings.preview.colorLabel')}: {activeColor.label}
              </p>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button className={`px-4 py-2 ${activeColor.color} text-white rounded-lg text-sm font-medium`}>
              {t('hospital.settings.preview.primaryBtn')}
            </button>
            <button className={`px-4 py-2 border-2 border-${activeColor.value}-600 text-${activeColor.value}-600 rounded-lg text-sm font-medium`}>
              {t('hospital.settings.preview.secondaryBtn')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLanguage = () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('hospital.settings.language.title')}</h3>
        <div className="space-y-3">
          {languageList.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${language === lang.code
                  ? `border-${activeColor.value}-600 bg-${activeColor.value}-50 dark:bg-${activeColor.value}-900/20`
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }`}
            >
              <span className="text-2xl">{lang.flag}</span>
              <div className="flex-1">
                <p className={`font-medium ${language === lang.code ? activeColor.text : 'text-gray-900 dark:text-white'}`}>
                  {lang.name}
                </p>
                <p className="text-xs text-gray-500">{lang.native}</p>
              </div>
              {language === lang.code && (
                <CheckCircle2 className={`w-5 h-5 ${activeColor.text}`} />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800 dark:text-amber-400">{t('hospital.settings.language.autoTranslate')}</p>
            <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
              {t('hospital.settings.language.autoTranslateDesc')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-4 ml-8">
          <button
            onClick={() => setAutoTranslate(!autoTranslate)}
            className={`relative w-12 h-6 rounded-full transition-colors ${autoTranslate ? activeColor.color : 'bg-gray-300 dark:bg-gray-700'
              }`}
          >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${autoTranslate ? 'translate-x-7' : 'translate-x-1'
              }`} />
          </button>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {autoTranslate ? t('hospital.settings.language.enabled') : t('hospital.settings.language.disabled')}
          </span>
        </div>
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('hospital.settings.notifications.channels')}</h3>
        <div className="space-y-3">
          {[
            { key: 'email', label: t('hospital.settings.notifications.email'), desc: t('hospital.settings.notifications.emailDesc'), icon: Mail },
            { key: 'sms', label: t('hospital.settings.notifications.sms'), desc: t('hospital.settings.notifications.smsDesc'), icon: Smartphone },
            { key: 'push', label: t('hospital.settings.notifications.push'), desc: t('hospital.settings.notifications.pushDesc'), icon: Bell }
          ].map((channel) => (
            <div key={channel.key} className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                  <channel.icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{channel.label}</p>
                  <p className="text-sm text-gray-500">{channel.desc}</p>
                </div>
              </div>
              <button
                onClick={() => handleNotificationChange(channel.key)}
                className={`relative w-12 h-6 rounded-full transition-colors ${notifications[channel.key] ? activeColor.color : 'bg-gray-300 dark:bg-gray-700'
                  }`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${notifications[channel.key] ? 'translate-x-7' : 'translate-x-1'
                  }`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
            {soundEnabled ? <Volume2 className="w-5 h-5 text-gray-600" /> : <VolumeX className="w-5 h-5 text-gray-400" />}
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{t('hospital.settings.notifications.sound')}</p>
            <p className="text-sm text-gray-500">{t('hospital.settings.notifications.soundDesc')}</p>
          </div>
        </div>
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={`relative w-12 h-6 rounded-full transition-colors ${soundEnabled ? activeColor.color : 'bg-gray-300 dark:bg-gray-700'
            }`}
        >
          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${soundEnabled ? 'translate-x-7' : 'translate-x-1'
            }`} />
        </button>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('hospital.settings.notifications.events')}</h3>
        <div className="space-y-3">
          {[
            { key: 'naissances', label: t('hospital.settings.notifications.births'), desc: t('hospital.settings.notifications.birthsDesc') },
            { key: 'deces', label: t('hospital.settings.notifications.deaths'), desc: t('hospital.settings.notifications.deathsDesc') },
            { key: 'certificats', label: t('hospital.settings.notifications.certs'), desc: t('hospital.settings.notifications.certsDesc') },
            { key: 'paiements', label: t('hospital.settings.notifications.payments'), desc: t('hospital.settings.notifications.paymentsDesc') },
            { key: 'rapports', label: t('hospital.settings.notifications.reports'), desc: t('hospital.settings.notifications.reportsDesc') },
            { key: 'newsletters', label: t('hospital.settings.notifications.newsletters'), desc: t('hospital.settings.notifications.newslettersDesc') }
          ].map((event) => (
            <div key={event.key} className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{event.label}</p>
                <p className="text-sm text-gray-500">{event.desc}</p>
              </div>
              <button
                onClick={() => handleNotificationChange(event.key)}
                className={`relative w-12 h-6 rounded-full transition-colors ${notifications[event.key] ? activeColor.color : 'bg-gray-300 dark:bg-gray-700'
                  }`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${notifications[event.key] ? 'translate-x-7' : 'translate-x-1'
                  }`} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSecurity = () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('hospital.settings.security.auth')}</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{t('hospital.settings.security.twoFactor')}</p>
                <p className="text-sm text-gray-500">{t('hospital.settings.security.twoFactorDesc')}</p>
              </div>
            </div>
            <button
              onClick={() => setSecurity(prev => ({ ...prev, twoFactor: !prev.twoFactor }))}
              className={`relative w-12 h-6 rounded-full transition-colors ${security.twoFactor ? activeColor.color : 'bg-gray-300 dark:bg-gray-700'
                }`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${security.twoFactor ? 'translate-x-7' : 'translate-x-1'
                }`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                <Fingerprint className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{t('hospital.settings.security.biometric')}</p>
                <p className="text-sm text-gray-500">{t('hospital.settings.security.biometricDesc')}</p>
              </div>
            </div>
            <button
              onClick={() => setSecurity(prev => ({ ...prev, biometric: !prev.biometric }))}
              className={`relative w-12 h-6 rounded-full transition-colors ${security.biometric ? activeColor.color : 'bg-gray-300 dark:bg-gray-700'
                }`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${security.biometric ? 'translate-x-7' : 'translate-x-1'
                }`} />
            </button>
          </div>

          <div className="p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-3">
              <Clock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{t('hospital.settings.security.autoLogout')}</p>
                <p className="text-sm text-gray-500">{t('hospital.settings.security.autoLogoutDesc')}</p>
              </div>
            </div>
            <select
              value={security.sessionTimeout}
              onChange={(e) => setSecurity(prev => ({ ...prev, sessionTimeout: e.target.value }))}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="5">5 {t('hospital.settings.security.minutes')}</option>
              <option value="15">15 {t('hospital.settings.security.minutes')}</option>
              <option value="30">30 {t('hospital.settings.security.minutes')}</option>
              <option value="60">1 {t('hospital.settings.security.hour')}</option>
              <option value="never">{t('hospital.settings.security.never')}</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
          <Lock className="w-5 h-5 text-indigo-600" />
          {t('hospital.settings.security.password')}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          {t('hospital.settings.security.lastChanged')}: {security.passwordLastChanged}
        </p>

        <div className="space-y-4">
          {[
            { key: 'current', label: t('hospital.settings.security.currentPassword') },
            { key: 'new', label: t('hospital.settings.security.newPassword') },
            { key: 'confirm', label: t('hospital.settings.security.confirmPassword') }
          ].map((field) => (
            <div key={field.key}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {field.label}
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword[field.key] ? 'text' : 'password'}
                  name={field.key}
                  value={passwordData[field.key]}
                  onChange={handlePasswordChange}
                  className="w-full pl-12 pr-12 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => ({ ...prev, [field.key]: !prev[field.key] }))}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword[field.key] ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          ))}

          <button
            onClick={() => alert(t('hospital.settings.security.passwordChanged'))}
            className={`w-full py-3 ${activeColor.color} text-white rounded-xl font-medium hover:shadow-lg transition-all hover:scale-[1.02]`}
          >
            {t('hospital.settings.security.changePassword')}
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Laptop className="w-5 h-5 text-indigo-600" />
          {t('hospital.settings.security.sessions')}
        </h3>

        <div className="space-y-3">
          {[
            { device: 'Chrome - Windows', location: 'Kinshasa, RDC', current: true, time: t('hospital.settings.security.currently') },
            { device: 'Safari - iPhone', location: 'Kinshasa, RDC', current: false, time: t('hospital.settings.security.hoursAgo', { count: 2 }) }
          ].map((session, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  {session.device.includes('iPhone') ? <Smartphone className="w-5 h-5" /> : <Laptop className="w-5 h-5" />}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{session.device}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{session.location} • {session.time}</p>
                </div>
              </div>
              {session.current ? (
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 text-xs font-medium rounded-full">
                  {t('hospital.settings.security.current')}
                </span>
              ) : (
                <button className="text-sm text-red-600 hover:text-red-700 font-medium">
                  {t('hospital.settings.security.disconnect')}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderDisplay = () => (
    <div className="space-y-8">
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">{t('hospital.settings.display.title')}</h3>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">{t('hospital.settings.display.compactMode')}</p>
              <p className="text-sm text-gray-500">{t('hospital.settings.display.compactModeDesc')}</p>
            </div>
            <button
              onClick={() => setDisplay(prev => ({ ...prev, compactMode: !prev.compactMode }))}
              className={`relative w-12 h-6 rounded-full transition-colors ${display.compactMode ? activeColor.color : 'bg-gray-300 dark:bg-gray-700'
                }`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${display.compactMode ? 'translate-x-7' : 'translate-x-1'
                }`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">{t('hospital.settings.display.showStats')}</p>
              <p className="text-sm text-gray-500">{t('hospital.settings.display.showStatsDesc')}</p>
            </div>
            <button
              onClick={() => setDisplay(prev => ({ ...prev, showStats: !prev.showStats }))}
              className={`relative w-12 h-6 rounded-full transition-colors ${display.showStats ? activeColor.color : 'bg-gray-300 dark:bg-gray-700'
                }`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${display.showStats ? 'translate-x-7' : 'translate-x-1'
                }`} />
            </button>
          </div>

          <div>
            <p className="font-medium text-gray-900 dark:text-white mb-2">{t('hospital.settings.display.autoRefresh')}</p>
            <p className="text-sm text-gray-500 mb-3">{t('hospital.settings.display.autoRefreshDesc')}</p>
            <select
              value={display.autoRefresh}
              onChange={(e) => setDisplay(prev => ({ ...prev, autoRefresh: e.target.value }))}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="0">{t('hospital.settings.display.disabled')}</option>
              <option value="5">{t('hospital.settings.display.every5min')}</option>
              <option value="10">{t('hospital.settings.display.every10min')}</option>
              <option value="30">{t('hospital.settings.display.every30min')}</option>
            </select>
          </div>

          <div>
            <p className="font-medium text-gray-900 dark:text-white mb-2">{t('hospital.settings.display.dateFormat')}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'].map((format) => (
                <button
                  key={format}
                  onClick={() => setDisplay(prev => ({ ...prev, dateFormat: format }))}
                  className={`p-3 rounded-xl border-2 text-center transition-all ${display.dateFormat === format
                      ? `border-${activeColor.value}-600 bg-${activeColor.value}-50 dark:bg-${activeColor.value}-900/20`
                      : 'border-gray-200 dark:border-gray-700'
                    }`}
                >
                  <p className="font-mono text-sm text-gray-900 dark:text-white">{format}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="font-medium text-gray-900 dark:text-white mb-2">{t('hospital.settings.display.timeFormat')}</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: '24h', label: t('hospital.settings.display.24h'), example: '14:30' },
                { value: '12h', label: t('hospital.settings.display.12h'), example: '2:30 PM' }
              ].map((format) => (
                <button
                  key={format.value}
                  onClick={() => setDisplay(prev => ({ ...prev, timeFormat: format.value }))}
                  className={`p-3 rounded-xl border-2 text-center transition-all ${display.timeFormat === format.value
                      ? `border-${activeColor.value}-600 bg-${activeColor.value}-50 dark:bg-${activeColor.value}-900/20`
                      : 'border-gray-200 dark:border-gray-700'
                    }`}
                >
                  <p className="font-medium text-gray-900 dark:text-white">{format.label}</p>
                  <p className="text-sm text-gray-500">{format.example}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <div className={`w-10 h-10 ${activeColor.color} rounded-xl flex items-center justify-center`}>
            <Settings className="w-5 h-5 text-white" />
          </div>
          {t('hospital.settings.title')}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">{t('hospital.settings.subtitle')}</p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-sm font-medium text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">{successMessage}</p>
        </div>
      )}

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm whitespace-nowrap transition-all ${activeTab === tab.id
                ? `${activeColor.color} text-white shadow-lg`
                : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 sm:p-8">
        {activeTab === 'appearance' && renderAppearance()}
        {activeTab === 'language' && renderLanguage()}
        {activeTab === 'notifications' && renderNotifications()}
        {activeTab === 'security' && renderSecurity()}
        {activeTab === 'display' && renderDisplay()}
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`flex items-center gap-2 px-8 py-3 ${activeColor.color} text-white rounded-xl font-medium hover:shadow-lg transition-all hover:scale-[1.02] disabled:opacity-70`}
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {isSaving ? t('hospital.settings.saving') : t('hospital.settings.save')}
        </button>
      </div>
    </div>
  );
};

export default HospitalParametres;
