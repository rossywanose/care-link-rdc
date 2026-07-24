import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Bot, FileText, Baby, Skull, Building2, BarChart3, CheckCircle2,
  Heart, Shield, Activity, Users, Globe, Sparkles
} from 'lucide-react';
import animationConfig from './welcome_animations.json';

// ============================================
// MAP DES ICÔNES
// ============================================
const iconMap = {
  Bot, FileText, Baby, Skull, Building2, BarChart3, CheckCircle2,
  Heart, Shield, Activity, Users, Globe, Sparkles
};

// ============================================
// COMPOSANT PARTICULES (style Google Doodle)
// ============================================
const FloatingParticles = ({ count = 15, colors }) => {
  const particles = useRef([]);

  useEffect(() => {
    particles.current = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 20 + Math.random() * 60,
      color: colors[i % colors.length],
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: (Math.random() - 0.5) * 0.3,
      opacity: 0.1 + Math.random() * 0.3,
      shape: ['circle', 'square', 'triangle'][Math.floor(Math.random() * 3)]
    }));
  }, [count, colors]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.current.map((p) => (
        <div
          key={p.id}
          className="absolute animate-float-random"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            opacity: p.opacity,
            borderRadius: p.shape === 'circle' ? '50%' : p.shape === 'square' ? '4px' : '0',
            clipPath: p.shape === 'triangle' ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : 'none',
            filter: 'blur(1px)',
            animation: `float-random ${3 + Math.random() * 4}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 2}s`
          }}
        />
      ))}
    </div>
  );
};

// ============================================
// COMPOSANT CARTES DÉFILANTES (style Kimi)
// ============================================
const FeatureCards = ({ items, isHovered }) => {
  const [visibleCards, setVisibleCards] = useState([]);

  useEffect(() => {
    if (isHovered) {
      items.forEach((_, index) => {
        setTimeout(() => {
          setVisibleCards(prev => [...prev, index]);
        }, index * 150);
      });
    } else {
      setVisibleCards([]);
    }
  }, [isHovered, items]);

  return (
    <div className={`flex gap-3 transition-all duration-500 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      {items.map((item, index) => {
        const Icon = iconMap[item.icon] || Sparkles;
        const isVisible = visibleCards.includes(index);

        return (
          <div
            key={index}
            className={`
              flex flex-col items-center gap-2 p-3 rounded-xl
              bg-white/10 dark:bg-white/5 backdrop-blur-sm
              border border-white/20
              transition-all duration-300
              ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}
              hover:bg-white/20 hover:scale-105 cursor-pointer
            `}
            style={{ transitionDelay: `${index * 50}ms` }}
          >
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${item.color}20` }}
            >
              <Icon className="w-5 h-5" style={{ color: item.color }} />
            </div>
            <span className="text-[10px] font-medium text-white/80 whitespace-nowrap">{item.label}</span>
          </div>
        );
      })}
    </div>
  );
};

