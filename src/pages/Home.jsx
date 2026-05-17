import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getGames, getPopularGames } from '../api/api';
import GameCard from '../components/GameCard';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const Home = () => {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGames = async () => {
      setLoading(true);
      setError(null);
      try {
        let data;
        if (searchQuery) {
          data = await getGames(1, 20, searchQuery);
        } else {
          data = await getPopularGames(1);
        }
        setGames(data.results);
      } catch (err) {
        setError('Failed to fetch games. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, [searchQuery]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-400 mt-20 p-8 glass-card rounded-2xl">
        <h2 className="text-2xl font-bold mb-2">Oops!</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-2"
      >
        <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
          {searchQuery ? `Search Results for "${searchQuery}"` : 'Trending Masterpieces'}
        </h1>
        <p className="text-gray-400 text-lg">
          {searchQuery ? 'Explore games matching your search.' : 'Discover the highest-rated games of all time.'}
        </p>
      </motion.div>

      {games.length === 0 ? (
        <div className="text-center text-gray-400 mt-20">
          <p className="text-xl">No games found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {games.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
