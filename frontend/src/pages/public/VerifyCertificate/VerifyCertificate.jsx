import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Shield, ShieldCheck, ShieldAlert, Loader2, 
  Baby, HeartCrack, Calendar, MapPin, Building2,
  AlertTriangle, CheckCircle2, XCircle
} from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api/v1';

const VerifyCertificate = () => {
  const { certificateId } = useParams();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    verifyCertificate();
  }, [certificateId]);

  const verifyCertificate = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/verify/${certificateId}/`);
      setData(response.data);
      setError('');
    } catch (err) {
      console.error('Verification error:', err);
      if (err.response?.status === 404) {
        setError('Ce certificat n\'existe pas dans notre base de données.');
      } else {
        setError('Erreur lors de la vérification. Veuillez réessayer.');
      }
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Vérification en cours...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Certificat Non Trouvé
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
            <p className="text-sm text-gray-500 font-mono">{certificateId}</p>
          </div>
          <p className="text-xs text-gray-400 mt-6">
            carelink-rdc.cd — Portail officiel de vérification
          </p>
        </div>
      </div>
    );
  }

  const isValid = data?.valid;
  const isBirth = data?.type === 'birth';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
            <Shield className="w-10 h-10 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Vérification de Certificat
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Portail officiel Care-Link RDC
          </p>
        </div>

        {/* Status Card */}
        <div className={`rounded-2xl shadow-lg p-8 mb-6 ${
          isValid 
            ? 'bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-200 dark:border-emerald-800' 
            : 'bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800'
        }`}>
          <div className="flex items-center gap-4 mb-4">
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

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Numéro de certificat</p>
            <p className="font-mono text-lg font-semibold text-gray-900 dark:text-white">{data?.certificate_id}</p>
          </div>
        </div>

        {/* Certificate Details */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            {isBirth ? (
              <Baby className="w-6 h-6 text-blue-600" />
            ) : (
              <HeartCrack className="w-6 h-6 text-red-600" />
            )}
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {isBirth ? 'Certificat de Naissance' : 'Certificat de Décès'}
            </h3>
          </div>

          <div className="space-y-4">
            {/* Nom */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                {isBirth ? (
                  <Baby className="w-4 h-4 text-gray-600" />
                ) : (
                  <HeartCrack className="w-4 h-4 text-gray-600" />
                )}
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

            {/* Lieu */}
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

            {/* Hôpital */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                <Building2 className="w-4 h-4 text-gray-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Hôpital</p>
                <p className="font-semibold text-gray-900 dark:text-white">{data?.hospital_name}</p>
              </div>
            </div>

            {/* Parents (naissance uniquement) */}
            {isBirth && (
              <>
                <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Parents</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Père</p>
                      <p className="font-medium text-gray-900 dark:text-white">{data?.father_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Mère</p>
                      <p className="font-medium text-gray-900 dark:text-white">{data?.mother_name}</p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Cause (décès uniquement) */}
            {!isBirth && data?.cause_of_death && (
              <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Cause du décès</p>
                <p className="font-medium text-gray-900 dark:text-white">{data?.cause_of_death}</p>
              </div>
            )}

            {/* Date de validation */}
            {data?.verified_at && (
              <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Validé le</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {new Date(data.verified_at).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-400">
            © 2026 Care-Link RDC — Système officiel d'état civil numérique
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Cette vérification est fournie à titre informatif. Pour toute question, contactez les autorités compétentes.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyCertificate;