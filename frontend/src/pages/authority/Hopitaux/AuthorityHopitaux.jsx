import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../context/LanguageContext';
import {
  Building2,
  Search,
  MapPin,
  Phone,
  Mail,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  FileText,
  Plus,
  Download,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Loader2,
  AlertTriangle,
  Users,
  Stethoscope,
  Hash,
  Shield
} from 'lucide-react';
import { hospitalAPI } from '../../../services/api';

const AuthorityHopitaux = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterProvince, setFilterProvince] = useState('all');
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hospitals, setHospitals] = useState([]);
  const [mounted, setMounted] = useState(false);

  // Mount animation
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // Fetch hospitals from backend
  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (filterStatus !== 'all') params.status = filterStatus;
      if (filterProvince !== 'all') params.province = filterProvince;
      if (searchQuery) params.search = searchQuery;

      const response = await hospitalAPI.getHospitals(params);
      const data = response.data.results || response.data || [];
      setHospitals(data);
    } catch (err) {
      console.error('Error fetching hospitals:', err);
      setError(t('authority.hopitaux.errorLoad'));
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch when filters change
  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchHospitals();
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchQuery, filterStatus, filterProvince]);

  const provinces = [
    'Kinshasa', 'Bas-Uele', 'Equateur', 'Haut-Katanga', 'Haut-Lomami',
    'Haut-Uele', 'Ituri', 'Kasai', 'Kasai-Central', 'Kasai-Oriental',
    'Kongo-Central', 'Kwango', 'Kwilu', 'Lomami', 'Lualaba', 'Mai-Ndombe',
    'Maniema', 'Mongala', 'Nord-Kivu', 'Nord-Ubangi', 'Sankuru',
    'Sud-Kivu', 'Sud-Ubangi', 'Tanganyika', 'Tshopo', 'Tshuapa'
  ];

  const statusConfig = {
    active: { label: t('authority.hopitaux.active'), color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800', icon: CheckCircle2 },
    inactive: { label: t('authority.hopitaux.inactive'), color: 'text-red-600 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800', icon: XCircle },
    pending: { label: t('authority.hopitaux.pending'), color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800', icon: Clock }
  };

  const StatusIconComponent = ({ status }) => {
    const Icon = statusConfig[status]?.icon || Clock;
    return <Icon className="w-3 h-3" />;
  };

  const typeLabels = {
    public: t('authority.hopitaux.public'),
    prive: t('authority.hopitaux.prive'),
    confessionnel: t('authority.hopitaux.confessionnel'),
    ong: t('authority.hopitaux.ong')
  };

  const stats = {
    total: hospitals.length,
    active: hospitals.filter(h => h.status === 'active').length,
    inactive: hospitals.filter(h => h.status === 'inactive').length,
    pending: hospitals.filter(h => h.status === 'pending').length,
    totalDeclarations: hospitals.reduce((sum, h) => (sum + (h.total_births || 0) + (h.total_deaths || 0)), 0)
  };

  const openDetail = (hospital) => {
    setSelectedHospital(hospital);
    setShowDetailModal(true);
  };

  // Parse services from backend (JSONField)
  const getServices = (hospital) => {
    if (Array.isArray(hospital.services)) return hospital.services;
    if (typeof hospital.services === 'string') {
      try { return JSON.parse(hospital.services); } catch { return []; }
    }
    return [];
  };

  if (loading && hospitals.length === 0) {
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
            <button onClick={fetchHospitals} className="text-sm text-red-600 hover:underline mt-1">{t('authority.hopitaux.retry')}</button>
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
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            {t('authority.hopitaux.title')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{t('authority.hopitaux.subtitle')}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => alert('Export CSV...')}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all hover:scale-[1.02] text-sm"
          >
            <Download className="w-4 h-4" />
            {t('authority.hopitaux.export')}
          </button>
          <button
            onClick={() => alert('Ajouter un hopital...')}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-medium hover:shadow-lg transition-all hover:scale-[1.02] active:scale-95 text-sm"
          >
            <Plus className="w-4 h-4" />
            {t('authority.hopitaux.add')}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 animate-slide-in-from-bottom-1">
        {[
          { label: t('authority.hopitaux.total'), value: stats.total, icon: Building2, color: 'from-indigo-500 to-indigo-600' },
          { label: t('authority.hopitaux.active'), value: stats.active, icon: CheckCircle2, color: 'from-emerald-500 to-emerald-600' },
          { label: t('authority.hopitaux.inactive'), value: stats.inactive, icon: XCircle, color: 'from-red-500 to-red-600' },
          { label: t('authority.hopitaux.pending'), value: stats.pending, icon: Clock, color: 'from-amber-500 to-amber-600' },
          { label: t('authority.hopitaux.declarations'), value: stats.totalDeclarations, icon: FileText, color: 'from-blue-500 to-blue-600' }
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 hover:shadow-lg transition-all hover:scale-[1.02]">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center`}>
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
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 animate-slide-in-from-bottom-2">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('authority.hopitaux.searchPlaceholder')}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">{t('authority.hopitaux.allStatuses')}</option>
            <option value="active">{t('authority.hopitaux.active')}</option>
            <option value="inactive">{t('authority.hopitaux.inactive')}</option>
            <option value="pending">{t('authority.hopitaux.pending')}</option>
          </select>
          <select
            value={filterProvince}
            onChange={(e) => setFilterProvince(e.target.value)}
            className="px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">{t('authority.hopitaux.allProvinces')}</option>
            {provinces.map(p => (
              <option key={p} value={p}>{p}</option>
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
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{t('authority.hopitaux.id')}</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{t('authority.hopitaux.hospital')}</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase hidden md:table-cell">{t('authority.hopitaux.type')}</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase hidden lg:table-cell">{t('authority.hopitaux.province')}</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase hidden sm:table-cell">{t('authority.hopitaux.declarationsCol')}</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{t('authority.hopitaux.rate')}</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{t('authority.hopitaux.status')}</th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{t('authority.hopitaux.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {hospitals.map((h) => (
                <tr key={h.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors hover:scale-[1.005]">
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm text-gray-900 dark:text-white">{h.hospital_id || h.id?.slice(0, 8)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-900/30 dark:to-violet-900/30 rounded-lg flex items-center justify-center overflow-hidden">
                        {h.logo_url || h.logo ? (
                          <img src={h.logo_url || h.logo} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">{h.name}</p>
                        <p className="text-xs text-gray-500">{h.abbreviation || ''} • {h.director_name || 'N/A'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{typeLabels[h.hospital_type] || h.hospital_type}</span>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                      <MapPin className="w-3.5 h-3.5" />
                      {h.province || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden sm:table-cell">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{(h.total_births || 0) + (h.total_deaths || 0)}</p>
                    <p className="text-xs text-gray-500">{h.total_births || 0} {t('authority.hopitaux.births')} / {h.total_deaths || 0} {t('authority.hopitaux.deaths')}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${parseFloat(h.validation_rate || 0) >= 95 ? 'bg-emerald-500' : parseFloat(h.validation_rate || 0) >= 90 ? 'bg-amber-500' : 'bg-red-500'}`}
                          style={{ width: `${Math.min(parseFloat(h.validation_rate || 0), 100)}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{parseFloat(h.validation_rate || 0).toFixed(1)}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${statusConfig[h.status]?.color || statusConfig.pending.color}`}>
                      <StatusIconComponent status={h.status} />
                      {statusConfig[h.status]?.label || t('authority.hopitaux.pending')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openDetail(h)}
                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all hover:scale-110"
                        title={t('authority.hopitaux.details')}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => navigate(`/authority-dashboard/hopitaux/${h.id}`)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all hover:scale-110"
                        title={t('authority.hopitaux.open')}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {hospitals.length === 0 && (
          <div className="p-12 text-center">
            <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">{t('authority.hopitaux.noHospitals')}</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between animate-slide-in-from-bottom-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {hospitals.length} {t('authority.hopitaux.hospitalsCount')}
        </p>
        <div className="flex items-center gap-2">
          <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all hover:scale-110">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button className="w-8 h-8 bg-indigo-600 text-white rounded-lg font-medium text-sm">1</button>
          <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all hover:scale-110">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Modal details */}
      {showDetailModal && selectedHospital && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slide-in-from-bottom-1">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-900 z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-900/30 dark:to-violet-900/30 rounded-xl flex items-center justify-center overflow-hidden">
                  {selectedHospital.logo_url || selectedHospital.logo ? (
                    <img src={selectedHospital.logo_url || selectedHospital.logo} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Building2 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">{selectedHospital.name}</h2>
                  <p className="text-sm text-gray-500">{selectedHospital.hospital_id || selectedHospital.id?.slice(0, 8)} • {typeLabels[selectedHospital.hospital_type] || selectedHospital.hospital_type}</p>
                </div>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all hover:scale-110"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status banner */}
              <div className={`p-4 rounded-xl border ${statusConfig[selectedHospital.status]?.color || statusConfig.pending.color}`}>
                <div className="flex items-center gap-2">
                  <StatusIconComponent status={selectedHospital.status} />
                  <span className="font-medium">{t('authority.hopitaux.statusBanner')}: {statusConfig[selectedHospital.status]?.label || t('authority.hopitaux.pending')}</span>
                </div>
              </div>

              {/* Stats rapides */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center hover:shadow-md transition-all">
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{selectedHospital.total_births || 0}</p>
                  <p className="text-xs text-gray-500">{t('authority.hopitaux.births')}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center hover:shadow-md transition-all">
                  <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">{selectedHospital.total_deaths || 0}</p>
                  <p className="text-xs text-gray-500">{t('authority.hopitaux.deaths')}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center hover:shadow-md transition-all">
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{selectedHospital.total_certificates || 0}</p>
                  <p className="text-xs text-gray-500">{t('authority.hopitaux.certificates')}</p>
                </div>
              </div>

              {/* Informations */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 hover:shadow-sm transition-all">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('authority.hopitaux.director')}</p>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedHospital.director_name || 'N/A'}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 hover:shadow-sm transition-all">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('authority.hopitaux.level')}</p>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedHospital.level || 'N/A'}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 hover:shadow-sm transition-all">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('authority.hopitaux.capacity')}</p>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedHospital.capacity || 0} {t('authority.hopitaux.beds')}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 hover:shadow-sm transition-all">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('authority.hopitaux.staff')}</p>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedHospital.staff_count || 0} {t('authority.hopitaux.employees')}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 col-span-2 hover:shadow-sm transition-all">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('authority.hopitaux.address')}</p>
                  <p className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {selectedHospital.address || 'N/A'}, {selectedHospital.commune || ''}, {selectedHospital.city || ''}, {selectedHospital.province || ''}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 hover:shadow-sm transition-all">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('authority.hopitaux.phone')}</p>
                  <p className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" />
                    {selectedHospital.phone || 'N/A'}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 hover:shadow-sm transition-all">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('authority.hopitaux.email')}</p>
                  <p className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" />
                    {selectedHospital.email || 'N/A'}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 hover:shadow-sm transition-all">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('authority.hopitaux.license')}</p>
                  <p className="font-mono text-sm font-medium text-gray-900 dark:text-white">{selectedHospital.license_number || 'N/A'}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 hover:shadow-sm transition-all">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('authority.hopitaux.expiry')}</p>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedHospital.license_expiry || 'N/A'}</p>
                </div>
              </div>

              {/* Services */}
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('authority.hopitaux.services')}</p>
                <div className="flex flex-wrap gap-2">
                  {getServices(selectedHospital).length > 0 ? (
                    getServices(selectedHospital).map((service, i) => (
                      <span key={i} className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-medium hover:scale-105 transition-all">
                        {service}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-400">{t('authority.hopitaux.noServices')}</span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all hover:scale-[1.02]"
                >
                  {t('authority.hopitaux.close')}
                </button>
                <button
                  onClick={() => alert('Modifier cet hopital...')}
                  className="flex-1 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-medium hover:shadow-lg transition-all hover:scale-[1.02]"
                >
                  {t('authority.hopitaux.modify')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthorityHopitaux;