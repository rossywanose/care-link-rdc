import React, { useState } from 'react';
import { Bell, Home, FileText, User, Sparkles, MessageSquare, Smartphone, Monitor, Download, X, Clock, ChevronRight } from 'lucide-react';

const MobileMockupFlip = () => {
  const [mobileFlipped, setMobileFlipped] = useState(false);
  const [desktopFlipped, setDesktopFlipped] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [activeView, setActiveView] = useState('mobile');

  const stats = [
    { label: "Mes certificats", value: "3", color: "indigo" },
    { label: "En attente", value: "1", color: "emerald" },
  ];

  const recentItems = [
    { title: 'Certificat de Naissance', date: '15 Jan 2026', status: 'Valide', statusColor: 'emerald' },
    { title: 'Certificat de Deces', date: '10 Jan 2026', status: 'En attente', statusColor: 'amber' },
  ];

  // ==================== CONTENU ÉCRAN (commun PC fixe et portable) ====================
  const desktopScreenContent = (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-950 overflow-hidden">
      {/* Top Bar macOS */}
      <div className="h-6 bg-gray-800 dark:bg-gray-900 flex items-center px-3 gap-2 flex-shrink-0">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500 hover:bg-red-600 transition-colors cursor-pointer" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500 hover:bg-yellow-600 transition-colors cursor-pointer" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500 hover:bg-green-600 transition-colors cursor-pointer" />
        </div>
        <div className="flex-1 text-center">
          <span className="text-[9px] text-gray-400 font-medium">Care-Link RDC — Tableau de bord</span>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-12 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col items-center py-3 gap-2 flex-shrink-0">
          <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-lg flex items-center justify-center mb-1">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="w-7 h-7 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
            <Home className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center">
            <FileText className="w-3.5 h-3.5 text-gray-400" />
          </div>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center relative">
            <Bell className="w-3.5 h-3.5 text-gray-400" />
            <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-violet-500 rounded-full" />
          </div>
          <div className="mt-auto w-7 h-7 rounded-lg flex items-center justify-center">
            <User className="w-3.5 h-3.5 text-gray-400" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-3 overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[9px] text-gray-500">Bonjour,</p>
              <p className="text-xs font-bold text-gray-900 dark:text-white">Rossy Wanose</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-violet-100 dark:bg-violet-900/30 rounded-full flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-violet-500" />
              </div>
              <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-full flex items-center justify-center">
                <span className="text-[10px] text-white font-medium">RW</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-violet-50 to-fuchsia-50 dark:from-violet-900/20 dark:to-fuchsia-900/20 border border-violet-200 dark:border-violet-800 rounded-lg p-2.5 mb-2.5">
            <div className="flex items-center gap-1.5 mb-1">
              <div className="w-4 h-4 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-full flex items-center justify-center">
                <Sparkles className="w-2.5 h-2.5 text-white" />
              </div>
              <span className="text-[9px] font-semibold text-violet-800 dark:text-violet-300">Assistant IA</span>
            </div>
            <p className="text-[8px] text-violet-700 dark:text-violet-400 leading-relaxed">
              Votre certificat de naissance a été validé. Vous pouvez maintenant le télécharger.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-2.5">
            {stats.map((stat, i) => (
              <div key={i} className="bg-white dark:bg-gray-900 rounded-lg p-2 shadow-sm border border-gray-100 dark:border-gray-800">
                <p className={`text-[8px] text-${stat.color}-600 dark:text-${stat.color}-400 uppercase tracking-wide`}>{stat.label}</p>
                <p className="text-base font-bold text-gray-900 dark:text-white">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="px-2.5 py-1.5 border-b border-gray-100 dark:border-gray-800">
              <p className="text-[8px] font-bold text-gray-700 dark:text-gray-200 uppercase">Récent</p>
            </div>
            {recentItems.map((item, i) => (
              <div key={i} className="flex items-center gap-2 px-2.5 py-1.5 border-b border-gray-50 dark:border-gray-800 last:border-0">
                <div className="w-5 h-5 bg-indigo-100 dark:bg-indigo-900/30 rounded-md flex items-center justify-center">
                  <FileText className="w-2.5 h-2.5 text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[8px] font-medium text-gray-900 dark:text-white truncate">{item.title}</p>
                  <p className="text-[7px] text-gray-500">{item.date}</p>
                </div>
                <span className={`text-[7px] px-1.5 py-0.5 rounded-full bg-${item.statusColor}-50 dark:bg-${item.statusColor}-900/20 text-${item.statusColor}-600 dark:text-${item.statusColor}-400 font-medium`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-2 bg-white dark:bg-gray-900 rounded-lg p-2 flex items-center gap-2 shadow-sm border border-gray-100 dark:border-gray-800">
            <MessageSquare className="w-3 h-3 text-gray-400" />
            <span className="text-[8px] text-gray-400 flex-1">Demander à l'IA...</span>
            <div className="w-5 h-5 bg-violet-500 rounded-full flex items-center justify-center">
              <Sparkles className="w-2.5 h-2.5 text-white" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ==================== VRAI MOCKUP PC FIXE ====================
  const desktopFixedMockup = (
    <div className="relative w-full h-full flex flex-col items-center">
      {/* Écran */}
      <div className="relative w-full flex-1">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-700 to-gray-800 dark:from-gray-800 dark:to-gray-900 rounded-t-xl p-2 shadow-2xl">
          <div className="w-full h-full bg-gray-900 rounded-lg overflow-hidden border border-gray-600 dark:border-gray-700">
            <div className="absolute top-2 left-2 right-2 h-1/3 bg-gradient-to-b from-white/5 to-transparent rounded-t-lg pointer-events-none z-10" />
            {desktopScreenContent}
          </div>
        </div>
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-16 h-1 bg-gray-600 dark:bg-gray-700 rounded-full" />
      </div>
      {/* Pied */}
      <div className="relative w-full h-12 flex flex-col items-center">
        <div className="w-8 h-8 bg-gradient-to-b from-gray-600 to-gray-700 dark:from-gray-700 dark:to-gray-800 rounded-b-sm shadow-lg" />
        <div className="w-24 h-2 bg-gradient-to-b from-gray-600 to-gray-700 dark:from-gray-700 dark:to-gray-800 rounded-full shadow-lg -mt-0.5" />
        <div className="w-32 h-1 bg-black/20 rounded-full blur-sm mt-1" />
      </div>
      {/* Badge */}
      <div className="absolute -top-3 -right-3 bg-gray-800 dark:bg-gray-700 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 border border-gray-600">
        <Monitor className="w-3.5 h-3.5" />Fixe
      </div>
    </div>
  );

  // ==================== VRAI MOCKUP PC PORTABLE ====================
  const desktopLaptopMockup = (
    <div className="relative w-full h-full flex flex-col items-center">
      {/* Écran (base) */}
      <div className="relative w-full flex-1">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-700 to-gray-800 dark:from-gray-800 dark:to-gray-900 rounded-t-lg p-1.5 shadow-2xl">
          <div className="w-full h-full bg-gray-900 rounded-md overflow-hidden border border-gray-600 dark:border-gray-700">
            <div className="absolute top-2 left-2 right-2 h-1/3 bg-gradient-to-b from-white/5 to-transparent rounded-t-lg pointer-events-none z-10" />
            {desktopScreenContent}
          </div>
        </div>
        {/* Charnière */}
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-full h-2 bg-gradient-to-b from-gray-600 to-gray-700 dark:from-gray-700 dark:to-gray-800 rounded-sm" />
      </div>
      {/* Clavier / Base */}
      <div className="relative w-full" style={{ height: '12px' }}>
        <div className="absolute inset-0 bg-gradient-to-b from-gray-600 to-gray-700 dark:from-gray-700 dark:to-gray-800 rounded-b-lg shadow-xl" />
        {/* Trackpad */}
        <div className="absolute top-1 left-1/2 -translate-x-1/2 w-16 h-1 bg-gray-500/30 dark:bg-gray-600/30 rounded-full" />
        {/* Ombre */}
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-40 h-1 bg-black/20 rounded-full blur-sm" />
      </div>
      {/* Badge */}
      <div className="absolute -top-3 -left-3 bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 border border-blue-500">
        <Monitor className="w-3.5 h-3.5" />Portable
      </div>
    </div>
  );

  // ==================== iOS CONTENT ====================
  const iOSContent = (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-6 pt-3 pb-1">
        <span className="text-xs font-semibold text-gray-900 dark:text-white">9:41</span>
        <div className="flex items-center gap-1">
          <div className="w-4 h-2.5 bg-gray-900 dark:bg-white rounded-sm" />
          <div className="w-0.5 h-2.5 bg-gray-900 dark:bg-white rounded-sm" />
        </div>
      </div>
      <div className="flex justify-center pb-2">
        <div className="w-24 h-6 bg-gray-900 dark:bg-black rounded-full flex items-center justify-center gap-2">
          <div className="w-2 h-2 bg-gray-700 dark:bg-gray-800 rounded-full" />
          <div className="w-3 h-3 bg-gray-800 dark:bg-gray-900 rounded-full" />
        </div>
      </div>
      <div className="flex-1 px-4 pb-2 overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[10px] text-gray-500">Bonjour,</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white">Rossy Wanose</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-violet-100 dark:bg-violet-900/30 rounded-full flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-violet-500" />
            </div>
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-full flex items-center justify-center">
              <span className="text-xs text-white font-medium">RW</span>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-violet-50 to-fuchsia-50 dark:from-violet-900/20 dark:to-fuchsia-900/20 border border-violet-200 dark:border-violet-800 rounded-2xl p-3.5 mb-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-full flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-xs font-semibold text-violet-800 dark:text-violet-300">Assistant IA</span>
          </div>
          <p className="text-[10px] text-violet-700 dark:text-violet-400 leading-relaxed">
            Votre certificat de naissance a été validé. Vous pouvez maintenant le télécharger.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2.5 mb-4">
          {stats.map((stat, i) => (
            <div key={i} className={`bg-${stat.color}-50 dark:bg-${stat.color}-900/20 rounded-2xl p-3 shadow-sm`}>
              <p className={`text-[10px] text-${stat.color}-600 dark:text-${stat.color}-400`}>{stat.label}</p>
              <p className={`text-xl font-bold text-${stat.color}-700 dark:text-${stat.color}-300`}>{stat.value}</p>
            </div>
          ))}
        </div>
        <div className="mb-3">
          <p className="text-xs font-bold text-gray-700 dark:text-gray-200 mb-2">Récent</p>
          <div className="space-y-2">
            {recentItems.map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-2.5 bg-gray-50 dark:bg-gray-900 rounded-2xl shadow-sm">
                <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
                  <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{item.title}</p>
                  <p className="text-[10px] text-gray-500">{item.date}</p>
                </div>
                <span className={`text-[10px] px-2.5 py-1 rounded-full bg-${item.statusColor}-50 dark:bg-${item.statusColor}-900/20 text-${item.statusColor}-600 dark:text-${item.statusColor}-400 font-medium`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-3 flex items-center gap-2 shadow-sm">
          <MessageSquare className="w-4 h-4 text-gray-400" />
          <span className="text-[10px] text-gray-400 flex-1">Demander à l'IA...</span>
          <div className="w-7 h-7 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-full flex items-center justify-center shadow-md">
            <Sparkles className="w-3 h-3 text-white" />
          </div>
        </div>
      </div>
      <div className="flex items-center justify-around py-3 px-2 border-t border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-0.5">
          <Home className="w-5 h-5 text-indigo-600" />
          <span className="text-[8px] text-indigo-600 font-medium">Accueil</span>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <FileText className="w-5 h-5 text-gray-400" />
          <span className="text-[8px] text-gray-400">Docs</span>
        </div>
        <div className="flex flex-col items-center gap-0.5 relative">
          <Bell className="w-5 h-5 text-gray-400" />
          <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-violet-500 rounded-full border-2 border-white dark:border-gray-950" />
          <span className="text-[8px] text-gray-400">Alertes</span>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <User className="w-5 h-5 text-gray-400" />
          <span className="text-[8px] text-gray-400">Profil</span>
        </div>
      </div>
      <div className="flex justify-center pb-2 pt-1">
        <div className="w-28 h-1 bg-gray-300 dark:bg-gray-700 rounded-full" />
      </div>
    </div>
  );

  // ==================== ANDROID CONTENT ====================
  const androidContent = (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-4 pt-2 pb-1 bg-indigo-600">
        <span className="text-[10px] font-medium text-white">9:41</span>
        <div className="flex items-center gap-1.5">
          <div className="flex gap-px">
            <div className="w-1 h-2.5 bg-white/80 rounded-sm" />
            <div className="w-1 h-2.5 bg-white/80 rounded-sm" />
            <div className="w-1 h-2.5 bg-white/80 rounded-sm" />
            <div className="w-1 h-2.5 bg-white/40 rounded-sm" />
          </div>
          <div className="w-5 h-2.5 border border-white/80 rounded-sm relative">
            <div className="absolute inset-0.5 bg-white/80 rounded-sm" />
          </div>
        </div>
      </div>
      <div className="bg-indigo-600 px-4 py-3 flex items-center justify-between">
        <div>
          <p className="text-[10px] text-indigo-200">Bonjour,</p>
          <p className="text-sm font-bold text-white">Rossy Wanose</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center">
            <span className="text-sm font-bold text-indigo-600">RW</span>
          </div>
        </div>
      </div>
      <div className="flex-1 px-4 py-4 overflow-hidden bg-gray-50 dark:bg-gray-950">
        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 mb-4 shadow-md border-l-4 border-violet-500">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 bg-violet-100 dark:bg-violet-900/30 rounded-full flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-violet-600" />
            </div>
            <span className="text-xs font-bold text-gray-900 dark:text-white">Assistant IA</span>
          </div>
          <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed">
            Votre certificat de naissance a été validé. Vous pouvez maintenant le télécharger.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-4">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white dark:bg-gray-900 rounded-xl p-3.5 shadow-md">
              <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
              <div className={`mt-2 h-1 bg-${stat.color}-500 rounded-full`} style={{ width: '40%' }} />
            </div>
          ))}
        </div>
        <div className="mb-3">
          <p className="text-xs font-bold text-gray-700 dark:text-gray-200 mb-2 uppercase tracking-wide">Récent</p>
          <div className="space-y-2">
            {recentItems.map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-white dark:bg-gray-900 rounded-xl shadow-sm">
                <div className={`w-10 h-10 bg-${item.statusColor}-100 dark:bg-${item.statusColor}-900/20 rounded-lg flex items-center justify-center`}>
                  <FileText className={`w-5 h-5 text-${item.statusColor}-600 dark:text-${item.statusColor}-400`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{item.title}</p>
                  <p className="text-[10px] text-gray-500">{item.date}</p>
                </div>
                <span className={`text-[10px] px-3 py-1 rounded-md bg-${item.statusColor}-100 dark:bg-${item.statusColor}-900/20 text-${item.statusColor}-700 dark:text-${item.statusColor}-300 font-bold`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl p-3 flex items-center gap-3 shadow-md">
          <MessageSquare className="w-5 h-5 text-gray-400" />
          <span className="text-xs text-gray-400 flex-1">Demander à l'IA...</span>
          <div className="w-9 h-9 bg-violet-600 rounded-full flex items-center justify-center shadow-lg">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
        </div>
      </div>
      <div className="flex items-center justify-around py-3 px-2 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-lg">
        <div className="flex flex-col items-center gap-1">
          <div className="w-12 h-8 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center">
            <Home className="w-5 h-5 text-indigo-600" />
          </div>
          <span className="text-[9px] text-indigo-600 font-bold">Accueil</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <FileText className="w-5 h-5 text-gray-400" />
          <span className="text-[9px] text-gray-400">Docs</span>
        </div>
        <div className="flex flex-col items-center gap-1 relative">
          <Bell className="w-5 h-5 text-gray-400" />
          <div className="absolute -top-0.5 right-1 w-2.5 h-2.5 bg-violet-500 rounded-full border-2 border-white dark:border-gray-900" />
          <span className="text-[9px] text-gray-400">Alertes</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <User className="w-5 h-5 text-gray-400" />
          <span className="text-[9px] text-gray-400">Profil</span>
        </div>
      </div>
    </div>
  );

  // Rendu du device
  const renderDevice = () => {
    if (activeView === 'desktop') {
      return (
        <div 
          className="relative cursor-pointer"
          style={{ perspective: '1000px', width: '420px', height: '340px' }}
          onClick={() => setDesktopFlipped(!desktopFlipped)}
          onMouseEnter={() => setDesktopFlipped(true)}
          onMouseLeave={() => setDesktopFlipped(false)}
        >
          <div 
            className="relative w-full h-full transition-transform duration-700"
            style={{ 
              transformStyle: 'preserve-3d',
              transform: desktopFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
            }}
          >
            {/* Face Avant : PC Fixe */}
            <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden' }}>
              {desktopFixedMockup}
            </div>
            {/* Face Arrière : PC Portable */}
            <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
              {desktopLaptopMockup}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div 
        className="relative cursor-pointer"
        style={{ perspective: '1000px', width: '280px', height: '580px' }}
        onClick={() => setMobileFlipped(!mobileFlipped)}
        onMouseEnter={() => setMobileFlipped(true)}
        onMouseLeave={() => setMobileFlipped(false)}
      >
        <div 
          className="relative w-full h-full transition-transform duration-700"
          style={{ 
            transformStyle: 'preserve-3d',
            transform: mobileFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
          }}
        >
          {/* Face Avant : iOS */}
          <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden' }}>
            <div className="w-full h-full bg-gray-800 dark:bg-gray-900 rounded-[2.5rem] p-2 shadow-2xl">
              <div className="w-full h-full bg-white dark:bg-gray-950 rounded-[2rem] overflow-hidden shadow-inner">
                <div className="absolute -left-1 top-24 w-1 h-8 bg-gray-700 rounded-l-md" />
                <div className="absolute -left-1 top-36 w-1 h-16 bg-gray-700 rounded-l-md" />
                <div className="absolute -left-1 top-56 w-1 h-16 bg-gray-700 rounded-l-md" />
                <div className="absolute -right-1 top-32 w-1 h-20 bg-gray-700 rounded-r-md" />
                {iOSContent}
              </div>
            </div>
            <div className="absolute -top-3 -right-3 bg-gray-900 dark:bg-gray-800 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 border border-gray-700">
              <Smartphone className="w-3.5 h-3.5" />iOS
            </div>
          </div>
          {/* Face Arrière : Android */}
          <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
            <div className="w-full h-full bg-gray-800 dark:bg-gray-900 rounded-[1.5rem] p-1.5 shadow-2xl">
              <div className="w-full h-full bg-gray-50 dark:bg-gray-950 rounded-[1.25rem] overflow-hidden shadow-inner">
                <div className="absolute -right-1 top-28 w-1 h-10 bg-gray-700 rounded-r-md" />
                <div className="absolute -right-1 top-44 w-1 h-6 bg-gray-700 rounded-r-md" />
                {androidContent}
              </div>
            </div>
            <div className="absolute -top-3 -left-3 bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 border border-emerald-500">
              <Smartphone className="w-3.5 h-3.5" />Android
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center gap-6 py-10">
      {/* Toggle PC / Mobile */}
      <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
        <button
          onClick={() => setActiveView('mobile')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeView === 'mobile' 
              ? 'bg-white dark:bg-gray-700 text-indigo-600 shadow-sm' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          Mobile
        </button>
        <button
          onClick={() => setActiveView('desktop')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeView === 'desktop' 
              ? 'bg-white dark:bg-gray-700 text-indigo-600 shadow-sm' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Monitor className="w-4 h-4" />
          PC
        </button>
      </div>

      {/* Label */}
      <div className="text-center">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {activeView === 'desktop' 
            ? (desktopFlipped ? 'PC Portable' : 'PC Fixe')
            : (mobileFlipped ? 'Interface Android' : 'Interface iOS')
          }
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          Cliquez ou survolez pour retourner
        </p>
      </div>

      {/* Device */}
      <div className="relative">
        {renderDevice()}
      </div>

      {/* Indicateurs */}
      <div className="flex items-center gap-3">
        {activeView === 'desktop' ? (
          <>
            <div className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${!desktopFlipped ? 'bg-gray-700 scale-125' : 'bg-gray-300 dark:bg-gray-600'}`} />
            <div className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${desktopFlipped ? 'bg-blue-500 scale-125' : 'bg-gray-300 dark:bg-gray-600'}`} />
          </>
        ) : (
          <>
            <div className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${!mobileFlipped ? 'bg-indigo-500 scale-125' : 'bg-gray-300 dark:bg-gray-600'}`} />
            <div className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${mobileFlipped ? 'bg-emerald-500 scale-125' : 'bg-gray-300 dark:bg-gray-600'}`} />
          </>
        )}
      </div>

      {/* Bouton Télécharger */}
      <button
        onClick={() => setShowDownloadModal(true)}
        className="group flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:shadow-indigo-500/30 transition-all hover:scale-105 active:scale-95"
      >
        <Download className="w-5 h-5 group-hover:animate-bounce" />
        <span>Télécharger l'application</span>
        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </button>

      {/* Modal */}
      {showDownloadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowDownloadModal(false)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-sm w-full p-6 transform animate-in fade-in zoom-in duration-300">
            <button onClick={() => setShowDownloadModal(false)} className="absolute top-4 right-4 w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
              <X className="w-4 h-4 text-gray-500" />
            </button>
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-900/30 dark:to-violet-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-indigo-600 dark:text-indigo-400 animate-pulse" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-2">Bientôt disponible !</h3>
            <p className="text-gray-600 dark:text-gray-300 text-center text-sm leading-relaxed mb-6">
              L'application mobile <strong className="text-indigo-600 dark:text-indigo-400">Care-Link RDC</strong> est actuellement en cours de développement.
            </p>
            <div className="mb-6">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                <span>Progression</span>
                <span className="font-medium text-indigo-600">75%</span>
              </div>
              <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full animate-pulse" style={{ width: '75%' }} />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <button onClick={() => setShowDownloadModal(false)} className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-medium hover:shadow-lg transition-all">
                J'ai compris
              </button>
              <button onClick={() => setShowDownloadModal(false)} className="w-full py-2.5 text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors">
                Me notifier quand c'est prêt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileMockupFlip;