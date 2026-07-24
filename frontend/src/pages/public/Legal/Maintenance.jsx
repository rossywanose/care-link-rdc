import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Wrench, 
  Clock,
  Mail,
  ArrowRight
} from 'lucide-react';

const Maintenance = () => {
  const [countdown, setCountdown] = useState({
    hours: 2,
    minutes: 30,
    seconds: 0
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        let { hours, minutes, seconds } = prev;
        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        }
        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (value) => String(value).padStart(2, '0');

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full text-center">
        {/* Animated icon */}
        <div className="relative mb-8 inline-block">
          <div className="w-24 h-24 rounded-full 
            bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-900/30 dark:to-violet-900/30
            flex items-center justify-center animate-pulse">
            <Wrench className="w-12 h-12 text-indigo-600 dark:text-indigo-400 animate-spin" style={{ animationDuration: '3s' }} />
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-white">!</span>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Maintenance en cours
        </h1>

        {/* Description */}
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-2 max-w-md mx-auto">
          Nous effectuons des mises à jour pour améliorer votre expérience.
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500 mb-10">
          Le service sera de retour sous peu.
        </p>

        {/* Countdown */}
        <div className="flex justify-center gap-4 mb-12">
          {[
            { value: countdown.hours, label: 'Heures' },
            { value: countdown.minutes, label: 'Minutes' },
            { value: countdown.seconds, label: 'Secondes' }
          ].map((item, index) => (
            <div key={index} className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 min-w-[80px]">
              <div className="text-3xl md:text-4xl font-bold text-indigo-600 dark:text-indigo-400">
                {formatTime(item.value)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {item.label}
              </div>
            </div>
          ))}
        </div>

        {/* Contact */}
        <div className="bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20 
          rounded-2xl p-6 md:p-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Mail className="w-5 h-5 text-indigo-500" />
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Besoin d'aide urgente ?
            </h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Contactez notre équipe de support pour toute question urgente.
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 
              font-medium hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors group"
          >
            Contacter le support
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Maintenance;