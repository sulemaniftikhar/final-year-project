import axios from 'axios';
import { auth } from '../config/firebase';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add the Firebase token to every request
api.interceptors.request.use(
    async (config) => {
        // Only attempt to attach token if user is signed in
        if (auth.currentUser) {
            try {
                // Get fresh token
                const token = await auth.currentUser.getIdToken();
                config.headers.Authorization = `Bearer ${token}`;
            } catch (error) {
                console.error("Error getting Firebase token:", error);
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Optional response interceptor for global error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Unauthorized - might want to trigger a logout or token refresh if handled manually
            console.error("Unauthorized request. Token might be invalid or expired.");
        }
        return Promise.reject(error);
    }
);

export default api;
