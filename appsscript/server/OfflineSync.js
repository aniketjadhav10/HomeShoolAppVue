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

    if (!Array.isArray(queue)) return getHomeschoolData();

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

    // 3. Execution & ID Translation Loop
    const idTranslationMap = {};

    for (let i = 0; i < optimizedQueue.length; i++) {
      const item = optimizedQueue[i];
      if (typeof this[item.action] !== 'function' || item.action === 'syncOfflineQueue') continue;

      const translatedArgs = item.args.map(arg => idTranslationMap[arg] || arg);

      try {
        const freshDataSnapshot = this[item.action].apply(this, translatedArgs);
      } catch (e) {
        console.error("Bulk sync failure on " + item.action + ": " + e.toString());
      }
    }

    return getHomeschoolData();

  } finally {
    // ALWAYS release the atomic lock dynamically so we don't freeze the backend on error!
    if (lockAcquired) {
      lock.releaseLock();
    }
  }
}
