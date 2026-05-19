import { useState, useEffect } from 'react';

export const useWishlist = () => {
  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem('game-explorer-wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('game-explorer-wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const addToWishlist = (game) => {
    setWishlist((prev) => {
      if (!prev.some((g) => g.id === game.id)) {
        return [...prev, game];
      }
      return prev;
    });
  };

  const removeFromWishlist = (gameId) => {
    setWishlist((prev) => prev.filter((g) => g.id !== gameId));
  };

  const isInWishlist = (gameId) => {
    return wishlist.some((g) => g.id === gameId);
  };

  const toggleWishlist = (game) => {
    if (isInWishlist(game.id)) {
      removeFromWishlist(game.id);
    } else {
      addToWishlist(game);
    }
  };

  return { wishlist, addToWishlist, removeFromWishlist, isInWishlist, toggleWishlist };
};
