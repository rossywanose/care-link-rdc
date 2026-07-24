import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Mail, 
  Phone, 
  MapPin, 
  Send,
  ChevronRight,
  Heart,
  Github,
  Twitter,
  Linkedin,
  Facebook,
  Youtube,
  ExternalLink
} from 'lucide-react';

const Footer = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  const scrollToSection = (href) => {
    if (href.startsWith('#')) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate(href);
    }
  };

  const socialLinks = [
    { name: 'Twitter', icon: Twitter, href: 'https://twitter.com/carelinkrdc' },
    { name: 'LinkedIn', icon: Linkedin, href: 'https://linkedin.com/company/carelinkrdc' },
    { name: 'Facebook', icon: Facebook, href: 'https://facebook.com/carelinkrdc' },
    { name: 'YouTube', icon: Youtube, href: 'https://youtube.com/carelinkrdc' },
  ];

  const footerLinks = {
    produit: [
      { label: 'Fonctionnalites', href: '#features' },
      { label: 'Comment ca marche', href: '#steps' },
      { label: 'Tarification', href: '/tarification' },
      { label: 'Guide utilisateur', href: '/guide' },
      { label: 'FAQ', href: '/faq' },
    ],
    ressources: [
      { label: 'Documentation API', href: '/docs/api' },
      { label: 'Centre d\'aide', href: '/aide' },
      { label: 'Statut du systeme', href: '/status' },
      //{ label: 'Blog', href: '/blog' },
      { label: 'Partenaires', href: '/partenaires' },
      { label: 'À propos', href: '/a-propos' },
    ],
    legal: [
      { label: 'Confidentialite', href: '/confidentialite' },
      { label: 'Conditions d\'utilisation', href: '/conditions' },
      { label: 'Politique cookies', href: '/cookies' },
      { label: 'Mentions legales', href: '/mentions-legales' },
      { label: 'Accessibilite', href: '/accessibilite' },
    ],
  };

  return (
    <footer className="bg-gray-950 text-gray-400 border-t border-gray-800">
      {/* Newsletter Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-b border-gray-800">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h3 className="text-xl font-semibold text-white mb-1">
              Restez informe
            </h3>
            <p className="text-gray-500 text-sm">
              Recevez les actualites et mises a jour de Care-Link RDC.
            </p>
          </div>
          <div className="lg:w-auto w-full max-w-md">
            {subscribed ? (
              <div className="flex items-center gap-2 text-emerald-400 text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Merci ! Vous etes inscrit a notre newsletter.
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Votre adresse email"
                    className="w-full pl-9 pr-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">S'inscrire</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Main Footer Content - Style GitHub */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-12 gap-8">
          
          {/* Brand Column */}
          <div className="col-span-2 lg:col-span-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-lg flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white">Care-Link</span>
              <span className="text-[10px] font-semibold bg-indigo-900/50 text-indigo-300 px-1.5 py-0.5 rounded-full">RDC</span>
            </div>
            <p className="text-sm text-gray-500 mb-6 max-w-xs leading-relaxed">
              Plateforme officielle de gestion des certificats de naissance et de deces en Republique Democratique du Congo.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-2 mb-6">
              <a href="mailto:contact@carelink-rdc.cd" className="flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-400 transition-colors">
                <Mail className="w-4 h-4" />
                contact@carelink-rdc.cd
              </a>
              <a href="tel:+243812345678" className="flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-400 transition-colors">
                <Phone className="w-4 h-4" />
                +243 81 234 5678
              </a>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <MapPin className="w-4 h-4" />
                Kinshasa, RDC
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-2">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center transition-colors group"
                  title={social.name}
                >
                  <social.icon className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div className="col-span-1 lg:col-span-2">
            <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wider mb-4">
              Produit
            </h4>
            <ul className="space-y-2">
              {footerLinks.produit.map((link) => (
                <li key={link.label}>
                  <button 
                    onClick={() => scrollToSection(link.href)}
                    className="text-sm text-gray-500 hover:text-indigo-400 transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-1 lg:col-span-2">
            <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wider mb-4">
              Ressources
            </h4>
            <ul className="space-y-2">
              {footerLinks.ressources.map((link) => (
                <li key={link.label}>
                  <button 
                    onClick={() => scrollToSection(link.href)}
                    className="text-sm text-gray-500 hover:text-indigo-400 transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-2 lg:col-span-2">
            <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wider mb-4">
              Legal
            </h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <button 
                    onClick={() => scrollToSection(link.href)}
                    className="text-sm text-gray-500 hover:text-indigo-400 transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Trust Badges */}
          <div className="col-span-2 lg:col-span-2">
            <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wider mb-4">
              Confiance
            </h4>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>Securise SSL</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                </svg>
                <span>Cloud RDC</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>24/7 Disponible</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar - Style GitHub */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>&copy; {new Date().getFullYear()} Care-Link RDC</span>
              <span className="hidden sm:inline">·</span>
              <span className="hidden sm:inline">Tous droits reserves</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                Fait avec <Heart className="w-3 h-3 text-red-500 fill-red-500" /> pour la RDC
              </span>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/confidentialite')} className="text-xs text-gray-500 hover:text-indigo-400 transition-colors">
                Confidentialite
              </button>
              <button onClick={() => navigate('/conditions')} className="text-xs text-gray-500 hover:text-indigo-400 transition-colors">
                Conditions
              </button>
              <button onClick={() => navigate('/cookies')} className="text-xs text-gray-500 hover:text-indigo-400 transition-colors">
                Cookies
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
