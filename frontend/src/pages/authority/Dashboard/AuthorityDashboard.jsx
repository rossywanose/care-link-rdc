import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../context/LanguageContext';
import {
  LayoutDashboard,
  Building2,
  CheckCircle2,
  XCircle,
  FileText,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Users,
  Eye,
  ArrowRight,
  Calendar,
  MapPin,
  Shield,
  Clock,
  ChevronRight,
  BarChart3,
  Activity,
  Filter,
  Search,
  Bell,
  Loader2,
  Baby,
  Skull
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { hospitalAPI, birthAPI, deathAPI } from '../../../services/api';

const AuthorityDashboard = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [period, setPeriod] = useState('month');
  const [showAlerts, setShowAlerts] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  // Data states
  const [hospitals, setHospitals] = useState([]);
  const [birthStats, setBirthStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0, monthly: [] });
  const [deathStats, setDeathStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0, monthly: [] });
  const [recentValidations, setRecentValidations] = useState([]);

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

  // Fetch all data
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch in parallel
      const [hospitalsRes, birthStatsRes, deathStatsRes, birthsRes, deathsRes] = await Promise.all([
        hospitalAPI.getHospitals(),
        birthAPI.getBirthStats(),
        deathAPI.getDeathStats(),
        birthAPI.getBirths({ limit: 5 }),
        deathAPI.getDeaths({ limit: 5 })
      ]);

      setHospitals(hospitalsRes.data.results || hospitalsRes.data || []);
      setBirthStats(birthStatsRes.data);
      setDeathStats(deathStatsRes.data);

      // Combine and sort recent validations
      const allCerts = [
        ...(birthsRes.data.results || birthsRes.data || []).map(b => ({
          id: b.certificate_id || b.id,
          type: 'naissance',
          personName: `${b.child_first_name || b.first_name || ''} ${b.child_last_name || b.last_name || ''}`.trim() || b.child_name || t('authority.dashboard.notSpecified'),
          hospital: b.hospital_name || b.hospital?.name || t('authority.dashboard.notSpecified'),
          date: b.created_at?.split('T')[0] || b.date_of_birth || '',
          status: normalizeStatus(b.status),
          agent: b.validated_by_name || b.declared_by_name || t('authority.dashboard.notSpecified'),
          motif: b.rejection_reason || null
        })),
        ...(deathsRes.data.results || deathsRes.data || []).map(d => ({
          id: d.certificate_id || d.id,
          type: 'deces',
          personName: `${d.first_name || ''} ${d.last_name || ''}`.trim() || d.deceased_name || t('authority.dashboard.notSpecified'),
          hospital: d.hospital_name || d.hospital?.name || t('authority.dashboard.notSpecified'),
          date: d.created_at?.split('T')[0] || d.date_of_death || '',
          status: normalizeStatus(d.status),
          agent: d.validated_by_name || d.declared_by_name || t('authority.dashboard.notSpecified'),
          motif: d.rejection_reason || null
        }))
      ];

      // Sort by date descending and take top 5
      allCerts.sort((a, b) => new Date(b.date) - new Date(a.date));
      setRecentValidations(allCerts.slice(0, 5));

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(t('authority.dashboard.errorLoad'));
    } finally {
      setLoading(false);
    }
  };

  // Computed KPIs
  const totalHospitals = hospitals.length;
  const activeHospitals = hospitals.filter(h => h.status === 'active').length;
  const pendingHospitals = hospitals.filter(h => h.status === 'pending').length;
  const totalPending = (birthStats.pending || 0) + (deathStats.pending || 0);
  const totalApproved = (birthStats.approved || 0) + (deathStats.approved || 0);
  const totalRejected = (birthStats.rejected || 0) + (deathStats.rejected || 0);
  const totalCerts = (birthStats.total || 0) + (deathStats.total || 0);

  // Monthly chart data
  const monthlyData = React.useMemo(() => {
    const months = t('authority.dashboard.months').split(',');
    const data = [];

    const birthMonthly = {};
    const deathMonthly = {};

    (birthStats.monthly || []).forEach(m => {
      const monthIdx = new Date(m.month).getMonth();
      birthMonthly[monthIdx] = (birthMonthly[monthIdx] || 0) + m.count;
    });

    (deathStats.monthly || []).forEach(m => {
      const monthIdx = new Date(m.month).getMonth();
      deathMonthly[monthIdx] = (deathMonthly[monthIdx] || 0) + m.count;
    });

    for (let i = 0; i < 6; i++) {
      data.push({
        month: months[i] || months[i % 12],
        naissances: birthMonthly[i] || 0,
        deces: deathMonthly[i] || 0,
        total: (birthMonthly[i] || 0) + (deathMonthly[i] || 0),
      });
    }
    return data;
  }, [birthStats, deathStats, t]);

  // Type data for pie chart
  const typeData = [
    { name: t('authority.dashboard.births'), value: birthStats.total || 0, color: '#3b82f6' },
    { name: t('authority.dashboard.deaths'), value: deathStats.total || 0, color: '#6b7280' }
  ];

  // Hospital status data
  const hospitalStatusData = [
    { name: t('authority.dashboard.active'), value: activeHospitals, color: '#10b981' },
    { name: t('authority.dashboard.inactive'), value: hospitals.filter(h => h.status === 'inactive').length, color: '#ef4444' },
    { name: t('authority.dashboard.pending'), value: pendingHospitals, color: '#f59e0b' }
  ];

  // Top hospitals by declarations
  const topHospitals = React.useMemo(() => {
    return [...hospitals]
      .sort((a, b) => (b.total_certificates || 0) - (a.total_certificates || 0))
      .slice(0, 5)
      .map(h => ({
        name: h.name,
        declarations: (h.total_births || 0) + (h.total_deaths || 0),
        taux: parseFloat(h.validation_rate || 0)
      }));
  }, [hospitals]);

  // Alerts based on real data
  const alerts = React.useMemo(() => {
    const list = [];
    if (pendingHospitals > 0) {
      list.push({
        id: 1,
        type: 'warning',
        message: `${pendingHospitals} ${t('authority.dashboard.alertPendingHospitals')}`,
        time: t('authority.dashboard.currently')
      });
    }
    if (totalPending > 50) {
      list.push({
        id: 2,
        type: 'danger',
        message: `${totalPending} ${t('authority.dashboard.alertPendingCerts')}`,
        time: t('authority.dashboard.currently')
      });
    }
    return list;
  }, [pendingHospitals, totalPending, t]);

  const kpis = [
    {
      label: t('authority.dashboard.kpiActiveHospitals'),
      value: activeHospitals.toString(),
      change: `+${pendingHospitals}`,
      trend: 'up',
      icon: Building2,
      color: 'from-blue-500 to-blue-600'
    },
    {
      label: t('authority.dashboard.kpiPending'),
      value: totalPending.toLocaleString(),
      change: totalPending > 100 ? '+12' : '+3',
      trend: 'up',
      icon: Clock,
      color: 'from-amber-500 to-amber-600'
    },
    {
      label: t('authority.dashboard.kpiValidated'),
      value: totalApproved.toLocaleString(),
      change: '+8.5%',
      trend: 'up',
      icon: CheckCircle2,
      color: 'from-emerald-500 to-emerald-600'
    },
    {
      label: t('authority.dashboard.kpiRejected'),
      value: totalRejected.toLocaleString(),
      change: '-5.2%',
      trend: 'down',
      icon: XCircle,
      color: 'from-red-500 to-red-600'
    }
  ];

  const statusConfig = {
    draft: { label: t('authority.dashboard.statusDraft'), color: 'text-gray-600 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700' },
    approved: { label: t('authority.dashboard.statusApproved'), color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' },
    pending: { label: t('authority.dashboard.statusPending'), color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800' },
    rejected: { label: t('authority.dashboard.statusRejected'), color: 'text-red-600 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' }
  };

  const getTypeIcon = (type) => {
    return type === 'naissance'
      ? <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center"><Baby className="w-4 h-4 text-blue-600" /></div>
      : <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center"><Skull className="w-4 h-4 text-gray-600" /></div>;
  };

  const getTypeLabel = (type) => type === 'naissance' ? t('authority.dashboard.birth') : t('authority.dashboard.death');

  const periodOptions = [
    { value: 'week', label: t('authority.dashboard.periodWeek') },
    { value: 'month', label: t('authority.dashboard.periodMonth') },
    { value: 'quarter', label: t('authority.dashboard.periodQuarter') },
    { value: 'year', label: t('authority.dashboard.periodYear') },
  ];

  const quickActions = [
    {
      label: t('authority.dashboard.quickHospitals'),
      path: '/authority-dashboard/hopitaux',
      icon: Building2,
      desc: `${totalHospitals} ${t('authority.dashboard.etablissements')}`,
      color: 'from-blue-500 to-blue-600'
    },
    {
      label: t('authority.dashboard.quickValidation'),
      path: '/authority-dashboard/validation',
      icon: CheckCircle2,
      desc: `${totalPending} ${t('authority.dashboard.enAttente')}`,
      color: 'from-emerald-500 to-emerald-600'
    },
    {
      label: t('authority.dashboard.quickReports'),
      path: '/authority-dashboard/rapports',
      icon: FileText,
      desc: t('authority.dashboard.quickReportsDesc'),
      color: 'from-amber-500 to-amber-600'
    },
    {
      label: t('authority.dashboard.quickAudit'),
      path: '/authority-dashboard/audit',
      icon: Activity,
      desc: t('authority.dashboard.quickAuditDesc'),
      color: 'from-violet-500 to-violet-600'
    }
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
          <button onClick={fetchDashboardData} className="text-sm text-red-600 hover:underline mt-1">{t('authority.dashboard.retry')}</button>
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
              <Shield className="w-5 h-5 text-white" />
            </div>
            {t('authority.dashboard.title')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{t('authority.dashboard.subtitle')}</p>
        </div>
        <div className="flex gap-3">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm hover:shadow-md transition-all"
          >
            {periodOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <button
            onClick={() => navigate('/authority-dashboard/validation')}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-medium hover:shadow-lg transition-all hover:scale-[1.02] active:scale-95 text-sm"
          >
            <CheckCircle2 className="w-4 h-4" />
            {t('authority.dashboard.validate')}
          </button>
        </div>
      </div>

      {/* Alertes système */}
      {showAlerts && alerts.length > 0 && (
        <div className="space-y-3 animate-slide-in-from-top-2">
          {alerts.map((alert) => (
            <div key={alert.id} className={`rounded-xl p-4 flex items-start gap-3 ${
              alert.type === 'warning' ? 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800' :
              alert.type === 'danger' ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800' :
              'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
            }`}>
              {alert.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />}
              {alert.type === 'danger' && <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />}
              {alert.type === 'info' && <Bell className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />}
              <div className="flex-1">
                <p className={`text-sm font-medium ${
                  alert.type === 'warning' ? 'text-amber-800 dark:text-amber-400' :
                  alert.type === 'danger' ? 'text-red-800 dark:text-red-400' :
                  'text-blue-800 dark:text-blue-400'
                }`}>{alert.message}</p>
                <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
              </div>
              <button onClick={() => setShowAlerts(false)} className="text-gray-400 hover:text-gray-600 hover:scale-110 transition-all">
                <XCircle className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <div
            key={i}
            className={`bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 hover:shadow-lg transition-all hover:scale-[1.02] cursor-pointer animate-slide-in-from-bottom-${i + 1}`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 bg-gradient-to-br ${kpi.color} rounded-lg flex items-center justify-center`}>
                <kpi.icon className="w-5 h-5 text-white" />
              </div>
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                kpi.trend === 'up'
                  ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'
                  : 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
              }`}>
                {kpi.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {kpi.change}
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{kpi.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Graphiques principaux */}
      <div className="grid lg:grid-cols-3 gap-6 animate-slide-in-from-bottom-2">
        {/* Évolution des déclarations */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t('authority.dashboard.evolutionTitle')}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('authority.dashboard.evolutionDesc')}</p>
            </div>
            <button onClick={() => navigate('/authority-dashboard/statistiques')} className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1 hover:scale-105 transition-all">
              {t('authority.dashboard.seeAll')} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorNaissances" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorDeces" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6b7280" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6b7280" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                />
                <Legend />
                <Area type="monotone" dataKey="naissances" stroke="#3b82f6" fillOpacity={1} fill="url(#colorNaissances)" strokeWidth={2} name={t('authority.dashboard.births')} />
                <Area type="monotone" dataKey="deces" stroke="#6b7280" fillOpacity={1} fill="url(#colorDeces)" strokeWidth={2} name={t('authority.dashboard.deaths')} />
                <Area type="monotone" dataKey="total" stroke="#10b981" fill="none" strokeWidth={2} name={t('authority.dashboard.total')} strokeDasharray="5 5" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Répartition */}
        <div className="space-y-6">
          {/* Par type */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 hover:shadow-lg transition-all">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t('authority.dashboard.byType')}</h2>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={typeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    animationBegin={300}
                    animationDuration={1200}
                  >
                    {typeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Statut hôpitaux */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 hover:shadow-lg transition-all">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t('authority.dashboard.hospitalStatus')}</h2>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={hospitalStatusData}
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    dataKey="value"
                    label={({name, value}) => `${name}: ${value}`}
                    animationBegin={400}
                    animationDuration={1200}
                  >
                    {hospitalStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Deux colonnes : Dernières validations + Top hôpitaux */}
      <div className="grid lg:grid-cols-2 gap-6 animate-slide-in-from-bottom-3">
        {/* Dernières validations */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-lg transition-all">
          <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t('authority.dashboard.recentValidations')}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('authority.dashboard.recentValidationsDesc')}</p>
            </div>
            <button
              onClick={() => navigate('/authority-dashboard/validation')}
              className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1 hover:scale-105 transition-all"
            >
              {t('authority.dashboard.seeAll')} <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {recentValidations.length === 0 ? (
              <div className="p-8 text-center text-gray-500">{t('authority.dashboard.noRecentValidations')}</div>
            ) : (
              recentValidations.map((item) => (
                <div key={item.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors hover:scale-[1.01]">
                  <div className="flex items-start gap-3">
                    {getTypeIcon(item.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900 dark:text-white text-sm">{item.personName}</p>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${statusConfig[item.status]?.color || statusConfig.pending.color}`}>
                          {statusConfig[item.status]?.label || t('authority.dashboard.statusPending')}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.hospital}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                        <span className="font-mono">{item.id}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{item.date}</span>
                        <span>•</span>
                        <span>{t('authority.dashboard.agent')}: {item.agent}</span>
                      </div>
                      {item.motif && (
                        <p className="text-xs text-red-500 mt-1">{t('authority.dashboard.reason')}: {item.motif}</p>
                      )}
                    </div>
                    <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all hover:scale-110">
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top hôpitaux */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-lg transition-all">
          <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t('authority.dashboard.topHospitals')}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('authority.dashboard.topHospitalsDesc')}</p>
            </div>
            <button
              onClick={() => navigate('/authority-dashboard/hopitaux')}
              className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1 hover:scale-105 transition-all"
            >
              {t('authority.dashboard.seeAll')} <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {topHospitals.length === 0 ? (
              <div className="p-8 text-center text-gray-500">{t('authority.dashboard.noHospitals')}</div>
            ) : (
              topHospitals.map((hospital, i) => (
                <div key={i} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors hover:scale-[1.01]">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{hospital.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-violet-600 rounded-full transition-all duration-700"
                            style={{ width: `${Math.min(hospital.taux, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 w-12 text-right">{hospital.taux}%</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900 dark:text-white text-sm">{hospital.declarations}</p>
                      <p className="text-xs text-gray-500">{t('authority.dashboard.declarations')}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-slide-in-from-bottom-4">
        {quickActions.map((action) => (
          <button
            key={action.path}
            onClick={() => navigate(action.path)}
            className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 text-left hover:shadow-lg transition-all hover:scale-[1.02] active:scale-95 group"
          >
            <div className={`w-10 h-10 bg-gradient-to-br ${action.color} rounded-lg flex items-center justify-center mb-3 group-hover:shadow-lg transition-all group-hover:scale-105`}>
              <action.icon className="w-5 h-5 text-white" />
            </div>
            <p className="font-semibold text-gray-900 dark:text-white">{action.label}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{action.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default AuthorityDashboard;