import api from './api';

export const userService = {
    // Profile (General)
    getProfile: async () => {
        const response = await api.get('/users/profile');
        return response.data;
    },

    updateProfile: async (profileData) => {
        const response = await api.put('/users/profile', profileData);
        return response.data;
    },

    // Addresses
    getAddresses: async () => {
        const response = await api.get('/users/addresses');
        return response.data;
    },

    addAddress: async (addressData) => {
        const response = await api.post('/users/addresses', addressData);
        return response.data;
    },

    updateAddress: async (id, addressData) => {
        const response = await api.put(`/users/addresses/${id}`, addressData);
        return response.data;
    },

    deleteAddress: async (id) => {
        const response = await api.delete(`/users/addresses/${id}`);
        return response.data;
    },

    // Favorites
    getFavorites: async () => {
        const response = await api.get('/users/favorites');
        return response.data;
    },

    addFavorite: async (restaurantId) => {
        const response = await api.post(`/users/favorites/${restaurantId}`);
        return response.data;
    },

    // Rewards
    getRewards: async () => {
        const response = await api.get('/users/rewards');
        return response.data;
    }
};
