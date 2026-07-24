import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Code, 
  Smartphone, 
  Globe, 
  Cpu, 
  Heart, 
  Award, 
  Users, 
  Building2,
  ArrowRight,
  Mail,
  MapPin,
  Phone,
  Linkedin,
  Github,
  Facebook,
  ExternalLink,
  Shield,
  Zap,
  Fingerprint,
  MessageCircle
} from 'lucide-react';

// 👇 IMPORTS CORRIGÉS — Header + Footer depuis LandingPage
import Header from '../LandingPage/Header';
import Footer from '../LandingPage/Footer';

const APropos = () => {
  const skills = [
    { icon: Code, label: 'Développement Web', desc: 'React, Django, Node.js, APIs REST' },
    { icon: Smartphone, label: 'Applications Mobiles', desc: 'React Native, Flutter, PWA' },
    { icon: Globe, label: 'Conception Web', desc: 'UI/UX, Responsive, Accessibilité' },
    { icon: Cpu, label: 'Ingénierie Logicielle', desc: 'Architecture, DevOps, Cloud' },
  ];

  const values = [
    { icon: Heart, title: 'Impact Social', desc: 'La technologie au service de la santé et de l\'état civil en RDC.' },
    { icon: Shield, title: 'Sécurité', desc: 'Données chiffrées, authentification JWT, conformité RGPD.' },
    { icon: Zap, title: 'Innovation', desc: 'Intégration IA, QR codes, signatures numériques.' },
    { icon: Fingerprint, title: 'Accessibilité', desc: '5 langues nationales, mode sombre, design inclusif.' },
  ];

  const stats = [
    { value: '3', label: 'Rôles Utilisateurs', icon: Users },
    { value: '5', label: 'Langues Supportées', icon: Globe },
    { value: '50+', label: 'Hôpitaux Partenaires', icon: Building2 },
    { value: '100%', label: 'Sécurisé & Traçable', icon: Shield },
  ];

  // 🔗 LIENS RÉELS DE IR. ROSSY WANOSE
  const socialLinks = [
    { 
      icon: Mail, 
      label: 'Email', 
      href: 'mailto:skyrossywanose@gmail.com',
      display: 'skyrossywanose@gmail.com'
    },
    { 
      icon: MessageCircle, 
      label: 'WhatsApp', 
      href: 'https://wa.me/243890030685',
      display: '+243 890 030 685'
    },
    { 
      icon: Facebook, 
      label: 'Facebook', 
      href: 'https://www.facebook.com/profile.php?id=100078316360059',
      display: 'Ir Rossy Wanose'
    },
    { 
      icon: Linkedin, 
      label: 'LinkedIn', 
      href: 'https://www.linkedin.com/in/skyrossy-wanose-1716273ab',
      display: 'Skyrossy Wanose'
    },
    { 
      icon: Globe, 
      label: 'Site Web', 
      href: 'https://www.skybusiness.kesug.com',
      display: 'skybusiness.kesug.com'
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* ===== HEADER ===== */}
      <Header />

      {/* ===== HERO SECTION ===== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-violet-900 to-purple-900 dark:from-gray-900 dark:via-indigo-950 dark:to-violet-950 pt-32 pb-24 md:pt-40 md:pb-32">
        {/* Animated background shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-8">
            <Award className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-medium text-white/90">Plateforme Nationale RDC</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight">
            Care-Link <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">RDC</span>
          </h1>

          <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto mb-4 leading-relaxed">
            La plateforme numérique de gestion des certificats de naissance et de décès 
            en République Démocratique du Congo.
          </p>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Conçue et développée par des ingénieurs congolais, pour les Congolais.
          </p>
        </div>
      </section>

      {/* ===== MISSION SECTION ===== */}
      <section className="py-20 md:py-28 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                Notre Mission
              </h2>
              <div className="space-y-4 text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                <p>
                  En RDC, des millions de naissances et de décès ne sont pas enregistrés officiellement, 
                  privant les citoyens de leurs droits fondamentaux.
                </p>
                <p>
                  <strong className="text-indigo-600 dark:text-indigo-400">Care-Link RDC</strong> révolutionne 
                  ce processus en numérisant l\'état civil, garantissant à chaque Congolais un accès 
                  sécurisé et immédiat à ses documents officiels.
                </p>
                <p>
                  Notre vision : un Congo où chaque citoyen possède une identité numérique 
                  fiable, traçable et accessible partout.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat, index) => (
                <div 
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 
                    hover:shadow-lg hover:shadow-indigo-500/10 hover:border-indigo-200 dark:hover:border-indigo-800
                    transition-all duration-300 group"
                >
                  <stat.icon className="w-8 h-8 text-indigo-600 dark:text-indigo-400 mb-3 group-hover:scale-110 transition-transform" />
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== CREATOR SECTION ===== */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 
              text-indigo-700 dark:text-indigo-300 text-sm font-medium mb-4">
              Fondateur & Lead Developer
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              L\'Esprit derrière Care-Link
            </h2>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 md:p-12 
              border border-gray-100 dark:border-gray-700 shadow-xl shadow-indigo-500/5">
              <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">

                {/* 👇 AVATAR PLACEHOLDER — À REMPLACER PAR TA PHOTO */}
                     <div className="flex-shrink-0">
                       <img 
                         src={require('../../../assets/images/rossy-wanose.png')} 
                         alt="Ir. Rossy Wanose"
                         className="w-32 h-32 md:w-40 md:h-40 rounded-2xl object-cover shadow-lg"
                       />
                     </div>
                {/* 👆 FIN AVATAR PLACEHOLDER */}

                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Ir. Rossy Wanose
                  </h3>
                  <p className="text-indigo-600 dark:text-indigo-400 font-medium text-lg mb-4">
                    Ingénieur Logiciel & Programmeur
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                    Passionné par la technologie et son impact social, j\'ai conçu Care-Link RDC 
                    pour répondre à un besoin critique : la digitalisation de l\'état civil en RDC. 
                    Mon expertise en développement web, applications mobiles et architecture logicielle 
                    m\'a permis de bâtir une plateforme robuste, sécurisée et accessible à tous.
                  </p>

                  {/* Skills */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                    {skills.map((skill, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 rounded-xl 
                        bg-gray-50 dark:bg-gray-700/50">
                        <div className="flex-shrink-0 w-10 h-10 rounded-lg 
                          bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                          <skill.icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white text-sm">{skill.label}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{skill.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Social links — LIENS RÉELS */}
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                    {socialLinks.map((social, index) => (
                      <a
                        key={index}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg 
                          bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300
                          hover:bg-indigo-100 dark:hover:bg-indigo-900/30 
                          hover:text-indigo-600 dark:hover:text-indigo-400
                          transition-all duration-300 text-sm font-medium"
                        title={social.label}
                      >
                        <social.icon className="w-4 h-4" />
                        <span className="hidden sm:inline">{social.display}</span>
                        <ExternalLink className="w-3 h-3 opacity-50" />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== VALUES SECTION ===== */}
      <section className="py-20 md:py-28 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Nos Valeurs
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Les principes qui guident chaque ligne de code et chaque décision de Care-Link RDC.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div 
                key={index}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 
                  border border-gray-100 dark:border-gray-700
                  hover:shadow-lg hover:shadow-indigo-500/10 hover:-translate-y-1
                  transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100 
                  dark:from-indigo-900/30 dark:to-violet-900/30
                  flex items-center justify-center mb-4">
                  <value.icon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{value.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TECH STACK SECTION ===== */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Technologies Utilisées
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Une stack moderne et robuste, choisie pour la performance et la sécurité.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Frontend */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Code className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Frontend</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {['React 18', 'Tailwind CSS', 'React Router', 'Axios', 'Recharts', 'Lucide React'].map((tech) => (
                  <span key={tech} className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 
                    text-sm text-gray-700 dark:text-gray-300 font-medium">
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Backend */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <Cpu className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Backend</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {['Django 4.2', 'Django REST', 'PostgreSQL', 'JWT Auth', 'Celery', 'Redis'].map((tech) => (
                  <span key={tech} className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 
                    text-sm text-gray-700 dark:text-gray-300 font-medium">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-indigo-900 via-violet-900 to-purple-900 
        dark:from-gray-900 dark:via-indigo-950 dark:to-violet-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Rejoignez la Révolution Numérique
          </h2>
          <p className="text-lg text-white/80 mb-10 max-w-2xl mx-auto">
            Que vous soyez hôpital, citoyen ou autorité, Care-Link RDC est là pour simplifier 
            la gestion de l\'état civil en République Démocratique du Congo.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/inscription"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 
                bg-white text-indigo-900 rounded-xl font-bold text-lg
                hover:bg-indigo-50 transition-all duration-300
                shadow-lg shadow-black/20"
            >
              Commencer Maintenant
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 
                bg-white/10 backdrop-blur-sm text-white border border-white/20 
                rounded-xl font-bold text-lg
                hover:bg-white/20 transition-all duration-300"
            >
              Nous Contacter
            </Link>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <Footer />
    </div>
  );
};

export default APropos;