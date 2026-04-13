import { callApi, SCRIPT_URL } from './api';
import { cacheGlobalState } from './services/offlineService';
import { addToQueue, processQueue } from './services/syncService';

// Lie-Fi detection: confirms real internet beyond the local router.
// Pings OUR own GAS endpoint with a no-cors HEAD-like fetch and a
// strict 3s AbortController timeout. If it resolves at all, we have real internet.
const checkActualConnection = async () => {
  if (!navigator.onLine) return false; // Fast path: browser reports offline

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000); // Max 3s wait

  try {
    // Use no-cors so we don't need CORS headers — we only care if the network resolves.
    // Use GET because Google Apps Script often returns 403/405 for HEAD requests.
    await fetch(SCRIPT_URL, { method: 'GET', mode: 'no-cors', cache: 'no-store', signal: controller.signal });
    return true;
  } catch {
    return false; // Aborted (timeout) or DNS/network failure
  } finally {
    clearTimeout(timeoutId);
  }
};

export const smartDispatch = async (action, ...args) => {
  // 1. Identify if this is a "Query" action that depends on a real-time server response.
  // These should NOT be backgrounded as the UI usually waits for the specific output.
  const QUERY_ACTIONS = ['getLessonDocContent', 'generateLessonTasksWithGemini', 'getHomeschoolData'];
  const isQuery = QUERY_ACTIONS.includes(action);

  if (isQuery) {
    const reallyOnline = await checkActualConnection();
    if (reallyOnline) {
      return await callApi(action, ...args);
    } else {
      throw new Error(`Offline: ${action} requires a live connection.`);
    }
  }

  // 2. For all "Mutating" actions (save/update/delete):
  // We ALWAYS add to the persistent queue first for reliability.
  console.log(`[SmartDispatch] Backgrounding mutation: ${action}`);
  await addToQueue(action, args, 'POST');

  // 3. Trigger the queue processor in the background (Fire and Forget)
  // We don't 'await' this so the UI returns instantly.
  processQueue().catch(err => console.error('[Sync] Background process failed:', err));

  // 4. Return a mock result so the store knows it was success/queued
  return { _backgroundQueued: true };
};
