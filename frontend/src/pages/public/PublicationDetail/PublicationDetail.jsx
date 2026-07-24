// =========================================================
// PublicationDetail.jsx — PAGE DÉTAIL DES PUBLICATIONS
// src/pages/public/PublicationDetail/PublicationDetail.jsx
// =========================================================

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../context/LanguageContext';
import { publicationAPI } from '../../../services/publicationService';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Baby,
  Skull,
  Users,
  TrendingUp,
  TrendingDown,
  Clock,
  Share2,
  Printer,
  Loader2,
  AlertTriangle,
  ChevronRight,
  FileText,
  Activity,
  BarChart3,
  PieChart as PieChartIcon,
  Map as MapIcon
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
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  LineChart,
  Line
} from 'recharts';

// Composant compteur animé
const AnimatedCounter = ({ target, duration = 2000, suffix = '' }) => {
  const [count, setCount] = useState(0);
  const countRef = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const startTime = Date.now();
          const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 }
    );

    if (countRef.current) observer.observe(countRef.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return (
    <span ref={countRef}>
      {count.toLocaleString()}{suffix}
    </span>
  );
};

// Composant carte simple de la RDC (SVG)
const RDCCard = ({ provinceData, type }) => {
  // Couleurs selon le type (births = bleu, deaths = gris)
  const getColor = (value, max) => {
    if (max === 0) return '#e5e7eb';
    const intensity = value / max;
    if (type === 'births') {
      return `rgba(59, 130, 246, ${0.2 + intensity * 0.8})`;
    }
    return `rgba(107, 114, 128, ${0.2 + intensity * 0.8})`;
  };

  const maxValue = Math.max(...provinceData.map(p => type === 'births' ? p.births : p.deaths), 1);

  // Simplification: rectangles représentant les provinces
  const provinces = [
    { name: 'Kinshasa', x: 35, y: 55, w: 12, h: 8 },
    { name: 'Kongo-Central', x: 30, y: 62, w: 10, h: 6 },
    { name: 'Bas-Uele', x: 55, y: 15, w: 10, h: 8 },
    { name: 'Haut-Uele', x: 60, y: 22, w: 10, h: 8 },
    { name: 'Ituri', x: 62, y: 30, w: 8, h: 8 },
    { name: 'Nord-Kivu', x: 58, y: 38, w: 8, h: 6 },
    { name: 'Sud-Kivu', x: 55, y: 45, w: 8, h: 6 },
    { name: 'Maniema', x: 52, y: 42, w: 8, h: 8 },
    { name: 'Tshopo', x: 55, y: 32, w: 8, h: 8 },
    { name: 'Tshuapa', x: 42, y: 35, w: 10, h: 8 },
    { name: 'Equateur', x: 38, y: 28, w: 10, h: 8 },
    { name: 'Mongala', x: 45, y: 20, w: 10, h: 8 },
    { name: 'Nord-Ubangi', x: 40, y: 18, w: 8, h: 6 },
    { name: 'Sud-Ubangi', x: 38, y: 25, w: 8, h: 6 },
    { name: 'Kwilu', x: 32, y: 45, w: 8, h: 8 },
    { name: 'Kwango', x: 28, y: 50, w: 8, h: 8 },
    { name: 'Kasai', x: 38, y: 48, w: 8, h: 8 },
    { name: 'Kasai-Central', x: 35, y: 52, w: 8, h: 6 },
    { name: 'Kasai-Oriental', x: 42, y: 50, w: 8, h: 6 },
    { name: 'Lomami', x: 45, y: 52, w: 8, h: 6 },
    { name: 'Sankuru', x: 48, y: 45, w: 8, h: 8 },
    { name: 'Lualaba', x: 48, y: 55, w: 10, h: 8 },
    { name: 'Haut-Katanga', x: 55, y: 55, w: 10, h: 8 },
    { name: 'Haut-Lomami', x: 50, y: 50, w: 8, h: 6 },
    { name: 'Tanganyika', x: 52, y: 58, w: 8, h: 6 },
    { name: 'Mai-Ndombe', x: 35, y: 40, w: 10, h: 8 },
  ];

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <svg viewBox="0 0 100 80" className="w-full h-auto">
        {/* Fond */}
        <rect x="0" y="0" width="100" height="80" fill="#f3f4f6" rx="4" />

        {/* Provinces */}
        {provinces.map((prov) => {
          const data = provinceData.find(p => 
            p.province?.toLowerCase().includes(prov.name.toLowerCase()) ||
            prov.name.toLowerCase().includes(p.province?.toLowerCase())
          );
          const value = data ? (type === 'births' ? data.births : data.deaths) : 0;
          const color = getColor(value, maxValue);

          return (
            <g key={prov.name}>
              <rect
                x={prov.x}
                y={prov.y}
                width={prov.w}
                height={prov.h}
                fill={color}
                stroke="white"
                strokeWidth="0.3"
                rx="1"
                className="hover:opacity-80 transition-opacity cursor-pointer"
              >
                <title>{prov.name}: {value} {type === 'births' ? 'naissances' : 'décès'}</title>
              </rect>
              <text
                x={prov.x + prov.w / 2}
                y={prov.y + prov.h / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="2"
                fill={value > maxValue * 0.5 ? 'white' : '#374151'}
                fontWeight="bold"
              >
                {value > 0 ? value : ''}
              </text>
            </g>
          );
        })}

        {/* Légende */}
        <text x="50" y="75" textAnchor="middle" fontSize="3" fill="#6b7280">
          Carte indicative - République Démocratique du Congo
        </text>
      </svg>

      {/* Légende couleurs */}
      <div className="flex items-center justify-center gap-4 mt-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ background: type === 'births' ? 'rgba(59,130,246,0.3)' : 'rgba(107,114,128,0.3)' }} />
          <span className="text-gray-600 dark:text-gray-400">Faible</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ background: type === 'births' ? 'rgba(59,130,246,0.6)' : 'rgba(107,114,128,0.6)' }} />
          <span className="text-gray-600 dark:text-gray-400">Moyen</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ background: type === 'births' ? 'rgba(59,130,246,1)' : 'rgba(107,114,128,1)' }} />
          <span className="text-gray-600 dark:text-gray-400">Élevé</span>
        </div>
      </div>
    </div>
  );
};

