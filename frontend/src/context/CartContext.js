import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';
import api from '../utils/axios';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useContext(AuthContext);

  // Load cart from server when user logs in
  useEffect(() => {
    if (user) {
      loadCart();
    } else {
      setCart([]);
    }
  }, [user]);

  const loadCart = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const response = await api.get('/cart');
      setCart(response.data);
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (recipe, quantity = 1) => {
    if (!user) {
      alert('Please login to add items to cart');
      return false;
    }

    try {
      const response = await api.post('/cart/add', { recipe_id: recipe.id, quantity });
      
      if (response.data.success !== false) {
        await loadCart(); // Reload cart from server
        return true;
      } else {
        alert(response.data.message || 'Failed to add item to cart');
        return false;
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to add item to cart';
      alert(errorMessage);
      return false;
    }
  };

  const updateQuantity = async (cartItemId, quantity) => {
    if (!user) return;

    try {
      if (quantity <= 0) {
        await api.delete(`/cart/remove/${cartItemId}`);
      } else {
        await api.put(`/cart/update/${cartItemId}`, { quantity });
      }
      await loadCart();
    } catch (error) {
      console.error('Error updating cart:', error);
    }
  };

  const removeFromCart = async (cartItemId) => {
    if (!user) return;

    try {
      await api.delete(`/cart/remove/${cartItemId}`);
      await loadCart();
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const clearCart = async () => {
    if (!user) return;

    try {
      await api.delete('/cart/clear');
      await loadCart();
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (parseFloat(item.price) * item.quantity), 0);
  };

  const getCartCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        getTotalPrice,
        getCartCount,
        loadCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

