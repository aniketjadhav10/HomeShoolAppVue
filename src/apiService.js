import { callApi } from './api';
import { cacheGlobalState } from './services/offlineService';
import { addToQueue } from './services/syncService';

// smartDispatch acts as our global Frontend Request Intercept
// We add an active ping to bypass "Lie-Fi" (where device is connected to a router, but router has no internet)
const checkActualConnection = async () => {
  if (!navigator.onLine) return false;
  try {
    // A tiny fetch to our own server or a reliable 204 endpoint to confirm actual web traffic
    const res = await fetch('https://httpbin.org/status/204', { mode: 'no-cors', cache: 'no-store' });
    return true;
  } catch(e) {
    return false;
  }
};

export const smartDispatch = async (action, ...args) => {
  const reallyOnline = await checkActualConnection();

  if (reallyOnline) {
    try {
      const freshData = await callApi(action, ...args);
      // Cache the fresh snapshot optimistically
      if (freshData && freshData.subjects) {
        await cacheGlobalState(freshData);
      }
      return freshData;
    } catch(e) {
      console.warn("GAS limit hit or network failed mid-flight. Queueing operation...", e);
      // Fallback if GAS limits are hit despite being 'online'
      await addToQueue(action, args, 'update');
      return { _offlineQueued: true };
    }
  } else {
    // True Offline Mode
    console.log(`[Offline Mode] Queueing mutation: ${action}`);
    await addToQueue(action, args, 'update');
    // We mock success for Vue components to organically reset forms
    return { _offlineQueued: true }; 
  }
};
