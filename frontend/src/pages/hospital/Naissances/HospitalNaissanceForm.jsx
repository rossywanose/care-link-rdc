import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Baby, ChevronRight, ChevronLeft, CheckCircle2, AlertCircle,
  Loader2, User, Calendar, MapPin, Weight, Heart, FileText,
  Upload, X, Check
} from 'lucide-react';
import { birthAPI } from '../../../services/api';
import { useLanguage } from '../../../context/LanguageContext';

const HospitalNaissanceForm = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [stepDirection, setStepDirection] = useState('next');

  useEffect(() => {
    setMounted(true);
  }, []);

  const STEPS = [
    { id: 1, label: t('hospital.naissanceForm.steps.child'), icon: Baby },
    { id: 2, label: t('hospital.naissanceForm.steps.father'), icon: User },
    { id: 3, label: t('hospital.naissanceForm.steps.mother'), icon: Heart },
    { id: 4, label: t('hospital.naissanceForm.steps.documents'), icon: FileText }
  ];

  const [formData, setFormData] = useState({
    child_first_name: '',
    child_last_name: '',
    gender: 'M',
    date_of_birth: '',
    time_of_birth: '',
    place_of_birth: '',
    weight: '',
    father_first_name: '',
    father_last_name: '',
    father_date_of_birth: '',
    father_nationality: t('hospital.naissanceForm.fields.nationalityDefault'),
    father_profession: '',
    father_id_number: '',
    mother_first_name: '',
    mother_last_name: '',
    mother_date_of_birth: '',
    mother_nationality: t('hospital.naissanceForm.fields.nationalityDefault'),
    mother_profession: '',
    mother_id_number: '',
    doctor_name: '',
    doctor_license: '',
    medical_certificate: null,
    father_id_doc: null,
    mother_id_doc: null,
    marriage_certificate: null
  });

  const [uploadedFiles, setUploadedFiles] = useState({
    medical_certificate: null,
    father_id_doc: null,
    mother_id_doc: null,
    marriage_certificate: null
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, [fieldName]: file }));
      setUploadedFiles(prev => ({ ...prev, [fieldName]: file.name }));
    }
  };

  const removeFile = (fieldName) => {
    setFormData(prev => ({ ...prev, [fieldName]: null }));
    setUploadedFiles(prev => ({ ...prev, [fieldName]: null }));
  };

  const validateStep = () => {
    switch (currentStep) {
      case 1:
        if (!formData.child_first_name || !formData.child_last_name || !formData.date_of_birth || !formData.place_of_birth) {
          setError(t('hospital.naissanceForm.error.step1'));
          return false;
        }
        break;
      case 2:
        if (!formData.father_first_name || !formData.father_last_name) {
          setError(t('hospital.naissanceForm.error.step2'));
          return false;
        }
        break;
      case 3:
        if (!formData.mother_first_name || !formData.mother_last_name) {
          setError(t('hospital.naissanceForm.error.step3'));
          return false;
        }
        break;
      case 4:
        if (!formData.doctor_name) {
          setError(t('hospital.naissanceForm.error.step4'));
          return false;
        }
        break;
      default:
        break;
    }
    setError('');
    return true;
  };

  const nextStep = () => {
    if (validateStep()) {
      setStepDirection('next');
      setCurrentStep(prev => Math.min(STEPS.length, prev + 1));
    }
  };

  const prevStep = () => {
    setError('');
    setStepDirection('prev');
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;

    setIsSubmitting(true);
    setError('');

    try {
      const hasFiles = formData.medical_certificate || formData.father_id_doc || 
                       formData.mother_id_doc || formData.marriage_certificate;

      let response;

      if (hasFiles) {
        const data = new FormData();
        Object.keys(formData).forEach(key => {
          if (!['medical_certificate', 'father_id_doc', 'mother_id_doc', 'marriage_certificate'].includes(key)) {
            const value = formData[key];
            if (value !== null && value !== undefined && value !== '') {
              data.append(key, value);
            }
          }
        });
        if (formData.medical_certificate) data.append('medical_certificate', formData.medical_certificate);
        if (formData.father_id_doc) data.append('father_id_doc', formData.father_id_doc);
        if (formData.mother_id_doc) data.append('mother_id_doc', formData.mother_id_doc);
        if (formData.marriage_certificate) data.append('marriage_certificate', formData.marriage_certificate);
        response = await birthAPI.createBirth(data);
      } else {
        const cleanData = {};
        Object.keys(formData).forEach(key => {
          if (['medical_certificate', 'father_id_doc', 'mother_id_doc', 'marriage_certificate'].includes(key)) return;
          const value = formData[key];
          if (value === '' || value === null || value === undefined) {
            const requiredFields = [
              'child_first_name', 'child_last_name', 'gender', 
              'date_of_birth', 'place_of_birth',
              'father_first_name', 'father_last_name',
              'mother_first_name', 'mother_last_name', 'doctor_name'
            ];
            if (!requiredFields.includes(key)) return;
          }
          cleanData[key] = value;
        });
        if (cleanData.weight) {
          cleanData.weight = parseFloat(cleanData.weight);
        }
        response = await birthAPI.createBirth(cleanData);
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/hospital-dashboard/naissances');
      }, 2000);
    } catch (err) {
      console.error('Error creating birth:', err);
      if (err.response?.data) {
        const errorData = err.response.data;
        let errorMsg = t('hospital.naissanceForm.error.submit');
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
        setError(errorMsg);
      } else {
        setError(t('hospital.naissanceForm.error.submit'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-8 animate-slide-in-from-top">
      {STEPS.map((step, index) => (
        <React.Fragment key={step.id}>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-500 ${
            currentStep === step.id
              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg scale-105'
              : currentStep > step.id
                ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
          }`}>
            {currentStep > step.id ? (
              <CheckCircle2 className="w-4 h-4 animate-bounce-in" />
            ) : (
              <step.icon className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">{step.label}</span>
          </div>
          {index < STEPS.length - 1 && (
            <ChevronRight className={`w-4 h-4 transition-all duration-500 ${currentStep > step.id ? 'text-emerald-500' : 'text-gray-300'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const renderInput = (label, name, type = 'text', placeholder = '', required = false, options = null) => (
    <div className="space-y-2 animate-fade-in">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {options ? (
        <select
          name={name}
          value={formData[name]}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all hover:border-gray-400 dark:hover:border-gray-600"
        >
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          name={name}
          value={formData[name]}
          onChange={handleChange}
          placeholder={placeholder}
          className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all hover:border-gray-400 dark:hover:border-gray-600"
        />
      )}
    </div>
  );

  const renderFileUpload = (label, fieldName, required = false) => (
    <div className="space-y-2 animate-fade-in">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {uploadedFiles[fieldName] ? (
        <div className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl animate-slide-in-from-right">
          <FileText className="w-5 h-5 text-emerald-600" />
          <span className="flex-1 text-sm text-gray-700 dark:text-gray-300 truncate">{uploadedFiles[fieldName]}</span>
          <button
            onClick={() => removeFile(fieldName)}
            className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition-all hover:scale-110"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl cursor-pointer hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all duration-300 group">
          <Upload className="w-8 h-8 text-gray-400 mb-2 group-hover:scale-110 group-hover:text-blue-500 transition-transform" />
          <span className="text-sm text-gray-500">{t('hospital.naissanceForm.upload.click')}</span>
          <input
            type="file"
            className="hidden"
            onChange={(e) => handleFileChange(e, fieldName)}
            accept=".pdf,.jpg,.jpeg,.png"
          />
        </label>
      )}
    </div>
  );

  const getStepAnimation = () => {
    if (stepDirection === 'next') {
      return 'animate-slide-in-from-right';
    }
    return 'animate-slide-in-from-left';
  };

  const renderStep1 = () => (
    <div className={`space-y-6 ${getStepAnimation()}`}>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
        <Baby className="w-6 h-6 text-blue-600" />
        {t('hospital.naissanceForm.step1.title')}
      </h2>
      <div className="grid md:grid-cols-2 gap-6">
        {renderInput(t('hospital.naissanceForm.fields.firstName'), 'child_first_name', 'text', t('hospital.naissanceForm.fields.childFirstNamePlaceholder'), true)}
        {renderInput(t('hospital.naissanceForm.fields.lastName'), 'child_last_name', 'text', t('hospital.naissanceForm.fields.childLastNamePlaceholder'), true)}
        {renderInput(t('hospital.naissanceForm.fields.sex'), 'gender', 'select', '', true, [
          { value: 'M', label: t('hospital.naissanceForm.fields.male') },
          { value: 'F', label: t('hospital.naissanceForm.fields.female') }
        ])}
        {renderInput(t('hospital.naissanceForm.fields.birthDate'), 'date_of_birth', 'date', '', true)}
        {renderInput(t('hospital.naissanceForm.fields.birthTime'), 'time_of_birth', 'time')}
        {renderInput(t('hospital.naissanceForm.fields.birthPlace'), 'place_of_birth', 'text', t('hospital.naissanceForm.fields.birthPlacePlaceholder'), true)}
        {renderInput(t('hospital.naissanceForm.fields.weight'), 'weight', 'number', t('hospital.naissanceForm.fields.weightPlaceholder'))}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className={`space-y-6 ${getStepAnimation()}`}>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
        <User className="w-6 h-6 text-blue-600" />
        {t('hospital.naissanceForm.step2.title')}
      </h2>
      <div className="grid md:grid-cols-2 gap-6">
        {renderInput(t('hospital.naissanceForm.fields.firstName'), 'father_first_name', 'text', '', true)}
        {renderInput(t('hospital.naissanceForm.fields.lastName'), 'father_last_name', 'text', '', true)}
        {renderInput(t('hospital.naissanceForm.fields.fatherBirthDate'), 'father_date_of_birth', 'date')}
        {renderInput(t('hospital.naissanceForm.fields.nationality'), 'father_nationality', 'text', t('hospital.naissanceForm.fields.nationalityDefault'))}
        {renderInput(t('hospital.naissanceForm.fields.profession'), 'father_profession', 'text')}
        {renderInput(t('hospital.naissanceForm.fields.idNumber'), 'father_id_number', 'text')}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className={`space-y-6 ${getStepAnimation()}`}>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
        <Heart className="w-6 h-6 text-pink-500" />
        {t('hospital.naissanceForm.step3.title')}
      </h2>
      <div className="grid md:grid-cols-2 gap-6">
        {renderInput(t('hospital.naissanceForm.fields.firstName'), 'mother_first_name', 'text', '', true)}
        {renderInput(t('hospital.naissanceForm.fields.lastName'), 'mother_last_name', 'text', '', true)}
        {renderInput(t('hospital.naissanceForm.fields.fatherBirthDate'), 'mother_date_of_birth', 'date')}
        {renderInput(t('hospital.naissanceForm.fields.nationality'), 'mother_nationality', 'text', t('hospital.naissanceForm.fields.nationalityDefault'))}
        {renderInput(t('hospital.naissanceForm.fields.profession'), 'mother_profession', 'text')}
        {renderInput(t('hospital.naissanceForm.fields.idNumber'), 'mother_id_number', 'text')}
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className={`space-y-6 ${getStepAnimation()}`}>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
        <FileText className="w-6 h-6 text-blue-600" />
        {t('hospital.naissanceForm.step4.title')}
      </h2>
      <div className="grid md:grid-cols-2 gap-6">
        {renderInput(t('hospital.naissanceForm.fields.doctorName'), 'doctor_name', 'text', t('hospital.naissanceForm.fields.doctorPlaceholder'), true)}
        {renderInput(t('hospital.naissanceForm.fields.doctorLicense'), 'doctor_license', 'text')}
        {renderFileUpload(t('hospital.naissanceForm.fields.medicalCert'), 'medical_certificate')}
        {renderFileUpload(t('hospital.naissanceForm.fields.fatherId'), 'father_id_doc')}
        {renderFileUpload(t('hospital.naissanceForm.fields.motherId'), 'mother_id_doc')}
        {renderFileUpload(t('hospital.naissanceForm.fields.marriageCert'), 'marriage_certificate')}
      </div>
    </div>
  );

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-zoom-in">
        <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mb-6 animate-bounce-in">
          <CheckCircle2 className="w-10 h-10 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 animate-slide-in-from-bottom-1">{t('hospital.naissanceForm.success.title')}</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6 animate-slide-in-from-bottom-2">{t('hospital.naissanceForm.success.desc')}</p>
        <button
          onClick={() => navigate('/hospital-dashboard/naissances')}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:shadow-lg transition-all hover:scale-[1.02] active:scale-95 animate-slide-in-from-bottom-3"
        >
          {t('hospital.naissanceForm.success.view')}
        </button>
      </div>
    );
  }

  return (
    <div className={`max-w-4xl mx-auto transition-all duration-700 ease-out ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      {/* Header */}
      <div className="mb-8 animate-slide-in-from-top">
        <button
          onClick={() => navigate('/hospital-dashboard/naissances')}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 mb-4 transition-all hover:translate-x-[-4px]"
        >
          <ChevronLeft className="w-4 h-4" />
          {t('hospital.naissanceForm.back')}
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('hospital.naissanceForm.title')}</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">{t('hospital.naissanceForm.subtitle')}</p>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center gap-3 mb-6 animate-shake">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Step Indicator */}
      {renderStepIndicator()}

      {/* Form Content */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 sm:p-8 hover:shadow-lg transition-shadow duration-300">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-[1.02] active:scale-95"
          >
            <ChevronLeft className="w-4 h-4" />
            {t('hospital.naissanceForm.nav.prev')}
          </button>

          {currentStep < STEPS.length ? (
            <button
              onClick={nextStep}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:shadow-lg transition-all hover:scale-[1.02] active:scale-95"
            >
              {t('hospital.naissanceForm.nav.next')}
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl font-medium hover:shadow-lg transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-70"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              {isSubmitting ? t('hospital.naissanceForm.nav.saving') : t('hospital.naissanceForm.nav.save')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default HospitalNaissanceForm;