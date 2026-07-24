import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Home, 
  ArrowLeft, 
  Search, 
  AlertTriangle,
  MapPin,
  FileText,
  HelpCircle
} from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  const quickLinks = [
    { icon: Home, label: 'Accueil', path: '/', description: 'Retour à la page d\'accueil' },
    { icon: FileText, label: 'Documentation API', path: '/docs/api', description: 'Guide de l\'API' },
    { icon: HelpCircle, label: 'Aide', path: '/contact', description: 'Centre d\'aide' },
    { icon: MapPin, label: 'Hôpitaux', path: '/hopitaux', description: 'Trouver un hôpital' },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full text-center">
        {/* Animated 404 */}
        <div className="relative mb-8">
          <div className="text-[150px] md:text-[200px] font-black leading-none tracking-tighter
            bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-600 
            bg-clip-text text-transparent animate-pulse">
            404
          </div>
          {/* Floating elements */}
          <div className="absolute top-4 left-1/4 w-3 h-3 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
          <div className="absolute top-12 right-1/4 w-2 h-2 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
          <div className="absolute bottom-8 left-1/3 w-2.5 h-2.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
        </div>

        {/* Icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full 
          bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-900/30 dark:to-violet-900/30
          mb-6">
          <AlertTriangle className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Page introuvable
        </h1>

        {/* Description */}
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-2 max-w-md mx-auto">
          Oups ! La page que vous recherchez semble avoir disparu dans le cyberespace.
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500 mb-10">
          Elle a peut-être été déplacée, renommée ou n'a jamais existé.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 
              bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700
              text-gray-700 dark:text-gray-300 rounded-xl font-medium
              hover:border-indigo-500 hover:text-indigo-600 dark:hover:border-indigo-400 dark:hover:text-indigo-400
              transition-all duration-300 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Retour
          </button>

          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 
              bg-gradient-to-r from-indigo-600 to-violet-600 
              text-white rounded-xl font-medium
              hover:from-indigo-700 hover:to-violet-700 
              hover:shadow-lg hover:shadow-indigo-500/25
              transition-all duration-300"
          >
            <Home className="w-5 h-5" />
            Accueil
          </Link>
        </div>

        {/* Quick Links */}
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-6 md:p-8">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Search className="w-5 h-5 text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Pages populaires
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {quickLinks.map((link, index) => (
              <Link
                key={index}
                to={link.path}
                className="flex items-center gap-3 p-4 rounded-xl 
                  bg-white dark:bg-gray-800 
                  border border-gray-100 dark:border-gray-700
                  hover:border-indigo-300 dark:hover:border-indigo-700
                  hover:shadow-md hover:shadow-indigo-500/10
                  transition-all duration-300 group"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-lg 
                  bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-900/30 dark:to-violet-900/30
                  flex items-center justify-center 
                  group-hover:from-indigo-100 group-hover:to-violet-100
                  transition-all duration-300">
                  <link.icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900 dark:text-white text-sm">
                    {link.label}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {link.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Footer hint */}
        <p className="mt-8 text-xs text-gray-400 dark:text-gray-600">
          Si vous pensez qu'il s'agit d'une erreur,{' '}
          <Link to="/contact" className="text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 underline">
            contactez notre équipe
          </Link>
          .
        </p>
      </div>
    </div>
  );
};

export default NotFound;