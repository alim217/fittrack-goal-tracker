import axios from 'axios';

// --- Axios Instance Configuration ---

// Retrieve the API base URL from environment variables provided by Vite
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Log a warning if the base URL is not set and provide a default
if (!API_BASE_URL) {
  console.warn(
    'VITE_API_BASE_URL is not defined in environment variables. Defaulting to /api. Ensure this is correct for your deployment.',
  );
}

// Create a dedicated Axios instance for API communication
const apiClient = axios.create({
  baseURL: API_BASE_URL || '/api', // Use environment variable or fallback
  timeout: 15000, // 15 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- Request Interceptor for Authentication ---

apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      // Handle potential localStorage access errors gracefully
      console.error('Failed to retrieve auth token from localStorage:', error);
      // Proceed without the token if retrieval fails
    }
    return config; // Return the config object (modified or original)
  },
  (error) => {
    // Handle request configuration errors
    console.error('Axios request interceptor error:', error);
    return Promise.reject(error);
  },
);

// --- Response Interceptor ---

apiClient.interceptors.response.use(
  (response) => {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Simply return the response
    return response;
  },
  (error) => {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('API Error Response:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
      });
      // Example: Trigger logout on 401 Unauthorized - AuthContext typically handles this based on the error
      // if (error.response.status === 401) {
      //   console.log('Received 401 Unauthorized, potentially trigger logout.');
      //   // Trigger logout logic here or ensure AuthContext handles it
      // }
    } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of http.ClientRequest in node.js
      console.error('API No Response:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('API Request Setup Error:', error.message);
    }

    // Ensure the error propagates so calling functions can handle UI updates
    return Promise.reject(error);
  },
);

// --- Exported API Functions ---

/**
 * Logs in a user.
 * @param {object} credentials - User credentials.
 * @param {string} credentials.email - User's email address.
 * @param {string} credentials.password - User's password.
 * @returns {Promise<{ token: string }>} A promise resolving with the auth token.
 * @throws {Error} Throws an error (likely Axios error) on failure.
 */
export const loginUser = async (credentials) => {
  const response = await apiClient.post('/auth/login', credentials);
  return response.data; // Contains { token: '...' }
};

/**
 * Registers a new user.
 * @param {object} credentials - User credentials.
 * @param {string} credentials.email - User's email address.
 * @param {string} credentials.password - User's password.
 * @returns {Promise<{ token: string }>} A promise resolving with the auth token (for auto-login).
 * @throws {Error} Throws an error on failure (e.g., email exists, validation error).
 */
export const registerUser = async (credentials) => {
  const response = await apiClient.post('/auth/register', credentials);
  return response.data; // Contains { token: '...' }
};

/**
 * Creates a new fitness goal for the authenticated user.
 * @param {object} goalData - Data for the new goal.
 * @param {string} goalData.title - The title of the goal.
 * @param {string} [goalData.description] - Optional description.
 * @param {'active' | 'completed'} [goalData.status] - Optional status.
 * @param {string | Date} [goalData.targetDate] - Optional target date.
 * @returns {Promise<{ goal: object }>} A promise resolving with the created goal object.
 * @throws {Error} Throws an error on failure (validation, auth, etc.).
 */
export const createGoal = async (goalData) => {
  const response = await apiClient.post('/goals', goalData);
  return response.data; // Contains { goal: { ... } }
};

/**
 * Retrieves all fitness goals for the authenticated user.
 * @returns {Promise<{ goals: object[] }>} A promise resolving with an array of goal objects.
 * @throws {Error} Throws an error on failure.
 */
export const getGoals = async () => {
  const response = await apiClient.get('/goals');
  return response.data; // Contains { goals: [ ... ] }
};

/**
 * Retrieves a specific fitness goal by its ID.
 * @param {string} id - The ID of the goal to retrieve.
 * @returns {Promise<{ goal: object }>} A promise resolving with the specific goal object.
 * @throws {Error} Throws an error if not found, not authorized, or other failure.
 */
export const getGoalById = async (id) => {
  const response = await apiClient.get(`/goals/${id}`);
  return response.data; // Contains { goal: { ... } }
};

/**
 * Updates a specific fitness goal by its ID.
 * @param {string} id - The ID of the goal to update.
 * @param {object} updateData - The fields to update.
 * @param {string} [updateData.title] - New title.
 * @param {string} [updateData.description] - New description.
 * @param {'active' | 'completed'} [updateData.status] - New status.
 * @param {string | Date} [updateData.targetDate] - New target date.
 * @returns {Promise<{ goal: object }>} A promise resolving with the updated goal object.
 * @throws {Error} Throws an error on failure (validation, not found, auth, etc.).
 */
export const updateGoal = async (id, updateData) => {
  const response = await apiClient.put(`/goals/${id}`, updateData);
  return response.data; // Contains { goal: { ... } }
};

/**
 * Deletes a specific fitness goal by its ID.
 * @param {string} id - The ID of the goal to delete.
 * @returns {Promise<void>} A promise that resolves when deletion is successful (no data returned on 204).
 * @throws {Error} Throws an error if not found, not authorized, or other failure.
 */
export const deleteGoal = async (id) => {
  await apiClient.delete(`/goals/${id}`);
  // No return needed as DELETE typically results in 204 No Content
};

/**
 * Logs a progress entry for a specific goal.
 * @param {string} goalId - The ID of the goal to log progress against.
 * @param {object} progressData - Data for the progress entry.
 * @param {string | Date} [progressData.date] - Date of progress (defaults to now on backend if omitted).
 * @param {string} [progressData.notes] - Optional notes.
 * @param {number} [progressData.value] - Optional numerical metric value.
 * @returns {Promise<{ progress: object }>} A promise resolving with the created progress log object.
 * @throws {Error} Throws an error on failure (validation, goal not found, auth, etc.).
 */
export const logProgress = async (goalId, progressData) => {
  const response = await apiClient.post(
    `/goals/${goalId}/progress`,
    progressData,
  );
  return response.data; // Contains { progress: { ... } }
};

/**
 * Retrieves all progress log entries for a specific goal.
 * @param {string} goalId - The ID of the goal whose progress to retrieve.
 * @returns {Promise<{ progressLogs: object[] }>} A promise resolving with an array of progress log objects.
 * @throws {Error} Throws an error if goal not found, not authorized, or other failure.
 */
export const getGoalProgress = async (goalId) => {
  const response = await apiClient.get(`/goals/${goalId}/progress`);
  return response.data; // Contains { progressLogs: [ ... ] }
};