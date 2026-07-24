import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { publicationAPI } from '../../../services/publicationService';
import {
  X, Send, Calendar, MapPin, Baby, Skull,
  Loader2, FileText, Eye, CheckCircle2, AlertTriangle, ChevronDown
} from 'lucide-react';

const PERIOD_OPTIONS = [
  { value: 'day', label: 'Jour' },
  { value: 'week', label: 'Semaine' },
  { value: 'month', label: 'Mois' },
  { value: 'year', label: 'Annee' },
];

const GEO_OPTIONS = [
  { value: 'national', label: 'National', needsLocation: false },
  { value: 'province', label: 'Province', needsLocation: true },
  { value: 'city', label: 'Ville', needsLocation: true },
  { value: 'commune', label: 'Commune', needsLocation: true },
];

const PROVINCES = [
  'Bas-Uele', 'Equateur', 'Haut-Katanga', 'Haut-Lomami', 'Haut-Uele',
  'Ituri', 'Kasai', 'Kasai-Central', 'Kasai-Oriental', 'Kinshasa',
  'Kongo-Central', 'Kwango', 'Kwilu', 'Lomami', 'Lualaba', 'Mai-Ndombe',
  'Maniema', 'Mongala', 'Nord-Kivu', 'Nord-Ubangi', 'Sankuru',
  'Sud-Kivu', 'Sud-Ubangi', 'Tanganyika', 'Tshopo', 'Tshuapa'
];

