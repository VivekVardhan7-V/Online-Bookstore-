import { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [items, setItems] = useState([]);

  useEffect(() => {
    const loadCart = async () => {
      if (!user || !token) {
        const localCart = JSON.parse(localStorage.getItem('bookstore_cart') || '[]');
        setItems(localCart);
        return;
      }

      try {
        const response = await api.get('/cart');
        setItems(response.data.items || []);
      } catch (error) {
        setItems([]);
      }
    };

    loadCart();
  }, [user, token]);

  useEffect(() => {
    if (!user || !token) {
      localStorage.setItem('bookstore_cart', JSON.stringify(items));
    }
  }, [items, user, token]);

  const addToCart = async (book, quantity = 1) => {
    if (user && token) {
      const response = await api.post('/cart/items', { bookId: book._id, quantity });
      setItems(response.data.items || []);
      return response.data;
    }

    const existingItem = items.find((item) => item.book === book._id || item._id === book._id);
    if (existingItem) {
      const updated = items.map((item) =>
        item.book === book._id || item._id === book._id ? { ...item, quantity: item.quantity + quantity } : item
      );
      setItems(updated);
      return { items: updated };
    }

    const newItem = { book: book._id, title: book.title, price: book.price, quantity, image: book.image };
    const updated = [...items, newItem];
    setItems(updated);
    return { items: updated };
  };

  const updateQuantity = async (bookId, quantity) => {
    if (user && token) {
      const response = await api.patch(`/cart/items/${bookId}`, { quantity });
      setItems(response.data.items || []);
      return response.data;
    }

    const updated = items
      .map((item) => (item.book === bookId || item._id === bookId ? { ...item, quantity } : item))
      .filter((item) => item.quantity > 0);
    setItems(updated);
    return { items: updated };
  };

  const removeFromCart = async (bookId) => {
    if (user && token) {
      const response = await api.delete(`/cart/items/${bookId}`);
      setItems(response.data.items || []);
      return response.data;
    }

    const updated = items.filter((item) => item.book !== bookId && item._id !== bookId);
    setItems(updated);
    return { items: updated };
  };

  const clearCart = async () => {
    if (user && token) {
      await api.delete('/cart');
    }
    setItems([]);
  };

  const subtotal = items.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 0), 0);

  return <CartContext.Provider value={{ items, subtotal, addToCart, updateQuantity, removeFromCart, clearCart, setItems }}>{children}</CartContext.Provider>;
};

export const useCart = () => useContext(CartContext);
