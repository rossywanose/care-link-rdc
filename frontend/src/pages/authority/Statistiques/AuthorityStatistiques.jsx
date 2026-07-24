import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../context/LanguageContext';
import {
  BarChart3,
  Baby,
  Skull,
  Shield,
  Building2,
  MapPin,
  Loader2,
  AlertTriangle,
  RefreshCw,
  Send
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
  PieChart as RePieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { hospitalAPI, birthAPI, deathAPI } from '../../../services/api';
import PublishReportModal from './PublishReportModal';

const AuthorityStatistiques = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [publishModalOpen, setPublishModalOpen] = useState(false);

  const [birthStats, setBirthStats] = useState({
    total: 0, pending: 0, approved: 0, rejected: 0,
    monthly: [], by_gender: []
  });
  const [deathStats, setDeathStats] = useState({
    total: 0, pending: 0, approved: 0, rejected: 0,
    monthly: [], by_cause: []
  });
  const [hospitals, setHospitals] = useState([]);

  // Mount animation
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    fetchStatsData();
  }, []);

  const fetchStatsData = async () => {
    setLoading(true);
    setError('');
    try {
      const [birthRes, deathRes, hospitalsRes] = await Promise.all([
        birthAPI.getBirthStats(),
        deathAPI.getDeathStats(),
        hospitalAPI.getHospitals()
      ]);

      setBirthStats(birthRes.data);
      setDeathStats(deathRes.data);
      setHospitals(hospitalsRes.data.results || hospitalsRes.data || []);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError(t('authority.statistiques.errorLoad'));
    } finally {
      setLoading(false);
    }
  };

  const totalBirths = birthStats.total || 0;
  const totalDeaths = deathStats.total || 0;
  const totalCerts = totalBirths + totalDeaths;
  const totalApproved = (birthStats.approved || 0) + (deathStats.approved || 0);
  const activeHospitals = hospitals.filter(h => h.status === 'active').length;
  const totalHospitals = hospitals.length;

  const validationRate = totalCerts > 0
    ? ((totalApproved / totalCerts) * 100).toFixed(1)
    : '0.0';

  const monthlyData = React.useMemo(() => {
    const months = t('authority.statistiques.months').split(',');
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

    for (let i = 0; i < 12; i++) {
      data.push({
        month: months[i],
        naissances: birthMonthly[i] || 0,
        deces: deathMonthly[i] || 0,
        total: (birthMonthly[i] || 0) + (deathMonthly[i] || 0)
      });
    }
    return data;
  }, [birthStats, deathStats, t]);

  const genderData = React.useMemo(() => {
    const byGender = birthStats.by_gender || [];
    const male = byGender.find(g => g.gender === 'M')?.count || 0;
    const female = byGender.find(g => g.gender === 'F')?.count || 0;
    return [
      { name: t('authority.statistiques.male'), value: male, color: '#6366f1' },
      { name: t('authority.statistiques.female'), value: female, color: '#ec4899' }
    ];
  }, [birthStats, t]);

  const acteData = [
    { name: t('authority.statistiques.births'), value: totalBirths, color: '#3b82f6' },
    { name: t('authority.statistiques.deaths'), value: totalDeaths, color: '#6b7280' }
  ];

  const provinceData = React.useMemo(() => {
    const provinces = {};
    hospitals.forEach(h => {
      const prov = h.province || t('authority.statistiques.unknown');
      if (!provinces[prov]) {
        provinces[prov] = { name: prov, naissances: 0, deces: 0, hopitaux: 0, taux: 0 };
      }
      provinces[prov].naissances += h.total_births || 0;
      provinces[prov].deces += h.total_deaths || 0;
      provinces[prov].hopitaux += 1;
      provinces[prov].taux = h.validation_rate || 0;
    });
    return Object.values(provinces).sort((a, b) => b.naissances - a.naissances);
  }, [hospitals, t]);

  const communeData = React.useMemo(() => {
    const communes = {};
    hospitals.forEach(h => {
      const commune = h.commune || t('authority.statistiques.unknown');
      const prov = h.province || '';
      const key = `${commune} (${prov})`;
      if (!communes[key]) {
        communes[key] = { name: key, commune: commune, province: prov, naissances: 0, deces: 0, hopitaux: 0, taux: 0 };
      }
      communes[key].naissances += h.total_births || 0;
      communes[key].deces += h.total_deaths || 0;
      communes[key].hopitaux += 1;
      communes[key].taux = h.validation_rate || 0;
    });
    return Object.values(communes).sort((a, b) => (b.naissances + b.deces) - (a.naissances + a.deces)).slice(0, 10);
  }, [hospitals, t]);

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

  const hospitalPerformance = React.useMemo(() => {
    const top2 = topHospitals.slice(0, 2);
    if (top2.length < 2) return [];
    return [
      { subject: t('authority.statistiques.radarDeclarations'), A: top2[0]?.declarations || 0, B: top2[1]?.declarations || 0, fullMark: 150 },
      { subject: t('authority.statistiques.radarValidations'), A: Math.round(top2[0]?.taux || 0), B: Math.round(top2[1]?.taux || 0), fullMark: 150 },
      { subject: t('authority.statistiques.radarSpeed'), A: 85, B: 90, fullMark: 150 },
      { subject: t('authority.statistiques.radarCompleteness'), A: 95, B: 88, fullMark: 150 },
      { subject: t('authority.statistiques.radarCompliance'), A: 90, B: 85, fullMark: 150 },
      { subject: t('authority.statistiques.radarCoverage'), A: 75, B: 80, fullMark: 150 }
    ];
  }, [topHospitals, t]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-3 shadow-xl">
          <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-gray-600 dark:text-gray-400">{entry.name}:</span>
              <span className="font-semibold text-gray-900 dark:text-white">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const kpiCards = [
    { label: t('authority.statistiques.totalBirths'), value: totalBirths.toLocaleString(), icon: Baby, color: 'from-blue-500 to-blue-600', delay: 1 },
    { label: t('authority.statistiques.totalDeaths'), value: totalDeaths.toLocaleString(), icon: Skull, color: 'from-gray-500 to-gray-600', delay: 2 },
    { label: t('authority.statistiques.validationRate'), value: `${validationRate}%`, icon: Shield, color: 'from-emerald-500 to-emerald-600', delay: 3 },
    { label: t('authority.statistiques.activeHospitals'), value: `${activeHospitals}/${totalHospitals}`, icon: Building2, color: 'from-indigo-500 to-violet-600', delay: 4 }
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
          <button onClick={fetchStatsData} className="text-sm text-red-600 hover:underline mt-1 flex items-center gap-1">
            <RefreshCw className="w-3 h-3" /> {t('authority.statistiques.retry')}
          </button>
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
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            {t('authority.statistiques.title')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{t('authority.statistiques.subtitle')}</p>
        </div>
        <button
          onClick={() => setPublishModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl font-medium shadow-lg shadow-indigo-500/25 transition-all hover:scale-105"
        >
          <Send className="w-4 h-4" />
          {t('Publier un rapport') || 'Publier un rapport'}
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi, i) => (
          <div
            key={i}
            className={`bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 hover:shadow-lg transition-all hover:scale-[1.02] animate-slide-in-from-bottom-${kpi.delay}`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 bg-gradient-to-br ${kpi.color} rounded-lg flex items-center justify-center hover:scale-105 transition-transform`}>
                <kpi.icon className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{kpi.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Graphique principal - Evolution mensuelle */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 hover:shadow-lg transition-all animate-slide-in-from-bottom-2">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t('authority.statistiques.monthlyEvolution')}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('authority.statistiques.monthlyDesc')}</p>
          </div>
        </div>
        <div className="h-80">
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
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
              <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area type="monotone" dataKey="naissances" stroke="#3b82f6" fillOpacity={1} fill="url(#colorNaissances)" strokeWidth={2} name={t('authority.statistiques.births')} />
              <Area type="monotone" dataKey="deces" stroke="#6b7280" fillOpacity={1} fill="url(#colorDeces)" strokeWidth={2} name={t('authority.statistiques.deaths')} />
              <Area type="monotone" dataKey="total" stroke="#10b981" fillOpacity={1} fill="url(#colorTotal)" strokeWidth={2} name={t('authority.statistiques.total')} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Deux colonnes : Repartition par sexe + Tendances annuelles */}
      <div className="grid lg:grid-cols-2 gap-6 animate-slide-in-from-bottom-3">
        {/* Repartition par sexe */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 hover:shadow-lg transition-all">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{t('authority.statistiques.genderDistribution')}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{t('authority.statistiques.genderDesc')}</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={genderData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {genderData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </RePieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl hover:scale-[1.02] transition-transform">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{(genderData[0]?.value || 0).toLocaleString()}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('authority.statistiques.boys')} ({totalBirths > 0 ? ((genderData[0]?.value / totalBirths) * 100).toFixed(1) : 0}%)</p>
            </div>
            <div className="text-center p-3 bg-pink-50 dark:bg-pink-900/20 rounded-xl hover:scale-[1.02] transition-transform">
              <p className="text-2xl font-bold text-pink-600 dark:text-pink-400">{(genderData[1]?.value || 0).toLocaleString()}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('authority.statistiques.girls')} ({totalBirths > 0 ? ((genderData[1]?.value / totalBirths) * 100).toFixed(1) : 0}%)</p>
            </div>
          </div>
        </div>

        {/* Tendances annuelles */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 hover:shadow-lg transition-all">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{t('authority.statistiques.annualTrends')}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{t('authority.statistiques.trendsDesc')}</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData.slice(0, 6)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line type="monotone" dataKey="naissances" stroke="#3b82f6" strokeWidth={2} name={t('authority.statistiques.births')} dot={{ fill: '#3b82f6' }} />
                <Line type="monotone" dataKey="deces" stroke="#6b7280" strokeWidth={2} name={t('authority.statistiques.deaths')} dot={{ fill: '#6b7280' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Performance par province */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 hover:shadow-lg transition-all animate-slide-in-from-bottom-3">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-indigo-600" />
              {t('authority.statistiques.provincePerformance')}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('authority.statistiques.provinceDesc')}</p>
          </div>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={provinceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
              <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="naissances" fill="#3b82f6" radius={[4, 4, 0, 0]} name={t('authority.statistiques.births')} />
              <Bar dataKey="deces" fill="#6b7280" radius={[4, 4, 0, 0]} name={t('authority.statistiques.deaths')} />
              <Bar dataKey="hopitaux" fill="#8b5cf6" radius={[4, 4, 0, 0]} name={t('authority.statistiques.hospitals')} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Performance par commune */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 hover:shadow-lg transition-all animate-slide-in-from-bottom-3">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-indigo-600" />
              {t('authority.statistiques.communePerformance')}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('authority.statistiques.communeDesc')}</p>
          </div>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={communeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
              <XAxis dataKey="commune" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="naissances" fill="#3b82f6" radius={[4, 4, 0, 0]} name={t('authority.statistiques.births')} />
              <Bar dataKey="deces" fill="#6b7280" radius={[4, 4, 0, 0]} name={t('authority.statistiques.deaths')} />
              <Bar dataKey="hopitaux" fill="#8b5cf6" radius={[4, 4, 0, 0]} name={t('authority.statistiques.hospitals')} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Radar performance + Tableau top provinces */}
      <div className="grid lg:grid-cols-2 gap-6 animate-slide-in-from-bottom-4">
        {/* Radar chart */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 hover:shadow-lg transition-all">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{t('authority.statistiques.hospitalPerformance')}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{t('authority.statistiques.hospitalDesc')}</p>
          <div className="h-72">
            {hospitalPerformance.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={hospitalPerformance}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis />
                  <Radar name={topHospitals[0]?.name || t('authority.statistiques.hospitalA')} dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
                  <Radar name={topHospitals[1]?.name || t('authority.statistiques.hospitalB')} dataKey="B" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                  <Legend />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                {t('authority.statistiques.insufficientData')}
              </div>
            )}
          </div>
        </div>

        {/* Top provinces tableau */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-lg transition-all">
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t('authority.statistiques.provinceRanking')}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('authority.statistiques.rankingDesc')}</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{t('authority.statistiques.colProvince')}</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{t('authority.statistiques.colBirths')}</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{t('authority.statistiques.colRate')}</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{t('authority.statistiques.colHospitals')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {provinceData.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-gray-500">{t('authority.statistiques.noData')}</td>
                  </tr>
                ) : (
                  provinceData.map((prov, i) => (
                    <tr key={prov.name} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors hover:scale-[1.005] transform-gpu">
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                            {i + 1}
                          </div>
                          <span className="font-medium text-gray-900 dark:text-white text-sm">{prov.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{prov.naissances.toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${prov.taux >= 95 ? 'bg-emerald-500' : prov.taux >= 90 ? 'bg-amber-500' : 'bg-red-500'}`}
                              style={{ width: `${Math.min(prov.taux, 100)}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{prov.taux}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <span className="text-sm text-gray-600 dark:text-gray-400">{prov.hopitaux}</span>
                      </td>
                    </tr>
                  ))
                )} 
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Repartition par type d'acte */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 hover:shadow-lg transition-all animate-slide-in-from-bottom-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t('authority.statistiques.actTypeDistribution')}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('authority.statistiques.actTypeDesc')}</p>
          </div>
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="h-64 lg:col-span-1">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={acteData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({name, percent}) => `${name} ${totalCerts > 0 ? (percent * 100).toFixed(1) : 0}%`}
                >
                  {acteData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RePieChart>
            </ResponsiveContainer>
          </div>
          <div className="lg:col-span-2 grid grid-cols-2 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 flex flex-col justify-center hover:scale-[1.02] transition-transform">
              <Baby className="w-10 h-10 text-blue-600 dark:text-blue-400 mb-3" />
              <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">{totalBirths.toLocaleString()}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{t('authority.statistiques.birthsDeclared')}</p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">{totalCerts > 0 ? ((totalBirths / totalCerts) * 100).toFixed(1) : 0}% {t('authority.statistiques.ofTotal')}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6 flex flex-col justify-center hover:scale-[1.02] transition-transform">
              <Skull className="w-10 h-10 text-gray-600 dark:text-gray-400 mb-3" />
              <p className="text-4xl font-bold text-gray-600 dark:text-gray-400">{totalDeaths.toLocaleString()}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{t('authority.statistiques.deathsDeclared')}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{totalCerts > 0 ? ((totalDeaths / totalCerts) * 100).toFixed(1) : 0}% {t('authority.statistiques.ofTotal')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      <PublishReportModal
        isOpen={publishModalOpen}
        onClose={() => setPublishModalOpen(false)}
      />
    </div>
  );
};

export default AuthorityStatistiques;
