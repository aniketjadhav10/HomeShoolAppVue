import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

createApp(App).mount('#app')

// === FIX: Explicit Service Worker Registration ===
// vite-plugin-pwa's 'injectRegister: script' only works in production builds.
// We register manually here to ensure SW is active in all environments.
if ('serviceWorker' in navigator) {
  // Use the PWA-generated sw.js path (with base URL for GitHub Pages sub-path hosting)
  const swPath = import.meta.env.BASE_URL + 'sw.js';

  navigator.serviceWorker.register(swPath, { scope: import.meta.env.BASE_URL })
    .then(registration => {
      console.log('[SW] Registered at scope:', registration.scope);

      // FIX: SW Update Notification — prompt user to refresh when a new version is waiting
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (!newWorker) return;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // Dispatch a custom event that any Vue component can listen for
            window.dispatchEvent(new CustomEvent('sw-update-available'));
            console.log('[SW] New version available — reload to update.');
          }
        });
      });
    })
    .catch(err => console.error('[SW] Registration failed:', err));
}

// FIX: PWA Install Prompt — capture the browser's beforeinstallprompt event
// Store it globally so any component can call window.__pwaInstallPrompt.prompt()
window.__pwaInstallPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault(); // Prevent the default mini-infobar on mobile Chrome
  window.__pwaInstallPrompt = e;
  // Notify any component that wants to show a custom install button
  window.dispatchEvent(new CustomEvent('pwa-installable'));
  console.log('[PWA] Install prompt captured and ready.');
});
