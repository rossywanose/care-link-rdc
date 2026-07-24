import React, { useState } from 'react';
import { QrCode, FileText, Download, ExternalLink, Loader2, AlertTriangle } from 'lucide-react';

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api/v1';

const CertificatePreview = ({ 
  certificateId, 
  type, // 'birth' ou 'death'
  status,
  api 
}) => {
  const [activeTab, setActiveTab] = useState('qr'); // 'qr' | 'pdf'
  const [qrLoading, setQrLoading] = useState(false);
  const [qrError, setQrError] = useState('');
  const [qrUrl, setQrUrl] = useState('');
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');

  const isValidated = status === 'approved' || status === 'paid';
  const verifyUrl = `https://carelink-rdc.cd/verify/${certificateId}`;

  const loadQRCode = async () => {
    if (qrUrl) return; // Déjà chargé
    setQrLoading(true);
    setQrError('');
    try {
      const endpoint = type === 'birth' 
        ? api.getBirthQRCode(certificateId)
        : api.getDeathQRCode(certificateId);
      
      const response = await endpoint;
      const blob = new Blob([response.data], { type: 'image/png' });
      const url = window.URL.createObjectURL(blob);
      setQrUrl(url);
    } catch (err) {
      console.error('Error loading QR code:', err);
      setQrError('Impossible de charger le QR code.');
    } finally {
      setQrLoading(false);
    }
  };

  const loadPDFPreview = async () => {
    if (pdfUrl) return; // Déjà chargé
    setPdfLoading(true);
    setPdfError('');
    try {
      const endpoint = type === 'birth'
        ? api.getBirthPreview(certificateId)
        : api.getDeathPreview(certificateId);
      
      const response = await endpoint;
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      setPdfUrl(url);
    } catch (err) {
      console.error('Error loading PDF preview:', err);
      if (err.response?.status === 403) {
        setPdfError('Le certificat doit être validé pour être prévisualisé.');
      } else {
        setPdfError('Impossible de charger l\'aperçu du certificat.');
      }
    } finally {
      setPdfLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'qr' && !qrUrl && !qrLoading) {
      loadQRCode();
    } else if (tab === 'pdf' && !pdfUrl && !pdfLoading) {
      loadPDFPreview();
    }
  };

  const handleDownloadQR = () => {
    if (!qrUrl) return;
    const link = document.createElement('a');
    link.href = qrUrl;
    link.download = `QR_${certificateId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenVerify = () => {
    window.open(verifyUrl, '_blank');
  };

  // Si le certificat n'est pas validé
  if (!isValidated) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <div className="flex items-center gap-3 mb-4">
          <QrCode className="w-5 h-5 text-gray-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Aperçu du certificat</h3>
        </div>
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6 text-center">
          <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
          <p className="text-amber-700 dark:text-amber-400 font-medium">
            Certificat en attente de validation
          </p>
          <p className="text-sm text-amber-600 dark:text-amber-500 mt-1">
            Le QR code et l'aperçu PDF seront disponibles après validation par les autorités.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={() => handleTabChange('qr')}
          className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors ${
            activeTab === 'qr'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50 dark:bg-blue-900/10'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          <QrCode className="w-4 h-4" />
          QR Code
        </button>
        <button
          onClick={() => handleTabChange('pdf')}
          className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors ${
            activeTab === 'pdf'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50 dark:bg-blue-900/10'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          <FileText className="w-4 h-4" />
          Certificat PDF
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* QR Code Tab */}
        {activeTab === 'qr' && (
          <div className="text-center">
            {qrLoading ? (
              <div className="py-12">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
                <p className="text-gray-500 text-sm mt-3">Génération du QR code...</p>
              </div>
            ) : qrError ? (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                <p className="text-red-600 dark:text-red-400 text-sm">{qrError}</p>
              </div>
            ) : qrUrl ? (
              <div className="space-y-4">
                <div className="inline-block bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                  <img 
                    src={qrUrl} 
                    alt="QR Code de vérification" 
                    className="w-48 h-48 object-contain"
                  />
                </div>
                <p className="text-sm text-gray-500 font-mono break-all">
                  {verifyUrl}
                </p>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={handleDownloadQR}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Télécharger
                  </button>
                  <button
                    onClick={handleOpenVerify}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Vérifier
                  </button>
                </div>
                <p className="text-xs text-gray-400">
                  Scannez ce QR code pour vérifier l'authenticité du certificat sur carelink-rdc.cd
                </p>
              </div>
            ) : null}
          </div>
        )}

        {/* PDF Preview Tab */}
        {activeTab === 'pdf' && (
          <div>
            {pdfLoading ? (
              <div className="py-12 text-center">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
                <p className="text-gray-500 text-sm mt-3">Chargement de l'aperçu...</p>
              </div>
            ) : pdfError ? (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                <p className="text-red-600 dark:text-red-400 text-sm">{pdfError}</p>
              </div>
            ) : pdfUrl ? (
              <div className="space-y-4">
                <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
                  <iframe
                    src={pdfUrl}
                    title="Aperçu du certificat"
                    className="w-full h-[500px]"
                    style={{ border: 'none' }}
                  />
                </div>
                <p className="text-xs text-gray-400 text-center">
                  Aperçu du certificat officiel avec filigrane et sceau numérique
                </p>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};

export default CertificatePreview;