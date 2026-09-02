import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartAPI, productAPI } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('svs_guest_cart');
      if (!saved) return { items: [], subtotal: 0, item_count: 0 };
      const parsed = JSON.parse(saved);
      if (!parsed || !Array.isArray(parsed.items)) return { items: [], subtotal: 0, item_count: 0 };
      return parsed;
    } catch (_) {
      return { items: [], subtotal: 0, item_count: 0 };
    }
  });
  const [loading, setLoading] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  const saveCart = (newItems) => {
    const subtotal = newItems.reduce((sum, i) => sum + (i.unit_price * i.quantity), 0);
    const item_count = newItems.reduce((sum, i) => sum + i.quantity, 0);
    const updated = { items: newItems, subtotal, item_count };
    setCart(updated);
    localStorage.setItem('svs_guest_cart', JSON.stringify(updated));
  };

  const fetchCart = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await cartAPI.get();
      if (data.cart?.items) setCart(data.cart);
    } catch (_) {}
    finally { setLoading(false); }
  }, [user]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const addToCart = async (productId, weightId, quantity = 1, productInfo = null) => {
    if (user) {
      try {
        const data = await cartAPI.add({ product_id: productId, weight_id: weightId, quantity });
        if (data?.cart) setCart(data.cart);
        return data;
      } catch (_) {}
    }

    try {
      let prod = productInfo;
      if (!prod) {
        const res = await productAPI.getById(productId);
        prod = res?.product;
      }
      if (!prod) return;

      const weights = prod.weights || [];
      const weightObj = weights.find(w => w.id === weightId) || weights[0];
      const unitPrice = weightObj ? weightObj.price : prod.base_price;

      const existingIndex = cart.items.findIndex(i => i.product_id === productId && i.weight_id === weightId);
      let newItems = [...cart.items];
      if (existingIndex > -1) {
        newItems[existingIndex] = {
          ...newItems[existingIndex],
          quantity: newItems[existingIndex].quantity + quantity,
          total_price: (newItems[existingIndex].quantity + quantity) * newItems[existingIndex].unit_price
        };
      } else {
        newItems.push({
          id: Date.now(),
          product_id: productId,
          weight_id: weightId,
          name: prod.name,
          image_url: prod.image_url,
          is_pure_veg: prod.is_pure_veg,
          weight: weightObj ? weightObj.weight : 'Standard',
          unit_price: unitPrice,
          quantity,
          total_price: unitPrice * quantity
        });
      }
      saveCart(newItems);
    } catch (err) {
      console.error('addToCart error:', err);
    }
  };

  const updateItem = async (itemId, quantity) => {
    if (user) {
      try {
        const data = await cartAPI.update(itemId, { quantity });
        if (data?.cart) setCart(data.cart);
        return;
      } catch (_) {}
    }
    let newItems = cart.items.map(i => i.id === itemId ? { ...i, quantity, total_price: i.unit_price * quantity } : i);
    if (quantity <= 0) newItems = newItems.filter(i => i.id !== itemId);
    saveCart(newItems);
  };

  const removeItem = async (itemId) => {
    if (user) {
      try {
        const data = await cartAPI.remove(itemId);
        if (data?.cart) setCart(data.cart);
        return;
      } catch (_) {}
    }
    saveCart(cart.items.filter(i => i.id !== itemId));
  };

  const clearCart = async () => {
    if (user) {
      try { await cartAPI.clear(); } catch (_) {}
    }
    saveCart([]);
  };

  const openCart = () => setCartOpen(true);
  const closeCart = () => setCartOpen(false);

  return (
    <CartContext.Provider value={{
      cart, loading, cartOpen,
      addToCart, updateItem, removeItem, clearCart,
      openCart, closeCart, fetchCart
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
