import { useWishlist } from '../hooks/useWishlist';
import GameCard from '../components/GameCard';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const Wishlist = () => {
  const { wishlist } = useWishlist();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-8 pb-10"
    >
      <div className="flex items-center gap-3 mb-8">
        <Heart className="w-8 h-8 text-pink-500 fill-pink-500" />
        <h1 className="text-3xl md:text-4xl font-extrabold text-theme-primary">My Library</h1>
      </div>

      {wishlist.length === 0 ? (
        <div className="text-center py-20 glass-card rounded-2xl">
          <Heart className="w-16 h-16 text-theme-secondary mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2 text-theme-primary">Your wishlist is empty</h2>
          <p className="text-theme-secondary mb-6">Start exploring games and add them to your library!</p>
          <Link to="/" className="bg-accent hover:bg-accent-hover text-white px-6 py-3 rounded-xl font-medium transition-colors">
            Discover Games
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlist.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default Wishlist;
