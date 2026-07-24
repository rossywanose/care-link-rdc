import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Baby, Search, Filter, Plus, Eye, Edit2, Trash2, CheckCircle2,
  Clock, XCircle, Loader2, AlertTriangle, FileText, ArrowRight,
  ChevronLeft, ChevronRight, Download, Printer
} from 'lucide-react';
import { birthAPI } from '../../../services/api';
import { useLanguage } from '../../../context/LanguageContext';

const HospitalNaissances = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [births, setBirths] = useState([]);
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
    fetchBirths();
  }, [currentPage, statusFilter]);

  const fetchBirths = async () => {
    setIsLoading(true);
    setError('');
    try {
      const params = { page: currentPage };
      if (statusFilter !== 'all') params.status = statusFilter;

      const response = await birthAPI.getBirths(params);
      const data = response.data;

      setBirths(data.results || data);
      setTotalPages(data.total_pages || 1);
    } catch (err) {
      console.error('Error fetching births:', err);
      setError(t('hospital.naissances.errorLoad'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('hospital.naissances.confirmDelete'))) return;
    setDeletingId(id);
    try {
      await birthAPI.deleteBirth(id);
      fetchBirths();
    } catch (err) {
      console.error('Error deleting birth:', err);
      setError(t('hospital.naissances.errorDelete'));
    } finally {
      setDeletingId(null);
    }
  };

  const handleDownloadPDF = async (id, certificateId) => {
    setDownloadingId(id);
    setDownloadError('');
    try {
      const response = await birthAPI.downloadCertificate(id);

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Attestation_Naissance_${certificateId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading certificate:', err);
      if (err.response?.status === 403) {
        setDownloadError(t('hospital.naissances.downloadAlert'));
      } else {
        setDownloadError(t('hospital.naissances.downloadError'));
      }
    } finally {
      setDownloadingId(null);
    }
  };

  const filteredBirths = births.filter(birth => {
    const searchLower = searchTerm.toLowerCase();
    const fullName = `${birth.child_first_name || ''} ${birth.child_last_name || ''}`.toLowerCase();
    const certId = (birth.certificate_id || '').toLowerCase();
    return fullName.includes(searchLower) || certId.includes(searchLower);
  });

  const getStatusBadge = (status) => {
    const configs = {
      approved: { 
        label: t('hospital.naissances.status.approved'), 
        color: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' 
      },
      pending: { 
        label: t('hospital.naissances.status.pending'), 
        color: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800' 
      },
      rejected: { 
        label: t('hospital.naissances.status.rejected'), 
        color: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800' 
      },
      draft: { 
        label: t('hospital.naissances.status.draft'), 
        color: 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700' 
      },
      paid: { 
        label: t('hospital.naissances.status.paid'), 
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('hospital.naissances.title')}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{t('hospital.naissances.subtitle')}</p>
        </div>
        <button
          onClick={() => navigate('/hospital-dashboard/naissances/nouveau')}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:shadow-lg transition-all hover:scale-[1.02] active:scale-95"
        >
          <Plus className="w-4 h-4" />
          {t('hospital.naissances.newBirth')}
        </button>
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
      <div className="flex flex-col sm:flex-row gap-4 animate-slide-in-from-bottom-1">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
          <input
            type="text"
            placeholder={t('hospital.naissances.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all hover:border-gray-300 dark:hover:border-gray-700"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all hover:border-gray-300 dark:hover:border-gray-700 cursor-pointer"
          >
            <option value="all">{t('hospital.naissances.filter.all')}</option>
            <option value="draft">{t('hospital.naissances.filter.draft')}</option>
            <option value="pending">{t('hospital.naissances.filter.pending')}</option>
            <option value="approved">{t('hospital.naissances.filter.approved')}</option>
            <option value="rejected">{t('hospital.naissances.filter.rejected')}</option>
            <option value="paid">{t('hospital.naissances.filter.paid')}</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden animate-slide-in-from-bottom-2 hover:shadow-lg transition-shadow duration-300">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 animate-fade-in">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        ) : filteredBirths.length === 0 ? (
          <div className="p-8 text-center animate-fade-in">
            <Baby className="w-12 h-12 text-gray-300 mx-auto mb-3 animate-bounce" />
            <p className="text-gray-500 dark:text-gray-400">{t('hospital.naissances.noResults')}</p>
            <p className="text-sm text-gray-400 mt-1">{t('hospital.naissances.noResultsDesc')}</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800">
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('hospital.naissances.table.certNumber')}</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('hospital.naissances.table.child')}</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('hospital.naissances.table.birthDate')}</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('hospital.naissances.table.sex')}</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('hospital.naissances.table.status')}</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('hospital.naissances.table.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filteredBirths.map((birth, index) => (
                    <tr 
                      key={birth.id} 
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-200 animate-fade-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm text-gray-900 dark:text-white">{birth.certificate_id}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center transition-transform hover:scale-110">
                            <Baby className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {birth.child_first_name} {birth.child_last_name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {t('hospital.naissances.mother')} {birth.mother_first_name} {birth.mother_last_name}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {birth.date_of_birth}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium transition-all hover:scale-105 ${
                          birth.gender === 'M'
                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                            : 'bg-pink-50 dark:bg-pink-900/20 text-pink-600'
                        }`}>
                          {birth.gender === 'M' ? t('hospital.naissances.male') : t('hospital.naissances.female')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(birth.status)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => navigate(`/hospital-dashboard/naissances/${birth.id}`)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all hover:scale-110"
                            title={t('hospital.naissances.tooltip.view')}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => navigate(`/hospital-dashboard/naissances/${birth.id}/edit`)}
                            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all hover:scale-110"
                            title={t('hospital.naissances.tooltip.edit')}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDownloadPDF(birth.id, birth.certificate_id)}
                            disabled={downloadingId === birth.id || birth.status === 'draft'}
                            className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-all hover:scale-110 disabled:opacity-30 disabled:hover:scale-100"
                            title={birth.status === 'draft' ? t('hospital.naissances.tooltip.draftDownload') : t('hospital.naissances.tooltip.download')}
                          >
                            {downloadingId === birth.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Download className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDelete(birth.id)}
                            disabled={deletingId === birth.id}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all hover:scale-110 disabled:opacity-30 disabled:hover:scale-100"
                            title={t('hospital.naissances.tooltip.delete')}
                          >
                            {deletingId === birth.id ? (
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
                  {t('hospital.naissances.pagination.prev')}
                </button>
                <span className="text-sm text-gray-500">
                  {t('hospital.naissances.pagination.page')} {currentPage} {t('hospital.naissances.pagination.of')} {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg disabled:opacity-50 transition-all hover:scale-105 active:scale-95"
                >
                  {t('hospital.naissances.pagination.next')}
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

export default HospitalNaissances;