// Illustration naissance
const BirthIllustration = () => (
  <div className="flex flex-col items-center">
    <svg viewBox="0 0 200 200" className="w-48 h-48">
      {/* Cercle fond */}
      <circle cx="100" cy="100" r="90" fill="#dbeafe" />
      {/* Bébé stylisé */}
      <circle cx="100" cy="70" r="25" fill="#3b82f6" opacity="0.8" />
      <ellipse cx="100" cy="120" rx="35" ry="40" fill="#60a5fa" opacity="0.6" />
      {/* Bras */}
      <ellipse cx="65" cy="110" rx="12" ry="25" fill="#93c5fd" opacity="0.5" transform="rotate(-20 65 110)" />
      <ellipse cx="135" cy="110" rx="12" ry="25" fill="#93c5fd" opacity="0.5" transform="rotate(20 135 110)" />
      {/* Jambes */}
      <ellipse cx="85" cy="155" rx="10" ry="20" fill="#93c5fd" opacity="0.5" />
      <ellipse cx="115" cy="155" rx="10" ry="20" fill="#93c5fd" opacity="0.5" />
      {/* Visage */}
      <circle cx="92" cy="65" r="3" fill="white" />
      <circle cx="108" cy="65" r="3" fill="white" />
      <path d="M95 75 Q100 80 105 75" stroke="white" strokeWidth="2" fill="none" />
      {/* Étoiles */}
      <circle cx="40" cy="50" r="4" fill="#fbbf24" opacity="0.8">
        <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx="160" cy="45" r="3" fill="#fbbf24" opacity="0.6">
        <animate attributeName="opacity" values="0.6;0.2;0.6" dur="1.5s" repeatCount="indefinite" />
      </circle>
      <circle cx="150" cy="150" r="4" fill="#fbbf24" opacity="0.7">
        <animate attributeName="opacity" values="0.7;0.3;0.7" dur="2.5s" repeatCount="indefinite" />
      </circle>
    </svg>
    <p className="text-blue-600 dark:text-blue-400 font-semibold mt-2">Nouvelle vie</p>
  </div>
);

