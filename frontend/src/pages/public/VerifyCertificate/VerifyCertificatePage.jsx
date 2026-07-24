import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield, ShieldCheck, ShieldAlert, Loader2,
  Baby, HeartCrack, Calendar, MapPin, Building2,
  AlertTriangle, CheckCircle2, XCircle, Search,
  QrCode, Camera, ArrowLeft, ScanLine
} from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api/v1';

// ─── QR Scanner Component (using html5-qrcode) ──────────────────────────────
const QRScanner = ({ onScan, onClose }) => {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');
  const scannerRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    let html5QrCode = null;

    const startScanner = async () => {
      try {
        const { Html5Qrcode } = await import('html5-qrcode');

        if (!containerRef.current) return;

        html5QrCode = new Html5Qrcode('qr-reader');
        scannerRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            // Extract certificate ID from URL
            const match = decodedText.match(/verify\/([A-Z]+-\d{4}-\d{4})/);
            const certId = match ? match[1] : decodedText;

            html5QrCode.stop().then(() => {
              onScan(certId);
            });
          },
          () => {} // Ignore errors during scanning
        );

        setScanning(true);
      } catch (err) {
        console.error('Scanner error:', err);
        setError('Impossible d\'accéder à la caméra. Vérifiez les permissions.');
      }
    };

    startScanner();

    return () => {
      if (html5QrCode) {
        html5QrCode.stop().catch(() => {});
      }
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <ScanLine className="w-5 h-5 text-blue-600" />
            Scanner un QR Code
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        {error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-center">
            <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        ) : (
          <>
            <div id="qr-reader" ref={containerRef} className="rounded-xl overflow-hidden" />
            {!scanning && (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
                <p className="text-sm text-gray-500 mt-2">Démarrage de la caméra...</p>
              </div>
            )}
          </>
        )}

        <p className="text-xs text-gray-400 text-center mt-4">
          Placez le QR code dans le cadre pour le scanner
        </p>
      </div>
    </div>
  );
};

// ─── Main Verification Page ─────────────────────────────────────────────────
const VerifyCertificatePage = () => {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [showScanner, setShowScanner] = useState(false);

  const verifyCertificate = async (certId) => {
    if (!certId.trim()) return;

    try {
      setLoading(true);
      setError('');
      const response = await axios.get(`${API_URL}/verify/${certId.trim()}/`);
      setData(response.data);
    } catch (err) {
      console.error('Verification error:', err);
      if (err.response?.status === 404) {
        setError(`Le certificat "${certId}" n'existe pas dans notre base de données.`);
      } else {
        setError('Erreur lors de la vérification. Veuillez réessayer.');
      }
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    verifyCertificate(inputValue);
  };

  const handleScan = (certId) => {
    setShowScanner(false);
    setInputValue(certId);
    verifyCertificate(certId);
  };

  const isValid = data?.valid;
  const isBirth = data?.type === 'birth';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Vérification de Certificat
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Vérifiez l'authenticité d'un certificat
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Input Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Numéro de certificat
              </label>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Ex: CERT-2026-0002 ou DEC-2026-0002"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setShowScanner(true)}
                  className="flex items-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  title="Scanner un QR code"
                >
                  <QrCode className="w-5 h-5" />
                  <span className="hidden sm:inline">Scanner</span>
                </button>
                <button
                  type="submit"
                  disabled={loading || !inputValue.trim()}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Search className="w-5 h-5" />
                  )}
                  <span className="hidden sm:inline">Vérifier</span>
                </button>
              </div>
            </div>
          </form>

          {/* Quick Actions */}
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Exemples :</p>
            <div className="flex flex-wrap gap-2">
              {['CERT-2026-0001', 'DEC-2026-0001', 'CERT-2026-0002'].map((example) => (
                <button
                  key={example}
                  onClick={() => {
                    setInputValue(example);
                    verifyCertificate(example);
                  }}
                  className="px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 mb-6 flex items-start gap-4">
            <XCircle className="w-8 h-8 text-red-500 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-red-700 dark:text-red-400">Vérification échouée</h3>
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Result */}
        {data && (
          <div className="space-y-6">
            {/* Status Banner */}
            <div className={`rounded-2xl shadow-sm p-6 ${
              isValid
                ? 'bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-200 dark:border-emerald-800'
                : 'bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800'
            }`}>
              <div className="flex items-center gap-4">
                {isValid ? (
                  <ShieldCheck className="w-12 h-12 text-emerald-600" />
                ) : (
                  <ShieldAlert className="w-12 h-12 text-amber-600" />
                )}
                <div>
                  <h2 className={`text-xl font-bold ${
                    isValid ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'
                  }`}>
                    {isValid ? 'Certificat Authentique' : 'Certificat en Attente'}
                  </h2>
                  <p className={`text-sm ${
                    isValid ? 'text-emerald-600 dark:text-emerald-500' : 'text-amber-600 dark:text-amber-500'
                  }`}>
                    {data?.message}
                  </p>
                </div>
              </div>
            </div>

            {/* Certificate Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-6">
                {isBirth ? (
                  <Baby className="w-6 h-6 text-blue-600" />
                ) : (
                  <HeartCrack className="w-6 h-6 text-red-600" />
                )}
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {isBirth ? 'Certificat de Naissance' : 'Certificat de Décès'}
                </h3>
                <span className={`ml-auto px-3 py-1 rounded-full text-xs font-medium ${
                  isValid
                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                    : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                }`}>
                  {data?.status === 'approved' ? 'Validé' : data?.status === 'paid' ? 'Payé' : data?.status}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Certificate ID */}
                <div className="md:col-span-2 bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Numéro de certificat</p>
                  <p className="font-mono text-lg font-semibold text-gray-900 dark:text-white">{data?.certificate_id}</p>
                </div>

                {/* Name */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                    {isBirth ? <Baby className="w-4 h-4 text-gray-600" /> : <HeartCrack className="w-4 h-4 text-gray-600" />}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">
                      {isBirth ? 'Nom de l\'enfant' : 'Nom du défunt'}
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {isBirth ? data?.child_name : data?.deceased_name}
                    </p>
                  </div>
                </div>

                {/* Date */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">
                      {isBirth ? 'Date de naissance' : 'Date de décès'}
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {isBirth ? data?.date_of_birth : data?.date_of_death}
                    </p>
                  </div>
                </div>

                {/* Place */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">
                      {isBirth ? 'Lieu de naissance' : 'Lieu de décès'}
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {isBirth ? data?.place_of_birth : data?.place_of_death}
                    </p>
                  </div>
                </div>

                {/* Hospital */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Hôpital</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{data?.hospital_name}</p>
                  </div>
                </div>

                {/* Parents (birth only) */}
                {isBirth && (
                  <>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-blue-600">P</span>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Père</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{data?.father_name}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-pink-100 dark:bg-pink-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-pink-600">M</span>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Mère</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{data?.mother_name}</p>
                      </div>
                    </div>
                  </>
                )}

                {/* Cause (death only) */}
                {!isBirth && data?.cause_of_death && (
                  <div className="md:col-span-2 flex items-start gap-3">
                    <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <HeartCrack className="w-4 h-4 text-red-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Cause du décès</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{data?.cause_of_death}</p>
                    </div>
                  </div>
                )}

                {/* Validation date */}
                {data?.verified_at && (
                  <div className="md:col-span-2 flex items-start gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Validé le</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {new Date(data.verified_at).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* QR Scanner Modal */}
      {showScanner && (
        <QRScanner
          onScan={handleScan}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
};

export default VerifyCertificatePage;