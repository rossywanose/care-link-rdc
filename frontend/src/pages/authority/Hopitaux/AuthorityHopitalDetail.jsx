import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../context/LanguageContext';
import {
  Building2,
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  Users,
  Stethoscope,
  Bed,
  FileText,
  Baby,
  Skull,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  AlertTriangle,
  BarChart3,
  FileSpreadsheet,
  FileDown
} from 'lucide-react';
import {
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis
} from 'recharts';
import { hospitalAPI, birthAPI, deathAPI } from '../../../services/api';

const AuthorityHopitalDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, currentLanguage } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hospital, setHospital] = useState(null);
  const [births, setBirths] = useState([]);
  const [deaths, setDeaths] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [monthlyData, setMonthlyData] = useState([]);

  useEffect(() => {
    setMounted(true);
    fetchHospitalData();
  }, [id]);

  const fetchHospitalData = async () => {
    setLoading(true);
    setError('');
    try {
      const hospitalRes = await hospitalAPI.getHospital(id);
      setHospital(hospitalRes.data);

      const birthsRes = await birthAPI.getBirths({ hospital: id, limit: 10 });
      const birthsData = birthsRes.data.results || birthsRes.data || [];
      setBirths(birthsData);

      const deathsRes = await deathAPI.getDeaths({ hospital: id, limit: 10 });
      setDeaths(deathsRes.data.results || deathsRes.data || []);

      buildMonthlyData(birthsData, deathsRes.data.results || []);
    } catch (err) {
      console.error('Error fetching hospital details:', err);
      setError(t('authority.hopitalDetail.errorLoad'));
    } finally {
      setLoading(false);
    }
  };

  const buildMonthlyData = (birthsList, deathsList) => {
    const months = t('hospital.statistiques.months').split(',');
    const data = months.map((month, index) => {
      const monthNum = index + 1;
      const birthCount = birthsList.filter(b => {
        const date = new Date(b.date_of_birth || b.created_at);
        return date.getMonth() + 1 === monthNum;
      }).length;
      const deathCount = deathsList.filter(d => {
        const date = new Date(d.date_of_death || d.created_at);
        return date.getMonth() + 1 === monthNum;
      }).length;

      return { month, naissances: birthCount, deces: deathCount, total: birthCount + deathCount };
    });
    setMonthlyData(data);
  };

  const statusConfig = {
    active: { label: t('authority.hopitaux.active'), color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800', icon: CheckCircle2 },
    inactive: { label: t('authority.hopitaux.inactive'), color: 'text-red-600 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800', icon: XCircle },
    pending: { label: t('authority.hopitaux.pending'), color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800', icon: Clock }
  };

  const typeLabels = {
    public: t('authority.hopitaux.public'),
    prive: t('authority.hopitaux.prive'),
    confessionnel: t('authority.hopitaux.confessionnel'),
    ong: t('authority.hopitaux.ong')
  };

  const getServices = (hospital) => {
    if (Array.isArray(hospital?.services)) return hospital.services;
    if (typeof hospital?.services === 'string') {
      try { return JSON.parse(hospital.services); } catch { return []; }
    }
    return [];
  };

  // Helper pour les dates localisees
  const formatDate = (dateString) => {
    if (!dateString) return t('authority.hopitalDetail.notAvailable');
    const date = new Date(dateString);
    const localeMap = { fr: 'fr-FR', ln: 'fr-FR', kg: 'fr-FR', lu: 'fr-FR', sw: 'sw-KE' };
    return date.toLocaleDateString(localeMap[currentLanguage] || 'fr-FR');
  };

  // ============================================
  // HELPERS POUR DETECTER LES CHAMPS DU BACKEND
  // ============================================

  // Recupere le nom de l enfant - essaie plusieurs champs
  const getBirthName = (birth) => {
    const first = birth.first_name || birth.child_first_name || birth.child_name || birth.nom || birth.prenom || '';
    const last = birth.last_name || birth.child_last_name || birth.nom_famille || '';
    if (!first && !last) return t('authority.hopitalDetail.notAvailable');
    return `${first} ${last}`.trim();
  };

  // Recupere le nom de la mere - essaie TOUS les champs possibles
  const getMotherName = (birth) => {
    // Liste exhaustive des noms de champs possibles pour la mere
    const possibleFields = [
      'mother_name',
      'mother_full_name',
      'mother',
      'nom_mere',
      'prenom_mere',
      'mother_first_name',
      'mother_last_name',
      'nom_complet_mere',
      'mere',
      'mothers_name',
      'parent_name',
      'nom_parent',
      'declarant_name',
      'nom_declarant',
    ];

    for (const field of possibleFields) {
      if (birth[field] && String(birth[field]).trim()) {
        return String(birth[field]).trim();
      }
    }

    // Si on a first_name + last_name separes pour la mere
    const motherFirst = birth.mother_first_name || birth.prenom_mere || '';
    const motherLast = birth.mother_last_name || birth.nom_mere || '';
    if (motherFirst || motherLast) {
      return `${motherFirst} ${motherLast}`.trim();
    }

    return t('authority.hopitalDetail.notAvailable');
  };

  // Detecte si c est un garcon - accepte PLUSIEURS formats
  const isMale = (sex) => {
    if (!sex) return false;
    const s = String(sex).toLowerCase().trim();
    return s === 'm' || s === 'male' || s === 'masculin' || s === 'garcon' || s === 'garçon' || s === 'boy' || s === 'homme' || s === 'h';
  };

  const isFemale = (sex) => {
    if (!sex) return false;
    const s = String(sex).toLowerCase().trim();
    return s === 'f' || s === 'female' || s === 'feminin' || s === 'féminin' || s === 'fille' || s === 'girl' || s === 'femme';
  };

  // ============================================
  // EXPORT CSV BIEN FORMATTE
  // ============================================

  const escapeCSV = (value) => {
    if (value === null || value === undefined) return '';
    const str = String(value);
    // Si contient virgule, point-virgule, saut de ligne ou guillemets
    if (str.includes(';') || str.includes(',') || str.includes('\n') || str.includes('"')) {
      return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
  };

  const downloadCSV = () => {
    // BOM pour UTF-8 (Excel comprend les accents)
    let csvContent = '\uFEFF';

    if (activeTab === 'births') {
      const headers = [
        t('authority.hopitalDetail.name'),
        t('authority.hopitalDetail.date'),
        t('authority.hopitalDetail.sex'),
        t('authority.hopitalDetail.mother'),
        t('authority.hopitalDetail.status')
      ];
      csvContent += headers.map(escapeCSV).join(';') + '\r\n';

      births.forEach(birth => {
        const row = [
          getBirthName(birth),
          formatDate(birth.date_of_birth),
          isMale(birth.sex) ? t('authority.hopitalDetail.boy') : isFemale(birth.sex) ? t('authority.hopitalDetail.girl') : (birth.sex || ''),
          getMotherName(birth),
          birth.status === 'approved' ? t('authority.hopitalDetail.approved') : birth.status === 'pending' ? t('authority.hopitalDetail.pending') : t('authority.hopitalDetail.rejected')
        ];
        csvContent += row.map(escapeCSV).join(';') + '\r\n';
      });
    } else if (activeTab === 'deaths') {
      const headers = [
        t('authority.hopitalDetail.name'),
        t('authority.hopitalDetail.date'),
        t('authority.hopitalDetail.age'),
        t('authority.hopitalDetail.cause'),
        t('authority.hopitalDetail.status')
      ];
      csvContent += headers.map(escapeCSV).join(';') + '\r\n';

      deaths.forEach(death => {
        const row = [
          (death.first_name || '') + ' ' + (death.last_name || t('authority.hopitalDetail.notAvailable')),
          formatDate(death.date_of_death),
          (death.age_at_death || '') + ' ' + t('authority.hopitalDetail.years'),
          death.cause_of_death || t('authority.hopitalDetail.notAvailable'),
          death.status === 'approved' ? t('authority.hopitalDetail.approved') : death.status === 'pending' ? t('authority.hopitalDetail.pending') : t('authority.hopitalDetail.rejected')
        ];
        csvContent += row.map(escapeCSV).join(';') + '\r\n';
      });
    } else {
      // Export general hospital data
      const data = [
        ['Hopital', hospital.name || ''],
        ['ID', hospital.hospital_id || hospital.id || ''],
        ['Type', typeLabels[hospital.hospital_type] || hospital.hospital_type || ''],
        ['Statut', statusConfig[hospital.status]?.label || ''],
        ['Adresse', hospital.address || ''],
        ['Commune', hospital.commune || ''],
        ['Ville', hospital.city || ''],
        ['Province', hospital.province || ''],
        ['Telephone', hospital.phone || ''],
        ['Email', hospital.email || ''],
        ['Directeur', hospital.director_name || ''],
        ['Niveau', hospital.level || ''],
        ['Capacite', (hospital.capacity || 0) + ' ' + t('authority.hopitalDetail.beds')],
        ['Personnel', (hospital.staff_count || 0) + ' ' + t('authority.hopitalDetail.employees')],
        ['Naissances', hospital.total_births || 0],
        ['Deces', hospital.total_deaths || 0],
        ['Certificats', (hospital.total_births || 0) + (hospital.total_deaths || 0)],
        ['Taux validation', (hospital.validation_rate || 0) + '%']
      ];
      csvContent += 'Champ;Valeur\r\n';
      data.forEach(row => {
        csvContent += row.map(escapeCSV).join(';') + '\r\n';
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    const filename = activeTab === 'overview' ? `${hospital.name}_infos` : `${hospital.name}_${activeTab}`;
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Fonction pour telecharger PDF
  const downloadPDF = () => {
    window.print();
  };

  // Donnees pour le PieChart
  const maleCount = births.filter(b => isMale(b.gender)).length;
  const femaleCount = births.filter(b => isFemale(b.gender)).length;

  const sexData = [
    { name: t('hospital.statistiques.male'), value: maleCount, color: '#6366f1' },
    { name: t('hospital.statistiques.female'), value: femaleCount, color: '#ec4899' }
  ];

  if (loading) {
    return (
      <div className={`flex items-center justify-center py-20 transition-all duration-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (error || !hospital) {
    return (
      <div className={`space-y-6 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 sm:p-6 flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
          <div>
            <p className="text-red-700 dark:text-red-400 font-medium text-sm sm:text-base">{error || t('authority.hopitalDetail.notFound')}</p>
            <button onClick={() => navigate('/authority-dashboard/hopitaux')} className="text-sm text-red-600 hover:underline mt-1">
              {t('authority.hopitalDetail.backToList')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const StatusIcon = statusConfig[hospital.status]?.icon || Clock;

  return (
    <div className={`space-y-4 sm:space-y-6 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 animate-slide-in-from-top">
        <button
          onClick={() => navigate('/authority-dashboard/hopitaux')}
          className="self-start p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all hover:scale-110"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-900/30 dark:to-violet-900/30 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
              {hospital.logo_url || hospital.logo ? (
                <img src={hospital.logo_url || hospital.logo} alt="" className="w-full h-full object-cover" />
              ) : (
                <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600 dark:text-indigo-400" />
              )}
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white truncate">{hospital.name}</h1>
              <p className="text-xs sm:text-sm text-gray-500 truncate">
                {hospital.hospital_id || hospital.id?.slice(0, 8)} &bull; {typeLabels[hospital.hospital_type] || hospital.hospital_type}
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-2 self-start sm:self-auto">
          <button
            onClick={downloadPDF}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all hover:scale-[1.02] text-xs sm:text-sm"
          >
            <FileDown className="w-4 h-4" />
            <span className="hidden sm:inline">{t('authority.hopitalDetail.print')}</span>
          </button>
          <button
            onClick={downloadCSV}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-medium hover:shadow-lg transition-all hover:scale-[1.02] active:scale-95 text-xs sm:text-sm"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span className="hidden sm:inline">{t('authority.hopitalDetail.downloadCSV')}</span>
          </button>
        </div>
      </div>

      {/* STATUS BANNER */}
      <div className={`p-3 sm:p-4 rounded-xl border ${statusConfig[hospital.status]?.color || statusConfig.pending.color} animate-slide-in-from-top-2`}>
        <div className="flex items-center gap-2">
          <StatusIcon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
          <span className="font-medium text-sm sm:text-base">
            {t('authority.hopitalDetail.status')}: {statusConfig[hospital.status]?.label || t('authority.hopitaux.pending')}
          </span>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 animate-slide-in-from-bottom-1">
        {[
          { label: t('authority.hopitalDetail.totalBirths'), value: hospital.total_births || 0, icon: Baby, color: 'from-blue-500 to-blue-600', trend: '+5.2%', trendType: 'up' },
          { label: t('authority.hopitalDetail.totalDeaths'), value: hospital.total_deaths || 0, icon: Skull, color: 'from-gray-500 to-gray-600', trend: '-2.1%', trendType: 'down' },
          { label: t('authority.hopitalDetail.certificates'), value: (hospital.total_births || 0) + (hospital.total_deaths || 0), icon: FileText, color: 'from-emerald-500 to-emerald-600', trend: '+8.4%', trendType: 'up' },
          { label: t('authority.hopitalDetail.validationRate'), value: `${parseFloat(hospital.validation_rate || 0).toFixed(1)}%`, icon: FileText, color: 'from-amber-500 to-amber-600', trend: parseFloat(hospital.validation_rate || 0) >= 95 ? t('authority.hopitalDetail.excellent') : t('authority.hopitalDetail.toImprove'), trendType: 'neutral' }
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-3 sm:p-5 hover:shadow-lg transition-all hover:scale-[1.02]">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center`}>
                <stat.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <span className={`text-[10px] sm:text-xs font-medium ${stat.trendType === 'up' ? 'text-emerald-600' : stat.trendType === 'down' ? 'text-red-600' : 'text-amber-600'}`}>
                {stat.trend}
              </span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
            <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* TABS */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-1 animate-slide-in-from-bottom-2">
        <div className="flex flex-wrap gap-1">
          {[
            { id: 'overview', label: t('authority.hopitalDetail.overview'), icon: BarChart3 },
            { id: 'births', label: t('authority.hopitalDetail.birthsTab'), icon: Baby },
            { id: 'deaths', label: t('authority.hopitalDetail.deathsTab'), icon: Skull },
            { id: 'info', label: t('authority.hopitalDetail.info'), icon: Building2 }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2 sm:py-2.5 rounded-lg font-medium text-xs sm:text-sm transition-all hover:scale-[1.02] flex-1 sm:flex-none justify-center sm:justify-start min-w-[60px] ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB CONTENT */}
      {activeTab === 'overview' && (
        <div className="space-y-4 sm:space-y-6 animate-slide-in-from-bottom-3">
          {/* Graphique mensuel */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 sm:p-6 hover:shadow-lg transition-all">
            <div className="mb-4 sm:mb-6">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">{t('authority.hopitalDetail.monthlyActivity')}</h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{t('authority.hopitalDetail.monthlyDesc')}</p>
            </div>
            <div className="h-56 sm:h-72">
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
                  <XAxis dataKey="month" stroke="#9ca3af" fontSize={10} tick={{fontSize: 10}} />
                  <YAxis stroke="#9ca3af" fontSize={10} tick={{fontSize: 10}} />
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Area type="monotone" dataKey="naissances" stroke="#3b82f6" fillOpacity={1} fill="url(#colorNaissances)" strokeWidth={2} name={t('hospital.statistiques.births')} />
                  <Area type="monotone" dataKey="deces" stroke="#6b7280" fillOpacity={1} fill="url(#colorDeces)" strokeWidth={2} name={t('hospital.statistiques.deaths')} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Deux colonnes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Repartition par sexe */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 sm:p-6 hover:shadow-lg transition-all">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-2">{t('authority.hopitalDetail.sexDistribution')}</h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-4 sm:mb-6">{t('authority.hopitalDetail.sexDesc')}</p>

              {/* Debug info - a supprimer apres test */}
              <div className="text-xs text-gray-400 mb-2">
                Garcons: {maleCount} | Filles: {femaleCount} | Total: {births.length}
              </div>

              <div className="h-48 sm:h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={sexData} 
                      cx="50%" 
                      cy="50%" 
                      innerRadius={50} 
                      outerRadius={80} 
                      paddingAngle={5} 
                      dataKey="value"
                      label={({name, value}) => value > 0 ? `${name}: ${value}` : ''}
                    >
                      {sexData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-4">
                <div className="text-center p-2 sm:p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <p className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">{maleCount}</p>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t('hospital.statistiques.boys')}</p>
                </div>
                <div className="text-center p-2 sm:p-3 bg-pink-50 dark:bg-pink-900/20 rounded-xl">
                  <p className="text-xl sm:text-2xl font-bold text-pink-600 dark:text-pink-400">{femaleCount}</p>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t('hospital.statistiques.girls')}</p>
                </div>
              </div>
            </div>

            {/* Activite recente */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 sm:p-6 hover:shadow-lg transition-all">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-4">{t('authority.hopitalDetail.recentActivity')}</h2>
              <div className="space-y-3">
                {births.slice(0, 5).map((birth, i) => (
                  <div key={i} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Baby className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
                        {getBirthName(birth)}
                      </p>
                      <p className="text-[10px] sm:text-xs text-gray-500">
                        {t('authority.hopitalDetail.birth')} &bull; {formatDate(birth.date_of_birth || birth.created_at)}
                      </p>
                    </div>
                    <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium flex-shrink-0 ${
                      birth.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : birth.status === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
                    }`}>
                      {birth.status === 'approved' ? t('authority.hopitalDetail.approved') : birth.status === 'pending' ? t('authority.hopitalDetail.pending') : t('authority.hopitalDetail.rejected')}
                    </span>
                  </div>
                ))}
                {births.length === 0 && (
                  <p className="text-center text-gray-400 py-8 text-sm">{t('authority.hopitalDetail.noRecentActivity')}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'births' && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden animate-slide-in-from-bottom-3">
          <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">{t('authority.hopitalDetail.birthsList')}</h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{births.length} {t('authority.hopitalDetail.records')}</p>
            </div>
            <button
              onClick={downloadCSV}
              className="flex items-center gap-2 px-3 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg text-sm font-medium hover:bg-emerald-100 transition-all self-start sm:self-auto"
            >
              <FileSpreadsheet className="w-4 h-4" />
              {t('authority.hopitalDetail.downloadCSV')}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  <th className="text-left px-3 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{t('authority.hopitalDetail.name')}</th>
                  <th className="text-left px-3 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase hidden sm:table-cell">{t('authority.hopitalDetail.date')}</th>
                  <th className="text-left px-3 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{t('authority.hopitalDetail.sex')}</th>
                  <th className="text-left px-3 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase hidden md:table-cell">{t('authority.hopitalDetail.mother')}</th>
                  <th className="text-left px-3 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{t('authority.hopitalDetail.status')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {births.map((birth) => (
                  <tr key={birth.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-3 sm:px-6 py-3 sm:py-4 font-medium text-gray-900 dark:text-white text-xs sm:text-sm">
                      {getBirthName(birth)}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400 hidden sm:table-cell">{formatDate(birth.date_of_birth)}</td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <span className={`inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium ${
                        isMale(birth.sex) ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'
                      }`}>
                        {isMale(birth.sex) ? '♂' : '♀'}
                        <span className="hidden sm:inline">{isMale(birth.sex) ? t('authority.hopitalDetail.boy') : t('authority.hopitalDetail.girl')}</span>
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400 hidden md:table-cell">{getMotherName(birth)}</td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <span className={`inline-flex items-center gap-1 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium border ${
                        birth.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : birth.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-red-50 text-red-600 border-red-200'
                      }`}>
                        {birth.status === 'approved' ? <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> : birth.status === 'pending' ? <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> : <XCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3" />}
                        <span className="hidden sm:inline">{birth.status === 'approved' ? t('authority.hopitalDetail.approved') : birth.status === 'pending' ? t('authority.hopitalDetail.pending') : t('authority.hopitalDetail.rejected')}</span>
                      </span>
                    </td>
                  </tr>
                ))}
                {births.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-400 text-sm">{t('authority.hopitalDetail.noBirths')}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'deaths' && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden animate-slide-in-from-bottom-3">
          <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">{t('authority.hopitalDetail.deathsList')}</h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{deaths.length} {t('authority.hopitalDetail.records')}</p>
            </div>
            <button
              onClick={downloadCSV}
              className="flex items-center gap-2 px-3 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg text-sm font-medium hover:bg-emerald-100 transition-all self-start sm:self-auto"
            >
              <FileSpreadsheet className="w-4 h-4" />
              {t('authority.hopitalDetail.downloadCSV')}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  <th className="text-left px-3 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{t('authority.hopitalDetail.name')}</th>
                  <th className="text-left px-3 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase hidden sm:table-cell">{t('authority.hopitalDetail.date')}</th>
                  <th className="text-left px-3 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase hidden md:table-cell">{t('authority.hopitalDetail.age')}</th>
                  <th className="text-left px-3 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase hidden lg:table-cell">{t('authority.hopitalDetail.cause')}</th>
                  <th className="text-left px-3 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{t('authority.hopitalDetail.status')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {deaths.map((death) => (
                  <tr key={death.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-3 sm:px-6 py-3 sm:py-4 font-medium text-gray-900 dark:text-white text-xs sm:text-sm">
                      {(death.first_name || '') + ' ' + (death.last_name || t('authority.hopitalDetail.notAvailable'))}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400 hidden sm:table-cell">{formatDate(death.date_of_death)}</td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400 hidden md:table-cell">{death.age_at_death} {t('authority.hopitalDetail.years')}</td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400 hidden lg:table-cell">{death.cause_of_death || t('authority.hopitalDetail.notAvailable')}</td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <span className={`inline-flex items-center gap-1 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium border ${
                        death.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : death.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-red-50 text-red-600 border-red-200'
                      }`}>
                        {death.status === 'approved' ? <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> : death.status === 'pending' ? <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> : <XCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3" />}
                        <span className="hidden sm:inline">{death.status === 'approved' ? t('authority.hopitalDetail.approved') : death.status === 'pending' ? t('authority.hopitalDetail.pending') : t('authority.hopitalDetail.rejected')}</span>
                      </span>
                    </td>
                  </tr>
                ))}
                {deaths.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-400 text-sm">{t('authority.hopitalDetail.noDeaths')}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'info' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 animate-slide-in-from-bottom-3">
          {/* Informations generales */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 sm:p-6 hover:shadow-lg transition-all">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-4">{t('authority.hopitalDetail.generalInfo')}</h2>
            <div className="space-y-2 sm:space-y-4">
              {[
                { icon: MapPin, label: t('authority.hopitalDetail.address'), value: `${hospital.address || t('authority.hopitalDetail.notAvailable')}, ${hospital.commune || ''}, ${hospital.city || ''}, ${hospital.province || ''}` },
                { icon: Phone, label: t('authority.hopitalDetail.phone'), value: hospital.phone || t('authority.hopitalDetail.notAvailable') },
                { icon: Mail, label: t('authority.hopitalDetail.email'), value: hospital.email || t('authority.hopitalDetail.notAvailable') },
                { icon: Users, label: t('authority.hopitalDetail.director'), value: hospital.director_name || t('authority.hopitalDetail.notAvailable') },
                { icon: Stethoscope, label: t('authority.hopitalDetail.level'), value: hospital.level || t('authority.hopitalDetail.notAvailable') },
                { icon: Bed, label: t('authority.hopitalDetail.capacity'), value: `${hospital.capacity || 0} ${t('authority.hopitalDetail.beds')}` }
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">{item.label}</p>
                      <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">{item.value}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Services et licence */}
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 sm:p-6 hover:shadow-lg transition-all">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-4">{t('authority.hopitalDetail.services')}</h2>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {getServices(hospital).length > 0 ? (
                  getServices(hospital).map((service, i) => (
                    <span key={i} className="px-2 sm:px-3 py-1 sm:py-1.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-full text-xs sm:text-sm font-medium hover:scale-105 transition-all">
                      {service}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-400 text-sm">{t('authority.hopitalDetail.noServices')}</p>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 sm:p-6 hover:shadow-lg transition-all">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-4">{t('authority.hopitalDetail.license')}</h2>
              <div className="space-y-2 sm:space-y-3">
                {[
                  { label: t('authority.hopitalDetail.licenseNumber'), value: hospital.license_number || t('authority.hopitalDetail.notAvailable'), mono: true },
                  { label: t('authority.hopitalDetail.licenseExpiry'), value: hospital.license_expiry ? formatDate(hospital.license_expiry) : t('authority.hopitalDetail.notAvailable') },
                  { label: t('authority.hopitalDetail.staffCount'), value: `${hospital.staff_count || 0} ${t('authority.hopitalDetail.employees')}` },
                  { label: t('authority.hopitalDetail.createdAt'), value: formatDate(hospital.created_at) }
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <span className="text-xs sm:text-sm text-gray-500">{item.label}</span>
                    <span className={`text-xs sm:text-sm font-medium text-gray-900 dark:text-white ${item.mono ? 'font-mono' : ''}`}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthorityHopitalDetail;