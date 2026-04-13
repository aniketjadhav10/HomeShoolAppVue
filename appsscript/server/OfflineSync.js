// Handling bulk processing for the offline-first PWA Sync Queue

function syncOfflineQueue(bulkPayloadArray) {
  // === ADVANCED PERFORMANCE FEATURE: NATIVE RACE-CONDITION LOCKING ===
  // If a parent's phone and an iPad both drop an offline-queue sync at the exact same millisecond
  // when Wi-Fi returns, Google Apps script will blindly attempt simultaneously, colliding the Sheet rows.
  const lock = LockService.getScriptLock();
  
  // Wait up to 10 seconds for other device syncs to finish
  const lockAcquired = lock.tryLock(10000); 
  if (!lockAcquired) {
    throw new Error("Server is heavily loaded processing other syncs. Deferring this queue.");
  }

  try {
    let queue = [];
    if (typeof bulkPayloadArray === 'string') {
      queue = JSON.parse(bulkPayloadArray);
    } else {
      queue = bulkPayloadArray;
    }

    if (!Array.isArray(queue)) {
      console.warn('[Sync] Received non-array queue payload.');
      return getHomeschoolData();
    }
    console.log(`[Sync] Starting bulk sync: ${queue.length} raw actions.`);

    // 1. Sort Chronologically
    let sortedQueue = queue.sort((a, b) => a.timestamp - b.timestamp);

    // 2. Last-Write-Wins Deduplication (Optimization)
    const optimizedQueue = [];
    const updateMap = new Map();

    for (let i = sortedQueue.length - 1; i >= 0; i--) {
      const item = sortedQueue[i];
      if (item.action === 'updateTask') {
        const targetId = item.args[0]; 
        if (updateMap.has(targetId)) continue; 
        updateMap.set(targetId, true);
        optimizedQueue.unshift(item); 
      } else {
        optimizedQueue.unshift(item);
      }
    }
    console.log(`[Sync] Optimized queue: ${optimizedQueue.length} actions after deduplication.`);

    // 3. Execution & ID Translation Loop
    const idTranslationMap = {};

    for (let i = 0; i < optimizedQueue.length; i++) {
      const item = optimizedQueue[i];
      
      let func = null;
      try {
        if (typeof GLOBAL_ROOT[item.action] === 'function') func = GLOBAL_ROOT[item.action];
        else if (typeof globalThis[item.action] === 'function') func = globalThis[item.action];
        else {
          const resolved = eval(item.action);
          if (typeof resolved === 'function') func = resolved;
        }
      } catch (e) {}

      if (!func || item.action === 'syncOfflineQueue') {
        console.warn(`[Sync] Skipping unknown or recursive function: ${item.action}`);
        continue;
      }

      // Translate IDs for parents/dependencies (e.g. lesson using a newly created subjectId)
      const translatedArgs = item.args.map(arg => idTranslationMap[arg] || arg);

      try {
        console.log(`[Sync] Executing ${i+1}/${optimizedQueue.length}: ${item.action}`);
        const result = func.apply(null, translatedArgs);
        
        // If this was a creation action that returned a new server ID, 
        // map the old temporary ID to the new real ID.
        if (result && result._newId) {
          const originalTempId = item.args[0]; // The first arg is usually the ID being saved
          if (originalTempId && originalTempId.toString().startsWith('temp-')) {
            console.log(`[Sync] ID Translation: ${originalTempId} → ${result._newId}`);
            idTranslationMap[originalTempId] = result._newId;
          }
        }
      } catch (e) {
        console.error(`[Sync] Bulk execution failure on ${item.action}: ${e.toString()}`);
      }
    }

    console.log('[Sync] Bulk sync completed. Returning fresh data.');
    return getHomeschoolData();

  } finally {
    // ALWAYS release the atomic lock dynamically so we don't freeze the backend on error!
    if (lockAcquired) {
      lock.releaseLock();
    }
  }
}