// Illustration décès
const DeathIllustration = () => (
  <div className="flex flex-col items-center">
    <svg viewBox="0 0 200 200" className="w-48 h-48">
      {/* Cercle fond */}
      <circle cx="100" cy="100" r="90" fill="#f3f4f6" />
      {/* Croix */}
      <rect x="85" y="40" width="30" height="80" rx="5" fill="#6b7280" opacity="0.8" />
      <rect x="60" y="65" width="80" height="30" rx="5" fill="#6b7280" opacity="0.8" />
      {/* Cercle autour */}
      <circle cx="100" cy="100" r="70" stroke="#9ca3af" strokeWidth="2" fill="none" strokeDasharray="8 4">
        <animateTransform attributeName="transform" type="rotate" from="0 100 100" to="360 100 100" dur="20s" repeatCount="indefinite" />
      </circle>
      {/* Bougies */}
      <rect x="45" y="130" width="6" height="25" fill="#d1d5db" rx="2" />
      <ellipse cx="48" cy="128" rx="4" ry="6" fill="#fbbf24">
        <animate attributeName="ry" values="6;5;6" dur="0.5s" repeatCount="indefinite" />
      </ellipse>
      <rect x="149" y="130" width="6" height="25" fill="#d1d5db" rx="2" />
      <ellipse cx="152" cy="128" rx="4" ry="6" fill="#fbbf24">
        <animate attributeName="ry" values="6;5;6" dur="0.7s" repeatCount="indefinite" />
      </ellipse>
    </svg>
    <p className="text-gray-600 dark:text-gray-400 font-semibold mt-2">Deuil et mémoire</p>
  </div>
);

const PublicationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [publication, setPublication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview'); // overview | births | deaths

  useEffect(() => {
    fetchPublication();
  }, [id]);

  const fetchPublication = async () => {
    try {
      setLoading(true);
      const response = await publicationAPI.getPublication(id);
      setPublication(response.data);
    } catch (err) {
      console.error('Erreur chargement publication:', err);
      setError('Impossible de charger cette publication');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  };

  const getPeriodLabel = (type) => {
    const labels = { day: 'Jour', week: 'Semaine', month: 'Mois', year: 'Année' };
    return labels[type] || type;
  };

  const getGeoLabel = () => {
    if (!publication) return '';
    if (publication.geo_level === 'national') return 'National';
    if (publication.commune) return `${publication.commune}, ${publication.city || ''}`;
    if (publication.city) return publication.city;
    if (publication.province) return publication.province;
    return 'National';
  };

  // Données pour graphiques
  const genderBirthData = [
    { name: 'Garçons', value: publication?.male_births || 0, color: '#3b82f6' },
    { name: 'Filles', value: publication?.female_births || 0, color: '#ec4899' },
  ];

  const genderDeathData = [
    { name: 'Hommes', value: publication?.male_deaths || 0, color: '#6b7280' },
    { name: 'Femmes', value: publication?.female_deaths || 0, color: '#9ca3af' },
  ];

  const compareData = [
    { name: 'Naissances', value: publication?.total_births || 0, color: '#3b82f6' },
    { name: 'Décès', value: publication?.total_deaths || 0, color: '#6b7280' },
  ];

  const provinceChartData = publication?.data?.by_province?.slice(0, 10).map(p => ({
    name: p.province.length > 12 ? p.province.substring(0, 12) + '...' : p.province,
    naissances: p.births,
    deces: p.deaths,
  })) || [];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-3 shadow-xl">
          <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-gray-600 dark:text-gray-400">{entry.name}:</span>
              <span className="font-semibold text-gray-900 dark:text-white">{entry.value?.toLocaleString()}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Chargement de la publication...</p>
        </div>
      </div>
    );
  }

  if (error || !publication) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-8 max-w-md text-center">
          <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-700 dark:text-red-400 mb-2">Publication introuvable</h2>
          <p className="text-red-600 dark:text-red-400 mb-6">{error || 'Cette publication n\'existe pas ou a été supprimée.'}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header sticky */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Retour</span>
            </button>
            <div className="flex items-center gap-3">
              <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" title="Imprimer">
                <Printer className="w-5 h-5 text-gray-500" />
              </button>
              <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" title="Partager">
                <Share2 className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hero */}
        <section className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden">
          {/* Motif décoratif */}
          <div className="absolute inset-0 opacity-10">
            <svg width="100%" height="100%">
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="20" cy="20" r="1.5" fill="white" />
              </pattern>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          <div className="relative z-10">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
                {getPeriodLabel(publication.period_type)}
              </span>
              <span className="px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {getGeoLabel()}
              </span>
              <span className="px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formatDate(publication.period_start)} — {formatDate(publication.period_end)}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">{publication.title}</h1>
            {publication.description && (
              <p className="text-indigo-100 text-lg max-w-3xl">{publication.description}</p>
            )}

            <div className="flex items-center gap-2 mt-6 text-indigo-200 text-sm">
              <Clock className="w-4 h-4" />
              <span>Publié le {formatDate(publication.published_at)}</span>
              {publication.published_by_name && (
                <>
                  <span>•</span>
                  <span>Par {publication.published_by_name}</span>
                </>
              )}
            </div>
          </div>
        </section>

        {/* KPI Cards avec compteurs animés */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 hover:shadow-xl transition-all hover:scale-[1.02]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                <Baby className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  <AnimatedCounter target={publication.total_births} />
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Naissances</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-blue-600 dark:text-blue-400 font-medium">♂ {publication.male_births}</span>
              <span className="text-pink-600 dark:text-pink-400 font-medium">♀ {publication.female_births}</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 hover:shadow-xl transition-all hover:scale-[1.02]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center">
                <Skull className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  <AnimatedCounter target={publication.total_deaths} />
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Décès</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-gray-600 dark:text-gray-400 font-medium">♂ {publication.male_deaths}</span>
              <span className="text-gray-500 dark:text-gray-500 font-medium">♀ {publication.female_deaths}</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 hover:shadow-xl transition-all hover:scale-[1.02]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  <AnimatedCounter target={publication.total_births + publication.total_deaths} />
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total événements</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span className="text-emerald-600 dark:text-emerald-400">Actes civils enregistrés</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 hover:shadow-xl transition-all hover:scale-[1.02]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {publication.total_deaths > 0 
                    ? (publication.total_births / publication.total_deaths).toFixed(2) 
                    : '—'}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Ratio N/D</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              {publication.total_births > publication.total_deaths ? (
                <>
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400">Croissance démographique</span>
                </>
              ) : (
                <>
                  <TrendingDown className="w-4 h-4 text-red-500" />
                  <span className="text-red-600 dark:text-red-400">Déclin démographique</span>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Onglets */}
        <div className="flex gap-2 bg-white dark:bg-gray-900 rounded-xl p-2 border border-gray-200 dark:border-gray-800">
          {[
            { id: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
            { id: 'births', label: 'Naissances', icon: Baby },
            { id: 'deaths', label: 'Décès', icon: Skull },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Contenu selon l'onglet */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fade-in">
            {/* Graphique comparatif */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-indigo-600" />
                Comparatif naissances / décès
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6">Répartition globale des actes d'état civil</p>
              <div className="grid lg:grid-cols-2 gap-8">
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={compareData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        label={({name, percent}) => `${name} ${(percent * 100).toFixed(1)}%`}
                      >
                        {compareData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-col justify-center space-y-6">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <Baby className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                      <span className="text-4xl font-bold text-blue-600 dark:text-blue-400">{publication.total_births?.toLocaleString()}</span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">Naissances déclarées</p>
                    <div className="mt-3 h-2 bg-blue-200 dark:bg-blue-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-600 rounded-full transition-all duration-1000"
                        style={{ width: `${publication.total_births + publication.total_deaths > 0 ? (publication.total_births / (publication.total_births + publication.total_deaths) * 100) : 0}%` }}
                      />
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <Skull className="w-8 h-8 text-gray-600 dark:text-gray-400" />
                      <span className="text-4xl font-bold text-gray-600 dark:text-gray-400">{publication.total_deaths?.toLocaleString()}</span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">Décès déclarés</p>
                    <div className="mt-3 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gray-600 rounded-full transition-all duration-1000"
                        style={{ width: `${publication.total_births + publication.total_deaths > 0 ? (publication.total_deaths / (publication.total_births + publication.total_deaths) * 100) : 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Cartes par province */}
            {publication.data?.by_province && publication.data.by_province.length > 0 && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <MapIcon className="w-6 h-6 text-indigo-600" />
                  Répartition géographique
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mb-6">Carte indicative des naissances et décès par province</p>

                <div className="grid lg:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-4 text-center">Naissances par province</h3>
                    <RDCCard provinceData={publication.data.by_province} type="births" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-4 text-center">Décès par province</h3>
                    <RDCCard provinceData={publication.data.by_province} type="deaths" />
                  </div>
                </div>
              </div>
            )}

            {/* Tableau des provinces */}
            {publication.data?.by_province && publication.data.by_province.length > 0 && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Détail par province</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Rang</th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Province</th>
                        <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Naissances</th>
                        <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Décès</th>
                        <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {publication.data.by_province.map((prov, i) => (
                        <tr key={prov.province} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                              {i + 1}
                            </div>
                          </td>
                          <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{prov.province}</td>
                          <td className="px-6 py-4 text-right text-blue-600 dark:text-blue-400 font-semibold">{prov.births?.toLocaleString()}</td>
                          <td className="px-6 py-4 text-right text-gray-600 dark:text-gray-400 font-semibold">{prov.deaths?.toLocaleString()}</td>
                          <td className="px-6 py-4 text-right font-bold text-gray-900 dark:text-white">{(prov.births + prov.deaths)?.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'births' && (
          <div className="space-y-8 animate-fade-in">
            {/* Illustration + stats */}
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 flex items-center justify-center">
                <BirthIllustration />
              </div>
              <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Répartition par sexe</h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={genderBirthData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        label={({name, value, percent}) => `${name}: ${value} (${(percent * 100).toFixed(1)}%)`}
                      >
                        {genderBirthData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{publication.male_births?.toLocaleString()}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Garçons</p>
                  </div>
                  <div className="text-center p-4 bg-pink-50 dark:bg-pink-900/20 rounded-xl">
                    <p className="text-3xl font-bold text-pink-600 dark:text-pink-400">{publication.female_births?.toLocaleString()}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Filles</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Graphique barres naissances par province */}
            {provinceChartData.length > 0 && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Naissances par province (Top 10)</h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={provinceChartData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                      <XAxis type="number" stroke="#9ca3af" />
                      <YAxis dataKey="name" type="category" stroke="#9ca3af" width={100} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="naissances" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'deaths' && (
          <div className="space-y-8 animate-fade-in">
            {/* Illustration + stats */}
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 flex items-center justify-center">
                <DeathIllustration />
              </div>
              <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Répartition par sexe</h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={genderDeathData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        label={({name, value, percent}) => `${name}: ${value} (${(percent * 100).toFixed(1)}%)`}
                      >
                        {genderDeathData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="text-center p-4 bg-gray-100 dark:bg-gray-800 rounded-xl">
                    <p className="text-3xl font-bold text-gray-700 dark:text-gray-300">{publication.male_deaths?.toLocaleString()}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Hommes</p>
                  </div>
                  <div className="text-center p-4 bg-gray-100 dark:bg-gray-800 rounded-xl">
                    <p className="text-3xl font-bold text-gray-500 dark:text-gray-500">{publication.female_deaths?.toLocaleString()}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Femmes</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Graphique barres décès par province */}
            {provinceChartData.length > 0 && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Décès par province (Top 10)</h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={provinceChartData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                      <XAxis type="number" stroke="#9ca3af" />
                      <YAxis dataKey="name" type="category" stroke="#9ca3af" width={100} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="deces" fill="#6b7280" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <footer className="text-center py-8 border-t border-gray-200 dark:border-gray-800">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Publication officielle de Care-Link RDC • Données issues du système d'état civil numérique
          </p>
          <p className="text-gray-400 dark:text-gray-600 text-xs mt-2">
            ID: {publication.publication_id} • {formatDate(publication.published_at)}
          </p>
        </footer>
      </main>
    </div>
  );
};

export default PublicationDetail;