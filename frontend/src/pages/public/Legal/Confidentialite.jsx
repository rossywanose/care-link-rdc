import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Eye, Database, Share2, UserCheck, Mail } from 'lucide-react';
import Header from '../LandingPage/Header';
import Footer from '../LandingPage/Footer';

const Confidentialite = () => {
  const navigate = useNavigate();

  const sections = [
    {
      icon: Database,
      title: 'Donnees collectees',
      content: 'Nous collectons les informations necessaires a la gestion des certificats : nom, prenom, date de naissance/deces, lieu, informations des parents, et donnees de contact. Ces donnees sont strictement limitees a ce qui est requis par la loi congolaise.'
    },
    {
      icon: Lock,
      title: 'Securite des donnees',
      content: 'Vos donnees sont protegees par un cryptage AES-256 de niveau militaire. Les serveurs sont heberges en RDC et conformes aux normes de securite internationales. L\'acces est strictement controle et journalise.'
    },
    {
      icon: Eye,
      title: 'Utilisation des donnees',
      content: 'Les donnees sont utilisees uniquement pour : la generation des certificats officiels, la validation par les autorites competentes, et la consultation par les titulaires legitimes. Aucune utilisation commerciale n\'est faite de vos donnees.'
    },
    {
      icon: Share2,
      title: 'Partage des donnees',
      content: 'Vos donnees ne sont partagees qu\'avec : les autorites sanitaires competentes, les hôpitaux partenaires pour verification, et les services etatiques autorises. Aucun tiers commercial n\'a acces a vos informations.'
    },
    {
      icon: UserCheck,
      title: 'Vos droits',
      content: 'Conformement a la loi congolaise sur la protection des donnees, vous disposez des droits suivants : droit d\'acces, droit de rectification, droit a l\'effacement, droit a la portabilite, et droit d\'opposition au traitement.'
    },
    {
      icon: Mail,
      title: 'Contact DPO',
      content: 'Pour toute question relative a la protection de vos donnees, contactez notre Delegue a la Protection des Donnees (DPO) a l\'adresse : dpo@carelink-rdc.cd ou par telephone au +243 81 234 5678.'
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Header />

      {/* Hero */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-indigo-600 via-violet-600 to-indigo-700 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5 mb-6">
            <Shield className="w-4 h-4 text-white" />
            <span className="text-sm font-medium text-white">Protection des donnees</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            Politique de Confidentialite
          </h1>
          <p className="text-lg text-indigo-100">
            Derniere mise a jour : {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-12 leading-relaxed">
              Care-Link RDC s'engage a proteger la vie privee et les donnees personnelles de ses utilisateurs. 
              Cette politique de confidentialite explique comment nous collectons, utilisons et protegeons vos informations.
            </p>

            <div className="space-y-8">
              {sections.map((section, index) => (
                <div 
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                      <section.icon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                        {section.title}
                      </h2>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        {section.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Contact CTA */}
            <div className="mt-12 bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20 rounded-2xl p-8 border border-indigo-200 dark:border-indigo-800">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Des questions sur vos donnees ?
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Notre equipe de protection des donnees est disponible pour repondre a toutes vos questions.
              </p>
              <button 
                onClick={() => navigate('/guide')}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all"
              >
                <Mail className="w-4 h-4" />
                Contacter le DPO
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Confidentialite;
