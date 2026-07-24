import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';
import { useAuth } from '../../../context/AuthContext';
import {
  FileText, Clock, CheckCircle2, XCircle, Search, Filter,
  ChevronDown, ChevronUp, Eye, Check, X, AlertTriangle,
  Baby, Skull, Building2, ArrowLeft, ArrowRight, RefreshCw,
  Shield
} from 'lucide-react';
import { birthAPI, deathAPI } from '../../../services/api';

const AuthorityValidation = () => {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectingItem, setRejectingItem] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [dateFilter, setDateFilter] = useState('');
  const [hospitalFilter, setHospitalFilter] = useState('');
  const [mounted, setMounted] = useState(false);

  // Mount animation
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // Normalize status from backend to frontend format
  const normalizeStatus = (status) => {
    const statusMap = {
      'draft': 'pending',
      'En attente': 'pending',
      'pending': 'pending',
      'Approuvé': 'approved',
      'approved': 'approved',
      'Validé': 'approved',
      'Rejeté': 'rejected',
      'rejected': 'rejected',
    };
    return statusMap[status] || 'pending';
  };

  // Fetch data from backend
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [birthsRes, deathsRes] = await Promise.all([
        birthAPI.getBirths(),
        deathAPI.getDeaths()
      ]);

      const births = (birthsRes.data.results || birthsRes.data || []).map(b => ({
        ...b,
        type: 'birth',
        typeLabel: t('authority.validation.birth'),
        icon: Baby,
        color: 'text-emerald-500',
        bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
        personName: `${b.child_first_name || ''} ${b.child_last_name || ''}`.trim() || t('authority.validation.na'),
        date: b.date_of_birth || b.birth_date,
        hospitalName: b.hospital_name || (b.hospital?.name) || t('authority.validation.na'),
        status: normalizeStatus(b.status),
        createdAt: b.created_at,
        id: b.id,
        certificateId: b.certificate_id || b.birth_certificate_id || `NAISS-${b.id}`,
      }));

      const deaths = (deathsRes.data.results || deathsRes.data || []).map(d => ({
        ...d,
        type: 'death',
        typeLabel: t('authority.validation.death'),
        icon: Skull,
        color: 'text-gray-500',
        bgColor: 'bg-gray-50 dark:bg-gray-900/20',
        personName: `${d.first_name || ''} ${d.last_name || ''}`.trim() || t('authority.validation.na'),
        date: d.date_of_death || d.death_date,
        hospitalName: d.hospital_name || (d.hospital?.name) || t('authority.validation.na'),
        status: normalizeStatus(d.status),
        createdAt: d.created_at,
        id: d.id,
        certificateId: d.certificate_id || d.death_certificate_id || `DECES-${d.id}`,
      }));

      const allItems = [...births, ...deaths].sort((a, b) =>
        new Date(b.createdAt) - new Date(a.createdAt)
      );

      setItems(allItems);

      // Calculate stats
      const pending = allItems.filter(i => i.status === 'pending').length;
      const approved = allItems.filter(i => i.status === 'approved').length;
      const rejected = allItems.filter(i => i.status === 'rejected').length;
      setStats({
        total: allItems.length,
        pending,
        approved,
        rejected
      });
    } catch (err) {
      console.error('Error fetching validation data:', err);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter items
  const filteredItems = items.filter(item => {
    const matchesTab = activeTab === 'all' || item.type === activeTab;
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    const matchesSearch = !searchQuery ||
      item.personName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.certificateId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.hospitalName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDate = !dateFilter || item.date === dateFilter;
    const matchesHospital = !hospitalFilter || item.hospitalName.toLowerCase().includes(hospitalFilter.toLowerCase());
    return matchesTab && matchesStatus && matchesSearch && matchesDate && matchesHospital;
  });

  // Sort items
  const sortedItems = [...filteredItems].sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];
    if (sortField === 'date' || sortField === 'createdAt') {
      valA = new Date(valA || 0);
      valB = new Date(valB || 0);
    } else if (typeof valA === 'string') {
      valA = valA.toLowerCase();
      valB = valB.toLowerCase();
    }
    if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
    if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedItems.length / itemsPerPage);
  const paginatedItems = sortedItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Approve certificate
  const handleApprove = async (item) => {
    setActionLoading(true);
    try {
      if (item.type === 'birth') {
        await birthAPI.validateBirth(item.id, 'approve');
      } else {
        await deathAPI.validateDeath(item.id, 'approve');
      }
      await fetchData();
    } catch (err) {
      console.error('Error approving:', err);
      alert(t('authority.validation.errorApprove'));
    } finally {
      setActionLoading(false);
    }
  };

  // Open reject modal
  const handleRejectClick = (item) => {
    setRejectingItem(item);
    setRejectReason('');
    setShowRejectModal(true);
  };

  // Confirm reject
  const handleRejectConfirm = async () => {
    if (!rejectReason.trim()) return;
    setActionLoading(true);
    try {
      if (rejectingItem.type === 'birth') {
        await birthAPI.validateBirth(rejectingItem.id, 'reject', rejectReason);
      } else {
        await deathAPI.validateDeath(rejectingItem.id, 'reject', rejectReason);
      }
      setShowRejectModal(false);
      setRejectingItem(null);
      await fetchData();
    } catch (err) {
      console.error('Error rejecting:', err);
      alert(t('authority.validation.errorReject'));
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const configs = {
      pending: { label: t('authority.validation.statusPending'), className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: Clock },
      approved: { label: t('authority.validation.statusApproved'), className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', icon: CheckCircle2 },
      rejected: { label: t('authority.validation.statusRejected'), className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: XCircle },
    };
    const config = configs[status] || configs.pending;
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${config.className}`}>
        <Icon className="w-3.5 h-3.5" />
        {config.label}
      </span>
    );
  };

  // Stat cards data
  const statCards = [
    { label: t('authority.validation.total'), value: stats.total, icon: FileText, color: 'from-indigo-500 to-indigo-600', filter: 'all' },
    { label: t('authority.validation.pending'), value: stats.pending, icon: Clock, color: 'from-amber-500 to-amber-600', filter: 'pending' },
    { label: t('authority.validation.approved'), value: stats.approved, icon: CheckCircle2, color: 'from-emerald-500 to-emerald-600', filter: 'approved' },
    { label: t('authority.validation.rejected'), value: stats.rejected, icon: XCircle, color: 'from-red-500 to-red-600', filter: 'rejected' }
  ];

  const tabs = [
    { id: 'all', label: t('authority.validation.tabAll'), icon: FileText },
    { id: 'birth', label: t('authority.validation.tabBirths'), icon: Baby },
    { id: 'death', label: t('authority.validation.tabDeaths'), icon: Skull },
  ];

  const columns = [
    { key: 'type', label: t('authority.validation.colType') },
    { key: 'certificateId', label: t('authority.validation.colId') },
    { key: 'personName', label: t('authority.validation.colPerson') },
    { key: 'date', label: t('authority.validation.colDate') },
    { key: 'hospitalName', label: t('authority.validation.colHospital') },
    { key: 'status', label: t('authority.validation.colStatus') },
    { key: 'actions', label: t('authority.validation.colActions') },
  ];

  return (
    <div className={`space-y-6 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-slide-in-from-top">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            {t('authority.validation.title')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{t('authority.validation.subtitle')}</p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-medium hover:shadow-lg transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 text-sm"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {t('authority.validation.refresh')}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-slide-in-from-bottom-1">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <button
              key={i}
              onClick={() => setFilterStatus(stat.filter)}
              className={`bg-white dark:bg-gray-900 rounded-xl border-2 p-5 text-left transition-all hover:scale-[1.02] ${
                filterStatus === stat.filter
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

      {/* Tabs */}
      <div className="flex gap-2 animate-slide-in-from-bottom-2">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setCurrentPage(1); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all hover:scale-[1.02] active:scale-95 ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Search & Filters */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 animate-slide-in-from-bottom-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={t('authority.validation.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all hover:scale-[1.02]"
          >
            <Filter className="w-4 h-4" />
            {t('authority.validation.filters')}
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{t('authority.validation.date')}</label>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{t('authority.validation.hospital')}</label>
              <input
                type="text"
                placeholder={t('authority.validation.hospitalPlaceholder')}
                value={hospitalFilter}
                onChange={(e) => setHospitalFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden animate-slide-in-from-bottom-4">
        {loading ? (
          <div className="p-12 text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-indigo-500 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">{t('authority.validation.loading')}</p>
          </div>
        ) : paginatedItems.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">{t('authority.validation.noResults')}</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    {columns.map(col => (
                      <th
                        key={col.key}
                        onClick={() => col.key !== 'actions' && handleSort(col.key)}
                        className={`px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ${
                          col.key !== 'actions' ? 'cursor-pointer hover:text-gray-700 dark:hover:text-gray-200' : ''
                        }`}
                      >
                        <div className="flex items-center gap-1">
                          {col.label}
                          {sortField === col.key && (
                            sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {paginatedItems.map((item) => {
                    const ItemIcon = item.icon;
                    return (
                      <tr
                        key={`${item.type}-${item.id}`}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors hover:scale-[1.005]"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.bgColor}`}>
                              <ItemIcon className={`w-4 h-4 ${item.color}`} />
                            </div>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{item.typeLabel}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm font-mono text-gray-600 dark:text-gray-400">{item.certificateId}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{item.personName}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-600 dark:text-gray-400">{item.date || t('authority.validation.na')}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">{item.hospitalName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">{getStatusBadge(item.status)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => { setSelectedItem(item); setShowDetailModal(true); }}
                              className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all hover:scale-110"
                              title={t('authority.validation.viewDetails')}
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {item.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleApprove(item)}
                                  disabled={actionLoading}
                                  className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-all hover:scale-110"
                                  title={t('authority.validation.approveBtn')}
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleRejectClick(item)}
                                  disabled={actionLoading}
                                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all hover:scale-110"
                                  title={t('authority.validation.rejectBtn')}
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {sortedItems.length} {t('authority.validation.results')}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-110"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {t('authority.validation.page')} {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-110"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slide-in-from-bottom-1">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-900 z-10">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedItem.bgColor}`}>
                  <selectedItem.icon className={`w-5 h-5 ${selectedItem.color}`} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {t('authority.validation.detailTitle')}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{selectedItem.certificateId}</p>
                </div>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all hover:scale-110"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:shadow-sm transition-all">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('authority.validation.colType')}</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedItem.typeLabel}</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:shadow-sm transition-all">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('authority.validation.colStatus')}</p>
                  <div>{getStatusBadge(selectedItem.status)}</div>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:shadow-sm transition-all">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('authority.validation.colPerson')}</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedItem.personName}</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:shadow-sm transition-all">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('authority.validation.colDate')}</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedItem.date || t('authority.validation.na')}</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg col-span-2 hover:shadow-sm transition-all">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('authority.validation.colHospital')}</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedItem.hospitalName}</p>
                </div>
              </div>
              {selectedItem.status === 'pending' && (
                <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => { handleApprove(selectedItem); setShowDetailModal(false); }}
                    disabled={actionLoading}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl font-medium hover:shadow-lg transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" />
                    {t('authority.validation.approveBtn')}
                  </button>
                  <button
                    onClick={() => { setShowDetailModal(false); handleRejectClick(selectedItem); }}
                    disabled={actionLoading}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-medium hover:shadow-lg transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                    {t('authority.validation.rejectBtn')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && rejectingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl max-w-md w-full animate-slide-in-from-bottom-1">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('authority.validation.rejectTitle')}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{rejectingItem.certificateId}</p>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('authority.validation.rejectReason')} <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder={t('authority.validation.rejectPlaceholder')}
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 resize-none transition-all"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => { setShowRejectModal(false); setRejectingItem(null); }}
                  className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all hover:scale-[1.02]"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={handleRejectConfirm}
                  disabled={!rejectReason.trim() || actionLoading}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-medium hover:shadow-lg transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                >
                  {actionLoading ? t('authority.validation.rejecting') : t('authority.validation.rejectBtn')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthorityValidation;