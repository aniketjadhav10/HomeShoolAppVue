import { initDB } from './offlineService';
import { callApi } from '../api';

export const syncState = {
  isOnline: navigator.onLine,
  syncPending: false,
  lastSyncTime: null
};

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
      window.dispatchEvent(new CustomEvent('homeschool-data-hydrated', { detail: event.data.data }));
    }
  });
}

export async function addToQueue(endpoint, payload, method) {
  const db = await initDB();
  
  // === ADVANCED FEATURE: UI-Side Deduplication ===
  // If the user hammers a toggle button or changes text rapidly offline, we shouldn't save 50 duplicate network payloads.
  // We actively scan the pending queue. If a matching edit action on the exact same item ID already exists,
  // we update that payload in place to compress the queue seamlessly!
  if (endpoint === 'updateTask' || endpoint === 'saveTask' || endpoint === 'saveLesson') {
    const queueItems = await db.getAll('sync_queue');
    const existing = queueItems.find(q => q.endpoint === endpoint && q.payload[0] === payload[0]);
    
    if (existing) {
      existing.payload = payload; 
      existing.timestamp = Date.now();
      await db.put('sync_queue', existing);
      syncState.syncPending = true;
      triggerBackgroundSync();
      return;
    }
  }

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

    // Calling the custom batch execution endpoint on the GAS backend
    const success = await callApi('syncOfflineQueue', bulkPayload);
    
    if (success) {
      await db.clear('sync_queue');
      syncState.syncPending = false;
      syncState.lastSyncTime = new Date().toLocaleTimeString();
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