// ============================================
// ANIMATION KIMI LOGO REVEAL
// ============================================
const KimiLogoReveal = ({ userName, onComplete }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [phase, setPhase] = useState(0);
  const config = animationConfig.animations.find(a => a.id === 'kimi-logo-reveal');

  useEffect(() => {
    const timer = setTimeout(() => setPhase(1), config.phases[0].duration);
    return () => clearTimeout(timer);
  }, []);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleClick = () => {
    onComplete?.();
  };

  return (
    <div 
      className="flex flex-col items-center justify-center min-h-[300px] space-y-8 cursor-pointer"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {/* Logo principal avec glow */}
      <div className="relative">
        <div 
          className={`
            w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 
            flex items-center justify-center shadow-2xl transition-all duration-500
            ${isHovered ? 'scale-75 -translate-y-2' : 'scale-100 animate-float'}
          `}
          style={{
            boxShadow: isHovered 
              ? '0 0 40px rgba(99, 102, 241, 0.4)' 
              : '0 0 30px rgba(99, 102, 241, 0.2)'
          }}
        >
          <Bot className="w-10 h-10 text-white" />
        </div>

        {/* Glow effect */}
        <div 
          className={`
            absolute -inset-4 rounded-3xl bg-gradient-to-br from-indigo-500/30 to-violet-500/30 
            blur-2xl transition-opacity duration-500
            ${isHovered ? 'opacity-50' : 'opacity-30 animate-pulse'}
          `}
        />
      </div>

      {/* Titre */}
      <div className={`
        text-center transition-all duration-500
        ${isHovered ? 'opacity-0 -translate-y-4' : 'opacity-100 translate-y-0'}
      `}>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
          Care-Link
        </h2>
        <p className="text-sm text-gray-400 mt-2">Survolez pour découvrir</p>
      </div>

      {/* Cartes de fonctionnalités (style Kimi) */}
      <FeatureCards 
        items={config.phases[1].elements.find(e => e.type === 'cards').items}
        isHovered={isHovered}
      />

      {/* Skip hint */}
      <p className={`
        text-[10px] text-gray-500 transition-opacity duration-300
        ${isHovered ? 'opacity-0' : 'opacity-100'}
      `}>
        Cliquez pour continuer
      </p>
    </div>
  );
};

// ============================================
// ANIMATION GOOGLE DOODLE
// ============================================
const GoogleDoodle = ({ userName, onComplete }) => {
  const config = animationConfig.animations.find(a => a.id === 'google-doodle');
  const [isActive, setIsActive] = useState(true);

  const doodleColors = config.elements.find(e => e.type === 'floating-shapes').colors;

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsActive(false);
      onComplete?.();
    }, config.duration);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[300px] overflow-hidden">
      {/* Fond animé */}
      <div 
        className="absolute inset-0 opacity-50"
        style={{
          background: `linear-gradient(135deg, ${config.background.colors.join(', ')})`,
          backgroundSize: '400% 400%',
          animation: 'gradient-shift 8s ease infinite'
        }}
      />

      {/* Particules flottantes */}
      <FloatingParticles 
        count={config.elements.find(e => e.type === 'floating-shapes').count}
        colors={doodleColors}
      />

      {/* Illustration centrale */}
      <div className="relative z-10 animate-breathe">
        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-500/20 to-violet-500/20 backdrop-blur-sm border border-white/10 flex items-center justify-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-2xl shadow-indigo-500/30">
            <Bot className="w-12 h-12 text-white" />
          </div>
        </div>

        {/* Orbiting icons */}
        {config.elements.find(e => e.type === 'orbiting-icons').icons.map((iconName, i) => {
          const Icon = iconMap[iconName] || Sparkles;
          const angle = (i * 360) / 5;
          const radius = 80;

          return (
            <div
              key={i}
              className="absolute w-8 h-8 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center"
              style={{
                animation: `orbit ${20}s linear infinite`,
                animationDelay: `${-i * 4}s`,
                transform: `rotate(${angle}deg) translateX(${radius}px) rotate(-${angle}deg)`
              }}
            >
              <Icon className="w-4 h-4 text-white/70" />
            </div>
          );
        })}
      </div>

      {/* Texte */}
      <div className="relative z-10 mt-8 text-center">
        <h2 className="text-2xl font-bold text-white">Care-Link AI</h2>
        <p className="text-sm text-white/60 mt-2">Votre écosystème de santé</p>
      </div>

      {/* Particules qui montent */}
      <div className="absolute bottom-0 left-0 right-0 h-32 overflow-hidden pointer-events-none">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-indigo-400/60"
            style={{
              left: `${10 + i * 8}%`,
              bottom: '-10px',
              animation: `rise-and-fade ${3 + Math.random() * 2}s ease-out infinite`,
              animationDelay: `${Math.random() * 3}s`
            }}
          />
        ))}
      </div>
    </div>
  );
};

