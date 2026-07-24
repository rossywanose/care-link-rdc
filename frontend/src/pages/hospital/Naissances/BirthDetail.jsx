import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Baby, ArrowLeft, Calendar, MapPin, Weight, Clock, User,
  FileText, Download, Printer, CheckCircle2, XCircle, Clock3,
  Loader2, AlertTriangle, Building2, Shield
} from 'lucide-react';
import { birthAPI } from '../../../services/api';
import { useLanguage } from '../../../context/LanguageContext';
import CertificatePreview from '../../../components/common/CertificatePreview';

const BirthDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [birth, setBirth] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchBirthDetail();
  }, [id]);

  const fetchBirthDetail = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await birthAPI.getBirth(id);
      setBirth(response.data);
    } catch (err) {
      console.error('Error fetching birth detail:', err);
      setError(t('hospital.birthDetail.errorLoad'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    setDownloading(true);
    setDownloadError('');
    try {
      const response = await birthAPI.downloadCertificate(id);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Attestation_Naissance_${birth.certificate_id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading certificate:', err);
      if (err.response?.status === 403) {
        setDownloadError(t('hospital.birthDetail.downloadAlert'));
      } else {
        setDownloadError(t('hospital.birthDetail.downloadError'));
      }
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getStatusConfig = (status) => {
    const configs = {
      approved: { 
        label: t('hospital.birthDetail.status.approved'), 
        color: 'text-emerald-600', 
        bg: 'bg-emerald-50', 
        icon: CheckCircle2, 
        border: 'border-emerald-200' 
      },
      pending: { 
        label: t('hospital.birthDetail.status.pending'), 
        color: 'text-amber-600', 
        bg: 'bg-amber-50', 
        icon: Clock3, 
        border: 'border-amber-200' 
      },
      rejected: { 
        label: t('hospital.birthDetail.status.rejected'), 
        color: 'text-red-600', 
        bg: 'bg-red-50', 
        icon: XCircle, 
        border: 'border-red-200' 
      },
      draft: { 
        label: t('hospital.birthDetail.status.draft'), 
        color: 'text-gray-600', 
        bg: 'bg-gray-50', 
        icon: FileText, 
        border: 'border-gray-200' 
      },
      paid: { 
        label: t('hospital.birthDetail.status.paid'), 
        color: 'text-blue-600', 
        bg: 'bg-blue-50', 
        icon: CheckCircle2, 
        border: 'border-blue-200' 
      }
    };
    return configs[status] || configs.draft;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 animate-fade-in">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error || !birth) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 flex items-center gap-3 animate-fade-in">
        <AlertTriangle className="w-6 h-6 text-red-600" />
        <div>
          <p className="text-red-700 dark:text-red-400 font-medium">{error || t('hospital.birthDetail.notFound')}</p>
          <button onClick={() => navigate('/hospital-dashboard/naissances')}
            className="text-sm text-red-600 hover:underline mt-1">
            {t('hospital.birthDetail.backToList')}
          </button>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(birth.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className={`space-y-6 transition-all duration-700 ease-out ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-slide-in-from-top">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/hospital-dashboard/naissances')}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all hover:scale-105">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('hospital.birthDetail.title')}</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">{birth.certificate_id}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border} animate-zoom-in-95`}>
            <StatusIcon className="w-4 h-4" />
            {statusConfig.label}
          </span>
        </div>
      </div>

      {/* Error download */}
      {downloadError && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center gap-3 animate-shake">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-700 dark:text-red-400">{downloadError}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3 animate-slide-in-from-bottom-1">
        <button
          onClick={handleDownloadPDF}
          disabled={downloading || birth.status === 'draft'}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:shadow-lg transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
        >
          {downloading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /><span>{t('hospital.birthDetail.downloading')}</span></>
          ) : (
            <><Download className="w-4 h-4" /><span>{t('hospital.birthDetail.downloadPDF')}</span></>
          )}
        </button>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all hover:scale-[1.02] active:scale-95"
        >
          <Printer className="w-4 h-4" />
          <span>{t('hospital.birthDetail.print')}</span>
        </button>
        <button
          onClick={() => navigate(`/hospital-dashboard/naissances/${id}/edit`)}
          className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all hover:scale-[1.02] active:scale-95"
        >
          <FileText className="w-4 h-4" />
          <span>{t('hospital.birthDetail.edit')}</span>
        </button>
      </div>

      {/* Info: certificat non validé */}
      {birth.status === 'draft' && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-center gap-3 animate-slide-in-from-bottom-1">
          <Clock3 className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-700 dark:text-amber-400">
            {t('hospital.birthDetail.draftWarning')}
          </p>
        </div>
      )}

      {/* Contenu principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne 1: Informations de l'enfant */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden animate-slide-in-from-bottom-2 hover:shadow-lg transition-shadow duration-300">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 px-6 py-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-800/30 rounded-xl flex items-center justify-center">
                <Baby className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="font-semibold text-gray-900 dark:text-white">{t('hospital.birthDetail.sections.child')}</h2>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">{t('hospital.birthDetail.fields.fullName')}</p>
              <p className="font-semibold text-gray-900 dark:text-white text-lg">{birth.child_first_name} {birth.child_last_name}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">{t('hospital.birthDetail.fields.sex')}</p>
                <p className="font-medium text-gray-900 dark:text-white">{birth.gender === 'M' ? t('hospital.birthDetail.fields.male') : t('hospital.birthDetail.fields.female')}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">{t('hospital.birthDetail.fields.weight')}</p>
                <p className="font-medium text-gray-900 dark:text-white">{birth.weight ? `${birth.weight} ${t('hospital.birthDetail.fields.kg')}` : t('hospital.birthDetail.notSpecified')}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">{t('hospital.birthDetail.fields.birthDate')}</p>
                <p className="font-medium text-gray-900 dark:text-white">{birth.date_of_birth}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">{t('hospital.birthDetail.fields.time')}</p>
                <p className="font-medium text-gray-900 dark:text-white">{birth.time_of_birth || t('hospital.birthDetail.notSpecifiedF')}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">{t('hospital.birthDetail.fields.birthPlace')}</p>
                <p className="font-medium text-gray-900 dark:text-white">{birth.place_of_birth || t('hospital.birthDetail.notSpecified')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Colonne 2: Parents */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden animate-slide-in-from-bottom-3 hover:shadow-lg transition-shadow duration-300">
          <div className="bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20 px-6 py-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-800/30 rounded-xl flex items-center justify-center">
                <User className="w-5 h-5 text-indigo-600" />
              </div>
              <h2 className="font-semibold text-gray-900 dark:text-white">{t('hospital.birthDetail.sections.parents')}</h2>
            </div>
          </div>
          <div className="p-6 space-y-6">
            {/* Père */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                {t('hospital.birthDetail.fields.father')}
              </h3>
              <div className="pl-4 space-y-2">
                <p className="font-medium text-gray-900 dark:text-white">{birth.father_first_name} {birth.father_last_name}</p>
                <p className="text-sm text-gray-500">{t('hospital.birthDetail.fields.bornOn')} {birth.father_date_of_birth || t('hospital.birthDetail.notSpecified')}</p>
                <p className="text-sm text-gray-500">{t('hospital.birthDetail.fields.nationality')} {birth.father_nationality || t('hospital.birthDetail.notSpecifiedF')}</p>
                <p className="text-sm text-gray-500">{t('hospital.birthDetail.fields.profession')} {birth.father_profession || t('hospital.birthDetail.notSpecifiedF')}</p>
                <p className="text-sm text-gray-500">{t('hospital.birthDetail.fields.idNumber')} {birth.father_id_number || t('hospital.birthDetail.notSpecified')}</p>
              </div>
            </div>
            <div className="border-t border-gray-100 dark:border-gray-800"></div>
            {/* Mère */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <span className="w-2 h-2 bg-pink-400 rounded-full"></span>
                {t('hospital.birthDetail.fields.mother')}
              </h3>
              <div className="pl-4 space-y-2">
                <p className="font-medium text-gray-900 dark:text-white">{birth.mother_first_name} {birth.mother_last_name}</p>
                <p className="text-sm text-gray-500">{t('hospital.birthDetail.fields.bornOnF')} {birth.mother_date_of_birth || t('hospital.birthDetail.notSpecified')}</p>
                <p className="text-sm text-gray-500">{t('hospital.birthDetail.fields.nationality')} {birth.mother_nationality || t('hospital.birthDetail.notSpecifiedF')}</p>
                <p className="text-sm text-gray-500">{t('hospital.birthDetail.fields.profession')} {birth.mother_profession || t('hospital.birthDetail.notSpecifiedF')}</p>
                <p className="text-sm text-gray-500">{t('hospital.birthDetail.fields.idNumber')} {birth.mother_id_number || t('hospital.birthDetail.notSpecified')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Colonne 3: Informations administratives */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden animate-slide-in-from-bottom-4 hover:shadow-lg transition-shadow duration-300">
          <div className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 px-6 py-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-violet-100 dark:bg-violet-800/30 rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-violet-600" />
              </div>
              <h2 className="font-semibold text-gray-900 dark:text-white">{t('hospital.birthDetail.sections.admin')}</h2>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-start gap-3">
              <Building2 className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">{t('hospital.birthDetail.fields.hospital')}</p>
                <p className="font-medium text-gray-900 dark:text-white">{birth.hospital_name || t('hospital.birthDetail.notSpecified')}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <User className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">{t('hospital.birthDetail.fields.declaredBy')}</p>
                <p className="font-medium text-gray-900 dark:text-white">{birth.declared_by_name || t('hospital.birthDetail.notSpecified')}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">{t('hospital.birthDetail.fields.declarationDate')}</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {birth.declaration_date ? new Date(birth.declaration_date).toLocaleDateString('fr-FR') : t('hospital.birthDetail.notSpecifiedF')}
                </p>
              </div>
            </div>
            <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">{t('hospital.birthDetail.fields.doctor')}</p>
              <p className="font-medium text-gray-900 dark:text-white">{birth.doctor_name || t('hospital.birthDetail.notSpecified')}</p>
              <p className="text-sm text-gray-500">{t('hospital.birthDetail.fields.license')} {birth.doctor_license || t('hospital.birthDetail.notSpecifiedF')}</p>
            </div>
            {birth.validated_by_name && (
              <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">{t('hospital.birthDetail.fields.validatedBy')}</p>
                <p className="font-medium text-gray-900 dark:text-white">{birth.validated_by_name}</p>
                <p className="text-sm text-gray-500">
                  {t('hospital.birthDetail.fields.date')} {birth.validation_date ? new Date(birth.validation_date).toLocaleDateString('fr-FR') : t('hospital.birthDetail.notSpecifiedF')}
                </p>
              </div>
            )}
            {birth.rejection_reason && (
              <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
                <p className="text-xs text-red-500 uppercase tracking-wider mb-2">{t('hospital.birthDetail.fields.rejectionReason')}</p>
                <p className="text-sm text-red-600 dark:text-red-400">{birth.rejection_reason}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ← CertificatePreview avec QR Code + PDF */}
      <CertificatePreview
        certificateId={birth.certificate_id}
        type="birth"
        status={birth.status}
        api={birthAPI}
      />
    </div>
  );
};

export default BirthDetail;
