import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../context/LanguageContext';
import { birthAPI, deathAPI } from '../../../services/api';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Download,
  QrCode,
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
  Calendar,
  MapPin,
  Building2,
  ChevronDown,
  X,
  Loader2,
  AlertCircle
} from 'lucide-react';

const CitizenCertificats = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCert, setSelectedCert] = useState(null);

  // Data from backend
  const [births, setBirths] = useState([]);
  const [deaths, setDeaths] = useState([]);

  // Fetch data on mount
  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    setLoading(true);
    setError(null);
    try {
      const [birthsRes, deathsRes] = await Promise.all([
        birthAPI.getBirths(),
        deathAPI.getDeaths()
      ]);

      const birthsData = Array.isArray(birthsRes.data) ? birthsRes.data : 
                        birthsRes.data?.results || [];
      const deathsData = Array.isArray(deathsRes.data) ? deathsRes.data : 
                        deathsRes.data?.results || [];

      setBirths(birthsData);
      setDeaths(deathsData);
    } catch (err) {
      console.error('Certificates error:', err);
      setError(t('certificats.errorLoad'));
    } finally {
      setLoading(false);
    }
  };

  // Combine births and deaths into unified format
  const getAllCertificates = () => {
    const birthCerts = births.map(b => ({
      id: b.certificate_id || b.id,
      type: 'naissance',
      personName: `${b.child_first_name || ''} ${b.child_last_name || ''}`.trim() || 'N/A',
      dateRequest: b.created_at,
      dateEvent: b.date_of_birth,
      status: b.status || 'pending',
      hospital: b.hospital?.name || t('certificats.hospitalUnknown'),
      province: b.hospital?.province || 'N/A',
      sex: b.gender || 'M',
      fatherName: `${b.father_first_name || ''} ${b.father_last_name || ''}`.trim() || 'N/A',
      motherName: `${b.mother_first_name || ''} ${b.mother_last_name || ''}`.trim() || 'N/A',
      qrCode: b.qr_code || 'N/A',
      rejection_reason: b.rejection_reason,
      raw: b
    }));

    const deathCerts = deaths.map(d => ({
      id: d.certificate_id || d.id,
      type: 'deces',
      personName: d.full_name || `${d.first_name || ''} ${d.last_name || ''}`.trim() || 'N/A',
      dateRequest: d.created_at,
      dateEvent: d.date_of_death,
      status: d.status || 'pending',
      hospital: d.hospital_name || d.hospital?.name || t('certificats.hospitalUnknown'),
      province: d.hospital?.province || 'N/A',
      sex: d.gender || 'M',
      fatherName: `${d.father_first_name || ''} ${d.father_last_name || ''}`.trim() || 'N/A',
      motherName: `${d.mother_first_name || ''} ${d.mother_last_name || ''}`.trim() || 'N/A',
      cause: d.cause_of_death,
      qrCode: d.qr_code || 'N/A',
      rejection_reason: d.rejection_reason,
      raw: d
    }));

    return [...birthCerts, ...deathCerts];
  };

  const allCertificates = getAllCertificates();

  const filteredCerts = allCertificates.filter(cert => {
    const matchStatus = filterStatus === 'all' || cert.status === filterStatus;
    const matchType = filterType === 'all' || cert.type === filterType;
    const matchSearch = searchQuery === '' ||
      cert.personName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.hospital.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchType && matchSearch;
  });

  const statusConfig = {
    approved: {
      label: t('status.approved'),
      icon: CheckCircle2,
      color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800',
      dot: 'bg-emerald-500'
    },
    pending: {
      label: t('status.pending'),
      icon: Clock,
      color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
      dot: 'bg-amber-500'
    },
    rejected: {
      label: t('status.rejected'),
      icon: XCircle,
      color: 'text-red-600 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
      dot: 'bg-red-500'
    }
  };

  const getStatusBadge = (status) => {
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${config.color}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
        {config.label}
      </span>
    );
  };

  const getTypeBadge = (type) => (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${type === 'naissance'
        ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
        : 'bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
      }`}>
      {type === 'naissance' ? t('common.birth') : t('common.death')}
    </span>
  );

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('fr-FR');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <span className="ml-3 text-gray-600 dark:text-gray-400">{t('certificats.loading')}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <p className="text-red-600 dark:text-red-400">{error}</p>
        <button
          onClick={fetchCertificates}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          {t('certificats.retry')}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('certificats.title')}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {filteredCerts.length === 1 
              ? t('certificats.found').replace('{count}', filteredCerts.length)
              : t('certificats.foundPlural').replace('{count}', filteredCerts.length)
            }
          </p>
        </div>
        <button
          onClick={() => navigate('/citizen-dashboard/certificats/nouveau')}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-indigo-500/30 transition-all hover:scale-[1.02]"
        >
          <Plus className="w-5 h-5" />
          {t('certificats.newRequest')}
        </button>
      </div>

      {/* Search & Filters */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('certificats.searchPlaceholder')}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg font-medium transition-all ${showFilters
                ? 'border-indigo-300 bg-indigo-50 text-indigo-600 dark:border-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400'
                : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
          >
            <Filter className="w-4 h-4" />
            {t('certificats.filters')}
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{t('certificats.status')}</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">{t('certificats.all')}</option>
                <option value="approved">{t('certificats.approved')}</option>
                <option value="pending">{t('certificats.pending')}</option>
                <option value="rejected">{t('certificats.rejected')}</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{t('certificats.type')}</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">{t('certificats.all')}</option>
                <option value="naissance">{t('common.birth')}</option>
                <option value="deces">{t('common.death')}</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => { setFilterStatus('all'); setFilterType('all'); setSearchQuery(''); }}
                className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                {t('certificats.reset')}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Certificates List */}
      <div className="space-y-3">
        {filteredCerts.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-12 text-center">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{t('certificats.noCerts')}</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">{t('certificats.noCertsDesc')}</p>
            <button
              onClick={() => navigate('/citizen-dashboard/certificats/nouveau')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4" />
              {t('certificats.newRequestBtn')}
            </button>
          </div>
        ) : (
          filteredCerts.map((cert) => (
            <div
              key={cert.id}
              className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 hover:shadow-lg transition-all cursor-pointer"
              onClick={() => setSelectedCert(cert)}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${cert.type === 'naissance'
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600'
                    }`}>
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{cert.personName}</h3>
                      {getTypeBadge(cert.type)}
                      {getStatusBadge(cert.status)}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
                      <span className="font-mono text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">{cert.id}</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {t('certificats.request')}: {formatDate(cert.dateRequest)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {t('certificats.event')}: {formatDate(cert.dateEvent)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5" />
                        {cert.hospital}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {cert.province}
                      </span>
                    </div>
                    {cert.rejection_reason && (
                      <p className="text-sm text-red-500 mt-2 flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" />
                        {t('certificats.motive')}: {cert.rejection_reason}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 lg:flex-shrink-0">
                  {cert.status === 'approved' && (
                    <>
                      <button
                        onClick={async (e) => { 
                          e.stopPropagation(); 
                          try {
                            const response = await (cert.type === 'naissance' 
                              ? birthAPI.downloadCertificate(cert.raw.id)
                              : deathAPI.downloadCertificate(cert.raw.id));

                            const blob = new Blob([response.data], { type: 'application/pdf' });
                            const url = window.URL.createObjectURL(blob);
                            const link = document.createElement('a');
                            link.href = url;
                            link.download = `certificat-${cert.type}-${cert.id}.pdf`;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            window.URL.revokeObjectURL(url);
                          } catch (err) {
                            console.error('Download error:', err);
                            alert(t('certificats.downloadPDF'));
                          }
                        }}
                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all"
                        title={t('certificats.downloadPDF')}
                      >
                        <Download className="w-5 h-5" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); alert('QR Code: ' + cert.qrCode); }}
                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all"
                        title={t('certificats.viewQR')}
                      >
                        <QrCode className="w-5 h-5" />
                      </button>
                    </>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedCert(cert); }}
                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all"
                    title={t('certificats.viewDetails')}
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Detail Modal */}
      {selectedCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t('certificats.detailsTitle')}</h2>
                <p className="text-sm text-gray-500">{selectedCert.id}</p>
              </div>
              <button
                onClick={() => setSelectedCert(null)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center justify-center mb-6">
                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center ${selectedCert.type === 'naissance'
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600'
                  }`}>
                  <FileText className="w-10 h-10" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('certificats.type')}</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {selectedCert.type === 'naissance' ? t('common.birth') : t('common.death')}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('certificats.status')}</p>
                  <div>{getStatusBadge(selectedCert.status)}</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('certificats.fullName')}</p>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedCert.personName}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('certificats.sex')}</p>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedCert.sex === 'M' ? t('common.male') : t('common.female')}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('certificats.eventDate')}</p>
                  <p className="font-medium text-gray-900 dark:text-white">{formatDate(selectedCert.dateEvent)}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('certificats.requestDate')}</p>
                  <p className="font-medium text-gray-900 dark:text-white">{formatDate(selectedCert.dateRequest)}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 col-span-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('certificats.hospital')}</p>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedCert.hospital}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 col-span-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('certificats.father')}</p>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedCert.fatherName}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 col-span-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('certificats.mother')}</p>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedCert.motherName}</p>
                </div>
                {selectedCert.cause && (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 col-span-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('certificats.causeOfDeath')}</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedCert.cause}</p>
                  </div>
                )}
                {selectedCert.rejection_reason && (
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 col-span-2 border border-red-200 dark:border-red-800">
                    <p className="text-xs text-red-500 mb-1">{t('certificats.rejectionReason')}</p>
                    <p className="font-medium text-red-700 dark:text-red-400">{selectedCert.rejection_reason}</p>
                  </div>
                )}
              </div>

              {selectedCert.status === 'approved' && (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-center">
                    <QrCode className="w-16 h-16 mx-auto text-gray-400 mb-2" />
                    <p className="text-xs text-gray-500 font-mono">{selectedCert.qrCode}</p>
                    <p className="text-xs text-gray-400 mt-1">{t('certificats.scanQR')}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-800 flex gap-3">
              <button
                onClick={() => setSelectedCert(null)}
                className="flex-1 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                {t('certificats.close')}
              </button>
              {selectedCert.status === 'approved' && (
                <button
                  onClick={() => alert('Telechargement PDF...')}
                  className="flex-1 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-lg font-medium hover:shadow-lg"
                >
                  {t('certificats.download')}
                </button>
              )}
              {selectedCert.status === 'rejected' && (
                <button
                  onClick={() => alert('Redirection vers nouvelle demande...')}
                  className="flex-1 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-lg font-medium hover:shadow-lg"
                >
                  {t('certificats.redoRequest')}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CitizenCertificats;