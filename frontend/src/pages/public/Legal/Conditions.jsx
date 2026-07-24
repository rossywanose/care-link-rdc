import React from 'react';
import { FileText, CheckCircle, AlertTriangle, Scale, Clock, Ban, RefreshCw } from 'lucide-react';
import Header from '../LandingPage/Header';
import Footer from '../LandingPage/Footer';

const Conditions = () => {
  const sections = [
    {
      icon: FileText,
      title: 'Objet des conditions',
      content: 'Les presentes conditions d\'utilisation regissent l\'acces et l\'utilisation de la plateforme Care-Link RDC, service de gestion electronique des certificats de naissance et de deces en Republique Democratique du Congo.'
    },
    {
      icon: CheckCircle,
      title: 'Acceptation des conditions',
      content: 'En accedant a la plateforme et en l\'utilisant, vous acceptez sans reserve les presentes conditions. Si vous n\'acceptez pas ces conditions, vous ne devez pas utiliser nos services. L\'inscription implique l\'acceptation integrale de ces termes.'
    },
    {
      icon: Scale,
      title: 'Obligations des utilisateurs',
      content: 'Les utilisateurs s\'engagent a : fournir des informations exactes et a jour, ne pas usurper l\'identite d\'un tiers, respecter la confidentialite des donnees, ne pas tenter d\'acceder aux donnees d\'autres utilisateurs, et utiliser la plateforme conformement a la legislation congolaise.'
    },
    {
      icon: AlertTriangle,
      title: 'Responsabilites',
      content: 'Care-Link RDC ne peut etre tenu responsable des dommages indirects resultant de l\'utilisation de la plateforme. Les utilisateurs sont responsables de l\'exactitude des informations fournies. La plateforme est fournie "en l\'etat" sans garantie explicite de disponibilite continue.'
    },
    {
      icon: Clock,
      title: 'Duree et resiliation',
      content: 'Ces conditions entrent en vigueur des l\'acceptation par l\'utilisateur. Elles restent applicables tant que l\'utilisateur utilise la plateforme. Care-Link RDC se reserve le droit de suspendre ou resilier l\'acces en cas de violation des conditions, apres notification prealable.'
    },
    {
      icon: Ban,
      title: 'Interdictions',
      content: 'Il est strictement interdit de : pirater ou tenter de pirater la plateforme, diffuser du contenu illegal, utiliser des robots ou scripts non autorises, perturber le fonctionnement du service, ou revendre l\'acces a la plateforme. Toute violation entrainera des sanctions.'
    },
    {
      icon: RefreshCw,
      title: 'Modifications',
      content: 'Care-Link RDC se reserve le droit de modifier ces conditions a tout moment. Les modifications entrent en vigueur des leur publication. Les utilisateurs seront notifies des changements importants. L\'utilisation continue apres modification vaut acceptation.'
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Header />

      <section className="pt-32 pb-16 bg-gradient-to-br from-indigo-600 via-violet-600 to-indigo-700 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5 mb-6">
            <FileText className="w-4 h-4 text-white" />
            <span className="text-sm font-medium text-white">Conditions d'utilisation</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            Conditions d'Utilisation
          </h1>
          <p className="text-lg text-indigo-100">
            Derniere mise a jour : {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-12 leading-relaxed">
              En utilisant Care-Link RDC, vous acceptez les conditions d'utilisation suivantes. 
              Veuillez les lire attentivement avant d'utiliser nos services.
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
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Conditions;
