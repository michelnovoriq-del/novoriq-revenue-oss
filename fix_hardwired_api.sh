#!/bin/bash

echo "[🔧] Hardwiring Frontend to Backend Engine..."

mkdir -p src/lib

# Force the API Interceptor to strictly use port 3000 (Backend)
cat << 'CODE' > src/lib/api.ts
import axios from 'axios';

const api = axios.create({
    // Hardwiring directly to port 3000 to bypass Next.js local environment caches
    baseURL: 'http://localhost:3000/api',
});

api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('novoriq_token');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    // Logs the exact destination to your browser console for debugging
    console.log(`[🌐] Outgoing API Request: ${config.baseURL}${config.url}`);
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;
CODE

echo "[✅] Interceptor hardwired to http://localhost:3000/api."
echo "[🚀] Restarting Next.js frontend..."
npm run dev
