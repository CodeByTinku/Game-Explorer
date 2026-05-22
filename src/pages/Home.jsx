import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getGames, getPopularGames } from '../api/api';
import GameCard from '../components/GameCard';
import GameCardSkeleton from '../components/GameCardSkeleton';
import { motion } from 'framer-motion';

const Home = () => {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Ref for the sentinel element at the bottom
  const observerRef = useRef(null);
  const sentinelRef = useRef(null);

  // Reset everything when search query changes
  useEffect(() => {
    setGames([]);
    setPage(1);
    setHasMore(true);
    setLoading(true);
    setError(null);
  }, [searchQuery]);

  // Fetch games
  useEffect(() => {
    const fetchGames = async () => {
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);

      try {
        let data;
        if (searchQuery) {
          data = await getGames(page, 20, searchQuery);
        } else {
          data = await getPopularGames(page);
        }

        const newGames = data.results || [];

        setGames((prev) => {
          if (page === 1) return newGames;
          // Prevent duplicates
          const existingIds = new Set(prev.map((g) => g.id));
          const filtered = newGames.filter((g) => !existingIds.has(g.id));
          return [...prev, ...filtered];
        });

        // Check if there are more pages
        setHasMore(!!data.next);
      } catch (err) {
        setError('Failed to fetch games. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    };

    fetchGames();
  }, [searchQuery, page]);

  // Intersection Observer for infinite scroll
  const lastGameRef = useCallback(
    (node) => {
      if (loading || loadingMore) return;

      // Disconnect previous observer
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore) {
            setPage((prev) => prev + 1);
          }
        },
        { threshold: 0.1, rootMargin: '200px' }
      );

      if (node) observerRef.current.observe(node);
    },
    [loading, loadingMore, hasMore]
  );

  // Initial loading state — full skeleton grid
  if (loading && games.length === 0) {
    return (
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-2"
        >
          <div className="h-12 w-80 rounded-xl skeleton-shimmer" />
          <div className="h-5 w-64 rounded-lg skeleton-shimmer mt-2" />
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <GameCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error && games.length === 0) {
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
        <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-theme-primary to-theme-secondary">
          {searchQuery ? `Search Results for "${searchQuery}"` : 'Trending Masterpieces'}
        </h1>
        <p className="text-theme-secondary text-lg">
          {searchQuery ? 'Explore games matching your search.' : 'Discover the highest-rated games of all time.'}
        </p>
      </motion.div>

      {games.length === 0 ? (
        <div className="text-center text-theme-secondary mt-20">
          <p className="text-xl">No games found.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {games.map((game, index) => {
              // Attach ref to the last card for infinite scroll trigger
              if (index === games.length - 1) {
                return (
                  <div ref={lastGameRef} key={game.id}>
                    <GameCard game={game} />
                  </div>
                );
              }
              return <GameCard key={game.id} game={game} />;
            })}

            {/* Skeleton cards while loading more */}
            {loadingMore &&
              Array.from({ length: 4 }).map((_, i) => (
                <GameCardSkeleton key={`skeleton-${i}`} />
              ))}
          </div>

          {/* End of results message */}
          {!hasMore && games.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-8"
            >
              <div className="inline-flex items-center gap-2 px-6 py-3 glass-card rounded-full text-theme-secondary">
                <span className="text-lg">🎮</span>
                <span className="font-medium">You've explored all the games!</span>
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
};

export default Home;
