import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ServerCrash, 
  Home, 
  RefreshCw,
  AlertOctagon
} from 'lucide-react';

const ServerError = () => {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full text-center">
        {/* Animated 500 */}
        <div className="relative mb-8">
          <div className="text-[150px] md:text-[200px] font-black leading-none tracking-tighter
            bg-gradient-to-br from-red-500 via-rose-500 to-pink-500 
            bg-clip-text text-transparent">
            500
          </div>
          <div className="absolute top-4 left-1/4 w-3 h-3 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
          <div className="absolute top-12 right-1/4 w-2 h-2 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
          <div className="absolute bottom-8 left-1/3 w-2.5 h-2.5 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
        </div>

        {/* Icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full 
          bg-gradient-to-br from-red-100 to-rose-100 dark:from-red-900/30 dark:to-rose-900/30
          mb-6">
          <ServerCrash className="w-10 h-10 text-red-600 dark:text-red-400" />
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Erreur serveur
        </h1>

        {/* Description */}
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-2 max-w-md mx-auto">
          Oups ! Notre serveur a rencontré un problème inattendu.
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500 mb-10">
            Notre équipe technique a été notifiée. Veuillez réessayer dans quelques instants.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <button
            onClick={handleRefresh}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 
              bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700
              text-gray-700 dark:text-gray-300 rounded-xl font-medium
              hover:border-red-500 hover:text-red-600 dark:hover:border-red-400 dark:hover:text-red-400
              transition-all duration-300 group"
          >
            <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
            Réessayer
          </button>

          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 
              bg-gradient-to-r from-red-500 to-rose-500 
              text-white rounded-xl font-medium
              hover:from-red-600 hover:to-rose-600 
              hover:shadow-lg hover:shadow-red-500/25
              transition-all duration-300"
          >
            <Home className="w-5 h-5" />
            Accueil
          </Link>
        </div>

        {/* Error details */}
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-6 md:p-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <AlertOctagon className="w-5 h-5 text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Que faire ?
            </h3>
          </div>
          <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto text-left">
            <p className="flex items-start gap-2">
              <span className="text-red-500 mt-0.5">•</span>
              Rafraîchissez la page — il peut s'agir d'un problème temporaire
            </p>
            <p className="flex items-start gap-2">
              <span className="text-red-500 mt-0.5">•</span>
              Vérifiez votre connexion internet
            </p>
            <p className="flex items-start gap-2">
              <span className="text-red-500 mt-0.5">•</span>
              Revenez plus tard si le problème persiste
            </p>
            <p className="flex items-start gap-2">
              <span className="text-red-500 mt-0.5">•</span>
              Contactez le support si l'erreur continue
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServerError;