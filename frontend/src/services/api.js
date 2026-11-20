/**
 * API Client Module for Upwork Proposal Studio.
 * 
 * Provides unified HTTP communication with the FastAPI backend,
 * standardizing error extraction and JSON serialization.
 */

const API_BASE = '/api';

/**
 * Generic fetch wrapper with standardized error handling and response parsing.
 * 
 * @param {string} endpoint - The relative API path (e.g. '/profiles').
 * @param {RequestInit} [options={}] - Fetch configuration options.
 * @returns {Promise<any>} Parsed JSON response.
 * @throws {Error} Detailed error message if the response is not OK.
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    if (!res.ok) {
      let errorMessage = `Request failed with status ${res.status}`;
      try {
        const errorData = await res.json();
        errorMessage = errorData.detail || errorData.message || errorMessage;
      } catch {
        // Fallback to text status
      }
      throw new Error(errorMessage);
    }

    return await res.json();
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error('Cannot connect to backend server. Make sure FastAPI is running on port 8000.');
    }
    throw err;
  }
}

export const api = {
  /**
   * Fetches backend connectivity status and active model information.
   */
  async getHealth() {
    return request('/health');
  },

  /**
   * Retrieves all registered freelancer profiles.
   */
  async getProfiles() {
    return request('/profiles');
  },

  /**
   * Creates a new freelancer profile and calculates its vector embedding.
   * @param {Object} profileData - Profile attributes.
   */
  async createProfile(profileData) {
    return request('/profiles', {
      method: 'POST',
      body: JSON.stringify(profileData),
    });
  },

  /**
   * Updates an existing profile by ID.
   * @param {string} id - Profile UUID.
   * @param {Object} profileData - Partial update attributes.
   */
  async updateProfile(id, profileData) {
    return request(`/profiles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

  /**
   * Deletes a profile from Supabase and cache.
   * @param {string} id - Profile UUID.
   */
  async deleteProfile(id) {
    return request(`/profiles/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Seeds demo freelancer profiles for instant out-of-the-box matching.
   */
  async seedProfiles() {
    return request('/profiles/seed', {
      method: 'POST',
    });
  },

  /**
   * Vectorizes job post and retrieves top nearest-neighbor profiles.
   * @param {Object} jobData - Job title, description, and required skills.
   */
  async matchJob(jobData) {
    return request('/match', {
      method: 'POST',
      body: JSON.stringify(jobData),
    });
  },

  /**
   * Parses raw unformatted text copied from an Upwork profile page.
   * @param {string} rawText - Raw copied profile text.
   */
  async parseRawUpwork(rawText) {
    return request('/profiles/parse-raw-upwork', {
      method: 'POST',
      body: JSON.stringify({ raw_text: rawText }),
    });
  },

  /**
   * Generates a tailored Upwork proposal based on profile and job context.
   * @param {Object} proposalReq - Job details, profile ID, and tone.
   */
  async generateProposal(proposalReq) {
    return request('/proposal/generate', {
      method: 'POST',
      body: JSON.stringify(proposalReq),
    });
  },
};
