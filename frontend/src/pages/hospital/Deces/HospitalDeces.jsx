import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Skull, Search, Filter, Plus, Eye, Edit2, Trash2, CheckCircle2,
  Clock, XCircle, Loader2, AlertTriangle, FileText, Calendar,
  ChevronLeft, ChevronRight, Download, Printer
} from 'lucide-react';
import { deathAPI } from '../../../services/api';
import { useLanguage } from '../../../context/LanguageContext';

const HospitalDeces = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [deaths, setDeaths] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [downloadingId, setDownloadingId] = useState(null);
  const [downloadError, setDownloadError] = useState('');
  const [mounted, setMounted] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    setMounted(true);
    fetchDeaths();
  }, [currentPage, statusFilter]);

  const fetchDeaths = async () => {
    setIsLoading(true);
    setError('');
    try {
      const params = { page: currentPage };
      if (statusFilter !== 'all') params.status = statusFilter;

      const response = await deathAPI.getDeaths(params);
      const data = response.data;

      setDeaths(data.results || data);
      setTotalPages(data.total_pages || 1);
    } catch (err) {
      console.error('Error fetching deaths:', err);
      setError(t('hospital.deces.errorLoad'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('hospital.deces.confirmDelete'))) return;
    setDeletingId(id);
    try {
      await deathAPI.deleteDeath(id);
      fetchDeaths();
    } catch (err) {
      console.error('Error deleting death:', err);
      setError(t('hospital.deces.errorDelete'));
    } finally {
      setDeletingId(null);
    }
  };

  const handleDownloadPDF = async (id, certificateId) => {
    setDownloadingId(id);
    setDownloadError('');
    try {
      const response = await deathAPI.downloadCertificate(id);

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Attestation_Deces_${certificateId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading certificate:', err);
      if (err.response?.status === 403) {
        setDownloadError(t('hospital.deces.downloadAlert'));
      } else {
        setDownloadError(t('hospital.deces.downloadError'));
      }
    } finally {
      setDownloadingId(null);
    }
  };

  const filteredDeaths = deaths.filter(death => {
    const searchLower = searchTerm.toLowerCase();
    const fullName = `${death.first_name || ''} ${death.last_name || ''}`.toLowerCase();
    const certId = (death.certificate_id || '').toLowerCase();
    return fullName.includes(searchLower) || certId.includes(searchLower);
  });

  const getStatusBadge = (status) => {
    const configs = {
      approved: { 
        label: t('hospital.deces.status.approved'), 
        color: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' 
      },
      pending: { 
        label: t('hospital.deces.status.pending'), 
        color: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800' 
      },
      rejected: { 
        label: t('hospital.deces.status.rejected'), 
        color: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800' 
      },
      draft: { 
        label: t('hospital.deces.status.draft'), 
        color: 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700' 
      },
      paid: { 
        label: t('hospital.deces.status.paid'), 
        color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800' 
      }
    };
    const config = configs[status] || configs.draft;
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${config.color}`}>
        {status === 'approved' && <CheckCircle2 className="w-3 h-3" />}
        {status === 'pending' && <Clock className="w-3 h-3" />}
        {status === 'rejected' && <XCircle className="w-3 h-3" />}
        {config.label}
      </span>
    );
  };

  return (
    <div className={`space-y-6 transition-all duration-700 ease-out ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-slide-in-from-top">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('hospital.deces.title')}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{t('hospital.deces.subtitle')}</p>
        </div>
        <button
          onClick={() => navigate('/hospital-dashboard/deces/nouveau')}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl font-medium hover:shadow-lg transition-all hover:scale-[1.02] active:scale-95"
        >
          <Plus className="w-4 h-4" />
          {t('hospital.deces.newDecl')}
        </button>
      </div>

      {/* Alert */}
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-start gap-3 animate-slide-in-from-bottom-1 hover:shadow-md transition-shadow duration-300">
        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-amber-800 dark:text-amber-400">{t('hospital.deces.alert.title')}</p>
          <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
            {t('hospital.deces.alert.desc1')} <strong>{t('hospital.deces.alert.hours')}</strong>. {t('hospital.deces.alert.desc2')}
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center gap-3 animate-shake">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Download error */}
      {downloadError && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-center gap-3 animate-shake">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-700 dark:text-amber-400">{downloadError}</p>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 animate-slide-in-from-bottom-2">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
          <input
            type="text"
            placeholder={t('hospital.deces.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all hover:border-gray-300 dark:hover:border-gray-700"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all hover:border-gray-300 dark:hover:border-gray-700 cursor-pointer"
          >
            <option value="all">{t('hospital.deces.filter.all')}</option>
            <option value="draft">{t('hospital.deces.filter.draft')}</option>
            <option value="pending">{t('hospital.deces.filter.pending')}</option>
            <option value="approved">{t('hospital.deces.filter.approved')}</option>
            <option value="rejected">{t('hospital.deces.filter.rejected')}</option>
            <option value="paid">{t('hospital.deces.filter.paid')}</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden animate-slide-in-from-bottom-3 hover:shadow-lg transition-shadow duration-300">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 animate-fade-in">
            <Loader2 className="w-8 h-8 text-gray-600 animate-spin" />
          </div>
        ) : filteredDeaths.length === 0 ? (
          <div className="p-8 text-center animate-fade-in">
            <Skull className="w-12 h-12 text-gray-300 mx-auto mb-3 animate-bounce" />
            <p className="text-gray-500 dark:text-gray-400">{t('hospital.deces.noResults')}</p>
            <p className="text-sm text-gray-400 mt-1">{t('hospital.deces.noResultsDesc')}</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800">
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('hospital.deces.table.certNumber')}</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('hospital.deces.table.deceased')}</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('hospital.deces.table.deathDate')}</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('hospital.deces.table.sex')}</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('hospital.deces.table.status')}</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('hospital.deces.table.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filteredDeaths.map((death, index) => (
                    <tr 
                      key={death.id} 
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-200 animate-fade-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm text-gray-900 dark:text-white">{death.certificate_id}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-transform hover:scale-110 ${
                            death.gender === 'M' ? 'bg-gray-100 dark:bg-gray-800' : 'bg-gray-100 dark:bg-gray-800'
                          }`}>
                            <Skull className="w-4 h-4 text-gray-500" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {death.first_name} {death.last_name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {death.cause_of_death ? death.cause_of_death.substring(0, 30) + '...' : t('hospital.deces.notSpecified')}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {death.date_of_death}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium transition-all hover:scale-105 ${
                          death.gender === 'M'
                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                            : 'bg-pink-50 dark:bg-pink-900/20 text-pink-600'
                        }`}>
                          {death.gender === 'M' ? t('hospital.deces.male') : t('hospital.deces.female')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(death.status)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => navigate(`/hospital-dashboard/deces/${death.id}`)}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-all hover:scale-110"
                            title={t('hospital.deces.tooltip.view')}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => navigate(`/hospital-dashboard/deces/${death.id}/edit`)}
                            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all hover:scale-110"
                            title={t('hospital.deces.tooltip.edit')}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDownloadPDF(death.id, death.certificate_id)}
                            disabled={downloadingId === death.id || death.status === 'draft'}
                            className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-all hover:scale-110 disabled:opacity-30 disabled:hover:scale-100"
                            title={death.status === 'draft' ? t('hospital.deces.tooltip.draftDownload') : t('hospital.deces.tooltip.download')}
                          >
                            {downloadingId === death.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Download className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDelete(death.id)}
                            disabled={deletingId === death.id}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all hover:scale-110 disabled:opacity-30 disabled:hover:scale-100"
                            title={t('hospital.deces.tooltip.delete')}
                          >
                            {deletingId === death.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-800 animate-slide-in-from-bottom">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg disabled:opacity-50 transition-all hover:scale-105 active:scale-95"
                >
                  <ChevronLeft className="w-4 h-4" />
                  {t('hospital.deces.pagination.prev')}
                </button>
                <span className="text-sm text-gray-500">
                  {t('hospital.deces.pagination.page')} {currentPage} {t('hospital.deces.pagination.of')} {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg disabled:opacity-50 transition-all hover:scale-105 active:scale-95"
                >
                  {t('hospital.deces.pagination.next')}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default HospitalDeces;