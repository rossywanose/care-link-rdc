import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  CheckCircle, 
  Clock, 
  Globe, 
  MessageSquare,
  ArrowRight,
  Shield,
  AlertCircle,
  Loader2
} from 'lucide-react';
import Header from '../LandingPage/Header';
import Footer from '../LandingPage/Footer';

const Contact = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    institution: '',
    subject: '',
    message: '',
    type: 'general'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Le nom est requis';
    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }
    if (!formData.subject.trim()) newErrors.subject = 'Le sujet est requis';
    if (!formData.message.trim() || formData.message.length < 10) {
      newErrors.message = 'Le message doit contenir au moins 10 caracteres';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    // Simulation d'envoi - remplacer par l'appel API reel
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSubmitted(true);
    setFormData({ name: '', email: '', institution: '', subject: '', message: '', type: 'general' });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email',
      value: 'contact@carelink-rdc.cd',
      desc: 'Reponse sous 24h ouvrables',
      color: 'indigo'
    },
    {
      icon: Phone,
      title: 'Telephone',
      value: '+243 81 234 5678',
      desc: 'Lun-Ven, 8h-17h (GMT+1)',
      color: 'emerald'
    },
    {
      icon: MapPin,
      title: 'Adresse',
      value: 'Kinshasa, RDC',
      desc: 'Avenue des Institutions, Gombe',
      color: 'rose'
    },
    {
      icon: Clock,
      title: 'Disponibilite',
      value: '24/7 en ligne',
      desc: 'Support technique continu',
      color: 'amber'
    },
  ];

  const categoryColors = {
    indigo: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    rose: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  };

  const subjectOptions = [
    { value: '', label: 'Selectionnez un sujet' },
    { value: 'api_access', label: 'Demande d\'acces API' },
    { value: 'partnership', label: 'Partenariat institutionnel' },
    { value: 'hospital_registration', label: 'Enregistrement d\'un hopital' },
    { value: 'technical_support', label: 'Support technique' },
    { value: 'bug_report', label: 'Signalement de bug' },
    { value: 'feature_request', label: 'Suggestion de fonctionnalite' },
    { value: 'general', label: 'Question generale' },
  ];

  const institutionTypes = [
    { value: '', label: 'Type d\'institution (optionnel)' },
    { value: 'hospital', label: 'Hopital / Clinique' },
    { value: 'ministry', label: 'Ministere / Administration' },
    { value: 'ngo', label: 'ONG / Association' },
    { value: 'developer', label: 'Developpeur / Entreprise tech' },
    { value: 'media', label: 'Media / Presse' },
    { value: 'other', label: 'Autre' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />

      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-violet-900 to-indigo-950 py-16 lg:py-24">
          <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6">
                <MessageSquare className="w-4 h-4 text-indigo-300" />
                <span className="text-sm font-medium text-indigo-200">Contact</span>
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6">
                Contactez <span className="bg-gradient-to-r from-indigo-300 to-violet-300 bg-clip-text text-transparent">Care-Link RDC</span>
              </h1>

              <p className="text-lg text-indigo-200 mb-8 leading-relaxed">
                Une question sur l'API ? Un partenariat a proposer ? Notre equipe vous repond 
                dans les plus brefs delais.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Info Cards */}
        <section className="py-12 -mt-8 relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {contactInfo.map((info, i) => (
                <div 
                  key={i} 
                  className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${categoryColors[info.color]}`}>
                    <info.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{info.title}</h3>
                  <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 mb-1">{info.value}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{info.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Form Section */}
        <section className="py-16 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-5 gap-12">
              {/* Left Column - Info */}
              <div className="lg:col-span-2">
                <div className="sticky top-24">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Envoyez-nous un message
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                    Remplissez le formulaire ci-contre et notre equipe vous repondra 
                    dans un delai de 24 a 48 heures ouvrables.
                  </p>

                  <div className="space-y-6">
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-3 mb-3">
                        <Shield className="w-5 h-5 text-emerald-500" />
                        <h3 className="font-semibold text-gray-900 dark:text-white">Donnees protegees</h3>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Vos informations sont cryptees et traitees conformement a la loi 
                        sur la protection des donnees personnelles de la RDC.
                      </p>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-3 mb-3">
                        <Globe className="w-5 h-5 text-indigo-500" />
                        <h3 className="font-semibold text-gray-900 dark:text-white">Acces API</h3>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Pour demander un acces a l'API, selectionnez "Demande d'acces API" 
                        dans le sujet. Notre equipe technique vous contactera pour l'onboarding.
                      </p>
                      <button 
                        onClick={() => navigate('/docs/api')}
                        className="text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 transition-colors"
                      >
                        Voir la documentation API
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Form */}
              <div className="lg:col-span-3">
                {isSubmitted ? (
                  <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-8 text-center">
                    <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-emerald-500" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      Message envoye avec succes !
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      Merci de nous avoir contactes. Notre equipe vous repondra dans les plus brefs delais.
                    </p>
                    <button
                      onClick={() => setIsSubmitted(false)}
                      className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-medium hover:shadow-lg transition-all hover:scale-105"
                    >
                      Envoyer un autre message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 lg:p-8 space-y-6">
                    {/* Name & Email Row */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Nom complet <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Jean Dupont"
                          className={`w-full px-4 py-3 bg-white dark:bg-gray-900 border rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                            errors.name 
                              ? 'border-red-500 focus:ring-red-500/20' 
                              : 'border-gray-200 dark:border-gray-700 focus:border-indigo-500 focus:ring-indigo-500/20'
                          }`}
                        />
                        {errors.name && (
                          <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> {errors.name}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="jean.dupont@exemple.cd"
                          className={`w-full px-4 py-3 bg-white dark:bg-gray-900 border rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                            errors.email 
                              ? 'border-red-500 focus:ring-red-500/20' 
                              : 'border-gray-200 dark:border-gray-700 focus:border-indigo-500 focus:ring-indigo-500/20'
                          }`}
                        />
                        {errors.email && (
                          <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> {errors.email}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Institution Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Type d'institution
                      </label>
                      <select
                        name="institution"
                        value={formData.institution}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none cursor-pointer"
                      >
                        {institutionTypes.map(type => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Subject */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Sujet <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 bg-white dark:bg-gray-900 border rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition-all appearance-none cursor-pointer ${
                          errors.subject 
                            ? 'border-red-500 focus:ring-red-500/20' 
                            : 'border-gray-200 dark:border-gray-700 focus:border-indigo-500 focus:ring-indigo-500/20'
                        }`}
                      >
                        {subjectOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                      {errors.subject && (
                        <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> {errors.subject}
                        </p>
                      )}
                    </div>

                    {/* Message */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Message <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        rows={6}
                        placeholder="Decrivez votre demande en detail..."
                        className={`w-full px-4 py-3 bg-white dark:bg-gray-900 border rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all resize-none ${
                          errors.message 
                            ? 'border-red-500 focus:ring-red-500/20' 
                            : 'border-gray-200 dark:border-gray-700 focus:border-indigo-500 focus:ring-indigo-500/20'
                        }`}
                      />
                      {errors.message && (
                        <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> {errors.message}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-500 text-right">
                        {formData.message.length} caracteres
                      </p>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full px-6 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-indigo-500/30 transition-all hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Envoi en cours...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          Envoyer le message
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-gray-50 dark:bg-gray-950">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Questions frequentes
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Retrouvez les reponses aux questions les plus courantes.
              </p>
            </div>

            <div className="space-y-4">
              {[
                {
                  q: 'Combien de temps faut-il pour obtenir un acces API ?',
                  a: 'Le delai moyen est de 2 a 5 jours ouvrables apres reception de votre demande complete. Notre equipe technique vous contactera pour un onboarding personnalise.'
                },
                {
                  q: 'Quels types d\'institutions peuvent acceder a l\'API ?',
                  a: 'Hopitaux, cliniques, ministeres, ONG agreees, et entreprises tech partenaires. Chaque demande est evaluee au cas par cas.'
                },
                {
                  q: 'L\'API est-elle gratuite ?',
                  a: 'Un acces de base est disponible gratuitement pour les institutions publiques. Des plans payants existent pour les usages intensifs et les fonctionnalites avancees.'
                },
                {
                  q: 'Quelles sont les langues supportees ?',
                  a: 'L\'interface supporte 5 langues : Francais, Lingala, Kikongo, Tshiluba et Swahili. L\'API retourne les reponses en fonction de la langue de l\'utilisateur.'
                },
                {
                  q: 'Comment signaler un probleme technique urgent ?',
                  a: 'Pour les incidents critiques, contactez-nous directement par telephone au +243 81 234 5678 ou envoyez un email avec [URGENT] dans le sujet.'
                },
              ].map((faq, i) => (
                <div 
                  key={i} 
                  className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all"
                >
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{faq.q}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;