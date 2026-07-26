import { adminAxios } from '../../../core/api';

const BADGE_API_URL = '/badges';

export const badgeService = {
  /**
   * Fetch all badges
   * @returns {Promise<Array>} List of badges
   */
  getAllBadges: async () => {
    const response = await adminAxios.get(BADGE_API_URL);
    return Array.isArray(response.data) ? response.data : (response.data.data || []);
  },

  /**
   * Create a new badge
   * @param {Object} badgeData 
   * @returns {Promise<Object>} Created badge
   */
  createBadge: async (badgeData) => {
    const response = await adminAxios.post(BADGE_API_URL, badgeData);
    return response.data.data || response.data;
  },

  /**
   * Update an existing badge
   * @param {number} id 
   * @param {Object} badgeData 
   * @returns {Promise<Object>} Updated badge
   */
  updateBadge: async (id, badgeData) => {
    const response = await adminAxios.put(`${BADGE_API_URL}/${id}`, badgeData);
    return response.data.data || response.data;
  },

  /**
   * Delete a badge
   * @param {number} id 
   */
  deleteBadge: async (id) => {
    await adminAxios.delete(`${BADGE_API_URL}/${id}`);
  },

  /**
   * Update badge status
   * @param {number} id 
   * @param {string} status 'ACTIVE' or 'INACTIVE'
   * @returns {Promise<Object>} Updated badge
   */
  updateBadgeStatus: async (id, status) => {
    const response = await adminAxios.patch(`${BADGE_API_URL}/${id}/status`, null, {
      params: { status }
    });
    return response.data.data;
  },

  /**
   * Upload badge image
   * @param {File} file 
   * @returns {Promise<string>} Image URL
   */
  uploadBadgeImage: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await adminAxios.post(`${BADGE_API_URL}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data.data; // URL string
  }
};
