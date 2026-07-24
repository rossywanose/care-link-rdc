import React from 'react';
import { BarChart3, Users, FileText, CheckCircle, Bell, TrendingUp, AlertTriangle } from 'lucide-react';
import { AIBadge, AIInsightCard, AIThinking } from './AIAssistant';

const DashboardMockup = () => {
  return (
    <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      {/* AI Badge flottant */}
      <div className="absolute top-3 right-3 z-20">
        <AIBadge text="" />
      </div>

      {/* Browser Chrome */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-amber-400" />
          <div className="w-3 h-3 rounded-full bg-green-400" />
        </div>
        <div className="flex-1 mx-4">
          <div className="bg-white dark:bg-gray-800 rounded-md px-3 py-1 text-xs text-gray-500 dark:text-gray-400 text-center border border-gray-200 dark:border-gray-700">
            care-link-rdc.cd/dashboard
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="p-4 lg:p-6 bg-gray-50/50 dark:bg-gray-950/50">
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">Tableau de bord</span>
          </div>
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-gray-400" />
            <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-full" />
          </div>
        </div>

        {/* AI Insights Row */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <AIInsightCard 
            title="Prediction"
            value="+12%"
            trend="Naissances prevues ce mois"
            delay={500}
          />
          <AIInsightCard 
            title="Anomalie"
            value="3"
            trend="Certificats a verifier"
            delay={700}
          />
          <AIInsightCard 
            title="Tendance"
            value="97%"
            trend="Taux de validation"
            delay={900}
          />
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {[
            { label: 'Naissances', value: '1,234', color: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' },
            { label: 'Deces', value: '456', color: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' },
            { label: 'En attente', value: '23', color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' },
            { label: 'Valides', value: '1,667', color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' },
          ].map((stat, i) => (
            <div key={i} className={`${stat.color} rounded-lg p-2.5`}>
              <p className="text-[10px] opacity-70 mb-0.5">{stat.label}</p>
              <p className="text-lg font-bold">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700 mb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Statistiques mensuelles</span>
            <BarChart3 className="w-3.5 h-3.5 text-gray-400" />
          </div>
          <div className="flex items-end gap-1.5 h-24">
            {[35, 55, 40, 70, 50, 85, 65, 75, 55, 80, 45, 90].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div 
                  className="w-full bg-indigo-500 rounded-t"
                  style={{ height: `${h}%`, opacity: 0.6 + (i % 3) * 0.15 }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* AI Alert */}
        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mb-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-amber-800 dark:text-amber-300">Alerte IA detectee</p>
              <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5">3 certificats presentent des incoherences de dates. Verification recommandee.</p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
          <span className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-2 block">Activite recente</span>
          <div className="space-y-2">
            {[
              { action: 'Naissance enregistree', time: '2 min', color: 'bg-indigo-500' },
              { action: 'Certificat valide', time: '5 min', color: 'bg-emerald-500' },
              { action: 'Paiement recu', time: '12 min', color: 'bg-amber-500' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${item.color}`} />
                <span className="text-xs text-gray-600 dark:text-gray-400 flex-1">{item.action}</span>
                <span className="text-[10px] text-gray-400">{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardMockup;