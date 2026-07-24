import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { NotificationProvider } from './context/NotificationContext';

// Layout
import Layout from './components/Layout/Layout';

// Gestion des erreurs 
import NotFound from './pages/public/Legal/NotFound';
import Forbidden from './pages/public/Legal/Forbidden';
import ServerError from './pages/public/Legal/ServerError';
import Maintenance from './pages/public/Legal/Maintenance';

// Public pages
import LandingPage from './pages/public/LandingPage/LandingPage';
import Login from './pages/public/Login/Login';
import Register from './pages/public/Register/Register';
import Guide from './pages/public/Guide/Guide';
import HospitalPaiement from './pages/hospital/Paiement/HospitalPaiement';  
import PublicationDetail from './pages/public/PublicationDetail/PublicationDetail';
import ForgotPassword from './pages/public/ForgotPassword/ForgotPassword';
import VerifyCertificate from './pages/public/VerifyCertificate/VerifyCertificate';


// Legal pages
import Confidentialite from './pages/public/Legal/Confidentialite';
import Conditions from './pages/public/Legal/Conditions';
import Cookies from './pages/public/Legal/Cookies';
import MentionsLegales from './pages/public/Legal/MentionsLegales';
import Accessibilite from './pages/public/Legal/Accessibilite';
import APIDocs from './pages/public/Legal/APIDocs';
import Contact from './pages/public/Legal/Contact';
import APropos from './pages/public/Legal/APropos';

// Citizen pages
import CitizenDashboard from './pages/citizen/Dashboard/CitizenDashboard';
import CitizenCertificats from './pages/citizen/Certificats/CitizenCertificats';
import CitizenSignalement from './pages/citizen/Signalement/CitizenSignalement';
import CitizenProfil from './pages/citizen/Profil/CitizenProfil';
import CitizenParametres from './pages/citizen/Parametres/CitizenParametres';

// Hospital pages
import HospitalDashboard from './pages/hospital/Dashboard/HospitalDashboard';
import HospitalNaissances from './pages/hospital/Naissances/HospitalNaissances';
import HospitalNaissanceForm from './pages/hospital/Naissances/HospitalNaissanceForm';
import BirthDetail from './pages/hospital/Naissances/BirthDetail';
import HospitalDeces from './pages/hospital/Deces/HospitalDeces';
import HospitalDecesForm from './pages/hospital/Deces/HospitalDecesForm';
import DeathDetail from './pages/hospital/Deces/DeathDetail';
import HospitalCertificats from './pages/hospital/Certificats/HospitalCertificats';
import HospitalStatistiques from './pages/hospital/Statistiques/HospitalStatistiques';
import HospitalProfil from './pages/hospital/Profil/HospitalProfil';
import HospitalParametres from './pages/hospital/Parametres/HospitalParametres';
import AuthorityHopitalDetail from './pages/authority/Hopitaux/AuthorityHopitalDetail';
import HospitalVerifyCertificatePage from './pages/hospital/VerifyCertificatePage/VerifyCertificatePage';

// Authority pages
import AuthorityDashboard from './pages/authority/Dashboard/AuthorityDashboard';
import AuthorityHopitaux from './pages/authority/Hopitaux/AuthorityHopitaux';
import AuthorityValidation from './pages/authority/Validation/AuthorityValidation';
import AuthorityRapports from './pages/authority/Rapports/AuthorityRapports';
import AuthorityAudit from './pages/authority/Audit/AuthorityAudit';
import AuthorityStatistiques from './pages/authority/Statistiques/AuthorityStatistiques';
import AuthorityProfil from './pages/authority/Profil/AuthorityProfil';
import AuthorityParametres from './pages/authority/Parametres/AuthorityParametres';
import AuthoritySignalement from './pages/authority/signalement/AuthoritySignalement';
import AuthorityVerifyCertificatePage from './pages/authority/VerifyCertificatePage/VerifyCertificatePage';

// NEW: Notification page (accessible to all authenticated users)
import NotificationPage from './components/notifications/NotificationPage';

// Ai-Assistant services
import AIChatPage from './components/AIChatPage/AIChatPage';

