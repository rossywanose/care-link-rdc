import React, { useState, useRef, useEffect } from 'react';
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Loader2,
  Sparkles,
  FileText,
  Shield,
  Building2,
  Baby,
  Skull,
  HelpCircle,
  ChevronRight,
  Clock,
  MapPin,
  Phone,
  Mail,
  AlertCircle,
  CheckCircle2,
  Copy,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Bonjour ! Je suis **CARE Assistant**, votre guide intelligent pour la gestion de l\'état civil en RDC. Comment puis-je vous aider aujourd\'hui ?',
      timestamp: new Date(),
      suggestions: [
        'Comment déclarer une naissance ?',
        'Quels documents sont requis ?',
        'Comment suivre mon certificat ?',
        'Contacter un hôpital'
      ]
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, isMinimized]);

  // Knowledge base for AI responses
  const knowledgeBase = {
    naissance: {
      keywords: ['naissance', 'declarer naissance', 'certificat naissance', 'nouveau né', 'bébé', 'enfant'],
      response: `**Pour déclarer une naissance, voici les étapes :**

1. **Dans un hôpital** (délai : 24h après l'accouchement)
   - Le médecin remplit le certificat médical
   - Les parents fournissent leurs pièces d'identité
   - L'hôpital transmet à l'état civil

2. **Documents requis :**
   - Certificat médical de naissance
   - Pièce d'identité des parents
   - Acte de mariage (si applicable)

3. **Frais :** Gratuit dans les 30 jours, puis frais de retard

4. **Suivi :** Vous recevez un numéro de suivi (ex: CERT-2024-XXXX)`,
      actions: [
        { label: 'Voir les hôpitaux', icon: Building2 },
        { label: 'Suivre un certificat', icon: FileText }
      ]
    },
    deces: {
      keywords: ['deces', 'décès', 'mort', 'certificat deces', 'declaration deces'],
      response: `**Pour déclarer un décès, suivez ces étapes :**

1. **Délai :** Dans les 24h après le décès

2. **Documents requis :**
   - Certificat de décès médical
   - Pièce d'identité du défunt
   - Pièce d'identité du déclarant
   - Rapport de police (en cas d'accident)

3. **Procédure :**
   - L'hôpital ou le médecin établit le constat
   - La famille déclare à la mairie
   - L'état civil enregistre l'acte

4. **Frais :** Gratuit dans les délais légaux`,
      actions: [
        { label: 'Trouver un hôpital', icon: Building2 },
        { label: 'Signaler un problème', icon: AlertCircle }
      ]
    },
    documents: {
      keywords: ['document', 'documents', 'papier', 'pièce', 'identité', 'acte', 'extrait'],
      response: `**Documents requis pour l'état civil :**

**Pour une naissance :**
- Certificat médical de naissance
- Pièce d'identité des parents (passeport, carte d'électeur, permis)
- Acte de mariage (si mariés)

**Pour un décès :**
- Certificat de décès médical
- Pièce d'identité du défunt
- Pièce d'identité du déclarant
- Rapport médico-légal (si nécessaire)

**Pour un mariage :**
- Extrait d'acte de naissance des deux époux
- Pièces d'identité
- Certificat de célibat
- Acte de consentement (si mineur)`,
      actions: [
        { label: 'Vérifier mes documents', icon: FileText }
      ]
    },
    suivi: {
      keywords: ['suivre', 'suivi', 'statut', 'où en est', 'numéro', 'certificat', 'retrouver'],
      response: `**Pour suivre votre certificat :**

1. **Connectez-vous** à votre espace citoyen
2. **Allez dans** "Mes Certificats"
3. **Entrez votre numéro** de suivi (format: CERT-2024-XXXX)

**Les statuts possibles :**
- 🟡 **En attente** : En cours de traitement
- 🟢 **Validé** : Prêt à être retiré
- 🔴 **Rejeté** : Documents incomplets

**Délai moyen :** 3 à 7 jours ouvrables

Vous pouvez aussi contacter l'hôpital de déclaration directement.`,
      actions: [
        { label: 'Mes certificats', icon: FileText },
        { label: 'Contacter support', icon: Phone }
      ]
    },
    hopital: {
      keywords: ['hopital', 'hôpital', 'clinique', 'centre medical', 'trouver', 'adresse', 'contact'],
      response: `**Hôpitaux partenaires CARE :**

**Kinshasa :**
- Hôpital Général de Kinshasa (Gombe)
- Clinique Saint-Joseph (Lingwala)
- Centre Médical de Lukasa (Bandal)

**Haut-Katanga :**
- Hôpital Provincial du Haut-Katanga (Lubumbashi)

**Pour trouver un hôpital :**
1. Utilisez la carte interactive
2. Filtrez par province et commune
3. Vérifiez les services disponibles

**Contact général :** +243 81 234 5678`,
      actions: [
        { label: 'Voir la carte', icon: MapPin },
        { label: 'Liste complète', icon: Building2 }
      ]
    },
    paiement: {
      keywords: ['paiement', 'payer', 'tarif', 'prix', 'cout', 'coût', 'gratuit', 'frais'],
      response: `**Tarification des services :**

**Déclarations (dans les délais) :**
- Naissance : **Gratuit**
- Décès : **Gratuit**

**En cas de retard :**
- Frais administratifs selon la durée

**Certificats :**
- 1ère copie : **Gratuite**
- Duplicata : 5 000 FC

**Abonnement hôpital :**
- Mensuel : 50$
- Trimestriel : 130$
- Annuel : 900$

**Paiement acceptés :** Carte bancaire, Orange Money, Airtel Money, M-Pesa`,
      actions: [
        { label: 'Voir les forfaits', icon: FileText }
      ]
    },
    signalement: {
      keywords: ['signaler', 'probleme', 'problème', 'erreur', 'fraude', 'anomalie', 'plainte'],
      response: `**Pour signaler un problème :**

1. **Connectez-vous** à votre espace
2. **Allez dans** "Signalement"
3. **Remplissez le formulaire** avec :
   - Type de problème
   - Description détaillée
   - Pièces jointes (photos/documents)
   - Localisation

**Types de signalements :**
- Erreur sur un acte
- Fraude documentaire
- Problème avec un hôpital
- Retard anormal
- Autre

**Traitement :** Vous recevez une réponse sous 48h.`,
      actions: [
        { label: 'Faire un signalement', icon: AlertCircle },
        { label: 'Voir mes signalements', icon: FileText }
      ]
    },
    contact: {
      keywords: ['contact', 'appeler', 'téléphone', 'email', 'aide', 'support', 'assistance'],
      response: `**Contactez-nous :**

📞 **Téléphone :** +243 81 234 5678
📧 **Email :** support@care-link-rdc.com
🕐 **Horaires :** Lun-Ven, 8h-17h

**Services :**
- Support technique
- Questions sur les certificats
- Problèmes de connexion
- Réclamations

**Urgence :** Pour un problème urgent en dehors des horaires, utilisez le formulaire de signalement.`,
      actions: [
        { label: 'Envoyer un email', icon: Mail },
        { label: 'Appeler', icon: Phone }
      ]
    },
    profil: {
      keywords: ['profil', 'compte', 'mot de passe', 'modifier', 'informations', 'photo'],
      response: `**Gestion de votre profil :**

**Pour modifier vos informations :**
1. Allez dans "Paramètres" → "Profil"
2. Cliquez sur "Modifier"
3. Changez vos informations
4. Sauvegardez

**Ce que vous pouvez modifier :**
- Photo de profil
- Coordonnées (email, téléphone)
- Adresse
- Mot de passe
- Préférences de notification

**Note :** Certaines informations (nom, date de naissance) nécessitent une vérification.`,
      actions: [
        { label: 'Mon profil', icon: User }
      ]
    },
    autorite: {
      keywords: ['autorite', 'autorité', 'agent', 'etat civil', 'mairie', 'validation', 'admin'],
      response: `**Espace Autorité :**

**Fonctionnalités réservées aux agents :**
- Validation des certificats
- Gestion des hôpitaux
- Génération de rapports
- Audit et traçabilité
- Statistiques nationales

**Pour les agents :**
Connectez-vous avec vos identifiants professionnels pour accéder à ces fonctionnalités.

**Contact administration :** admin@care-link-rdc.com`,
      actions: [
        { label: 'Espace autorité', icon: Shield }
      ]
    }
  };

  const findBestResponse = (query) => {
    const lowerQuery = query.toLowerCase();
    let bestMatch = null;
    let bestScore = 0;

    for (const [key, data] of Object.entries(knowledgeBase)) {
      let score = 0;
      for (const keyword of data.keywords) {
        if (lowerQuery.includes(keyword.toLowerCase())) {
          score += 1;
        }
      }
      if (score > bestScore) {
        bestScore = score;
        bestMatch = data;
      }
    }

    if (bestScore === 0) {
      return {
        response: `Je n'ai pas trouvé de réponse précise à votre question. Voici ce que je peux faire :

• Répondre sur les **naissances** et **décès**
• Expliquer les **documents requis**
• Aider au **suivi des certificats**
• Trouver un **hôpital**
• Informer sur les **tarifs**
• Guider pour un **signalement**

Pourriez-vous reformuler ou choisir un sujet ci-dessus ?`,
        actions: [
          { label: 'Voir l\'aide complète', icon: HelpCircle },
          { label: 'Contacter support', icon: Phone }
        ]
      };
    }

    return bestMatch;
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Simulate AI thinking time
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 700));

    const response = findBestResponse(userMessage.content);

    const assistantMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response.response,
      timestamp: new Date(),
      actions: response.actions,
      suggestions: response.suggestions
    };

    setMessages(prev => [...prev, assistantMessage]);
    setIsLoading(false);
  };

  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion);
    // Auto-send after a brief delay
    setTimeout(() => {
      const fakeEvent = { preventDefault: () => {} };
      handleSend();
    }, 100);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyMessage = (content) => {
    navigator.clipboard?.writeText(content.replace(/\*\*/g, ''));
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessageContent = (content) => {
    // Simple markdown-like rendering
    const parts = content.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold text-gray-900 dark:text-white">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('• ')) {
        return <div key={i} className="ml-4">{part}</div>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-full shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:scale-110 transition-all flex items-center justify-center group"
        title="CARE Assistant"
      >
        <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-gray-900"></span>
      </button>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex flex-col transition-all duration-300 ${
      isMinimized ? 'w-72 h-14' : 'w-[400px] h-[600px] max-h-[80vh]'
    }`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-t-2xl p-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">CARE Assistant</h3>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
              <span className="text-xs text-white/80">En ligne</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            title={isMinimized ? 'Agrandir' : 'Minimiser'}
          >
            {isMinimized ? <ChevronRight className="w-4 h-4 rotate-90" /> : <ChevronRight className="w-4 h-4 -rotate-90" />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            title="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 bg-white dark:bg-gray-900 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  message.role === 'assistant'
                    ? 'bg-gradient-to-br from-indigo-500 to-violet-600'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}>
                  {message.role === 'assistant' ? (
                    <Bot className="w-4 h-4 text-white" />
                  ) : (
                    <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  )}
                </div>

                {/* Message bubble */}
                <div className={`max-w-[80%] ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`rounded-2xl px-4 py-3 text-sm whitespace-pre-line ${
                    message.role === 'assistant'
                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-none'
                      : 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-tr-none'
                  }`}>
                    {renderMessageContent(message.content)}
                  </div>
                  <div className={`flex items-center gap-2 mt-1 ${message.role === 'user' ? 'justify-end' : ''}`}>
                    <span className="text-xs text-gray-400">{formatTime(message.timestamp)}</span>
                    {message.role === 'assistant' && (
                      <button
                        onClick={() => copyMessage(message.content)}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        title="Copier"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* Action buttons */}
                  {message.actions && message.role === 'assistant' && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {message.actions.map((action, i) => (
                        <button
                          key={i}
                          onClick={() => alert(`Navigation: ${action.label}`)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-medium hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors"
                        >
                          <action.icon className="w-3 h-3" />
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Suggestions */}
                  {message.suggestions && message.role === 'assistant' && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {message.suggestions.map((suggestion, i) => (
                        <button
                          key={i}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="px-3 py-1.5 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 rounded-full text-xs hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-tl-none px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
                    <span className="text-sm text-gray-500">CARE Assistant réfléchit...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-4 rounded-b-2xl">
            <div className="flex items-end gap-2">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Posez votre question..."
                  rows={1}
                  className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 border-0 rounded-xl text-gray-900 dark:text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 max-h-32"
                  style={{ minHeight: '44px' }}
                />
              </div>
              <button
                onClick={handleSend}
                disabled={!inputValue.trim() || isLoading}
                className="p-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 flex-shrink-0"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="text-center text-xs text-gray-400 mt-2">
              CARE Assistant peut faire des erreurs. Vérifiez les informations importantes.
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatWidget;