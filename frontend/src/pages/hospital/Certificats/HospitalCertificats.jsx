import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Search,
  Filter,
  Download,
  Printer,
  QrCode,
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
  Calendar,
  MapPin,
  Baby,
  Skull,
  ChevronLeft,
  ChevronRight,
  X,
  Copy,
  Check,
  ArrowDownToLine,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { birthAPI, deathAPI } from '../../../services/api';
import { useLanguage } from '../../../context/LanguageContext';

const HospitalCertificats = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCert, setSelectedCert] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [certificats, setCertificats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchCertificats();
  }, []);

  // Fix ResizeObserver loop error
  useEffect(() => {
    const observer = new ResizeObserver(() => {
      // Do nothing, just consume the callback
    });
    observer.observe(document.body);
    return () => observer.disconnect();
  }, []);

  const fetchCertificats = async () => {
    setLoading(true);
    setError('');
    try {
      const [birthsRes, deathsRes] = await Promise.all([
        birthAPI.getBirths(),
        deathAPI.getDeaths()
      ]);

      const birthsData = birthsRes.data.results || birthsRes.data || [];
      const deathsData = deathsRes.data.results || deathsRes.data || [];

      // Mapper les naissances avec fallbacks
      const births = birthsData.map(b => {
        const childName = b.child_full_name 
          || `${b.child_first_name || ''} ${b.child_last_name || ''}`.trim()
          || t('hospital.certs.notSpecified');

        const fatherName = b.father_full_name
          || `${b.father_first_name || ''} ${b.father_last_name || ''}`.trim()
          || t('hospital.certs.notSpecified');

        const motherName = b.mother_full_name
          || `${b.mother_first_name || ''} ${b.mother_last_name || ''}`.trim()
          || t('hospital.certs.notSpecified');

        const lieu = b.place_of_birth || t('hospital.certs.notSpecified');
        const commune = b.hospital_name || '';

        return {
          id: b.certificate_id || b.id,
          uuid: b.id,
          type: 'naissance',
          personName: childName,
          dateEvent: b.date_of_birth,
          dateEmission: b.validation_date,
          status: b.status,
          sexe: b.gender,
          poids: b.weight ? `${b.weight} kg` : null,
          age: null,
          fatherName,
          motherName,
          lieu,
          commune,
          province: '',
          qrCode: b.qr_code,
          numeroActe: b.certificate_id,
          officier: b.doctor_name,
          dateEnregistrement: b.declaration_date,
          declaredBy: b.declared_by_name,
          validatedBy: b.validated_by_name,
          validationDate: b.validation_date,
          rejectionReason: b.rejection_reason,
          hospitalName: b.hospital_name,
          raw: b
        };
      });

      // Mapper les décès avec fallbacks
      const deaths = deathsData.map(d => {
        const personName = d.full_name
          || `${d.first_name || ''} ${d.last_name || ''}`.trim()
          || t('hospital.certs.notSpecified');

        const fatherName = `${d.father_first_name || ''} ${d.father_last_name || ''}`.trim()
          || t('hospital.certs.notSpecified');

        const motherName = `${d.mother_first_name || ''} ${d.mother_last_name || ''}`.trim()
          || t('hospital.certs.notSpecified');

        const lieu = d.place_of_death || t('hospital.certs.notSpecified');
        const commune = d.hospital_name || '';

        return {
          id: d.certificate_id || d.id,
          uuid: d.id,
          type: 'deces',
          personName,
          dateEvent: d.date_of_death,
          dateEmission: d.validation_date,
          status: d.status,
          sexe: d.gender,
          poids: null,
          age: d.age_at_death,
          fatherName,
          motherName,
          lieu,
          commune,
          province: '',
          qrCode: d.qr_code,
          numeroActe: d.certificate_id,
          officier: d.doctor_name,
          dateEnregistrement: d.declaration_date,
          declaredBy: d.declared_by_name,
          validatedBy: d.validated_by_name,
          validationDate: d.validation_date,
          rejectionReason: d.rejection_reason,
          hospitalName: d.hospital_name,
          cause: d.cause_of_death,
          raw: d
        };
      });

      // Fusionner et trier par date de déclaration (plus récent en premier)
      const all = [...births, ...deaths].sort((a, b) => {
        const dateA = new Date(a.dateEnregistrement || a.dateEvent || 0);
        const dateB = new Date(b.dateEnregistrement || b.dateEvent || 0);
        return dateB - dateA;
      });

      setCertificats(all);
    } catch (err) {
      console.error('Error fetching certificates:', err);
      setError(t('hospital.certs.errorLoad'));
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async (cert) => {
    if (cert.status !== 'approved' && cert.status !== 'paid') {
      alert(t('hospital.certs.downloadAlert'));
      return;
    }
    try {
      setDownloading(cert.uuid);
      let response;
      if (cert.type === 'naissance') {
        response = await birthAPI.downloadCertificate(cert.uuid);
      } else {
        response = await deathAPI.downloadCertificate(cert.uuid);
      }
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Attestation_${cert.type === 'naissance' ? 'Naissance' : 'Deces'}_${cert.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
      alert(t('hospital.certs.downloadError'));
    } finally {
      setDownloading(null);
    }
  };

  const handlePrint = (cert) => {
    window.print();
  };

  const statusConfig = {
    approved: { label: t('hospital.certs.status.approved'), color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' },
    pending: { label: t('hospital.certs.status.pending'), color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800' },
    rejected: { label: t('hospital.certs.status.rejected'), color: 'text-red-600 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' },
    draft: { label: t('hospital.certs.status.draft'), color: 'text-gray-600 bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800' },
    paid: { label: t('hospital.status.paid'), color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' }
  };

  const StatusIcon = ({ status }) => {
    if (status === 'approved' || status === 'paid') return <CheckCircle2 className="w-3 h-3" />;
    if (status === 'pending') return <Clock className="w-3 h-3" />;
    if (status === 'rejected') return <XCircle className="w-3 h-3" />;
    return <FileText className="w-3 h-3" />;
  };

  const filteredCerts = certificats.filter(c => {
    const matchType = filterType === 'all' || c.type === filterType;
    const matchStatus = filterStatus === 'all' || c.status === filterStatus;
    const query = searchQuery.toLowerCase();
    const matchSearch = searchQuery === '' || 
      c.personName?.toLowerCase().includes(query) ||
      c.id?.toLowerCase().includes(query) ||
      c.fatherName?.toLowerCase().includes(query) ||
      c.motherName?.toLowerCase().includes(query);
    return matchType && matchStatus && matchSearch;
  });

  const stats = {
    total: certificats.length,
    naissances: certificats.filter(c => c.type === 'naissance').length,
    deces: certificats.filter(c => c.type === 'deces').length,
    enAttente: certificats.filter(c => c.status === 'pending').length
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getTypeIcon = (type) => {
    return type === 'naissance' 
      ? <Baby className="w-5 h-5 text-blue-600" />
      : <Skull className="w-5 h-5 text-gray-600" />;
  };

  const getTypeLabel = (type) => type === 'naissance' ? t('hospital.certs.stats.births') : t('hospital.certs.stats.deaths');

  const formatDate = (dateStr) => {
    if (!dateStr) return t('hospital.certs.notSpecifiedF');
    try {
      return new Date(dateStr).toLocaleDateString('fr-FR');
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 animate-fade-in">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-red-600" />
          <div>
            <p className="text-red-700 dark:text-red-400 font-medium">{error}</p>
            <button onClick={fetchCertificats} className="text-sm text-red-600 hover:underline mt-1">
              {t('hospital.certs.retry')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-slide-in-from-bottom-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('hospital.certs.title')}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{t('hospital.certs.subtitle')}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/hospital-dashboard/naissances/nouveau')}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all text-sm"
          >
            <Baby className="w-4 h-4" />
            {t('hospital.certs.newBirth')}
          </button>
          <button
            onClick={() => navigate('/hospital-dashboard/deces/nouveau')}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl font-medium hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all text-sm"
          >
            <Skull className="w-4 h-4" />
            {t('hospital.certs.newDeath')}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: t('hospital.certs.stats.total'), value: stats.total, icon: FileText, color: 'from-indigo-500 to-indigo-600' },
          { label: t('hospital.certs.stats.births'), value: stats.naissances, icon: Baby, color: 'from-blue-500 to-blue-600' },
          { label: t('hospital.certs.stats.deaths'), value: stats.deces, icon: Skull, color: 'from-gray-500 to-gray-600' },
          { label: t('hospital.certs.stats.pending'), value: stats.enAttente, icon: Clock, color: 'from-amber-500 to-amber-600' }
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 animate-slide-in-from-bottom-2" style={{ animationDelay: `${i * 100}ms` }}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center hover:scale-110 transition-transform duration-300`}>
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

      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 animate-slide-in-from-bottom-2" style={{ animationDelay: '200ms' }}>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('hospital.certs.searchPlaceholder')}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          >
            <option value="all">{t('hospital.certs.filter.allTypes')}</option>
            <option value="naissance">{t('hospital.certs.filter.births')}</option>
            <option value="deces">{t('hospital.certs.filter.deaths')}</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          >
            <option value="all">{t('hospital.certs.filter.allStatuses')}</option>
            <option value="approved">{t('hospital.certs.status.approved')}</option>
            <option value="pending">{t('hospital.certs.status.pending')}</option>
            <option value="rejected">{t('hospital.certs.status.rejected')}</option>
            <option value="draft">{t('hospital.certs.status.draft')}</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden animate-slide-in-from-bottom-2" style={{ animationDelay: '300ms' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">ID</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{t('hospital.certs.table.type')}</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{t('hospital.certs.table.person')}</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase hidden sm:table-cell">{t('hospital.certs.table.eventDate')}</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase hidden md:table-cell">{t('hospital.certs.table.parents')}</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{t('hospital.certs.table.status')}</th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{t('hospital.certs.table.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredCerts.map((cert, index) => (
                <tr key={cert.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors animate-slide-in-from-left-2" style={{ animationDelay: `${index * 50}ms` }}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm text-gray-900 dark:text-white">{cert.id}</span>
                      <button
                        onClick={() => copyToClipboard(cert.id, cert.id)}
                        className="p-1 text-gray-400 hover:text-indigo-600 rounded transition-colors"
                        title={t('hospital.certs.copy')}
                      >
                        {copiedId === cert.id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${cert.type === 'naissance' ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-gray-100 dark:bg-gray-800'}`}>
                        {getTypeIcon(cert.type)}
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{getTypeLabel(cert.type)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{cert.personName}</p>
                    <p className="text-xs text-gray-500">{cert.sexe === 'M' ? t('hospital.certs.male') : t('hospital.certs.female')} &bull; {cert.type === 'naissance' ? cert.poids : `${cert.age || '?'} ans`}</p>
                  </td>
                  <td className="px-6 py-4 hidden sm:table-cell">
                    <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(cert.dateEvent)}
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <div className="text-xs text-gray-500 dark:text-gray-400 space-y-0.5">
                      <p>{t('hospital.certs.father')} {cert.fatherName}</p>
                      <p>{t('hospital.certs.mother')} {cert.motherName}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${statusConfig[cert.status]?.color || statusConfig.draft.color}`}>
                      <StatusIcon status={cert.status} />
                      {statusConfig[cert.status]?.label || cert.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setSelectedCert(cert)}
                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all hover:scale-110"
                        title={t('hospital.certs.viewDetails')}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => navigate(`/hospital-dashboard/${cert.type === 'naissance' ? 'naissances' : 'deces'}/${cert.uuid}`)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all hover:scale-110"
                        title={t('hospital.certs.openPage')}
                      >
                        <ArrowDownToLine className="w-4 h-4" />
                      </button>
                      {(cert.status === 'approved' || cert.status === 'paid') && (
                        <>
                          <button
                            onClick={() => handleDownloadPDF(cert)}
                            disabled={downloading === cert.uuid}
                            className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-all hover:scale-110 disabled:opacity-50"
                            title={t('hospital.certs.downloadPDF')}
                          >
                            {downloading === cert.uuid ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowDownToLine className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => handlePrint(cert)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all hover:scale-110"
                            title={t('hospital.certs.print')}
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredCerts.length === 0 && (
          <div className="p-12 text-center animate-fade-in">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">{t('hospital.certs.noCerts')}</p>
          </div>
        )}
      </div>

      {/* Pagination info */}
      <div className="flex items-center justify-between animate-slide-in-from-bottom-2">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {filteredCerts.length} {t('hospital.certs.certCount')}
        </p>
      </div>

      {/* Detail Modal */}
      {selectedCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
             onClick={(e) => { if (e.target === e.currentTarget) setSelectedCert(null); }}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-zoom-in-95">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-900 z-10">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedCert.type === 'naissance' ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-gray-100 dark:bg-gray-800'}`}>
                  {getTypeIcon(selectedCert.type)}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">{selectedCert.personName}</h2>
                  <p className="text-sm text-gray-500">{selectedCert.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCert(null)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg hover:rotate-90 transition-all duration-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status banner */}
              <div className={`p-4 rounded-xl border ${statusConfig[selectedCert.status]?.color || statusConfig.draft.color}`}>
                <div className="flex items-center gap-2">
                  <StatusIcon status={selectedCert.status} />
                  <span className="font-medium">{t('hospital.certs.table.status')}: {statusConfig[selectedCert.status]?.label || selectedCert.status}</span>
                </div>
                {selectedCert.rejectionReason && (
                  <p className="mt-2 text-sm text-red-600">{t('hospital.certs.modal.cause')}: {selectedCert.rejectionReason}</p>
                )}
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('hospital.certs.modal.actType')}</p>
                  <p className="font-medium text-gray-900 dark:text-white">{getTypeLabel(selectedCert.type)}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('hospital.certs.modal.sex')}</p>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedCert.sexe === 'M' ? t('hospital.certs.male') : t('hospital.certs.female')}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('hospital.certs.modal.eventDate')}</p>
                  <p className="font-medium text-gray-900 dark:text-white">{formatDate(selectedCert.dateEvent)}</p>
                </div>
                {selectedCert.dateEmission && (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('hospital.certs.modal.issueDate')}</p>
                    <p className="font-medium text-gray-900 dark:text-white">{formatDate(selectedCert.dateEmission)}</p>
                  </div>
                )}
                {selectedCert.poids && (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('hospital.certs.modal.weight')}</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedCert.poids}</p>
                  </div>
                )}
                {selectedCert.age && (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('hospital.certs.modal.age')}</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedCert.age} ans</p>
                  </div>
                )}
                {selectedCert.cause && (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 col-span-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('hospital.certs.modal.cause')}</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedCert.cause}</p>
                  </div>
                )}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 col-span-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('hospital.certs.modal.location')}</p>
                  <p className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {selectedCert.lieu}{selectedCert.commune ? `, ${selectedCert.commune}` : ''}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('hospital.certs.modal.father')}</p>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedCert.fatherName}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('hospital.certs.modal.mother')}</p>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedCert.motherName}</p>
                </div>
                {selectedCert.numeroActe && (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('hospital.certs.modal.actNumber')}</p>
                    <p className="font-medium text-gray-900 dark:text-white font-mono">{selectedCert.numeroActe}</p>
                  </div>
                )}
                {selectedCert.officier && (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('hospital.certs.modal.doctor')}</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedCert.officier}</p>
                  </div>
                )}
                {selectedCert.hospitalName && (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 col-span-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('hospital.certs.modal.hospital')}</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedCert.hospitalName}</p>
                  </div>
                )}
                {selectedCert.validatedBy && (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('hospital.certs.modal.validatedBy')}</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedCert.validatedBy}</p>
                  </div>
                )}
                {selectedCert.validationDate && (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('hospital.certs.modal.validationDate')}</p>
                    <p className="font-medium text-gray-900 dark:text-white">{formatDate(selectedCert.validationDate)}</p>
                  </div>
                )}
              </div>

              {/* QR Code */}
              {selectedCert.qrCode && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 text-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <QrCode className="w-16 h-16 mx-auto text-gray-400 mb-3" />
                  <p className="text-xs text-gray-500 font-mono">{selectedCert.qrCode}</p>
                  <p className="text-xs text-gray-400 mt-1">{t('hospital.certs.modal.qrDesc')}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                <button
                  onClick={() => setSelectedCert(null)}
                  className="flex-1 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-800 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  {t('hospital.certs.modal.close')}
                </button>
                <button
                  onClick={() => navigate(`/hospital-dashboard/${selectedCert.type === 'naissance' ? 'naissances' : 'deces'}/${selectedCert.uuid}`)}
                  className="flex-1 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-medium hover:shadow-lg hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 transition-all"
                >
                  <Eye className="w-4 h-4" />
                  {t('hospital.certs.modal.viewPage')}
                </button>
                {(selectedCert.status === 'approved' || selectedCert.status === 'paid') && (
                  <>
                    <button
                      onClick={() => handleDownloadPDF(selectedCert)}
                      disabled={downloading === selectedCert.uuid}
                      className="flex-1 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl font-medium hover:shadow-lg hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
                    >
                      {downloading === selectedCert.uuid ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowDownToLine className="w-4 h-4" />}
                      {t('hospital.certs.modal.pdf')}
                    </button>
                    <button
                      onClick={() => handlePrint(selectedCert)}
                      className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 transition-all"
                    >
                      <Printer className="w-4 h-4" />
                      {t('hospital.certs.print')}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HospitalCertificats;