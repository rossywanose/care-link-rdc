import React from 'react';
import { Eye, Keyboard, Monitor, Volume2, ZoomIn, HelpCircle, CheckCircle } from 'lucide-react';
import Header from '../LandingPage/Header';
import Footer from '../LandingPage/Footer';

const Accessibilite = () => {
  const features = [
    {
      icon: Eye,
      title: 'Contraste et lisibilite',
      description: 'La plateforme respecte les ratios de contraste WCAG 2.1 AA. Les textes sont lisibles et les elements interactifs sont clairement identifiables.',
      status: 'Conforme'
    },
    {
      icon: Keyboard,
      title: 'Navigation clavier',
      description: 'Toutes les fonctionnalites sont accessibles sans souris. La navigation par tabulation est optimisee avec des indicateurs de focus visibles.',
      status: 'Conforme'
    },
    {
      icon: Monitor,
      title: 'Compatibilite lecteurs d\'ecran',
      description: 'La plateforme est compatible avec les lecteurs d\'ecran (NVDA, JAWS, VoiceOver). Les images ont des textes alternatifs et la structure est semantique.',
      status: 'Conforme'
    },
    {
      icon: ZoomIn,
      title: 'Zoom et redimensionnement',
      description: 'La plateforme fonctionne correctement jusqu\'a un zoom de 200%. La mise en page s\'adapte automatiquement aux differentes tailles d\'ecran.',
      status: 'Conforme'
    },
    {
      icon: Volume2,
      title: 'Contenu multimedia',
      description: 'Les videos et contenus audio possedent des sous-titres et transcriptions. Aucun contenu ne depend uniquement de la couleur ou du son.',
      status: 'Conforme'
    }
  ];

  const shortcuts = [
    { key: 'Tab', action: 'Naviguer entre les elements' },
    { key: 'Entree', action: 'Activer un bouton ou un lien' },
    { key: 'Echap', action: 'Fermer une modal ou un menu' },
    { key: 'Ctrl + +', action: 'Zoomer sur la page' },
    { key: 'Ctrl + -', action: 'Dezoomer la page' },
    { key: 'Ctrl + 0', action: 'Reinitialiser le zoom' },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Header />

      <section className="pt-32 pb-16 bg-gradient-to-br from-indigo-600 via-violet-600 to-indigo-700 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5 mb-6">
            <Eye className="w-4 h-4 text-white" />
            <span className="text-sm font-medium text-white">Accessibilite</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            Accessibilite
          </h1>
          <p className="text-lg text-indigo-100">
            Care-Link RDC s'engage pour une plateforme accessible a tous
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-12 leading-relaxed">
              Care-Link RDC s'engage a rendre sa plateforme accessible au plus grand nombre, 
              conformement aux standards WCAG 2.1 niveau AA. Nous travaillons continuellement 
              a ameliorer l'accessibilite de nos services.
            </p>

            {/* Accessibility Features */}
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
              Fonctionnalites d'accessibilite
            </h2>
            <div className="space-y-6 mb-12">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                      <feature.icon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {feature.title}
                        </h3>
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-full">
                          <CheckCircle className="w-3 h-3" />
                          {feature.status}
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Keyboard Shortcuts */}
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
              Raccourcis clavier
            </h2>
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-12">
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {shortcuts.map((shortcut, index) => (
                  <div key={index} className="flex items-center justify-between px-6 py-4">
                    <span className="text-gray-600 dark:text-gray-300">{shortcut.action}</span>
                    <kbd className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm font-mono text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">
                      {shortcut.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div className="bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20 rounded-2xl p-8 border border-indigo-200 dark:border-indigo-800">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <HelpCircle className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                    Signaler un probleme d'accessibilite
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Si vous rencontrez des difficultes d'accessibilite, contactez-nous. 
                    Nous nous engageons a repondre dans les 48 heures ouvrables.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <a 
                      href="mailto:accessibilite@carelink-rdc.cd"
                      className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all"
                    >
                      accessibilite@carelink-rdc.cd
                    </a>
                    <a 
                      href="tel:+243812345678"
                      className="inline-flex items-center justify-center gap-2 border-2 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 px-6 py-3 rounded-xl font-medium hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all"
                    >
                      +243 81 234 5678
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Accessibilite;