const PublishReportModal = ({ isOpen, onClose, onPublished }) => {
  const { t } = useLanguage();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [error, setError] = useState('');
  const [previewData, setPreviewData] = useState(null);

  const [formData, setFormData] = useState({
    title: '', description: '', period_type: 'month',
    period_start: '', period_end: '', geo_level: 'national',
    province: '', city: '', commune: '',
  });

  useEffect(() => {
    if (isOpen) {
      setStep(1); setError(''); setPreviewData(null);
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      setFormData({
        title: `Rapport ${now.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`,
        description: '', period_type: 'month',
        period_start: start.toISOString().split('T')[0],
        period_end: end.toISOString().split('T')[0],
        geo_level: 'national', province: '', city: '', commune: '',
      });
    }
  }, [isOpen]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const needsLocation = GEO_OPTIONS.find(g => g.value === formData.geo_level)?.needsLocation;

  const validateStep1 = () => {
    if (!formData.title.trim()) return 'Le titre est requis';
    if (!formData.period_start) return 'La date de debut est requise';
    if (!formData.period_end) return 'La date de fin est requise';
    if (new Date(formData.period_start) > new Date(formData.period_end)) {
      return 'La date de debut doit etre avant la date de fin';
    }
    if (needsLocation) {
      if (formData.geo_level === 'province' && !formData.province) return 'Selectionnez une province';
      if (formData.geo_level === 'city' && !formData.city) return 'Saisissez une ville';
      if (formData.geo_level === 'commune' && !formData.commune) return 'Saisissez une commune';
    }
    return null;
  };

  const handlePreview = async () => {
    const validationError = validateStep1();
    if (validationError) { setError(validationError); return; }
    setPreviewLoading(true); setError('');
    try {
      const response = await publicationAPI.previewStats(formData);
      setPreviewData(response.data);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.detail || 'Erreur lors du calcul des statistiques');
    } finally { setPreviewLoading(false); }
  };

  const handlePublish = async () => {
    setLoading(true); setError('');
    try {
      const response = await publicationAPI.createPublication(formData);
      setStep(3);
      if (onPublished) onPublished(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Erreur lors de la publication');
    } finally { setLoading(false); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {step === 1 && 'Publier un rapport'}
                {step === 2 && 'Previsualisation'}
                {step === 3 && 'Publication reussie !'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Etape {step} sur 3</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Titre *</label>
                <input type="text" value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Ex: Rapport mensuel - Juillet 2026" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                <textarea value={formData.description} rows={3}
                  onChange={(e) => handleChange('description', e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                  placeholder="Commentaires..." />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Periode *</label>
                  <div className="relative">
                    <select value={formData.period_type}
                      onChange={(e) => handleChange('period_type', e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none appearance-none">
                      {PERIOD_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Debut *</label>
                  <input type="date" value={formData.period_start}
                    onChange={(e) => handleChange('period_start', e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Fin *</label>
                  <input type="date" value={formData.period_end}
                    onChange={(e) => handleChange('period_end', e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Niveau geographique *</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {GEO_OPTIONS.map(opt => (
                    <button key={opt.value}
                      onClick={() => handleChange('geo_level', opt.value)}
                      className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        formData.geo_level === opt.value
                          ? 'bg-indigo-600 text-white shadow-lg'
                          : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-100'
                      }`}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              {needsLocation && (
                <div className="space-y-4">
                  {formData.geo_level === 'province' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Province *</label>
                      <div className="relative">
                        <select value={formData.province}
                          onChange={(e) => handleChange('province', e.target.value)}
                          className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none appearance-none">
                          <option value="">Selectionner</option>
                          {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                  )}
                  {(formData.geo_level === 'city' || formData.geo_level === 'commune') && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ville *</label>
                        <input type="text" value={formData.city}
                          onChange={(e) => handleChange('city', e.target.value)}
                          className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                          placeholder="Ex: Kinshasa" />
                      </div>
                      {formData.geo_level === 'commune' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Commune *</label>
                          <input type="text" value={formData.commune}
                            onChange={(e) => handleChange('commune', e.target.value)}
                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="Ex: Gombe" />
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {step === 2 && previewData && (
            <div className="space-y-6">
              <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4 flex items-start gap-3">
                <Eye className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-indigo-900 dark:text-indigo-300">Voici les statistiques qui seront publiees</p>
                  <p className="text-xs text-indigo-700 dark:text-indigo-400 mt-1">Verifiez les donnees avant de confirmer.</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-5 text-center">
                  <Baby className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{previewData.total_births?.toLocaleString()}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Naissances</p>
                  <div className="flex justify-center gap-4 mt-2 text-xs text-gray-500">
                    <span>M {previewData.male_births}</span>
                    <span>F {previewData.female_births}</span>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-5 text-center">
                  <Skull className="w-8 h-8 text-gray-600 dark:text-gray-400 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-gray-600 dark:text-gray-400">{previewData.total_deaths?.toLocaleString()}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Deces</p>
                  <div className="flex justify-center gap-4 mt-2 text-xs text-gray-500">
                    <span>M {previewData.male_deaths}</span>
                    <span>F {previewData.female_deaths}</span>
                  </div>
                </div>
              </div>
              {previewData.details && Object.keys(previewData.details).length > 0 && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Details par periode</h4>
                  <div className="max-h-40 overflow-y-auto space-y-2">
                    {Object.entries(previewData.details).map(([key, values]) => (
                      Array.isArray(values) && values.length > 0 && (
                        <div key={key}>
                          <p className="text-xs font-medium text-gray-500 uppercase mb-1">{key.replace(/_/g, ' ')}</p>
                          <div className="space-y-1">
                            {values.slice(0, 5).map((item, i) => (
                              <div key={i} className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">
                                  {item.hour !== undefined ? `H${item.hour}` :
                                   item.day !== undefined ? `J${item.day}` :
                                   item.month ? new Date(item.month).toLocaleDateString('fr-FR', { month: 'short' }) :
                                   item.province || '—'}
                                </span>
                                <span className="font-medium text-gray-900 dark:text-white">{item.count}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Publication reussie !</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Votre rapport est maintenant visible publiquement.</p>
              <button onClick={onClose} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors">
                Fermer
              </button>
            </div>
          )}

          {error && (
            <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}
        </div>

        {step !== 3 && (
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-800">
            {step === 1 && (
              <>
                <button onClick={onClose} className="px-5 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl font-medium transition-colors">
                  Annuler
                </button>
                <button onClick={handlePreview} disabled={previewLoading}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-medium transition-colors flex items-center gap-2">
                  {previewLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Calcul...</>
                    : <><Eye className="w-4 h-4" /> Previsualiser</>}
                </button>
              </>
            )}
            {step === 2 && (
              <>
                <button onClick={() => setStep(1)} className="px-5 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl font-medium transition-colors">
                  Modifier
                </button>
                <button onClick={handlePublish} disabled={loading}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-medium transition-colors flex items-center gap-2">
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Publication...</>
                    : <><Send className="w-4 h-4" /> Publier</>}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PublishReportModal;