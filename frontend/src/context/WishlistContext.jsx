import React, { createContext, useContext, useState, useEffect } from 'react';
import { wishlistAPI } from '../services/api';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const [wishlistIds, setWishlistIds] = useState(() => {
    try {
      const saved = localStorage.getItem('mm_guest_wishlist');
      if (!saved) return new Set();
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) return new Set();
      return new Set(parsed);
    } catch (_) { return new Set(); }
  });

  useEffect(() => {
    if (!user) return;
    wishlistAPI.get().then(data => {
      setWishlistIds(new Set((data.items || []).map(i => i.product_id || i.id)));
    }).catch(() => {});
  }, [user]);

  const toggle = async (productId) => {
    const isIn = wishlistIds.has(productId);
    if (user) {
      if (isIn) await wishlistAPI.remove(productId);
      else await wishlistAPI.add(productId);
    }
    setWishlistIds(prev => {
      const updated = new Set(prev);
      if (isIn) updated.delete(productId);
      else updated.add(productId);
      localStorage.setItem('mm_guest_wishlist', JSON.stringify(Array.from(updated)));
      return updated;
    });
    return !isIn;
  };

  const isWishlisted = (productId) => wishlistIds.has(productId);

  return (
    <WishlistContext.Provider value={{ toggle, isWishlisted, wishlistCount: wishlistIds.size, wishlistIds }}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => useContext(WishlistContext);
