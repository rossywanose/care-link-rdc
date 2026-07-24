import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  User,
  Building2,
  FileText,
  Search,
  QrCode,
  Download,
  Printer,
  Shield,
  AlertTriangle,
  HelpCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Clock,
  Mail,
  Phone,
  MessageCircle
} from 'lucide-react';

const Guide = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('overview');
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const sections = {
    overview: {
      title: 'Vue d\'ensemble',
      icon: BookOpen,
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-8 text-white">
            <h2 className="text-2xl font-bold mb-3">Bienvenue sur Care-Link RDC</h2>
            <p className="text-indigo-100 leading-relaxed">
              Care-Link RDC est la plateforme officielle de gestion des certificats de naissance
              et de décès en République Démocratique du Congo. Notre mission est de sécuriser
              et simplifier l'accès aux documents d'état civil pour tous les citoyens.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Shield,
                title: 'Sécurisé',
                desc: 'Cryptage AES-256, authentification JWT, données protégées conformément à la loi RDC.'
              },
              {
                icon: Clock,
                title: 'Rapide',
                desc: 'Obtention de certificats en 24-48h au lieu de semaines. Suivi en temps réel.'
              },
              {
                icon: User,
                title: 'Accessible',
                desc: 'Disponible 24/7 sur web et mobile. 5 langues nationales supportées.'
              }
            ].map((item, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all">
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center mb-4">
                  <item.icon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )
    },
    citizen: {
      title: 'Guide Citoyen',
      icon: User,
      content: (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Comment utiliser Care-Link en tant que Citoyen</h2>

          <div className="space-y-4">
            {[
              {
                step: 1,
                title: 'Créer un compte',
                desc: 'Cliquez sur "Commencer" ou "Créer un compte". Remplissez vos informations personnelles (nom, email, téléphone, province). Choisissez "Citoyen" comme type de compte.',
                icon: User
              },
              {
                step: 2,
                title: 'Se connecter',
                desc: 'Utilisez votre email et mot de passe pour accéder à votre tableau de bord. Vous pouvez activer "Se souvenir de moi" pour une connexion plus rapide.',
                icon: ArrowRight
              },
              {
                step: 3,
                title: 'Demander un certificat',
                desc: 'Dans votre dashboard, cliquez sur "Nouvelle demande". Sélectionnez le type (naissance ou décès). Remplissez le formulaire avec les informations requises. Joignez les documents justificatifs.',
                icon: FileText
              },
              {
                step: 4,
                title: 'Suivre la demande',
                desc: 'Consultez l\'état de votre demande en temps réel : En attente → En traitement → Approuvé/Rejeté. Vous recevrez des notifications par email et SMS.',
                icon: Search
              },
              {
                step: 5,
                title: 'Télécharger le certificat',
                desc: 'Une fois approuvé, votre certificat est disponible avec QR code de vérification. Vous pouvez le télécharger en PDF ou l\'imprimer directement.',
                icon: Download
              }
            ].map((item) => (
              <div key={item.step} className="flex gap-4 p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center text-white font-bold">
                    {item.step}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <item.icon className="w-5 h-5 text-indigo-600" />
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-amber-800 dark:text-amber-400 mb-1">Documents requis</h4>
                <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
                  <li>• Certificat de naissance/décès de l'hôpital (original)</li>
                  <li>• Pièce d'identité du demandeur (carte électorale, passeport)</li>
                  <li>• Acte de mariage (si applicable)</li>
                  <li>• Photos d'identité (format passeport)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )
    },
    hospital: {
      title: 'Guide Hôpital',
      icon: Building2,
      content: (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Comment utiliser Care-Link en tant qu'Hôpital</h2>

          <div className="space-y-4">
            {[
              {
                step: 1,
                title: 'Inscription hôpital',
                desc: 'Créez un compte avec le type "Hôpital". Fournissez votre nom officiel, numéro de licence médicale, et coordonnées. Votre compte sera vérifié par les autorités compétentes.',
                icon: Building2
              },
              {
                step: 2,
                title: 'Enregistrer une naissance',
                desc: 'Dans le dashboard, allez dans "Naissances" → "Nouvelle déclaration". Remplissez les informations du nouveau-né (nom, date, lieu, parents). Le système génère automatiquement un numéro de référence.',
                icon: FileText
              },
              {
                step: 3,
                title: 'Enregistrer un décès',
                desc: 'Allez dans "Décès" → "Nouvelle déclaration". Indiquez les informations du défunt, cause du décès, et informations du déclarant. Joignez le certificat médical de décès.',
                icon: XCircle
              },
              {
                step: 4,
                title: 'Gérer les certificats',
                desc: 'Consultez tous les certificats émis par votre établissement. Filtrez par date, type, ou statut. Vous pouvez imprimer ou renvoyer un certificat si nécessaire.',
                icon: Printer
              },
              {
                step: 5,
                title: 'Paiement et abonnement',
                desc: 'Accédez à la section "Paiement" pour gérer votre abonnement. Choisissez entre Mensuel (50$), Trimestriel (130$), ou Annuel (900$). Paiement par carte, Orange Money, Airtel Money, ou M-Pesa.',
                icon: Shield
              }
            ].map((item) => (
              <div key={item.step} className="flex gap-4 p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center text-white font-bold">
                    {item.step}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <item.icon className="w-5 h-5 text-indigo-600" />
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-emerald-800 dark:text-emerald-400 mb-1">Bonnes pratiques</h4>
                <ul className="text-sm text-emerald-700 dark:text-emerald-300 space-y-1">
                  <li>• Déclarez les naissances dans les 30 jours suivant l'accouchement</li>
                  <li>• Déclarez les décès dans les 24 heures</li>
                  <li>• Vérifiez toujours les informations avant de soumettre</li>
                  <li>• Gardez une copie papier de chaque certificat</li>
                  <li>• Mettez à jour votre profil en cas de changement d'adresse</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )
    },
    verify: {
      title: 'Vérifier un certificat',
      icon: QrCode,
      content: (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Comment vérifier un certificat</h2>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
            <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <QrCode className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Vérification par QR Code</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              Chaque certificat Care-Link contient un QR code unique. Scannez-le avec votre téléphone
              pour vérifier instantanément l'authenticité du document.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => navigate('/connexion')}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                Scanner un QR Code
              </button>
              <button
                onClick={() => navigate('/connexion')}
                className="px-6 py-3 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
              >
                Vérifier par numéro
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                Certificat valide
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Si le QR code est valide, vous verrez :
              </p>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Nom complet du titulaire
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Date de naissance/décès
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Lieu de naissance/décès
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Numéro de référence unique
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Hôpital émetteur
                </li>
              </ul>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-500" />
                Certificat invalide
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Si le QR code est invalide, vous verrez :
              </p>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                <li className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-500" />
                  Message d'erreur rouge
                </li>
                <li className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-500" />
                  Aucune information trouvée
                </li>
                <li className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-500" />
                  Suggestion de contacter le support
                </li>
                <li className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Alerte de possible fraude
                </li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    faq: {
      title: 'FAQ',
      icon: HelpCircle,
      content: (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Questions fréquemment posées</h2>

          <div className="space-y-3">
            {[
              {
                q: 'Combien de temps prend l\'obtention d\'un certificat ?',
                a: 'Une fois votre demande soumise avec tous les documents requis, le traitement prend en moyenne 24 à 48 heures ouvrables. Les demandes urgentes peuvent être traitées en 4 heures moyennant des frais supplémentaires.'
              },
              {
                q: 'Quels sont les frais pour un certificat ?',
                a: 'Pour les citoyens : les certificats de naissance sont gratuits pour la première copie. Les copies supplémentaires coûtent 5$. Les certificats de décès coûtent 10$. Pour les hôpitaux, l\'abonnement est de 50$/mois, 130$/trimestre, ou 900$/an.'
              },
              {
                q: 'Puis-je demander un certificat pour quelqu\'un d\'autre ?',
                a: 'Oui, mais vous devez fournir une procuration notariée ou prouver votre lien familial (parent, tuteur légal). Pour les enfants mineurs, les parents ou tuteurs légaux peuvent demander sans procuration.'
              },
              {
                q: 'Que faire si mon certificat est rejeté ?',
                a: 'Consultez la raison du rejet dans votre dashboard. Corrigez les informations manquantes ou incorrectes, puis soumettez à nouveau. Vous pouvez aussi contacter le support pour assistance.'
              },
              {
                q: 'Comment récupérer mon mot de passe oublié ?',
                a: 'Cliquez sur "Mot de passe oublié" sur la page de connexion. Entrez votre email. Vous recevrez un lien de réinitialisation valable 24 heures. Si vous n\'avez plus accès à votre email, contactez le support avec votre pièce d\'identité.'
              },
              {
                q: 'Les données sont-elles sécurisées ?',
                a: 'Absolument. Nous utilisons le cryptage AES-256, les tokens JWT pour l\'authentification, et les serveurs sont hébergés en RDC conformément à la loi sur la protection des données. Aucune donnée n\'est partagée avec des tiers.'
              },
              {
                q: 'Puis-je utiliser Care-Link sans internet ?',
                a: 'Non, une connexion internet est nécessaire. Cependant, notre application est optimisée pour fonctionner avec une connexion 3G/4G lente. Le mode hors-ligne est prévu pour une future mise à jour.'
              },
              {
                q: 'Comment contacter le support ?',
                a: 'Email : support@carelink-rdc.cd | Téléphone : +243 81 234 5678 | WhatsApp : +243 81 234 5679 | Chat en direct disponible du lundi au vendredi, 8h à 18h.'
              }
            ].map((faq, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <span className="font-medium text-gray-900 dark:text-white pr-4">{faq.q}</span>
                  {openFaq === index ? (
                    <ChevronUp className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  )}
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-6">
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-gray-700 pt-4">
                      {faq.a}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )
    },
    contact: {
      title: 'Contact & Support',
      icon: MessageCircle,
      content: (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Besoin d'aide ? Contactez-nous</h2>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Mail,
                title: 'Email',
                value: 'support@carelink-rdc.cd',
                desc: 'Réponse sous 24h',
                action: 'mailto:support@carelink-rdc.cd'
              },
              {
                icon: Phone,
                title: 'Téléphone',
                value: '+243 81 234 5678',
                desc: 'Lun-Ven, 8h-18h',
                action: 'tel:+243812345678'
              },
              {
                icon: MessageCircle,
                title: 'WhatsApp',
                value: '+243 81 234 5679',
                desc: 'Disponible 24/7',
                action: 'https://wa.me/243812345679'
              }
            ].map((contact, i) => (
              <a
                key={i}
                href={contact.action}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-700 transition-all group"
              >
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-600 transition-colors">
                  <contact.icon className="w-6 h-6 text-indigo-600 dark:text-indigo-400 group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{contact.title}</h3>
                <p className="text-indigo-600 dark:text-indigo-400 font-medium mb-1">{contact.value}</p>
                <p className="text-sm text-gray-500">{contact.desc}</p>
              </a>
            ))}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-6">Envoyer un message</h3>
            <form className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nom</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Votre nom"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="vous@exemple.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sujet</label>
                <select className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option>Problème technique</option>
                  <option>Question sur un certificat</option>
                  <option>Demande de partenariat</option>
                  <option>Signaler un bug</option>
                  <option>Autre</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Message</label>
                <textarea
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  placeholder="Décrivez votre problème en détail..."
                />
              </div>
              <button
                type="button"
                onClick={() => alert('Message envoyé ! (Simulation)')}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                Envoyer le message
              </button>
            </form>
          </div>
        </div>
      )
    }
  };

  const currentSection = sections[activeSection];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Top Bar */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-semibold">Care-Link RDC</span>
            </button>
            <button
              onClick={() => navigate('/connexion')}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all"
            >
              Se connecter
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 sticky top-24">
              <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 px-2">
                Guide d'utilisation
              </h2>
              <nav className="space-y-1">
                {Object.entries(sections).map(([key, section]) => (
                  <button
                    key={key}
                    onClick={() => setActiveSection(key)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${activeSection === key
                      ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                  >
                    <section.icon className="w-5 h-5" />
                    {section.title}
                    <ChevronRight className={`w-4 h-4 ml-auto transition-transform ${activeSection === key ? 'rotate-90 text-indigo-600' : 'text-gray-400'
                      }`} />
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <currentSection.icon className="w-8 h-8 text-indigo-600" />
                {currentSection.title}
              </h1>
            </div>
            {currentSection.content}
          </div>
        </div>
      </div>

      {/* Simple Footer */}
      <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} Care-Link RDC. Tous droits réservés.
            </p>
            <div className="flex gap-6 text-sm">
              <button onClick={() => navigate('/confidentialite')} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">Confidentialité</button>
              <button onClick={() => navigate('/conditions')} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">Conditions</button>
              <button onClick={() => navigate('/cookies')} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">Cookies</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Guide;