import { useAuth } from './context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) return <div>Chargement...</div>;
  if (!isAuthenticated) return <Navigate to="/connexion" replace />;

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/403" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <LanguageProvider>
          <NotificationProvider>
            <BrowserRouter>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/connexion" element={<Login />} />
                <Route path="/inscription" element={<Register />} />
                <Route path="/guide" element={<Guide />} />
                <Route path="/paiement" element={<HospitalPaiement />} />
                <Route path="/publication/:id" element={<PublicationDetail />} />
                <Route path="/mot-de-passe-oublie" element={<ForgotPassword />} />
                <Route path="/verify/:certificateId" element={<VerifyCertificate />} />

                {/* Error Routes */}
                <Route path="/404" element={<NotFound />} />
                <Route path="/403" element={<Forbidden />} />
                <Route path="/500" element={<ServerError />} />
                <Route path="/maintenance" element={<Maintenance />} />

                {/* Legal Routes */}
                <Route path="/confidentialite" element={<Confidentialite />} />
                <Route path="/conditions" element={<Conditions />} />
                <Route path="/cookies" element={<Cookies />} />
                <Route path="/mentions-legales" element={<MentionsLegales />} />
                <Route path="/accessibilite" element={<Accessibilite />} />
                <Route path="/docs/api" element={<APIDocs />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/a-propos" element={<APropos />} />

                {/* Citizen Routes */}
                <Route path="/citizen-dashboard/*" element={
                  <ProtectedRoute allowedRoles={['citizen']}>
                    <Layout role="citizen" />
                  </ProtectedRoute>
                }>
                  <Route index element={<CitizenDashboard />} />
                  <Route path="certificats" element={<CitizenCertificats />} />
                  <Route path="signalement" element={<CitizenSignalement />} />
                  <Route path="profil" element={<CitizenProfil />} />
                  <Route path="parametres" element={<CitizenParametres />} />
                  <Route path="assistant" element={<AIChatPage />} />
                  {/* NEW: Notifications page */}
                  <Route path="notifications" element={<NotificationPage />} />
                </Route>

                {/* Hospital Routes */}
                <Route path="/hospital-dashboard/*" element={
                  <ProtectedRoute allowedRoles={['hospital']}>
                    <Layout role="hospital" />
                  </ProtectedRoute>
                }>
                  <Route index element={<HospitalDashboard />} />
                  <Route path="naissances" element={<HospitalNaissances />} />
                  <Route path="naissances/nouveau" element={<HospitalNaissanceForm />} />
                  <Route path="naissances/:id" element={<BirthDetail />} />
                  <Route path="naissances/:id/edit" element={<HospitalNaissanceForm />} />
                  <Route path="deces" element={<HospitalDeces />} />
                  <Route path="deces/nouveau" element={<HospitalDecesForm />} />
                  <Route path="deces/:id" element={<DeathDetail />} />
                  <Route path="deces/:id/edit" element={<HospitalDecesForm />} />
                  <Route path="certificats" element={<HospitalCertificats />} />
                  <Route path="statistiques" element={<HospitalStatistiques />} />
                  <Route path="verify" element={<HospitalVerifyCertificatePage />} />
                  <Route path="profil" element={<HospitalProfil />} />
                  <Route path="parametres" element={<HospitalParametres />} />
                  <Route path="assistant" element={<AIChatPage />} />
                  {/* NEW: Notifications page */}
                  <Route path="notifications" element={<NotificationPage />} />
                </Route>

                {/* Authority Routes */}
                <Route path="/authority-dashboard/*" element={
                  <ProtectedRoute allowedRoles={['authority']}>
                    <Layout role="authority" />
                  </ProtectedRoute>
                }>
                  <Route index element={<AuthorityDashboard />} />
                  <Route path="hopitaux" element={<AuthorityHopitaux />} />
                  <Route path="hopitaux/:id" element={<AuthorityHopitalDetail />} />
                  <Route path="validation" element={<AuthorityValidation />} />
                  <Route path="rapports" element={<AuthorityRapports />} />
                  <Route path="audit" element={<AuthorityAudit />} />
                  <Route path="statistiques" element={<AuthorityStatistiques />} />
                  <Route path="verify" element={<AuthorityVerifyCertificatePage />} />
                  <Route path="profil" element={<AuthorityProfil />} />
                  <Route path="parametres" element={<AuthorityParametres />} />
                  <Route path="signalement" element={<AuthoritySignalement />} />
                  <Route path="assistant" element={<AIChatPage />} />
                  {/* NEW: Notifications page */}
                  <Route path="notifications" element={<NotificationPage />} />
                </Route>

                {/* Fallback */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </NotificationProvider>
        </LanguageProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;