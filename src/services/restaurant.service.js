import api from './api';

export const restaurantService = {
    // Public routes
    getAllRestaurants: async (params = {}) => {
        const response = await api.get('/restaurants', { params });
        return response.data;
    },

    getRestaurantById: async (id) => {
        const response = await api.get(`/restaurants/${id}`);
        return response.data;
    },

    // Protected routes (require RESTAURANT_OWNER or ADMIN role)
    createRestaurant: async (restaurantData) => {
        const response = await api.post('/restaurants', restaurantData);
        return response.data;
    },

    updateRestaurant: async (id, restaurantData) => {
        const response = await api.put(`/restaurants/${id}`, restaurantData);
        return response.data;
    },

    // Note: /api/restaurants/:restaurantId/menu and /team are re-routed in backend,
    // we can handle them in separate service files or here.

    // Owner utilities
    getMyRestaurants: async () => {
        const response = await api.get('/restaurants/mine');
        return response.data;
    },
};
