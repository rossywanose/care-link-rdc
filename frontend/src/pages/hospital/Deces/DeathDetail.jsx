import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  User, ArrowLeft, Calendar, MapPin, Clock, Stethoscope,
  FileText, Download, Printer, CheckCircle2, XCircle, Clock3,
  Loader2, AlertTriangle, Building2, Shield, HeartCrack
} from 'lucide-react';
import { deathAPI } from '../../../services/api';
import { useLanguage } from '../../../context/LanguageContext';
import CertificatePreview from '../../../components/common/CertificatePreview';

const DeathDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [death, setDeath] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchDeathDetail();
  }, [id]);

  const fetchDeathDetail = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await deathAPI.getDeath(id);
      setDeath(response.data);
    } catch (err) {
      console.error('Error fetching death detail:', err);
      setError(t('hospital.deathDetail.errorLoad'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    setDownloading(true);
    setDownloadError('');
    try {
      const response = await deathAPI.downloadCertificate(id);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Attestation_Deces_${death.certificate_id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading certificate:', err);
      if (err.response?.status === 403) {
        setDownloadError(t('hospital.deathDetail.downloadAlert'));
      } else {
        setDownloadError(t('hospital.deathDetail.downloadError'));
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
        label: t('hospital.deathDetail.status.approved'), 
        color: 'text-emerald-600', 
        bg: 'bg-emerald-50', 
        icon: CheckCircle2, 
        border: 'border-emerald-200' 
      },
      pending: { 
        label: t('hospital.deathDetail.status.pending'), 
        color: 'text-amber-600', 
        bg: 'bg-amber-50', 
        icon: Clock3, 
        border: 'border-amber-200' 
      },
      rejected: { 
        label: t('hospital.deathDetail.status.rejected'), 
        color: 'text-red-600', 
        bg: 'bg-red-50', 
        icon: XCircle, 
        border: 'border-red-200' 
      },
      draft: { 
        label: t('hospital.deathDetail.status.draft'), 
        color: 'text-gray-600', 
        bg: 'bg-gray-50', 
        icon: FileText, 
        border: 'border-gray-200' 
      },
      paid: { 
        label: t('hospital.deathDetail.status.paid'), 
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

  if (error || !death) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 flex items-center gap-3 animate-fade-in">
        <AlertTriangle className="w-6 h-6 text-red-600" />
        <div>
          <p className="text-red-700 dark:text-red-400 font-medium">{error || t('hospital.deathDetail.notFound')}</p>
          <button onClick={() => navigate('/hospital-dashboard/deces')}
            className="text-sm text-red-600 hover:underline mt-1">
            {t('hospital.deathDetail.backToList')}
          </button>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(death.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className={`space-y-6 transition-all duration-700 ease-out ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-slide-in-from-top">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/hospital-dashboard/deces')}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all hover:scale-105">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('hospital.deathDetail.title')}</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">{death.certificate_id}</p>
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
          disabled={downloading || death.status === 'draft'}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:shadow-lg transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
        >
          {downloading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /><span>{t('hospital.deathDetail.downloading')}</span></>
          ) : (
            <><Download className="w-4 h-4" /><span>{t('hospital.deathDetail.downloadPDF')}</span></>
          )}
        </button>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all hover:scale-[1.02] active:scale-95"
        >
          <Printer className="w-4 h-4" />
          <span>{t('hospital.deathDetail.print')}</span>
        </button>
        <button
          onClick={() => navigate(`/hospital-dashboard/deces/${id}/edit`)}
          className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all hover:scale-[1.02] active:scale-95"
        >
          <FileText className="w-4 h-4" />
          <span>{t('hospital.deathDetail.edit')}</span>
        </button>
      </div>

      {/* Info: certificat non validé */}
      {death.status === 'draft' && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-center gap-3 animate-slide-in-from-bottom-1">
          <Clock3 className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-700 dark:text-amber-400">
            {t('hospital.deathDetail.draftWarning')}
          </p>
        </div>
      )}

      {/* Contenu principal - 3 colonnes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne 1: Informations du défunt */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden animate-slide-in-from-bottom-2 hover:shadow-lg transition-shadow duration-300">
          <div className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-900/20 dark:to-gray-900/20 px-6 py-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800/30 rounded-xl flex items-center justify-center">
                <HeartCrack className="w-5 h-5 text-slate-600" />
              </div>
              <h2 className="font-semibold text-gray-900 dark:text-white">{t('hospital.deathDetail.sections.deceased')}</h2>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">{t('hospital.deathDetail.fields.fullName')}</p>
              <p className="font-semibold text-gray-900 dark:text-white text-lg">{death.first_name} {death.last_name}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">{t('hospital.deathDetail.fields.sex')}</p>
                <p className="font-medium text-gray-900 dark:text-white">{death.gender === 'M' ? t('hospital.deathDetail.fields.male') : t('hospital.deathDetail.fields.female')}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">{t('hospital.deathDetail.fields.ageAtDeath')}</p>
                <p className="font-medium text-gray-900 dark:text-white">{death.age_at_death ? `${death.age_at_death} ${t('hospital.deathDetail.fields.years')}` : t('hospital.deathDetail.notSpecified')}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">{t('hospital.deathDetail.fields.birthDate')}</p>
                <p className="font-medium text-gray-900 dark:text-white">{death.date_of_birth || t('hospital.deathDetail.notSpecifiedF')}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">{t('hospital.deathDetail.fields.deathDate')}</p>
                <p className="font-medium text-gray-900 dark:text-white">{death.date_of_death}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">{t('hospital.deathDetail.fields.deathTime')}</p>
                <p className="font-medium text-gray-900 dark:text-white">{death.time_of_death || t('hospital.deathDetail.notSpecifiedF')}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">{t('hospital.deathDetail.fields.deathPlace')}</p>
                <p className="font-medium text-gray-900 dark:text-white">{death.place_of_death || t('hospital.deathDetail.notSpecified')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Colonne 2: Cause & Famille */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden animate-slide-in-from-bottom-3 hover:shadow-lg transition-shadow duration-300">
          <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 px-6 py-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-800/30 rounded-xl flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-red-600" />
              </div>
              <h2 className="font-semibold text-gray-900 dark:text-white">{t('hospital.deathDetail.sections.causeFamily')}</h2>
            </div>
          </div>
          <div className="p-6 space-y-6">
            {/* Cause du décès */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                {t('hospital.deathDetail.fields.causeOfDeath')}
              </h3>
              <div className="pl-4 space-y-2">
                <p className="font-medium text-gray-900 dark:text-white">{death.cause_of_death}</p>
                {death.cause_category && (
                  <p className="text-sm text-gray-500">{t('hospital.deathDetail.fields.category')} {death.cause_category}</p>
                )}
              </div>
            </div>
            <div className="border-t border-gray-100 dark:border-gray-800"></div>
            {/* Parents */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                {t('hospital.deathDetail.fields.father')}
              </h3>
              <div className="pl-4 space-y-1">
                <p className="font-medium text-gray-900 dark:text-white">
                  {death.father_first_name || death.father_last_name
                    ? `${death.father_first_name || ''} ${death.father_last_name || ''}`.trim()
                    : t('hospital.deathDetail.notSpecified')}
                </p>
              </div>
            </div>
            <div className="border-t border-gray-100 dark:border-gray-800"></div>
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <span className="w-2 h-2 bg-pink-400 rounded-full"></span>
                {t('hospital.deathDetail.fields.mother')}
              </h3>
              <div className="pl-4 space-y-1">
                <p className="font-medium text-gray-900 dark:text-white">
                  {death.mother_first_name || death.mother_last_name
                    ? `${death.mother_first_name || ''} ${death.mother_last_name || ''}`.trim()
                    : t('hospital.deathDetail.notSpecified')}
                </p>
              </div>
            </div>
            {/* Conjoint */}
            {(death.spouse_first_name || death.spouse_last_name) && (
              <>
                <div className="border-t border-gray-100 dark:border-gray-800"></div>
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                    {t('hospital.deathDetail.fields.spouse')}
                  </h3>
                  <div className="pl-4 space-y-1">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {`${death.spouse_first_name || ''} ${death.spouse_last_name || ''}`.trim()}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Colonne 3: Déclarant & Administratif */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden animate-slide-in-from-bottom-4 hover:shadow-lg transition-shadow duration-300">
          <div className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 px-6 py-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-violet-100 dark:bg-violet-800/30 rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-violet-600" />
              </div>
              <h2 className="font-semibold text-gray-900 dark:text-white">{t('hospital.deathDetail.sections.declarant')}</h2>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {/* Déclarant */}
            <div className="flex items-start gap-3">
              <User className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">{t('hospital.deathDetail.fields.declarant')}</p>
                <p className="font-medium text-gray-900 dark:text-white">{death.declarant_name}</p>
                <p className="text-sm text-gray-500">{t('hospital.deathDetail.fields.relationship')} {death.declarant_relationship}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <FileText className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">{t('hospital.deathDetail.fields.idNumber')}</p>
                <p className="font-medium text-gray-900 dark:text-white">{death.declarant_id_number || t('hospital.deathDetail.notSpecified')}</p>
              </div>
            </div>
            <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">{t('hospital.deathDetail.fields.doctor')}</p>
              <p className="font-medium text-gray-900 dark:text-white">{death.doctor_name || t('hospital.deathDetail.notSpecified')}</p>
              <p className="text-sm text-gray-500">{t('hospital.deathDetail.fields.license')} {death.doctor_license || t('hospital.deathDetail.notSpecifiedF')}</p>
            </div>
            <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">{t('hospital.deathDetail.fields.hospital')}</p>
              <div className="flex items-start gap-3">
                <Building2 className="w-4 h-4 text-gray-400 mt-0.5" />
                <p className="font-medium text-gray-900 dark:text-white">{death.hospital_name || t('hospital.deathDetail.notSpecified')}</p>
              </div>
            </div>
            <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">{t('hospital.deathDetail.fields.declaredBy')}</p>
              <p className="font-medium text-gray-900 dark:text-white">{death.declared_by_name || t('hospital.deathDetail.notSpecified')}</p>
              <p className="text-sm text-gray-500">
                {t('hospital.deathDetail.fields.date')} {death.declaration_date ? new Date(death.declaration_date).toLocaleDateString('fr-FR') : t('hospital.deathDetail.notSpecifiedF')}
              </p>
            </div>
            {death.validated_by_name && (
              <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">{t('hospital.deathDetail.fields.validatedBy')}</p>
                <p className="font-medium text-gray-900 dark:text-white">{death.validated_by_name}</p>
                <p className="text-sm text-gray-500">
                  {t('hospital.deathDetail.fields.date')} {death.validation_date ? new Date(death.validation_date).toLocaleDateString('fr-FR') : t('hospital.deathDetail.notSpecifiedF')}
                </p>
              </div>
            )}
            {death.rejection_reason && (
              <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
                <p className="text-xs text-red-500 uppercase tracking-wider mb-2">{t('hospital.deathDetail.fields.rejectionReason')}</p>
                <p className="text-sm text-red-600 dark:text-red-400">{death.rejection_reason}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ← REMPLACÉ : CertificatePreview avec QR Code + PDF */}
      <CertificatePreview
        certificateId={death.certificate_id}
        type="death"
        status={death.status}
        api={deathAPI}
      />
    </div>
  );
};

export default DeathDetail;