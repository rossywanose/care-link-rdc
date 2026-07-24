import React from 'react';
import { Baby, Calendar, User, MapPin, Check, Sparkles } from 'lucide-react';
import { AIBadge, AIChatBubble, AIThinking } from './AIAssistant';

const BirthFormMockup = () => {
  return (
    <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden max-w-sm mx-auto">
      {/* AI Badge flottant */}
      <div className="absolute top-3 right-3 z-20">
        <AIBadge text="" />
      </div>

      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
            <Baby className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Certificat de Naissance</h3>
            <p className="text-[10px] text-gray-500">Nouvel enregistrement</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="p-5 space-y-3">
        {/* Progress */}
        <div className="flex items-center gap-1 mb-4">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex-1">
              <div className={`h-1 rounded-full ${step <= 2 ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-700'}`} />
            </div>
          ))}
        </div>

        {/* AI Chat Bubble */}
        <AIChatBubble 
          message="Je remplis automatiquement les champs recurrents. Le nom du pere a ete retrouve dans nos archives." 
          delay={300}
        />

        {/* Fields */}
        <div className="space-y-3 mt-3">
          <div>
            <label className="text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-1 block">Nom de l'enfant</label>
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
              <User className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs text-gray-700 dark:text-gray-300">Jean-Pierre M...</span>
              <Sparkles className="w-3 h-3 text-violet-500 ml-auto" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-1 block">Date de naissance</label>
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-xs text-gray-700 dark:text-gray-300">15/01/2026</span>
              </div>
            </div>
            <div>
              <label className="text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-1 block">Genre</label>
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                <span className="text-xs text-gray-700 dark:text-gray-300">Masculin</span>
              </div>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-1 block">Lieu de naissance</label>
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
              <MapPin className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs text-gray-700 dark:text-gray-300">Hopital General de Kinshasa</span>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-1 block">Nom du pere</label>
            <div className="flex items-center gap-2 px-3 py-2 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-lg">
              <User className="w-3.5 h-3.5 text-violet-500" />
              <span className="text-xs text-violet-700 dark:text-violet-300">Pierre Mulumba</span>
              <Sparkles className="w-3 h-3 text-violet-500 ml-auto" />
            </div>
            <p className="text-[10px] text-violet-600 dark:text-violet-400 mt-1">Auto-complete par IA</p>
          </div>
        </div>

        {/* AI Suggestion */}
        <div className="bg-violet-50 dark:bg-violet-900/10 border border-violet-200 dark:border-violet-800 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-violet-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[11px] font-medium text-violet-800 dark:text-violet-300">Suggestion IA</p>
              <p className="text-[10px] text-violet-700 dark:text-violet-400 mt-0.5">Le numero de telephone du pere existe deja. Verification automatique effectuee.</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <button className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5">
            <Check className="w-3.5 h-3.5" />
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
};

export default BirthFormMockup;