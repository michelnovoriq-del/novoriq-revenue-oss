import axios from 'axios';

// Safely handle the base URL whether in dev or production
// We remove the trailing '/api' from here because we will ensure 
// the environment variable holds the full path (e.g., http://localhost:3000/api)
const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
    timeout: 15000, // Hardened: prevent dead backend requests from hanging the onboarding UI indefinitely.
});

api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('novoriq_token');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    
    // Hardened: removed browser console request logging so production users do not expose API paths/timing.
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;
