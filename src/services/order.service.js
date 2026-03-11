import api from './api';

export const orderService = {
    // Customer places an order
    createOrder: async (orderData) => {
        const response = await api.post('/orders', orderData);
        return response.data;
    },

    // Get orders (context-dependent based on role/token)
    // If CUSTOMER -> returns their orders. If RESTAURANT_OWNER -> returns their restaurant's orders
    getOrders: async (params) => {
        const response = await api.get('/orders', { params });
        return response.data;
    },

    getOrderById: async (id) => {
        const response = await api.get(`/orders/${id}`);
        return response.data;
    },

    // Update status (e.g. ACCEPTED, PREPARING, READY, DELIVERED)
    updateOrderStatus: async (id, status) => {
        const response = await api.patch(`/orders/${id}/status`, { status });
        return response.data;
    },

    cancelOrder: async (id) => {
        const response = await api.patch(`/orders/${id}/cancel`);
        return response.data;
    }
};
