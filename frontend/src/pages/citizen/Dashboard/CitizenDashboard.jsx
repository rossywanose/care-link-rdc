import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import { birthAPI, deathAPI, notificationAPI, reportAPI } from '../../../services/api';
import {
  FileText,
  Download,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Calendar,
  MapPin,
  User,
  QrCode,
  Plus,
  Loader2,
  Eye,
  X,
  ShieldCheck
} from 'lucide-react';

const CitizenDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Data from backend
  const [births, setBirths] = useState([]);
  const [deaths, setDeaths] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });

  // Fetch data on mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [birthsRes, deathsRes, notifsRes] = await Promise.all([
        birthAPI.getBirths(),
        deathAPI.getDeaths(),
        notificationAPI.getNotifications()
      ]);

      const birthsData = Array.isArray(birthsRes.data) ? birthsRes.data : 
                        birthsRes.data?.results || [];
      const deathsData = Array.isArray(deathsRes.data) ? deathsRes.data : 
                        deathsRes.data?.results || [];
      const notifsData = Array.isArray(notifsRes.data) ? notifsRes.data : 
                        notifsRes.data?.notifications || [];

      setBirths(birthsData);
      setDeaths(deathsData);
      setNotifications(notifsData.slice(0, 5));

      const allCerts = [...birthsData, ...deathsData];
      setStats({
        total: allCerts.length,
        pending: allCerts.filter(c => c.status === 'pending').length,
        approved: allCerts.filter(c => c.status === 'approved').length,
        rejected: allCerts.filter(c => c.status === 'rejected').length
      });

      try {
        const reportsRes = await reportAPI.getCitizenReports();
        const reportsData = Array.isArray(reportsRes.data) ? reportsRes.data : 
                           reportsRes.data?.results || [];
        setReports(reportsData.slice(0, 5));
      } catch (reportErr) {
        console.log('Reports API not available:', reportErr.message);
        setReports([]);
      }

    } catch (err) {
      console.error('Dashboard error:', err);
      setError(t('dashboard.errorLoad'));
    } finally {
      setLoading(false);
    }
  };

  const openReportModal = (report) => {
    setSelectedReport(report);
    setShowReportModal(true);
  };

  const closeReportModal = () => {
    setSelectedReport(null);
    setShowReportModal(false);
  };

  const getReportStatusLabel = (status) => {
    const labels = {
      pending: { text: t('dashboard.status.pending'), color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 border-amber-200' },
      reviewed: { text: t('dashboard.status.reviewed'), color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-200' },
      resolved: { text: t('dashboard.status.resolved'), color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200' },
      rejected: { text: t('dashboard.status.rejected'), color: 'text-red-600 bg-red-50 dark:bg-red-900/20 border-red-200' }
    };
    return labels[status] || labels.pending;
  };

  const getAllActivities = () => {
    const certActivities = recentCertificates.map(cert => {
      const isApproved = cert.status === 'approved';
      const isRejected = cert.status === 'rejected';
      return {
        action: isApproved ? t('dashboard.activity.certApproved') : isRejected ? t('dashboard.activity.certRejected') : t('dashboard.activity.requestSubmitted'),
        detail: `${getCertId(cert)} - ${getPersonName(cert)}`,
        time: formatDate(cert.created_at || cert.date),
        icon: isApproved ? CheckCircle2 : isRejected ? XCircle : FileText,
        color: isApproved ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 
               isRejected ? 'text-red-500 bg-red-50 dark:bg-red-900/20' : 
               'text-blue-500 bg-blue-50 dark:bg-blue-900/20',
        date: cert.created_at || cert.date,
        isReport: false
      };
    });

    const reportActivities = reports.map(report => {
      const isResolved = report.status === 'resolved';
      const isReviewed = report.status === 'reviewed';
      return {
        action: isResolved ? t('dashboard.activity.reportResolved') : isReviewed ? t('dashboard.activity.reportReviewed') : t('dashboard.activity.reportSent'),
        detail: `${report.report_id} - ${report.title}`,
        time: formatDate(report.created_at),
        icon: isResolved ? CheckCircle2 : isReviewed ? Clock : AlertTriangle,
        color: isResolved ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 
               isReviewed ? 'text-amber-500 bg-amber-50 dark:bg-amber-900/20' : 
               'text-orange-500 bg-orange-50 dark:bg-orange-900/20',
        date: report.created_at,
        isReport: true,
        report: report
      };
    });

    return [...certActivities, ...reportActivities]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 6);
  };

  const getRecentCertificates = () => {
    const all = [
      ...births.map(b => ({ ...b, type: t('common.birth'), certType: 'birth' })),
      ...deaths.map(d => ({ ...d, type: t('common.death'), certType: 'death' }))
    ];
    return all
      .sort((a, b) => new Date(b.created_at || b.date) - new Date(a.created_at || a.date))
      .slice(0, 4);
  };

  const statusConfig = {
    approved: { label: t('dashboard.status.approved'), icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' },
    pending: { label: t('dashboard.status.pending'), icon: Clock, color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800' },
    rejected: { label: t('dashboard.status.rejected'), icon: XCircle, color: 'text-red-600 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' },
  };

  const getStatusBadge = (status) => {
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${config.color}`}>
        <config.icon className="w-3.5 h-3.5" />
        {config.label}
      </span>
    );
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('fr-FR');
  };

  const getHospitalName = (cert) => {
    return cert.hospital?.name || cert.hospital_name || t('dashboard.recentCerts.hospitalUnknown');
  };

  const getPersonName = (cert) => {
    return cert.child_name || cert.deceased_name || cert.full_name || 'N/A';
  };

  const getCertId = (cert) => {
    return cert.certificate_number || cert.certificate_id || cert.id || 'N/A';
  };

  const recentCertificates = getRecentCertificates();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <span className="ml-3 text-gray-600 dark:text-gray-400">{t('dashboard.loading')}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <p className="text-red-600 dark:text-red-400">{error}</p>
        <button
          onClick={fetchDashboardData}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          {t('dashboard.retry')}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('dashboard.title')}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {t('dashboard.welcome').replace('{name}', user?.first_name || '')}
          </p>
        </div>
        <button
          onClick={() => navigate('/citizen-dashboard/certificats')}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-indigo-500/30 transition-all hover:scale-[1.02]"
        >
          <Plus className="w-5 h-5" />
          {t('dashboard.newRequest')}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: t('dashboard.stats.totalCerts'), value: stats.total, icon: FileText, color: 'from-blue-500 to-blue-600', trend: t('dashboard.stats.total').replace('{count}', stats.total) },
          { label: t('dashboard.stats.pending'), value: stats.pending, icon: Clock, color: 'from-amber-500 to-amber-600', trend: t('dashboard.stats.inProgress').replace('{count}', stats.pending) },
          { label: t('dashboard.stats.approved'), value: stats.approved, icon: CheckCircle2, color: 'from-emerald-500 to-emerald-600', trend: t('dashboard.stats.valid').replace('{count}', stats.approved) },
          { label: t('dashboard.stats.rejected'), value: stats.rejected, icon: XCircle, color: 'from-red-500 to-red-600', trend: t('dashboard.stats.refused').replace('{count}', stats.rejected) },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                {stat.trend}
              </span>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-6 sm:p-8 text-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold mb-2">{t('dashboard.quickActions.title')}</h2>
            <p className="text-indigo-100 text-sm">{t('dashboard.quickActions.subtitle')}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <button
            onClick={() => navigate('/citizen-dashboard/certificats')}
            className="flex items-center gap-3 p-4 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all text-left"
          >
            <FileText className="w-6 h-6" />
            <div>
              <p className="font-medium">{t('dashboard.quickActions.requestCert')}</p>
              <p className="text-xs text-indigo-200">{t('dashboard.quickActions.requestCertDesc')}</p>
            </div>
          </button>
          <button
            onClick={() => navigate('/citizen-dashboard/signalement')}
            className="flex items-center gap-3 p-4 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all text-left"
          >
            <AlertCircle className="w-6 h-6" />
            <div>
              <p className="font-medium">{t('dashboard.quickActions.reportProblem')}</p>
              <p className="text-xs text-indigo-200">{t('dashboard.quickActions.reportProblemDesc')}</p>
            </div>
          </button>
          <button
            onClick={() => navigate('/citizen-dashboard/profil')}
            className="flex items-center gap-3 p-4 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all text-left"
          >
            <User className="w-6 h-6" />
            <div>
              <p className="font-medium">{t('dashboard.quickActions.myProfile')}</p>
              <p className="text-xs text-indigo-200">{t('dashboard.quickActions.myProfileDesc')}</p>
            </div>
          </button>
        </div>
      </div>

      {/* Recent Certificates */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('dashboard.recentCerts.title')}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {recentCertificates.length > 0 ? t('dashboard.recentCerts.lastRequests').replace('{count}', recentCertificates.length) : t('dashboard.recentCerts.noCerts')}
            </p>
          </div>
          <button
            onClick={() => navigate('/citizen-dashboard/certificats')}
            className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-medium flex items-center gap-1"
          >
            {t('dashboard.recentCerts.seeAll')}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {recentCertificates.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>{t('dashboard.recentCerts.noCertsYet')}</p>
              <button
                onClick={() => navigate('/citizen-dashboard/certificats')}
                className="mt-3 text-indigo-600 hover:text-indigo-700 font-medium"
              >
                {t('dashboard.recentCerts.makeRequest')} &rarr;
              </button>
            </div>
          ) : (
            recentCertificates.map((cert) => (
              <div key={cert.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${cert.type === t('common.birth')
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600'
                      }`}>
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{getPersonName(cert)}</h3>
                        {getStatusBadge(cert.status)}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <span className="font-medium text-gray-700 dark:text-gray-300">{getCertId(cert)}</span>
                        </span>
                        <span>&bull;</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(cert.created_at || cert.date)}
                        </span>
                        <span>&bull;</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {getHospitalName(cert)}
                        </span>
                      </div>
                      {cert.rejection_reason && (
                        <p className="text-sm text-red-500 mt-2 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          {t('dashboard.recentCerts.reason')} : {cert.rejection_reason}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {cert.status === 'approved' && (
                      <>
                        <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all" title={t('dashboard.recentCerts.download')}>
                          <Download className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all" title={t('dashboard.recentCerts.qrCode')}>
                          <QrCode className="w-5 h-5" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => navigate(`/citizen-dashboard/certificats`)}
                      className="px-4 py-2 text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-medium hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all"
                    >
                      {t('dashboard.recentCerts.details')}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('dashboard.notifications.title')}</h2>
          <div className="space-y-3">
            {notifications.map((notif) => (
              <div key={notif.id} className={`flex items-start gap-3 p-3 rounded-lg ${notif.is_read ? 'bg-gray-50 dark:bg-gray-800/50' : 'bg-indigo-50 dark:bg-indigo-900/20'}`}>
                <div className={`w-2 h-2 rounded-full mt-2 ${notif.is_read ? 'bg-gray-300' : 'bg-indigo-500'}`} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{notif.title}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{notif.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{formatDate(notif.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Activity Timeline */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">{t('dashboard.activity.title')}</h2>
        <div className="space-y-6">
          {recentCertificates.length === 0 && reports.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">{t('dashboard.activity.noActivity')}</p>
          ) : (
            getAllActivities().map((activity, i) => (
              <div key={i} className="flex gap-4 items-start">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${activity.color}`}>
                  <activity.icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.action}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{activity.detail}</p>
                  <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                </div>
                {activity.isReport && (
                  <button
                    onClick={() => openReportModal(activity.report)}
                    className="px-3 py-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 rounded-lg transition-all flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    {t('dashboard.activity.seeDetails')}
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Report Detail Modal */}
      {showReportModal && selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('dashboard.reportModal.title')}</h3>
                  <p className="text-xs text-gray-500">{selectedReport.report_id}</p>
                </div>
              </div>
              <button
                onClick={closeReportModal}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">{t('dashboard.reportModal.status')}</span>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getReportStatusLabel(selectedReport.status).color}`}>
                  {selectedReport.status === 'resolved' && <CheckCircle2 className="w-3.5 h-3.5" />}
                  {selectedReport.status === 'reviewed' && <Clock className="w-3.5 h-3.5" />}
                  {selectedReport.status === 'pending' && <Clock className="w-3.5 h-3.5" />}
                  {selectedReport.status === 'rejected' && <XCircle className="w-3.5 h-3.5" />}
                  {getReportStatusLabel(selectedReport.status).text}
                </span>
              </div>

              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400 block mb-1">{t('dashboard.reportModal.titleLabel')}</span>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedReport.title}</p>
              </div>

              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400 block mb-1">{t('dashboard.reportModal.description')}</span>
                <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 rounded-lg p-3">{selectedReport.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400 block mb-1">{t('dashboard.reportModal.type')}</span>
                  <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">{selectedReport.report_type}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400 block mb-1">{t('dashboard.reportModal.severity')}</span>
                  <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">{selectedReport.severity}</p>
                </div>
              </div>

              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400 block mb-1">{t('dashboard.reportModal.location')}</span>
                <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  {selectedReport.location}
                </div>
              </div>

              {selectedReport.certificate_id && (
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400 block mb-1">{t('dashboard.reportModal.certConcerned')}</span>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedReport.certificate_id}</p>
                </div>
              )}

              {!selectedReport.is_anonymous && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {t('dashboard.reportModal.contactInfo')}
                  </span>
                  {selectedReport.contact_name && <p className="text-sm text-gray-600 dark:text-gray-400">{selectedReport.contact_name}</p>}
                  {selectedReport.contact_phone && <p className="text-sm text-gray-600 dark:text-gray-400">{selectedReport.contact_phone}</p>}
                  {selectedReport.contact_email && <p className="text-sm text-gray-600 dark:text-gray-400">{selectedReport.contact_email}</p>}
                </div>
              )}

              {selectedReport.review_notes && (
                <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm font-semibold text-emerald-800 dark:text-emerald-400">{t('dashboard.reportModal.authorityResponse')}</span>
                  </div>
                  <p className="text-sm text-emerald-700 dark:text-emerald-300">{selectedReport.review_notes}</p>
                  {selectedReport.reviewed_at && (
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2">
                      {t('dashboard.reportModal.treatedOn')} {formatDate(selectedReport.reviewed_at)}
                    </p>
                  )}
                </div>
              )}

              {selectedReport.status === 'pending' && !selectedReport.review_notes && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span className="text-sm font-medium text-amber-800 dark:text-amber-400">{t('dashboard.reportModal.waiting')}</span>
                  </div>
                  <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                    {t('dashboard.reportModal.waitingDesc')}
                  </p>
                </div>
              )}

              <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                <p className="text-xs text-gray-400">
                  {t('dashboard.reportModal.sentOn')} {formatDate(selectedReport.created_at)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CitizenDashboard;