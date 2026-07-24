import React from 'react';
import Header from './Header';
import Footer from './Footer';
import HeroSection from './HeroSection';
import FeaturesShowcase from './FeaturesShowcase';
import StatsSection from './StatsSection';
import PublicationsSection from './PublicationsSection';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 overflow-x-hidden">
      <Header />
      <main>
        {/* 1. Accroche immédiate - valeur proposition */}
        <HeroSection />
        
        {/* 2. Démonstration des fonctionnalités */}
        <FeaturesShowcase />
        
        {/* 3. Preuve sociale et crédibilité (stats) */}
        <StatsSection />
        
        {/* 4. Actualités et contenu frais */}
        <PublicationsSection />
        
        {/* 5. Call-to-Action final pour convertir les visiteurs */}
        <section className="relative py-20 overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-violet-600 to-indigo-800" />
          
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-72 h-72 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
          
          <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
              Prêt à rejoindre la révolution
              <span className="block text-indigo-200">de l'état civil en RDC ?</span>
            </h2>
            <p className="text-indigo-100 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
              Rejoignez plus de 50 000 citoyens et 200 hôpitaux partenaires qui utilisent déjà Care-Link RDC pour sécuriser leurs documents d'état civil.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="/inscription"
                className="px-8 py-4 bg-white text-indigo-600 rounded-xl font-semibold text-lg hover:shadow-xl hover:shadow-white/20 transition-all hover:scale-105"
              >
                Créer un compte gratuit
              </a>
              <a
                href="/guide"
                className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-xl font-semibold text-lg hover:bg-white/20 transition-all"
              >
                En savoir plus
              </a>
            </div>
            <p className="text-indigo-200/70 text-sm mt-6">
              Gratuit pour les citoyens • Sans engagement
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;