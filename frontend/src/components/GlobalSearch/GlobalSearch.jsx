import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import {
  Search,
  X,
  Command,
  LayoutDashboard,
  Building2,
  CheckCircle2,
  FileText,
  AlertTriangle,
  Activity,
  BarChart3,
  Baby,
  Skull,
  User,
  Settings,
  Baby as BabyIcon,
  FileSpreadsheet,
  ChevronRight,
  Loader2,
  Hash,
  LayoutDashboard as DashboardIcon,
  Building2 as HospitalIcon,
  FileText as CertIcon,
  FileSpreadsheet as ReportIcon
} from 'lucide-react';
import { hospitalAPI, birthAPI, deathAPI, reportAPI } from '../../services/api';

// ============================================
// CONFIGURATION DES RÉSULTATS PAR RÔLE
// ============================================

const getNavigationItems = (role, t) => {
  const base = {
    citizen: [
      { id: 'dashboard', label: t('layout.menu.dashboard') || 'Tableau de bord', path: '/citizen-dashboard', icon: LayoutDashboard, category: 'pages' },
      { id: 'certs', label: t('layout.menu.myCerts') || 'Mes certificats', path: '/citizen-dashboard/certificats', icon: FileText, category: 'pages' },
      { id: 'report', label: t('layout.menu.report') || 'Signalement', path: '/citizen-dashboard/signalement', icon: AlertTriangle, category: 'pages' },
      { id: 'profile', label: t('layout.menu.profile') || 'Profil', path: '/citizen-dashboard/profil', icon: User, category: 'pages' },
      { id: 'settings', label: t('layout.menu.settings') || 'Paramètres', path: '/citizen-dashboard/parametres', icon: Settings, category: 'pages' },
    ],
    hospital: [
      { id: 'dashboard', label: t('layout.menu.dashboard') || 'Tableau de bord', path: '/hospital-dashboard', icon: LayoutDashboard, category: 'pages' },
      { id: 'births', label: t('layout.menu.births') || 'Naissances', path: '/hospital-dashboard/naissances', icon: Baby, category: 'pages' },
      { id: 'births-new', label: (t('layout.menu.births') || 'Naissances') + ' — Nouveau', path: '/hospital-dashboard/naissances/nouveau', icon: Baby, category: 'pages' },
      { id: 'deaths', label: t('layout.menu.deaths') || 'Décès', path: '/hospital-dashboard/deces', icon: Skull, category: 'pages' },
      { id: 'deaths-new', label: (t('layout.menu.deaths') || 'Décès') + ' — Nouveau', path: '/hospital-dashboard/deces/nouveau', icon: Skull, category: 'pages' },
      { id: 'certs', label: t('layout.menu.certs') || 'Certificats', path: '/hospital-dashboard/certificats', icon: FileText, category: 'pages' },
      { id: 'stats', label: t('layout.menu.statistics') || 'Statistiques', path: '/hospital-dashboard/statistiques', icon: BarChart3, category: 'pages' },
      { id: 'profile', label: t('layout.menu.profile') || 'Profil', path: '/hospital-dashboard/profil', icon: User, category: 'pages' },
      { id: 'settings', label: t('layout.menu.settings') || 'Paramètres', path: '/hospital-dashboard/parametres', icon: Settings, category: 'pages' },
    ],
    authority: [
      { id: 'dashboard', label: t('layout.menu.dashboard') || 'Tableau de bord', path: '/authority-dashboard', icon: LayoutDashboard, category: 'pages' },
      { id: 'hospitals', label: t('layout.menu.hospitals') || 'Hôpitaux', path: '/authority-dashboard/hopitaux', icon: Building2, category: 'pages' },
      { id: 'validation', label: t('layout.menu.validation') || 'Validation', path: '/authority-dashboard/validation', icon: CheckCircle2, category: 'pages' },
      { id: 'reports', label: t('layout.menu.reports') || 'Rapports', path: '/authority-dashboard/rapports', icon: FileText, category: 'pages' },
      { id: 'alerts', label: t('layout.menu.report') || 'Signalements', path: '/authority-dashboard/signalement', icon: AlertTriangle, category: 'pages' },
      { id: 'audit', label: t('layout.menu.audit') || 'Audit', path: '/authority-dashboard/audit', icon: Activity, category: 'pages' },
      { id: 'stats', label: t('layout.menu.statistics') || 'Statistiques', path: '/authority-dashboard/statistiques', icon: BarChart3, category: 'pages' },
      { id: 'profile', label: t('layout.menu.profile') || 'Profil', path: '/authority-dashboard/profil', icon: User, category: 'pages' },
      { id: 'settings', label: t('layout.menu.settings') || 'Paramètres', path: '/authority-dashboard/parametres', icon: Settings, category: 'pages' },
    ],
  };
  return base[role] || base.citizen;
};

// ============================================
// COMPOSANT GLOBAL SEARCH (Spotlight)
// ============================================

const GlobalSearch = ({ role, isOpen: externalIsOpen, onClose }) => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = externalIsOpen !== undefined
    ? (val) => { if (!val && onClose) onClose(); }
    : setInternalIsOpen;

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({ pages: [], data: [] });

  const inputRef = useRef(null);
  const containerRef = useRef(null);

  // Raccourci clavier Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (externalIsOpen !== undefined) {
          if (isOpen && onClose) onClose();
          // Si contrôlé par le parent, on ne toggle pas ici
        } else {
          setInternalIsOpen(prev => !prev);
        }
      }
      if (e.key === 'Escape') {
        if (externalIsOpen !== undefined) {
          if (onClose) onClose();
        } else {
          setInternalIsOpen(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [externalIsOpen, isOpen, onClose]);

  // Focus input quand ouvert
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery('');
      setSelectedIndex(0);
      setResults({ pages: getNavigationItems(role, t), data: [] });
    }
  }, [isOpen, role, t]);

  // Recherche
  const performSearch = useCallback(async (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults({ pages: getNavigationItems(role, t), data: [] });
      return;
    }

    const lowerQuery = searchQuery.toLowerCase();
    const pages = getNavigationItems(role, t).filter(item =>
      item.label.toLowerCase().includes(lowerQuery)
    );

    setLoading(true);
    const dataResults = [];

    try {
      if (role === 'authority') {
        try {
          const hospRes = await hospitalAPI.getHospitals({ search: searchQuery, limit: 5 });
          const hospitals = hospRes.data?.results || hospRes.data || [];
          hospitals.forEach(h => {
            dataResults.push({
              id: `hospital-${h.id}`,
              label: h.name,
              subtitle: `${h.province || 'N/A'} • ${h.city || 'N/A'}`,
              path: `/authority-dashboard/hopitaux/${h.id}`,
              icon: Building2,
              category: 'hospitals',
              meta: h.hospital_id || h.id?.slice(0, 8)
            });
          });
        } catch (e) { /* silencieux */ }

        try {
          const birthRes = await birthAPI.getBirths({ search: searchQuery, limit: 5 });
          const births = birthRes.data?.results || birthRes.data || [];
          births.forEach(b => {
            const name = `${b.first_name || b.child_first_name || ''} ${b.last_name || b.child_last_name || ''}`.trim() || 'N/A';
            dataResults.push({
              id: `birth-${b.id}`,
              label: name,
              subtitle: `Naissance • ${b.date_of_birth || 'N/A'}`,
              path: `/authority-dashboard/validation`,
              icon: BabyIcon,
              category: 'certificates',
              meta: b.certificate_id || b.id?.slice(0, 8)
            });
          });
        } catch (e) { /* silencieux */ }

        try {
          const deathRes = await deathAPI.getDeaths({ search: searchQuery, limit: 5 });
          const deaths = deathRes.data?.results || deathRes.data || [];
          deaths.forEach(d => {
            const name = `${d.first_name || ''} ${d.last_name || ''}`.trim() || 'N/A';
            dataResults.push({
              id: `death-${d.id}`,
              label: name,
              subtitle: `Décès • ${d.date_of_death || 'N/A'}`,
              path: `/authority-dashboard/validation`,
              icon: Skull,
              category: 'certificates',
              meta: d.certificate_id || d.id?.slice(0, 8)
            });
          });
        } catch (e) { /* silencieux */ }

        try {
          const reportRes = await reportAPI.getReports({ search: searchQuery, limit: 5 });
          const reports = reportRes.data?.results || reportRes.data || [];
          reports.forEach(r => {
            dataResults.push({
              id: `report-${r.id}`,
              label: r.title || 'Rapport sans titre',
              subtitle: `Rapport • ${r.status_display || r.status || 'N/A'}`,
              path: `/authority-dashboard/rapports`,
              icon: FileSpreadsheet,
              category: 'reports',
              meta: r.report_id || r.id?.slice(0, 8)
            });
          });
        } catch (e) { /* silencieux */ }

      } else if (role === 'hospital') {
        try {
          const birthRes = await birthAPI.getBirths({ search: searchQuery, limit: 5 });
          const births = birthRes.data?.results || birthRes.data || [];
          births.forEach(b => {
            const name = `${b.first_name || b.child_first_name || ''} ${b.last_name || b.child_last_name || ''}`.trim() || 'N/A';
            dataResults.push({
              id: `birth-${b.id}`,
              label: name,
              subtitle: `Naissance • ${b.date_of_birth || 'N/A'}`,
              path: `/hospital-dashboard/naissances/${b.id}`,
              icon: BabyIcon,
              category: 'certificates',
              meta: b.certificate_id || b.id?.slice(0, 8)
            });
          });
        } catch (e) { /* silencieux */ }

        try {
          const deathRes = await deathAPI.getDeaths({ search: searchQuery, limit: 5 });
          const deaths = deathRes.data?.results || deathRes.data || [];
          deaths.forEach(d => {
            const name = `${d.first_name || ''} ${d.last_name || ''}`.trim() || 'N/A';
            dataResults.push({
              id: `death-${d.id}`,
              label: name,
              subtitle: `Décès • ${d.date_of_death || 'N/A'}`,
              path: `/hospital-dashboard/deces/${d.id}`,
              icon: Skull,
              category: 'certificates',
              meta: d.certificate_id || d.id?.slice(0, 8)
            });
          });
        } catch (e) { /* silencieux */ }

      } else if (role === 'citizen') {
        try {
          const birthRes = await birthAPI.getBirths({ search: searchQuery, limit: 5 });
          const births = birthRes.data?.results || birthRes.data || [];
          births.forEach(b => {
            const name = `${b.first_name || b.child_first_name || ''} ${b.last_name || b.child_last_name || ''}`.trim() || 'N/A';
            dataResults.push({
              id: `birth-${b.id}`,
              label: name,
              subtitle: `Certificat de naissance • ${b.status || 'N/A'}`,
              path: `/citizen-dashboard/certificats`,
              icon: BabyIcon,
              category: 'certificates',
              meta: b.certificate_id || b.id?.slice(0, 8)
            });
          });
        } catch (e) { /* silencieux */ }

        try {
          const deathRes = await deathAPI.getDeaths({ search: searchQuery, limit: 5 });
          const deaths = deathRes.data?.results || deathRes.data || [];
          deaths.forEach(d => {
            const name = `${d.first_name || ''} ${d.last_name || ''}`.trim() || 'N/A';
            dataResults.push({
              id: `death-${d.id}`,
              label: name,
              subtitle: `Certificat de décès • ${d.status || 'N/A'}`,
              path: `/citizen-dashboard/certificats`,
              icon: Skull,
              category: 'certificates',
              meta: d.certificate_id || d.id?.slice(0, 8)
            });
          });
        } catch (e) { /* silencieux */ }
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }

    setResults({ pages, data: dataResults });
  }, [role, t]);

  // Debounce de la recherche
  useEffect(() => {
    const timeout = setTimeout(() => {
      performSearch(query);
    }, 300);
    return () => clearTimeout(timeout);
  }, [query, performSearch]);

  // Navigation clavier
  const handleKeyDown = (e) => {
    const allResults = [...results.pages, ...results.data];

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % allResults.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + allResults.length) % allResults.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (allResults[selectedIndex]) {
        navigateTo(allResults[selectedIndex]);
      }
    }
  };

  const navigateTo = (item) => {
    if (externalIsOpen !== undefined) {
      if (onClose) onClose();
    } else {
      setInternalIsOpen(false);
    }
    navigate(item.path);
  };

  const allResults = [...results.pages, ...results.data];

  const getCategoryLabel = (category) => {
    const labels = {
      pages: t('search.category.pages') || 'Pages',
      hospitals: t('search.category.hospitals') || 'Hôpitaux',
      certificates: t('search.category.certificates') || 'Certificats',
      reports: t('search.category.reports') || 'Rapports',
    };
    return labels[category] || category;
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] animate-in fade-in duration-200"
      onClick={() => {
        if (externalIsOpen !== undefined) {
          if (onClose) onClose();
        } else {
          setInternalIsOpen(false);
        }
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div
        ref={containerRef}
        className="relative w-full max-w-2xl mx-4 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Header / Input */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-200 dark:border-gray-800">
          {loading ? (
            <Loader2 className="w-5 h-5 text-gray-400 animate-spin flex-shrink-0" />
          ) : (
            <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
          )}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder={t('search.placeholder') || 'Rechercher une page, un hôpital, un certificat...'}
            className="flex-1 bg-transparent text-base text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none"
          />
          <div className="flex items-center gap-1 flex-shrink-0">
            <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs text-gray-500 font-mono">
              <Command className="w-3 h-3" /> K
            </kbd>
            <button
              onClick={() => {
                if (externalIsOpen !== undefined) {
                  if (onClose) onClose();
                } else {
                  setInternalIsOpen(false);
                }
              }}
              className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto">
          {allResults.length === 0 && query.trim() && !loading ? (
            <div className="py-12 text-center">
              <Search className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {t('search.noResults') || 'Aucun résultat trouvé'}
              </p>
              <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                {t('search.tryDifferent') || 'Essayez un autre terme'}
              </p>
            </div>
          ) : (
            <>
              {/* Pages */}
              {results.pages.length > 0 && (
                <div className="py-2">
                  <div className="px-4 py-2 flex items-center gap-2">
                    <LayoutDashboard className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {getCategoryLabel('pages')}
                    </span>
                  </div>
                  {results.pages.map((item, index) => {
                    const Icon = item.icon;
                    const isSelected = index === selectedIndex;
                    return (
                      <button
                        key={item.id}
                        onClick={() => navigateTo(item)}
                        onMouseEnter={() => setSelectedIndex(index)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-150 ${
                          isSelected
                            ? 'bg-indigo-50 dark:bg-indigo-900/30'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                      >
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          isSelected
                            ? 'bg-gradient-to-br from-indigo-500 to-violet-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${
                            isSelected ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-900 dark:text-white'
                          }`}>
                            {item.label}
                          </p>
                        </div>
                        <ChevronRight className={`w-4 h-4 flex-shrink-0 ${
                          isSelected ? 'text-indigo-500' : 'text-gray-300'
                        }`} />
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Data Results */}
              {results.data.length > 0 && (
                <div className="py-2 border-t border-gray-100 dark:border-gray-800">
                  <div className="px-4 py-2 flex items-center gap-2">
                    <Hash className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('search.category.data') || 'Données'}
                    </span>
                  </div>
                  {results.data.map((item, index) => {
                    const Icon = item.icon;
                    const actualIndex = results.pages.length + index;
                    const isSelected = actualIndex === selectedIndex;
                    return (
                      <button
                        key={item.id}
                        onClick={() => navigateTo(item)}
                        onMouseEnter={() => setSelectedIndex(actualIndex)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-150 ${
                          isSelected
                            ? 'bg-indigo-50 dark:bg-indigo-900/30'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                      >
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          isSelected
                            ? 'bg-gradient-to-br from-indigo-500 to-violet-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${
                            isSelected ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-900 dark:text-white'
                          }`}>
                            {item.label}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {item.subtitle}
                          </p>
                        </div>
                        {item.meta && (
                          <span className="text-xs font-mono text-gray-400 dark:text-gray-500 flex-shrink-0 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                            {item.meta}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Hint footer */}
              <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between text-xs text-gray-400">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-[10px]">↑</kbd>
                    <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-[10px]">↓</kbd>
                    <span>{t('search.navigate') || 'Naviguer'}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-[10px]">↵</kbd>
                    <span>{t('search.select') || 'Sélectionner'}</span>
                  </span>
                </div>
                <span>{allResults.length} {t('search.results') || 'résultats'}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default GlobalSearch;