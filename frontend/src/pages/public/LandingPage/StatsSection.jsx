import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Building2, Users, FileCheck, TrendingUp } from 'lucide-react';

const StatsSection = () => {
  const navigate = useNavigate();

  const stats = [
    { icon: Building2, value: '50+', label: 'Hopitaux partenaires', suffix: '' },
    { icon: Users, value: '10K+', label: 'Citoyens enregistres', suffix: '' },
    { icon: FileCheck, value: '25K+', label: 'Certificats delivres', suffix: '' },
    { icon: TrendingUp, value: '99.9', label: 'Disponibilite du service', suffix: '%' },
  ];

  return (
    <>
      {/* Stats */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl mb-4">
                  <stat.icon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-1">
                  {stat.value}<span className="text-indigo-600 dark:text-indigo-400">{stat.suffix}</span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-24 lg:py-32 bg-indigo-600 dark:bg-indigo-900 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">
            Pret a moderniser la gestion des certificats ?
          </h2>
          <p className="text-lg text-indigo-100 mb-10 max-w-2xl mx-auto">
            Rejoignez les hopitaux, citoyens et autorites qui utilisent deja Care-Link RDC au quotidien.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate('/inscription')}
              className="inline-flex items-center justify-center gap-2 bg-white text-indigo-600 px-8 py-4 rounded-lg text-lg font-semibold hover:shadow-xl transition-all hover:scale-105"
            >
              Creer un compte gratuit
              <ArrowRight className="w-5 h-5" />
            </button>
            <button 
              onClick={() => navigate('/connexion')}
              className="inline-flex items-center justify-center gap-2 border-2 border-white/30 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white/10 transition-all"
            >
              Se connecter
            </button>
          </div>
          <p className="mt-8 text-sm text-indigo-200">
            Gratuit pour les citoyens · Plans a partir de 50$/mois pour les hopitaux
          </p>
        </div>
      </section>
    </>
  );
};

export default StatsSection;