import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Baby,
  Skull,
  FileText,
  Download,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  ChevronDown,
  Loader2,
  AlertTriangle,
  Send,
  Bell,
  Calendar,
  CheckCircle2,
  X,
  Lock,
  CreditCard
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
  PieChart as RePieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { birthAPI, deathAPI, hospitalAPI } from '../../../services/api';
import { useLanguage } from '../../../context/LanguageContext';
import { useAuth } from '../../../context/AuthContext';

const HospitalStatistiques = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [period, setPeriod] = useState('month');
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [showReminder, setShowReminder] = useState(false);
  
  // ✅ État d'abonnement
  const [subscription, setSubscription] = useState(null);
  const [checkingSubscription, setCheckingSubscription] = useState(true);

  // Donnees API
  const [birthStats, setBirthStats] = useState(null);
  const [deathStats, setDeathStats] = useState(null);

  // Donnees transformees pour les graphiques
  const [monthlyData, setMonthlyData] = useState([]);
  const [sexData, setSexData] = useState([]);
  const [ageData, setAgeData] = useState([]);

  useEffect(() => {
    setMounted(true);
    checkSubscription();
    fetchStats();
    checkMonthlyReminder();
  }, []);

  // ✅ Vérifier l'abonnement
  const checkSubscription = async () => {
    setCheckingSubscription(true);
    try {
      const res = await hospitalAPI.checkSubscription();
      setSubscription(res.data);
    } catch (err) {
      console.error('Error checking subscription:', err);
    } finally {
      setCheckingSubscription(false);
    }
  };

  // ✅ Vérifier si on est dans la semaine avant la fin du mois
  const checkMonthlyReminder = () => {
    const now = new Date();
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const daysUntilEnd = Math.ceil((lastDayOfMonth - now) / (1000 * 60 * 60 * 24));
    
    // Afficher le rappel si on est dans les 7 derniers jours du mois
    if (daysUntilEnd <= 7 && daysUntilEnd >= 0) {
      setShowReminder(true);
    }
  };

  const fetchStats = async () => {
    setLoading(true);
    setError('');
    try {
      const [birthRes, deathRes] = await Promise.all([
        birthAPI.getBirthStats(),
        deathAPI.getDeathStats()
      ]);

      const bStats = birthRes.data;
      const dStats = deathRes.data;

      setBirthStats(bStats);
      setDeathStats(dStats);

      // Transformer les donnees mensuelles
      const months = t('hospital.statistiques.months').split(',');
      const monthly = months.map((month, index) => {
        const monthNum = index + 1;
        const birthMonth = bStats.monthly?.find(m => {
          const mDate = new Date(m.month);
          return mDate.getMonth() + 1 === monthNum;
        });
        const deathMonth = dStats.monthly?.find(m => {
          const mDate = new Date(m.month);
          return mDate.getMonth() + 1 === monthNum;
        });

        const naissances = birthMonth?.count || 0;
        const deces = deathMonth?.count || 0;

        return {
          month,
          naissances,
          deces,
          certificats: naissances + deces
        };
      });
      setMonthlyData(monthly);

      // Donnees par sexe (naissances)
      const maleCount = bStats.by_gender?.find(g => g.gender === 'M')?.count || 0;
      const femaleCount = bStats.by_gender?.find(g => g.gender === 'F')?.count || 0;
      setSexData([
        { name: t('hospital.statistiques.male'), value: maleCount, color: '#6366f1' },
        { name: t('hospital.statistiques.female'), value: femaleCount, color: '#ec4899' }
      ]);

      // Donnees par cause (deces)
      const causes = dStats.by_cause?.map(c => ({
        name: c.cause_category || t('hospital.statistiques.uncategorized'),
        value: c.count
      })) || [];
      setAgeData(causes.length > 0 ? causes : [
        { name: t('hospital.statistiques.noData'), value: 0 }
      ]);

    } catch (err) {
      console.error('Error fetching stats:', err);
      setError(t('hospital.statistiques.errorLoad'));
    } finally {
      setLoading(false);
    }
  };

  // ✅ Envoyer les statistiques aux autorités (avec vérification abonnement)
  const handleSendStats = async () => {
    // Vérifier l'abonnement d'abord
    if (!subscription?.can_send_report) {
      return;
    }
    
    setSending(true);
    setSendSuccess(false);
    try {
      // Récupérer le mois actuel
      const now = new Date();
      const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
                          'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
      const currentMonth = monthNames[now.getMonth()];
      const currentYear = now.getFullYear();
      
      // Créer le rapport
      await reportAPI.createReport({
        title: `Rapport mensuel - ${user?.hospital?.name || 'Hôpital'} - ${currentMonth} ${currentYear}`,
        report_type: 'monthly_combined',
        period_start: new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0],
        period_end: new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0],
        description: `Rapport statistique mensuel contenant ${birthStats?.total || 0} naissances et ${deathStats?.total || 0} décès.`,
        total_births: birthStats?.total || 0,
        total_deaths: deathStats?.total || 0,
        male_births: birthStats?.by_gender?.find(g => g.gender === 'M')?.count || 0,
        female_births: birthStats?.by_gender?.find(g => g.gender === 'F')?.count || 0
      });
      
      setSendSuccess(true);
      setTimeout(() => setSendSuccess(false), 5000);
    } catch (err) {
      console.error('Error sending stats:', err);
      if (err.response?.data?.code === 'SUBSCRIPTION_EXPIRED') {
        setError(t('hospital.statistiques.subscriptionExpired'));
      } else if (err.response?.data?.code === 'REPORT_EXISTS') {
        setError(t('hospital.statistiques.reportExists'));
      } else {
        setError(t('hospital.statistiques.sendError'));
      }
    } finally {
      setSending(false);
    }
  };

  // ✅ Rediriger vers la page de paiement
  const handleGoToPayment = () => {
    navigate('/hospital-dashboard/paiement');
  };

  // KPIs calcules depuis les donnees API
  const totalBirths = birthStats?.total || 0;
  const totalDeaths = deathStats?.total || 0;
  const totalCerts = totalBirths + totalDeaths;
  const pendingBirths = birthStats?.pending || 0;
  const pendingDeaths = deathStats?.pending || 0;
  const approvedBirths = birthStats?.approved || 0;
  const approvedDeaths = deathStats?.approved || 0;

  const kpis = [
    {
      label: t('hospital.statistiques.totalBirths'),
      value: totalBirths.toLocaleString(),
      change: '+12.5%',
      trend: 'up',
      icon: Baby,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      label: t('hospital.statistiques.totalDeaths'),
      value: totalDeaths.toLocaleString(),
      change: '-8.2%',
      trend: 'down',
      icon: Skull,
      color: 'from-gray-500 to-gray-600',
      bgColor: 'bg-gray-50 dark:bg-gray-900/20'
    },
    {
      label: t('hospital.statistiques.certIssued'),
      value: (approvedBirths + approvedDeaths).toLocaleString(),
      change: '+15.3%',
      trend: 'up',
      icon: FileText,
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20'
    },
    {
      label: t('hospital.statistiques.pending'),
      value: (pendingBirths + pendingDeaths).toLocaleString(),
      change: pendingBirths + pendingDeaths > 0 ? t('hospital.statistiques.toProcess') : 'OK',
      trend: pendingBirths + pendingDeaths > 0 ? 'up' : 'down',
      icon: Activity,
      color: 'from-amber-500 to-amber-600',
      bgColor: 'bg-amber-50 dark:bg-amber-900/20'
    }
  ];

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6b7280'];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-3 shadow-xl animate-fade-in">
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

  // Calculer les jours restants avant fin du mois
  const getDaysUntilEndOfMonth = () => {
    const now = new Date();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return Math.ceil((lastDay - now) / (1000 * 60 * 60 * 24));
  };

  if (loading || checkingSubscription) {
    return (
      <div className={`flex items-center justify-center py-20 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`space-y-6 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 flex items-center gap-3 animate-shake">
          <AlertTriangle className="w-6 h-6 text-red-600" />
          <div>
            <p className="text-red-700 dark:text-red-400 font-medium">{error}</p>
            <button onClick={fetchStats} className="text-sm text-red-600 hover:underline mt-1 transition-all hover:scale-105">
              {t('hospital.statistiques.retry')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      
      {/* ✅ BANNIÈRE D'ABONNEMENT EXPIRÉ */}
      {subscription && !subscription.can_send_report && (
        <div className="bg-gradient-to-r from-red-500 to-rose-500 rounded-xl p-4 flex items-center justify-between shadow-lg animate-slide-in-from-top">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-semibold">
                {t('hospital.statistiques.subscriptionExpiredTitle')}
              </p>
              <p className="text-white/80 text-sm">
                {t('hospital.statistiques.subscriptionExpiredDesc')}
              </p>
            </div>
          </div>
          <button
            onClick={handleGoToPayment}
            className="flex items-center gap-2 px-4 py-2 bg-white text-red-600 rounded-lg font-medium hover:bg-red-50 transition-all hover:scale-[1.02] active:scale-95"
          >
            <CreditCard className="w-4 h-4" />
            {t('hospital.statistiques.renewSubscription')}
          </button>
        </div>
      )}

      {/* ✅ BANNIÈRE DE RAPPEL MENSUEL (seulement si abonnement actif) */}
      {showReminder && subscription?.can_send_report && (
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl p-4 flex items-center justify-between shadow-lg animate-slide-in-from-top">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-semibold">
                {t('hospital.statistiques.reminder.title', { days: getDaysUntilEndOfMonth() })}
              </p>
              <p className="text-white/80 text-sm">
                {t('hospital.statistiques.reminder.desc')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSendStats}
              disabled={sending}
              className="flex items-center gap-2 px-4 py-2 bg-white text-orange-600 rounded-lg font-medium hover:bg-orange-50 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
            >
              {sending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {t('hospital.statistiques.sendNow')}
            </button>
            <button
              onClick={() => setShowReminder(false)}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/20 text-white hover:bg-white/30 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ✅ MESSAGE DE SUCCÈS APRÈS ENVOI */}
      {sendSuccess && (
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 flex items-center gap-3 animate-slide-in-from-top">
          <CheckCircle2 className="w-6 h-6 text-emerald-600" />
          <div>
            <p className="text-emerald-700 dark:text-emerald-400 font-medium">
              {t('hospital.statistiques.sendSuccess')}
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-slide-in-from-top">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center shadow-lg">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            {t('hospital.statistiques.title')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{t('hospital.statistiques.subtitle')}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all hover:scale-[1.02] active:scale-95"
          >
            <Filter className="w-4 h-4" />
            {t('hospital.statistiques.filters')}
            <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`} />
          </button>
          
          {/* ✅ BOUTON ENVOYER AUX AUTORITÉS (désactivé si pas d'abonnement) */}
          <button
            onClick={subscription?.can_send_report ? handleSendStats : handleGoToPayment}
            disabled={sending}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 ${
              subscription?.can_send_report
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:shadow-lg'
                : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white cursor-pointer'
            }`}
          >
            {sending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : subscription?.can_send_report ? (
              <Send className="w-4 h-4" />
            ) : (
              <Lock className="w-4 h-4" />
            )}
            {subscription?.can_send_report 
              ? t('hospital.statistiques.sendToAuthority')
              : t('hospital.statistiques.renewToSend')
            }
          </button>
          
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-medium hover:shadow-lg transition-all hover:scale-[1.02] active:scale-95"
          >
            <Download className="w-4 h-4" />
            {t('hospital.statistiques.export')}
          </button>
        </div>
      </div>

      {/* Filtres */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 flex flex-wrap gap-3 animate-slide-in-from-top-2">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all hover:border-gray-400"
          >
            <option value="week">{t('hospital.statistiques.period.week')}</option>
            <option value="month">{t('hospital.statistiques.period.month')}</option>
            <option value="quarter">{t('hospital.statistiques.period.quarter')}</option>
            <option value="year">{t('hospital.statistiques.period.year')}</option>
          </select>
          <select className="px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all hover:border-gray-400">
            <option>{t('hospital.statistiques.commune.all')}</option>
            <option>Gombe</option>
            <option>Lingwala</option>
            <option>Bandal</option>
          </select>
          <select className="px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all hover:border-gray-400">
            <option>{t('hospital.statistiques.type.all')}</option>
            <option>{t('hospital.statistiques.type.births')}</option>
            <option>{t('hospital.statistiques.type.deaths')}</option>
          </select>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <div
            key={i}
            className={`bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 transition-all duration-500 hover:shadow-lg hover:scale-[1.02] cursor-default animate-slide-in-from-bottom-${i + 1}`}
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 bg-gradient-to-br ${kpi.color} rounded-lg flex items-center justify-center shadow-md`}>
                <kpi.icon className="w-5 h-5 text-white" />
              </div>
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                kpi.trend === 'up'
                  ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'
                  : 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
              }`}>
                {kpi.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {kpi.change}
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{kpi.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Graphique principal - Evolution mensuelle */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 animate-slide-in-from-bottom-3 transition-all duration-500 hover:shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t('hospital.statistiques.monthlyEvolution')}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('hospital.statistiques.monthlyDesc')}</p>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-gray-600 dark:text-gray-400">{t('hospital.statistiques.births')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-500" />
              <span className="text-gray-600 dark:text-gray-400">{t('hospital.statistiques.deaths')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-gray-600 dark:text-gray-400">{t('hospital.statistiques.certificates')}</span>
            </div>
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
                <linearGradient id="colorCertificats" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
              <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area type="monotone" dataKey="naissances" stroke="#3b82f6" fillOpacity={1} fill="url(#colorNaissances)" strokeWidth={2} name={t('hospital.statistiques.births')} />
              <Area type="monotone" dataKey="deces" stroke="#6b7280" fillOpacity={1} fill="url(#colorDeces)" strokeWidth={2} name={t('hospital.statistiques.deaths')} />
              <Area type="monotone" dataKey="certificats" stroke="#10b981" fillOpacity={1} fill="url(#colorCertificats)" strokeWidth={2} name={t('hospital.statistiques.certificates')} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Deux colonnes : Repartition par sexe + Causes de deces */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Repartition par sexe */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 animate-slide-in-from-bottom-4 transition-all duration-500 hover:shadow-lg">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{t('hospital.statistiques.sexDistribution')}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{t('hospital.statistiques.sexDesc')}</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={sexData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  animationBegin={300}
                  animationDuration={1200}
                >
                  {sexData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </RePieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl transition-all hover:scale-105">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{sexData[0]?.value || 0}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('hospital.statistiques.boys')}</p>
            </div>
            <div className="text-center p-3 bg-pink-50 dark:bg-pink-900/20 rounded-xl transition-all hover:scale-105">
              <p className="text-2xl font-bold text-pink-600 dark:text-pink-400">{sexData[1]?.value || 0}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('hospital.statistiques.girls')}</p>
            </div>
          </div>
        </div>

        {/* Deces par cause */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 animate-slide-in-from-bottom-5 transition-all duration-500 hover:shadow-lg">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{t('hospital.statistiques.deathByCause')}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{t('hospital.statistiques.causeDesc')}</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ageData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                <XAxis type="number" stroke="#9ca3af" fontSize={12} />
                <YAxis dataKey="name" type="category" stroke="#9ca3af" fontSize={12} width={120} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" fill="#6b7280" radius={[0, 4, 4, 0]} name={t('hospital.statistiques.deaths')} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tableau recapitulatif */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden animate-slide-in-from-bottom-6 transition-all duration-500 hover:shadow-lg">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t('hospital.statistiques.monthlySummary')}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{t('hospital.statistiques.table.month')}</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{t('hospital.statistiques.table.births')}</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{t('hospital.statistiques.table.deaths')}</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{t('hospital.statistiques.table.certs')}</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{t('hospital.statistiques.table.rate')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {monthlyData.map((row, idx) => (
                <tr
                  key={row.month}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-300"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{row.month}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <span className="text-gray-600 dark:text-gray-400">{row.naissances}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-gray-500" />
                      <span className="text-gray-600 dark:text-gray-400">{row.deces}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-gray-600 dark:text-gray-400">{row.certificats}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
                      {row.certificats > 0 ? ((row.certificats / (row.naissances + row.deces || 1)) * 100).toFixed(1) : 0}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HospitalStatistiques;