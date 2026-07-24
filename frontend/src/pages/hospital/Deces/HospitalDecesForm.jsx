import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Skull, ChevronRight, ChevronLeft, CheckCircle2, AlertCircle,
  Loader2, User, Calendar, MapPin, Heart, FileText,
  Upload, X, Stethoscope
} from 'lucide-react';
import { deathAPI } from '../../../services/api';
import { useLanguage } from '../../../context/LanguageContext';

const HospitalDecesForm = () => {
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
    { id: 1, label: t('hospital.decesForm.steps.deceased'), icon: Skull },
    { id: 2, label: t('hospital.decesForm.steps.parents'), icon: User },
    { id: 3, label: t('hospital.decesForm.steps.declarant'), icon: User },
    { id: 4, label: t('hospital.decesForm.steps.documents'), icon: FileText }
  ];

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    gender: 'M',
    date_of_birth: '',
    date_of_death: '',
    time_of_death: '',
    place_of_death: '',
    age_at_death: '',
    cause_of_death: '',
    cause_category: '',
    father_first_name: '',
    father_last_name: '',
    mother_first_name: '',
    mother_last_name: '',
    spouse_first_name: '',
    spouse_last_name: '',
    declarant_name: '',
    declarant_relationship: '',
    declarant_phone: '',
    declarant_id_number: '',
    doctor_name: '',
    doctor_license: '',
    death_certificate_medical: null,
    declarant_id_doc: null,
    police_report: null
  });

  const [uploadedFiles, setUploadedFiles] = useState({
    death_certificate_medical: null,
    declarant_id_doc: null,
    police_report: null
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
        if (!formData.first_name || !formData.last_name || !formData.date_of_death || !formData.cause_of_death) {
          setError(t('hospital.decesForm.error.step1'));
          return false;
        }
        break;
      case 3:
        if (!formData.declarant_name || !formData.declarant_relationship) {
          setError(t('hospital.decesForm.error.step3'));
          return false;
        }
        break;
      case 4:
        if (!formData.doctor_name) {
          setError(t('hospital.decesForm.error.step4'));
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
      const hasFiles = formData.death_certificate_medical || formData.declarant_id_doc || formData.police_report;
      let response;

      if (hasFiles) {
        const data = new FormData();
        Object.keys(formData).forEach(key => {
          if (!['death_certificate_medical', 'declarant_id_doc', 'police_report'].includes(key)) {
            const value = formData[key];
            if (value !== null && value !== undefined && value !== '') {
              data.append(key, value);
            }
          }
        });
        if (formData.death_certificate_medical) data.append('death_certificate_medical', formData.death_certificate_medical);
        if (formData.declarant_id_doc) data.append('declarant_id_doc', formData.declarant_id_doc);
        if (formData.police_report) data.append('police_report', formData.police_report);
        response = await deathAPI.createDeath(data);
      } else {
        const cleanData = {};
        Object.keys(formData).forEach(key => {
          if (['death_certificate_medical', 'declarant_id_doc', 'police_report'].includes(key)) return;
          const value = formData[key];
          if (value === '' || value === null || value === undefined) {
            const requiredFields = [
              'first_name', 'last_name', 'gender', 'date_of_death',
              'place_of_death', 'cause_of_death', 'declarant_name',
              'declarant_relationship', 'doctor_name'
            ];
            if (!requiredFields.includes(key)) return;
          }
          cleanData[key] = value;
        });
        if (cleanData.age_at_death) {
          cleanData.age_at_death = parseInt(cleanData.age_at_death);
        }
        response = await deathAPI.createDeath(cleanData);
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/hospital-dashboard/deces');
      }, 2000);
    } catch (err) {
      console.error('Error creating death:', err);
      const errorData = err.response?.data;
      let errorMsg = t('hospital.decesForm.error.submit');

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
      setIsSubmitting(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-8 animate-slide-in-from-top">
      {STEPS.map((step, index) => (
        <React.Fragment key={step.id}>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-500 ${
            currentStep === step.id
              ? 'bg-gradient-to-r from-gray-600 to-gray-700 text-white shadow-lg scale-105'
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
          className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all hover:border-gray-400 dark:hover:border-gray-600"
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
          className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all hover:border-gray-400 dark:hover:border-gray-600"
        />
      )}
    </div>
  );

  const renderTextarea = (label, name, placeholder = '', required = false) => (
    <div className="space-y-2 animate-fade-in">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <textarea
        name={name}
        value={formData[name]}
        onChange={handleChange}
        placeholder={placeholder}
        rows={4}
        className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all hover:border-gray-400 dark:hover:border-gray-600 resize-none"
      />
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
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl cursor-pointer hover:border-gray-500 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-300 group">
          <Upload className="w-8 h-8 text-gray-400 mb-2 group-hover:scale-110 transition-transform" />
          <span className="text-sm text-gray-500">{t('hospital.decesForm.upload.click')}</span>
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
        <Skull className="w-6 h-6 text-gray-600" />
        {t('hospital.decesForm.step1.title')}
      </h2>
      <div className="grid md:grid-cols-2 gap-6">
        {renderInput(t('hospital.decesForm.fields.firstName'), 'first_name', 'text', '', true)}
        {renderInput(t('hospital.decesForm.fields.lastName'), 'last_name', 'text', '', true)}
        {renderInput(t('hospital.decesForm.fields.sex'), 'gender', 'select', '', true, [
          { value: 'M', label: t('hospital.decesForm.fields.male') },
          { value: 'F', label: t('hospital.decesForm.fields.female') }
        ])}
        {renderInput(t('hospital.decesForm.fields.birthDate'), 'date_of_birth', 'date')}
        {renderInput(t('hospital.decesForm.fields.deathDate'), 'date_of_death', 'date', '', true)}
        {renderInput(t('hospital.decesForm.fields.deathTime'), 'time_of_death', 'time')}
        {renderInput(t('hospital.decesForm.fields.deathPlace'), 'place_of_death', 'text', t('hospital.decesForm.fields.deathPlacePlaceholder'), true)}
        {renderInput(t('hospital.decesForm.fields.ageAtDeath'), 'age_at_death', 'number', t('hospital.decesForm.fields.agePlaceholder'))}
      </div>
      <div className="md:col-span-2">
        {renderTextarea(t('hospital.decesForm.fields.causeOfDeath'), 'cause_of_death', t('hospital.decesForm.fields.causePlaceholder'), true)}
      </div>
      <div className="md:col-span-2">
        {renderInput(t('hospital.decesForm.fields.causeCategory'), 'cause_category', 'text', t('hospital.decesForm.fields.causeCategoryPlaceholder'))}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className={`space-y-6 ${getStepAnimation()}`}>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
        <User className="w-6 h-6 text-gray-600" />
        {t('hospital.decesForm.step2.title')}
      </h2>
      <div className="grid md:grid-cols-2 gap-6">
        {renderInput(t('hospital.decesForm.fields.fatherFirstName'), 'father_first_name', 'text')}
        {renderInput(t('hospital.decesForm.fields.fatherLastName'), 'father_last_name', 'text')}
        {renderInput(t('hospital.decesForm.fields.motherFirstName'), 'mother_first_name', 'text')}
        {renderInput(t('hospital.decesForm.fields.motherLastName'), 'mother_last_name', 'text')}
      </div>

      <h3 className="text-lg font-semibold text-gray-900 dark:text-white pt-4 border-t border-gray-200 dark:border-gray-800">
        {t('hospital.decesForm.step2.spouse')}
      </h3>
      <div className="grid md:grid-cols-2 gap-6">
        {renderInput(t('hospital.decesForm.fields.spouseFirstName'), 'spouse_first_name', 'text')}
        {renderInput(t('hospital.decesForm.fields.spouseLastName'), 'spouse_last_name', 'text')}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className={`space-y-6 ${getStepAnimation()}`}>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
        <User className="w-6 h-6 text-gray-600" />
        {t('hospital.decesForm.step3.title')}
      </h2>
      <div className="grid md:grid-cols-2 gap-6">
        {renderInput(t('hospital.decesForm.fields.declarantName'), 'declarant_name', 'text', '', true)}
        {renderInput(t('hospital.decesForm.fields.relationship'), 'declarant_relationship', 'text', t('hospital.decesForm.fields.relationshipPlaceholder'), true)}
        {renderInput(t('hospital.decesForm.fields.phone'), 'declarant_phone', 'tel', t('hospital.decesForm.fields.phonePlaceholder'))}
        {renderInput(t('hospital.decesForm.fields.idNumber'), 'declarant_id_number', 'text')}
      </div>

      <h3 className="text-lg font-semibold text-gray-900 dark:text-white pt-4 border-t border-gray-200 dark:border-gray-800">
        {t('hospital.decesForm.step3.doctor')}
      </h3>
      <div className="grid md:grid-cols-2 gap-6">
        {renderInput(t('hospital.decesForm.fields.doctorName'), 'doctor_name', 'text', t('hospital.decesForm.fields.doctorPlaceholder'), true)}
        {renderInput(t('hospital.decesForm.fields.doctorLicense'), 'doctor_license', 'text')}
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className={`space-y-6 ${getStepAnimation()}`}>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
        <FileText className="w-6 h-6 text-gray-600" />
        {t('hospital.decesForm.step4.title')}
      </h2>
      <div className="grid md:grid-cols-2 gap-6">
        {renderFileUpload(t('hospital.decesForm.fields.deathCertMedical'), 'death_certificate_medical')}
        {renderFileUpload(t('hospital.decesForm.fields.declarantId'), 'declarant_id_doc')}
        {renderFileUpload(t('hospital.decesForm.fields.policeReport'), 'police_report')}
      </div>
    </div>
  );

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-zoom-in">
        <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mb-6 animate-bounce-in">
          <CheckCircle2 className="w-10 h-10 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 animate-slide-in-from-bottom-1">{t('hospital.decesForm.success.title')}</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6 animate-slide-in-from-bottom-2">{t('hospital.decesForm.success.desc')}</p>
        <button
          onClick={() => navigate('/hospital-dashboard/deces')}
          className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl font-medium hover:shadow-lg transition-all hover:scale-[1.02] active:scale-95 animate-slide-in-from-bottom-3"
        >
          {t('hospital.decesForm.success.view')}
        </button>
      </div>
    );
  }

  return (
    <div className={`max-w-4xl mx-auto transition-all duration-700 ease-out ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      {/* Header */}
      <div className="mb-8 animate-slide-in-from-top">
        <button
          onClick={() => navigate('/hospital-dashboard/deces')}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 mb-4 transition-all hover:translate-x-[-4px]"
        >
          <ChevronLeft className="w-4 h-4" />
          {t('hospital.decesForm.back')}
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('hospital.decesForm.title')}</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">{t('hospital.decesForm.subtitle')}</p>
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
            {t('hospital.decesForm.nav.prev')}
          </button>

          {currentStep < STEPS.length ? (
            <button
              onClick={nextStep}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl font-medium hover:shadow-lg transition-all hover:scale-[1.02] active:scale-95"
            >
              {t('hospital.decesForm.nav.next')}
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
              {isSubmitting ? t('hospital.decesForm.nav.saving') : t('hospital.decesForm.nav.save')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default HospitalDecesForm;