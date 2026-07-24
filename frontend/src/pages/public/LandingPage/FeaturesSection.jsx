import React from 'react';
import { CheckCircle, ArrowRight, Shield, Zap, Globe, Lock } from 'lucide-react';
import DashboardMockup from './mockups/DashboardMockup';
import BirthFormMockup from './mockups/BirthFormMockup';
import CertificateMockup from './mockups/CertificateMockup';
import MobileMockup from './mockups/MobileMockup';

const FeatureBlock = ({ title, description, features, mockup: Mockup, reverse, badge, badgeColor }) => {
  return (
    <div className={`grid lg:grid-cols-2 gap-12 lg:gap-20 items-center ${reverse ? 'lg:flex-row-reverse' : ''}`}>
      <div className={`${reverse ? 'lg:order-2' : ''}`}>
        {badge && (
          <span className={`inline-flex items-center gap-1.5 ${badgeColor} rounded-full px-3 py-1 text-xs font-medium mb-4`}>
            {badge}
          </span>
        )}
        <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
          {title}
        </h3>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
          {description}
        </p>
        <ul className="space-y-3">
          {features.map((feature, i) => (
            <li key={i} className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="text-gray-700 dark:text-gray-300">{feature}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className={`${reverse ? 'lg:order-1' : ''} relative`}>
        <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/5 to-violet-500/5 rounded-3xl blur-xl" />
        <div className="relative">
          <Mockup />
        </div>
      </div>
    </div>
  );
};

const FeaturesShowcase = () => {
  return (
    <section id="features" className="py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Une plateforme concue pour{' '}
            <span className="text-indigo-600 dark:text-indigo-400">simplifier</span>
            {' '}votre travail
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Decouvrez comment Care-Link RDC transforme la gestion des certificats d'etat civil.
          </p>
        </div>

        <div className="space-y-24 lg:space-y-32">

          {/* Feature 1: Dashboard */}
          <FeatureBlock
            badge="Tableau de bord"
            badgeColor="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300"
            title="Visualisez vos statistiques en temps reel"
            description="Suivez l'ensemble de votre activite depuis un tableau de bord intuitif. Naissances, deces, validations en attente — tout est la, en un coup d'oeil."
            features={[
              'Statistiques mensuelles avec graphiques interactifs',
              'Alertes en temps reel sur les validations en attente',
              'Export CSV et PDF des rapports',
              'Filtrage avance par periode et par hopital'
            ]}
            mockup={DashboardMockup}
          />

          {/* Feature 2: Birth Form */}
          <FeatureBlock
            badge="Enregistrement"
            badgeColor="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
            title="Enregistrez un certificat en 2 minutes"
            description="Un formulaire guide en 4 etapes qui simplifie chaque enregistrement. Plus d'erreurs, plus de paperasse — juste une experience fluide et rapide."
            features={[
              'Formulaire intelligent avec validation en temps reel',
              'Autocompletion des champs recurrents',
              'Upload de documents justificatifs',
              'Sauvegarde automatique a chaque etape'
            ]}
            mockup={BirthFormMockup}
            reverse
          />

          {/* Feature 3: Certificate */}
          <FeatureBlock
            badge="Certificats"
            badgeColor="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300"
            title="Des certificats officiels et verifiables"
            description="Chaque certificat genere est securise par un QR code unique et une signature numerique. Verifiable instantanement par les autorites competentes."
            features={[
              'QR code unique pour chaque certificat',
              'Signature numerique securisee',
              'Format PDF telechargeable et imprimable',
              'Verification en ligne par scan du QR code'
            ]}
            mockup={CertificateMockup}
          />

          {/* Feature 4: Mobile */}
          <FeatureBlock
            badge="Mobile"
            badgeColor="bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300"
            title="Gerez tout depuis votre telephone"
            description="L'application mobile Care-Link RDC vous permet de consulter vos certificats, recevoir des notifications et suivre vos demandes ou que vous soyez."
            features={[
              'Notifications push en temps reel',
              'Consultation hors-ligne des certificats',
              'Scan QR code pour verification rapide',
              'Disponible sur iOS et Android'
            ]}
            mockup={MobileMockup}
            reverse
          />
        </div>

        {/* Security Banner */}
        <div className="mt-24 lg:mt-32 bg-gray-50 dark:bg-gray-900/50 rounded-3xl p-8 lg:p-12">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            {[
              { icon: Shield, title: 'Securite maximale', desc: 'Cryptage AES-256 et authentification JWT' },
              { icon: Zap, title: 'Rapidite exceptionnelle', desc: 'Certificat genere en moins de 2 minutes' },
              { icon: Globe, title: '5 langues supportees', desc: 'Francais, Lingala, Kikongo, Tshiluba, Swahili' },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center mb-4">
                  <item.icon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{item.title}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesShowcase;