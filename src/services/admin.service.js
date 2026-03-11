import api from './api';

export const adminService = {
    // Dashboard stats
    getDashboardStats: async () => {
        const response = await api.get('/admin/dashboard');
        return response.data;
    },

    // Restaurants
    getAllRestaurants: async (params = {}) => {
        const response = await api.get('/admin/restaurants', { params });
        return response.data;
    },

    updateRestaurantStatus: async (restaurantId, status) => {
        const response = await api.patch(`/admin/restaurants/${restaurantId}/status`, { status });
        return response.data;
    },

    // Users
    getAllUsers: async (params = {}) => {
        const response = await api.get('/admin/users', { params });
        return response.data;
    },

    updateUserStatus: async (userId, isActive) => {
        const response = await api.patch(`/admin/users/${userId}/status`, { isActive });
        return response.data;
    },

    // Orders
    getAllOrders: async (params = {}) => {
        const response = await api.get('/admin/orders', { params });
        return response.data;
    },
};
