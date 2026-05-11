import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://novoriqrevenueosapi.onrender.com/api',
    timeout: 40000, 
});

api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('novoriq_token');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
}, (error) => {
    if (process.env.NODE_ENV !== 'production') {
        console.error("[API Request Error]:", error);
    }
    return Promise.reject(error);
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (process.env.NODE_ENV !== 'production') {
            console.error("[API Response Error]:", error.message);
        }
        return Promise.reject(error);
    }
);

export default api;
