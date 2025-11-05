import axios from 'axios';

const api = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL || '/api',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000,
});

// Add request interceptor
api.interceptors.request.use(
    (config) => {
        console.log('Making request to:', config.url);
        return config;
    },
    (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

// Add response interceptor
api.interceptors.response.use(
    (response) => {
        console.log('Response received:', response.status, response.config.url);
        return response;
    },
    (error) => {
        console.error('Response error:', error.response?.status, error.message);
        if (error.response) {
            // Server responded with error status
            console.error('Error data:', error.response.data);
        } else if (error.request) {
            // Request was made but no response received
            console.error('No response received:', error.request);
        } else {
            // Something else happened
            console.error('Error:', error.message);
        }
        return Promise.reject(error);
    }
);

export default api;