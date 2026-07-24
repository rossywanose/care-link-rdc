import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { authAPI } from '../../../services/api';
import {
  Eye, EyeOff, Mail, Lock, User, Phone, Building2,
  ArrowRight, Shield, AlertCircle, Loader2, CheckCircle2,
  MapPin, ArrowLeft, Landmark, Gavel, Heart, Baby, FileCheck,
  Activity, Users, Globe, ChevronRight, Sparkles, ShieldCheck
} from 'lucide-react';

// =====================================================
// DONNEES DES PROVINCES / VILLES / COMMUNES
// =====================================================
const LOCATION_DATA = {
  'Kinshasa': {
    cities: ['Kinshasa'],
    communes: {
      'Kinshasa': ['Bandalungwa', 'Barumbu', 'Bumbu', 'Gombe', 'Kalamu', 'Kasa-Vubu', 'Kimbanseke', 'Kinshasa', 'Kintambo', 'Kisenso', 'Lemba', 'Limete', 'Lingwala', 'Makelele', 'Maluku', 'Masina', 'Matete', 'Mont-Ngafula', 'Ndjili', 'Ngaba', 'Ngaliema', 'Ngiri-Ngiri', 'Nsele', 'Selembao']
    }
  },
  'Bas-Uele': {
    cities: ['Buta', 'Bondo'],
    communes: {
      'Buta': ['Buta', 'Monganzolo', 'Rimba'],
      'Bondo': ['Bondo', 'Ango', 'Bambesa']
    }
  },
  'Equateur': {
    cities: ['Mbandaka', 'Gemena'],
    communes: {
      'Mbandaka': ['Mbandaka', 'Bikoro', 'Lukolela'],
      'Gemena': ['Gemena', 'Budjala', 'Kungu']
    }
  },
  'Haut-Katanga': {
    cities: ['Lubumbashi', 'Likasi'],
    communes: {
      'Lubumbashi': ['Annexe', 'Kamalondo', 'Kampemba', 'Katuba', 'Kenya', 'Lubumbashi', 'Mumbunda', 'Rwashi'],
      'Likasi': ['Likasi', 'Panda', 'Kambove']
    }
  },
  'Haut-Lomami': {
    cities: ['Kamina', 'Kabongo'],
    communes: {
      'Kamina': ['Kamina', 'Kaniama'],
      'Kabongo': ['Kabongo', 'Malonga']
    }
  },
  'Haut-Uele': {
    cities: ['Isiro', 'Watsa'],
    communes: {
      'Isiro': ['Isiro', 'Rungu'],
      'Watsa': ['Watsa', 'Wamba']
    }
  },
  'Ituri': {
    cities: ['Bunia', 'Mahagi'],
    communes: {
      'Bunia': ['Bunia', 'Mongbwalu'],
      'Mahagi': ['Mahagi', 'Djugu']
    }
  },
  'Kasai': {
    cities: ['Tshikapa', 'Luebo'],
    communes: {
      'Tshikapa': ['Tshikapa', 'Dibaya'],
      'Luebo': ['Luebo', 'Ilebo']
    }
  },
  'Kasai-Central': {
    cities: ['Kananga', 'Demba'],
    communes: {
      'Kananga': ['Kananga', 'Dibaya', 'Katende'],
      'Demba': ['Demba', 'Dimbelenge']
    }
  },
  'Kasai-Oriental': {
    cities: ['Mbuji-Mayi', 'Mweka'],
    communes: {
      'Mbuji-Mayi': ['Bipemba', 'Dibindi', 'Kanshi', 'Mbuji-Mayi'],
      'Mweka': ['Mweka', 'Lupatapata']
    }
  },
  'Kongo-Central': {
    cities: ['Matadi', 'Boma'],
    communes: {
      'Matadi': ['Matadi', 'Mvuzi'],
      'Boma': ['Boma', 'Muanda', 'Tshela']
    }
  },
  'Kwango': {
    cities: ['Kenge', 'Popokabaka'],
    communes: {
      'Kenge': ['Kenge', 'Feshi'],
      'Popokabaka': ['Popokabaka', 'Kasongo-Lunda']
    }
  },
  'Kwilu': {
    cities: ['Bandundu', 'Kikwit'],
    communes: {
      'Bandundu': ['Bandundu', 'Mushie'],
      'Kikwit': ['Kikwit', 'Bulungu', 'Masi-Manimba']
    }
  },
  'Lomami': {
    cities: ['Kabinda', 'Mwene-Ditu'],
    communes: {
      'Kabinda': ['Kabinda', 'Lubao'],
      'Mwene-Ditu': ['Mwene-Ditu', 'Ngandajika']
    }
  },
  'Lualaba': {
    cities: ['Kolwezi', 'Dilolo'],
    communes: {
      'Kolwezi': ['Kolwezi', 'Mutshatsha'],
      'Dilolo': ['Dilolo', 'Kapanga']
    }
  },
  'Mai-Ndombe': {
    cities: ['Inongo', 'Kiri'],
    communes: {
      'Inongo': ['Inongo', 'Oshwe'],
      'Kiri': ['Kiri', 'Bokoro']
    }
  },
  'Maniema': {
    cities: ['Kindu', 'Kasongo'],
    communes: {
      'Kindu': ['Kindu', 'Kibombo'],
      'Kasongo': ['Kasongo', 'Pangi']
    }
  },
  'Mongala': {
    cities: ['Lisala', 'Bumba'],
    communes: {
      'Lisala': ['Lisala', 'Bongandanga'],
      'Bumba': ['Bumba', 'Yambuku']
    }
  },
  'Nord-Kivu': {
    cities: ['Goma', 'Butembo'],
    communes: {
      'Goma': ['Goma', 'Karisimbi', 'Kyeshero'],
      'Butembo': ['Butembo', 'Lubero', 'Beni']
    }
  },
  'Nord-Ubangi': {
    cities: ['Gbadolite', 'Bosobolo'],
    communes: {
      'Gbadolite': ['Gbadolite', 'Mobayi-Mbongo'],
      'Bosobolo': ['Bosobolo', 'Yakoma']
    }
  },
  'Sankuru': {
    cities: ['Lusambo', 'Lodja'],
    communes: {
      'Lusambo': ['Lusambo', 'Kole'],
      'Lodja': ['Lodja', 'Dekese']
    }
  },
  'Sud-Kivu': {
    cities: ['Bukavu', 'Uvira'],
    communes: {
      'Bukavu': ['Bagira', 'Ibanda', 'Kadutu', 'Bukavu'],
      'Uvira': ['Uvira', 'Fizi', 'Mwenga']
    }
  },
  'Sud-Ubangi': {
    cities: ['Gemena', 'Budjala'],
    communes: {
      'Gemena': ['Gemena', 'Businga'],
      'Budjala': ['Budjala', 'Libenge']
    }
  },
  'Tanganyika': {
    cities: ['Kalemie', 'Kongolo'],
    communes: {
      'Kalemie': ['Kalemie', 'Moba'],
      'Kongolo': ['Kongolo', 'Manono']
    }
  },
  'Tshopo': {
    cities: ['Kisangani', 'Yangambi'],
    communes: {
      'Kisangani': ['Kisangani', 'Lubunga', 'Makiso', 'Tshopo'],
      'Yangambi': ['Yangambi', 'Bafwasende']
    }
  },
  'Tshuapa': {
    cities: ['Boende', 'Bokungu'],
    communes: {
      'Boende': ['Boende', 'Wema'],
      'Bokungu': ['Bokungu', 'Monkoto']
    }
  }
};

