import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Building2, CheckCircle2, Award, ArrowRight 
} from 'lucide-react';

const ContactSection = () => {
  const navigate = useNavigate();

  const steps = [
    {
      step: '01',
      title: 'Inscription',
      description: 'Creez votre compte en quelques clics. Hopital, citoyen ou autorite, choisissez votre profil.',
      icon: Users,
    },
    {
      step: '02',
      title: 'Enregistrement',
      description: 'Les hopitaux enregistrent les naissances et deces via un formulaire guide en 4 etapes.',
      icon: Building2,
    },
    {
      step: '03',
      title: 'Paiement',
      description: 'Paiement securise via mobile money (Orange, Airtel, M-Pesa) ou carte bancaire.',
      icon: CheckCircle2,
    },
    {
      step: '04',
      title: 'Validation',
      description: 'Les autorites valident le certificat. Le citoyen recoit une notification et peut telecharger son document.',
      icon: Award,
    },
  ];

  const testimonials = [
    {
      name: 'Dr. Marie Kabongo',
      role: 'Directrice, Hopital General de Kinshasa',
      content: "Care-Link RDC a revolutionne notre processus d'enregistrement. Ce qui prenait des jours se fait maintenant en minutes.",
      avatar: 'MK',
    },
    {
      name: 'Jean-Pierre Mulumba',
      role: 'Citoyen, Lubumbashi',
      content: "J'ai pu obtenir le certificat de naissance de mon fils en 24h. Avant, c'etait des semaines d'attente.",
      avatar: 'JM',
    },
    {
      name: 'Mme. Sophie Ilunga',
      role: 'Autorite provinciale',
      content: "La tracabilite complete et les statistiques en temps reel nous aident enormement dans la planification sanitaire.",
      avatar: 'SI',
    },
  ];

  return (
    <>
      {/* How It Works */}
      <section id="steps" className="py-24 lg:py-32 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Comment ca{' '}
              <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                marche
              </span>
              ?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Un processus simple et transparent en 4 etapes.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-indigo-500 to-violet-500" />
                )}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center">
                      <step.icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-4xl font-bold text-gray-100 dark:text-gray-700">{step.step}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{step.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Ils nous font{' '}
              <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                confiance
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index} 
                className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center gap-1 mb-6">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} className="w-5 h-5 text-amber-400 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">"{testimonial.content}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{testimonial.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 lg:py-32 bg-gradient-to-br from-indigo-600 via-violet-600 to-indigo-700 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">
            Pret a moderniser la gestion des certificats ?
          </h2>
          <p className="text-lg text-indigo-100 mb-10 max-w-2xl mx-auto">
            Rejoignez les hopitaux, citoyens et autorites qui utilisent deja Care-Link RDC.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate('/inscription')}
              className="inline-flex items-center justify-center gap-2 bg-white text-indigo-600 px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-xl transition-all hover:scale-105"
            >
              Creer un compte gratuit
              <ArrowRight className="w-5 h-5" />
            </button>
            <button 
              onClick={() => navigate('/connexion')}
              className="inline-flex items-center justify-center gap-2 border-2 border-white/30 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white/10 transition-all"
            >
              Se connecter
            </button>
          </div>
        </div>
      </section>
    </>
  );
};

export default ContactSection;
