# 🏥 Care-Link RDC

**Plateforme de gestion des certificats de naissance et de décès en République Démocratique du Congo**

---

## 📋 Description

Care-Link RDC est une application web complète permettant :
- **Aux hôpitaux** d'enregistrer les naissances et décès, générer des certificats officiels avec QR code, et envoyer des rapports mensuels aux autorités
- **Aux citoyens** de consulter et télécharger leurs certificats officiels
- **Aux autorités** de valider les certificats, consulter les statistiques nationales et auditer le système

---

## 🏗️ Architecture

### 3 Rôles Utilisateurs

| Rôle | Description | Accès |
|------|-------------|-------|
| 👤 **CITIZEN** | Citoyen RDC | Consulter certificats, signaler problèmes |
| 🏥 **HOSPITAL** | Personnel hospitalier | Enregistrer naissances/décès, gérer certificats |
| 👮 **AUTHORITY** | Autorités étatiques | Valider certificats, statistiques, audit |

---

## 🎨 Design System

### Technologies Frontend
| Technologie | Version | Usage |
|-------------|---------|-------|
| React | 18.2+ | Framework UI |
| React Router | 6.20+ | Navigation |
| Tailwind CSS | 3.3+ | Styling utilitaire |
| Axios | 1.6+ | HTTP Client |
| Recharts | 2.15+ | Graphiques |
| date-fns | 2.30+ | Dates |
| Lucide React | 0.294+ | Icônes |
| jsPDF | 4.2+ | Génération PDF |
| html2canvas | 1.4+ | Capture d'écran |
| qrcode.react | 4.2+ | QR Codes |
| jwt-decode | 4.0+ | Décodage JWT |

### Thèmes
- ☀️ **Clair** (défaut)
- 🌙 **Sombre** (toggle dans Paramètres)

### Langues Supportées (i18n)
| Langue | Code | Drapeau |
|--------|------|---------|
| 🇫🇷 **Français** | `fr` | Défaut |
| 🇨🇩 **Lingala** | `ln` | |
| 🇨🇩 **Kikongo** | `kg` | |
| 🇨🇩 **Tshiluba** | `lu` | |
| 🇨🇩 **Swahili** | `sw` | |

---

## 📁 Structure du Projet

