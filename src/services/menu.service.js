import api from './api';

export const menuService = {
    // Public
    getMenuByRestaurantId: async (restaurantId) => {
        const response = await api.get(`/restaurants/${restaurantId}/menu`);
        // Assuming backend returns an array of categories with items populated
        return response.data;
    },

    // Protected (RESTAURANT_OWNER or ADMIN)
    createCategory: async (restaurantId, categoryData) => {
        const response = await api.post(`/restaurants/${restaurantId}/menu/categories`, categoryData);
        return response.data;
    },

    createMenuItem: async (restaurantId, itemData) => {
        const response = await api.post(`/restaurants/${restaurantId}/menu/items`, itemData);
        return response.data;
    },

    updateMenuItemStock: async (restaurantId, itemId, stockParams) => {
        const response = await api.patch(`/restaurants/${restaurantId}/menu/items/${itemId}/stock`, stockParams);
        return response.data;
    },

    updateMenuItem: async (restaurantId, itemId, updateData) => {
        const response = await api.put(`/restaurants/${restaurantId}/menu/items/${itemId}`, updateData);
        return response.data;
    },

    deleteMenuItem: async (restaurantId, itemId) => {
        const response = await api.delete(`/restaurants/${restaurantId}/menu/items/${itemId}`);
        return response.data;
    }
};
