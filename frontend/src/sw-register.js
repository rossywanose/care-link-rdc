// =====================================================
// Care-Link RDC - Service Worker Registration (STABLE)
// =====================================================

export function registerServiceWorker() {
  // DÉSACTIVÉ temporairement pour éviter les rechargements
  console.log('[PWA] Service Worker désactivé');
}

// =====================================================
// OFFLINE DETECTION - Redirect to offline page
// =====================================================
 export function initOfflineDetection() {
  if (!navigator.onLine) {
    redirectToOffline();
  }

  window.addEventListener('offline', () => {
    console.log('[PWA] Appareil hors ligne');
    redirectToOffline();
  });

  window.addEventListener('online', () => {
    console.log('[PWA] Appareil en ligne');
  });
}


function redirectToOffline() {
  if (window.location.pathname === '/offline.html') return;
  sessionStorage.setItem('lastUrl', window.location.href);
  window.location.href = '/offline.html';
}

// =====================================================
// INSTALL PROMPT (A2HS)
// =====================================================
let deferredPrompt = null;

export function initInstallPrompt() {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    showInstallButton();
  });

  window.addEventListener('appinstalled', () => {
    console.log('[PWA] App installée !');
    deferredPrompt = null;
    hideInstallButton();
  });
}

function showInstallButton() {
  if (document.getElementById('pwa-install-btn')) return;

  const installBtn = document.createElement('button');
  installBtn.id = 'pwa-install-btn';
  installBtn.innerHTML = '📲 Installer Care-Link RDC';
  installBtn.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: linear-gradient(135deg, #0072CE, #0056A6);
    color: white;
    border: none;
    padding: 14px 24px;
    border-radius: 50px;
    font-weight: 600;
    font-size: 0.9rem;
    cursor: pointer;
    box-shadow: 0 8px 30px rgba(0, 114, 206, 0.4);
    z-index: 9999;
    font-family: 'Inter', sans-serif;
    transition: all 0.3s ease;
  `;

  installBtn.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('[PWA] Installation acceptée');
    }
    deferredPrompt = null;
    hideInstallButton();
  });

  document.body.appendChild(installBtn);
}

function hideInstallButton() {
  const btn = document.getElementById('pwa-install-btn');
  if (btn) btn.remove();
}

// =====================================================
// NOTIFICATIONS PUSH
// =====================================================
export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.log('[PWA] Notifications non supportées');
    return false;
  }
  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

export function showLocalNotification(title, options = {}) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      ...options
    });
  }
}

// =====================================================
// INITIALISATION
// =====================================================
export function initPWA() {
  registerServiceWorker();
  initInstallPrompt();
  initOfflineDetection();
  console.log('[PWA] Care-Link RDC initialisé');
}