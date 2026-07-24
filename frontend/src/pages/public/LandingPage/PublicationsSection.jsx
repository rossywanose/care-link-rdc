import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';  // ← AJOUTÉ
import { useLanguage } from '../../../context/LanguageContext';
import { publicationAPI } from '../../../services/publicationService';
import {
  FileText, Calendar, MapPin, Baby, Skull,
  TrendingUp, ChevronRight, Loader2, Newspaper
} from 'lucide-react';

const PublicationsSection = () => {
  const { t } = useLanguage();
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedPub, setExpandedPub] = useState(null);

  useEffect(() => {
    fetchPublications();
  }, []);

  const fetchPublications = async () => {
    try {
      setLoading(true);
      const response = await publicationAPI.getPublications();
      const data = response.data.results || response.data || [];
      setPublications(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(t('landing.publications.error') || 'Impossible de charger les publications');
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
    const labels = { day: 'Jour', week: 'Semaine', month: 'Mois', year: 'Annee' };
    return labels[type] || type;
  };

  const getGeoLabel = (pub) => {
    if (pub.geo_level === 'national') return 'National';
    if (pub.commune) return `${pub.commune}, ${pub.city || ''}`;
    if (pub.city) return pub.city;
    if (pub.province) return pub.province;
    return 'National';
  };

  if (loading) {
    return (
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 flex justify-center">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 text-center text-red-500">{error}</div>
      </section>
    );
  }

  if (publications.length === 0) return null;

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-sm font-medium mb-4">
            <Newspaper className="w-4 h-4" />
            Publications officielles
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Publications statistiques
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Consultez les rapports officiels sur les naissances et deces en RDC
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {publications.slice(0, 6).map((pub) => (
            <div
              key={pub.id}
              onClick={() => setExpandedPub(expandedPub === pub.id ? null : pub.id)}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-all cursor-pointer hover:scale-[1.02] group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-medium">
                  {getPeriodLabel(pub.period_type)}
                </span>
              </div>

              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                {pub.title}
              </h3>

              <div className="flex flex-wrap gap-3 text-sm text-gray-500 dark:text-gray-400 mb-4">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {formatDate(pub.period_start)} — {formatDate(pub.period_end)}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {getGeoLabel(pub)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Baby className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {pub.total_births?.toLocaleString() || 0}
                    </span>
                  </div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">Naissances</span>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Skull className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <span className="text-lg font-bold text-gray-600 dark:text-gray-400">
                      {pub.total_deaths?.toLocaleString() || 0}
                    </span>
                  </div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">Deces</span>
                </div>
              </div>

              {expandedPub === pub.id && pub.data?.by_province && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 animate-fade-in">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Par province
                  </h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {pub.data.by_province.slice(0, 5).map((prov, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">{prov.province}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-blue-600 dark:text-blue-400 font-medium">{prov.births}</span>
                          <span className="text-gray-500 dark:text-gray-500">{prov.deaths}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {formatDate(pub.published_at)}
                </span>
                <Link 
                  to={`/publication/${pub.id}`}
                  className="flex items-center gap-1 text-sm text-indigo-600 dark:text-indigo-400 font-medium group-hover:gap-2 transition-all"
                  onClick={(e) => e.stopPropagation()}
                >
                  Voir <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {publications.length > 6 && (
          <div className="text-center mt-10">
            <button className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors">
              <TrendingUp className="w-5 h-5" />
              Voir toutes les publications
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default PublicationsSection;