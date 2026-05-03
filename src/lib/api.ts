import axios from 'axios';

const api = axios.create({
    // [PATCH] Hardcoding the Render URL as the fallback completely eliminates the Localhost Mixed-Content block.
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
    console.error("[Axios Request Protocol Failure]:", error);
    return Promise.reject(error);
});

// [NEW TRACER PATCH] This catches silent network drops, CORS blocks, or timeout deaths
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error("[Axios Response Terminal Error]:", error.message);
        return Promise.reject(error);
    }
);

export default api;