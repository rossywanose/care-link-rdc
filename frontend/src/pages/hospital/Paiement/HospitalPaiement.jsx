import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { hospitalAPI, paymentAPI } from '../../../services/api';
import {
  Shield, CreditCard, Smartphone, CheckCircle2, Loader2,
  AlertCircle, ArrowLeft, Building2, BadgeCheck, Lock,
  Banknote, Phone
} from 'lucide-react';

const HospitalPaiement = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('airtel');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [license, setLicense] = useState('');
  const [hospitalStatus, setHospitalStatus] = useState(null);

  useEffect(() => {
    setMounted(true);
    checkHospitalStatus();
  }, []);

  const checkHospitalStatus = async () => {
    try {
      const response = await hospitalAPI.checkStatus();
      setHospitalStatus(response.data);
      
      if (response.data.opening_fee_paid) {
        setLicense(response.data.official_license);
        setSuccess(true);
        setTimeout(() => navigate('/hospital-dashboard'), 3000);
      }
    } catch (err) {
      console.error('Erreur check status:', err);
    } finally {
      setChecking(false);
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // ✅ CORRIGÉ : amount en string "1.00" pour éviter le problème de type
      const paymentData = {
        amount: "1.00",
        currency: 'USD',
        method: paymentMethod,
        phone_number: paymentMethod === 'airtel' ? phoneNumber : '',
        description: 'Frais d\'ouverture de compte hôpital Care-Link RDC'
      };

      console.log("📤 Données envoyées:", paymentData);

      const paymentResponse = await paymentAPI.createOpeningFee(paymentData);
      console.log("📥 Réponse création:", paymentResponse.data);
      
      const paymentId = paymentResponse.data.id;

      // Simuler le traitement
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Vérifier le paiement
      const verifyResponse = await paymentAPI.verifyPayment(paymentId, {
        simulate_success: true  // ← En dev, simule un succès
      });

      if (verifyResponse.data.status === 'success') {
        setLicense(verifyResponse.data.official_license);
        setSuccess(true);
        localStorage.removeItem('pending_payment');
        localStorage.removeItem('hospital_status');
      } else {
        setError('Le paiement n\'a pas pu être confirmé. Veuillez réessayer.');
      }
    } catch (err) {
      console.error('❌ Erreur paiement:', err);
      console.error('❌ Réponse erreur:', err.response?.data);
      setError(
        err.response?.data?.detail || 
        err.response?.data?.errors?.amount?.[0] ||
        err.response?.data?.errors?.phone_number?.[0] ||
        'Une erreur est survenue lors du paiement.'
      );
    } finally {
      setLoading(false);
    }
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) return parts.join(' ');
    return value;
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="text-sm text-gray-600 dark:text-gray-400">Vérification du statut...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className={`min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4 transition-all duration-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Paiement réussi !</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Votre hôpital est maintenant activé. Voici votre licence officielle :
          </p>
          
          <div className="bg-indigo-50 dark:bg-indigo-900/20 border-2 border-indigo-200 dark:border-indigo-800 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <BadgeCheck className="w-5 h-5 text-indigo-600" />
              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">Licence Officielle</span>
            </div>
            <p className="text-2xl font-mono font-bold text-indigo-700 dark:text-indigo-300 tracking-wider">
              {license}
            </p>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-500 mb-4">
            Cette licence vous a été envoyée par email à <strong>{user?.email}</strong>
          </p>

          <button
            onClick={() => navigate('/hospital-dashboard')}
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-indigo-500/30 transition-all"
          >
            Accéder à mon tableau de bord
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-950 py-8 px-4 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      <div className="max-w-lg mx-auto">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à l'accueil
        </button>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-6 text-center">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">Activation de votre hôpital</h1>
            <p className="text-indigo-100 text-sm mt-1">Dernière étape pour rejoindre Care-Link RDC</p>
          </div>

          <div className="p-6">
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-amber-800 dark:text-amber-300 font-medium">
                    Frais d'ouverture de compte requis
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                    Un paiement unique de <strong>1 $ US</strong> est nécessaire pour obtenir votre licence officielle et accéder au tableau de bord.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center mb-8">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Montant à payer</p>
              <p className="text-4xl font-bold text-gray-900 dark:text-white">1,00 <span className="text-lg text-gray-500">$ US</span></p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Méthode de paiement</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('airtel')}
                  className={`p-4 rounded-xl border-2 text-center transition-all ${
                    paymentMethod === 'airtel'
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Smartphone className={`w-6 h-6 mx-auto mb-2 ${paymentMethod === 'airtel' ? 'text-red-600' : 'text-gray-400'}`} />
                  <p className={`text-sm font-semibold ${paymentMethod === 'airtel' ? 'text-red-600' : 'text-gray-700 dark:text-gray-300'}`}>Airtel Money</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">Mobile Money</p>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('visa')}
                  className={`p-4 rounded-xl border-2 text-center transition-all ${
                    paymentMethod === 'visa'
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <CreditCard className={`w-6 h-6 mx-auto mb-2 ${paymentMethod === 'visa' ? 'text-indigo-600' : 'text-gray-400'}`} />
                  <p className={`text-sm font-semibold ${paymentMethod === 'visa' ? 'text-indigo-600' : 'text-gray-700 dark:text-gray-300'}`}>Visa / Carte</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">Carte bancaire</p>
                </button>
              </div>
            </div>

            <form onSubmit={handlePayment} className="space-y-4">
              {paymentMethod === 'airtel' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Numéro Airtel Money
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+243 99 123 4567"
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1.5">
                    Vous recevrez une demande de confirmation sur ce numéro.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Numéro de carte
                    </label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                        placeholder="4242 4242 4242 4242"
                        maxLength="19"
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Expiration
                      </label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/AA"
                        maxLength="5"
                        className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        CVC
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          value={cardCvc}
                          onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, ''))}
                          placeholder="123"
                          maxLength="4"
                          className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-indigo-500/30 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Traitement en cours...</span>
                  </>
                ) : (
                  <>
                    <Banknote className="w-5 h-5" />
                    <span>Payer 1,00 $ US</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  <span>Paiement sécurisé SSL</span>
                </div>
                <div className="flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  <span>Données chiffrées</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          &copy; {new Date().getFullYear()} Care-Link RDC. Tous droits réservés.
        </p>
      </div>
    </div>
  );
};

export default HospitalPaiement;