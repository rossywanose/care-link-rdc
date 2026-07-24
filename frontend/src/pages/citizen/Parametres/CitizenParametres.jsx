import React, { useState, useEffect } from 'react';
import {
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
  Loader2
} from 'lucide-react';
import { userAPI } from '../../../services/api';
import { useLanguage } from '../../../context/LanguageContext';

const CitizenParametres = () => {
  const { currentLanguage, changeLanguage, languages, t } = useLanguage();
  const [activeTab, setActiveTab] = useState('appearance');
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Appearance settings - lire depuis localStorage au demarrage
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'system');
  const [accentColor, setAccentColor] = useState(() => localStorage.getItem('accentColor') || 'indigo');

  // Language settings - synchronise avec LanguageContext
  const [language, setLanguage] = useState(currentLanguage);
  const [autoTranslate, setAutoTranslate] = useState(() => localStorage.getItem('autoTranslate') === 'true');

  // Notification settings
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('notifications');
    return saved ? JSON.parse(saved) : {
      email: true, sms: false, push: true,
      certificatApproved: true, certificatRejected: true,
      newFeature: false, securityAlert: true, marketing: false
    };
  });

  const [soundEnabled, setSoundEnabled] = useState(() => localStorage.getItem('soundEnabled') !== 'false');

  // Synchroniser language avec LanguageContext quand il change
  useEffect(() => {
    setLanguage(currentLanguage);
  }, [currentLanguage]);

  // Appliquer le theme au document quand il change
  const applyTheme = (newTheme) => {
    const root = document.documentElement;

    if (newTheme === 'dark') {
      root.classList.add('dark');
    } else if (newTheme === 'light') {
      root.classList.remove('dark');
    } else {
      // system
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) root.classList.add('dark');
      else root.classList.remove('dark');
    }
  };

  // Charger les parametres depuis le backend au montage
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await userAPI.getProfile();
      const userData = response.data;

      // Synchroniser avec le backend (priorite au backend)
      if (userData.theme) {
        setTheme(userData.theme);
        localStorage.setItem('theme', userData.theme);
      }
      if (userData.language) {
        setLanguage(userData.language);
        changeLanguage(userData.language); // ← Met a jour le contexte global
      }
      if (userData.notifications_enabled !== undefined) {
        setNotifications(prev => ({
          ...prev,
          email: userData.notifications_enabled,
          push: userData.notifications_enabled
        }));
      }

      // Appliquer le theme charge
      applyTheme(userData.theme || theme);
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError(t('parametres.errorLoad'));
      // Appliquer le theme local en fallback
      applyTheme(theme);
    } finally {
      setIsLoading(false);
    }
  };

  const themes = [
    { value: 'light', label: t('parametres.theme.light'), icon: Sun, desc: t('parametres.theme.lightDesc') },
    { value: 'dark', label: t('parametres.theme.dark'), icon: Moon, desc: t('parametres.theme.darkDesc') },
    { value: 'system', label: t('parametres.theme.system'), icon: Monitor, desc: t('parametres.theme.systemDesc') }
  ];

  const accentColors = [
    { value: 'indigo', label: t('parametres.accentColor.indigo'), color: 'bg-indigo-600' },
    { value: 'blue', label: t('parametres.accentColor.blue'), color: 'bg-blue-600' },
    { value: 'emerald', label: t('parametres.accentColor.emerald'), color: 'bg-emerald-600' },
    { value: 'amber', label: t('parametres.accentColor.amber'), color: 'bg-amber-500' },
    { value: 'rose', label: t('parametres.accentColor.rose'), color: 'bg-rose-600' },
    { value: 'violet', label: t('parametres.accentColor.violet'), color: 'bg-violet-600' }
  ];

  // Utiliser les langues du LanguageContext
  const languageList = Object.values(languages);

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    applyTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  // NOUVEAU: Changer la langue avec mise a jour immediate du contexte
  const handleLanguageChange = (langCode) => {
    setLanguage(langCode);
    changeLanguage(langCode); // ← Met a jour le contexte global IMMEDIATEMENT
  };

  const handleNotificationChange = (key) => {
    setNotifications(prev => {
      const updated = { ...prev, [key]: !prev[key] };
      return updated;
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError('');
    setSuccessMessage('');

    try {
      // Sauvegarder dans le backend (parametres synchronisables)
      const backendData = {
        theme: theme,
        language: language,
        notifications_enabled: notifications.email || notifications.push
      };

      await userAPI.updateProfile(backendData);

      // Sauvegarder les preferences frontend dans localStorage
      localStorage.setItem('theme', theme);
      localStorage.setItem('accentColor', accentColor);
      localStorage.setItem('language', language);
      localStorage.setItem('autoTranslate', autoTranslate);
      localStorage.setItem('notifications', JSON.stringify(notifications));
      localStorage.setItem('soundEnabled', soundEnabled);

      // Appliquer le theme
      applyTheme(theme);

      // Appliquer la couleur d'accent (via CSS variable)
      const selectedColor = accentColors.find(c => c.value === accentColor);
      if (selectedColor) {
        document.documentElement.style.setProperty('--accent-color', selectedColor.value);
      }

      // La langue est deja appliquee par changeLanguage, mais on s'assure
      changeLanguage(language);

      setSuccessMessage(t('parametres.saved'));
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
      const errorData = err.response?.data;
      let errorMsg = t('parametres.errorSave');

      if (errorData) {
        if (typeof errorData === 'object') {
          const messages = [];
          for (const [field, errors] of Object.entries(errorData)) {
            if (Array.isArray(errors)) {
              messages.push(`${field}: ${errors.join(', ')}`);
            } else {
              messages.push(`${field}: ${errors}`);
            }
          }
          errorMsg = messages.join(' | ');
        } else if (typeof errorData === 'string') {
          errorMsg = errorData;
        }
      }

      setError(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'appearance', label: t('parametres.tabs.appearance'), icon: Palette },
    { id: 'language', label: t('parametres.tabs.language'), icon: Globe },
    { id: 'notifications', label: t('parametres.tabs.notifications'), icon: Bell }
  ];

  const getActiveColor = () => {
    const color = accentColors.find(c => c.value === accentColor);
    return color || accentColors[0];
  };

  const activeColor = getActiveColor();

  const renderAppearance = () => (
    <div className="space-y-8">
      {/* Theme */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Theme</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {themes.map((t) => (
            <button
              key={t.value}
              onClick={() => handleThemeChange(t.value)}
              className={`flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${theme === t.value
                  ? `border-${activeColor.value}-600 bg-${activeColor.value}-50 dark:bg-${activeColor.value}-900/20`
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${theme === t.value ? `${activeColor.color} text-white` : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                }`}>
                <t.icon className="w-6 h-6" />
              </div>
              <div>
                <p className={`font-medium ${theme === t.value ? activeColor.text : 'text-gray-900 dark:text-white'}`}>
                  {t.label}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{t.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Accent Color */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Couleur d'accent</h3>
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

      {/* Preview */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Apercu</h3>
        <div className="p-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 ${activeColor.color} rounded-xl flex items-center justify-center`}>
              <Palette className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Votre theme personnalise</p>
              <p className="text-sm text-gray-500">
                Theme: {theme === 'light' ? 'Clair' : theme === 'dark' ? 'Sombre' : 'Systeme'} &bull;
                Couleur: {activeColor.label}
              </p>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button className={`px-4 py-2 ${activeColor.color} text-white rounded-lg text-sm font-medium`}>
              Bouton principal
            </button>
            <button className={`px-4 py-2 border-2 border-${activeColor.value}-600 text-${activeColor.value}-600 rounded-lg text-sm font-medium`}>
              Bouton secondaire
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLanguage = () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Langue de l'interface</h3>
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
            <p className="text-sm font-medium text-amber-800 dark:text-amber-400">Traduction automatique</p>
            <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
              Cette fonctionnalite traduira automatiquement les certificats et documents.
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
            {autoTranslate ? 'Activee' : 'Desactivee'}
          </span>
        </div>
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Canaux de notification</h3>
        <div className="space-y-3">
          {[
            { key: 'email', label: 'Email', desc: 'Notifications par email', icon: Mail },
            { key: 'sms', label: 'SMS', desc: 'Notifications par SMS', icon: Smartphone },
            { key: 'push', label: 'Push', desc: 'Notifications push', icon: Bell }
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
            <p className="font-medium text-gray-900 dark:text-white">Son des notifications</p>
            <p className="text-sm text-gray-500">Jouer un son lors des alertes</p>
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
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Evenements a notifier</h3>
        <div className="space-y-3">
          {[
            { key: 'certificatApproved', label: 'Certificat approuve', desc: 'Lorsqu\'un certificat est valide', icon: CheckCircle2 },
            { key: 'certificatRejected', label: 'Certificat rejete', desc: 'Lorsqu\'une demande est refusee', icon: AlertTriangle },
            { key: 'securityAlert', label: 'Alertes de securite', desc: 'Connexion suspecte', icon: Shield },
            { key: 'newFeature', label: 'Nouvelles fonctionnalites', desc: 'Mises a jour', icon: Bell },
            { key: 'marketing', label: 'Communications', desc: 'Newsletter', icon: Mail }
          ].map((event) => (
            <div key={event.key} className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                  <event.icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{event.label}</p>
                  <p className="text-sm text-gray-500">{event.desc}</p>
                </div>
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

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-sm font-medium text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">{successMessage}</p>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('parametres.title')}</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">{t('parametres.subtitle')}</p>
      </div>

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

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 sm:p-8">
        {activeTab === 'appearance' && renderAppearance()}
        {activeTab === 'language' && renderLanguage()}
        {activeTab === 'notifications' && renderNotifications()}
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`flex items-center gap-2 px-6 py-3 ${activeColor.color} text-white rounded-xl font-medium hover:shadow-lg transition-all hover:scale-[1.02] disabled:opacity-70`}
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <CheckCircle2 className="w-4 h-4" />
          )}
          {isSaving ? t('parametres.saving') : t('parametres.save')}
        </button>
      </div>
    </div>
  );
};

export default CitizenParametres;