```
Care-Link_RDC/
├── backend/                          # Django REST API
│   ├── carelink_project/             # Configuration projet
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── users/                        # Authentification JWT + rôles
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   └── urls.py
│   ├── hospitals/                    # Gestion hôpitaux
│   ├── births/                       # Certificats de naissance
│   ├── deaths/                       # Certificats de décès
│   ├── payments/                     # Paiement Stripe/AFRY Money
│   ├── reports/                      # Rapports mensuels
│   ├── notifications/                # Système de notifications
│   ├── manage.py
│   ├── requirements.txt
│   └── db.sqlite3                     # Base SQLite (développement)
│
├── frontend/                         # React Application
│   ├── public/
│   │   ├── index.html
│   │   └── favicon.ico
│   ├── src/
│   │   ├── pages/
│   │   │   ├── public/               # 🌐 Pages publiques (avec Header + Footer)
│   │   │   │   ├── LandingPage/
│   │   │   │   │   ├── LandingPage.jsx
│   │   │   │   │   ├── Header.jsx
│   │   │   │   │   ├── Footer.jsx
│   │   │   │   │   ├── HeroSection.jsx
│   │   │   │   │   ├── FeaturesSection.jsx
│   │   │   │   │   └── ContactSection.jsx
│   │   │   │   ├── Login/
│   │   │   │   ├── Legal/
│   │   │   │   │   ├── Accessibilite.jsx
│   │   │   │   │   ├── Conditions.jsx
│   │   │   │   │   ├── Confidentialite.jsx
│   │   │   │   │   ├── Cookies.jsx
│   │   │   │   │   ├── MentionsLegales.jsx
│   │   │   │   │   ├── NotFound.jsx
│   │   │   │   │   ├── Forbidden.jsx
│   │   │   │   │   ├── ServerError.jsx
│   │   │   │   │   ├── Maintenance.jsx
│   │   │   │   │   └── APIDocs.jsx
│   │   │   │   ├── Register/
│   │   │   │   └── Guide/
│   │   │   │
│   │   │   ├── citizen/              # 👤 Interface citoyen (Layout sans Footer)
│   │   │   │   ├── Dashboard/
│   │   │   │   ├── Certificats/
│   │   │   │   ├── Signalement/
│   │   │   │   ├── Profil/
│   │   │   │   └── Parametres/       # Thème + Langue + Notifs
│   │   │   │
│   │   │   ├── hospital/             # 🏥 Interface hôpital (Layout sans Footer)
│   │   │   │   ├── Dashboard/
│   │   │   │   ├── Naissances/
│   │   │   │   ├── Deces/
│   │   │   │   ├── Certificats/
│   │   │   │   ├── Paiement/
│   │   │   │   ├── Statistiques/
│   │   │   │   ├── Profil/
│   │   │   │   └── Parametres/
│   │   │   │
│   │   │   └── authority/            # 👮 Interface autorité (Layout sans Footer)
│   │   │       ├── Dashboard/
│   │   │       ├── Hopitaux/
│   │   │       ├── Validation/
│   │   │       ├── Rapports/
│   │   │       ├── Signalement/
│   │   │       ├── Audit/
│   │   │       ├── Statistiques/
│   │   │       ├── Profil/
│   │   │       └── Parametres/
│   │   │
│   │   ├── components/               # Composants réutilisables
│   │   │   ├── Layout/               # Layout global (Sidebar + TopBar)
│   │   │   │   ├── Layout.jsx
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   ├── TopBar.jsx
│   │   │   │   └── NotificationBell.jsx
│   │   │   ├── ThemeToggle/
│   │   │   ├── LanguageSelector/
│   │   │   ├── ChatWidget/           # 🤖 Assistant AI (Phase 3)
│   │   │   ├── Modal/
│   │   │   ├── Button/
│   │   │   ├── Card/
│   │   │   ├── Table/
│   │   │   ├── Form/
│   │   │   └── Loading/
│   │   │
│   │   ├── services/                 # API calls
│   │   │   ├── api.js                # Axios + interceptors JWT
│   │   │   ├── authService.js
│   │   │   ├── birthService.js
│   │   │   ├── deathService.js
│   │   │   ├── paymentService.js
│   │   │   ├── reportService.js
│   │   │   └── notificationService.js
│   │   │
│   │   ├── context/                  # Contexts React
│   │   │   ├── AuthContext.jsx
│   │   │   ├── ThemeContext.jsx      # 🌗 Sombre/Clair
│   │   │   ├── LanguageContext.jsx   # 🌍 i18n 5 langues
│   │   │   └── NotificationContext.jsx
│   │   │
│   │   ├── hooks/                    # Hooks personnalisés
│   │   │   ├── useAuth.js
│   │   │   ├── useTheme.js
│   │   │   ├── useLanguage.js
│   │   │   ├── useNotifications.js
│   │   │   └── useLocalStorage.js
│   │   │
│   │   ├── locales/                  # 🌍 Fichiers de traduction
│   │   │   ├── fr.json               # Français (défaut)
│   │   │   ├── ln.json               # Lingala
│   │   │   ├── kg.json               # Kikongo
│   │   │   ├── lu.json               # Tshiluba
│   │   │   └── sw.json               # Swahili
│   │   │
│   │   ├── utils/
│   │   │   ├── constants.js
│   │   │   ├── helpers.js
│   │   │   ├── formatters.js
│   │   │   └── validators.js
│   │   │
│   │   ├── assets/
│   │   │   ├── images/
│   │   │   └── styles/
│   │   │       └── global.css        # Tailwind directives + reset
│   │   │
│   │   ├── App.jsx
│   │   ├── index.js
│   │   └── index.css
│   │
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── package.json
│   └── README.md
│
├── docs/                             # Documentation
│   ├── API.md
│   ├── DEPLOYMENT.md
│   ├── USER_GUIDE.md
│   └── AI_ARCHITECTURE.md            # 🤖 Architecture Assistant (Phase 3)
│
└── README.md                         # Ce fichier
```

---

## 🚀 Installation & Démarrage

### Prérequis
- Python 3.12+
- Node.js 18+
- npm

### 1. Backend (Django)

```bash
cd backend

# Créer l'environnement virtuel
python -m venv venv

# Activer (Windows)
venv\Scripts\activate

# Activer (Linux/Mac)
source venv/bin/activate

# Installer les dépendances
pip install -r requirements.txt

# Appliquer les migrations
python manage.py migrate

# Créer le super utilisateur
python manage.py createsuperuser

# Démarrer le serveur
python manage.py runserver
```

Le backend est accessible sur : `http://localhost:8000`

### 2. Frontend (React + Tailwind)

```bash
cd frontend

# Installer les dépendances (si node_modules manquant)
npm install

# Démarrer le serveur de développement
npm start
```

Le frontend est accessible sur : `http://localhost:3000`

---

## 🔧 Configuration

### Variables d'environnement Backend (.env)

```env
DEBUG=True
SECRET_KEY=votre-cle-secrete-tres-longue
DATABASE_URL=sqlite:///db.sqlite3
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000

# JWT
JWT_ACCESS_TOKEN_LIFETIME=60
JWT_REFRESH_TOKEN_LIFETIME=1440

# Stripe (Paiement)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# Groq Cloud (Assistant AI - Phase 3)
GROQ_API_KEY=gsk_...
```

### Variables d'environnement Frontend (.env)

```env
REACT_APP_API_URL=http://localhost:8000/api/v1
REACT_APP_STRIPE_KEY=pk_test_...
REACT_APP_GROQ_KEY=gsk_...          # Phase 3
```

---

## 📊 Flux Métier

### 1. Enregistrement d'une Naissance

```
Hôpital connecté
    ↓
Formulaire Naissance (4 étapes)
    ↓
Validation données
    ↓
Paiement $50 (Stripe/AFRY Money)
    ↓
Génération Certificat + QR Code
    ↓
Soumission pour validation autorité
    ↓
Autorité approuve → Certificat officiel
    ↓
Citoyen consulte et télécharge PDF
```

### 2. Enregistrement d'un Décès

```
Hôpital connecté
    ↓
Formulaire Décès (4 étapes)
    ↓
Validation données
    ↓
Paiement $50 (Stripe/AFRY Money)
    ↓
Génération Certificat + QR Code
    ↓
Soumission pour validation autorité
    ↓
Autorité approuve → Certificat officiel
    ↓
Citoyen consulte et télécharge PDF
```

### 3. Rapport Mensuel

```
Hôpital connecté
    ↓
Dashboard Statistiques
    ↓
Vérification données mensuelles
    ↓
Envoi rapport aux autorités (1 fois/mois)
    ↓
Autorité reçoit et consulte
```

---

## 🛠️ Technologies Utilisées

### Backend
| Technologie | Version | Usage |
|-------------|---------|-------|
| Python | 3.12+ | Langage |
| Django | 4.2 LTS | Framework Web |
| Django REST Framework | 3.14+ | API REST |
| Simple JWT | 5.3+ | Authentification JWT |
| SQLite | 3.x | Base de données (dev) |
| Pillow | 10.0+ | Images & QR Codes |
| Stripe | - | Paiements |

### Frontend
| Technologie | Version | Usage |
|-------------|---------|-------|
| React | 18.2+ | Framework UI |
| React Router | 6.20+ | Navigation |
| Tailwind CSS | 3.3+ | Styling utilitaire |
| Axios | 1.6+ | HTTP Client |
| Recharts | 2.15+ | Graphiques |
| date-fns | 2.30+ | Dates |
| Lucide React | 0.294+ | Icônes |
| jsPDF | 4.2+ | Génération PDF |
| html2canvas | 1.4+ | Capture d'écran |
| qrcode.react | 4.2+ | QR Codes |
| jwt-decode | 4.0+ | Décodage JWT |

---

## 📱 Interfaces Utilisateur

### 🌐 Pages Publiques (Avec Header + Footer)
| Page | URL | Description |
|------|-----|-------------|
| Accueil | `/` | Landing page avec Hero, Features, Contact |
| Connexion | `/connexion` | Login |
| Inscription | `/inscription` | Register |
| Guide | `/guide` | Guide d'utilisation |

### 👤 Interface Citoyen (Layout sans Footer)
| Page | URL | Description |
|------|-----|-------------|
| Dashboard | `/citizen-dashboard` | Vue d'ensemble |
| Certificats | `/citizen-dashboard/certificats` | Mes certificats |
| Signalement | `/citizen-dashboard/signalement` | Signaler un problème |
| Profil | `/citizen-dashboard/profil` | Mon profil |
| Paramètres | `/citizen-dashboard/parametres` | 🌗 Thème, 🌍 Langue, Notifs |

### 🏥 Interface Hôpital (Layout sans Footer)
| Page | URL | Description |
|------|-----|-------------|
| Dashboard | `/hospital-dashboard` | Stats et notifications |
| Naissances | `/hospital-dashboard/naissances` | Liste naissances |
| Nouvelle Naissance | `/hospital-dashboard/naissances/nouveau` | Formulaire 4 étapes |
| Décès | `/hospital-dashboard/deces` | Liste décès |
| Nouveau Décès | `/hospital-dashboard/deces/nouveau` | Formulaire 4 étapes |
| Certificats | `/hospital-dashboard/certificats` | Tous les certificats |
| Paiement | `/hospital-dashboard/paiement/:id` | Payer un certificat |
| Statistiques | `/hospital-dashboard/statistiques` | Rapports mensuels |
| Profil | `/hospital-dashboard/profil` | Info hôpital |
| Paramètres | `/hospital-dashboard/parametres` | 🌗 Thème, 🌍 Langue, Notifs |

### 👮 Interface Autorité (Layout sans Footer)
| Page | URL | Description |
|------|-----|-------------|
| Dashboard | `/authority-dashboard` | Vue globale |
| Hôpitaux | `/authority-dashboard/hopitaux` | Liste hôpitaux |
| Validation | `/authority-dashboard/validation` | Valider certificats |
| Rapports | `/authority-dashboard/rapports` | Rapports reçus |
| Audit | `/authority-dashboard/audit` | Logs et traçabilité |
| Statistiques | `/authority-dashboard/statistiques` | Stats nationales |
| Profil | `/authority-dashboard/profil` | Info autorité |
| Paramètres | `/authority-dashboard/parametres` | 🌗 Thème, 🌍 Langue, Notifs |

---

## 🔐 Authentification & Autorisation

### JWT Token Flow
```
Client → POST /api/v1/auth/login/ → {email, password}
    ↓
Serveur → {access_token, refresh_token}
    ↓
Client stocke tokens → localStorage
    ↓
Chaque requête → Header: Authorization: Bearer <access_token>
    ↓
Token expiré → POST /api/v1/auth/refresh/ → nouveau access_token
```

### Rôles & Permissions
| Rôle | Permissions |
|------|-------------|
| CITIZEN | Lire ses propres certificats, modifier son profil |
| HOSPITAL | CRUD naissances/décès, lire stats hôpital, envoyer rapports |
| AUTHORITY | Tout lire (anonymisé), valider/rejeter certificats, stats globales |
| ADMIN | Tout (Django admin) |

---

## 🌗 Thème Sombre/Clair

### Toggle dans Paramètres
```jsx
// ThemeToggle.jsx
<button 
  onClick={toggleTheme}
  className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 transition-colors"
>
  {isDark ? <SunIcon /> : <MoonIcon />}
</button>
```

### Classes Tailwind
```html
<!-- Clair -->
<div class="bg-white text-gray-900">

<!-- Sombre -->
<div class="dark:bg-gray-900 dark:text-gray-100">
```

---

## 🌍 Système de Langues (i18n)

### Sélecteur dans Paramètres
```jsx
// LanguageSelector.jsx
<select 
  value={currentLanguage}
  onChange={(e) => changeLanguage(e.target.value)}
  className="p-2 rounded-lg border border-gray-300 dark:border-gray-600"
>
  <option value="fr">🇫🇷 Français</option>
  <option value="ln">🇨🇩 Lingala</option>
  <option value="kg">🇨🇩 Kikongo</option>
  <option value="lu">🇨🇩 Tshiluba</option>
  <option value="sw">🇨🇩 Swahili</option>
</select>
```

### Utilisation
```jsx
import { useLanguage } from '../context/LanguageContext';

const { t } = useLanguage();

<h1>{t('dashboard.welcome')}</h1>
// Affiche : "Bienvenue" (fr) ou "Boyei malamu" (ln)
```

---

## 🤖 Assistant AI (Phase 3 - Future)

### Architecture
```
┌─────────────────────────────────────────┐
│           Utilisateur Connecté            │
│         (JWT Token avec rôle)             │
└─────────────┬─────────────────────────────┘
              │
    ┌─────────▼──────────┐
    │  Router (Protected)   │
    │  Vérifie le rôle      │
    └─────────┬───────────┘
              │
    ┌─────────▼──────────┐
    │  Assistant Context  │
    │  Injecte le rôle    │
    └─────────┬───────────┘
              │
    ┌─────────▼──────────┐
    │  AI Controller      │
    │  Filtre les réponses│
    │  selon le rôle      │
    └─────────┬───────────┘
              │
    ┌─────────┴──────────┐
    │                    │
┌───▼────┐         ┌────▼─────┐
│  AI    │         │  Groq    │
│Locale  │         │  Cloud   │
│(RAG)   │         │  API     │
└────────┘         └──────────┘
```

### 3 Assistants Spécialisés
| Assistant | Rôle | Accès |
|-----------|------|-------|
| **CitizenAI** | Citoyen | Ses certificats, FAQ citoyen |
| **HospitalAI** | Hôpital | Ses naissances/décès, procédures |
| **AuthorityAI** | Autorité | Stats anonymisées, validation |

---

## 📈 Plan de Développement (7 jours)

| Jour | Backend | Frontend |
|------|---------|----------|
| **1** | Setup Django + SQLite + Apps | Setup React + Tailwind + Structure |
| **2** | Modèles + Serializers Users | Pages Public (Landing, Login, Register) |
| **3** | Modèles Births + Deaths + Payments | Auth Context + Protected Routes + Layout |
| **4** | Views + URLs API | Hospital Dashboard + Formulaires |
| **5** | Reports + Notifications | Citizen Dashboard + Certificats + Paramètres |
| **6** | Authority Dashboard API | Authority Pages + Validation + Thème/Langue |
| **7** | Tests + Corrections | Tests + Intégration complète + Polish |

---

## 🧪 Tests

### Backend
```bash
cd backend
python manage.py test
```

### Frontend
```bash
cd frontend
npm test
```

### API (Postman/Insomnia)
Importer la collection : `docs/CareLink_API_Collection.json`

---

## 🚀 Déploiement

### Production (Checklist)
- [ ] Passer à PostgreSQL
- [ ] Configurer `DEBUG=False`
- [ ] Générer une nouvelle `SECRET_KEY`
- [ ] Configurer les variables d'environnement
- [ ] Configurer HTTPS (SSL/TLS)
- [ ] Configurer le serveur web (Nginx/Gunicorn)
- [ ] Configurer les emails (SendGrid/AWS SES)
- [ ] Activer Stripe en mode production
- [ ] Tester tous les flux end-to-end
- [ ] Déployer l'Assistant AI (Phase 3)

---

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/ma-fonctionnalite`)
3. Commit (`git commit -am 'Ajout de ma fonctionnalite'`)
4. Push (`git push origin feature/ma-fonctionnalite`)
5. Créer une Pull Request

---

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

---

## 👥 Équipe

- **Développeur Principal** : [Votre nom]
- **Designer UI/UX** : [Nom]
- **Testeur QA** : [Nom]

---

## 📞 Support

Pour toute question ou problème :
- Email : support@carelink-rdc.com
- Téléphone : +243 81 234 5678

---

**Made with ❤️ in RDC**
