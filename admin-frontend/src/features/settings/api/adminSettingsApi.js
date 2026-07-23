import { adminAxios } from '../../../core/api';

export const adminSettingsApi = {
  /**
   * Fetch all platform settings as a key→value map from the real database.
   */
  getSettings: async () => {
    const { data } = await adminAxios.get('/settings');
    return data.data || {};
  },

  /**
   * Persist updated settings to the database.
   * @param {Object} updates - key→value map of settings to update
   */
  updateSettings: async (updates) => {
    const { data } = await adminAxios.put('/settings', updates);
    return data;
  },

  /**
   * Trigger a server-side Redis cache purge.
   */
  purgeCache: async () => {
    const { data } = await adminAxios.post('/settings/purge-cache');
    return data;
  },

  /**
   * Fetch Gemini AI health telemetry.
   */
  getGeminiHealth: async () => {
    const { data } = await adminAxios.get('/settings/gemini-health');
    return data.data || {};
  },
};
