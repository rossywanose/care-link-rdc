import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  Shield,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Heart,
  Baby,
  FileCheck,
  Activity,
  Users,
  ShieldCheck,
  Sparkles,
  ChevronRight,
  Globe,
  CheckCircle2,
  Building2
} from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [pageLoaded, setPageLoaded] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Animation d'ouverture
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 50);
    const loadedTimer = setTimeout(() => setPageLoaded(true), 800);
    return () => {
      clearTimeout(timer);
      clearTimeout(loadedTimer);
    };
  }, []);

  const stats = [
    { icon: Users, value: '50K+', label: 'Citoyens enregistrés' },
    { icon: Building2, value: '200+', label: 'Hôpitaux partenaires' },
    { icon: FileCheck, value: '100K+', label: 'Certificats délivrés' },
    { icon: ShieldCheck, value: '99.9%', label: 'Sécurité garantie' }
  ];

  const features = [
    { icon: Baby, text: 'Enregistrement des naissances' },
    { icon: Heart, text: 'Certificats de décès' },
    { icon: FileCheck, text: 'Documents authentifiés' },
    { icon: Activity, text: 'Suivi en temps réel' }
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'L\'email est requis';
    } else if (!formData.email.includes('@') || !formData.email.includes('.')) {
      newErrors.email = 'Email invalide';
    }

    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Minimum 6 caractères';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const result = await login(formData.email, formData.password);

      if (result.success) {
        const { user } = result;
        if (user.role === 'hospital') navigate('/hospital-dashboard');
        else if (user.role === 'authority') navigate('/authority-dashboard');
        else if (user.role === 'admin') navigate('/admin-dashboard');
        else navigate('/citizen-dashboard');
      } else {
        setLoginError(result.error);
      }
    } catch (error) {
      setLoginError('Erreur de connexion. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ==================== GAUCHE - Formulaire ==================== */}
      <div className={`flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-gray-950 transition-all duration-1000 ease-out ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}>
        <div className="w-full max-w-md">
          {/* Mobile: logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-gray-900 dark:text-white">Care-Link RDC</span>
          </div>

          {/* Lien retour vers l'accueil */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 
              hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à l'accueil
          </button>

          <div className={`bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden transition-all duration-700 delay-200 ${pageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
            <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-6 text-center">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-3 backdrop-blur-sm hover:scale-110 transition-transform">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white mb-1">Connexion</h1>
              <p className="text-indigo-100 text-xs">Accédez à votre espace Care-Link RDC</p>
            </div>

            <div className="p-6">
              {loginError && (
                <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <p className="text-xs text-red-600 dark:text-red-400">{loginError}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Adresse email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="vous@exemple.com"
                      className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${errors.email
                          ? 'border-red-300 focus:border-red-500'
                          : 'border-gray-200 dark:border-gray-700 focus:border-indigo-500'
                        }`}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-500">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className={`w-full pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-gray-800 border rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${errors.password
                          ? 'border-red-300 focus:border-red-500'
                          : 'border-gray-200 dark:border-gray-700 focus:border-indigo-500'
                        }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-xs text-red-500">{errors.password}</p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="rememberMe"
                      checked={formData.rememberMe}
                      onChange={handleChange}
                      className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-xs text-gray-600 dark:text-gray-400">Se souvenir de moi</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => navigate('/mot-de-passe-oublie')}
                    className="text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-medium"
                  >
                    Mot de passe oublié ?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-lg font-medium text-sm hover:shadow-lg hover:shadow-indigo-500/30 transition-all hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Connexion...</span>
                    </>
                  ) : (
                    <>
                      <span>Se connecter</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-4 bg-white dark:bg-gray-900 text-gray-500">ou</span>
                </div>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Pas encore de compte ?{' '}
                  <button
                    onClick={() => navigate('/inscription')}
                    className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-semibold"
                  >
                    Créer un compte
                  </button>
                </p>
              </div>
            </div>
          </div>

          <p className="text-center text-[10px] text-gray-400 mt-4">
            &copy; {new Date().getFullYear()} Care-Link RDC. Tous droits réservés.
          </p>
        </div>
      </div>

      {/* ==================== DROITE - Bon retour ==================== */}
      <div className={`hidden lg:flex lg:w-1/2 xl:w-5/12 relative overflow-hidden transition-all duration-1000 ease-out ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
        {/* Background gradient anime */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-violet-900 to-indigo-950" />

        {/* Cercles decoratifs animes */}
        <div className="absolute top-20 right-20 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-violet-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />

        {/* Particules flottantes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div key={i}
              className="absolute w-2 h-2 bg-white/20 rounded-full animate-bounce"
              style={{
                right: `${15 + i * 15}%`,
                top: `${20 + (i % 3) * 25}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${3 + i * 0.5}s`
              }}
            />
          ))}
        </div>

        {/* Contenu */}
        <div className="relative z-10 flex flex-col justify-between p-12 h-full">
          {/* Logo */}
          <div className={`flex items-center gap-3 transition-all duration-700 delay-300 ${pageLoaded ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'}`}>
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center hover:scale-110 transition-transform">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Care-Link</h2>
              <p className="text-xs text-indigo-200">RDC</p>
            </div>
          </div>

          {/* Message de bon retour */}
          <div className={`space-y-6 transition-all duration-700 delay-500 ${pageLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full mb-4 border border-white/10">
                <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
                <span className="text-xs text-indigo-200">Plateforme officielle RDC</span>
              </div>
              <h1 className="text-4xl font-bold text-white leading-tight mb-4">
                Bon retour !<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-violet-300">
                  Heureux de vous revoir
                </span>
              </h1>
              <p className="text-indigo-200 text-base leading-relaxed max-w-sm">
                Connectez-vous pour accéder à vos certificats, suivre vos demandes 
                et gérer vos documents d'état civil en toute sécurité.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-3">
              {features.map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <div key={i} 
                    className={`flex items-center gap-3 transition-all duration-500 ${pageLoaded ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'}`}
                    style={{ transitionDelay: `${700 + i * 150}ms` }}
                  >
                    <div className="w-8 h-8 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors">
                      <Icon className="w-4 h-4 text-indigo-300" />
                    </div>
                    <span className="text-sm text-indigo-100">{feature.text}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stats en bas */}
          <div className={`grid grid-cols-2 gap-4 transition-all duration-700 delay-1000 ${pageLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10 hover:bg-white/15 transition-all hover:scale-105 cursor-default group">
                  <Icon className="w-5 h-5 text-indigo-300 mb-1.5 group-hover:text-white transition-colors" />
                  <div className="text-lg font-bold text-white">{stat.value}</div>
                  <div className="text-[10px] text-indigo-200">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;