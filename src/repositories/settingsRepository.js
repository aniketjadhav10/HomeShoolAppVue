import { dataStore, dispatchAction } from '../stores/dataStore';

/**
 * settingsRepository.js
 */
export const settingsRepository = {
  getSettings() {
    return dataStore.state.settings || {};
  },

  async saveSettings(settings) {
    return await dispatchAction('saveAppSettings', settings);
  }
};