// ============================================
// ANIMATION TYPING HERO
// ============================================
const TypingHero = ({ userName, onComplete }) => {
  const config = animationConfig.animations.find(a => a.id === 'typing-hero');
  const [displayedLines, setDisplayedLines] = useState([]);
  const [currentLine, setCurrentLine] = useState(0);
  const [currentChar, setCurrentChar] = useState(0);
  const [showCursor, setShowCursor] = useState(true);
  const [progress, setProgress] = useState(0);

  const lines = config.elements.find(e => e.type === 'typing-text').lines.map(line => ({
    ...line,
    text: line.text.replace('{name}', userName)
  }));

  useEffect(() => {
    if (currentLine < lines.length) {
      const line = lines[currentLine];
      if (currentChar < line.text.length) {
        const timer = setTimeout(() => {
          setDisplayedLines(prev => {
            const newLines = [...prev];
            if (!newLines[currentLine]) newLines[currentLine] = '';
            newLines[currentLine] = line.text.slice(0, currentChar + 1);
            return newLines;
          });
          setCurrentChar(c => c + 1);
          setProgress(((currentLine * 100 / lines.length) + (currentChar / line.text.length) * (100 / lines.length)));
        }, line.speed);
        return () => clearTimeout(timer);
      } else {
        const timer = setTimeout(() => {
          setCurrentLine(l => l + 1);
          setCurrentChar(0);
        }, 400);
        return () => clearTimeout(timer);
      }
    } else {
      const timer = setTimeout(() => onComplete?.(), 1000);
      return () => clearTimeout(timer);
    }
  }, [currentLine, currentChar]);

  // Cursor blink
  useEffect(() => {
    const interval = setInterval(() => setShowCursor(c => !c), 530);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] space-y-6">
      {/* Terminal window */}
      <div className="w-full max-w-md p-6 rounded-2xl bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 shadow-2xl">
        {/* Terminal header */}
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-700/50">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
          <span className="ml-2 text-[10px] text-gray-500 font-mono">care-link-ai@terminal</span>
        </div>

        {/* Typing lines */}
        <div className="space-y-2 font-mono text-sm">
          {lines.map((line, i) => (
            <div key={i} className={`transition-opacity duration-300 ${i <= currentLine ? 'opacity-100' : 'opacity-0'}`}>
              <span className="text-gray-500 mr-2">{`>`}</span>
              <span style={{ color: line.color }}>
                {displayedLines[i] || ''}
              </span>
              {i === currentLine && (
                <span 
                  className={`inline-block w-2 h-4 ml-0.5 align-middle ${showCursor ? 'opacity-100' : 'opacity-0'}`}
                  style={{ backgroundColor: line.color }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="mt-6 h-1 bg-gray-800 rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-300 ease-out"
            style={{ 
              width: `${progress}%`,
              background: `linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899)`
            }}
          />
        </div>
      </div>
    </div>
  );
};

// ============================================
// COMPOSANT PRINCIPAL
// ============================================
const WelcomeAnimation = ({ userName, onComplete, preferredAnimation }) => {
  const [activeAnimation, setActiveAnimation] = useState(preferredAnimation || animationConfig.settings.defaultAnimation);
  const [isComplete, setIsComplete] = useState(false);

  const handleComplete = useCallback(() => {
    setIsComplete(true);
    onComplete?.();
  }, [onComplete]);

  const renderAnimation = () => {
    switch (activeAnimation) {
      case 'kimi-logo-reveal':
        return <KimiLogoReveal userName={userName} onComplete={handleComplete} />;
      case 'google-doodle':
        return <GoogleDoodle userName={userName} onComplete={handleComplete} />;
      case 'typing-hero':
        return <TypingHero userName={userName} onComplete={handleComplete} />;
      default:
        return <KimiLogoReveal userName={userName} onComplete={handleComplete} />;
    }
  };

  return (
    <div className={`transition-opacity duration-500 ${isComplete ? 'opacity-0' : 'opacity-100'}`}>
      {renderAnimation()}
    </div>
  );
};

export default WelcomeAnimation;