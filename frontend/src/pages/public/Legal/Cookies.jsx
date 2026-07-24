import React, { useState } from 'react';
import { Cookie, Settings, CheckCircle, XCircle, Info } from 'lucide-react';
import Header from '../LandingPage/Header';
import Footer from '../LandingPage/Footer';

const Cookies = () => {
  const [preferences, setPreferences] = useState({
    necessaires: true,
    fonctionnels: true,
    analytiques: false,
    marketing: false
  });

  const cookieTypes = [
    {
      id: 'necessaires',
      icon: CheckCircle,
      title: 'Cookies necessaires',
      description: 'Ces cookies sont indispensables au fonctionnement de la plateforme. Ils permettent l\'authentification, la securite et les fonctionnalites de base. Ils ne peuvent pas etre desactives.',
      required: true
    },
    {
      id: 'fonctionnels',
      icon: Settings,
      title: 'Cookies fonctionnels',
      description: 'Ces cookies permettent de memoriser vos preferences (langue, theme, etc.) et d\'ameliorer votre experience utilisateur.',
      required: false
    },
    {
      id: 'analytiques',
      icon: Info,
      title: 'Cookies analytiques',
      description: 'Ces cookies nous aident a comprendre comment vous utilisez la plateforme afin d\'ameliorer nos services. Les donnees sont anonymisees.',
      required: false
    },
    {
      id: 'marketing',
      icon: Cookie,
      title: 'Cookies marketing',
      description: 'Ces cookies sont utilises pour vous proposer du contenu personnalise et des communications pertinentes.',
      required: false
    }
  ];

  const togglePreference = (id) => {
    if (cookieTypes.find(c => c.id === id)?.required) return;
    setPreferences(prev => ({ ...prev, [id]: !prev[id] }));
  };

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
            <Cookie className="w-4 h-4 text-white" />
            <span className="text-sm font-medium text-white">Gestion des cookies</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            Politique des Cookies
          </h1>
          <p className="text-lg text-indigo-100">
            Controlez vos preferences de cookies
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-12 leading-relaxed">
              Care-Link RDC utilise des cookies pour ameliorer votre experience. 
              Vous pouvez personnaliser vos preferences ci-dessous. Les cookies necessaires ne peuvent pas etre desactives.
            </p>

            {/* Cookie Preferences */}
            <div className="space-y-6 mb-12">
              {cookieTypes.map((cookie) => (
                <div 
                  key={cookie.id}
                  className={`bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 ${
                    cookie.required ? 'opacity-75' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                      <cookie.icon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {cookie.title}
                        </h3>
                        <button
                          onClick={() => togglePreference(cookie.id)}
                          disabled={cookie.required}
                          className={`relative w-14 h-7 rounded-full transition-colors ${
                            preferences[cookie.id] 
                              ? 'bg-gradient-to-r from-indigo-600 to-violet-600' 
                              : 'bg-gray-300 dark:bg-gray-600'
                          } ${cookie.required ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                            preferences[cookie.id] ? 'translate-x-7' : 'translate-x-0.5'
                          }`} />
                        </button>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                        {cookie.description}
                      </p>
                      {cookie.required && (
                        <span className="inline-flex items-center gap-1 mt-2 text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                          <CheckCircle className="w-3 h-3" />
                          Obligatoire
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Save Button */}
            <div className="flex justify-center">
              <button 
                onClick={() => alert('Preferences sauvegardees !')}
                className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-8 py-4 rounded-xl font-medium hover:shadow-lg transition-all hover:scale-105"
              >
                Sauvegarder mes preferences
              </button>
            </div>

            {/* Info */}
            <div className="mt-12 bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Plus d'informations</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Pour en savoir plus sur l'utilisation des cookies, consultez notre 
                    <button onClick={() => navigate('/confidentialite')} className="text-indigo-600 dark:text-indigo-400 hover:underline mx-1">politique de confidentialite</button>.
                    Vous pouvez modifier vos preferences a tout moment dans les parametres de votre compte.
                  </p>
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

export default Cookies;
