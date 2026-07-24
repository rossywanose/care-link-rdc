import React from 'react';
import { FileText, CheckCircle, QrCode, Sparkles, ShieldCheck } from 'lucide-react';
import { AIBadge, AIScanEffect, AIVerificationBadge } from './AIAssistant';

const CertificateMockup = () => {
  return (
    <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden max-w-sm mx-auto">
      {/* AI Badge flottant */}
      <div className="absolute top-3 right-3 z-20">
        <AIBadge text="" />
      </div>

      {/* Certificate Header */}
      <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Certificat de Naissance</h3>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400">Valide et verifiable</p>
            </div>
          </div>
          <CheckCircle className="w-5 h-5 text-emerald-500" />
        </div>
      </div>

      {/* Certificate Body */}
      <div className="p-5 relative">
        <AIScanEffect isScanning={true} />

        <div className="text-center mb-4">
          <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">Republique Democratique du Congo</p>
          <h4 className="text-lg font-bold text-gray-900 dark:text-white">CERTIFICAT DE NAISSANCE</h4>
          <p className="text-xs text-gray-500">N° CERT-2026-001234</p>
        </div>

        {/* AI Verification Banner */}
        <div className="mb-4">
          <AIVerificationBadge status="scanning" delay={200} />
        </div>

        <div className="space-y-2.5 border-t border-b border-gray-100 dark:border-gray-800 py-4 my-4">
          <div className="flex justify-between">
            <span className="text-[10px] text-gray-500">Nom complet</span>
            <span className="text-xs font-medium text-gray-900 dark:text-white">Jean-Pierre Mulumba</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[10px] text-gray-500">Date de naissance</span>
            <span className="text-xs font-medium text-gray-900 dark:text-white">15 Janvier 2026</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[10px] text-gray-500">Lieu de naissance</span>
            <span className="text-xs font-medium text-gray-900 dark:text-white">Kinshasa</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[10px] text-gray-500">Pere</span>
            <span className="text-xs font-medium text-gray-900 dark:text-white">Pierre Mulumba</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[10px] text-gray-500">Mere</span>
            <span className="text-xs font-medium text-gray-900 dark:text-white">Marie Lumumba</span>
          </div>
        </div>

        {/* AI Verification Detail */}
        <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span className="text-[11px] font-medium text-emerald-800 dark:text-emerald-300">Verification IA completee</span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-3 h-3 text-emerald-500" />
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400">Identite du pere verifiee</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-3 h-3 text-emerald-500" />
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400">Doublon detecte : aucun</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-3 h-3 text-emerald-500" />
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400">Coherence des dates validee</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-[10px] text-gray-500">
            <p>Delivre le: 16/01/2026</p>
            <p>Par: Dr. Marie Kabongo</p>
          </div>
          <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center relative">
            <QrCode className="w-8 h-8 text-gray-400" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-violet-500 rounded-full flex items-center justify-center">
              <Sparkles className="w-2.5 h-2.5 text-white" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateMockup;