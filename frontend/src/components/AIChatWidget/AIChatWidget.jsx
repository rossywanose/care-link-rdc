import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot, 
  User, 
  Sparkles,
  ChevronRight,
  Loader2,
  Smile,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { aiService } from '../../services/aiService';
import welcomeMessages from './welcome_messages.json';
import './ai-animations.css';

// ============================================
// 📝 PARSER MARKDOWN → HTML
// ============================================
const parseMarkdownToHtml = (text) => {
  if (!text) return '';

  // Détecter si le texte contient déjà du HTML brut
  if (/<[a-z][\s\S]*>/i.test(text)) {
    return text.replace(/className=/g, 'class=').replace(/\n/g, '<br/>');
  }

  let html = text;

  // Échapper le HTML pour la sécurité
  html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // Titres
  html = html.replace(/^### (.*$)/gim, '<h3 class="text-sm font-bold text-gray-900 dark:text-white mt-2 mb-1">$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2 class="text-base font-bold text-gray-900 dark:text-white mt-3 mb-2">$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1 class="text-lg font-bold text-gray-900 dark:text-white mt-4 mb-3">$1</h1>');

  // Gras **texte**
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900 dark:text-white">$1</strong>');

  // Italique *texte* (mais pas **)
  html = html.replace(/(?<!\*)\*(?!\*)(.*?)\*(?!\*)/g, '<em class="italic text-gray-700 dark:text-gray-300">$1</em>');

  // Code inline `code`
  html = html.replace(/`(.*?)`/g, '<code class="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono text-indigo-600 dark:text-indigo-400">$1</code>');

  // Liens [texte](url)
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-indigo-600 dark:text-indigo-400 hover:underline text-sm">$1</a>');

  // Listes à puces
  html = html.replace(/^(\s*)[-*] (.*$)/gim, (match, indent, content) => {
    const padding = indent.length * 8;
    return `<div class="flex items-start gap-1.5 text-sm" style="margin-left: ${padding}px"><span class="w-1 h-1 rounded-full bg-indigo-500 mt-2 flex-shrink-0"></span><span class="text-gray-700 dark:text-gray-300">${content}</span></div>`;
  });

  // Listes numérotées
  html = html.replace(/^(\s*)\d+\.\s+(.*$)/gim, (match, indent, content) => {
    const num = match.match(/^\s*(\d+)\./)[1];
    const padding = indent.length * 8;
    return `<div class="flex items-start gap-1.5 text-sm" style="margin-left: ${padding}px"><span class="text-indigo-600 dark:text-indigo-400 font-semibold text-xs min-w-[1.2rem]">${num}.</span><span class="text-gray-700 dark:text-gray-300">${content}</span></div>`;
  });

  // Sauts de ligne
  html = html.replace(/\n/g, '<br/>');

  return html;
};

// ============================================
// ✨ MESSAGE BUBBLE AVEC TYPEWRITER INTÉGRÉ
// ============================================
const MessageBubble = ({ msg, onTypingComplete }) => {
  const [displayedText, setDisplayedText] = useState(msg.isNew ? '' : msg.content);
  const [isComplete, setIsComplete] = useState(!msg.isNew);
  const indexRef = useRef(0);
  const speedRef = useRef(12 + Math.random() * 15);

  useEffect(() => {
    if (msg.isNew && msg.sender === 'ai' && !msg.isError) {
      indexRef.current = 0;
      setDisplayedText('');
      setIsComplete(false);

      const typeNext = () => {
        if (indexRef.current < msg.content.length) {
          const char = msg.content[indexRef.current];
          const delay = /\s/.test(char) ? 3 : speedRef.current;
          setDisplayedText(msg.content.slice(0, indexRef.current + 1));
          indexRef.current++;
          setTimeout(typeNext, delay);
        } else {
          setIsComplete(true);
          onTypingComplete?.(msg.id);
        }
      };

      const startDelay = setTimeout(typeNext, 400);
      return () => clearTimeout(startDelay);
    }
  }, [msg.id, msg.isNew, msg.content, msg.sender, msg.isError]);

  // Click pour afficher tout instantanément
  const handleClick = () => {
    if (!isComplete && msg.isNew) {
      setDisplayedText(msg.content);
      setIsComplete(true);
      onTypingComplete?.(msg.id);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  // Détecter si le texte contient du HTML
  const hasHtml = /<[a-z][\s\S]*>/i.test(displayedText);

  return (
    <div className={`flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden
        ${msg.sender === 'user' 
          ? 'bg-gradient-to-br from-indigo-600 to-violet-600' 
          : 'bg-gray-100 dark:bg-gray-800'
        }`}
      >
        {msg.sender === 'user' ? (
          msg.userAvatar ? (
            <img src={msg.userAvatar} alt="Profil" className="w-full h-full object-cover" 
              onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.classList.add('flex', 'items-center', 'justify-center'); }} />
          ) : (
            <User className="w-4 h-4 text-white" />
          )
        ) : (
          <div className="w-full h-full rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
        )}
      </div>

      {/* Message Bubble */}
      <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm
        ${msg.sender === 'user'
          ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white'
          : msg.isError
            ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
        }`}
      >
        <span onClick={handleClick} className={msg.isNew && !isComplete ? 'cursor-pointer' : ''}>
          <div 
            className="text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: parseMarkdownToHtml(displayedText) }}
          />

          {/* Curseur clignotant pendant l'écriture */}
          {msg.isNew && !isComplete && msg.sender === 'ai' && !msg.isError && (
            <span className="inline-block w-1.5 h-4 bg-indigo-500 animate-pulse ml-0.5 align-middle rounded-sm" />
          )}
        </span>

        {/* Badge source */}
        {isComplete && msg.source && (
          <span className={`inline-block text-[10px] px-1.5 py-0.5 rounded-full font-medium mt-1 ${
            msg.source === 'faq' 
              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' 
              : 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
          }`}>
            {msg.source === 'faq' ? 'FAQ' : 'AI'}
          </span>
        )}

        {/* Timestamp */}
        <span className="block text-[10px] opacity-40 mt-1 text-right">{formatTime(msg.timestamp)}</span>
      </div>
    </div>
  );
};

// ============================================
// 😀 SÉLECTEUR D'EMOJI
// ============================================
const EmojiPicker = ({ onSelect, onClose }) => {
  const emojis = [
    ['👍', '👎', '❤️', '😊', '😂', '😍', '🤔', '👏'],
    ['🔥', '✨', '🎉', '💯', '⭐', '💪', '🙏', '👋'],
    ['🤝', '✅', '❌', '⚡', '📌', '💡', '🔍', '📊'],
    ['📈', '🏥', '👶', '💀', '📄', '🏆', '🇨🇩', '🇫🇷'],
    ['🌍', '🕊️', '⚖️', '📚', '💊', '🩺', '❤️‍🩹', '🤲']
  ];

  const pickerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div 
      ref={pickerRef}
      className="absolute bottom-full left-0 mb-2 p-3 bg-white dark:bg-gray-800 rounded-xl 
        border border-gray-200 dark:border-gray-700 shadow-2xl z-50
        animate-in fade-in zoom-in-95 duration-200"
      style={{ width: '280px' }}
    >
      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 px-1">Réactions</div>
      {emojis.map((row, rowIndex) => (
        <div key={rowIndex} className="flex gap-1 justify-center">
          {row.map((emoji, i) => (
            <button
              key={i}
              onClick={() => { onSelect(emoji); onClose(); }}
              className="w-9 h-9 flex items-center justify-center text-xl hover:bg-gray-100 
                dark:hover:bg-gray-700 rounded-lg transition-colors"
              style={{ fontSize: '18px' }}
            >
              {emoji}
            </button>
          ))}
        </div>
      ))}
      <div className="text-[10px] text-gray-400 text-center mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
        Cliquez pour insérer
      </div>
    </div>
  );
};

// ============================================
// COMPOSANT PRINCIPAL
// ============================================
const AIChatWidget = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const role = user?.role || 'citizen';
  const userName = user?.first_name || user?.email?.split('@')[0] || 'Utilisateur';
  const userAvatar = user?.avatar || user?.photo || null;

  const roleLabels = {
    citizen: 'Assistant Citoyen',
    hospital: 'Assistant Hospitalier',
    authority: 'Assistant Administratif'
  };

  const getRandomWelcome = useCallback(() => {
    const msgs = welcomeMessages[role] || welcomeMessages.citizen;
    return msgs[Math.floor(Math.random() * msgs.length)].replace('{name}', userName);
  }, [role, userName]);

  const [welcomeMessage] = useState(getRandomWelcome);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => { scrollToBottom(); }, [messages]);
  useEffect(() => { if (isOpen) setTimeout(() => inputRef.current?.focus(), 100); }, [isOpen]);

  useEffect(() => {
    if (isOpen && suggestions.length === 0) {
      aiService.getSuggestions(role).then(data => {
        setSuggestions(data.suggestions || []);
      }).catch(() => {
        setSuggestions(getFallbackSuggestions(role));
      });
    }
  }, [isOpen, role]);

  const getFallbackSuggestions = (role) => {
    const defaults = {
      citizen: [
        { question: "Comment consulter mes certificats ?", category: "certificat" },
        { question: "Comment signaler un problème ?", category: "signalement" },
        { question: "Comment changer mon mot de passe ?", category: "parametres" },
      ],
      hospital: [
        { question: "Comment enregistrer une naissance ?", category: "naissance" },
        { question: "Comment générer un certificat ?", category: "certificat" },
        { question: "Comment envoyer un rapport mensuel ?", category: "rapport" },
      ],
      authority: [
        { question: "Comment valider un certificat ?", category: "validation" },
        { question: "Comment voir les statistiques ?", category: "statistiques" },
        { question: "Comment auditer un hôpital ?", category: "audit" },
      ]
    };
    return defaults[role] || defaults.citizen;
  };

  const handleEmojiSelect = (emoji) => {
    setInput(prev => prev + emoji);
    inputRef.current?.focus();
  };

  const sendMessage = async (text = input) => {
    if (!text.trim() || loading) return;

    const userMessage = text.trim();
    setInput('');

    // Ajouter le message utilisateur
    setMessages(prev => [...prev, { 
      id: Date.now(),
      sender: 'user', 
      content: userMessage, 
      timestamp: Date.now(),
      userAvatar
    }]);

    setLoading(true);

    try {
      const response = await aiService.chat(userMessage, conversationId, {
        role: role,
        user_name: userName
      });

      // Ajouter la réponse AI avec isNew: true pour déclencher le typewriter
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'ai',
        content: response.message,
        source: response.source,
        timestamp: Date.now(),
        isNew: true
      }]);

      if (response.conversation_id) setConversationId(response.conversation_id);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'ai',
        content: "Désolé, je rencontre un problème de connexion. Veuillez réessayer.",
        source: 'error',
        timestamp: Date.now(),
        isError: true
      }]);
    } finally {
      setLoading(false);
    }
  };

  // Quand le typewriter finit, on enlève le flag isNew
  const handleTypingComplete = (messageId) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, isNew: false } : msg
    ));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleSuggestionClick = (question) => sendMessage(question);

  const openFullPage = () => {
    setIsOpen(false);
    navigate(`/${role}-dashboard/assistant`);
  };

  // Dimensions
  const widgetWidth = isExpanded ? 'w-[700px]' : 'w-[450px]';
  const widgetHeight = isExpanded ? 'h-[80vh]' : 'h-[600px]';

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-indigo-600 to-violet-600 
            rounded-full shadow-lg shadow-indigo-500/30 flex items-center justify-center
            hover:scale-110 active:scale-95 transition-all duration-300 group animate-bounce-subtle"
          title="Assistant AI"
        >
          <MessageCircle className="w-6 h-6 text-white group-hover:rotate-12 transition-transform" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse" />
        </button>
      )}

      {/* Chat Widget */}
      {isOpen && (
        <div className={`fixed bottom-6 right-6 z-50 ${widgetWidth} max-w-[calc(100vw-2rem)] ${widgetHeight} max-h-[calc(100vh-4rem)]
          bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800
          flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-300 transition-all`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-indigo-600 to-violet-600">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">{roleLabels[role]}</h3>
                <p className="text-xs text-white/70 flex items-center gap-1">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  En ligne
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title={isExpanded ? 'Réduire' : 'Agrandir'}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={openFullPage}
                className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Ouvrir en pleine page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-900/30 dark:to-violet-900/30 
                  rounded-full flex items-center justify-center mx-auto mb-4 animate-float">
                  <Sparkles className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  {welcomeMessage}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                  Posez-moi vos questions sur les certificats, les démarches administratives, 
                  ou toute autre information dont vous avez besoin.
                </p>

                {/* Suggestions */}
                <div className="space-y-2">
                  {suggestions.slice(0, 3).map((sugg, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(sugg.question)}
                      className="w-full text-left px-3 py-2.5 text-xs bg-gray-50 dark:bg-gray-800 
                        hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all duration-200
                        text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400
                        border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700"
                    >
                      {sugg.question}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg) => (
                  <MessageBubble 
                    key={msg.id} 
                    msg={msg} 
                    onTypingComplete={handleTypingComplete}
                  />
                ))}

                {/* Loading indicator */}
                {loading && (
                  <div className="flex gap-3 animate-in fade-in duration-200">
                    <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-800 px-4 py-3 rounded-2xl flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                      <span className="text-sm text-gray-500">L'assistant réfléchit...</span>
                    </div>
                  </div>
                )}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input avec Emoji Picker */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800 relative">
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-indigo-500/50 transition-all">
              {/* Bouton Emoji */}
              <div className="relative">
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="p-1.5 text-gray-400 hover:text-indigo-500 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="Ajouter un emoji"
                >
                  <Smile className="w-5 h-5" />
                </button>
                {showEmojiPicker && (
                  <EmojiPicker 
                    onSelect={handleEmojiSelect} 
                    onClose={() => setShowEmojiPicker(false)} 
                  />
                )}
              </div>

              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Posez votre question..."
                className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white 
                  placeholder-gray-400 focus:outline-none"
                disabled={loading}
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
                className="p-2 bg-gradient-to-r from-indigo-600 to-violet-600 
                  rounded-lg text-white hover:opacity-90 disabled:opacity-50 
                  disabled:cursor-not-allowed transition-opacity"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChatWidget;