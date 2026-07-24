
═══════════════════════════════════════════════════════════════════════════════
            📋 PLAN MIS À JOUR — CARE-LINK RDC (Version Finale)
═══════════════════════════════════════════════════════════════════════════════

🎯 OBJECTIF FINAL :
  • Inscription hôpital : Paiement $1 → Licence format PROVINCE-COMMUNE-ANNEE-SEQUENCE
  • Notifications temps réel (WebSocket)
  • Publications UNIQUEMENT par les autorités (rapports mensuels agrégés)
  • Suppression complète ancien système abonnement

═══════════════════════════════════════════════════════════════════════════════
PARTIE A : CORRECTION BUG RAPPORT 403 (IMMÉDIAT)
═══════════════════════════════════════════════════════════════════════════════

📁 FICHIERS À ENVOYER :
  • backend/reports/views.py
  • backend/reports/models.py
  • backend/reports/permissions.py (si existe)

🔧 CORRECTION :
  → Enlever tout check "abonnement actif" ou "subscription_paid"
  → Garder uniquement : IsAuthenticated + IsHospital

✅ RÉSULTAT : Bouton "Envoyer aux autorités" fonctionne immédiatement


═══════════════════════════════════════════════════════════════════════════════
PARTIE B : INSCRIPTION HÔPITAL AVEC LICENCE GÉOGRAPHIQUE
═══════════════════════════════════════════════════════════════════════════════

📁 FICHIERS BACKEND À MODIFIER/CRÉER :

1. users/models.py  OU  hospitals/models.py
   └── Modèle Hospital (MODIFIER) :
       ├── province          (CharField — ex: "Kinshasa")
       ├── ville_district    (CharField — ex: "Lukunga")
       ├── commune           (CharField — ex: "Gombe")
       ├── licence_number    (CharField, unique, blank=True)
       ├── status            (pending_payment / active / suspended)
       ├── registration_paid (BooleanField, default=False)
       └── created_at

2. users/serializers.py  OU  hospitals/serializers.py
   └── HospitalRegisterSerializer (MODIFIER) :
       ├── Ajouter champs : province, ville_district, commune
       └── Validation : les 3 champs obligatoires

3. users/views.py
   └── register() (MODIFIER) :
       ├── Créer user + hospital avec status="pending_payment"
       ├── NE PAS générer licence encore
       └── Retourner : { user, hospital_id, status: "payment_required" }

4. payments/models.py (NOUVEAU/MODIFIER)
   └── Modèle HospitalRegistrationPayment
       ├── hospital          (FK)
       ├── amount            (Decimal, default=1.00)
       ├── payment_method    (afry_money / visa)
       ├── transaction_id
       ├── status            (pending / completed / failed)
       ├── paid_at
       └── created_at

5. payments/views.py (NOUVEAU/MODIFIER)
   └── Endpoint : POST /api/v1/payments/hospital-registration/
       ├── Reçoit : hospital_id, payment_method, transaction_details
       ├── Vérifie si hospital existe et status="pending_payment"
       ├── Simule/traite paiement
       ├── SI succès :
       │   ├── Générer licence : PROV-COMM-ANNEE-SEQUENCE
       │   │   Ex: KIN-GB-2026-0001, KWL-KM-2026-0001
       │   ├── Mettre à jour hospital :
       │   │   ├── status = "active"
       │   │   ├── registration_paid = True
       │   │   └── licence_number = généré
       │   ├── Créer notification pour l'hôpital
       │   └── Envoyer email avec licence
       └── Retourner : { success, licence_number, hospital }

6. utils/licence_generator.py (NOUVEAU)
   └── Fonction generate_licence_number(province, commune, year)
       ├── PROV = abbreviation province (3 lettres)
       │   KIN = Kinshasa
       │   KWL = Kwilu
       │   ... (mapping complet)
       ├── COMM = abbreviation commune (2 lettres)
       │   GB = Gombe
       │   KM = Kutu_muke
       │   ... (mapping complet)
       ├── YEAR = année actuelle (2026)
       ├── SEQ = séquence auto-incrémentée par année
       │   (compteur global ou par province/commune)
       └── FORMAT FINAL : PROV-COMM-YEAR-SEQUENCE
           Ex: KIN-GB-2026-0001
           Ex: KWL-KM-2026-0001

7. emails/templates/licence_officielle.html (NOUVEAU)
   └── Template email officiel :
       ├── En-tête : Logo Care-Link + Armoirie RDC + Drapeau
       ├── Titre : "Licence Officielle Care-Link RDC"
       ├── Nom de l'hôpital
       ├── Numéro de licence : KIN-GB-2026-0001
       ├── Province / District / Commune
       ├── Date d'enregistrement
       ├── QR Code (vérifiable sur carelink-rdc.com/verify)
       ├── Cachet numérique officiel
       └── Pied : "Ministère de la Santé Publique - RDC"

8. carelink_project/settings.py
   └── Ajouter dans INSTALLED_APPS : 'payments'


📁 FICHIERS FRONTEND À MODIFIER/CRÉER :

1. Register.jsx (MODIFIER — section Hôpital)
   └── Ajouter 3 champs obligatoires :
       ├── Province (select dropdown)
       ├── Ville / District (select dropdown — dépend de province)
       └── Commune (select dropdown — dépend de ville)

   └── Après submit réussi :
       └── Redirection vers : /paiement-inscription?hospital_id=xxx
       └── AU LIEU DE /connexion

2. HospitalPaymentRegistration.jsx (NOUVEAU)
   ├── Titre : "Finaliser votre inscription"
   ├── Récapitulatif hôpital (nom, province, commune)
   ├── Montant : $1.00 USD
   ├── Méthodes de paiement :
   │   ├── AFRY Money (input numéro, validation)
   │   └── Visa (numéro carte, date expiry, CVV)
   ├── Bouton : "Payer $1 et obtenir ma licence"
   ├── Loading state pendant paiement
   └── Après succès :
       ├── Animation confetti
       ├── Affichage licence : "Votre licence : KIN-GB-2026-0001"
       ├── Bouton "Télécharger ma licence (PDF)"
       ├── Message : "Un email vous a été envoyé"
       └── Bouton "Accéder à mon tableau de bord"

3. App.js (MODIFIER)
   └── Ajouter route :
       <Route path="/paiement-inscription" element={<HospitalPaymentRegistration />} />

4. HospitalDashboard.jsx (MODIFIER)
   └── Ajouter en haut de page :
       ├── Banner licence : "Licence officielle : KIN-GB-2026-001"
       ├── Badge "Hôpital certifié ✅"
       └── Si status != "active" → redirect /paiement-inscription


📊 MAPPING PROVINCES / VILLES / COMMUNES (RDC) :

Exemples de données pour les selects :

PROVINCES :
  • Kinshasa (KIN)
  • Kwilu (KWL)
  • Kongo Central (KOC)
  • Nord-Kivu (NKV)
  • ... (26 provinces)

VILLES/DISTRICTS (ex: Kinshasa) :
  • Lukunga
  • Funa
  • Mont-Amba
  • Tshangu

COMMUNES (ex: Lukunga) :
  • Gombe (GB)
  • Barumbu
  • Kinshasa
  • Lingwala

⚠️ Les abréviations (GB, KM, etc.) doivent être uniques et stockées en base.


═══════════════════════════════════════════════════════════════════════════════
PARTIE C : SYSTÈME NOTIFICATIONS TEMPS RÉEL (WEBSOCKET)
═══════════════════════════════════════════════════════════════════════════════

📁 FICHIERS BACKEND À CRÉER/MODIFIER :

1. notifications/models.py (NOUVEAU)
   └── Modèle Notification
       ├── id (UUID)
       ├── recipient         (FK → User)
       ├── title             (CharField, 200)
       ├── message           (TextField)
       ├── type              (info / success / warning / alert)
       ├── category          (report / validation / system / message / publication)
       ├── link              (URLField, optional)
       ├── is_read           (Boolean, default=False)
       ├── created_at
       └── updated_at

2. notifications/serializers.py (NOUVEAU)

3. notifications/consumers.py (NOUVEAU — WebSocket)
   └── Class NotificationConsumer(AsyncWebsocketConsumer)
       ├── connect() : authentifier via JWT token
       ├── receive() : ack de lecture
       └── send_notification() : envoyer notif temps réel

4. notifications/routing.py (NOUVEAU)
   └── websocket_urlpatterns = [
       path('ws/notifications/', NotificationConsumer.as_asgi()),
   ]

5. notifications/views.py (NOUVEAU)
   ├── GET /api/v1/notifications/ → liste paginée
   ├── PATCH /api/v1/notifications/:id/read/
   ├── PATCH /api/v1/notifications/mark-all-read/
   └── GET /api/v1/notifications/unread-count/

6. notifications/signals.py (NOUVEAU)
   └── Auto-créer notification quand :

       POUR HÔPITAL :
       • Rapport envoyé aux autorités → "Votre rapport a été envoyé"
       • Certificat validé → "Certificat #123 validé par les autorités"
       • Certificat rejeté → "Certificat #123 rejeté : [raison]"
       • Nouveau message autorité → "Nouveau message des autorités"
       • Alerte système → "Votre rapport mensuel est attendu"

       POUR CITOYEN :
       • Nouvelle publication autorité → "Nouvelles statistiques disponibles"
       • Réponse signalement → "Votre signalement a été traité"
       • Alerte sanitaire → "Alerte : épidémie de choléra à Kinshasa"

       POUR AUTORITÉ :
       • Nouveau rapport hôpital → "Nouveau rapport de [Hôpital X]"
       • Nouveau signalement citoyen → "Nouveau signalement reçu"
       • Hôpital non conforme → "[Hôpital X] n'a pas envoyé son rapport"

7. carelink_project/asgi.py (MODIFIER)
   └── Configurer Channels + WebSocket routing

8. carelink_project/settings.py (MODIFIER)
   └── Ajouter :
       INSTALLED_APPS += ['channels', 'notifications']
       ASGI_APPLICATION = 'carelink_project.asgi.application'
       CHANNEL_LAYERS = {
           'default': {
               'BACKEND': 'channels_redis.core.RedisChannelLayer',
               'CONFIG': { 'hosts': [('127.0.0.1', 6379)] },
           },
       }

9. requirements.txt (MODIFIER)
   └── Ajouter :
       channels
       channels-redis
       daphne


📁 FICHIERS FRONTEND À CRÉER/MODIFIER :

1. services/notificationService.js (NOUVEAU)
   ├── connectWebSocket(token) → connexion WS
   ├── disconnectWebSocket() → déconnexion
   ├── getNotifications() → GET /api/v1/notifications/
   ├── markAsRead(id) → PATCH
   ├── markAllAsRead() → PATCH
   ├── getUnreadCount() → GET /unread-count/
   └── onNotification(callback) → écoute temps réel

2. components/NotificationBell.jsx (NOUVEAU)
   ├── Icône cloche Lucide (Bell)
   ├── Badge rouge avec nombre (non lus)
   ├── Dropdown au click :
   │   ├── Liste notifications récentes (5 dernières)
   │   ├── Type coloré : 🔵 info 🟢 success 🟠 warning 🔴 alert
   │   ├── "Marquer tout comme lu"
   │   └── "Voir toutes" → lien /notifications
   ├── Click sur notif → navigation vers link + mark as read
   └── Son/beep optionnel pour nouvelle notif

3. pages/shared/NotificationsPage.jsx (NOUVEAU)
   ├── Page complète liste notifications
   ├── Filtres : Tout / Non lus / Par type
   ├── Pagination
   └── Actions : Marquer lu / Supprimer

4. context/NotificationContext.jsx (NOUVEAU)
   ├── Gère la connexion WebSocket globale
   ├── Stocke les notifications dans state
   ├── Fournit : notifications, unreadCount, markAsRead, etc.
   └── Se reconnecte automatiquement si déconnexion

5. TopBar.jsx (MODIFIER)
   └── Intégrer <NotificationBell /> à droite (près du profil)

6. App.js (MODIFIER)
   └── Wrapper <NotificationProvider> autour de l'app


═══════════════════════════════════════════════════════════════════════════════
PARTIE D : PUBLICATIONS PAR LES AUTORITÉS (RAPPORTS MENSUELS AGRÉGÉS)
═══════════════════════════════════════════════════════════════════════════════

📁 FICHIERS BACKEND À CRÉER/MODIFIER :

1. publications/models.py (NOUVEAU)
   └── Modèle Publication (UNIQUEMENT créé par autorités)
       ├── id (UUID)
       ├── author              (FK → User, limité aux autorités)
       ├── title               (CharField, 200)
       ├── content             (TextField — résumé du rapport)
       ├── report_period       (DateField — mois/année concerné)
       ├── province            (CharField, optional — si filtré par province)
       ├── data_summary        (JSONField) :
       │   {
       │     "total_births": 1500,
       │     "total_deaths": 320,
       │     "by_district": {
       │       "Lukunga": { "births": 500, "deaths": 100 },
       │       "Funa": { "births": 400, "deaths": 80 },
       │       ...
       │     },
       │     "by_commune": {
       │       "Gombe": { "births": 150, "deaths": 30 },
       │       "Barumbu": { "births": 120, "deaths": 25 },
       │       ...
       │     }
       │   }
       ├── is_published        (Boolean, default=False)
       ├── published_at        (DateTime, optional)
       ├── views_count         (Integer, default=0)
       ├── created_at
       └── updated_at

2. publications/serializers.py (NOUVEAU)

3. publications/views.py (NOUVEAU)
   ├── GET /api/v1/publications/ → liste publiées (publique)
   ├── GET /api/v1/publications/:id/ → détail
   ├── POST /api/v1/publications/ → CRÉER (autorité only)
   │   └── Body : title, content, report_period, data_summary, province
   ├── PATCH /api/v1/publications/:id/publish/ → publier (autorité)
   ├── PATCH /api/v1/publications/:id/unpublish/ → dépublier
   └── DELETE /api/v1/publications/:id/ → supprimer (autorité)

4. publications/permissions.py (NOUVEAU)
   └── IsAuthorityOnly → Seuls les users avec role='authority' peuvent CRUD

5. reports/views.py (MODIFIER)
   └── Quand tous les hôpitaux ont envoyé leur rapport mensuel :
       ├── Agréger les données par province/district/commune
       ├── Générer data_summary JSON
       └── Créer brouillon Publication (is_published=False)

6. reports/tasks.py (NOUVEAU — Celery)
   └── Tâche planifiée : 1er de chaque mois à 00:01
       ├── Vérifier si tous les hôpitaux ont envoyé leur rapport
       ├── Si oui → agréger et créer Publication brouillon
       └── Envoyer notification aux autorités : "Rapport mensuel prêt à publier"


📁 FICHIERS FRONTEND À CRÉER/MODIFIER :

1. pages/authority/Publications/AuthorityPublications.jsx (NOUVEAU)
   ├── Tableau des brouillons de publications
   ├── Colonnes : Période, Province, Statut, Actions
   ├── Bouton "Créer une publication" :
   │   ├── Sélection période (mois/année)
   │   ├── Sélection province (ou "National")
   │   ├── Auto-remplissage data_summary depuis rapports
   │   └── Édition manuelle possible
   ├── Actions par ligne :
   │   ├── 👁️ Prévisualiser
   │   ├── ✏️ Modifier
   │   ├── 🚀 Publier (devient visible publiquement)
   │   └── 🗑️ Supprimer
   └── Section "Publiées" avec stats de vues

2. pages/authority/Publications/PublicationPreview.jsx (NOUVEAU)
   ├── Rendu exact de ce que verront citoyens/hôpitaux
   ├── Graphiques : naissances/décès par district/commune
   ├── Tableaux détaillés
   └── Bouton "Confirmer et publier"

3. pages/public/Publications.jsx (NOUVEAU — page publique)
   ├── Liste des publications officielles
   ├── Filtres : Par province / Par période
   ├── Cards avec :
   │   ├── Titre : "Rapport mensuel — Juillet 2026"
   │   ├── Province : "Kinshasa"
   │   ├── Résumé : "1,500 naissances | 320 décès"
   │   └── Date de publication
   └── Click → page détail avec graphiques complets

4. pages/public/PublicationDetail.jsx (NOUVEAU)
   ├── Titre et période
   ├── Graphiques interactifs (Recharts) :
   │   ├── Naissances vs Décès (bar chart)
   │   ├── Répartition par district (pie chart)
   │   └── Répartition par commune (tableau + mini chart)
   ├── Tableau détaillé par district/commune
   └── Badge officiel "Publication des autorités"

5. LandingPage.jsx (MODIFIER)
   └── Ajouter section "Dernières Publications Officielles" :
       ├── 3 dernières publications
       ├── Cards : titre, province, période, stats
       └── Bouton "Voir toutes les statistiques" → /publications

6. citizen/Dashboard/CitizenDashboard.jsx (MODIFIER)
   └── Ajouter widget "Dernières publications" :
       ├── Liste compacte des 3 dernières
       └── Lien "Voir plus" → /publications

7. App.js (MODIFIER)
   ├── /publications → <Publications /> (publique)
   ├── /publications/:id → <PublicationDetail /> (publique)
   ├── /authority-dashboard/publications → <AuthorityPublications />
   └── /citizen-dashboard/publications → redirect /publications


═══════════════════════════════════════════════════════════════════════════════
PARTIE E : NETTOYAGE ANCIEN SYSTÈME PAIEMENT
═══════════════════════════════════════════════════════════════════════════════

📁 FICHIERS À SUPPRIMER/MODIFIER :

1. payments/models.py
   └── SUPPRIMER : Subscription, Plan, MonthlyPayment
   └── GARDER : HospitalRegistrationPayment (nouveau)

2. payments/views.py
   └── SUPPRIMER : endpoints abonnement, plans, Stripe
   └── GARDER : hospital-registration endpoint

3. payments/urls.py
   └── Nettoyer les routes obsolètes

4. hospitals/models.py
   └── SUPPRIMER : subscription_plan, subscription_expires, etc.
   └── GARDER : licence_number, status, registration_paid

5. HospitalPaiement.jsx (ANCIEN)
   └── RENOMMER/REMPLACER par HospitalPaymentRegistration.jsx

6. Rechercher dans tout le projet :
   └── "subscription", "abonnement", "plan", "monthly", "stripe"
   └── Supprimer toutes les références

7. Base de données
   └── Créer migration pour supprimer tables obsolètes


═══════════════════════════════════════════════════════════════════════════════
📅 ORDRE DE RÉALISATION
═══════════════════════════════════════════════════════════════════════════════

PHASE 1 — AUJOURD'HUI (Bug + Inscription) :
  ├─ A. Corriger bug rapport 403
  ├─ B1. Backend : Modèles Hospital + Licence generator
  ├─ B2. Backend : Payment registration endpoint
  ├─ B3. Frontend : Register.jsx (ajout province/ville/commune)
  └─ B4. Frontend : HospitalPaymentRegistration.jsx

PHASE 2 — DEMAIN (Notifications) :
  ├─ C1. Backend : Modèle Notification + WebSocket
  ├─ C2. Backend : Signals auto-notifications
  ├─ C3. Frontend : NotificationService + Context
  └─ C4. Frontend : NotificationBell + NotificationsPage

PHASE 3 — APRÈS-DEMAIN (Publications) :
  ├─ D1. Backend : Modèle Publication + Views autorité
  ├─ D2. Backend : Agrégation rapports mensuels
  ├─ D3. Frontend : AuthorityPublications (CRUD)
  ├─ D4. Frontend : Public Publications (lecture)
  └─ D5. Frontend : Landing Page section

PHASE 4 — FINAL (Cleanup) :
  └─ E. Supprimer ancien système paiement

═══════════════════════════════════════════════════════════════════════════════
📁 FICHIERS À M'ENVOYER POUR COMMENCER (PHASE 1)
═══════════════════════════════════════════════════════════════════════════════

BACKEND :
  1. backend/users/views.py
  2. backend/users/models.py
  3. backend/users/serializers.py
  4. backend/hospitals/models.py
  5. backend/hospitals/serializers.py
  6. backend/reports/views.py
  7. backend/reports/models.py
  8. backend/payments/models.py (si existe)
  9. backend/payments/views.py (si existe)
  10. backend/carelink_project/settings.py

FRONTEND :
  11. frontend/src/pages/public/Register/Register.jsx
  12. frontend/src/pages/hospital/Paiement/HospitalPaiement.jsx (si existe)
  13. frontend/src/services/api.js
  14. frontend/src/App.js

═══════════════════════════════════════════════════════════════════════════════
