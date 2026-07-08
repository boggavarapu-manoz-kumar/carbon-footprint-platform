import axios from 'axios';

// Get base URL from env or use default for development
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1/admin';

let inMemoryToken = null;

export const setAccessToken = (token) => {
  inMemoryToken = token;
};

export const getAccessToken = () => {
  return inMemoryToken;
};

export const adminAxios = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Crucial for sending HttpOnly cookies
});

// Request Interceptor: Attach Token from Memory
adminAxios.interceptors.request.use(
  (config) => {
    if (inMemoryToken && config.headers) {
      config.headers.Authorization = `Bearer ${inMemoryToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response Interceptor: Handle 401s (Unauthorized) with Cookie-based Refresh
adminAxios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 and it's not the refresh endpoint itself
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/refresh')) {
      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({resolve, reject})
        }).then(token => {
          originalRequest.headers.Authorization = 'Bearer ' + token;
          return adminAxios(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;
      
      try {
        // Attempt refresh - Browser will automatically send the HttpOnly admin_refresh_token cookie
        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, {}, { withCredentials: true });
        
        // Save new token to memory
        setAccessToken(data.access_token);
        processQueue(null, data.access_token);
        
        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
        return adminAxios(originalRequest);
        
      } catch (refreshError) {
        // Refresh failed, clear memory and redirect to login
        processQueue(refreshError, null);
        setAccessToken(null);
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    
    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      console.warn('Action unauthorized (403). Role privileges insufficient.');
      // window.location.href = '/403'; // Disabled global 403 redirect for API calls
      return Promise.reject(error);
    }
    
    return Promise.reject(error);
  }
);
