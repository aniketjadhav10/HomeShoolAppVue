/**
 * Service Worker — Yug Homeschool PWA
 *
 * Strategy summary:
 *  - App shell       → CacheFirst (precache, Vite-managed, versioned hashes)
 *  - GAS API         → NetworkFirst (5s timeout, fallback to cache so reads work offline)
 *  - FontAwesome CSS → CacheFirst, expire after 30 days
 *  - Google Fonts CSS→ StaleWhileRevalidate (stylesheet changes occasionally)
 *  - GStatic fonts   → CacheFirst, expire after 365 days (immutable binary assets)
 *  - Background Sync → Custom bulk sync via IndexedDB queue
 */

import { precacheAndRoute } from 'workbox-precaching';
import { NetworkFirst, CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { registerRoute } from 'workbox-routing';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { clientsClaim } from 'workbox-core';
import { openDB } from 'idb';

// Take control of all clients immediately when a new SW activates
clientsClaim();
self.skipWaiting();

// ─── 1. APP SHELL ────────────────────────────────────────────────────────────
// Vite injects the versioned asset manifest here at build time.
// This caches all JS/CSS/HTML chunks with content-hash filenames → safe CacheFirst.
precacheAndRoute(self.__WB_MANIFEST);

// ─── 2. GOOGLE APPS SCRIPT API ───────────────────────────────────────────────
// Strategy: NetworkFirst
//   - All calls are POST mutations so no HTTP cache applies natively.
//   - We store GAS responses in a named cache so offline reads still work.
//   - 5s timeout keeps the app snappy; falls back to last cached response.
//   - FIX: Removed matchOptions.ignoreSearch — it has NO effect on POST requests.
//   - FIX: Added CacheableResponsePlugin to only cache valid 200 responses, not
//     the HTML error pages Google serves on rate-limit (which was a silent bug).
registerRoute(
  ({ url }) => url.origin === 'https://script.google.com',
  new NetworkFirst({
    cacheName: 'gas-api-cache-v1',
    networkTimeoutSeconds: 5,
    plugins: [
      // Only cache real success responses — reject Google's HTML error pages
      new CacheableResponsePlugin({ statuses: [200] }),
      // Keep the last 10 API responses; expire after 24h to prevent stale reads
      new ExpirationPlugin({
        maxEntries: 10,
        maxAgeSeconds: 24 * 60 * 60, // 24 hours
        purgeOnQuotaError: true,
      }),
    ],
  })
);

// ─── 3. FONTAWESOME (cdnjs.cloudflare.com) ───────────────────────────────────
// Strategy: CacheFirst
//   - FA icons are versioned in the URL so they never change for a given URL.
//   - Expire after 30 days as a safety net for version bumps.
//   - FIX: Old code had a plain object plugin (non-standard); replaced with the
//     proper Workbox plugin classes.
registerRoute(
  ({ url }) => url.origin.includes('cdnjs.cloudflare.com'),
  new CacheFirst({
    cacheName: 'fontawesome-cache-v1',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }), // 0 = opaque (cross-origin)
      new ExpirationPlugin({
        maxEntries: 20,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        purgeOnQuotaError: true,
      }),
    ],
  })
);

// ─── 4. GOOGLE FONTS CSS (fonts.googleapis.com) ──────────────────────────────
// Strategy: StaleWhileRevalidate
//   - The @font-face stylesheet can change when Google updates its CDN.
//   - Serve from cache instantly, revalidate in background — best of both worlds.
//   - FIX: Old code used CacheFirst here which could serve a stale stylesheet
//     that references font files that no longer exist at those URLs.
registerRoute(
  ({ url }) => url.origin === 'https://fonts.googleapis.com',
  new StaleWhileRevalidate({
    cacheName: 'google-fonts-stylesheets-v1',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 5, maxAgeSeconds: 7 * 24 * 60 * 60 }), // 7 days
    ],
  })
);

// ─── 5. GOOGLE FONTS FILES (fonts.gstatic.com) ───────────────────────────────
// Strategy: CacheFirst
//   - FIX: Old code was missing this entirely — the font BINARY files are served
//     from gstatic.com, a DIFFERENT origin than the CSS stylesheet. Without this,
//     fonts loaded on first visit but failed completely offline.
//   - Font files are immutable (content-addressable URLs), safe for 1 year cache.
registerRoute(
  ({ url }) => url.origin === 'https://fonts.gstatic.com',
  new CacheFirst({
    cacheName: 'google-fonts-files-v1',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 20,
        maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year — font files are immutable
        purgeOnQuotaError: true,
      }),
    ],
  })
);

// ─── 6. BACKGROUND SYNC — NATIVE SW SYNC ─────────────────────────────────────
// FIX: Changed openDB version from 1 to 3 to match offlineService.js (DB_VERSION = 3).
//      Opening at v1 was causing silent IndexedDB version conflicts where the SW
//      transaction would see a DIFFERENT schema than the app, potentially crashing
//      cursor reads or missing the newer stores.
const DB_VERSION = 3; // Must stay in sync with offlineService.js DB_VERSION constant

const executeNativeSync = async () => {
  try {
    const db = await openDB('homeschool_db', DB_VERSION);
    const queue = await db.getAll('sync_queue');
    if (!queue || queue.length === 0) return;

    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwrmGSQHclLHRtmh1p4m0oMutpxsgBYEw98DG0M-45WYIkWA6Xcf-ko10fih5M-INe6/exec';

    const bulkPayload = queue.map(q => ({
      action: q.endpoint,
      args: q.payload,
      timestamp: q.timestamp,
    }));

    const res = await fetch(SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'syncOfflineQueue', args: [bulkPayload] }),
    });

    if (!res.ok) {
      throw new Error(`GAS Request Failed with HTTP ${res.status}`);
    }

    const rawText = await res.text();
    let result;
    try {
      result = JSON.parse(rawText);
    } catch (e) {
      // Google serves an HTML error page when rate-limited — treat as retryable
      throw new Error('Received non-JSON from GAS (rate limit or quota assumed).');
    }

    if (result.status === 'success') {
      await db.clear('sync_queue');
      // Notify all open app tabs to refresh their visual state
      const clients = await self.clients.matchAll({ includeUncontrolled: true });
      clients.forEach(c => c.postMessage({ type: 'SYNC_COMPLETED', data: result.data }));
    } else {
      throw new Error(`GAS logical error: ${result.message}`);
    }
  } catch (err) {
    console.error('[SW] Native sync failed — queue preserved for retry', err);
    // Rethrowing lets the Background Sync API reschedule with OS-level backoff
    throw err;
  }
};

// Listen to the Browser Background Sync API
self.addEventListener('sync', event => {
  if (event.tag === 'sync-queue') {
    console.log('[SW] Background Sync triggered — executing native bulk sync');
    event.waitUntil(executeNativeSync());
  }
});
