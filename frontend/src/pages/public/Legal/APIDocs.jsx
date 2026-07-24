import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Code, 
  Lock, 
  Server, 
  Mail,
  ArrowRight,
  CheckCircle,
  FileKey,
  Clock,
  Fingerprint,
  Globe,
  Zap,
  Database,
  Activity,
  Baby,
  Heart,
  CreditCard,
  FileText,
  Bell
} from 'lucide-react';
import Header from '../LandingPage/Header';
import Footer from '../LandingPage/Footer';

const APIDocs = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Lock,
      title: 'Authentification OAuth2 + JWT',
      desc: 'Tokens securises avec double rotation (acces 15 min / rafraichissement 7 jours). Authentification multi-facteurs disponible.',
      color: 'indigo'
    },
    {
      icon: Server,
      title: 'Architecture REST JSON',
      desc: 'API conforme aux standards REST avec payloads JSON. Support complet des methodes HTTP (GET, POST, PUT, DELETE, PATCH).',
      color: 'violet'
    },
    {
      icon: Shield,
      title: 'Securite de niveau entreprise',
      desc: 'Cryptage TLS 1.3, rate limiting, validation stricte des entrees, protection CSRF/XSS et audit complet des acces.',
      color: 'emerald'
    },
    {
      icon: FileKey,
      title: 'Controle d\'acces par roles',
      desc: 'Systeme RBAC granulaire : citoyen, hopital, autorite, administrateur. Chaque role a des permissions strictement definies.',
      color: 'blue'
    },
    {
      icon: Clock,
      title: 'Rate limiting intelligent',
      desc: 'Limites adaptatives par IP et par utilisateur. Protection contre les attaques par force brute et le scraping automatise.',
      color: 'amber'
    },
    {
      icon: Fingerprint,
      title: 'Traçabilite complete',
      desc: 'Journal d\'audit immuable pour chaque action. Historique des connexions, modifications et validations consultable en temps reel.',
      color: 'rose'
    },
  ];

  const resources = [
    {
      icon: Baby,
      title: 'Certificats de Naissance',
      desc: 'Creation, consultation, validation hierarchique et generation PDF securisee des certificats de naissance.',
      color: 'emerald'
    },
    {
      icon: Heart,
      title: 'Certificats de Deces',
      desc: 'Gestion complete des certificats de deces avec workflow de validation et delivrance officielle.',
      color: 'rose'
    },
    {
      icon: Activity,
      title: 'Gestion des Hopitaux',
      desc: 'Enregistrement des etablissements de sante, abonnements, statistiques et tableaux de bord.',
      color: 'blue'
    },
    {
      icon: CreditCard,
      title: 'Paiements & Abonnements',
      desc: 'Integration des paiements securises, gestion des plans et renouvellements automatiques.',
      color: 'amber'
    },
    {
      icon: FileText,
      title: 'Rapports & Signalements',
      desc: 'Rapports statistiques officiels et systeme de signalement citoyen integre.',
      color: 'violet'
    },
    {
      icon: Bell,
      title: 'Notifications',
      desc: 'Systeme de notifications en temps reel avec preferences personnalisables par utilisateur.',
      color: 'cyan'
    },
  ];

  const categoryColors = {
    indigo: 'from-indigo-500 to-violet-500',
    emerald: 'from-emerald-500 to-teal-500',
    rose: 'from-rose-500 to-pink-500',
    blue: 'from-blue-500 to-cyan-500',
    amber: 'from-amber-500 to-orange-500',
    violet: 'from-violet-500 to-purple-500',
    cyan: 'from-cyan-500 to-sky-500',
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />

      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-violet-900 to-indigo-950 py-20 lg:py-28">
          <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6">
                <Code className="w-4 h-4 text-indigo-300" />
                <span className="text-sm font-medium text-indigo-200">API REST v1.0</span>
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6">
                API <span className="bg-gradient-to-r from-indigo-300 to-violet-300 bg-clip-text text-transparent">Care-Link RDC</span>
              </h1>

              <p className="text-lg text-indigo-200 mb-8 leading-relaxed">
                Interface de programmation securisee pour l'integration des certificats 
                d'etat civil dans les systemes de sante de la Republique Democratique du Congo.
                Acces reserve aux partenaires institutionnels agrees.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={() => navigate('/contact')}
                  className="px-8 py-3.5 bg-white text-indigo-900 rounded-xl font-semibold hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  Demander un acces API
                </button>
                <button 
                  onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
                  className="px-8 py-3.5 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl font-semibold hover:bg-white/20 transition-all flex items-center justify-center gap-2"
                >
                  Decouvrir les fonctionnalites
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Securite & Conformite */}
        <section className="py-16 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full px-4 py-2 mb-6">
                <Shield className="w-4 h-4" />
                <span className="text-sm font-semibold">Securite & Conformite</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Standards de securite
              </h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                L'API Care-Link RDC est concue selon les meilleures pratiques de l'industrie 
                et les recommandations OWASP API Security Top 10.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, i) => (
                <div 
                  key={i} 
                  className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 hover:border-indigo-500/30 dark:hover:border-indigo-500/30 transition-all hover:shadow-lg hover:shadow-indigo-500/5 group"
                >
                  <div className={`w-14 h-14 bg-gradient-to-br ${categoryColors[feature.color]} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Ressources de l'API */}
        <section id="features" className="py-16 bg-gray-50 dark:bg-gray-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-violet-500/10 text-violet-600 dark:text-violet-400 rounded-full px-4 py-2 mb-6">
                <Database className="w-4 h-4" />
                <span className="text-sm font-semibold">Ressources</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Domaines fonctionnels
              </h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                L'API couvre l'ensemble du cycle de vie des certificats d'etat civil 
                avec 6 domaines fonctionnels principaux.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resources.map((res, i) => (
                <div 
                  key={i} 
                  className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${categoryColors[res.color]} rounded-xl flex items-center justify-center`}>
                      <res.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{res.title}</h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{res.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Processus d'integration */}
        <section className="py-16 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full px-4 py-2 mb-6">
                <Zap className="w-4 h-4" />
                <span className="text-sm font-semibold">Integration</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Comment integrer l'API
              </h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Processus simple et securise en 4 etapes pour les partenaires institutionnels.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  step: '01',
                  title: 'Demande d\'acces',
                  desc: 'Soumettez votre demande via le formulaire de contact avec les informations de votre institution.',
                  icon: Mail
                },
                {
                  step: '02',
                  title: 'Validation',
                  desc: 'Notre equipe verifie votre statut institutionnel et vous attribue des credentials securises.',
                  icon: Shield
                },
                {
                  step: '03',
                  title: 'Documentation',
                  desc: 'Accedez a la documentation technique complete et a l\'environnement de test (sandbox).',
                  icon: Code
                },
                {
                  step: '04',
                  title: 'Mise en production',
                  desc: 'Integrez l\'API dans votre systeme avec le support dedie de notre equipe technique.',
                  icon: Globe
                },
              ].map((item, i) => (
                <div key={i} className="relative">
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 h-full">
                    <div className="text-4xl font-bold text-indigo-200 dark:text-indigo-900 mb-4">{item.step}</div>
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-xl flex items-center justify-center mb-4">
                      <item.icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{item.desc}</p>
                  </div>
                  {i < 3 && (
                    <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                      <ArrowRight className="w-6 h-6 text-gray-300 dark:text-gray-700" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section className="py-16 bg-gray-50 dark:bg-gray-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-br from-indigo-900 via-violet-900 to-indigo-950 rounded-3xl p-8 lg:p-12 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/20 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl" />

              <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6">
                    <Mail className="w-8 h-8 text-indigo-300" />
                  </div>

                  <h3 className="text-3xl font-bold mb-4">
                    Demandez votre acces API
                  </h3>

                  <p className="text-indigo-200 mb-8 leading-relaxed">
                    Vous representez un etablissement de sante, une ONG ou un partenaire 
                    gouvernemental ? Contactez-nous pour obtenir vos identifiants d'acces 
                    securises a l'API Care-Link RDC.
                  </p>

                  <button 
                    onClick={() => navigate('/contact')}
                    className="px-8 py-4 bg-white text-indigo-900 rounded-xl font-bold hover:shadow-xl transition-all hover:scale-105 flex items-center gap-2"
                  >
                    Contacter l'equipe API
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  {[
                    'Onboarding personnalise avec un expert technique',
                    'Documentation complete et specifications OpenAPI',
                    'Environnement de test (sandbox) isole',
                    'Support dedie pendant l\'integration',
                    'Acces aux mises a jour et nouvelles fonctionnalites'
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                      <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                      <span className="text-indigo-100">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default APIDocs;