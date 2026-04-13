import { initDB } from './offlineService';
import { callApi } from '../api';
import { reactive } from 'vue'; // FIX: plain object mutations are NOT tracked by Vue

// FIX: syncState was a plain JS object — mutations like syncState.isOnline = true
// would NOT trigger Vue template re-renders. Wrapping in reactive() fixes this.
export const syncState = reactive({
  isOnline: navigator.onLine,
  syncPending: false,
  syncSuccess: false,
  lastSyncTime: null
});

window.addEventListener('online', () => {
  syncState.isOnline = true;
  processQueue();
});
window.addEventListener('offline', () => {
  syncState.isOnline = false;
});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', async event => {
    if (event.data && event.data.type === 'PROCESS_SYNC_QUEUE') {
      processQueue();
    }
    if (event.data && event.data.type === 'SYNC_COMPLETED') {
      // The background native sync just finished and returned authoritative data from the server.
      syncState.syncPending = false;
      syncState.lastSyncTime = new Date().toLocaleTimeString();
      // FIX: also set syncSuccess here for SW-initiated syncs (not just app-level ones)
      syncState.syncSuccess = true;
      setTimeout(() => { syncState.syncSuccess = false; }, 3000);
      window.dispatchEvent(new CustomEvent('homeschool-data-hydrated', { detail: event.data.data }));
    }
  });
}

export async function addToQueue(endpoint, payload, method) {
  const db = await initDB();

  // === Queue Deduplication — UPDATES ONLY ===
  // Only collapse duplicate writes for UPDATE actions where the ID is a real,
  // non-null, non-temp server ID. NEVER deduplicate CREATE operations
  // (where payload[0] is null or starts with 'temp-') because each creation
  // is a distinct record and must be saved separately.
  const DEDUPE_ACTIONS = ['updateTask', 'updateLesson'];
  const itemId = payload[0];
  const isRealId = itemId && !itemId.toString().startsWith('temp-');

  if (DEDUPE_ACTIONS.includes(endpoint) && isRealId) {
    const queueItems = await db.getAll('sync_queue');
    const existing = queueItems.find(
      q => q.endpoint === endpoint && q.payload[0] === itemId
    );

    if (existing) {
      console.log(`[SyncQueue] Deduplicating ${endpoint} for ID: ${itemId}`);
      existing.payload = payload;
      existing.timestamp = Date.now();
      await db.put('sync_queue', existing);
      syncState.syncPending = true;
      triggerBackgroundSync();
      return;
    }
  }

  console.log(`[SyncQueue] Enqueuing: ${endpoint}, ID: ${itemId ?? 'NEW'}`);
  await db.add('sync_queue', {
    endpoint,
    payload,
    method,
    timestamp: Date.now()
  });

  syncState.syncPending = true;
  triggerBackgroundSync();
}

async function triggerBackgroundSync() {
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    try {
      const sw = await navigator.serviceWorker.ready;
      await sw.sync.register('sync-queue');
    } catch (e) {
      console.log('Background Sync not supported / permitted: ', e);
    }
  }
}

export async function processQueue(retryCount = 0) {
  if (!navigator.onLine) return;
  
  const db = await initDB();
  const queue = await db.getAll('sync_queue');
  
  if (!queue.length) {
    syncState.syncPending = false;
    return;
  }

  syncState.syncPending = true;
  console.log(`Processing ${queue.length} offline actions...`);

  // Google Apps Script Optimization: Batch the entire queue
  // If we had a bulk GAS endpoint: callApi('bulkSync', queue)
  // For now, attempting to process one-by-one or creating basic batch support.
  try {
    // Basic Bulk Payload construction to avoid multiple GAS fetch hits
    const bulkPayload = queue.map(q => ({
      action: q.endpoint, // We mapped endpoint as GAS action
      args: q.payload,    // We mapped payload as args array
      timestamp: q.timestamp
    }));

    console.log(`[Sync] Calling batch execution for ${bulkPayload.length} actions.`);
    // Calling the custom batch execution endpoint on the GAS backend
    const success = await callApi('syncOfflineQueue', bulkPayload);
    
    if (success) {
      console.log('[Sync] Batch sync success. Clearing local queue.');
      await db.clear('sync_queue');
      syncState.syncPending = false;
      // FIX: Set syncSuccess so the green banner shows after a foreground sync completes
      syncState.syncSuccess = true;
      syncState.lastSyncTime = new Date().toLocaleTimeString();
      
      console.log('[Sync] Hydrating authoritative state from server response.');
      window.dispatchEvent(new CustomEvent('homeschool-data-hydrated', { detail: success }));
      
      setTimeout(() => { syncState.syncSuccess = false; }, 3000);
    }
  } catch (error) {
    console.error(`Sync failed (Attempt ${retryCount + 1}). Analyzing...`, error);
    
    if (retryCount < 4) {
      // Exponential Backoff algorithm: 4s, 8s, 16s, 32s
      const backoffMs = Math.pow(2, retryCount + 1) * 2000; 
      console.warn(`Rescheduling sync retry in ${backoffMs/1000}s`);
      setTimeout(() => processQueue(retryCount + 1), backoffMs);
    } else {
      console.error("Max sync retries reached. Queue will wait for OS Background Sync or next App load.");
    }
  }
}
