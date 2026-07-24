import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BarChart3 } from 'lucide-react';

const HeroSection = () => {
  const navigate = useNavigate();

  const scrollToSection = (href) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="hero" className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-indigo-500/5 to-violet-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 rounded-full px-4 py-1.5 mb-8">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
              Plateforme officielle de la RDC
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-gray-900 dark:text-white leading-tight mb-6">
            Gestion des{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent">
              Certificats
            </span>
            <br />
            en Republique Democratique du Congo
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Enregistrez, validez et gerez les certificats de naissance et de deces 
            en toute securite. Une solution moderne pour un Congo connecte.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <button 
              onClick={() => navigate('/inscription')}
              className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-xl hover:shadow-indigo-500/30 transition-all hover:scale-105"
            >
              Commencer gratuitement
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => scrollToSection('#steps')}
              className="inline-flex items-center justify-center gap-2 border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-8 py-4 rounded-xl text-lg font-semibold hover:border-indigo-500 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
            >
              Voir comment ca marche
            </button>
          </div>

          {/* Hero Image / Dashboard Preview */}
          <div className="relative max-w-5xl mx-auto">
            <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/20 to-violet-500/20 rounded-2xl blur-2xl" />
            <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
              {/* Browser Chrome */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="bg-white dark:bg-gray-800 rounded-md px-3 py-1 text-xs text-gray-500 dark:text-gray-400 text-center border border-gray-200 dark:border-gray-700">
                    care-link-rdc.gov.cd
                  </div>
                </div>
              </div>
              {/* Dashboard Preview Content */}
              <div className="p-6 lg:p-8 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Stats Cards */}
                  <div className="lg:col-span-3 grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { label: 'Naissances', value: '1,234', color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
                      { label: 'Deces', value: '456', color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' },
                      { label: 'En attente', value: '23', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
                      { label: 'Valides', value: '1,667', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
                    ].map((stat, i) => (
                      <div key={i} className={`${stat.bg} rounded-xl p-4 border border-gray-200 dark:border-gray-800`}>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{stat.label}</p>
                        <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                      </div>
                    ))}
                  </div>
                  {/* Chart Placeholder */}
                  <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Statistiques mensuelles</h4>
                      <BarChart3 className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="flex items-end gap-2 h-32">
                      {[40, 65, 45, 80, 55, 90, 70, 85, 60, 75, 50, 95].map((h, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                          <div 
                            className="w-full bg-gradient-to-t from-indigo-500 to-violet-500 rounded-t-md opacity-80 hover:opacity-100 transition-opacity"
                            style={{ height: `${h}%` }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Recent Activity */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">Activite recente</h4>
                    <div className="space-y-3">
                      {[
                        { action: 'Naissance enregistree', time: '2 min', color: 'bg-indigo-500' },
                        { action: 'Certificat valide', time: '5 min', color: 'bg-emerald-500' },
                        { action: 'Paiement recu', time: '12 min', color: 'bg-amber-500' },
                        { action: 'Deces enregistre', time: '1h', color: 'bg-red-500' },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${item.color}`} />
                          <div className="flex-1">
                            <p className="text-xs text-gray-700 dark:text-gray-300">{item.action}</p>
                          </div>
                          <span className="text-xs text-gray-400">{item.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
