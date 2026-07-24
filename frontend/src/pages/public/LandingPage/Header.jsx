import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, Menu, X, ChevronDown, Sparkles } from 'lucide-react';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Header se reduit apres 50px
      setScrolled(currentScrollY > 50);

      // Cache le header quand on scroll vers le bas (mobile), le remonte vers le haut
      if (currentScrollY > lastScrollY && currentScrollY > 200) {
        setHidden(true);
      } else {
        setHidden(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Ferme le menu mobile quand on change de route
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Bloque le scroll quand le menu mobile est ouvert
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMenuOpen]);

  const isActive = (path) => {
    if (path.startsWith('#')) {
      return location.pathname === '/' && location.hash === path;
    }
    return location.pathname === path;
  };

  const navLinks = [
    { label: 'Accueil', href: '/' },
    { label: 'Fonctionnalites', href: '/#features' },
    { label: 'Comment ca marche', href: '/#steps' },
    { label: 'Guide', href: '/guide' },
  ];

  const handleNav = (href) => {
    setIsMenuOpen(false);

    if (href.startsWith('/#')) {
      const sectionId = href.replace('/#', '');
      if (location.pathname !== '/') {
        navigate('/');
        setTimeout(() => {
          const element = document.getElementById(sectionId);
          if (element) element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        const element = document.getElementById(sectionId);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate(href);
    }
  };

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out ${
          hidden ? '-translate-y-full' : 'translate-y-0'
        } ${
          scrolled 
            ? 'bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl shadow-lg shadow-gray-900/5 dark:shadow-black/20 border-b border-gray-200/50 dark:border-gray-800/50' 
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`flex items-center justify-between transition-all duration-300 ${
            scrolled ? 'h-16' : 'h-20'
          }`}>

            {/* Logo */}
            <div 
              className="flex items-center gap-3 cursor-pointer group" 
              onClick={() => navigate('/')}
            >
              <div className={`relative transition-all duration-300 ${
                scrolled ? 'w-9 h-9' : 'w-10 h-10'
              }`}>
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl rotate-3 group-hover:rotate-6 transition-transform duration-300 opacity-50 blur-sm" />
                <div className="relative w-full h-full bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:shadow-indigo-500/50 group-hover:scale-110 transition-all duration-300">
                  <Shield className={`text-white transition-all duration-300 ${scrolled ? 'w-4 h-4' : 'w-5 h-5'}`} />
                </div>
              </div>
              <div className="flex items-center">
                <span className={`font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent transition-all duration-300 ${
                  scrolled ? 'text-lg' : 'text-xl'
                }`}>
                  Care-Link
                </span>
                <span className={`ml-2 text-xs font-bold bg-gradient-to-r from-indigo-100 to-violet-100 dark:from-indigo-900/40 dark:to-violet-900/40 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800 transition-all duration-300 ${
                  scrolled ? 'scale-90' : 'scale-100'
                }`}>
                  RDC
                </span>
              </div>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => {
                const active = isActive(link.href);
                return (
                  <button
                    key={link.label}
                    onClick={() => handleNav(link.href)}
                    className={`relative px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300 group ${
                      active 
                        ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20' 
                        : 'text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-800/50'
                    }`}
                  >
                    {link.label}
                    {/* Indicateur actif anime */}
                    <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-300 ${
                      active ? 'w-6 opacity-100' : 'w-0 opacity-0 group-hover:w-4 group-hover:opacity-50'
                    }`} />
                  </button>
                );
              })}
            </nav>

            {/* Desktop CTA */}
            <div className="hidden lg:flex items-center gap-3">
              <button 
                onClick={() => navigate('/connexion')}
                className="relative px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800/50"
              >
                Connexion
              </button>
              <button 
                onClick={() => navigate('/inscription')}
                className="relative group px-5 py-2.5 text-sm font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/30 hover:scale-105"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Commencer
                  <Sparkles className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 transition-opacity" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden relative w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300"
              aria-label={isMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            >
              <div className="relative w-5 h-5">
                <span className={`absolute left-0 block w-5 h-0.5 bg-current rounded-full transition-all duration-300 ${
                  isMenuOpen ? 'top-2 rotate-45' : 'top-0.5'
                }`} />
                <span className={`absolute left-0 top-2 block w-5 h-0.5 bg-current rounded-full transition-all duration-300 ${
                  isMenuOpen ? 'opacity-0 scale-0' : 'opacity-100 scale-100'
                }`} />
                <span className={`absolute left-0 block w-5 h-0.5 bg-current rounded-full transition-all duration-300 ${
                  isMenuOpen ? 'top-2 -rotate-45' : 'top-3.5'
                }`} />
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div 
        className={`fixed inset-0 z-40 lg:hidden transition-all duration-500 ${
          isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-gray-950/60 backdrop-blur-sm"
          onClick={() => setIsMenuOpen(false)}
        />

        {/* Menu Panel */}
        <div 
          className={`absolute right-0 top-0 h-full w-full max-w-sm bg-white dark:bg-gray-950 border-l border-gray-200 dark:border-gray-800 shadow-2xl transition-transform duration-500 ease-out ${
            isMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex flex-col h-full pt-20 pb-8 px-6">
            {/* Logo dans le menu */}
            <div className="flex items-center gap-3 mb-8 px-2">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                  Care-Link
                </span>
                <span className="ml-2 text-xs font-bold bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full">
                  RDC
                </span>
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 space-y-1">
              {navLinks.map((link, i) => {
                const active = isActive(link.href);
                return (
                  <button
                    key={link.label}
                    onClick={() => handleNav(link.href)}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left transition-all duration-300 ${
                      active 
                        ? 'bg-gradient-to-r from-indigo-500/10 to-violet-500/10 text-indigo-600 dark:text-indigo-400 font-semibold border border-indigo-200 dark:border-indigo-800/50' 
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50'
                    }`}
                    style={{ 
                      transitionDelay: isMenuOpen ? `${i * 50}ms` : '0ms',
                      opacity: isMenuOpen ? 1 : 0,
                      transform: isMenuOpen ? 'translateX(0)' : 'translateX(20px)'
                    }}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                      active ? 'bg-indigo-500 scale-150' : 'bg-gray-300 dark:bg-gray-600'
                    }`} />
                    {link.label}
                  </button>
                );
              })}
            </nav>

            {/* CTA Buttons */}
            <div className="space-y-3 pt-6 border-t border-gray-200 dark:border-gray-800">
              <button 
                onClick={() => { navigate('/connexion'); setIsMenuOpen(false); }}
                className="w-full text-center py-3.5 text-sm font-medium text-gray-600 dark:text-gray-300 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
              >
                Connexion
              </button>
              <button 
                onClick={() => { navigate('/inscription'); setIsMenuOpen(false); }}
                className="w-full py-3.5 text-sm font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 flex items-center justify-center gap-2"
              >
                Commencer
                <Sparkles className="w-4 h-4" />
              </button>
            </div>

            {/* Footer du menu */}
            <p className="text-center text-xs text-gray-400 dark:text-gray-600 mt-6">
              &copy; {new Date().getFullYear()} Care-Link RDC
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;