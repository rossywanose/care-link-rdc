import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../context/LanguageContext';
import {
  User, Mail, Phone, MapPin, Calendar, Camera, Save, Edit3,
  Shield, CheckCircle2, X, AlertCircle, FileText, Lock, Eye, EyeOff
} from 'lucide-react';
import { userAPI } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';

const API_BASE_URL = process.env.REACT_APP_API_URL?.replace('/api/v1', '') || 'http://127.0.0.1:8000';

const getAvatarUrl = (avatarPath) => {
  if (!avatarPath) return null;
  if (avatarPath.startsWith('http')) return avatarPath;
  if (avatarPath.startsWith('/media/')) return `${API_BASE_URL}${avatarPath}`;
  if (avatarPath.startsWith('/')) return `${API_BASE_URL}/media${avatarPath}`;
  return `${API_BASE_URL}/media/${avatarPath}`;
};

const CitizenProfil = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user: authUser, updateUser } = useAuth();
  const fileInputRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    birth_place: '',
    province: '',
    city: '',
    commune: '',
    address: '',
    id_number: '',
    marital_status: '',
    nationality: 'Congolaise',
    gender: '',
    language: 'fr',
    theme: 'system',
    notifications_enabled: true
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });

  // Données traduites (à l'intérieur du composant pour utiliser t())
  const provinces = [
    'Kinshasa', 'Bas-Uele', 'Equateur', 'Haut-Katanga', 'Haut-Lomami',
    'Haut-Uele', 'Ituri', 'Kasai', 'Kasai-Central', 'Kasai-Oriental',
    'Kongo-Central', 'Kwango', 'Kwilu', 'Lomami', 'Lualaba', 'Mai-Ndombe',
    'Maniema', 'Mongala', 'Nord-Kivu', 'Nord-Ubangi', 'Sankuru',
    'Sud-Kivu', 'Sud-Ubangi', 'Tanganyika', 'Tshopo', 'Tshuapa'
  ];

 const maritalStatuses = [
    { value: 'Célibataire', label: t('profil.maritalStatuses.single') },
    { value: 'Marié(e)', label: t('profil.maritalStatuses.married') },
    { value: 'Divorcé(e)', label: t('profil.maritalStatuses.divorced') },
    { value: 'Veuf/Veuve', label: t('profil.maritalStatuses.widowed') }
  ];

  const genders = [
    { value: 'M', label: t('profil.genders.male') },
    { value: 'F', label: t('profil.genders.female') }
  ];

  const languages = [
    { value: 'fr', label: t('profil.languages.fr') },
    { value: 'ln', label: t('profil.languages.ln') },
    { value: 'kg', label: t('profil.languages.kg') },
    { value: 'lu', label: t('profil.languages.lu') },
    { value: 'sw', label: t('profil.languages.sw') }
  ];

  // Fetch user profile on mount
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await userAPI.getProfile();
      const userData = response.data;

      setFormData({
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        date_of_birth: userData.date_of_birth || '',
        birth_place: userData.birth_place || '',
        province: userData.province || '',
        city: userData.city || '',
        commune: userData.commune || '',
        address: userData.address || '',
        id_number: userData.id_number || '',
        marital_status: userData.marital_status || '',
        nationality: userData.nationality || 'Congolaise',
        gender: userData.gender || '',
        language: userData.language || 'fr',
        theme: userData.theme || 'system',
        notifications_enabled: userData.notifications_enabled !== false
      });

      if (userData.avatar) {
        setPreviewPhoto(getAvatarUrl(userData.avatar));
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(t('profil.errorLoad'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePhotoClick = () => {
    if (isEditing) {
      fileInputRef.current?.click();
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewPhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError('');
    try {
      let response;

      if (photoFile) {
        // Upload avec photo via FormData
        const data = new FormData();
        data.append('first_name', formData.first_name);
        data.append('last_name', formData.last_name);
        data.append('phone', formData.phone);
        data.append('date_of_birth', formData.date_of_birth);
        data.append('birth_place', formData.birth_place);
        data.append('province', formData.province);
        data.append('city', formData.city);
        data.append('commune', formData.commune);
        data.append('address', formData.address);
        data.append('id_number', formData.id_number);
        data.append('marital_status', formData.marital_status);
        data.append('nationality', formData.nationality);
        data.append('gender', formData.gender);
        data.append('language', formData.language);
        data.append('theme', formData.theme);
        data.append('notifications_enabled', formData.notifications_enabled);
        data.append('avatar', photoFile);

        response = await userAPI.updateProfile(data);
      } else {
        // Sans photo
        const updateData = {
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone,
          date_of_birth: formData.date_of_birth,
          birth_place: formData.birth_place,
          province: formData.province,
          city: formData.city,
          commune: formData.commune,
          address: formData.address,
          id_number: formData.id_number,
          marital_status: formData.marital_status,
          nationality: formData.nationality,
          gender: formData.gender,
          language: formData.language,
          theme: formData.theme,
          notifications_enabled: formData.notifications_enabled
        };

        response = await userAPI.updateProfile(updateData);
      }

      // Update auth context with new user data
      if (updateUser) {
        updateUser(response.data);
      }

      // Met à jour l'avatar avec l'URL complète du backend
      if (response.data.avatar) {
        setPreviewPhoto(getAvatarUrl(response.data.avatar));
      }

      setPhotoFile(null);
      setIsEditing(false);
      setSuccessMessage(t('profil.saved'));
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error saving profile:', err);
      const errorData = err.response?.data;
      let errorMsg = t('profil.errorSave');

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

  const handlePasswordChange = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setError(t('profil.allFieldsRequired'));
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError(t('profil.passwordsNotMatch'));
      return;
    }
    if (passwordData.newPassword.length < 8) {
      setError(t('profil.passwordMinChars'));
      return;
    }

    setIsSaving(true);
    setError('');
    try {
      await userAPI.changePassword({
        current_password: passwordData.currentPassword,
        new_password: passwordData.newPassword,
        new_password_confirm: passwordData.confirmPassword
      });

      setShowPasswordModal(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setSuccessMessage(t('profil.passwordChanged'));
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error changing password:', err);
      const errorData = err.response?.data;
      let errorMsg = t('profil.errorPassword');

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

  const renderField = (label, name, value, IconComponent, type = 'text', options = null) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
      </label>
      <div className="relative">
        <IconComponent className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        {isEditing && options ? (
          <select
            name={name}
            value={value}
            onChange={handleChange}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
          >
            <option value="">{t('profil.selectPlaceholder')}</option>
            {options.map(opt => (
              <option key={opt.value || opt} value={opt.value || opt}>
                {opt.label || opt}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={type}
            name={name}
            value={value}
            onChange={handleChange}
            disabled={!isEditing}
            className={`w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white ${!isEditing ? 'cursor-default' : 'focus:outline-none focus:ring-2 focus:ring-indigo-500'
              }`}
          />
        )}
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
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 flex items-center gap-3 animate-in fade-in">
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

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('profil.title')}</h1>
        <div className="flex gap-3">
          <button
            onClick={() => setShowPasswordModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
          >
            <Lock className="w-4 h-4" />
            <span className="hidden sm:inline">{t('profil.password')}</span>
          </button>
          {isEditing ? (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-70"
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {t('profil.save')}
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
            >
              <Edit3 className="w-4 h-4" />
              {t('profil.edit')}
            </button>
          )}
        </div>
      </div>

      {/* Photo Card */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative">
            <div
              onClick={handlePhotoClick}
              className={`w-28 h-28 rounded-full overflow-hidden border-4 border-gray-100 dark:border-gray-800 shadow-lg ${isEditing ? 'cursor-pointer hover:opacity-80' : ''
                }`}
            >
              {previewPhoto ? (
                <img src={previewPhoto} alt="Photo" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                  <User className="w-12 h-12 text-white" />
                </div>
              )}
            </div>
            {isEditing && (
              <div
                onClick={handlePhotoClick}
                className="absolute bottom-0 right-0 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-indigo-700 shadow-lg"
              >
                <Camera className="w-4 h-4 text-white" />
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
            />
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {formData.first_name} {formData.last_name}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">{t('profil.citizenLabel')}</p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-medium">
                <Shield className="w-3 h-3" />
                {t('profil.verified')}
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-xs font-medium">
                <FileText className="w-3 h-3" />
                12 {t('profil.certCount')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Personal Info */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">{t('profil.sections.personalInfo')}</h3>
        <div className="grid md:grid-cols-2 gap-6">
          {renderField(t('profil.fields.firstName'), 'first_name', formData.first_name, User)}
          {renderField(t('profil.fields.lastName'), 'last_name', formData.last_name, User)}
          {renderField(t('profil.fields.email'), 'email', formData.email, Mail, 'email')}
          {renderField(t('profil.fields.phone'), 'phone', formData.phone, Phone, 'tel')}
          {renderField(t('profil.fields.birthDate'), 'date_of_birth', formData.date_of_birth, Calendar, 'date')}
          {renderField(t('profil.fields.birthPlace'), 'birth_place', formData.birth_place, MapPin)}
          {renderField(t('profil.fields.nationality'), 'nationality', formData.nationality, Shield)}
          {renderField(t('profil.fields.maritalStatus'), 'marital_status', formData.marital_status, User, 'text', maritalStatuses)}
          {renderField(t('profil.fields.gender'), 'gender', formData.gender, User, 'text', genders)}
          {renderField(t('profil.fields.idNumber'), 'id_number', formData.id_number, FileText)}
        </div>
      </div>

      {/* Address */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">{t('profil.sections.address')}</h3>
        <div className="grid md:grid-cols-2 gap-6">
          {renderField(t('profil.fields.province'), 'province', formData.province, MapPin, 'text', provinces)}
          {renderField(t('profil.fields.city'), 'city', formData.city, MapPin)}
          {renderField(t('profil.fields.commune'), 'commune', formData.commune, MapPin)}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('profil.fields.fullAddress')}
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              disabled={!isEditing}
              rows={3}
              className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white resize-none ${!isEditing ? 'cursor-default' : 'focus:outline-none focus:ring-2 focus:ring-indigo-500'
                }`}
            />
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">{t('profil.sections.preferences')}</h3>
        <div className="grid md:grid-cols-2 gap-6">
          {renderField(t('profil.fields.language'), 'language', formData.language, User, 'text', languages)}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('profil.fields.notifications')}
            </label>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                name="notifications_enabled"
                checked={formData.notifications_enabled}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-5 h-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {t('profil.fields.enableNotifications')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Account Info */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">{t('profil.sections.accountInfo')}</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{t('profil.account.memberSince')}</p>
                <p className="text-sm text-gray-500">{authUser?.created_at ? new Date(authUser.created_at).toLocaleDateString('fr-FR') : '15 janvier 2024'}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{t('profil.account.lastLogin')}</p>
                <p className="text-sm text-gray-500">{authUser?.last_login ? new Date(authUser.last_login).toLocaleDateString('fr-FR') : t('profil.account.today')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('profil.passwordModal.title')}</h3>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {[
                { key: 'currentPassword', label: t('profil.passwordModal.currentPassword'), showKey: 'current' },
                { key: 'newPassword', label: t('profil.passwordModal.newPassword'), showKey: 'new' },
                { key: 'confirmPassword', label: t('profil.passwordModal.confirmPassword'), showKey: 'confirm' }
              ].map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {field.label}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPasswords[field.showKey] ? 'text' : 'password'}
                      value={passwordData[field.key]}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, [field.key]: e.target.value }))}
                      className="w-full pl-12 pr-12 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({ ...prev, [field.showKey]: !prev[field.showKey] }))}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      {showPasswords[field.showKey] ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-800 flex gap-3">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="flex-1 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                {t('profil.cancel')}
              </button>
              <button
                onClick={handlePasswordChange}
                disabled={isSaving}
                className="flex-1 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-medium hover:shadow-lg disabled:opacity-70"
              >
                {isSaving ? t('profil.modifying') : t('profil.modify')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CitizenProfil;
