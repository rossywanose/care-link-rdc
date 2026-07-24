import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  Clock,
  Save,
  Camera,
  Upload,
  CheckCircle2,
  AlertCircle,
  Edit3,
  Shield,
  Star,
  FileText,
  ChevronRight,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { userAPI, hospitalAPI, birthAPI, deathAPI } from '../../../services/api';
import { useLanguage } from '../../../context/LanguageContext';

const HospitalProfil = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const fileInputRef = useRef(null);
  const [mounted, setMounted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profileData, setProfileData] = useState(null);
  const [stats, setStats] = useState({ births: 0, deaths: 0, certs: 0, rate: '0%' });

  const [formData, setFormData] = useState({
    nom: '',
    nomCourt: '',
    type: 'public',
    niveau: t('hospital.profil.levelDefault'),
    email: '',
    telephone: '',
    telephoneUrgence: '',
    adresse: '',
    commune: '',
    ville: '',
    province: 'Kinshasa',
    pays: t('hospital.profil.countryDefault'),
    siteWeb: '',
    dateCreation: '',
    capaciteLits: 0,
    nombreEmployes: 0,
    services: '',
    directeur: '',
    matricule: '',
    licence: '',
    description: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    setMounted(true);
    fetchProfile();
    fetchStats();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await userAPI.getProfile();
      const user = response.data;
      setProfileData(user);

      let hosp = {};
      if (user.hospital) {
        try {
          const hospRes = await hospitalAPI.getHospital(user.hospital);
          hosp = hospRes.data;
        } catch (err) {
          console.log('Hospital details not available');
        }
      }

      setFormData({
        nom: hosp.name || user.hospital_name || t('hospital.profil.notSpecified'),
        nomCourt: hosp.abbreviation || user.hospital_name?.substring(0, 10)?.toUpperCase() || '',
        type: hosp.hospital_type || 'public',
        niveau: hosp.level || t('hospital.profil.levelDefault'),
        email: hosp.email || user.email || '',
        telephone: user.phone || hosp.phone || '',
        telephoneUrgence: hosp.director_phone || '',
        adresse: hosp.address || user.address || '',
        commune: hosp.commune || user.commune || '',
        ville: hosp.city || user.city || '',
        province: hosp.province || user.province || 'Kinshasa',
        pays: t('hospital.profil.countryDefault'),
        siteWeb: hosp.website ? hosp.website.replace(/^https?:\/\//, '') : '',
        dateCreation: user.created_at ? user.created_at.split('T')[0] : '',
        capaciteLits: hosp.capacity || 0,
        nombreEmployes: hosp.staff_count || 0,
        services: Array.isArray(hosp.services) ? hosp.services.join(', ') : (hosp.services || ''),
        directeur: hosp.director_name || user.full_name || '',
        // ✅ CORRIGÉ : Utiliser hospital_id et official_license
        matricule: hosp.hospital_id || t('hospital.profil.notSpecified'),
        licence: hosp.official_license || t('hospital.profil.notSpecified'),
        description: hosp.description || '',
      });

      if (hosp.logo_url || hosp.logo) {
        setLogoPreview(hosp.logo_url || hosp.logo);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(t('hospital.profil.errorLoad'));
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const [birthRes, deathRes] = await Promise.all([
        birthAPI.getBirthStats(),
        deathAPI.getDeathStats()
      ]);

      const bStats = birthRes.data;
      const dStats = deathRes.data;

      const totalBirths = bStats.total || 0;
      const totalDeaths = dStats.total || 0;
      const approvedBirths = bStats.approved || 0;
      const approvedDeaths = dStats.approved || 0;
      const totalCerts = approvedBirths + approvedDeaths;
      const totalAll = totalBirths + totalDeaths;
      const rate = totalAll > 0 ? ((totalCerts / totalAll) * 100).toFixed(1) : '0';

      setStats({
        births: totalBirths,
        deaths: totalDeaths,
        certs: totalCerts,
        rate: `${rate}%`
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const typesHopital = [
    { value: 'public', label: t('hospital.profil.types.public') },
    { value: 'prive', label: t('hospital.profil.types.prive') },
    { value: 'confessionnel', label: t('hospital.profil.types.confessionnel') },
    { value: 'ong', label: t('hospital.profil.types.ong') }
  ];

  const niveaux = [
    t('hospital.profil.levels.zone'),
    t('hospital.profil.levels.hgr'),
    t('hospital.profil.levels.central'),
    t('hospital.profil.levels.clinic'),
    t('hospital.profil.levels.healthCenter')
  ];

  const provinces = [
    'Kinshasa', 'Bas-Uele', 'Equateur', 'Haut-Katanga', 'Haut-Lomami',
    'Haut-Uele', 'Ituri', 'Kasai', 'Kasai-Central', 'Kasai-Oriental',
    'Kongo-Central', 'Kwango', 'Kwilu', 'Lomami', 'Lualaba', 'Mai-Ndombe',
    'Maniema', 'Mongala', 'Nord-Kivu', 'Nord-Ubangi', 'Sankuru',
    'Sud-Kivu', 'Sud-Ubangi', 'Tanganyika', 'Tshopo', 'Tshuapa'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleLogoClick = () => {
    fileInputRef.current?.click();
  };

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.nom.trim()) newErrors.nom = t('hospital.profil.errors.nom');
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = t('hospital.profil.errors.email');
    if (!formData.telephone.trim()) newErrors.telephone = t('hospital.profil.errors.telephone');
    if (!formData.adresse.trim()) newErrors.adresse = t('hospital.profil.errors.adresse');
    if (!formData.directeur.trim()) newErrors.directeur = t('hospital.profil.errors.directeur');

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setIsSaving(true);
    setError('');
    try {
      const userUpdateData = {
        first_name: formData.directeur.split(' ')[0] || '',
        last_name: formData.directeur.split(' ').slice(1).join(' ') || '',
        phone: formData.telephone,
        address: formData.adresse,
        commune: formData.commune,
        city: formData.ville,
        province: formData.province,
        matricule: formData.matricule,
        grade: formData.licence,
      };

      await userAPI.updateProfile(userUpdateData);

      if (profileData?.hospital) {
        const hospitalUpdateData = {
          name: formData.nom,
          phone: formData.telephone,
          email: formData.email,
          address: formData.adresse,
          commune: formData.commune,
          city: formData.ville,
          province: formData.province,
          director_name: formData.directeur,
          license_number: formData.licence,
          capacity: parseInt(formData.capaciteLits) || 0,
          staff_count: parseInt(formData.nombreEmployes) || 0,
          services: formData.services ? formData.services.split(',').map(s => s.trim()).filter(Boolean) : [],
          website: formData.siteWeb ? (formData.siteWeb.startsWith('http') ? formData.siteWeb : `https://${formData.siteWeb}`) : '',
          hospital_type: formData.type,
          level: formData.niveau,
          description: formData.description,
        };
        await hospitalAPI.updateHospital(profileData.hospital, hospitalUpdateData);

        if (logoFile) {
          const logoFormData = new FormData();
          logoFormData.append('logo', logoFile);
          await hospitalAPI.uploadLogo(profileData.hospital, logoFormData);
        }
      }

      await fetchProfile();

      setIsEditing(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving profile:', err);
      setError(err.response?.data?.detail || err.message || t('hospital.profil.errorSave'));
    } finally {
      setIsSaving(false);
    }
  };

  const statCards = [
    { label: t('hospital.profil.stats.births'), value: stats.births.toLocaleString(), icon: FileText, color: 'from-blue-500 to-blue-600' },
    { label: t('hospital.profil.stats.deaths'), value: stats.deaths.toLocaleString(), icon: AlertCircle, color: 'from-gray-500 to-gray-600' },
    { label: t('hospital.profil.stats.certs'), value: stats.certs.toLocaleString(), icon: CheckCircle2, color: 'from-emerald-500 to-emerald-600' },
    { label: t('hospital.profil.stats.rate'), value: stats.rate, icon: Star, color: 'from-amber-500 to-amber-600' }
  ];

  if (loading) {
    return (
      <div className={`flex items-center justify-center py-20 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
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
            <button onClick={fetchProfile} className="text-sm text-red-600 hover:underline mt-1 transition-all hover:scale-105">
              {t('hospital.profil.retry')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-slide-in-from-top">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center shadow-lg">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            {t('hospital.profil.title')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{t('hospital.profil.subtitle')}</p>
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
              {t('hospital.profil.saving')}
            </>
          ) : isEditing ? (
            <>
              <Save className="w-4 h-4" />
              {t('hospital.profil.save')}
            </>
          ) : (
            <>
              <Edit3 className="w-4 h-4" />
              {t('hospital.profil.edit')}
            </>
          )}
        </button>
      </div>

      {/* Success Alert */}
      {showSuccess && (
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 flex items-center gap-3 animate-slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <p className="text-sm text-emerald-700 dark:text-emerald-400">{t('hospital.profil.success')}</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <div
            key={i}
            className={`bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 transition-all duration-500 hover:shadow-lg hover:scale-[1.02] animate-slide-in-from-bottom-${i + 1}`}
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center shadow-md`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-6 animate-slide-in-from-bottom-2">
          {/* Informations generales */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 transition-all duration-500 hover:shadow-lg">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-600" />
              {t('hospital.profil.sections.general')}
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('hospital.profil.fields.nom')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 rounded-xl border text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                    errors.nom ? 'border-red-300' : 'border-gray-200 dark:border-gray-700'
                  } ${!isEditing ? 'bg-gray-50 dark:bg-gray-800' : 'bg-white dark:bg-gray-900'}`}
                />
                {errors.nom && <p className="mt-1 text-sm text-red-500">{errors.nom}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('hospital.profil.fields.nomCourt')}
                </label>
                <input
                  type="text"
                  name="nomCourt"
                  value={formData.nomCourt}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                    !isEditing ? 'bg-gray-50 dark:bg-gray-800' : 'bg-white dark:bg-gray-900'
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('hospital.profil.fields.type')}
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                    !isEditing ? 'bg-gray-50 dark:bg-gray-800' : 'bg-white dark:bg-gray-900'
                  }`}
                >
                  {typesHopital.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('hospital.profil.fields.niveau')}
                </label>
                <select
                  name="niveau"
                  value={formData.niveau}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                    !isEditing ? 'bg-gray-50 dark:bg-gray-800' : 'bg-white dark:bg-gray-900'
                  }`}
                >
                  {niveaux.map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('hospital.profil.fields.description')}
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  disabled={!isEditing}
                  rows={3}
                  className={`w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none ${
                    !isEditing ? 'bg-gray-50 dark:bg-gray-800' : 'bg-white dark:bg-gray-900'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 transition-all duration-500 hover:shadow-lg animate-slide-in-from-bottom-3">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Phone className="w-5 h-5 text-indigo-600" />
              {t('hospital.profil.sections.contact')}
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('hospital.profil.fields.email')} <span className="text-red-500">*</span>
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
                  {t('hospital.profil.fields.siteWeb')}
                </label>
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="siteWeb"
                    value={formData.siteWeb}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                      !isEditing ? 'bg-gray-50 dark:bg-gray-800' : 'bg-white dark:bg-gray-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('hospital.profil.fields.telephone')} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`w-full pl-12 pr-4 py-3 rounded-xl border text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                      errors.telephone ? 'border-red-300' : 'border-gray-200 dark:border-gray-700'
                    } ${!isEditing ? 'bg-gray-50 dark:bg-gray-800' : 'bg-white dark:bg-gray-900'}`}
                  />
                </div>
                {errors.telephone && <p className="mt-1 text-sm text-red-500">{errors.telephone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('hospital.profil.fields.telephoneUrgence')}
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="telephoneUrgence"
                    value={formData.telephoneUrgence}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                      !isEditing ? 'bg-gray-50 dark:bg-gray-800' : 'bg-white dark:bg-gray-900'
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Adresse */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 transition-all duration-500 hover:shadow-lg animate-slide-in-from-bottom-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-indigo-600" />
              {t('hospital.profil.sections.address')}
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('hospital.profil.fields.adresse')} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="adresse"
                    value={formData.adresse}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`w-full pl-12 pr-4 py-3 rounded-xl border text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                      errors.adresse ? 'border-red-300' : 'border-gray-200 dark:border-gray-700'
                    } ${!isEditing ? 'bg-gray-50 dark:bg-gray-800' : 'bg-white dark:bg-gray-900'}`}
                  />
                </div>
                {errors.adresse && <p className="mt-1 text-sm text-red-500">{errors.adresse}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('hospital.profil.fields.commune')}
                </label>
                <input
                  type="text"
                  name="commune"
                  value={formData.commune}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                    !isEditing ? 'bg-gray-50 dark:bg-gray-800' : 'bg-white dark:bg-gray-900'
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('hospital.profil.fields.ville')}
                </label>
                <input
                  type="text"
                  name="ville"
                  value={formData.ville}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                    !isEditing ? 'bg-gray-50 dark:bg-gray-800' : 'bg-white dark:bg-gray-900'
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('hospital.profil.fields.province')}
                </label>
                <select
                  name="province"
                  value={formData.province}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                    !isEditing ? 'bg-gray-50 dark:bg-gray-800' : 'bg-white dark:bg-gray-900'
                  }`}
                >
                  {provinces.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('hospital.profil.fields.pays')}
                </label>
                <input
                  type="text"
                  name="pays"
                  value={formData.pays}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                    !isEditing ? 'bg-gray-50 dark:bg-gray-800' : 'bg-white dark:bg-gray-900'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Administration */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 transition-all duration-500 hover:shadow-lg animate-slide-in-from-bottom-5">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-600" />
              {t('hospital.profil.sections.admin')}
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('hospital.profil.fields.directeur')} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="directeur"
                    value={formData.directeur}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`w-full pl-12 pr-4 py-3 rounded-xl border text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                      errors.directeur ? 'border-red-300' : 'border-gray-200 dark:border-gray-700'
                    } ${!isEditing ? 'bg-gray-50 dark:bg-gray-800' : 'bg-white dark:bg-gray-900'}`}
                  />
                </div>
                {errors.directeur && <p className="mt-1 text-sm text-red-500">{errors.directeur}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('hospital.profil.fields.capaciteLits')}
                </label>
                <input
                  type="number"
                  name="capaciteLits"
                  value={formData.capaciteLits}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                    !isEditing ? 'bg-gray-50 dark:bg-gray-800' : 'bg-white dark:bg-gray-900'
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('hospital.profil.fields.nombreEmployes')}
                </label>
                <input
                  type="number"
                  name="nombreEmployes"
                  value={formData.nombreEmployes}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                    !isEditing ? 'bg-gray-50 dark:bg-gray-800' : 'bg-white dark:bg-gray-900'
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('hospital.profil.fields.services')}
                </label>
                <input
                  type="text"
                  name="services"
                  value={formData.services}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                    !isEditing ? 'bg-gray-50 dark:bg-gray-800' : 'bg-white dark:bg-gray-900'
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('hospital.profil.fields.dateCreation')}
                </label>
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    name="dateCreation"
                    value={formData.dateCreation}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                      !isEditing ? 'bg-gray-50 dark:bg-gray-800' : 'bg-white dark:bg-gray-900'
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Colonne laterale */}
        <div className="space-y-6 animate-slide-in-from-bottom-3">
          {/* Logo */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 text-center transition-all duration-500 hover:shadow-lg">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">{t('hospital.profil.logo')}</h3>
            <div
              onClick={isEditing ? handleLogoClick : undefined}
              className={`relative w-32 h-32 mx-auto rounded-2xl flex items-center justify-center overflow-hidden transition-all duration-300 ${
                isEditing ? 'cursor-pointer hover:opacity-80 hover:scale-105' : ''
              } ${
                logoPreview
                  ? ''
                  : 'bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-900/30 dark:to-violet-900/30'
              }`}
            >
              {logoPreview ? (
                <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <Building2 className="w-12 h-12 text-indigo-400" />
              )}
              {isEditing && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center animate-fade-in">
                  <Camera className="w-8 h-8 text-white" />
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              className="hidden"
            />
            {isEditing && (
              <button
                onClick={handleLogoClick}
                className="mt-3 flex items-center gap-2 mx-auto text-sm text-indigo-600 hover:text-indigo-700 transition-all hover:scale-105"
              >
                <Upload className="w-4 h-4" />
                {t('hospital.profil.changeLogo')}
              </button>
            )}
          </div>

          {/* Identifiants officiels */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 transition-all duration-500 hover:shadow-lg">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">{t('hospital.profil.ids.title')}</h3>
            <div className="space-y-3">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 transition-all hover:scale-[1.02]">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('hospital.profil.ids.matricule')}</p>
                <p className="font-mono text-sm font-medium text-gray-900 dark:text-white">{formData.matricule || t('hospital.profil.notSpecified')}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 transition-all hover:scale-[1.02]">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('hospital.profil.ids.licence')}</p>
                <p className="font-mono text-sm font-medium text-gray-900 dark:text-white">{formData.licence || t('hospital.profil.notSpecified')}</p>
              </div>
            </div>
          </div>

          {/* Statut du compte */}
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white transition-all duration-500 hover:shadow-lg hover:shadow-emerald-500/30 hover:scale-[1.02]">
            <div className="flex items-center gap-3 mb-3">
              <Shield className="w-8 h-8" />
              <div>
                <p className="font-bold">{t('hospital.profil.status.verified')}</p>
                <p className="text-sm text-emerald-100">{t('hospital.profil.status.approved')}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm text-emerald-100">
              <CheckCircle2 className="w-4 h-4" />
              <span>{t('hospital.profil.status.activeSince')} {formData.dateCreation ? new Date(formData.dateCreation).getFullYear() : 'N/A'}</span>
            </div>
          </div>

          {/* Navigation rapide */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 transition-all duration-500 hover:shadow-lg">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">{t('hospital.profil.nav.title')}</h3>
            <div className="space-y-2">
              {[
                { label: t('hospital.profil.nav.births'), path: '/hospital-dashboard/naissances', icon: FileText },
                { label: t('hospital.profil.nav.deaths'), path: '/hospital-dashboard/deces', icon: AlertCircle },
                { label: t('hospital.profil.nav.certs'), path: '/hospital-dashboard/certificats', icon: CheckCircle2 },
                { label: t('hospital.profil.nav.stats'), path: '/hospital-dashboard/statistiques', icon: Star },
              ].map((item) => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all group hover:scale-[1.02]"
                >
                  <item.icon className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                  <span className="flex-1 text-left">{item.label}</span>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-600 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HospitalProfil;