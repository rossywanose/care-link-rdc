import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Lock, 
  Home, 
  ArrowLeft,
  Shield,
  LogIn
} from 'lucide-react';

const Forbidden = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full text-center">
        {/* Animated 403 */}
        <div className="relative mb-8">
          <div className="text-[150px] md:text-[200px] font-black leading-none tracking-tighter
            bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 
            bg-clip-text text-transparent">
            403
          </div>
          <div className="absolute top-4 left-1/3 w-3 h-3 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
          <div className="absolute top-16 right-1/3 w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
        </div>

        {/* Icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full 
          bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30
          mb-6">
          <Lock className="w-10 h-10 text-amber-600 dark:text-amber-400" />
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Accès interdit
        </h1>

        {/* Description */}
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-2 max-w-md mx-auto">
          Vous n'avez pas les permissions nécessaires pour accéder à cette page.
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500 mb-10">
          Si vous pensez qu'il s'agit d'une erreur, contactez un administrateur.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 
              bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700
              text-gray-700 dark:text-gray-300 rounded-xl font-medium
              hover:border-amber-500 hover:text-amber-600 dark:hover:border-amber-400 dark:hover:text-amber-400
              transition-all duration-300 group"
          >
            <Home className="w-5 h-5" />
            Accueil
          </Link>

          <Link
            to="/login"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 
              bg-gradient-to-r from-amber-500 to-orange-500 
              text-white rounded-xl font-medium
              hover:from-amber-600 hover:to-orange-600 
              hover:shadow-lg hover:shadow-amber-500/25
              transition-all duration-300"
          >
            <LogIn className="w-5 h-5" />
            Se connecter
          </Link>
        </div>

        {/* Security info */}
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-6 md:p-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Sécurité
            </h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            Cette page est protégée par le système de contrôle d'accès de Care-Link RDC. 
            Chaque rôle (Citoyen, Hôpital, Autorité) a des permissions spécifiques.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Forbidden;