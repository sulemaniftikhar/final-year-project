import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const useCart = () => {
    return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState(() => {
        // Try to load from local storage
        const saved = localStorage.getItem('orderiq_cart');
        return saved ? JSON.parse(saved) : [];
    });

    const [restaurant, setRestaurant] = useState(() => {
        const saved = localStorage.getItem('orderiq_cart_restaurant');
        return saved ? JSON.parse(saved) : null;
    });

    useEffect(() => {
        localStorage.setItem('orderiq_cart', JSON.stringify(cartItems));
        localStorage.setItem('orderiq_cart_restaurant', JSON.stringify(restaurant));
    }, [cartItems, restaurant]);

    const addToCart = (item, currentRestaurant) => {
        // Check if adding explicitly from a different restaurant
        if (restaurant && restaurant.id !== currentRestaurant.id && cartItems.length > 0) {
            if (!window.confirm(`Start a new basket? Your previous textCart from ${restaurant.name} will be cleared.`)) {
                return;
            }
            clearCart();
        }

        setRestaurant(currentRestaurant);

        setCartItems(prev => {
            const existing = prev.find(i => i.id === item.id);
            if (existing) {
                return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            toast.success(`Added ${item.name} to cart`);
            return [...prev, { ...item, quantity: 1 }];
        });
    };

    const removeFromCart = (itemId) => {
        setCartItems(prev => prev.filter(i => i.id !== itemId));
    };

    const updateQuantity = (itemId, delta) => {
        setCartItems(prev => {
            return prev.map(item => {
                if (item.id === itemId) {
                    const newQty = item.quantity + delta;
                    if (newQty <= 0) return null; // Logic to remove if 0 handled by component usually, but fail-safe here
                    return { ...item, quantity: newQty };
                }
                return item;
            }).filter(Boolean);
        });
    };

    const clearCart = () => {
        setCartItems([]);
        setRestaurant(null);
    };

    const cartTotal = cartItems.reduce((acc, item) => {
        // Assuming price is string "PKR 350" -> parse it
        const price = parseInt(item.price.replace(/[^0-9]/g, '')) || 0;
        return acc + (price * item.quantity);
    }, 0);

    const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <CartContext.Provider value={{
            cartItems,
            restaurant,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            cartTotal,
            cartCount
        }}>
            {children}
        </CartContext.Provider>
    );
};
