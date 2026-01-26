import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add token to requests if it exists
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Handle token expiration and print messages
api.interceptors.response.use(
    (response) => {
        if (response.data && response.data.message) {
            console.log(`API SUCCESS [${response.config.url}]:`, response.data.message);
        }
        return response;
    },
    (error) => {
        if (error.response?.data?.message) {
            console.error(`API ERROR [${error.config.url}]:`, error.response.data.message);
        }
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
