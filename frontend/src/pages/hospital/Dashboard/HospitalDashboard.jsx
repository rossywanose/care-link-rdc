import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText, Plus, TrendingUp, TrendingDown, Baby, Skull,
  CheckCircle2, Clock, XCircle, Calendar, ArrowRight,
  AlertTriangle, BarChart3, Download, Printer, Loader2,
  RefreshCw
} from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { birthAPI, deathAPI } from '../../../services/api';

const HospitalDashboard = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    births: 0,
    deaths: 0,
    total: 0,
    pending: 0
  });
  const [recentDeclarations, setRecentDeclarations] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [animatedStats, setAnimatedStats] = useState({ births: 0, deaths: 0, total: 0, pending: 0 });

  // Status config - translated
  const statusConfig = {
    approved: { label: t('hospital.status.approved'), color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' },
    pending: { label: t('hospital.status.pending'), color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800' },
    rejected: { label: t('hospital.status.rejected'), color: 'text-red-600 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' },
    draft: { label: t('hospital.status.draft'), color: 'text-gray-600 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700' },
    paid: { label: t('hospital.status.paid'), color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' }
  };

  // Stat cards - translated
  const statCards = [
    { label: t('hospital.stats.births'), value: stats.births, icon: Baby, color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-50 dark:bg-blue-900/20', textColor: 'text-blue-600 dark:text-blue-400' },
    { label: t('hospital.stats.deaths'), value: stats.deaths, icon: Skull, color: 'from-gray-500 to-gray-600', bgColor: 'bg-gray-50 dark:bg-gray-800', textColor: 'text-gray-600 dark:text-gray-400' },
    { label: t('hospital.stats.totalCerts'), value: stats.total, icon: FileText, color: 'from-emerald-500 to-emerald-600', bgColor: 'bg-emerald-50 dark:bg-emerald-900/20', textColor: 'text-emerald-600 dark:text-emerald-400' },
    { label: t('hospital.stats.pending'), value: stats.pending, icon: Clock, color: 'from-amber-500 to-amber-600', bgColor: 'bg-amber-50 dark:bg-amber-900/20', textColor: 'text-amber-600 dark:text-amber-400' },
  ];

  // Fetch dashboard data
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Animate stats on load
  useEffect(() => {
    if (!isLoading && stats.total > 0) {
      const duration = 1000;
      const steps = 30;
      const interval = duration / steps;
      let step = 0;
      const timer = setInterval(() => {
        step++;
        const progress = step / steps;
        const easeOut = 1 - Math.pow(1 - progress, 3);
        setAnimatedStats({
          births: Math.round(stats.births * easeOut),
          deaths: Math.round(stats.deaths * easeOut),
          total: Math.round(stats.total * easeOut),
          pending: Math.round(stats.pending * easeOut)
        });
        if (step >= steps) clearInterval(timer);
      }, interval);
      return () => clearInterval(timer);
    }
  }, [isLoading, stats]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const [birthStatsRes, deathStatsRes, birthsRes, deathsRes] = await Promise.all([
        birthAPI.getBirthStats(),
        deathAPI.getDeathStats(),
        birthAPI.getBirths({ limit: 5 }),
        deathAPI.getDeaths({ limit: 5 })
      ]);

      const birthStats = birthStatsRes.data;
      const deathStats = deathStatsRes.data;
      const births = birthsRes.data.results || birthsRes.data;
      const deaths = deathsRes.data.results || deathsRes.data;

      const combined = [
        ...births.map(b => ({
          id: b.certificate_id || b.id,
          type: 'naissance',
          name: `${b.child_first_name || ''} ${b.child_last_name || ''}`.trim(),
          date: b.date_of_birth,
          status: b.status,
          sex: b.gender,
          mother: b.mother_full_name || `${b.mother_first_name || ''} ${b.mother_last_name || ''}`.trim(),
          weight: b.weight,
          created_at: b.created_at
        })),
        ...deaths.map(d => ({
          id: d.certificate_id || d.id,
          type: 'deces',
          name: `${d.first_name || ''} ${d.last_name || ''}`.trim(),
          date: d.date_of_death,
          status: d.status,
          sex: d.gender,
          age: d.age_at_death,
          cause: d.cause_of_death,
          created_at: d.created_at
        }))
      ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5);

      setStats({
        births: birthStats.total || 0,
        deaths: deathStats.total || 0,
        total: (birthStats.total || 0) + (deathStats.total || 0),
        pending: (birthStats.pending || 0) + (deathStats.pending || 0)
      });
      setRecentDeclarations(combined);

      const months = t('hospital.months');
      const birthMonthly = birthStats.monthly || [];
      const deathMonthly = deathStats.monthly || [];
      const last6Months = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const monthLabel = months[d.getMonth()] || monthKey;
        const birthCount = birthMonthly.find(m => m.month && m.month.startsWith(monthKey))?.count || 0;
        const deathCount = deathMonthly.find(m => m.month && m.month.startsWith(monthKey))?.count || 0;
        last6Months.push({ month: monthLabel, naissances: birthCount, deces: deathCount });
      }
      setMonthlyData(last6Months);
    } catch (err) {
      console.error('Error fetching dashboard:', err);
      // Silencieux pour 404 (pas encore de données)
      if (err.response?.status !== 404) {
        setError(t('hospital.dashboard.errorLoad'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const maxValue = Math.max(...monthlyData.map(d => d.naissances + d.deces), 1);

  const getStatusBadge = (status) => {
    const config = statusConfig[status] || statusConfig.draft;
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${config.color} transition-all duration-300 hover:scale-105`}>
        {status === 'approved' && <CheckCircle2 className="w-3 h-3" />}
        {status === 'pending' && <Clock className="w-3 h-3" />}
        {status === 'rejected' && <XCircle className="w-3 h-3" />}
        {status === 'draft' && <FileText className="w-3 h-3" />}
        {status === 'paid' && <CheckCircle2 className="w-3 h-3" />}
        {config.label}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-500">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
        <p className="text-gray-500 dark:text-gray-400 animate-pulse">{t('hospital.dashboard.loading')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Error */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center gap-3 animate-in fade-in zoom-in-95 duration-300">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          <button onClick={fetchDashboardData} className="ml-auto text-sm text-red-600 hover:text-red-700 font-medium hover:underline transition-all">
            {t('hospital.dashboard.retry')}
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-500">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('hospital.dashboard.title')}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{t('hospital.dashboard.subtitle')}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/hospital-dashboard/naissances/nouveau')}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all hover:scale-[1.02] active:scale-95 group"
          >
            <Baby className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
            <span className="hidden sm:inline">{t('hospital.stats.births')}</span>
          </button>
          <button
            onClick={() => navigate('/hospital-dashboard/deces/nouveau')}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-gray-500/30 transition-all hover:scale-[1.02] active:scale-95 group"
          >
            <Skull className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
            <span className="hidden sm:inline">{t('hospital.stats.deaths')}</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-white/5 transition-all duration-500 hover:-translate-y-1 group cursor-pointer animate-in fade-in slide-in-from-bottom-2 duration-500"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white tabular-nums">{animatedStats[['births','deaths','total','pending'][i]]}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 group-hover:text-indigo-500 transition-colors duration-300">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions + Chart */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl p-6 text-white animate-in fade-in slide-in-from-left-4 duration-700">
          <h3 className="text-lg font-bold mb-4">{t('hospital.quickActions.title')}</h3>
          <div className="space-y-3">
            {[
              { icon: Baby, title: t('hospital.quickActions.declareBirth'), desc: t('hospital.quickActions.declareBirthDesc'), path: '/hospital-dashboard/naissances/nouveau' },
              { icon: Skull, title: t('hospital.quickActions.declareDeath'), desc: t('hospital.quickActions.declareDeathDesc'), path: '/hospital-dashboard/deces/nouveau' },
              { icon: FileText, title: t('hospital.quickActions.manageCerts'), desc: t('hospital.quickActions.manageCertsDesc'), path: '/hospital-dashboard/certificats' },
              { icon: BarChart3, title: t('hospital.quickActions.viewStats'), desc: t('hospital.quickActions.viewStatsDesc'), path: '/hospital-dashboard/statistiques' }
            ].map((action, i) => (
              <button
                key={i}
                onClick={() => navigate(action.path)}
                className="w-full flex items-center gap-3 p-4 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all duration-300 text-left group hover:translate-x-1"
              >
                <action.icon className="w-6 h-6 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300" />
                <div className="flex-1">
                  <p className="font-medium">{action.title}</p>
                  <p className="text-xs text-indigo-200">{action.desc}</p>
                </div>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            ))}
          </div>
        </div>

        {/* Mini Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 animate-in fade-in slide-in-from-right-4 duration-700">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('hospital.chart.title')}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('hospital.chart.subtitle')}</p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-500" />
                {t('hospital.chart.births')}
              </span>
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-gray-400" />
                {t('hospital.chart.deaths')}
              </span>
            </div>
          </div>

          <div className="flex items-end justify-between gap-2 h-48">
            {monthlyData.map((data, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="w-full flex gap-1 items-end justify-center h-40">
                  <div
                    className="w-full bg-blue-500 rounded-t-lg transition-all duration-500 hover:bg-blue-600 group-hover:scale-y-105 origin-bottom"
                    style={{ height: `${(data.naissances / maxValue) * 100}%`, transitionDelay: `${i * 50}ms` }}
                    title={`${data.naissances} ${t('hospital.chart.births')}`}
                  />
                  <div
                    className="w-full bg-gray-400 rounded-t-lg transition-all duration-500 hover:bg-gray-500 group-hover:scale-y-105 origin-bottom"
                    style={{ height: `${(data.deces / maxValue) * 100}%`, transitionDelay: `${i * 50 + 25}ms` }}
                    title={`${data.deces} ${t('hospital.chart.deaths')}`}
                  />
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 group-hover:text-indigo-500 transition-colors duration-300">{data.month}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Declarations */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('hospital.recentDecl.title')}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('hospital.recentDecl.subtitle')}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchDashboardData}
              className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all duration-300 hover:rotate-180"
              title={t('hospital.dashboard.refresh')}
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button
              onClick={() => alert('Impression...')}
              className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all duration-300 hover:scale-110"
              title={t('hospital.dashboard.print')}
            >
              <Printer className="w-5 h-5" />
            </button>
            <button
              onClick={() => alert('Export...')}
              className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all duration-300 hover:scale-110"
              title={t('hospital.dashboard.export')}
            >
              <Download className="w-5 h-5" />
            </button>
          </div>
        </div>

        {recentDeclarations.length === 0 ? (
          <div className="p-8 text-center animate-in fade-in zoom-in-95 duration-500">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">{t('hospital.recentDecl.noDecl')}</p>
            <p className="text-sm text-gray-400 mt-1">{t('hospital.recentDecl.noDeclDesc')}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {recentDeclarations.map((decl, index) => (
              <div
                key={decl.id}
                className="p-5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-300 group cursor-pointer animate-in fade-in slide-in-from-left-2 duration-500"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 ${
                      decl.type === 'naissance'
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600'
                    }`}>
                      {decl.type === 'naissance' ? <Baby className="w-5 h-5" /> : <Skull className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 transition-colors duration-300">{decl.name || t('hospital.dashboard.noName')}</h3>
                        {getStatusBadge(decl.status)}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-mono text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">{decl.id}</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {decl.date}
                        </span>
                        <span>{t('hospital.dashboard.sex')}: {decl.sex === 'M' ? t('hospital.dashboard.male') : t('hospital.dashboard.female')}</span>
                        {decl.mother && <span>{t('hospital.dashboard.mother')}: {decl.mother}</span>}
                        {decl.weight && <span>{t('hospital.dashboard.weight')}: {decl.weight} {t('hospital.dashboard.kg')}</span>}
                        {decl.age && <span>{t('hospital.dashboard.age')}: {decl.age} {t('hospital.dashboard.years')}</span>}
                        {decl.cause && <span>{t('hospital.dashboard.cause')}: {decl.cause}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate(`/hospital-dashboard/${decl.type === 'naissance' ? 'naissances' : 'deces'}`)}
                      className="px-4 py-2 text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-medium hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all duration-300 hover:scale-105 group/btn"
                    >
                      <span className="flex items-center gap-1">
                        {t('hospital.dashboard.view')}
                        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-300" />
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HospitalDashboard;