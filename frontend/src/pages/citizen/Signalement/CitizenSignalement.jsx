import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../context/LanguageContext';
import { reportAPI, hospitalAPI } from '../../../services/api';
import {
  AlertTriangle,
  Send,
  MapPin,
  Camera,
  X,
  CheckCircle2,
  ChevronDown,
  FileText,
  User,
  Shield,
  Clock,
  MessageSquare,
  Loader2,
  AlertCircle,
  XCircle,
  Eye,
  Filter,
  ChevronRight,
  Calendar,
  BarChart3,
  Building2,
  Search
} from 'lucide-react';

const CitizenSignalement = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  // --- Formulaire states ---
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [errors, setErrors] = useState({});
  const [previewImages, setPreviewImages] = useState([]);

  const [formData, setFormData] = useState({
    type: '',
    severity: 'medium',
    title: '',
    description: '',
    location: '',
    certificateId: '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    anonymous: false,
    images: [],
    hospitalId: null,
    hospitalName: '',
  });

  // --- Système de mention @hôpital ---
  const [hospitals, setHospitals] = useState([]);
  const [showMentionList, setShowMentionList] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionIndex, setMentionIndex] = useState(-1);
  const [filteredHospitals, setFilteredHospitals] = useState([]);
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);
  const locationInputRef = useRef(null);
  const mentionListRef = useRef(null);

  // --- Liste des signalements ---
  const [myReports, setMyReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [reportsError, setReportsError] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Configuration des statuts (traduite)
  const statusConfig = {
    pending: { 
      label: t('signalement.pending'), 
      icon: Clock, 
      color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800' 
    },
    reviewed: { 
      label: t('signalement.inProgress'), 
      icon: Eye, 
      color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' 
    },
    resolved: { 
      label: t('signalement.resolved'), 
      icon: CheckCircle2, 
      color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' 
    },
    rejected: { 
      label: t('signalement.rejected'), 
      icon: XCircle, 
      color: 'text-red-600 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' 
    }
  };

  const severityConfig = {
    low: { label: t('signalement.severityLevels.low'), color: 'bg-blue-500', text: 'text-blue-600' },
    medium: { label: t('signalement.severityLevels.medium'), color: 'bg-amber-500', text: 'text-amber-600' },
    high: { label: t('signalement.severityLevels.high'), color: 'bg-orange-500', text: 'text-orange-600' },
    critical: { label: t('signalement.severityLevels.critical'), color: 'bg-red-500', text: 'text-red-600' }
  };

  const typeConfig = {
    fraud: { label: t('signalement.types.fraud'), icon: Shield },
    error: { label: t('signalement.types.error'), icon: FileText },
    hospital: { label: t('signalement.types.hospital'), icon: User },
    system: { label: t('signalement.types.system'), icon: AlertTriangle },
    other: { label: t('signalement.types.other'), icon: MessageSquare }
  };

  const reportTypes = [
    { value: 'fraud', label: t('signalement.types.fraud'), icon: Shield, desc: t('signalement.types.fraudDesc') },
    { value: 'error', label: t('signalement.types.error'), icon: FileText, desc: t('signalement.types.errorDesc') },
    { value: 'hospital', label: t('signalement.types.hospital'), icon: User, desc: t('signalement.types.hospitalDesc') },
    { value: 'system', label: t('signalement.types.system'), icon: AlertTriangle, desc: t('signalement.types.systemDesc') },
    { value: 'other', label: t('signalement.types.other'), icon: MessageSquare, desc: t('signalement.types.otherDesc') }
  ];

  const severityLevels = [
    { value: 'low', label: t('signalement.severityLevels.low'), color: 'bg-blue-500', desc: t('signalement.severityLevels.lowDesc') },
    { value: 'medium', label: t('signalement.severityLevels.medium'), color: 'bg-amber-500', desc: t('signalement.severityLevels.mediumDesc') },
    { value: 'high', label: t('signalement.severityLevels.high'), color: 'bg-orange-500', desc: t('signalement.severityLevels.highDesc') },
    { value: 'critical', label: t('signalement.severityLevels.critical'), color: 'bg-red-500', desc: t('signalement.severityLevels.criticalDesc') }
  ];

  // Fetch user\'s reports
  useEffect(() => {
    fetchMyReports();
    fetchHospitals();
  }, []);

  // Fermer la liste si on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (mentionListRef.current && !mentionListRef.current.contains(e.target) &&
          locationInputRef.current && !locationInputRef.current.contains(e.target)) {
        setShowMentionList(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchHospitals = async () => {
    try {
      const response = await hospitalAPI.getHospitals({ status: 'active', limit: 100 });
      const data = response.data.results || response.data || [];
      setHospitals(data);
    } catch (err) {
      console.error('Error fetching hospitals:', err);
    }
  };

  const fetchMyReports = async () => {
    setReportsLoading(true);
    setReportsError('');
    try {
      const response = await reportAPI.getCitizenReports();
      const data = response.data.results || response.data || [];
      setMyReports(data);
    } catch (err) {
      console.error('Error fetching reports:', err);
      setReportsError(t('signalement.errorLoad'));
    } finally {
      setReportsLoading(false);
    }
  };

  const filteredReports = React.useMemo(() => {
    if (filterStatus === 'all') return myReports;
    return myReports.filter(r => r.status === filterStatus);
  }, [myReports, filterStatus]);

  const stats = React.useMemo(() => {
    const total = myReports.length;
    const pending = myReports.filter(r => r.status === 'pending').length;
    const reviewed = myReports.filter(r => r.status === 'reviewed').length;
    const resolved = myReports.filter(r => r.status === 'resolved').length;
    const rejected = myReports.filter(r => r.status === 'rejected').length;
    return { total, pending, reviewed, resolved, rejected };
  }, [myReports]);

  const openDetail = (report) => {
    setSelectedReport(report);
    setShowDetailModal(true);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  // ===== SYSTÈME DE MENTION @HÔPITAL =====
  const handleLocationChange = (e) => {
    const value = e.target.value;
    const cursorPosition = e.target.selectionStart;

    setFormData(prev => ({ ...prev, location: value }));

    // Détecter si on est en train de taper @
    const textBeforeCursor = value.substring(0, cursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');

    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
      // Vérifier qu\'il n\'y a pas d\'espace entre @ et le curseur
      if (!textAfterAt.includes(' ')) {
        setMentionQuery(textAfterAt.toLowerCase());
        setMentionIndex(lastAtIndex);
        setShowMentionList(true);
        setSelectedMentionIndex(0);

        // Filtrer les hôpitaux
        const filtered = hospitals.filter(h =>
          h.name.toLowerCase().includes(textAfterAt.toLowerCase()) ||
          h.commune?.toLowerCase().includes(textAfterAt.toLowerCase()) ||
          h.city?.toLowerCase().includes(textAfterAt.toLowerCase())
        );
        setFilteredHospitals(filtered.slice(0, 5));
        return;
      }
    }

    setShowMentionList(false);
    setMentionQuery('');
  };

  const handleLocationKeyDown = (e) => {
    if (!showMentionList || filteredHospitals.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedMentionIndex(prev => 
        prev < filteredHospitals.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedMentionIndex(prev => 
        prev > 0 ? prev - 1 : filteredHospitals.length - 1
      );
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      selectHospital(filteredHospitals[selectedMentionIndex]);
    } else if (e.key === 'Escape') {
      setShowMentionList(false);
    }
  };

  const selectHospital = (hospital) => {
    const beforeMention = formData.location.substring(0, mentionIndex);
    const afterCursor = formData.location.substring(locationInputRef.current?.selectionStart || 0);

    const newLocation = `${beforeMention}@${hospital.name} ${afterCursor}`;

    setFormData(prev => ({
      ...prev,
      location: newLocation,
      hospitalId: hospital.id,
      hospitalName: hospital.name
    }));

    setShowMentionList(false);
    setMentionQuery('');

    setTimeout(() => {
      locationInputRef.current?.focus();
      const newCursorPos = beforeMention.length + hospital.name.length + 2; // +2 pour @ et espace
      locationInputRef.current?.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const removeHospitalMention = () => {
    setFormData(prev => ({ ...prev, hospitalId: null, hospitalName: '' }));
  };

  // ===== FIN SYSTÈME MENTION =====

  const validateStep = (currentStep) => {
    const newErrors = {};

    if (currentStep === 1) {
      if (!formData.type) newErrors.type = t('signalement.selectType');
      if (!formData.title.trim()) newErrors.title = t('signalement.titleRequired');
      if (!formData.description.trim()) newErrors.description = t('signalement.descRequired');
      if (formData.description.length < 20) newErrors.description = t('signalement.descMinChars');
    }

    if (currentStep === 2) {
      if (!formData.location.trim()) newErrors.location = t('signalement.locationRequired');
    }

    if (currentStep === 3 && !formData.anonymous) {
      if (!formData.contactName.trim()) newErrors.contactName = t('signalement.nameRequired');
      if (!formData.contactPhone.trim()) newErrors.contactPhone = t('signalement.phoneRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
      setErrors({});
    }
  };

  const handleBack = () => {
    setStep(step - 1);
    setErrors({});
  };

  const handleSubmit = async () => {
    if (!validateStep(step)) return;

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const reportData = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        severity: formData.severity,
        report_type: formData.type,
        certificate_id: formData.certificateId || "",
        contact_name: formData.anonymous ? "" : formData.contactName,
        contact_phone: formData.anonymous ? "" : formData.contactPhone,
        contact_email: formData.anonymous ? "" : formData.contactEmail || "",
        is_anonymous: formData.anonymous,
        hospital_id: formData.hospitalId || null
      };

      const response = await reportAPI.createCitizenReport(reportData);
      setIsSubmitted(true);
      fetchMyReports();
    } catch (err) {
      console.error('[Signalement] Error:', err);
      const errorMsg = err.response?.data?.detail || 
                       err.response?.data?.error || 
                       t('signalement.errorSubmit');
      setSubmitError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviewImages(prev => [...prev, ...newPreviews]);
    setFormData(prev => ({ ...prev, images: [...prev.images, ...files] }));
  };

  const removeImage = (index) => {
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  const resetForm = () => {
    setIsSubmitted(false);
    setStep(1);
    setFormData({
      type: '', severity: 'medium', title: '', description: '',
      location: '', certificateId: '', contactName: '', contactPhone: '',
      contactEmail: '', anonymous: false, images: [],
      hospitalId: null, hospitalName: ''
    });
    setPreviewImages([]);
    setSubmitError('');
    setErrors({});
    setShowMentionList(false);
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      {submitError && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-600 dark:text-red-400">{submitError}</p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          {t('signalement.reportType')} <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {reportTypes.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => {
                setFormData(prev => ({ ...prev, type: type.value }));
                if (errors.type) setErrors(prev => ({ ...prev, type: '' }));
              }}
              className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all ${formData.type === type.value
                  ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${formData.type === type.value ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                }`}>
                <type.icon className="w-5 h-5" />
              </div>
              <div>
                <p className={`font-medium ${formData.type === type.value ? 'text-indigo-600' : 'text-gray-900 dark:text-white'}`}>
                  {type.label}
                </p>
                <p className="text-xs text-gray-500 mt-1">{type.desc}</p>
              </div>
            </button>
          ))}
        </div>
        {errors.type && <p className="mt-2 text-sm text-red-500">{errors.type}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          {t('signalement.severity')}
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {severityLevels.map((level) => (
            <button
              key={level.value}
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, severity: level.value }))}
              className={`p-3 rounded-xl border-2 text-center transition-all ${formData.severity === level.value
                  ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }`}
            >
              <div className={`w-3 h-3 rounded-full ${level.color} mx-auto mb-2`} />
              <p className={`text-sm font-medium ${formData.severity === level.value ? 'text-indigo-600' : 'text-gray-900 dark:text-white'}`}>
                {level.label}
              </p>
              <p className="text-xs text-gray-500 mt-1 hidden sm:block">{level.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('signalement.titleLabel')} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder={t('signalement.titlePlaceholder')}
          className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${errors.title ? 'border-red-300' : 'border-gray-200 dark:border-gray-700'
            }`}
        />
        {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('signalement.description')} <span className="text-red-500">*</span>
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder={t('signalement.descriptionPlaceholder')}
          rows={5}
          className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none ${errors.description ? 'border-red-300' : 'border-gray-200 dark:border-gray-700'
            }`}
        />
        {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
        <p className="text-xs text-gray-400 mt-1">{formData.description.length} {t('signalement.charCount')}</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('signalement.certificateId')} ({t('signalement.optional')})
        </label>
        <input
          type="text"
          name="certificateId"
          value={formData.certificateId}
          onChange={handleChange}
          placeholder={t('signalement.certificateIdPlaceholder')}
          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('signalement.location')} <span className="text-red-500">*</span>
          <span className="text-xs text-gray-400 font-normal ml-2">
            (Tapez @ pour mentionner un hôpital)
          </span>
        </label>
        <div className="relative">
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            ref={locationInputRef}
            type="text"
            name="location"
            value={formData.location}
            onChange={handleLocationChange}
            onKeyDown={handleLocationKeyDown}
            placeholder={t('signalement.locationPlaceholder')}
            className={`w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${errors.location ? 'border-red-300' : 'border-gray-200 dark:border-gray-700'
              }`}
          />
        </div>
        {errors.location && <p className="mt-1 text-sm text-red-500">{errors.location}</p>}

        {/* LISTE DÉROULANTE DES HÔPITAUX (@mention) */}
        {showMentionList && filteredHospitals.length > 0 && (
          <div
            ref={mentionListRef}
            className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden"
          >
            <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <Building2 className="w-3 h-3" />
                Hôpitaux actifs
              </p>
            </div>
            {filteredHospitals.map((hospital, index) => (
              <button
                key={hospital.id}
                type="button"
                onClick={() => selectHospital(hospital)}
                className={`w-full flex items-center gap-3 px-4 py-3 transition-colors text-left ${
                  index === selectedMentionIndex 
                    ? 'bg-indigo-50 dark:bg-indigo-900/20' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {hospital.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {hospital.commune || hospital.city || 'Kinshasa'} • {hospital.level || 'Hôpital'}
                  </p>
                </div>
                {index === selectedMentionIndex && (
                  <span className="text-xs text-indigo-600 font-medium">
                    Entrée ↵
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Aucun résultat */}
        {showMentionList && mentionQuery && filteredHospitals.length === 0 && (
          <div
            ref={mentionListRef}
            className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl p-4 text-center"
          >
            <Search className="w-5 h-5 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Aucun hôpital trouvé pour "{mentionQuery}"</p>
          </div>
        )}
      </div>

      {/* Affichage de l'hôpital sélectionné */}
      {formData.hospitalId && (
        <div className="flex items-center gap-2 px-3 py-2 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg">
          <Building2 className="w-4 h-4 text-indigo-600" />
          <span className="text-sm text-indigo-700 dark:text-indigo-300">
            Hôpital concerné : <strong>{formData.hospitalName}</strong>
          </span>
          <button
            type="button"
            onClick={removeHospitalMention}
            className="ml-auto p-1 text-indigo-400 hover:text-indigo-600"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          {t('signalement.attachments')} ({t('signalement.optional')})
        </label>
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 text-center hover:border-indigo-400 transition-colors">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            id="image-upload"
          />
          <label htmlFor="image-upload" className="cursor-pointer">
            <Camera className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{t('signalement.clickToAdd')}</p>
            <p className="text-xs text-gray-400 mt-1">{t('signalement.fileTypes')}</p>
          </label>
        </div>

        {previewImages.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-4">
            {previewImages.map((preview, index) => (
              <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                <img src={preview} alt={`Preuve ${index + 1}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800 dark:text-amber-400">{t('signalement.anonymous')}</p>
            <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
              {t('signalement.anonymousDesc')}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
        <input
          type="checkbox"
          name="anonymous"
          checked={formData.anonymous}
          onChange={handleChange}
          className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
        />
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
          {t('signalement.anonymousCheck')}
        </label>
      </div>

      {!formData.anonymous && (
        <div className="space-y-4 animate-in fade-in">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('signalement.contactName')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="contactName"
              value={formData.contactName}
              onChange={handleChange}
              placeholder={t('signalement.contactNamePlaceholder')}
              className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.contactName ? 'border-red-300' : 'border-gray-200 dark:border-gray-700'
                }`}
            />
            {errors.contactName && <p className="mt-1 text-sm text-red-500">{errors.contactName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('signalement.contactPhone')} <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="contactPhone"
              value={formData.contactPhone}
              onChange={handleChange}
              placeholder={t('signalement.contactPhonePlaceholder')}
              className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.contactPhone ? 'border-red-300' : 'border-gray-200 dark:border-gray-700'
                }`}
            />
            {errors.contactPhone && <p className="mt-1 text-sm text-red-500">{errors.contactPhone}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('signalement.contactEmail')} ({t('signalement.optional')})
            </label>
            <input
              type="email"
              name="contactEmail"
              value={formData.contactEmail}
              onChange={handleChange}
              placeholder={t('signalement.contactEmailPlaceholder')}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      )}
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">{t('signalement.summary')}</h3>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
            <span className="text-gray-500">{t('signalement.type')}</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {reportTypes.find(t => t.value === formData.type)?.label}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
            <span className="text-gray-500">{t('signalement.gravity')}</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {severityLevels.find(s => s.value === formData.severity)?.label}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
            <span className="text-gray-500">{t('signalement.titleLabel')}</span>
            <span className="font-medium text-gray-900 dark:text-white text-right max-w-xs">{formData.title}</span>
          </div>
          <div className="py-2 border-b border-gray-200 dark:border-gray-700">
            <span className="text-gray-500 block mb-1">{t('signalement.eventDesc')}</span>
            <p className="font-medium text-gray-900 dark:text-white">{formData.description}</p>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
            <span className="text-gray-500">{t('signalement.location')}</span>
            <span className="font-medium text-gray-900 dark:text-white">{formData.location}</span>
          </div>
          {formData.hospitalId && (
            <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-gray-500">Hôpital mentionné</span>
              <span className="font-medium text-indigo-600 dark:text-indigo-400">{formData.hospitalName}</span>
            </div>
          )}
          {formData.certificateId && (
            <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-gray-500">{t('signalement.concernedCert')}</span>
              <span className="font-medium text-gray-900 dark:text-white">{formData.certificateId}</span>
            </div>
          )}
          <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
            <span className="text-gray-500">{t('signalement.anonymous')}</span>
            <span className="font-medium text-gray-900 dark:text-white">{formData.anonymous ? t('signalement.yes') : t('signalement.no')}</span>
          </div>
          {!formData.anonymous && (
            <>
              <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-500">{t('signalement.contact')}</span>
                <span className="font-medium text-gray-900 dark:text-white">{formData.contactName}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-500">{t('signalement.contactPhone')}</span>
                <span className="font-medium text-gray-900 dark:text-white">{formData.contactPhone}</span>
              </div>
            </>
          )}
          <div className="flex justify-between py-2">
            <span className="text-gray-500">{t('signalement.attachmentsCount')}</span>
            <span className="font-medium text-gray-900 dark:text-white">{previewImages.length} {previewImages.length <= 1 ? t('signalement.photo') : t('signalement.photos')}</span>
          </div>
        </div>
      </div>

      {submitError && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-600 dark:text-red-400">{submitError}</p>
        </div>
      )}
    </div>
  );

  if (isSubmitted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md mx-auto">
          <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{t('signalement.reportSent')}</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            {t('signalement.reportSentDesc')}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            {t('signalement.reference')}: <span className="font-mono font-medium">SIG-{Date.now()}</span>
          </p>
          <div className="space-y-3">
            <button
              onClick={resetForm}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-medium hover:shadow-lg"
            >
              {t('signalement.newReport')}
            </button>
            <button
              onClick={() => { resetForm(); setShowForm(false); }}
              className="w-full py-3 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              {t('signalement.viewMyReports')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const steps = [
    { number: 1, label: t('signalement.step1') },
    { number: 2, label: t('signalement.step2') },
    { number: 3, label: t('signalement.step3') },
    { number: 4, label: t('signalement.step4') }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            {t('signalement.title')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{t('signalement.subtitle')}</p>
        </div>
        {!showForm && (
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl font-medium hover:shadow-lg transition-all hover:scale-[1.02] text-sm"
          >
            <AlertTriangle className="w-4 h-4" />
            {t('signalement.newReport')}
          </button>
        )}
      </div>

      {/* KPI Cards */}
      {!showForm && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: t('signalement.total'), value: stats.total, color: 'from-gray-500 to-gray-600', icon: BarChart3 },
            { label: t('signalement.pending'), value: stats.pending, color: 'from-amber-500 to-amber-600', icon: Clock },
            { label: t('signalement.inProgress'), value: stats.reviewed, color: 'from-blue-500 to-blue-600', icon: Eye },
            { label: t('signalement.resolved'), value: stats.resolved, color: 'from-emerald-500 to-emerald-600', icon: CheckCircle2 },
            { label: t('signalement.rejected'), value: stats.rejected, color: 'from-red-500 to-red-600', icon: XCircle },
          ].map((kpi, i) => (
            <button
              key={i}
              onClick={() => setFilterStatus(kpi.label === t('signalement.total') ? 'all' : 
                kpi.label === t('signalement.pending') ? 'pending' :
                kpi.label === t('signalement.inProgress') ? 'reviewed' :
                kpi.label === t('signalement.resolved') ? 'resolved' : 'rejected')}
              className={`bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 hover:shadow-lg transition-all text-left ${filterStatus === (kpi.label === t('signalement.total') ? 'all' : 
                kpi.label === t('signalement.pending') ? 'pending' :
                kpi.label === t('signalement.inProgress') ? 'reviewed' :
                kpi.label === t('signalement.resolved') ? 'resolved' : 'rejected') ? 'ring-2 ring-indigo-500' : ''}`}
            >
              <div className={`w-9 h-9 bg-gradient-to-br ${kpi.color} rounded-lg flex items-center justify-center mb-3`}>
                <kpi.icon className="w-4 h-4 text-white" />
              </div>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{kpi.value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{kpi.label}</p>
            </button>
          ))}
        </div>
      )}

      {/* Formulaire */}
      {showForm && (
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => setShowForm(false)}
            className="mb-4 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            {t('signalement.backToReports')}
          </button>

          {/* Step Indicator */}
          <div className="flex items-center justify-between mb-8">
            {steps.map((s, index) => (
              <React.Fragment key={s.number}>
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${s.number < step ? 'bg-emerald-500 text-white' :
                      s.number === step ? 'bg-indigo-600 text-white ring-4 ring-indigo-100' :
                        'bg-gray-200 dark:bg-gray-700 text-gray-500'
                    }`}>
                    {s.number < step ? <CheckCircle2 className="w-5 h-5" /> : s.number}
                  </div>
                  <span className={`text-xs mt-2 font-medium ${s.number <= step ? 'text-gray-900 dark:text-white' : 'text-gray-400'
                    }`}>
                    {s.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-1 mx-2 rounded-full mb-6 ${s.number < step ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-700'
                    }`} />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Form */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 sm:p-8 relative">
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
            {step === 4 && renderStep4()}

            {/* Navigation */}
            <div className="flex gap-3 mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
              {step > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-6 py-3 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                >
                  {t('signalement.back')}
                </button>
              )}
              {step < 4 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  {t('signalement.next')}
                  <ChevronDown className="w-5 h-5 rotate-[-90deg]" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {t('signalement.submitting')}
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      {t('signalement.submit')}
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Liste des signalements */}
      {!showForm && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t('signalement.myReports')}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{filteredReports.length} {t('signalement.results')}</p>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">{t('signalement.allStatuses')}</option>
                <option value="pending">{t('signalement.pending')}</option>
                <option value="reviewed">{t('signalement.inProgress')}</option>
                <option value="resolved">{t('signalement.resolved')}</option>
                <option value="rejected">{t('signalement.rejected')}</option>
              </select>
            </div>
          </div>

          {reportsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            </div>
          ) : reportsError ? (
            <div className="p-8 text-center">
              <AlertCircle className="w-10 h-10 mx-auto mb-3 text-red-400" />
              <p className="text-red-600 dark:text-red-400">{reportsError}</p>
              <button onClick={fetchMyReports} className="mt-3 text-sm text-indigo-600 hover:underline">{t('signalement.retry')}</button>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="p-12 text-center">
              <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 dark:text-gray-400 mb-2">{t('signalement.noReports')}</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">{t('signalement.noReportsDesc')}</p>
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all"
              >
                {t('signalement.makeReport')}
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredReports.map((report) => {
                const statusInfo = statusConfig[report.status] || statusConfig.pending;
                const severityInfo = severityConfig[report.severity] || severityConfig.medium;
                const typeInfo = typeConfig[report.report_type] || typeConfig.other;
                const StatusIcon = statusInfo.icon;
                const TypeIcon = typeInfo.icon;

                return (
                  <div key={report.id} className="p-4 sm:p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${statusInfo.color.split(' ').slice(1).join(' ')}`}>
                        <TypeIcon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">{report.title}</h3>
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusInfo.color}`}>
                            <StatusIcon className="w-3 h-3" />
                            {statusInfo.label}
                          </span>
                          <span className="inline-flex items-center gap-1.5 text-xs">
                            <div className={`w-2 h-2 rounded-full ${severityInfo.color}`} />
                            <span className={severityInfo.text}>{severityInfo.label}</span>
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-2">{report.description}</p>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                          <span className="font-mono">{report.report_id}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(report.created_at)}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{report.location}</span>
                        </div>
                        {report.review_notes && (
                          <div className="mt-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-xs text-blue-800 dark:text-blue-300">
                            <p className="font-medium mb-1">{t('signalement.authorityResponse')} :</p>
                            <p>{report.review_notes}</p>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => openDetail(report)}
                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all flex-shrink-0"
                        title={t('signalement.viewDetail')}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-900 z-10">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${(statusConfig[selectedReport.status] || statusConfig.pending).color.split(' ').slice(1).join(' ')}`}>
                  {(React.createElement((typeConfig[selectedReport.report_type] || typeConfig.other).icon, { className: "w-5 h-5" }))}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">{selectedReport.title}</h3>
                  <p className="text-xs text-gray-500 font-mono">{selectedReport.report_id}</p>
                </div>
              </div>
              <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex flex-wrap gap-2">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${(statusConfig[selectedReport.status] || statusConfig.pending).color}`}>
                  {React.createElement((statusConfig[selectedReport.status] || statusConfig.pending).icon, { className: "w-3.5 h-3.5" })}
                  {(statusConfig[selectedReport.status] || statusConfig.pending).label}
                </span>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800`}>
                  <div className={`w-2 h-2 rounded-full ${(severityConfig[selectedReport.severity] || severityConfig.medium).color}`} />
                  <span className={(severityConfig[selectedReport.severity] || severityConfig.medium).text}>
                    {(severityConfig[selectedReport.severity] || severityConfig.medium).label}
                  </span>
                </span>
              </div>

              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{selectedReport.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">{t('signalement.location')}</p>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedReport.location}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">{t('common.date') || 'Date'}</p>
                  <p className="font-medium text-gray-900 dark:text-white">{formatDate(selectedReport.created_at)}</p>
                </div>
                {selectedReport.certificate_id && (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">{t('signalement.concernedCert')}</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedReport.certificate_id}</p>
                  </div>
                )}
              </div>

              {selectedReport.review_notes && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">{t('signalement.authorityResponse')}</p>
                  <p className="text-sm text-blue-700 dark:text-blue-400">{selectedReport.review_notes}</p>
                </div>
              )}

              <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="w-full py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                >
                  {t('signalement.close')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CitizenSignalement;