const Register = () => {
  const navigate = useNavigate();
  const { register, registerAuthority } = useAuth();
  const [step, setStep] = useState(1);
  const [mounted, setMounted] = useState(false);
  const [pageLoaded, setPageLoaded] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    province: '',
    city: '',
    commune: '',
    address: '',
    role: 'citizen',
    hospitalName: '',
    hospitalProvince: '',
    //hospitalLicense: '',
    hospitalCity: '',
    hospitalCommune: '',
    hospitalAddress: '',
    matricule: '',
    grade: '',
    service: '',
    direction: '',
    acceptTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [registerError, setRegisterError] = useState('');
  // ✅ NOUVEAU : États pour vérification matricule
  const [matriculeVerified, setMatriculeVerified] = useState(false);
  const [matriculeInfo, setMatriculeInfo] = useState(null);
  const [verifyingMatricule, setVerifyingMatricule] = useState(false);
  const [matriculeError, setMatriculeError] = useState('');

  // Animation d'ouverture de page
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 50);
    const loadedTimer = setTimeout(() => setPageLoaded(true), 800);
    return () => {
      clearTimeout(timer);
      clearTimeout(loadedTimer);
    };
  }, []);

  // Donnees dynamiques selon la province
  const provinces = Object.keys(LOCATION_DATA);
  const availableCities = formData.province ? LOCATION_DATA[formData.province]?.cities || [] : [];
  const availableCommunes = (formData.province && formData.city) 
    ? LOCATION_DATA[formData.province]?.communes[formData.city] || [] 
    : [];

  // Données dynamiques pour l'hôpital (même source LOCATION_DATA)
  const availableHospitalCities = formData.hospitalProvince 
    ? LOCATION_DATA[formData.hospitalProvince]?.cities || [] 
    : [];
  const availableHospitalCommunes = (formData.hospitalProvince && formData.hospitalCity) 
    ? LOCATION_DATA[formData.hospitalProvince]?.communes[formData.hospitalCity] || [] 
    : [];
    
  const stats = [
    { icon: Users, value: '50K+', label: 'Citoyens enregistrés' },
    { icon: Building2, value: '200+', label: 'Hôpitaux partenaires' },
    { icon: FileCheck, value: '100K+', label: 'Certificats délivrés' },
    { icon: ShieldCheck, value: '99.9%', label: 'Sécurité garantie' }
  ];

  const features = [
    { icon: Baby, text: 'Enregistrement des naissances' },
    { icon: Heart, text: 'Certificats de décès' },
    { icon: FileCheck, text: 'Documents authentifiés' },
    { icon: Activity, text: 'Suivi en temps réel' }
  ];

  const validateStep = (currentStep) => {
    const newErrors = {};

    if (currentStep === 1) {
      if (!formData.email) {
        newErrors.email = "L'email est requis";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Email invalide';
      }
      if (!formData.password) {
        newErrors.password = 'Le mot de passe est requis';
      } else if (formData.password.length < 8) {
        newErrors.password = 'Minimum 8 caractères';
      }
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Confirmez votre mot de passe';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
      }
    }

    if (currentStep === 2) {
      if (!formData.firstName.trim()) newErrors.firstName = 'Le prénom est requis';
      if (!formData.lastName.trim()) newErrors.lastName = 'Le nom est requis';
      if (!formData.phone.trim()) newErrors.phone = 'Le téléphone est requis';
    }

    if (currentStep === 3) {
      if (!formData.province) newErrors.province = 'La province est requise';
      if (!formData.city) newErrors.city = 'La ville est requise';
      if (!formData.commune) newErrors.commune = 'La commune est requise';
    }

    if (currentStep === 4) {
      if (formData.role === 'hospital') {
        if (!formData.hospitalName.trim()) newErrors.hospitalName = "Le nom de l'hôpital est requis";
        //if (!formData.hospitalLicense.trim()) newErrors.hospitalLicense = 'Le numéro de licence est requis';
        if (!formData.hospitalCity.trim()) newErrors.hospitalCity = 'La ville est requise';
        if (!formData.hospitalCommune.trim()) newErrors.hospitalCommune = 'La commune est requise';
      }
      if (formData.role === 'authority') {
        if (!formData.matricule.trim()) newErrors.matricule = 'Le matricule est requis';
        if (!formData.grade.trim()) newErrors.grade = 'Le grade est requis';
        if (!formData.service.trim()) newErrors.service = 'Le service est requis';
      }
      if (!formData.acceptTerms) newErrors.acceptTerms = 'Vous devez accepter les conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
      setErrors({});
    }
  };

  const handleBack = () => {
    setStep(step - 1);
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(4)) return;

    setIsLoading(true);
    setRegisterError('');

    try {
      const userData = {
        email: formData.email,
        username: formData.email,
        password: formData.password,
        password_confirm: formData.confirmPassword,
        first_name: formData.firstName,
        last_name: formData.lastName,
        role: formData.role,
        phone: formData.phone,
        province: formData.province,
        city: formData.city,
        commune: formData.commune,
        address: formData.address,
      };

      if (formData.role === 'hospital') {
        userData.hospital_name = formData.hospitalName;
        //userData.hospital_license = formData.hospitalLicense;
        userData.hospital_province = formData.hospitalProvince;
        userData.hospital_city = formData.hospitalCity;
        userData.hospital_commune = formData.hospitalCommune;
        userData.hospital_address = formData.hospitalAddress;
      }

      if (formData.role === 'authority') {
        if (!matriculeVerified) {
            setRegisterError('Veuillez vérifier votre matricule avant de continuer.');
            setIsLoading(false);
            return;
        }
        userData.matricule = formData.matricule;
        userData.grade = formData.grade;
        userData.service = formData.service;
        userData.direction = formData.direction;
    }

      console.log("[Register] Data sent:", userData);

      let result;
      if (formData.role === 'authority') {
        result = await registerAuthority(userData);
      } else {
        result = await register(userData);
      }
      console.log("[Register] Result:", result);

      if (result.success) {
        const { user } = result;
        
        // ✅ CORRIGÉ : Si hôpital, rediriger vers page de paiement $1
        if (user.role === 'hospital') {
          localStorage.setItem('pending_payment', 'true');
          localStorage.setItem('hospital_status', 'pending');
          navigate('/paiement');
        }
        else if (user.role === 'authority') navigate('/authority-dashboard');
        else if (user.role === 'admin') navigate('/admin-dashboard');
        else navigate('/citizen-dashboard');
      } else {
        const errorMsg = typeof result.error === 'string'
          ? result.error
          : JSON.stringify(result.error);
        setRegisterError(errorMsg);
      }
    } catch (error) {
      console.error("[Register] Submit error:", error);
      setRegisterError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // ========== CHAMPS UTILISATEUR (Étape 3) ==========
    
    // Reset ville et commune si province change
    if (name === 'province') {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
        city: '',
        commune: ''
      }));
      if (errors.city) setErrors(prev => ({ ...prev, city: '' }));
      if (errors.commune) setErrors(prev => ({ ...prev, commune: '' }));
      return;
    }
    
    // Reset commune si ville change
    if (name === 'city') {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
        commune: ''
      }));
      if (errors.commune) setErrors(prev => ({ ...prev, commune: '' }));
      return;
    }
    
    // ========== CHAMPS HÔPITAL (Étape 4) ==========
    
    // Reset ville et commune de l'hôpital si province de l'hôpital change
    if (name === 'hospitalProvince') {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
        hospitalCity: '',
        hospitalCommune: ''
      }));
      if (errors.hospitalCity) setErrors(prev => ({ ...prev, hospitalCity: '' }));
      if (errors.hospitalCommune) setErrors(prev => ({ ...prev, hospitalCommune: '' }));
      return;
    }
    
    // Reset commune de l'hôpital si ville de l'hôpital change
    if (name === 'hospitalCity') {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
        hospitalCommune: ''
      }));
      if (errors.hospitalCommune) setErrors(prev => ({ ...prev, hospitalCommune: '' }));
      return;
    }
    
    // ========== CHAMP STANDARD ==========
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Effacer l'erreur du champ modifié
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // ✅ NOUVEAU : Vérifier le matricule
  const verifyMatricule = async () => {
      if (!formData.matricule.trim()) {
          setMatriculeError('Veuillez saisir votre matricule');
          return;
      }
      
      setVerifyingMatricule(true);
      setMatriculeError('');
      
      try {
          const response = await authAPI.verifyMatricule(formData.matricule.trim());
          const data = response.data;
          
          if (data.valid) {
              setMatriculeVerified(true);
              setMatriculeInfo({ matricule: data.matricule }); // ← plus de full_name, grade, etc.
              // Pas de pré-remplissage automatique — l'autorité saisit elle-même ses infos
          }
      } catch (err) {
          setMatriculeVerified(false);
          setMatriculeInfo(null);
          const errorMsg = err.response?.data?.detail || err.response?.data?.reason || 'Matricule invalide';
          setMatriculeError(errorMsg);
      } finally {
          setVerifyingMatricule(false);
      }
  };

  const getPasswordStrength = () => {
    const pwd = formData.password;
    if (!pwd) return { strength: 0, label: '', color: '' };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[^a-zA-Z0-9]/.test(pwd)) score++;
    const levels = [
      { label: 'Très faible', color: 'bg-red-500' },
      { label: 'Faible', color: 'bg-orange-500' },
      { label: 'Moyen', color: 'bg-yellow-500' },
      { label: 'Fort', color: 'bg-emerald-500' },
      { label: 'Très fort', color: 'bg-emerald-600' }
    ];
    return { strength: score, ...levels[score - 1] || levels[0] };
  };

  const passwordStrength = getPasswordStrength();

  const roleOptions = [
    { value: 'citizen', label: 'Citoyen', icon: User, desc: 'Demander des certificats' },
    { value: 'hospital', label: 'Hôpital', icon: Building2, desc: 'Gérer naissances/décès' },
    { value: 'authority', label: 'Autorité', icon: Landmark, desc: 'Valider et superviser' }
  ];

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-6">
      {[1, 2, 3, 4].map((s, index) => (
        <React.Fragment key={s}>
          <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold transition-all ${
            s < step ? 'bg-emerald-500 text-white' :
            s === step ? 'bg-indigo-600 text-white ring-4 ring-indigo-100' :
            'bg-gray-200 dark:bg-gray-700 text-gray-500'
          }`}>
            {s < step ? <CheckCircle2 className="w-4 h-4" /> : s}
          </div>
          {index < 3 && (
            <div className={`w-8 h-1 mx-1 rounded ${
              s < step ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-700'
            }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Adresse email</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="email" name="email" value={formData.email} onChange={handleChange}
            placeholder="vous@exemple.com"
            className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${errors.email ? 'border-red-300' : 'border-gray-200 dark:border-gray-700'}`} />
        </div>
        {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Mot de passe</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange}
            placeholder="••••••••"
            className={`w-full pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-gray-800 border rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${errors.password ? 'border-red-300' : 'border-gray-200 dark:border-gray-700'}`} />
          <button type="button" onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
        {formData.password && (
          <div className="mt-2">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-500">Force</span>
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{passwordStrength.label}</span>
            </div>
            <div className="flex gap-1">
              {[1,2,3,4,5].map(i => (
                <div key={i} className={`h-1 flex-1 rounded-full transition-all ${
                  i <= passwordStrength.strength ? passwordStrength.color : 'bg-gray-200 dark:bg-gray-700'
                }`} />
              ))}
            </div>
          </div>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Confirmer le mot de passe</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange}
            placeholder="••••••••"
            className={`w-full pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-gray-800 border rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${errors.confirmPassword ? 'border-red-300' : 'border-gray-200 dark:border-gray-700'}`} />
          <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Prénom <span className="text-red-500">*</span></label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" name="firstName" value={formData.firstName} onChange={handleChange}
              placeholder="Jean"
              className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${errors.firstName ? 'border-red-300' : 'border-gray-200 dark:border-gray-700'}`} />
          </div>
          {errors.firstName && <p className="mt-1 text-xs text-red-500">{errors.firstName}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Nom <span className="text-red-500">*</span></label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" name="lastName" value={formData.lastName} onChange={handleChange}
              placeholder="Dupont"
              className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${errors.lastName ? 'border-red-300' : 'border-gray-200 dark:border-gray-700'}`} />
          </div>
          {errors.lastName && <p className="mt-1 text-xs text-red-500">{errors.lastName}</p>}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Téléphone <span className="text-red-500">*</span></label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
            placeholder="+243 81 234 5678"
            className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${errors.phone ? 'border-red-300' : 'border-gray-200 dark:border-gray-700'}`} />
        </div>
        {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      {/* Province */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Province <span className="text-red-500">*</span></label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select name="province" value={formData.province} onChange={handleChange}
            className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none ${errors.province ? 'border-red-300' : 'border-gray-200 dark:border-gray-700'}`}>
            <option value="">Sélectionnez une province</option>
            {provinces.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        {errors.province && <p className="mt-1 text-xs text-red-500">{errors.province}</p>}
      </div>

      {/* Ville - dynamique selon province */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Ville <span className="text-red-500">*</span></label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select name="city" value={formData.city} onChange={handleChange} disabled={!formData.province}
            className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none disabled:opacity-50 disabled:cursor-not-allowed ${errors.city ? 'border-red-300' : 'border-gray-200 dark:border-gray-700'}`}>
            <option value="">
              {formData.province ? 'Sélectionnez une ville' : 'Choisissez d\'abord une province'}
            </option>
            {availableCities.map(city => <option key={city} value={city}>{city}</option>)}
          </select>
        </div>
        {errors.city && <p className="mt-1 text-xs text-red-500">{errors.city}</p>}
      </div>

      {/* Commune - dynamique selon ville */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Commune <span className="text-red-500">*</span></label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select name="commune" value={formData.commune} onChange={handleChange} disabled={!formData.city}
            className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none disabled:opacity-50 disabled:cursor-not-allowed ${errors.commune ? 'border-red-300' : 'border-gray-200 dark:border-gray-700'}`}>
            <option value="">
              {formData.city ? 'Sélectionnez une commune' : formData.province ? 'Choisissez d\'abord une ville' : 'Choisissez d\'abord une province'}
            </option>
            {availableCommunes.map(commune => <option key={commune} value={commune}>{commune}</option>)}
          </select>
        </div>
        {errors.commune && <p className="mt-1 text-xs text-red-500">{errors.commune}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Adresse <span className="text-gray-400 font-normal">(optionnel)</span></label>
        <textarea name="address" value={formData.address} onChange={handleChange}
          placeholder="123 Avenue de la Paix..."
          rows={2}
          className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none" />
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type de compte</label>
        <div className="grid grid-cols-3 gap-2">
          {roleOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button key={option.value} type="button"
                onClick={() => setFormData(prev => ({ ...prev, role: option.value }))}
                className={`p-3 rounded-lg border-2 text-left transition-all ${
                  formData.role === option.value
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }`}>
                <Icon className={`w-5 h-5 mb-1.5 ${formData.role === option.value ? 'text-indigo-600' : 'text-gray-400'}`} />
                <div className={`font-semibold text-xs ${formData.role === option.value ? 'text-indigo-600' : 'text-gray-700 dark:text-gray-300'}`}>{option.label}</div>
                <div className="text-[10px] text-gray-500 mt-0.5 leading-tight">{option.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {formData.role === 'hospital' && (
        <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
          <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-3">
            <h4 className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-0.5 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" />Informations de l'hôpital
            </h4>
            <p className="text-[10px] text-indigo-600 dark:text-indigo-400">
              Ces informations créeront automatiquement votre établissement. 
              Un frais d'ouverture de <strong>1$</strong> sera requis pour obtenir votre licence officielle.
            </p>
          </div>

          {/* Nom de l'hôpital */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nom de l'hôpital <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                name="hospitalName" 
                value={formData.hospitalName} 
                onChange={handleChange}
                placeholder="Hôpital Général de Référence"
                className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${errors.hospitalName ? 'border-red-300' : 'border-gray-200 dark:border-gray-700'}`} 
              />
            </div>
            {errors.hospitalName && <p className="mt-1 text-xs text-red-500">{errors.hospitalName}</p>}
          </div>

          {/* Province - SELECT dynamique (même données que l'étape 3) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Province <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select 
                name="hospitalProvince" 
                value={formData.hospitalProvince} 
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none ${errors.hospitalProvince ? 'border-red-300' : 'border-gray-200 dark:border-gray-700'}`}
              >
                <option value="">Sélectionnez une province</option>
                {provinces.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            {errors.hospitalProvince && <p className="mt-1 text-xs text-red-500">{errors.hospitalProvince}</p>}
          </div>

          {/* Ville - SELECT dynamique selon province */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Ville / District <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select 
                name="hospitalCity" 
                value={formData.hospitalCity} 
                onChange={handleChange} 
                disabled={!formData.hospitalProvince}
                className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none disabled:opacity-50 disabled:cursor-not-allowed ${errors.hospitalCity ? 'border-red-300' : 'border-gray-200 dark:border-gray-700'}`}
              >
                <option value="">
                  {formData.hospitalProvince ? 'Sélectionnez une ville' : 'Choisissez d\'abord une province'}
                </option>
                {availableHospitalCities.map(city => <option key={city} value={city}>{city}</option>)}
              </select>
            </div>
            {errors.hospitalCity && <p className="mt-1 text-xs text-red-500">{errors.hospitalCity}</p>}
          </div>

          {/* Commune - SELECT dynamique selon ville */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Commune <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select 
                name="hospitalCommune" 
                value={formData.hospitalCommune} 
                onChange={handleChange} 
                disabled={!formData.hospitalCity}
                className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none disabled:opacity-50 disabled:cursor-not-allowed ${errors.hospitalCommune ? 'border-red-300' : 'border-gray-200 dark:border-gray-700'}`}
              >
                <option value="">
                  {formData.hospitalCity ? 'Sélectionnez une commune' : formData.hospitalProvince ? 'Choisissez d\'abord une ville' : 'Choisissez d\'abord une province'}
                </option>
                {availableHospitalCommunes.map(commune => <option key={commune} value={commune}>{commune}</option>)}
              </select>
            </div>
            {errors.hospitalCommune && <p className="mt-1 text-xs text-red-500">{errors.hospitalCommune}</p>}
          </div>

          {/* Adresse optionnelle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Adresse <span className="text-gray-400 font-normal">(optionnel)</span>
            </label>
            <textarea 
              name="hospitalAddress" 
              value={formData.hospitalAddress} 
              onChange={handleChange}
              placeholder="Avenue de l'Hôpital, N° 123..."
              rows={2}
              className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none" 
            />
          </div>
        </div>
      )}

      {formData.role === 'authority' && (
    <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3">
            <h4 className="text-xs font-semibold text-amber-700 dark:text-amber-300 mb-0.5 flex items-center gap-1.5">
                <Landmark className="w-3.5 h-3.5" />Informations de l'autorité
            </h4>
            <p className="text-[10px] text-amber-600 dark:text-amber-400">
                Votre matricule doit être enregistré par l'administrateur. 
                Tapez votre matricule, cliquez sur "Vérifier", puis complétez vos informations.
            </p>
        </div>

        {/* ✅ MATRICULE AVEC VÉRIFICATION */}
          <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Matricule <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                  <div className="relative flex-1">
                      <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input 
                          type="text" 
                          name="matricule" 
                          value={formData.matricule} 
                          onChange={handleChange}
                          placeholder="MAT-2024-XXXXX"
                          disabled={matriculeVerified}
                          className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all disabled:opacity-50 ${
                              errors.matricule || matriculeError ? 'border-red-300' : 
                              matriculeVerified ? 'border-emerald-300 bg-emerald-50 dark:bg-emerald-900/10' : 
                              'border-gray-200 dark:border-gray-700'
                          }`} 
                      />
                  </div>
                  <button
                      type="button"
                      onClick={verifyMatricule}
                      disabled={verifyingMatricule || matriculeVerified || !formData.matricule.trim()}
                      className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                          matriculeVerified 
                              ? 'bg-emerald-100 text-emerald-700 cursor-default' 
                              : 'bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50'
                      }`}
                  >
                      {verifyingMatricule ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                      ) : matriculeVerified ? (
                          <CheckCircle2 className="w-4 h-4" />
                      ) : (
                          'Vérifier'
                      )}
                  </button>
              </div>
              
              {/* Messages */}
              {matriculeError && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />{matriculeError}
                  </p>
              )}
              {matriculeVerified && matriculeInfo && (
                <div className="mt-2 p-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                    <p className="text-xs text-emerald-700 dark:text-emerald-300">
                        <strong>Matricule vérifié :</strong> {matriculeInfo.matricule}
                    </p>
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400">
                        Vous pouvez maintenant compléter votre inscription.
                    </p>
                </div>
            )}
          </div>

          {/* Grade — pré-rempli et readonly si vérifié */}
          <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Grade <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                  <Gavel className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                      type="text" 
                      name="grade" 
                      value={formData.grade} 
                      onChange={handleChange}
                      placeholder="Officier d'État Civil"
                      //readOnly={matriculeVerified}
                      className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                        errors.grade ? 'border-red-300' : 'border-gray-200 dark:border-gray-700'
                    }`} 
                  />
              </div>
              {errors.grade && <p className="mt-1 text-xs text-red-500">{errors.grade}</p>}
          </div>

          {/* Service — pré-rempli et readonly si vérifié */}
          <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Service <span className="text-red-500">*</span>
              </label>
              <input 
                  type="text" 
                  name="service" 
                  value={formData.service} 
                  onChange={handleChange}
                  placeholder="Service de l'État Civil"
                  //readOnly={matriculeVerified}
                  className={`w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                      errors.service ? 'border-red-300' : 'border-gray-200 dark:border-gray-700'
                  }`}
              />
              {errors.service && <p className="mt-1 text-xs text-red-500">{errors.service}</p>}
          </div>

          {/* Direction — optionnel */}
          <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Direction <span className="text-gray-400 font-normal">(optionnel)</span>
              </label>
              <input 
                  type="text" 
                  name="direction" 
                  value={formData.direction} 
                  onChange={handleChange}
                  placeholder="Direction Provinciale"
                  className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" 
              />
          </div>
      </div>
  )}

      <div className="flex items-start gap-2.5 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <input type="checkbox" name="acceptTerms" checked={formData.acceptTerms} onChange={handleChange}
          className="mt-0.5 w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
        <div>
          <label className="text-xs text-gray-700 dark:text-gray-300 cursor-pointer">
            J'accepte les{' '}
            <button type="button" onClick={() => navigate('/conditions')} className="text-indigo-600 hover:underline">Conditions</button>
            {' '}et la{' '}
            <button type="button" onClick={() => navigate('/confidentialite')} className="text-indigo-600 hover:underline">Politique de confidentialité</button>
          </label>
          {errors.acceptTerms && <p className="mt-1 text-xs text-red-500">{errors.acceptTerms}</p>}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex">
      {/* ==================== GAUCHE - Bienvenue ==================== */}
      <div className={`hidden lg:flex lg:w-1/2 xl:w-5/12 relative overflow-hidden transition-all duration-1000 ease-out ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}>
        {/* Background gradient anime */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-violet-900 to-indigo-950" />
        
        {/* Cercles decoratifs animes */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-violet-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />

        {/* Particules flottantes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div key={i}
              className="absolute w-2 h-2 bg-white/20 rounded-full animate-bounce"
              style={{
                left: `${15 + i * 15}%`,
                top: `${20 + (i % 3) * 25}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${3 + i * 0.5}s`
              }}
            />
          ))}
        </div>

        {/* Contenu */}
        <div className="relative z-10 flex flex-col justify-between p-12 h-full">
          {/* Logo */}
          <div className={`flex items-center gap-3 transition-all duration-700 delay-300 ${pageLoaded ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'}`}>
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center hover:scale-110 transition-transform">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Care-Link</h2>
              <p className="text-xs text-indigo-200">RDC</p>
            </div>
          </div>

          {/* Message de bienvenue */}
          <div className={`space-y-6 transition-all duration-700 delay-500 ${pageLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <div>
              <h1 className="text-4xl font-bold text-white leading-tight mb-4">
                Bienvenue sur<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-violet-300">
                  Care-Link RDC
                </span>
              </h1>
              <p className="text-indigo-200 text-base leading-relaxed max-w-sm">
                La plateforme officielle d'enregistrement de l'état civil en 
                République Démocratique du Congo. Sécurisez vos documents 
                avec authenticité garantie.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-3">
              {features.map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <div key={i} 
                    className={`flex items-center gap-3 transition-all duration-500 ${pageLoaded ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'}`}
                    style={{ transitionDelay: `${700 + i * 150}ms` }}
                  >
                    <div className="w-8 h-8 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors">
                      <Icon className="w-4 h-4 text-indigo-300" />
                    </div>
                    <span className="text-sm text-indigo-100">{feature.text}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stats en bas */}
          <div className={`grid grid-cols-2 gap-4 transition-all duration-700 delay-1000 ${pageLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10 hover:bg-white/15 transition-all hover:scale-105 cursor-default group">
                  <Icon className="w-5 h-5 text-indigo-300 mb-1.5 group-hover:text-white transition-colors" />
                  <div className="text-lg font-bold text-white">{stat.value}</div>
                  <div className="text-[10px] text-indigo-200">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ==================== DROITE - Formulaire ==================== */}
      <div className={`flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-gray-950 transition-all duration-1000 ease-out ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
        <div className="w-full max-w-md">
          {/* Mobile: logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-gray-900 dark:text-white">Care-Link RDC</span>
          </div>

          <div className={`bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden transition-all duration-700 delay-200 ${pageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
            <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-6 text-center">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-3 backdrop-blur-sm hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white mb-1">Créer un compte</h1>
              <p className="text-indigo-100 text-xs">Rejoignez Care-Link RDC en quelques étapes</p>
            </div>

            <div className="px-6 pt-6">{renderStepIndicator()}</div>

            <div className="px-6 pb-6 pt-2">
              {registerError && (
                <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <p className="text-xs text-red-600 dark:text-red-400">{registerError}</p>
                </div>
              )}

              <form onSubmit={step === 4 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }}>
                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
                {step === 4 && renderStep4()}

                <div className="flex gap-2.5 mt-6">
                  {step > 1 && (
                    <button type="button" onClick={handleBack}
                      className="flex-1 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
                      Retour
                    </button>
                  )}
                  {step < 4 ? (
                    <button type="submit"
                      className="flex-1 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-lg font-medium text-sm hover:shadow-lg hover:shadow-indigo-500/30 transition-all hover:scale-[1.02] flex items-center justify-center gap-1.5">
                      <span>Suivant</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button type="submit" disabled={isLoading}
                      className="flex-1 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-lg font-medium text-sm hover:shadow-lg hover:shadow-indigo-500/30 transition-all hover:scale-[1.02] disabled:opacity-70 flex items-center justify-center gap-1.5">
                      {isLoading ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /><span>Création...</span></>
                      ) : (
                        <><span>Créer mon compte</span><ArrowRight className="w-4 h-4" /></>
                      )}
                    </button>
                  )}
                </div>
              </form>

              <div className="text-center mt-5 pt-5 border-t border-gray-100 dark:border-gray-800">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Déjà un compte ?{' '}
                  <button onClick={() => navigate('/connexion')} className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-semibold text-sm">Se connecter</button>
                </p>
              </div>
            </div>
          </div>

          <p className="text-center text-[10px] text-gray-400 mt-4">&copy; {new Date().getFullYear()} Care-Link RDC. Tous droits réservés.</p>
        </div>
      </div>
    </div>
  );
};

export default Register;