import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../context/LanguageContext';
import { reportAPI } from '../../../services/api';
import {
  AlertTriangle,
  Shield,
  Search,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  MessageSquare,
  Loader2,
  MapPin,
  Calendar,
  User,
  Phone,
  Mail,
  FileText,
  BarChart3,
  X,
  Send,
  RefreshCw
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const AuthoritySignalement = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewAction, setReviewAction] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewError, setReviewError] = useState('');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Mount animation
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await reportAPI.getCitizenReports();
      const data = response.data.results || response.data || [];
      setReports(data);
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError(t('authority.signalements.errorLoad'));
    } finally {
      setLoading(false);
    }
  };

  const filteredReports = React.useMemo(() => {
    return reports.filter(r => {
      const matchesSearch = !searchQuery ||
        (r.title?.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (r.description?.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (r.report_id?.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (r.submitted_by_name?.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesType = filterType === 'all' || r.report_type === filterType;
      const matchesSeverity = filterSeverity === 'all' || r.severity === filterSeverity;
      const matchesStatus = filterStatus === 'all' || r.status === filterStatus;
      return matchesSearch && matchesType && matchesSeverity && matchesStatus;
    });
  }, [reports, searchQuery, filterType, filterSeverity, filterStatus]);

  const stats = React.useMemo(() => {
    const total = reports.length;
    const pending = reports.filter(r => r.status === 'pending').length;
    const reviewed = reports.filter(r => r.status === 'reviewed').length;
    const resolved = reports.filter(r => r.status === 'resolved').length;
    const rejected = reports.filter(r => r.status === 'rejected').length;
    const critical = reports.filter(r => r.severity === 'critical').length;
    return { total, pending, reviewed, resolved, rejected, critical };
  }, [reports]);

  const severityData = React.useMemo(() => {
    const counts = { low: 0, medium: 0, high: 0, critical: 0 };
    reports.forEach(r => { if (counts[r.severity] !== undefined) counts[r.severity]++; });
    return [
      { name: t('authority.signalements.severityLow'), value: counts.low, color: '#3b82f6' },
      { name: t('authority.signalements.severityMedium'), value: counts.medium, color: '#f59e0b' },
      { name: t('authority.signalements.severityHigh'), value: counts.high, color: '#f97316' },
      { name: t('authority.signalements.severityCritical'), value: counts.critical, color: '#ef4444' }
    ].filter(d => d.value > 0);
  }, [reports, t]);

  const statusData = React.useMemo(() => {
    return [
      { name: t('authority.signalements.statusPending'), value: stats.pending, color: '#f59e0b' },
      { name: t('authority.signalements.statusReviewed'), value: stats.reviewed, color: '#3b82f6' },
      { name: t('authority.signalements.statusResolved'), value: stats.resolved, color: '#10b981' },
      { name: t('authority.signalements.statusRejected'), value: stats.rejected, color: '#ef4444' }
    ].filter(d => d.value > 0);
  }, [stats, t]);

  const typeConfig = {
    fraud: { label: t('authority.signalements.typeFraud'), icon: Shield, color: 'text-red-600 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' },
    error: { label: t('authority.signalements.typeError'), icon: FileText, color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' },
    hospital: { label: t('authority.signalements.typeHospital'), icon: User, color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800' },
    system: { label: t('authority.signalements.typeSystem'), icon: AlertTriangle, color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800' },
    other: { label: t('authority.signalements.typeOther'), icon: MessageSquare, color: 'text-gray-600 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700' }
  };

  const severityConfig = {
    low: { label: t('authority.signalements.severityLow'), color: 'bg-blue-500', text: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    medium: { label: t('authority.signalements.severityMedium'), color: 'bg-amber-500', text: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    high: { label: t('authority.signalements.severityHigh'), color: 'bg-orange-500', text: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20' },
    critical: { label: t('authority.signalements.severityCritical'), color: 'bg-red-500', text: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' }
  };

  const statusConfig = {
    pending: { label: t('authority.signalements.statusPending'), icon: Clock, color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800' },
    reviewed: { label: t('authority.signalements.statusReviewed'), icon: Eye, color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' },
    resolved: { label: t('authority.signalements.statusResolved'), icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' },
    rejected: { label: t('authority.signalements.statusRejected'), icon: XCircle, color: 'text-red-600 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' }
  };

  const openDetail = (report) => {
    setSelectedReport(report);
    setShowDetailModal(true);
  };

  const openReview = (report, action) => {
    setSelectedReport(report);
    setReviewAction(action);
    setReviewNotes('');
    setReviewError('');
    setShowReviewModal(true);
  };

  const handleReview = async () => {
    if (!selectedReport || !reviewAction) return;
    setIsReviewing(true);
    setReviewError('');
    try {
      await reportAPI.reviewCitizenReport(selectedReport.id, reviewAction, reviewNotes);
      setReports(prev => prev.map(r =>
        r.id === selectedReport.id
          ? { ...r, status: reviewAction === 'resolve' ? 'resolved' : reviewAction === 'reject' ? 'rejected' : 'reviewed', reviewed_at: new Date().toISOString(), review_notes: reviewNotes }
          : r
      ));
      setShowReviewModal(false);
      setSelectedReport(null);
    } catch (err) {
      console.error('Review error:', err);
      setReviewError(err.response?.data?.detail || t('authority.signalements.errorReview'));
    } finally {
      setIsReviewing(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return t('authority.signalements.na');
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const kpiCards = [
    { label: t('authority.signalements.total'), value: stats.total, color: 'from-gray-500 to-gray-600', icon: BarChart3, delay: 1 },
    { label: t('authority.signalements.pending'), value: stats.pending, color: 'from-amber-500 to-amber-600', icon: Clock, delay: 2 },
    { label: t('authority.signalements.reviewed'), value: stats.reviewed, color: 'from-blue-500 to-blue-600', icon: Eye, delay: 3 },
    { label: t('authority.signalements.resolved'), value: stats.resolved, color: 'from-emerald-500 to-emerald-600', icon: CheckCircle2, delay: 4 },
    { label: t('authority.signalements.critical'), value: stats.critical, color: 'from-red-500 to-red-600', icon: AlertTriangle, delay: 5 },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 flex items-center gap-3 animate-shake">
        <AlertTriangle className="w-6 h-6 text-red-600" />
        <div>
          <p className="text-red-700 dark:text-red-400 font-medium">{error}</p>
          <button onClick={fetchReports} className="text-sm text-red-600 hover:underline mt-1">{t('authority.signalements.retry')}</button>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-slide-in-from-top">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center hover:scale-105 transition-transform">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            {t('authority.signalements.title')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{t('authority.signalements.subtitle')}</p>
        </div>
        <button
          onClick={fetchReports}
          className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:shadow-md transition-all hover:scale-[1.02] active:scale-95 text-sm"
        >
          <RefreshCw className="w-4 h-4" />
          {t('authority.signalements.refresh')}
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {kpiCards.map((kpi, i) => (
          <div
            key={i}
            className={`bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 hover:shadow-lg transition-all hover:scale-[1.02] cursor-pointer animate-slide-in-from-bottom-${kpi.delay}`}
          >
            <div className={`w-9 h-9 bg-gradient-to-br ${kpi.color} rounded-lg flex items-center justify-center mb-3 hover:scale-105 transition-transform`}>
              <kpi.icon className="w-4 h-4 text-white" />
            </div>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{kpi.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6 animate-slide-in-from-bottom-2">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 hover:shadow-lg transition-all">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t('authority.signalements.chartSeverity')}</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={severityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 hover:shadow-lg transition-all">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t('authority.signalements.chartStatus')}</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value" animationBegin={300} animationDuration={1200}>
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 animate-slide-in-from-bottom-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={t('authority.signalements.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all hover:border-gray-300 dark:hover:border-gray-600"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all hover:border-gray-300 dark:hover:border-gray-600"
          >
            <option value="all">{t('authority.signalements.allTypes')}</option>
            <option value="fraud">{t('authority.signalements.typeFraud')}</option>
            <option value="error">{t('authority.signalements.typeError')}</option>
            <option value="hospital">{t('authority.signalements.typeHospital')}</option>
            <option value="system">{t('authority.signalements.typeSystem')}</option>
            <option value="other">{t('authority.signalements.typeOther')}</option>
          </select>
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all hover:border-gray-300 dark:hover:border-gray-600"
          >
            <option value="all">{t('authority.signalements.allSeverities')}</option>
            <option value="low">{t('authority.signalements.severityLow')}</option>
            <option value="medium">{t('authority.signalements.severityMedium')}</option>
            <option value="high">{t('authority.signalements.severityHigh')}</option>
            <option value="critical">{t('authority.signalements.severityCritical')}</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all hover:border-gray-300 dark:hover:border-gray-600"
          >
            <option value="all">{t('authority.signalements.allStatuses')}</option>
            <option value="pending">{t('authority.signalements.statusPending')}</option>
            <option value="reviewed">{t('authority.signalements.statusReviewed')}</option>
            <option value="resolved">{t('authority.signalements.statusResolved')}</option>
            <option value="rejected">{t('authority.signalements.statusRejected')}</option>
          </select>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden animate-slide-in-from-bottom-3">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t('authority.signalements.listTitle')}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{filteredReports.length} {t('authority.signalements.results')}</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('authority.signalements.colId')}</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('authority.signalements.colTypeTitle')}</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('authority.signalements.colSeverity')}</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('authority.signalements.colStatus')}</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('authority.signalements.colDate')}</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('authority.signalements.colSubmittedBy')}</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('authority.signalements.colActions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    <AlertTriangle className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                    <p>{t('authority.signalements.noResults')}</p>
                  </td>
                </tr>
              ) : (
                filteredReports.map((report) => {
                  const typeInfo = typeConfig[report.report_type] || typeConfig.other;
                  const severityInfo = severityConfig[report.severity] || severityConfig.medium;
                  const statusInfo = statusConfig[report.status] || statusConfig.pending;
                  const TypeIcon = typeInfo.icon;
                  const StatusIcon = statusInfo.icon;

                  return (
                    <tr key={report.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors hover:scale-[1.005] transform-gpu">
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs text-gray-500">{report.report_id}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${typeInfo.color.split(' ').slice(1).join(' ')} hover:scale-105 transition-transform`}>
                            <TypeIcon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 dark:text-white text-sm truncate max-w-[200px]">{report.title}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{typeInfo.label}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-2.5 h-2.5 rounded-full ${severityInfo.color}`} />
                          <span className={`text-xs font-medium ${severityInfo.text}`}>{severityInfo.label}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusInfo.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(report.created_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs text-gray-500">
                          {report.is_anonymous ? (
                            <span className="italic text-gray-400">{t('authority.signalements.anonymous')}</span>
                          ) : (
                            <span>{report.submitted_by_name || t('authority.signalements.na')}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openDetail(report)}
                            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all hover:scale-110"
                            title={t('authority.signalements.viewDetail')}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {report.status === 'pending' && (
                            <button
                              onClick={() => openReview(report, 'review')}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all hover:scale-110"
                              title={t('authority.signalements.takeCharge')}
                            >
                              <Clock className="w-4 h-4" />
                            </button>
                          )}
                          {report.status === 'reviewed' && (
                            <>
                              <button
                                onClick={() => openReview(report, 'resolve')}
                                className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-all hover:scale-110"
                                title={t('authority.signalements.resolve')}
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => openReview(report, 'reject')}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all hover:scale-110"
                                title={t('authority.signalements.reject')}
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-slide-in-from-bottom">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-900 z-10">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${(typeConfig[selectedReport.report_type] || typeConfig.other).color.split(' ').slice(1).join(' ')}`}>
                  {React.createElement((typeConfig[selectedReport.report_type] || typeConfig.other).icon, { className: "w-5 h-5" })}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">{selectedReport.title}</h3>
                  <p className="text-xs text-gray-500 font-mono">{selectedReport.report_id}</p>
                </div>
              </div>
              <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors hover:scale-110">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex flex-wrap gap-2">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${(statusConfig[selectedReport.status] || statusConfig.pending).color}`}>
                  {React.createElement((statusConfig[selectedReport.status] || statusConfig.pending).icon, { className: "w-3.5 h-3.5" })}
                  {(statusConfig[selectedReport.status] || statusConfig.pending).label}
                </span>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${(severityConfig[selectedReport.severity] || severityConfig.medium).bg} ${(severityConfig[selectedReport.severity] || severityConfig.medium).text}`}>
                  <div className={`w-2 h-2 rounded-full ${(severityConfig[selectedReport.severity] || severityConfig.medium).color}`} />
                  {t('authority.signalements.severityLabel')}: {(severityConfig[selectedReport.severity] || severityConfig.medium).label}
                </span>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">{t('authority.signalements.description')}</h4>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {selectedReport.description}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">{t('authority.signalements.location')}</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedReport.location || t('authority.signalements.na')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FileText className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">{t('authority.signalements.certificateConcerned')}</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedReport.certificate_id || t('authority.signalements.none')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">{t('authority.signalements.reportDate')}</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(selectedReport.created_at)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <User className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">{t('authority.signalements.submittedBy')}</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {selectedReport.is_anonymous ? (
                        <span className="italic text-gray-400">{t('authority.signalements.anonymous')}</span>
                      ) : (
                        selectedReport.submitted_by_name || t('authority.signalements.na')
                      )}
                    </p>
                  </div>
                </div>
                {!selectedReport.is_anonymous && selectedReport.contact_phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">{t('authority.signalements.phone')}</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedReport.contact_phone}</p>
                    </div>
                  </div>
                )}
                {!selectedReport.is_anonymous && selectedReport.contact_email && (
                  <div className="flex items-start gap-3">
                    <Mail className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">{t('authority.signalements.email')}</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedReport.contact_email}</p>
                    </div>
                  </div>
                )}
              </div>

              {selectedReport.review_notes && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">{t('authority.signalements.reviewNotes')}</h4>
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 text-sm text-blue-800 dark:text-blue-300">
                    {selectedReport.review_notes}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                {selectedReport.status === 'pending' && (
                  <button
                    onClick={() => { setShowDetailModal(false); openReview(selectedReport, 'review'); }}
                    className="flex-1 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:shadow-lg transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Clock className="w-4 h-4" />
                    {t('authority.signalements.takeCharge')}
                  </button>
                )}
                {selectedReport.status === 'reviewed' && (
                  <>
                    <button
                      onClick={() => { setShowDetailModal(false); openReview(selectedReport, 'resolve'); }}
                      className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-medium hover:shadow-lg transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      {t('authority.signalements.resolve')}
                    </button>
                    <button
                      onClick={() => { setShowDetailModal(false); openReview(selectedReport, 'reject'); }}
                      className="flex-1 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-medium hover:shadow-lg transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      {t('authority.signalements.reject')}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 w-full max-w-lg shadow-2xl animate-slide-in-from-bottom">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                {reviewAction === 'resolve' && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                {reviewAction === 'reject' && <XCircle className="w-5 h-5 text-red-600" />}
                {reviewAction === 'review' && <Clock className="w-5 h-5 text-blue-600" />}
                {reviewAction === 'resolve' && t('authority.signalements.resolveTitle')}
                {reviewAction === 'reject' && t('authority.signalements.rejectTitle')}
                {reviewAction === 'review' && t('authority.signalements.reviewTitle')}
              </h3>
              <p className="text-sm text-gray-500 mt-1">{selectedReport.title}</p>
            </div>
            <div className="p-6 space-y-4">
              {reviewError && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3 flex items-center gap-2 animate-shake">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <p className="text-sm text-red-600 dark:text-red-400">{reviewError}</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('authority.signalements.reviewNotesLabel')} {reviewAction === 'reject' && <span className="text-red-500">*</span>}
                </label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder={
                    reviewAction === 'resolve' ? t('authority.signalements.resolvePlaceholder') :
                    reviewAction === 'reject' ? t('authority.signalements.rejectPlaceholder') :
                    t('authority.signalements.reviewPlaceholder')
                  }
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none text-sm transition-all hover:border-gray-300 dark:hover:border-gray-600"
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex gap-3">
              <button
                onClick={() => setShowReviewModal(false)}
                className="px-5 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all hover:scale-[1.02] active:scale-95"
              >
                {t('authority.signalements.cancel')}
              </button>
              <button
                onClick={handleReview}
                disabled={isReviewing || (reviewAction === 'reject' && !reviewNotes.trim())}
                className={`flex-1 py-2.5 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 ${
                  reviewAction === 'resolve' ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' :
                  reviewAction === 'reject' ? 'bg-gradient-to-r from-red-500 to-red-600' :
                  'bg-gradient-to-r from-blue-500 to-blue-600'
                }`}
              >
                {isReviewing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t('authority.signalements.processing')}
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    {reviewAction === 'resolve' && t('authority.signalements.resolve')}
                    {reviewAction === 'reject' && t('authority.signalements.reject')}
                    {reviewAction === 'review' && t('authority.signalements.confirm')}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthoritySignalement;