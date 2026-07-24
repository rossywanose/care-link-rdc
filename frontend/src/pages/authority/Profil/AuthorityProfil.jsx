import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../context/LanguageContext';
import {
  Shield,
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  Save,
  Camera,
  Edit3,
  CheckCircle2,
  AlertCircle,
  X,
  Clock,
  FileText,
  Activity,
  Lock,
  Key,
  Eye,
  EyeOff,
  Award,
  Briefcase,
  Calendar,
  ChevronRight,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { userAPI } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';

const AuthorityProfil = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user: authUser } = useAuth();
  const fileInputRef = useRef(null);
  const [mounted, setMounted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    matricule: '',
    grade: '',
    service: '',
    direction: '',
    province: '',
    commune: '',
    address: '',
    date_of_birth: '',
    birth_place: '',
    id_number: '',
    gender: '',
    marital_status: '',
    nationality: 'Congolaise',
    language: 'fr',
    theme: 'system',
    notifications_enabled: true
  });

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    new_password_confirm: ''
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const [errors, setErrors] = useState({});

  // Mount animation
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await userAPI.getProfile();
      const user = res.data;
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        matricule: user.matricule || '',
        grade: user.grade || '',
        service: user.service || '',
        direction: user.direction || '',
        province: user.province || '',
        commune: user.commune || '',
        address: user.address || '',
        date_of_birth: user.date_of_birth || '',
        birth_place: user.birth_place || '',
        id_number: user.id_number || '',
        gender: user.gender || '',
        marital_status: user.marital_status || '',
        nationality: user.nationality || 'Congolaise',
        language: user.language || 'fr',
        theme: user.theme || 'system',
        notifications_enabled: user.notifications_enabled ?? true
      });
      if (user.avatar) {
        const avatarUrl = user.avatar.startsWith('http') 
          ? user.avatar 
          : `${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}${user.avatar}`;
        setPhotoPreview(avatarUrl);
      } else {
        setPhotoPreview(null);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(t('authority.profil.errorLoad'));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.first_name.trim()) newErrors.first_name = t('authority.profil.errorFirstName');
    if (!formData.last_name.trim()) newErrors.last_name = t('authority.profil.errorLastName');
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = t('authority.profil.errorEmail');
    if (!formData.phone.trim()) newErrors.phone = t('authority.profil.errorPhone');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setIsSaving(true);
    try {
      let updateData;
      if (photoPreview && photoPreview.startsWith('data:')) {
        updateData = new FormData();
        updateData.append('first_name', formData.first_name);
        updateData.append('last_name', formData.last_name);
        updateData.append('email', formData.email);
        updateData.append('phone', formData.phone);
        if (formData.date_of_birth) updateData.append('date_of_birth', formData.date_of_birth);
        if (formData.gender) updateData.append('gender', formData.gender);
        if (formData.marital_status) updateData.append('marital_status', formData.marital_status);
        if (formData.province) updateData.append('province', formData.province);
        if (formData.commune) updateData.append('commune', formData.commune);
        if (formData.address) updateData.append('address', formData.address);
        if (formData.birth_place) updateData.append('birth_place', formData.birth_place);
        if (formData.id_number) updateData.append('id_number', formData.id_number);
        if (formData.grade) updateData.append('grade', formData.grade);
        if (formData.service) updateData.append('service', formData.service);
        if (formData.direction) updateData.append('direction', formData.direction);
        updateData.append('language', formData.language);
        updateData.append('theme', formData.theme);
        updateData.append('notifications_enabled', formData.notifications_enabled);
        const response = await fetch(photoPreview);
        const blob = await response.blob();
        updateData.append('avatar', blob, 'avatar.jpg');
      } else {
        updateData = {
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          phone: formData.phone,
          date_of_birth: formData.date_of_birth,
          gender: formData.gender,
          marital_status: formData.marital_status,
          province: formData.province,
          commune: formData.commune,
          address: formData.address,
          birth_place: formData.birth_place,
          id_number: formData.id_number,
          grade: formData.grade,
          service: formData.service,
          direction: formData.direction,
          language: formData.language,
          theme: formData.theme,
          notifications_enabled: formData.notifications_enabled
        };
      }
      const res = await userAPI.updateProfile(updateData);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      setIsEditing(false);
    } catch (err) {
      console.error('Error saving profile:', err);
      setError(t('authority.profil.errorSave'));
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordSave = async () => {
    if (passwordData.new_password !== passwordData.new_password_confirm) {
      alert(t('authority.profil.passwordMismatch'));
      return;
    }
    try {
      await userAPI.changePassword({
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
        new_password_confirm: passwordData.new_password_confirm
      });
      alert(t('authority.profil.passwordSuccess'));
      setShowPasswordModal(false);
      setPasswordData({ current_password: '', new_password: '', new_password_confirm: '' });
    } catch (err) {
      alert(err.response?.data?.current_password || t('authority.profil.passwordError'));
    }
  };

  const grades = [
    t('authority.profil.gradeTrainee'),
    t('authority.profil.gradeAgent'),
    t('authority.profil.gradeSenior'),
    t('authority.profil.gradeChief'),
    t('authority.profil.gradeDeputy'),
    t('authority.profil.gradeDirector')
  ];

  const directions = [
    t('authority.profil.dirCivil'),
    t('authority.profil.dirRegistry'),
    t('authority.profil.dirTechnical'),
    t('authority.profil.dirAdmin'),
    t('authority.profil.dirLegal')
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 flex items-center gap-3 animate-shake">
        <AlertCircle className="w-6 h-6 text-red-600" />
        <div>
          <p className="text-red-700 dark:text-red-400 font-medium">{error}</p>
          <button onClick={fetchProfile} className="text-sm text-red-600 hover:underline mt-1 flex items-center gap-1">
            <RefreshCw className="w-3 h-3" /> {t('authority.profil.retry')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 max-w-6xl mx-auto transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-slide-in-from-top">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center hover:scale-105 transition-transform">
              <Shield className="w-5 h-5 text-white" />
            </div>
            {t('authority.profil.title')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{t('authority.profil.subtitle')}</p>
        </div>
        <button
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          disabled={isSaving}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all hover:scale-[1.02] active:scale-95 ${
            isEditing
              ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white hover:shadow-lg'
              : 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:shadow-lg hover:shadow-indigo-500/30'
          }`}
        >
          {isSaving ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              {t('authority.profil.saving')}
            </>
          ) : isEditing ? (
            <>
              <Save className="w-4 h-4" />
              {t('authority.profil.save')}
            </>
          ) : (
            <>
              <Edit3 className="w-4 h-4" />
              {t('authority.profil.edit')}
            </>
          )}
        </button>
      </div>

      {/* Success Alert */}
      {showSuccess && (
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 flex items-center gap-3 animate-slide-in-from-bottom">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <p className="text-sm text-emerald-700 dark:text-emerald-400">{t('authority.profil.success')}</p>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informations personnelles */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 hover:shadow-lg transition-all animate-slide-in-from-bottom-1">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-600" />
              {t('authority.profil.personalInfo')}
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('authority.profil.firstName')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 rounded-xl border text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                    errors.first_name ? 'border-red-300' : 'border-gray-200 dark:border-gray-700'
                  } ${!isEditing ? 'bg-gray-50 dark:bg-gray-800' : 'bg-white dark:bg-gray-900'}`}
                />
                {errors.first_name && <p className="mt-1 text-sm text-red-500">{errors.first_name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('authority.profil.lastName')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 rounded-xl border text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                    errors.last_name ? 'border-red-300' : 'border-gray-200 dark:border-gray-700'
                  } ${!isEditing ? 'bg-gray-50 dark:bg-gray-800' : 'bg-white dark:bg-gray-900'}`}
                />
                {errors.last_name && <p className="mt-1 text-sm text-red-500">{errors.last_name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('authority.profil.email')} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`w-full pl-12 pr-4 py-3 rounded-xl border text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                      errors.email ? 'border-red-300' : 'border-gray-200 dark:border-gray-700'
                    } ${!isEditing ? 'bg-gray-50 dark:bg-gray-800' : 'bg-white dark:bg-gray-900'}`}
                  />
                </div>
                {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('authority.profil.phone')} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`w-full pl-12 pr-4 py-3 rounded-xl border text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                      errors.phone ? 'border-red-300' : 'border-gray-200 dark:border-gray-700'
                    } ${!isEditing ? 'bg-gray-50 dark:bg-gray-800' : 'bg-white dark:bg-gray-900'}`}
                  />
                </div>
                {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('authority.profil.birthDate')}
                </label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    name="date_of_birth"
                    value={formData.date_of_birth}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`w-full pl-12 pr-4 py-3 rounded-xl border text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all border-gray-200 dark:border-gray-700 ${!isEditing ? 'bg-gray-50 dark:bg-gray-800' : 'bg-white dark:bg-gray-900'}`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('authority.profil.birthPlace')}
                </label>
                <input
                  type="text"
                  name="birth_place"
                  value={formData.birth_place}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 rounded-xl border text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all border-gray-200 dark:border-gray-700 ${!isEditing ? 'bg-gray-50 dark:bg-gray-800' : 'bg-white dark:bg-gray-900'}`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('authority.profil.gender')}
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 rounded-xl border text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all border-gray-200 dark:border-gray-700 ${!isEditing ? 'bg-gray-50 dark:bg-gray-800' : 'bg-white dark:bg-gray-900'}`}
                >
                  <option value="">{t('authority.profil.select')}</option>
                  <option value="M">{t('authority.profil.male')}</option>
                  <option value="F">{t('authority.profil.female')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('authority.profil.maritalStatus')}
                </label>
                <select
                  name="marital_status"
                  value={formData.marital_status}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 rounded-xl border text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all border-gray-200 dark:border-gray-700 ${!isEditing ? 'bg-gray-50 dark:bg-gray-800' : 'bg-white dark:bg-gray-900'}`}
                >
                  <option value="">{t('authority.profil.select')}</option>
                  <option value="Célibataire">{t('authority.profil.single')}</option>
                  <option value="Marié(e)">{t('authority.profil.married')}</option>
                  <option value="Divorcé(e)">{t('authority.profil.divorced')}</option>
                  <option value="Veuf/Veuve">{t('authority.profil.widowed')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('authority.profil.nationality')}
                </label>
                <input
                  type="text"
                  name="nationality"
                  value={formData.nationality}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 rounded-xl border text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all border-gray-200 dark:border-gray-700 ${!isEditing ? 'bg-gray-50 dark:bg-gray-800' : 'bg-white dark:bg-gray-900'}`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('authority.profil.idNumber')}
                </label>
                <input
                  type="text"
                  name="id_number"
                  value={formData.id_number}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 rounded-xl border text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all border-gray-200 dark:border-gray-700 ${!isEditing ? 'bg-gray-50 dark:bg-gray-800' : 'bg-white dark:bg-gray-900'}`}
                />
              </div>
            </div>
          </div>

          {/* Informations professionnelles */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 hover:shadow-lg transition-all animate-slide-in-from-bottom-2">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-indigo-600" />
              {t('authority.profil.professionalInfo')}
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('authority.profil.matricule')}
                </label>
                <div className="relative">
                  <Award className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="matricule"
                    value={formData.matricule}
                    disabled
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('authority.profil.grade')}
                </label>
                <select
                  name="grade"
                  value={formData.grade}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 rounded-xl border text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all border-gray-200 dark:border-gray-700 ${!isEditing ? 'bg-gray-50 dark:bg-gray-800' : 'bg-white dark:bg-gray-900'}`}
                >
                  <option value="">{t('authority.profil.select')}</option>
                  {grades.map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('authority.profil.service')}
                </label>
                <input
                  type="text"
                  name="service"
                  value={formData.service}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 rounded-xl border text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all border-gray-200 dark:border-gray-700 ${!isEditing ? 'bg-gray-50 dark:bg-gray-800' : 'bg-white dark:bg-gray-900'}`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('authority.profil.direction')}
                </label>
                <select
                  name="direction"
                  value={formData.direction}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 rounded-xl border text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all border-gray-200 dark:border-gray-700 ${!isEditing ? 'bg-gray-50 dark:bg-gray-800' : 'bg-white dark:bg-gray-900'}`}
                >
                  <option value="">{t('authority.profil.select')}</option>
                  {directions.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Adresse */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 hover:shadow-lg transition-all animate-slide-in-from-bottom-3">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-indigo-600" />
              {t('authority.profil.address')}
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('authority.profil.province')}
                </label>
                <input
                  type="text"
                  name="province"
                  value={formData.province}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 rounded-xl border text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all border-gray-200 dark:border-gray-700 ${!isEditing ? 'bg-gray-50 dark:bg-gray-800' : 'bg-white dark:bg-gray-900'}`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('authority.profil.commune')}
                </label>
                <input
                  type="text"
                  name="commune"
                  value={formData.commune}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 rounded-xl border text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all border-gray-200 dark:border-gray-700 ${!isEditing ? 'bg-gray-50 dark:bg-gray-800' : 'bg-white dark:bg-gray-900'}`}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('authority.profil.fullAddress')}
                </label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`w-full pl-12 pr-4 py-3 rounded-xl border text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all border-gray-200 dark:border-gray-700 ${!isEditing ? 'bg-gray-50 dark:bg-gray-800' : 'bg-white dark:bg-gray-900'}`}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Colonne latérale */}
        <div className="space-y-6">
          {/* Photo de profil */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 text-center hover:shadow-lg transition-all animate-slide-in-from-bottom-2">
            <div className="relative inline-block">
              <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-900/30 dark:to-violet-900/30 flex items-center justify-center overflow-hidden border-4 border-white dark:border-gray-800 shadow-lg hover:scale-105 transition-transform">
                {photoPreview ? (
                  <img 
                    src={photoPreview} 
                    alt="Profil" 
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                  />
                ) : null}
                <div className={`w-full h-full items-center justify-center ${photoPreview ? 'hidden' : 'flex'}`}>
                  <User className="w-16 h-16 text-indigo-400" />
                </div>
              </div>
              {isEditing && (
                <button
                  onClick={handlePhotoClick}
                  className="absolute bottom-0 right-0 w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-indigo-700 transition-colors hover:scale-110"
                >
                  <Camera className="w-5 h-5" />
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </div>
            <h3 className="mt-4 text-lg font-bold text-gray-900 dark:text-white">{formData.first_name} {formData.last_name}</h3>
            <p className="text-sm text-gray-500">{formData.grade || t('authority.profil.agent')}</p>
            <p className="text-xs text-gray-400 mt-1">{formData.matricule || t('authority.profil.notAssigned')}</p>

            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Building2 className="w-4 h-4" />
                {formData.direction || t('authority.profil.noDirection')}
              </div>
            </div>
          </div>

          {/* Sécurité */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 hover:shadow-lg transition-all animate-slide-in-from-bottom-3">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-indigo-600" />
              {t('authority.profil.security')}
            </h2>
            <button
              onClick={() => setShowPasswordModal(true)}
              className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all hover:scale-[1.02]"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/20 rounded-lg flex items-center justify-center hover:scale-105 transition-transform">
                  <Key className="w-5 h-5 text-amber-600" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{t('authority.profil.password')}</p>
                  <p className="text-xs text-gray-500">{t('authority.profil.changePassword')}</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal mot de passe */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl max-w-md w-full p-6 animate-slide-in-from-bottom">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/20 rounded-xl flex items-center justify-center">
                  <Key className="w-5 h-5 text-amber-600" />
                </div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t('authority.profil.changePasswordTitle')}</h2>
              </div>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg hover:scale-110 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('authority.profil.currentPassword')}
                </label>
                <div className="relative">
                  <input
                    type={showPassword.current ? 'text' : 'password'}
                    name="current_password"
                    value={passwordData.current_password}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-3 pr-12 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                  <button
                    onClick={() => setShowPassword(prev => ({ ...prev, current: !prev.current }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 hover:scale-110 transition-all"
                  >
                    {showPassword.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('authority.profil.newPassword')}
                </label>
                <div className="relative">
                  <input
                    type={showPassword.new ? 'text' : 'password'}
                    name="new_password"
                    value={passwordData.new_password}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-3 pr-12 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                  <button
                    onClick={() => setShowPassword(prev => ({ ...prev, new: !prev.new }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 hover:scale-110 transition-all"
                  >
                    {showPassword.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('authority.profil.confirmPassword')}
                </label>
                <div className="relative">
                  <input
                    type={showPassword.confirm ? 'text' : 'password'}
                    name="new_password_confirm"
                    value={passwordData.new_password_confirm}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-3 pr-12 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                  <button
                    onClick={() => setShowPassword(prev => ({ ...prev, confirm: !prev.confirm }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 hover:scale-110 transition-all"
                  >
                    {showPassword.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 py-3 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all hover:scale-[1.02] active:scale-95"
                >
                  {t('authority.profil.cancel')}
                </button>
                <button
                  onClick={handlePasswordSave}
                  disabled={!passwordData.current_password || !passwordData.new_password || !passwordData.new_password_confirm}
                  className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-medium hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-95 transition-all"
                >
                  {t('authority.profil.change')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthorityProfil;