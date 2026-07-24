import React, { useState, useEffect } from 'react';
import { Sparkles, Bot, Zap, ShieldCheck, MessageSquare } from 'lucide-react';

export const AIBadge = ({ text = 'AI Powered', className = '' }) => (
  <span className={`inline-flex items-center gap-1 bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-800 rounded-full px-2.5 py-0.5 text-[10px] font-medium ${className}`}>
    <Sparkles className="w-3 h-3" />
    {text}
  </span>
);

export const AIThinking = ({ className = '' }) => (
  <div className={`flex items-center gap-1.5 ${className}`}>
    <div className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
    <div className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
    <div className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
  </div>
);

export const AIChatBubble = ({ message, delay = 0 }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div className={`flex items-start gap-2 transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
      <div className="w-6 h-6 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-full flex items-center justify-center flex-shrink-0">
        <Bot className="w-3.5 h-3.5 text-white" />
      </div>
      <div className="bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-xl rounded-tl-none px-3 py-2 max-w-[200px]">
        <p className="text-[11px] text-gray-700 dark:text-gray-300 leading-relaxed">{message}</p>
      </div>
    </div>
  );
};

export const AIScanEffect = ({ isScanning = true }) => {
  if (!isScanning) return null;

  return (
    <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-500/10 to-transparent animate-scan" />
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-violet-500 to-transparent animate-scan-line" />
    </div>
  );
};

export const AIInsightCard = ({ title, value, trend, delay = 0 }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div className={`bg-gradient-to-br from-violet-50 to-fuchsia-50 dark:from-violet-900/20 dark:to-fuchsia-900/20 border border-violet-200 dark:border-violet-800 rounded-lg p-3 transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
      <div className="flex items-center gap-1.5 mb-1.5">
        <Zap className="w-3 h-3 text-violet-500" />
        <span className="text-[10px] font-medium text-violet-600 dark:text-violet-400">{title}</span>
      </div>
      <p className="text-sm font-bold text-gray-900 dark:text-white">{value}</p>
      {trend && (
        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">{trend}</p>
      )}
    </div>
  );
};

export const AIVerificationBadge = ({ status = 'verified', delay = 0 }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const configs = {
    verified: { icon: ShieldCheck, text: 'Verifie par IA', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' },
    scanning: { icon: Sparkles, text: 'Analyse IA...', color: 'text-violet-600 bg-violet-50 dark:bg-violet-900/20 border-violet-200 dark:border-violet-800' },
    warning: { icon: MessageSquare, text: 'Alerte IA', color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800' },
  };

  const config = configs[status];
  const Icon = config.icon;

  return (
    <div className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium border transition-all duration-500 ${config.color} ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
      <Icon className="w-3 h-3" />
      {config.text}
    </div>
  );
};