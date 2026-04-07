import { openDB } from 'idb';

const DB_NAME = 'homeschool_db';
const DB_VERSION = 2; // Incremented for advanced indexing

export async function initDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion, transaction) {
      // Future-proof version control schema migrations
      if (oldVersion < 1) {
        db.createObjectStore('app_data', { keyPath: 'id' });
        const syncQ = db.createObjectStore('sync_queue', { keyPath: 'id', autoIncrement: true });
        syncQ.createIndex('timestamp_idx', 'timestamp'); // Allow rapid querying of old items
      }
      
      if (oldVersion < 2) {
        // Example of adding new indexes or stores on the fly
        if (!db.objectStoreNames.contains('offline_assets')) {
           db.createObjectStore('offline_assets', { keyPath: 'url' });
        }
      }
    },
  });
}

// === OFFLINE DATA METHODS === //

export async function saveData(id, payload) {
  const db = await initDB();
  await db.put('app_data', {
    id,
    payload,
    lastUpdated: Date.now()
  });
}

export async function getData(id) {
  const db = await initDB();
  const result = await db.get('app_data', id);
  return result ? result.payload : null;
}

export async function updateData(id, payload) {
  return saveData(id, payload);
}

export async function deleteData(id) {
  const db = await initDB();
  await db.delete('app_data', id);
}

// Save the entire initial global state to IndexedDB for offline reads
export async function cacheGlobalState(data) {
  await saveData('global_cache', data);
}

export async function getCachedGlobalState() {
  return getData('global_cache');
}

// Clear any cached data or failed sync items older than 30 days to prevent bloat
export async function enforceStorageLimits() {
  const db = await initDB();
  const tx = db.transaction('sync_queue', 'readwrite');
  const store = tx.objectStore('sync_queue');
  
  if (store.indexNames.contains('timestamp_idx')) {
    const index = store.index('timestamp_idx');
    const cutoff = Date.now() - (30 * 24 * 60 * 60 * 1000); // 30 days ago in MS
    const range = IDBKeyRange.upperBound(cutoff); 
    
    let cursor = await index.openCursor(range);
    while (cursor) {
      console.warn(`[IndexedDB TTL] Purging extremely old abandoned sync payload: ${cursor.value.endpoint}`);
      await cursor.delete();
      cursor = await cursor.continue();
    }
  }
  await tx.done;
}
