import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../context/LanguageContext';
import {
  Activity,
  Search,
  Filter,
  Calendar,
  User,
  Building2,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  FileText,
  Shield,
  AlertTriangle,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Download,
  Printer,
  RotateCcw,
  X,
  Lock,
  Unlock,
  Edit3,
  Trash2,
  Plus,
  Loader2
} from 'lucide-react';
import { userAPI } from '../../../services/api';

const AuthorityAudit = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [filterUser, setFilterUser] = useState('all');
  const [selectedLog, setSelectedLog] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [auditLogs, setAuditLogs] = useState([]);

  // Mount animation
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // Fetch audit logs from backend
  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (filterAction !== 'all') params.action = filterAction;
      if (filterUser !== 'all') params.user = filterUser;
      if (searchQuery) params.search = searchQuery;

      const response = await userAPI.getAuditLogs(params);
      const data = response.data.results || response.data || [];

      // Map backend data to frontend format
      const mappedLogs = data.map(log => ({
        id: log.id || `AUD-${log.timestamp?.replace(/[-:T]/g, '').slice(0, 12) || Date.now()}`,
        action: log.action || 'modification',
        target: log.target_id || log.target_type || t('authority.audit.system'),
        targetType: log.target_type || 'système',
        user: log.user_name || log.user?.full_name || t('authority.audit.system'),
        userRole: log.user?.role_display || t('authority.audit.agent'),
        hospital: log.user?.hospital_name || null,
        hospitalId: log.user?.hospital || null,
        date: log.timestamp || new Date().toISOString(),
        ip: log.ip_address || t('authority.audit.na'),
        status: log.action === 'login_failed' ? 'failed' : 'success',
        details: log.details ? (typeof log.details === 'object' ? JSON.stringify(log.details) : log.details) : t('authority.audit.noDetail'),
        oldValue: null,
        newValue: log.details || null
      }));

      setAuditLogs(mappedLogs);
    } catch (err) {
      console.error('Error fetching audit logs:', err);
      setError(t('authority.audit.errorLoad'));
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch when filters change
  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchAuditLogs();
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchQuery, filterAction, filterUser]);

  const actionConfig = {
    login: { label: t('authority.audit.actionLogin'), icon: Unlock, color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' },
    login_failed: { label: t('authority.audit.actionLoginFailed'), icon: Lock, color: 'text-red-600 bg-red-50 dark:bg-red-900/20' },
    logout: { label: t('authority.audit.actionLogout'), icon: Lock, color: 'text-gray-600 bg-gray-50 dark:bg-gray-800' },
    create: { label: t('authority.audit.actionCreate'), icon: Plus, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' },
    update: { label: t('authority.audit.actionUpdate'), icon: Edit3, color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20' },
    delete: { label: t('authority.audit.actionDelete'), icon: Trash2, color: 'text-red-600 bg-red-50 dark:bg-red-900/20' },
    approve: { label: t('authority.audit.actionApprove'), icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' },
    reject: { label: t('authority.audit.actionReject'), icon: XCircle, color: 'text-red-600 bg-red-50 dark:bg-red-900/20' },
    export: { label: t('authority.audit.actionExport'), icon: Download, color: 'text-violet-600 bg-violet-50 dark:bg-violet-900/20' },
    view: { label: t('authority.audit.actionView'), icon: Eye, color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' },
    password_change: { label: t('authority.audit.actionPasswordChange'), icon: Lock, color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20' }
  };

  const statusConfig = {
    success: { label: t('authority.audit.statusSuccess'), color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' },
    failed: { label: t('authority.audit.statusFailed'), color: 'text-red-600 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' },
    warning: { label: t('authority.audit.statusWarning'), color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800' }
  };

  const users = [...new Set(auditLogs.map(log => log.user))];

  const ActionIconComponent = ({ action }) => {
    const Icon = actionConfig[action]?.icon || Edit3;
    return <Icon className="w-4 h-4" />;
  };

  const filteredLogs = auditLogs.filter(log => {
    const matchAction = filterAction === 'all' || log.action === filterAction;
    const matchUser = filterUser === 'all' || log.user === filterUser;
    const matchSearch = searchQuery === '' || 
      log.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase());
    return matchAction && matchUser && matchSearch;
  });

  const stats = {
    total: auditLogs.length,
    success: auditLogs.filter(l => l.status === 'success').length,
    failed: auditLogs.filter(l => l.status === 'failed').length,
    today: auditLogs.filter(l => {
      const today = new Date().toISOString().split('T')[0];
      return l.date.startsWith(today);
    }).length
  };

  const openDetail = (log) => {
    setSelectedLog(log);
    setShowDetailModal(true);
  };

  const statCards = [
    { label: t('authority.audit.totalActions'), value: stats.total, icon: Activity, color: 'from-indigo-500 to-indigo-600', delay: 1 },
    { label: t('authority.audit.success'), value: stats.success, icon: CheckCircle2, color: 'from-emerald-500 to-emerald-600', delay: 2 },
    { label: t('authority.audit.failed'), value: stats.failed, icon: XCircle, color: 'from-red-500 to-red-600', delay: 3 },
    { label: t('authority.audit.today'), value: stats.today, icon: Calendar, color: 'from-blue-500 to-blue-600', delay: 4 }
  ];

  if (loading && auditLogs.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 flex items-center gap-3 animate-shake">
          <AlertTriangle className="w-6 h-6 text-red-600" />
          <div>
            <p className="text-red-700 dark:text-red-400 font-medium">{error}</p>
            <button onClick={fetchAuditLogs} className="text-sm text-red-600 hover:underline mt-1">{t('authority.audit.retry')}</button>
          </div>
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
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center hover:scale-105 transition-transform">
              <Activity className="w-5 h-5 text-white" />
            </div>
            {t('authority.audit.title')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{t('authority.audit.subtitle')}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => alert(t('authority.audit.exportAlert'))}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all hover:scale-[1.02] active:scale-95 text-sm"
          >
            <Download className="w-4 h-4" />
            {t('authority.audit.export')}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <div
            key={i}
            className={`bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 hover:shadow-lg transition-all hover:scale-[1.02] cursor-pointer animate-slide-in-from-bottom-${stat.delay}`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center hover:scale-105 transition-transform`}>
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

      {/* Filtres */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 animate-slide-in-from-bottom-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('authority.audit.searchPlaceholder')}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all hover:border-gray-300 dark:hover:border-gray-600"
            />
          </div>
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all hover:border-gray-300 dark:hover:border-gray-600"
          >
            <option value="all">{t('authority.audit.allActions')}</option>
            <option value="login">{t('authority.audit.actionLogin')}</option>
            <option value="login_failed">{t('authority.audit.actionLoginFailed')}</option>
            <option value="logout">{t('authority.audit.actionLogout')}</option>
            <option value="create">{t('authority.audit.actionCreate')}</option>
            <option value="update">{t('authority.audit.actionUpdate')}</option>
            <option value="delete">{t('authority.audit.actionDelete')}</option>
            <option value="approve">{t('authority.audit.actionApprove')}</option>
            <option value="reject">{t('authority.audit.actionReject')}</option>
            <option value="export">{t('authority.audit.actionExport')}</option>
            <option value="view">{t('authority.audit.actionView')}</option>
            <option value="password_change">{t('authority.audit.actionPasswordChange')}</option>
          </select>
          <select
            value={filterUser}
            onChange={(e) => setFilterUser(e.target.value)}
            className="px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all hover:border-gray-300 dark:hover:border-gray-600"
          >
            <option value="all">{t('authority.audit.allUsers')}</option>
            {users.map(u => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden animate-slide-in-from-bottom-3">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{t('authority.audit.colId')}</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{t('authority.audit.colAction')}</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{t('authority.audit.colTarget')}</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase hidden md:table-cell">{t('authority.audit.colUser')}</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase hidden sm:table-cell">{t('authority.audit.colDate')}</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{t('authority.audit.colStatus')}</th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{t('authority.audit.colActions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors hover:scale-[1.005] transform-gpu">
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm text-gray-900 dark:text-white">{log.id}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${actionConfig[log.action]?.color || actionConfig.update.color} hover:scale-105 transition-transform`}>
                        <ActionIconComponent action={log.action} />
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{actionConfig[log.action]?.label || log.action}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{log.target}</p>
                    <p className="text-xs text-gray-500 capitalize">{log.targetType}</p>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                      <User className="w-3.5 h-3.5" />
                      {log.user}
                    </div>
                    <p className="text-xs text-gray-500">{log.userRole}</p>
                  </td>
                  <td className="px-6 py-4 hidden sm:table-cell">
                    <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(log.date).toLocaleString('fr-FR')}
                    </div>
                    <p className="text-xs text-gray-500">IP: {log.ip}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${statusConfig[log.status]?.color || statusConfig.success.color}`}>
                      {statusConfig[log.status]?.label || t('authority.audit.statusSuccess')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openDetail(log)}
                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all hover:scale-110"
                        title={t('authority.audit.viewDetails')}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredLogs.length === 0 && (
          <div className="p-12 text-center">
            <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">{t('authority.audit.noResults')}</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between animate-slide-in-from-bottom-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {filteredLogs.length} {filteredLogs.length !== 1 ? t('authority.audit.entriesPlural') : t('authority.audit.entriesSingular')}
        </p>
        <div className="flex items-center gap-2">
          <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg hover:scale-110 transition-all">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button className="w-8 h-8 bg-indigo-600 text-white rounded-lg font-medium text-sm hover:scale-105 transition-transform">1</button>
          <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg hover:scale-110 transition-all">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Modal détails */}
      {showDetailModal && selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl max-w-lg w-full animate-slide-in-from-bottom">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${actionConfig[selectedLog.action]?.color || actionConfig.update.color}`}>
                  <ActionIconComponent action={selectedLog.action} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">{actionConfig[selectedLog.action]?.label || selectedLog.action}</h2>
                  <p className="text-sm text-gray-500">{selectedLog.id}</p>
                </div>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg hover:scale-110 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status */}
              <div className={`p-4 rounded-xl border ${statusConfig[selectedLog.status]?.color || statusConfig.success.color}`}>
                <span className="font-medium">{t('authority.audit.statusLabel')}: {statusConfig[selectedLog.status]?.label || t('authority.audit.statusSuccess')}</span>
              </div>

              {/* Détails */}
              <div className="space-y-3">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('authority.audit.description')}</p>
                  <p className="text-sm text-gray-900 dark:text-white">{selectedLog.details}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('authority.audit.user')}</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedLog.user}</p>
                    <p className="text-xs text-gray-500">{selectedLog.userRole}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('authority.audit.dateTime')}</p>
                    <p className="font-medium text-gray-900 dark:text-white">{new Date(selectedLog.date).toLocaleString('fr-FR')}</p>
                    <p className="text-xs text-gray-500">IP: {selectedLog.ip}</p>
                  </div>
                </div>

                {selectedLog.hospital && (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('authority.audit.hospital')}</p>
                    <p className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5" />
                      {selectedLog.hospital}
                    </p>
                  </div>
                )}

                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('authority.audit.target')}</p>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedLog.target}</p>
                  <p className="text-xs text-gray-500 capitalize">{t('authority.audit.type')}: {selectedLog.targetType}</p>
                </div>

                {/* Changements */}
                {(selectedLog.oldValue || selectedLog.newValue) && (
                  <div className="grid grid-cols-2 gap-3">
                    {selectedLog.oldValue && (
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                        <p className="text-xs text-red-600 dark:text-red-400 mb-1">{t('authority.audit.oldValue')}</p>
                        <pre className="text-xs text-red-800 dark:text-red-300 overflow-x-auto">
                          {typeof selectedLog.oldValue === 'object' ? JSON.stringify(selectedLog.oldValue, null, 2) : selectedLog.oldValue}
                        </pre>
                      </div>
                    )}
                    {selectedLog.newValue && (
                      <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3">
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 mb-1">{t('authority.audit.newValue')}</p>
                        <pre className="text-xs text-emerald-800 dark:text-emerald-300 overflow-x-auto">
                          {typeof selectedLog.newValue === 'object' ? JSON.stringify(selectedLog.newValue, null, 2) : selectedLog.newValue}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all hover:scale-[1.02] active:scale-95"
                >
                  {t('authority.audit.close')}
                </button>
                <button
                  onClick={() => alert(t('authority.audit.printAlert'))}
                  className="flex-1 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-medium hover:shadow-lg flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95"
                >
                  <Printer className="w-4 h-4" />
                  {t('authority.audit.print')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthorityAudit;
