import axios from 'axios';

// Create an Axios instance with base URL for the Elite Arena API
const api = axios.create({
    baseURL: 'http://localhost:5000/api', // Absolute URL for consistency with other parts of the app
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to attach auth token
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

// Response interceptor to handle global errors like 401 Unauthorized
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            // Clear token and redirect to appropriate login if unauthorized
            localStorage.removeItem('token');
            const isMasterRoute = window.location.pathname.startsWith('/master');
            const targetLogin = isMasterRoute ? '/master-login' : '/login';
            
            if (window.location.pathname !== targetLogin) {
                window.location.href = targetLogin;
            }
        }
        return Promise.reject(error);
    }
);

// Authentication API
export const authAPI = {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
    getMe: () => api.get('/auth/me'),
    updateProfile: (data) => api.put('/auth/profile', data),
};

// Tournament API
export const tournamentAPI = {
    getAll: () => api.get('/tournaments'),
    getById: (id) => api.get(`/tournaments/${id}`),
    create: (data) => api.post('/tournaments', data),
    update: (id, data) => api.put(`/tournaments/${id}`, data),
    delete: (id) => api.delete(`/tournaments/${id}`),
    join: (id) => api.post(`/tournaments/${id}/join`),
    updateMatchResult: (matchId, data) => api.put(`/tournaments/match/${matchId}`, data),
    getBracket: (game) => api.get(`/tournaments/bracket${game ? `?game=${encodeURIComponent(game)}` : ''}`),
    getEvents: (game) => api.get(`/tournaments/events${game ? `?game=${encodeURIComponent(game)}` : ''}`),
};

// Request API
export const requestAPI = {
    create: (data) => api.post('/requests', data),
    getAll: () => api.get('/requests'),
    getUserRequests: () => api.get('/requests/user'),
    update: (id, data) => api.put(`/requests/${id}`, data),
};

// Notification API
export const notificationAPI = {
    getAll: () => api.get('/notifications'),
    markRead: (id) => api.put(`/notifications/${id}/read`),
};

// Support API
export const supportAPI = {
    sendMessage: (data) => api.post('/support', data),
    getMessages: (userId) => api.get(`/support/${userId || ''}`),
    getConversations: () => api.get('/support/conversations'),
};

export const userAPI = {
    getAll: () => api.get('/users'),
    update: (id, data) => api.put(`/users/${id}`, data),
    delete: (id) => api.delete(`/users/${id}`),
};

export default api;
