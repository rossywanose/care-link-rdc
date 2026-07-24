import React, { useState, useEffect, useRef } from 'react';
import { Building2, User, FileText, Globe, Scale, MapPin, Mail, Phone, ExternalLink, ChevronRight, Shield, Clock, BookOpen, AlertTriangle } from 'lucide-react';
import Header from '../LandingPage/Header';
import Footer from '../LandingPage/Footer';

const MentionsLegales = () => {
  const [visibleSections, setVisibleSections] = useState(new Set());
  const [headerVisible, setHeaderVisible] = useState(false);
  const [contactVisible, setContactVisible] = useState(false);
  const sectionRefs = useRef([]);

  // Animation d'entrée du header
  useEffect(() => {
    const timer = setTimeout(() => setHeaderVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Intersection Observer pour les sections
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.dataset.index);
            setVisibleSections((prev) => new Set([...prev, index]));
          }
        });
      },
      { threshold: 0.2, rootMargin: '0px 0px -50px 0px' }
    );

    sectionRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    // Observer pour la section contact
    const contactRef = document.getElementById('contact-section');
    if (contactRef) {
      const contactObserver = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setContactVisible(true);
        },
        { threshold: 0.3 }
      );
      contactObserver.observe(contactRef);
      return () => {
        observer.disconnect();
        contactObserver.disconnect();
      };
    }

    return () => observer.disconnect();
  }, []);

  const sections = [
    {
      icon: Building2,
      title: 'Éditeur du site',
      content: 'Care-Link RDC est une initiative du Ministère de la Santé Publique de la République Démocratique du Congo. La plateforme est développée et maintenue par une équipe d\'ingénieurs congolais en collaboration avec les partenaires techniques.',
      accent: 'from-blue-500 to-indigo-500',
      bgAccent: 'bg-blue-50 dark:bg-blue-900/20',
      borderAccent: 'border-blue-200 dark:border-blue-800',
      iconColor: 'text-blue-600 dark:text-blue-400'
    },
    {
      icon: User,
      title: 'Directeur de publication',
      content: 'Le directeur de publication est le Ministre de la Santé Publique de la RDC. Pour toute question relative au contenu publié, veuillez contacter le service communication du ministère.',
      accent: 'from-indigo-500 to-violet-500',
      bgAccent: 'bg-indigo-50 dark:bg-indigo-900/20',
      borderAccent: 'border-indigo-200 dark:border-indigo-800',
      iconColor: 'text-indigo-600 dark:text-indigo-400'
    },
    {
      icon: FileText,
      title: 'Hébergement',
      content: 'La plateforme est hébergée sur des serveurs sécurisés situés en République Démocratique du Congo, conformément aux exigences de souveraineté des données. L\'hébergement est assuré par des partenaires locaux certifiés.',
      accent: 'from-violet-500 to-purple-500',
      bgAccent: 'bg-violet-50 dark:bg-violet-900/20',
      borderAccent: 'border-violet-200 dark:border-violet-800',
      iconColor: 'text-violet-600 dark:text-violet-400'
    },
    {
      icon: Globe,
      title: 'Propriété intellectuelle',
      content: 'L\'ensemble du contenu de Care-Link RDC (textes, images, logos, code source) est protégé par le droit d\'auteur. Toute reproduction, représentation ou diffusion, totale ou partielle, sans autorisation préalable est interdite.',
      accent: 'from-purple-500 to-pink-500',
      bgAccent: 'bg-purple-50 dark:bg-purple-900/20',
      borderAccent: 'border-purple-200 dark:border-purple-800',
      iconColor: 'text-purple-600 dark:text-purple-400'
    },
    {
      icon: Scale,
      title: 'Droit applicable',
      content: 'Les présentes mentions légales sont soumises au droit congolais. En cas de litige, les tribunaux de Kinshasa seront seuls compétents. Les utilisateurs reconnaissent avoir pris connaissance de ces mentions et les acceptent sans réserve.',
      accent: 'from-pink-500 to-rose-500',
      bgAccent: 'bg-pink-50 dark:bg-pink-900/20',
      borderAccent: 'border-pink-200 dark:border-pink-800',
      iconColor: 'text-pink-600 dark:text-pink-400'
    }
  ];

  const legalLinks = [
    { label: 'Politique de confidentialité', href: '/confidentialite', icon: Shield },
    { label: 'Conditions d\'utilisation', href: '/conditions', icon: BookOpen },
    { label: 'Politique des cookies', href: '/cookies', icon: Clock },
    { label: 'Accessibilité', href: '/accessibilite', icon: AlertTriangle },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />

      {/* ==================== HERO SECTION ==================== */}
      <section className="relative pt-28 pb-20 overflow-hidden">
        {/* Background animé */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-violet-600 to-indigo-800" />

        {/* Cercles décoratifs animés */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />

        {/* Particules flottantes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1.5 h-1.5 bg-white/30 rounded-full animate-bounce"
              style={{
                left: `${10 + i * 12}%`,
                top: `${15 + (i % 4) * 20}%`,
                animationDelay: `${i * 0.3}s`,
                animationDuration: `${3 + i * 0.4}s`,
              }}
            />
          ))}
        </div>

        <div className={`relative max-w-4xl mx-auto px-4 text-center transition-all duration-1000 ${headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-5 py-2 mb-8 border border-white/10 hover:bg-white/30 transition-all">
            <Scale className="w-4 h-4 text-white" />
            <span className="text-sm font-medium text-white">Informations légales</span>
          </div>

          {/* Titre */}
          <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Mentions{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 to-violet-200">
              Légales
            </span>
          </h1>

          {/* Sous-titre */}
          <p className="text-xl text-indigo-100 max-w-2xl mx-auto leading-relaxed mb-8">
            Informations juridiques obligatoires concernant l'utilisation de la plateforme Care-Link RDC
          </p>

          {/* Date de mise à jour */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
            <Clock className="w-4 h-4 text-indigo-200" />
            <span className="text-sm text-indigo-200">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</span>
          </div>
        </div>
      </section>

      {/* ==================== LIENS RAPIDES ==================== */}
      <section className="py-8 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-3">
            {legalLinks.map((link, index) => {
              const Icon = link.icon;
              return (
                <a
                  key={index}
                  href={link.href}
                  className="group flex items-center gap-2 px-4 py-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md transition-all hover:-translate-y-0.5"
                >
                  <Icon className="w-4 h-4 text-gray-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {link.label}
                  </span>
                  <ChevronRight className="w-3 h-3 text-gray-400 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all" />
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* ==================== SECTIONS LÉGALES ==================== */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="space-y-6">
            {sections.map((section, index) => {
              const Icon = section.icon;
              const isVisible = visibleSections.has(index);

              return (
                <div
                  key={index}
                  ref={(el) => (sectionRefs.current[index] = el)}
                  data-index={index}
                  className={`group relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-700 ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                  }`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  {/* Barre de couleur en haut */}
                  <div className={`h-1 bg-gradient-to-r ${section.accent}`} />

                  <div className="p-8">
                    <div className="flex items-start gap-5">
                      {/* Icône avec animation */}
                      <div className={`relative w-14 h-14 ${section.bgAccent} rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                        <div className={`absolute inset-0 bg-gradient-to-br ${section.accent} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300`} />
                        <Icon className={`w-7 h-7 ${section.iconColor}`} />
                      </div>

                      {/* Contenu */}
                      <div className="flex-1 min-w-0">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {section.title}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-[15px]">
                          {section.content}
                        </p>
                      </div>

                      {/* Indicateur numéro */}
                      <div className={`hidden sm:flex w-8 h-8 ${section.bgAccent} rounded-full items-center justify-center flex-shrink-0`}>
                        <span className={`text-sm font-bold ${section.iconColor}`}>{index + 1}</span>
                      </div>
                    </div>
                  </div>

                  {/* Effet hover glow */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${section.accent} opacity-0 group-hover:opacity-[0.02] transition-opacity duration-500 pointer-events-none`} />
                </div>
              );
            })}
          </div>

          {/* ==================== CONTACT INFO BOX AMÉLIORÉ ==================== */}
          <div
            id="contact-section"
            className={`mt-12 transition-all duration-1000 ${contactVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
          >
            <div className="relative bg-gradient-to-br from-indigo-50 via-violet-50 to-indigo-50 dark:from-indigo-900/20 dark:via-violet-900/20 dark:to-indigo-900/20 rounded-2xl p-8 border border-indigo-200 dark:border-indigo-800 overflow-hidden">
              {/* Décoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-200/50 to-violet-200/50 dark:from-indigo-700/20 dark:to-violet-700/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />

              <div className="relative">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-xl flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Coordonnées
                  </h3>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {/* Adresse */}
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                        <Building2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white text-sm mb-1">Adresse</p>
                        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                          Ministère de la Santé Publique<br />
                          Boulevard du 30 Juin<br />
                          Kinshasa, Gombe<br />
                          République Démocratique du Congo
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Contact */}
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                        <Mail className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white text-sm mb-1">Email</p>
                        <a 
                          href="mailto:contact@carelink-rdc.cd" 
                          className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm flex items-center gap-1"
                        >
                          contact@carelink-rdc.cd
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                        <Phone className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white text-sm mb-1">Téléphone</p>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">+243 81 234 5678</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                        <Globe className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white text-sm mb-1">Site web</p>
                        <a 
                          href="https://www.carelink-rdc.cd" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm flex items-center gap-1"
                        >
                          www.carelink-rdc.cd
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ==================== DISCLAIMER ==================== */}
          <div className={`mt-8 transition-all duration-1000 delay-300 ${contactVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-6 flex items-start gap-4">
              <div className="w-10 h-10 bg-amber-100 dark:bg-amber-800/50 rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h4 className="font-semibold text-amber-900 dark:text-amber-200 mb-2">
                  Information importante
                </h4>
                <p className="text-amber-800 dark:text-amber-300 text-sm leading-relaxed">
                  Les présentes mentions légales peuvent être modifiées à tout moment sans préavis. 
                  Nous vous invitons à les consulter régulièrement. En continuant à utiliser Care-Link RDC, 
                  vous acceptez les modifications apportées.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default MentionsLegales;