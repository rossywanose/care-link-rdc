import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../context/LanguageContext';
import {
  FileText,
  Download,
  Calendar,
  Filter,
  Search,
  ChevronDown,
  ChevronRight,
  Eye,
  Printer,
  Share2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  BarChart3,
  TrendingUp,
  Users,
  Baby,
  Skull,
  MapPin,
  Building2,
  ArrowUpRight,
  X,
  RefreshCw,
  Loader2,
  Shield
} from 'lucide-react';
import { reportAPI } from '../../../services/api';

const AuthorityRapports = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [generateForm, setGenerateForm] = useState({
    title: '',
    type: 'monthly_births',
    period_start: '',
    period_end: '',
    description: ''
  });
  const [mounted, setMounted] = useState(false);

  // Mount animation
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // Fetch reports from backend
  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const res = await reportAPI.getReports();
      const data = (res.data.results || res.data || []).map(r => ({
        id: r.report_id || r.id,
        uuid: r.id,
        title: r.title,
        type: r.report_type,
        period: `${r.period_start} ${t('authority.rapports.periodTo')} ${r.period_end}`,
        period_start: r.period_start,
        period_end: r.period_end,
        dateGenerated: r.created_at?.split('T')[0] || r.created_at,
        generatedBy: r.submitted_by_name || t('authority.rapports.na'),
        status: r.status || 'draft',
        format: r.pdf_file ? 'pdf' : (r.excel_file ? 'excel' : 'pdf'),
        size: '—',
        downloads: 0,
        province: r.hospital_name || t('authority.rapports.na'),
        hospital: r.hospital_name || t('authority.rapports.na'),
        summary: {
          total: (r.total_births || 0) + (r.total_deaths || 0),
          male: (r.male_births || 0) + (r.male_deaths || 0),
          female: (r.female_births || 0) + (r.female_deaths || 0),
          hospitals: 1
        },
        description: r.description || '',
        review_notes: r.review_notes || '',
        submitted_at: r.submitted_at,
        reviewed_at: r.reviewed_at,
        reviewed_by: r.reviewed_by_name || t('authority.rapports.na')
      }));
      setReports(data);
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Normalize status
  const normalizeStatus = (status) => {
    const map = {
      'draft': 'pending',
      'submitted': 'pending',
      'reviewed': 'approved',
      'approved': 'approved',
      'rejected': 'rejected',
    };
    return map[status] || 'pending';
  };

  // Type config
  const typeConfig = {
    monthly_births: { label: t('authority.rapports.typeBirths'), icon: Baby, color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' },
    monthly_deaths: { label: t('authority.rapports.typeDeaths'), icon: Skull, color: 'text-gray-600 bg-gray-100 dark:bg-gray-800' },
    quarterly: { label: t('authority.rapports.typeQuarterly'), icon: BarChart3, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' },
    annual: { label: t('authority.rapports.typeAnnual'), icon: TrendingUp, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' },
    audit: { label: t('authority.rapports.typeAudit'), icon: FileText, color: 'text-violet-600 bg-violet-50 dark:bg-violet-900/20' },
    custom: { label: t('authority.rapports.typeCustom'), icon: MapPin, color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20' }
  };

  const statusConfig = {
    approved: { label: t('authority.rapports.approved'), color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800', icon: CheckCircle2 },
    pending: { label: t('authority.rapports.pending'), color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800', icon: Clock },
    rejected: { label: t('authority.rapports.rejected'), color: 'text-red-600 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800', icon: AlertTriangle }
  };

  const StatusIconComponent = ({ status }) => {
    const Icon = statusConfig[status]?.icon;
    if (!Icon) return null;
    return <Icon className="w-3 h-3" />;
  };

  const TypeIconComponent = ({ type }) => {
    const Icon = typeConfig[type]?.icon || FileText;
    return <Icon className="w-4 h-4" />;
  };

  // Filter reports
  const filteredReports = reports.filter(r => {
    const matchType = filterType === 'all' || r.type === filterType;
    const matchStatus = filterStatus === 'all' || normalizeStatus(r.status) === filterStatus;
    const matchSearch = searchQuery === '' || 
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.generatedBy.toLowerCase().includes(searchQuery.toLowerCase());
    return matchType && matchStatus && matchSearch;
  });

  // Stats
  const stats = {
    total: reports.length,
    pending: reports.filter(r => normalizeStatus(r.status) === 'pending').length,
    approved: reports.filter(r => normalizeStatus(r.status) === 'approved').length,
    rejected: reports.filter(r => normalizeStatus(r.status) === 'rejected').length
  };

  // Open detail
  const openDetail = (report) => {
    setSelectedReport(report);
    setShowDetailModal(true);
  };

  // Handle review (approve/reject)
  const handleReview = async (report, action) => {
    setActionLoading(true);
    try {
      await reportAPI.reviewReport(report.uuid, action);
      await fetchReports();
    } catch (err) {
      console.error('Error reviewing report:', err);
      alert(t('authority.rapports.errorReview'));
    } finally {
      setActionLoading(false);
    }
  };

  // Handle generate
  const handleGenerate = async () => {
    if (!generateForm.title.trim()) return;
    setActionLoading(true);
    try {
      await reportAPI.createReport({
        title: generateForm.title,
        report_type: generateForm.type,
        period_start: generateForm.period_start,
        period_end: generateForm.period_end,
        description: generateForm.description
      });
      setShowGenerateModal(false);
      setGenerateForm({
        title: '',
        type: 'monthly_births',
        period_start: '',
        period_end: '',
        description: ''
      });
      await fetchReports();
    } catch (err) {
      console.error('Error creating report:', err);
      alert(t('authority.rapports.errorCreate'));
    } finally {
      setActionLoading(false);
    }
  };

  // Stat cards data
  const statCards = [
    { label: t('authority.rapports.totalReports'), value: stats.total, icon: FileText, color: 'from-indigo-500 to-indigo-600', filter: 'all' },
    { label: t('authority.rapports.pending'), value: stats.pending, icon: Clock, color: 'from-amber-500 to-amber-600', filter: 'pending' },
    { label: t('authority.rapports.approved'), value: stats.approved, icon: CheckCircle2, color: 'from-emerald-500 to-emerald-600', filter: 'approved' },
    { label: t('authority.rapports.rejected'), value: stats.rejected, icon: AlertTriangle, color: 'from-red-500 to-red-600', filter: 'rejected' }
  ];

  const typeOptions = [
    { value: 'all', label: t('authority.rapports.allTypes') },
    { value: 'monthly_births', label: t('authority.rapports.typeBirths') },
    { value: 'monthly_deaths', label: t('authority.rapports.typeDeaths') },
    { value: 'quarterly', label: t('authority.rapports.typeQuarterly') },
    { value: 'annual', label: t('authority.rapports.typeAnnual') },
    { value: 'audit', label: t('authority.rapports.typeAudit') },
    { value: 'custom', label: t('authority.rapports.typeCustom') }
  ];

  const generateTypeOptions = [
    { value: 'monthly_births', label: t('authority.rapports.typeBirths') },
    { value: 'monthly_deaths', label: t('authority.rapports.typeDeaths') },
    { value: 'quarterly', label: t('authority.rapports.typeQuarterly') },
    { value: 'annual', label: t('authority.rapports.typeAnnual') },
    { value: 'audit', label: t('authority.rapports.typeAudit') },
    { value: 'custom', label: t('authority.rapports.typeCustom') }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className={`space-y-6 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-slide-in-from-top">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            {t('authority.rapports.title')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{t('authority.rapports.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchReports}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all hover:scale-[1.02] text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            {t('authority.rapports.refresh')}
          </button>
          <button
            onClick={() => setShowGenerateModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-medium hover:shadow-lg transition-all hover:scale-[1.02] active:scale-95 text-sm"
          >
            <FileText className="w-4 h-4" />
            {t('authority.rapports.newReport')}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-slide-in-from-bottom-1">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          const isActive = (stat.filter === 'all' && filterStatus === 'all') ||
                          (stat.filter === 'pending' && filterStatus === 'pending') ||
                          (stat.filter === 'approved' && filterStatus === 'approved') ||
                          (stat.filter === 'rejected' && filterStatus === 'rejected');
          return (
            <button
              key={i}
              onClick={() => setFilterStatus(stat.filter)}
              className={`bg-white dark:bg-gray-900 rounded-xl border-2 p-5 text-left transition-all hover:scale-[1.02] ${
                isActive
                  ? 'border-indigo-500 shadow-lg'
                  : 'border-gray-200 dark:border-gray-800 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Filtres */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 animate-slide-in-from-bottom-2">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('authority.rapports.searchPlaceholder')}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {typeOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tableau */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden animate-slide-in-from-bottom-3">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{t('authority.rapports.colId')}</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{t('authority.rapports.colReport')}</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase hidden md:table-cell">{t('authority.rapports.colType')}</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase hidden sm:table-cell">{t('authority.rapports.colPeriod')}</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase hidden lg:table-cell">{t('authority.rapports.colHospital')}</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{t('authority.rapports.colStatus')}</th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{t('authority.rapports.colActions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredReports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors hover:scale-[1.005]">
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm text-gray-900 dark:text-white">{report.id}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${typeConfig[report.type]?.color || typeConfig.custom.color}`}>
                        <TypeIconComponent type={report.type} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">{report.title}</p>
                        <p className="text-xs text-gray-500">{report.format.toUpperCase()} • {report.size}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{typeConfig[report.type]?.label || report.type}</span>
                  </td>
                  <td className="px-6 py-4 hidden sm:table-cell">
                    <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                      <Calendar className="w-3.5 h-3.5" />
                      {report.period}
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                      <Building2 className="w-3.5 h-3.5" />
                      {report.hospital}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${statusConfig[normalizeStatus(report.status)].color}`}>
                      <StatusIconComponent status={normalizeStatus(report.status)} />
                      {statusConfig[normalizeStatus(report.status)].label}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openDetail(report)}
                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all hover:scale-110"
                        title={t('authority.rapports.viewDetails')}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {normalizeStatus(report.status) === 'pending' && (
                        <>
                          <button
                            onClick={() => handleReview(report, 'approve')}
                            disabled={actionLoading}
                            className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-all hover:scale-110"
                            title={t('authority.rapports.approveBtn')}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleReview(report, 'reject')}
                            disabled={actionLoading}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all hover:scale-110"
                            title={t('authority.rapports.rejectBtn')}
                          >
                            <AlertTriangle className="w-4 h-4" />
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
        {filteredReports.length === 0 && (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">{t('authority.rapports.noResults')}</p>
          </div>
        )}
      </div>

      {/* Modal details */}
      {showDetailModal && selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-slide-in-from-bottom-1">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${typeConfig[selectedReport.type]?.color || typeConfig.custom.color}`}>
                  <TypeIconComponent type={selectedReport.type} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">{selectedReport.title}</h2>
                  <p className="text-sm text-gray-500">{selectedReport.id}</p>
                </div>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all hover:scale-110"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status */}
              <div className={`p-4 rounded-xl border ${statusConfig[normalizeStatus(selectedReport.status)].color}`}>
                <div className="flex items-center gap-2">
                  <StatusIconComponent status={normalizeStatus(selectedReport.status)} />
                  <span className="font-medium">{t('authority.rapports.statusLabel')}: {statusConfig[normalizeStatus(selectedReport.status)].label}</span>
                </div>
              </div>

              {/* Resume */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center hover:shadow-sm transition-all">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('authority.rapports.totalRecords')}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedReport.summary.total}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center hover:shadow-sm transition-all">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('authority.rapports.hospitalsCount')}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedReport.summary.hospitals}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center hover:shadow-sm transition-all">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('authority.rapports.male')}</p>
                  <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{selectedReport.summary.male}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center hover:shadow-sm transition-all">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('authority.rapports.female')}</p>
                  <p className="text-xl font-bold text-pink-600 dark:text-pink-400">{selectedReport.summary.female}</p>
                </div>
              </div>

              {/* Metadonnees */}
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-sm text-gray-500 dark:text-gray-400">{t('authority.rapports.generatedOn')}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedReport.dateGenerated}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-sm text-gray-500 dark:text-gray-400">{t('authority.rapports.generatedBy')}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedReport.generatedBy}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-sm text-gray-500 dark:text-gray-400">{t('authority.rapports.hospital')}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedReport.hospital}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-sm text-gray-500 dark:text-gray-400">{t('authority.rapports.period')}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedReport.period}</span>
                </div>
                {selectedReport.reviewed_by !== t('authority.rapports.na') && (
                  <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                    <span className="text-sm text-gray-500 dark:text-gray-400">{t('authority.rapports.reviewedBy')}</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedReport.reviewed_by}</span>
                  </div>
                )}
                {selectedReport.review_notes && (
                  <div className="py-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">{t('authority.rapports.reviewNotes')}</span>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{selectedReport.review_notes}</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all hover:scale-[1.02]"
                >
                  {t('authority.rapports.close')}
                </button>
                {normalizeStatus(selectedReport.status) === 'pending' && (
                  <>
                    <button
                      onClick={() => { handleReview(selectedReport, 'approve'); setShowDetailModal(false); }}
                      disabled={actionLoading}
                      className="flex-1 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl font-medium hover:shadow-lg transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      {t('authority.rapports.approveBtn')}
                    </button>
                    <button
                      onClick={() => { handleReview(selectedReport, 'reject'); setShowDetailModal(false); }}
                      disabled={actionLoading}
                      className="flex-1 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-medium hover:shadow-lg transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <AlertTriangle className="w-4 h-4" />
                      {t('authority.rapports.rejectBtn')}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal generation */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl max-w-lg w-full animate-slide-in-from-bottom-1">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t('authority.rapports.newReport')}</h2>
              </div>
              <button
                onClick={() => setShowGenerateModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all hover:scale-110"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('authority.rapports.reportTitle')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={generateForm.title}
                  onChange={(e) => setGenerateForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder={t('authority.rapports.titlePlaceholder')}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('authority.rapports.reportType')}</label>
                <select
                  value={generateForm.type}
                  onChange={(e) => setGenerateForm(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                >
                  {generateTypeOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('authority.rapports.startDate')}</label>
                  <input
                    type="date"
                    value={generateForm.period_start}
                    onChange={(e) => setGenerateForm(prev => ({ ...prev, period_start: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('authority.rapports.endDate')}</label>
                  <input
                    type="date"
                    value={generateForm.period_end}
                    onChange={(e) => setGenerateForm(prev => ({ ...prev, period_end: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('authority.rapports.description')}</label>
                <textarea
                  value={generateForm.description}
                  onChange={(e) => setGenerateForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder={t('authority.rapports.descPlaceholder')}
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none transition-all"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowGenerateModal(false)}
                  className="flex-1 py-3 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all hover:scale-[1.02]"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={!generateForm.title.trim() || actionLoading}
                  className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-medium hover:shadow-lg transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  {actionLoading ? t('authority.rapports.creating') : t('authority.rapports.create')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthorityRapports;