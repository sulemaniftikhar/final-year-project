import api from './api';

export const teamService = {
    // Get all team members for a restaurant
    getTeamMembers: async (restaurantId) => {
        const response = await api.get(`/restaurants/${restaurantId}/team`);
        return response.data;
    },

    // Invite a team member by email & role
    inviteMember: async (restaurantId, email, role) => {
        const response = await api.post(`/restaurants/${restaurantId}/team/invite`, { email, role });
        return response.data;
    },

    // Update a member's role or status
    updateMember: async (restaurantId, memberId, updates) => {
        const response = await api.patch(`/restaurants/${restaurantId}/team/${memberId}`, updates);
        return response.data;
    },

    // Remove a team member
    removeMember: async (restaurantId, memberId) => {
        const response = await api.delete(`/restaurants/${restaurantId}/team/${memberId}`);
        return response.data;
    },
};
