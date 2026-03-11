import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '../auth/AuthContext';
import { restaurantService } from '../../services/restaurant.service';

const RestaurantContext = createContext(null);

export const useRestaurant = () => {
    const context = useContext(RestaurantContext);
    if (!context) {
        throw new Error('useRestaurant must be used within a RestaurantProvider');
    }
    return context;
};

export const RestaurantProvider = ({ children }) => {
    const { user, profile } = useAuth();
    const [restaurant, setRestaurant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchRestaurant = useCallback(async () => {
        if (!profile || profile.role !== 'RESTAURANT_OWNER') {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            // Fetch the owner's restaurants
            const response = await restaurantService.getMyRestaurants();
            if (response && response.data && response.data.length > 0) {
                setRestaurant(response.data[0]);
                // Store the ID in localStorage so standalone pages like MenuManagement can use it easily without context refactoring
                localStorage.setItem('restaurantId', response.data[0].id);
            } else {
                setRestaurant(null);
                localStorage.removeItem('restaurantId');
            }
        } catch (err) {
            console.error('Failed to load restaurant context', err);
            setError(err);
        } finally {
            setLoading(false);
        }
    }, [profile]);

    useEffect(() => {
        fetchRestaurant();
    }, [fetchRestaurant]);

    const value = {
        restaurant,
        loading,
        error,
        refetch: fetchRestaurant,
    };

    return (
        <RestaurantContext.Provider value={value}>
            {children}
        </RestaurantContext.Provider>
    );
};
