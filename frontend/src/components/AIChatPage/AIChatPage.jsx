import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { aiService } from '../../services/aiService';
import WelcomeAnimation from './WelcomeAnimation';
import { 
  Send, 
  ArrowLeft, 
  Trash2, 
  MessageSquare, 
  Sparkles, 
  Clock, 
  Loader2, 
  X,
  Bot,
  User,
  ChevronRight,
  Zap,
  Lightbulb,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Pause,
  Play
} from 'lucide-react';
import './ai-animations.css';

// ============================================
// 🔧 PARSER MARKDOWN LÉGER (CORRIGÉ)
// ============================================
const MarkdownRenderer = ({ text }) => {
  if (!text) return null;

  const escapeHtml = (str) => {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  };

  let html = escapeHtml(text);

  // Blocs de code (doivent être traités AVANT les autres patterns)
  html = html.replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-900 text-gray-100 rounded-xl p-3 sm:p-4 my-3 overflow-x-auto text-xs sm:text-sm font-mono"><code>$1</code></pre>');

  // Code inline (doit être traité AVANT le gras/italique)
  html = html.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs sm:text-sm font-mono text-indigo-600 dark:text-indigo-400">$1</code>');

  // Titres
  html = html.replace(/^### (.{1,500})$/gim, '<h3 class="text-base sm:text-lg font-bold text-gray-900 dark:text-white mt-3 sm:mt-4 mb-2">$1</h3>');
  html = html.replace(/^## (.{1,500})$/gim, '<h2 class="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mt-4 sm:mt-5 mb-2 sm:mb-3">$1</h2>');
  html = html.replace(/^# (.{1,500})$/gim, '<h1 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mt-5 sm:mt-6 mb-3 sm:mb-4">$1</h1>');

  // Gras : au moins 1 caractère non-vide entre les **
  html = html.replace(/\*\*([^\s*][^*]*?)\*\*/g, '<strong class="font-semibold text-gray-900 dark:text-white">$1</strong>');

  // Italique : au moins 1 caractère non-vide entre les *
  html = html.replace(/\*([^\s*][^*]*?)\*/g, '<em class="italic text-gray-700 dark:text-gray-300">$1</em>');

  // Liens
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-indigo-600 dark:text-indigo-400 hover:underline break-all">$1</a>');

  // Listes à puces (ligne par ligne)
  html = html.replace(/^(\s*)[-*] (.+)$/gim, (match, indent, content) => {
    const padding = indent.length * 12;
    return `<div class="flex items-start gap-2" style="margin-left: ${padding}px">
      <span class="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 flex-shrink-0"></span>
      <span class="text-gray-700 dark:text-gray-300 text-sm sm:text-base">${content}</span>
    </div>`;
  });

  // Listes numérotées
  html = html.replace(/^(\s*)\d+\.\s+(.+)$/gim, (match, indent, content) => {
    const num = match.match(/^\s*(\d+)\./)[1];
    const padding = indent.length * 12;
    return `<div class="flex items-start gap-2" style="margin-left: ${padding}px">
      <span class="text-indigo-600 dark:text-indigo-400 font-semibold min-w-[1.5rem] text-sm sm:text-base">${num}.</span>
      <span class="text-gray-700 dark:text-gray-300 text-sm sm:text-base">${content}</span>
    </div>`;
  });

  // Sauts de ligne → paragraphes
  const lines = html.split('\n');
  const result = [];
  let inParagraph = false;

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) {
      if (inParagraph) {
        result.push('</p>');
        inParagraph = false;
      }
      result.push('<br/>');
    } else if (trimmed.startsWith('<')) {
      if (inParagraph) {
        result.push('</p>');
        inParagraph = false;
      }
      result.push(line);
    } else {
      if (!inParagraph) {
        result.push('<p class="text-gray-700 dark:text-gray-300 leading-relaxed mb-2 text-sm sm:text-base">');
        inParagraph = true;
      }
      result.push(line);
    }
  });

  if (inParagraph) result.push('</p>');

  return <div className="markdown-content break-words" dangerouslySetInnerHTML={{ __html: result.join('') }} />;
};


// ============================================
// ✨ COMPOSANT D'ÉCRITURE PROGRESSIVE
// ============================================
const TypewriterMessage = ({ content, source, onComplete }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const indexRef = useRef(0);
  const speedRef = useRef(15 + Math.random() * 20);

  useEffect(() => {
    indexRef.current = 0;
    setDisplayedText('');
    setIsComplete(false);

    const typeNext = () => {
      if (indexRef.current < content.length) {
        const char = content[indexRef.current];
        const isSpace = /\s/.test(char);
        const delay = isSpace ? 5 : speedRef.current;

        setDisplayedText(content.slice(0, indexRef.current + 1));
        indexRef.current++;

        setTimeout(typeNext, delay);
      } else {
        setIsComplete(true);
        onComplete?.();
      }
    };

    const startDelay = setTimeout(typeNext, 600);
    return () => clearTimeout(startDelay);
  }, [content]);

  return (
    <div className="break-words">
      <MarkdownRenderer text={displayedText} />
      {!isComplete && (
        <span className="inline-block w-2 h-4 bg-indigo-500 animate-pulse ml-0.5 align-middle rounded-sm" />
      )}
      {isComplete && source && (
        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ml-2 ${
          source === 'faq' 
            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' 
            : 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
        }`}>
          {source === 'faq' ? 'FAQ' : 'AI'}
        </span>
      )}
    </div>
  );
};

// ============================================
// 🔊 BOUTON LECTURE VOCALE (TTS)
// ============================================
const TTSButton = ({ text, lang = 'fr-FR' }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const speak = useCallback(() => {
    if (!window.speechSynthesis) return;
    
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 1;
    utterance.pitch = 1;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };
    
    window.speechSynthesis.speak(utterance);
  }, [text, lang]);

  const pause = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  }, []);

  const resume = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  }, []);

  const stop = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
    }
  }, []);

  if (!window.speechSynthesis) return null;

  return (
    <div className="flex items-center gap-1">
      {!isSpeaking ? (
        <button
          onClick={speak}
          className="p-1 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all"
          title="Lire à voix haute"
        >
          <Volume2 className="w-3.5 h-3.5" />
        </button>
      ) : (
        <>
          {isPaused ? (
            <button
              onClick={resume}
              className="p-1 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all"
              title="Reprendre"
            >
              <Play className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={pause}
              className="p-1 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all"
              title="Pause"
            >
              <Pause className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={stop}
            className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
            title="Arrêter"
          >
            <VolumeX className="w-3.5 h-3.5" />
          </button>
        </>
      )}
    </div>
  );
};

// ============================================
// 🎙️ INDICATEUR D'ENREGISTREMENT AUDIO
// ============================================
const RecordingIndicator = ({ isListening, onStop }) => {
  const [bars, setBars] = useState([0.3, 0.5, 0.7, 0.4, 0.6, 0.8, 0.5, 0.3]);
  const animationRef = useRef(null);

  useEffect(() => {
    if (!isListening) return;

    const animate = () => {
      setBars(prev => prev.map(() => 0.2 + Math.random() * 0.8));
      animationRef.current = setTimeout(() => {
        requestAnimationFrame(animate);
      }, 120);
    };

    animationRef.current = setTimeout(() => {
      requestAnimationFrame(animate);
    }, 120);

    return () => {
      if (animationRef.current) clearTimeout(animationRef.current);
    };
  }, [isListening]);

  if (!isListening) return null;

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl animate-fade-in-scale">
      {/* Indicateur rouge pulsant */}
      <div className="relative">
        <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
        <div className="absolute inset-0 w-3 h-3 rounded-full bg-red-500 animate-ping opacity-30" />
      </div>

      {/* Waveform animé */}
      <div className="flex items-center gap-[3px] h-6">
        {bars.map((height, i) => (
          <div
            key={i}
            className="w-[3px] rounded-full bg-red-500 transition-all duration-150 ease-out"
            style={{
              height: `${height * 24}px`,
              opacity: 0.4 + height * 0.6,
            }}
          />
        ))}
      </div>

      <span className="text-sm font-medium text-red-600 dark:text-red-400">
        Écoute en cours...
      </span>

      <button
        onClick={onStop}
        className="ml-auto p-1.5 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-all"
        title="Arrêter l'enregistrement"
      >
        <MicOff className="w-4 h-4" />
      </button>
    </div>
  );
};

// ============================================
// COMPOSANT PRINCIPAL
// ============================================
const AIChatPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [showAnimation, setShowAnimation] = useState(true);
  
  // 🔊 ÉTATS VOCAUX
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [speechError, setSpeechError] = useState(null);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionInstanceRef = useRef(null);

  const role = user?.role || 'citizen';
  const userName = user?.first_name || user?.email?.split('@')[0] || 'Utilisateur';
  const userAvatar = user?.avatar_url || user?.profile_image || null;

  // 🔧 FONCTION POUR CRÉER UNE NOUVELLE INSTANCE DE RECOGNITION
  const createRecognition = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return null;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'fr-FR';

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        setInputMessage(prev => {
          const clean = prev.replace(/ \[en écoute...\]$/, '').trim();
          return clean ? clean + ' ' + finalTranscript.trim() : finalTranscript.trim();
        });
      } else if (interimTranscript) {
        setInputMessage(prev => {
          const base = prev.replace(/ \[en écoute...\]$/, '');
          return (base ? base + ' ' : '') + interimTranscript.trim() + ' [en écoute...]';
        });
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      recognitionInstanceRef.current = null;

      if (event.error === 'not-allowed') {
        setSpeechError("Microphone non autorisé. Veuillez autoriser l'accès au micro.");
      } else if (event.error === 'no-speech') {
        setSpeechError('Aucune parole détectée. Réessayez.');
      } else if (event.error === 'aborted') {
        setSpeechError(null);
      } else {
        setSpeechError('Erreur micro : ' + event.error);
      }

      if (event.error !== 'aborted') {
        setTimeout(() => setSpeechError(null), 4000);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionInstanceRef.current = null;
      setInputMessage(prev => prev.replace(/ \[en écoute...\]$/, '').trim());
    };

    return recognition;
  }, []);

  // 🔧 VÉRIFIER SUPPORT SPEECH RECOGNITION
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
    }
  }, []);

  // 🔧 DÉMARRER/ARRÊTER L'ÉCOUTE
  const toggleListening = useCallback(() => {
    if (isListening) {
      if (recognitionInstanceRef.current) {
        try {
          recognitionInstanceRef.current.stop();
        } catch (e) {}
        recognitionInstanceRef.current = null;
      }
      setIsListening(false);
      setInputMessage(prev => prev.replace(/ \[en écoute...\]$/, '').trim());
    } else {
      setSpeechError(null);
      const recognition = createRecognition();
      if (!recognition) return;

      recognitionInstanceRef.current = recognition;
      
      try {
        recognition.start();
        setIsListening(true);
      } catch (err) {
        console.error('Failed to start recognition:', err);
        setSpeechError('Impossible de démarrer le micro. Réessayez.');
        recognitionInstanceRef.current = null;
        setTimeout(() => setSpeechError(null), 4000);
      }
    }
  }, [isListening, createRecognition]);

  // Nettoyage à la destruction du composant
  useEffect(() => {
    return () => {
      if (recognitionInstanceRef.current) {
        try {
          recognitionInstanceRef.current.stop();
        } catch (e) {}
        recognitionInstanceRef.current = null;
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const welcomeMessages = {
    citizen: [
      "Bonjour {name} ! Je suis là pour vous aider avec vos certificats et démarches. Qu'est-ce qui vous amène aujourd'hui ?",
      "Salut {name} ! Prêt à vous accompagner dans vos démarches administratives. De quoi avons-nous besoin ?",
      "Enchanté de vous revoir, {name} ! Vos certificats vous attendent. Comment puis-je vous assister ?",
      "Bienvenue {name} ! Je suis votre guide pour l'état civil. Une question, un doute ?",
      "Coucou {name} ! Besoin d'aide pour consulter ou télécharger un certificat ? Je suis là !",
      "Bonjour {name} ! Votre assistant personnel est en ligne. Que puis-je faire pour vous ?"
    ],
    hospital: [
      "Bonjour {name} ! Prêt à vous aider avec les enregistrements et certificats. Par où commençons-nous ?",
      "Salut {name} ! Votre assistant hospitalier est là. Une naissance ou un décès à déclarer ?",
      "Bienvenue {name} ! Je peux vous guider dans toutes les procédures. De quoi avez-vous besoin ?",
      "Bonjour {name} ! Génération de certificats, rapports mensuels... Je suis à votre service.",
      "Enchanté {name} ! Votre compagnon pour la gestion hospitalière. Comment puis-je vous aider ?",
      "Coucou {name} ! Besoin d'aide pour un enregistrement ? Je suis là pour ça !"
    ],
    authority: [
      "Bonjour {name} ! Votre assistant administratif est en ligne. Validations, statistiques, audit ?",
      "Salut {name} ! Prêt à vous accompagner dans vos missions de supervision. Par où commençons-nous ?",
      "Bienvenue {name} ! Je peux vous aider avec les validations et l'analyse des données.",
      "Bonjour {name} ! Vos tableaux de bord et rapports vous attendent. Une question ?",
      "Enchanté {name} ! Votre allié pour la gestion de l'état civil. Comment puis-je vous assister ?",
      "Coucou {name} ! Besoin d'aide pour valider un certificat ou consulter des statistiques ?"
    ]
  };

  const getWelcomeMessage = useCallback(() => {
    const roleMessages = welcomeMessages[role] || welcomeMessages.citizen;
    const randomMsg = roleMessages[Math.floor(Math.random() * roleMessages.length)];
    return randomMsg.replace('{name}', userName);
  }, [role, userName]);

  useEffect(() => {
    setMounted(true);
    loadConversations();
    loadSuggestions();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    try {
      const data = await aiService.getConversations();
      setConversations(data.results || data || []);
    } catch (e) {
      console.warn('Échec du chargement des conversations');
    }
  };

  const loadSuggestions = async () => {
    try {
      const data = await aiService.getSuggestions(role);
      setSuggestions(data.results || data || []);
    } catch (e) {
      console.warn('Échec du chargement des suggestions');
    }
  };

  const startNewConversation = () => {
    setCurrentConversation(null);
    setMessages([]);
    setShowWelcome(true);
    setShowAnimation(true);
    setSidebarOpen(false);
    inputRef.current?.focus();
  };

  const loadConversation = async (conv) => {
    try {
      const data = await aiService.getConversation(conv.id);
      setCurrentConversation(conv);
      setMessages(data.messages || []);
      setShowWelcome(false);
      setShowAnimation(false);
      setSidebarOpen(false);
    } catch (e) {
      console.error('Échec du chargement de la conversation');
    }
  };

  const deleteConversation = async (e, convId) => {
    e.stopPropagation();
    if (!window.confirm('Supprimer cette conversation ?')) return;
    try {
      await aiService.deleteConversation(convId);
      setConversations(prev => prev.filter(c => c.id !== convId));
      if (currentConversation?.id === convId) {
        startNewConversation();
      }
    } catch (e) {
      console.error('Échec de la suppression');
    }
  };

  const sendMessage = async (e) => {
    e?.preventDefault();
    const cleanMessage = inputMessage.replace(/ \[en écoute...\]$/, '').trim();
    if (!cleanMessage || isLoading) return;

    if (isListening && recognitionInstanceRef.current) {
      try {
        recognitionInstanceRef.current.stop();
      } catch (e) {}
      recognitionInstanceRef.current = null;
      setIsListening(false);
    }

    setInputMessage('');
    setShowWelcome(false);
    setShowAnimation(false);
    setMessages(prev => [...prev, { 
      sender: 'user', 
      content: cleanMessage, 
      created_at: new Date().toISOString() 
    }]);
    setIsLoading(true);
    setIsTyping(true);

    try {
      const response = await aiService.chat(cleanMessage, currentConversation?.id, {
        role,
        language: 'fr',
        page: window.location.pathname
      });

      setMessages(prev => [...prev, {
        sender: 'ai',
        content: response.message,
        source: response.source,
        created_at: new Date().toISOString(),
        isNew: true
      }]);

      if (response.conversation_id && !currentConversation) {
        setCurrentConversation({ id: response.conversation_id });
        loadConversations();
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        sender: 'ai',
        content: "Désolé, une erreur est survenue. Veuillez réessayer.",
        isError: true,
        created_at: new Date().toISOString()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInputMessage(suggestion.question || suggestion);
    setTimeout(() => {
      const fakeEvent = { preventDefault: () => {} };
      sendMessage(fakeEvent);
    }, 100);
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Aujourd'hui";
    if (days === 1) return 'Hier';
    if (days < 7) return `Il y a ${days} jours`;
    return date.toLocaleDateString('fr-FR');
  };

  const fallbackSuggestions = {
    citizen: [
      { question: 'Comment consulter mes certificats ?', icon: 'FileText' },
      { question: 'Comment signaler un problème ?', icon: 'AlertTriangle' },
      { question: 'Quel est le statut de mon certificat ?', icon: 'Clock' },
      { question: 'Comment télécharger un certificat ?', icon: 'Download' }
    ],
    hospital: [
      { question: 'Comment enregistrer une naissance ?', icon: 'Baby' },
      { question: 'Comment enregistrer un décès ?', icon: 'Skull' },
      { question: 'Comment générer un certificat ?', icon: 'FileText' },
      { question: 'Comment envoyer un rapport mensuel ?', icon: 'BarChart3' }
    ],
    authority: [
      { question: 'Comment valider un certificat ?', icon: 'CheckCircle2' },
      { question: 'Comment voir les statistiques ?', icon: 'BarChart3' },
      { question: 'Comment auditer un hôpital ?', icon: 'Search' },
      { question: 'Comment activer un nouvel hôpital ?', icon: 'Building2' }
    ]
  };

  const displaySuggestions = suggestions.length > 0 ? suggestions : (fallbackSuggestions[role] || fallbackSuggestions.citizen);

  // ============================================
  // RENDU
  // ============================================
  return (
    <div className={`h-[calc(100dvh-4rem)] min-h-0 flex overflow-hidden transition-all duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>

      {/* SIDEBAR */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-[280px] sm:w-72 bg-white dark:bg-gray-900 
        border-r border-gray-200 dark:border-gray-700
        shadow-xl shadow-gray-200/50 dark:shadow-black/50
        transform transition-transform duration-300 ease-in-out
        lg:relative lg:transform-none lg:shadow-none
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col
      `}>
        <div className="p-3 sm:p-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
              </div>
              <span className="font-semibold text-gray-900 dark:text-white text-sm">Assistant AI</span>
            </div>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={startNewConversation}
            className="w-full flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 
              bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700
              text-white rounded-xl font-medium text-xs sm:text-sm transition-all duration-200
              hover:shadow-lg hover:shadow-indigo-500/25 active:scale-[0.98]"
          >
            <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Nouvelle conversation
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversations.length === 0 ? (
            <div className="text-center py-6 sm:py-8 px-3 sm:px-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              </div>
              <p className="text-xs text-gray-400">Aucune conversation</p>
              <p className="text-[10px] text-gray-300 mt-1">Commencez une nouvelle conversation</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => loadConversation(conv)}
                className={`
                  group flex items-center gap-2 sm:gap-3 px-2.5 sm:px-3 py-2 sm:py-2.5 rounded-xl cursor-pointer
                  transition-all duration-200
                  ${currentConversation?.id === conv.id 
                    ? 'bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 border border-transparent'
                  }
                `}
              >
                <div className={`
                  w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center flex-shrink-0
                  ${currentConversation?.id === conv.id
                    ? 'bg-indigo-100 dark:bg-indigo-900/30'
                    : 'bg-gray-100 dark:bg-gray-800'
                  }
                `}>
                  <MessageSquare className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${currentConversation?.id === conv.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs sm:text-sm font-medium truncate ${currentConversation?.id === conv.id ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-700 dark:text-gray-300'}`}>
                    {conv.title || 'Conversation'}
                  </p>
                  <p className="text-[10px] text-gray-400 flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    {formatDate(conv.updated_at)}
                  </p>
                </div>
                <button
                  onClick={(e) => deleteConversation(e, conv.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 sm:p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                >
                  <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="p-2 sm:p-3 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <Bot className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] sm:text-xs font-medium text-gray-700 dark:text-gray-300 truncate">Care-Link AI</p>
              <p className="text-[10px] text-gray-400">En ligne</p>
            </div>
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Overlay mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 lg:hidden" 
          onClick={() => setSidebarOpen(false)} 
        />
      )}

      {/* ZONE PRINCIPALE */}
      <div className="flex-1 flex flex-col bg-gray-50/50 dark:bg-gray-950/50 min-w-0">

        {/* Header */}
        <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-800/50 sticky top-0 z-10 shrink-0">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all hover:scale-105"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all"
          >
            <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center animate-float shrink-0">
              <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white truncate">Assistant AI</h1>
              <p className="text-[10px] text-gray-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                <span className="hidden xs:inline">En ligne</span>
              </p>
            </div>
          </div>

          <button
            onClick={startNewConversation}
            className="p-1.5 sm:p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-all shrink-0"
            title="Nouvelle conversation"
          >
            <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6 min-h-0">

          {/* WELCOME */}
          {showWelcome && messages.length === 0 && (
            <div className="max-w-2xl mx-auto space-y-6 sm:space-y-8">

              {showAnimation && (
                <WelcomeAnimation 
                  userName={userName} 
                  onComplete={() => setShowAnimation(false)} 
                />
              )}

              {!showAnimation && (
                <div className="animate-fade-in-scale space-y-5 sm:space-y-6">
                  <div className="text-center space-y-2 sm:space-y-3">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-500/20">
                      <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Bienvenue</h2>
                      <p className="text-gray-500 dark:text-gray-400 mt-1 sm:mt-2 text-xs sm:text-sm leading-relaxed px-2">
                        {getWelcomeMessage()}
                      </p>
                    </div>
                  </div>

                  {/* Suggestions */}
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-center gap-2 px-1">
                      <Lightbulb className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500" />
                      <p className="text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Suggestions</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                      {displaySuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="group flex items-center gap-2.5 sm:gap-3 p-3 sm:p-4 bg-white dark:bg-gray-900 
                            border border-gray-200 dark:border-gray-800 rounded-xl
                            hover:border-indigo-300 dark:hover:border-indigo-700
                            hover:shadow-lg hover:shadow-indigo-500/10
                            transition-all duration-300 text-left
                            hover:-translate-y-0.5"
                        >
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20 
                            flex items-center justify-center flex-shrink-0
                            group-hover:from-indigo-100 group-hover:to-violet-100 dark:group-hover:from-indigo-900/30 dark:group-hover:to-violet-900/30
                            transition-colors">
                            <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors line-clamp-2">
                              {suggestion.question || suggestion}
                            </p>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-300 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Capacités */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                    {[
                      { icon: '⚡', label: 'Réponses instantanées', desc: 'FAQ optimisées' },
                      { icon: '🎯', label: 'Précis', desc: 'Contexte métier' },
                      { icon: '🔒', label: 'Sécurisé', desc: 'Données protégées' }
                    ].map((cap, i) => (
                      <div key={i} className="text-center p-3 sm:p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                        <div className="text-xl sm:text-2xl mb-1.5 sm:mb-2">{cap.icon}</div>
                        <p className="text-[11px] sm:text-xs font-semibold text-gray-700 dark:text-gray-300">{cap.label}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5 sm:mt-1">{cap.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Messages existants */}
          {messages.map((msg, index) => {
            const isLastAi = msg.sender === 'ai' && index === messages.length - 1 && msg.isNew && !msg.isError;

            return (
              <div
                key={index}
                className={`flex gap-2 sm:gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {msg.sender === 'ai' && (
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0 mt-1 shadow-lg shadow-indigo-500/20">
                    <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                  </div>
                )}

                <div className={`max-w-[85%] sm:max-w-[75%] md:max-w-[70%] space-y-1 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`
                    px-3 sm:px-4 py-2.5 sm:py-3 rounded-2xl text-xs sm:text-sm leading-relaxed break-words
                    ${msg.sender === 'user'
                      ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-br-md shadow-lg shadow-indigo-500/20'
                      : msg.isError
                        ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 rounded-bl-md'
                        : 'bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-800 rounded-bl-md shadow-sm'
                    }
                  `}>
                    {msg.sender === 'ai' && !msg.isError && isLastAi ? (
                      <TypewriterMessage 
                        content={msg.content} 
                        source={msg.source}
                        onComplete={() => setIsTyping(false)}
                      />
                    ) : msg.sender === 'ai' && !msg.isError ? (
                      <MarkdownRenderer text={msg.content} />
                    ) : (
                      <p>{msg.content}</p>
                    )}
                  </div>
                  <div className={`flex items-center gap-1.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <span className="text-[10px] text-gray-400">{formatTime(msg.created_at)}</span>
                    {msg.sender === 'ai' && msg.source && !isLastAi && (
                      <span className={`
                        text-[10px] px-1.5 py-0.5 rounded-full font-medium
                        ${msg.source === 'faq' 
                          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' 
                          : 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                        }
                      `}>
                        {msg.source === 'faq' ? 'FAQ' : 'AI'}
                      </span>
                    )}
                    {msg.sender === 'ai' && !msg.isError && (
                      <TTSButton text={msg.content} lang="fr-FR" />
                    )}
                  </div>
                </div>

                {msg.sender === 'user' && (
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl overflow-hidden flex-shrink-0 mt-1 shadow-md">
                    {userAvatar ? (
                      <img 
                        src={userAvatar} 
                        alt={userName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.classList.add('bg-gradient-to-br', 'from-gray-200', 'to-gray-300', 'dark:from-gray-700', 'dark:to-gray-600', 'flex', 'items-center', 'justify-center');
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center">
                        <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600 dark:text-gray-300" />
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* INDICATEUR DE TYPING */}
          {isLoading && isTyping && (
            <div className="flex gap-2 sm:gap-3 animate-fade-in-scale">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/20">
                <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
              </div>
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl rounded-bl-md px-3 sm:px-4 py-2.5 sm:py-3 shadow-sm flex items-center gap-2 sm:gap-3">
                <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                <span className="text-[10px] sm:text-xs text-gray-400">L'AI réfléchit...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-3 sm:p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-t border-gray-200/50 dark:border-gray-800/50 shrink-0">
          <div className="max-w-3xl mx-auto space-y-2">
            
            {/* 🎙️ INDICATEUR D'ENREGISTREMENT AUDIO */}
            <RecordingIndicator 
              isListening={isListening} 
              onStop={toggleListening} 
            />
            
            {/* Message d'erreur micro */}
            {speechError && !isListening && (
              <div className="flex items-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-600 dark:text-red-400">
                <MicOff className="w-3.5 h-3.5 shrink-0" />
                <span>{speechError}</span>
              </div>
            )}
            
            <form onSubmit={sendMessage} className="relative">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={isListening ? "Parlez maintenant..." : "Écrivez votre message..."}
                className={`w-full pl-3 sm:pl-4 pr-24 sm:pr-28 py-2.5 sm:py-3.5 bg-gray-100 dark:bg-gray-800 
                  border rounded-2xl
                  text-gray-900 dark:text-white placeholder-gray-400 text-sm
                  focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500
                  transition-all duration-200
                  ${isListening ? 'border-red-400 ring-2 ring-red-500/30 bg-red-50/30 dark:bg-red-900/10' : 'border-gray-200 dark:border-gray-700'}
                `}
                disabled={isLoading}
              />
              
              {/* Boutons Input */}
              <div className="absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {/* Bouton Micro */}
                {speechSupported && (
                  <button
                    type="button"
                    onClick={toggleListening}
                    disabled={isLoading}
                    className={`
                      p-2 sm:p-2.5 rounded-xl transition-all duration-200
                      ${isListening
                        ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 animate-pulse'
                        : 'text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
                      }
                      ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                    title={isListening ? "Arrêter l'écoute" : "Parler"}
                  >
                    {isListening ? (
                      <MicOff className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    ) : (
                      <Mic className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    )}
                  </button>
                )}
                
                {/* Bouton Envoyer */}
                <button
                  type="submit"
                  disabled={!inputMessage.replace(/ \[en écoute...\]$/, '').trim() || isLoading}
                  className={`
                    p-2 sm:p-2.5 rounded-xl transition-all duration-200
                    ${inputMessage.replace(/ \[en écoute...\]$/, '').trim() && !isLoading
                      ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 hover:scale-105'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                    }
                  `}
                >
                  {isLoading ? (
                    <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  )}
                </button>
              </div>
            </form>
            
            <p className="text-center text-[9px] sm:text-[10px] text-gray-400 px-2">
              Care-Link AI peut faire des erreurs. Vérifiez les informations importantes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChatPage;
