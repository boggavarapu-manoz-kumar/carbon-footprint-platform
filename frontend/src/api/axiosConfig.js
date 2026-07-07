import axios from 'axios';

const hostname = window.location.hostname;
const baseURL = import.meta.env.VITE_API_URL || `http://${hostname}:8081/api`;

const axiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error("Axios request error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401s
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Do not intercept 401s for authentication routes, let the component handle the error
    if (originalRequest.url?.includes('/auth/authenticate') || originalRequest.url?.includes('/auth/register')) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          // Prevent infinite loop by not using axiosInstance for the refresh call
          const response = await axios.post(`${baseURL}/v1/auth/refresh-token`, { refreshToken });
          const newAccessToken = response.data?.data?.accessToken;
          const newRefreshToken = response.data?.data?.refreshToken;
          
          if (newAccessToken) {
            localStorage.setItem('token', newAccessToken);
            originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
            if (newRefreshToken) {
              localStorage.setItem('refreshToken', newRefreshToken);
            }
            return axiosInstance(originalRequest);
          }
        }
        // If we reach here, there's no valid refresh token or the refresh response didn't contain a new token
        throw new Error('No refresh token available');
      } catch (refreshError) {
        // If refresh fails or no token, clear tokens and force login
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
