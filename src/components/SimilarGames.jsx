import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Calendar, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { getGameSeries, getSimilarGamesByGenre } from '../api/api';

const SimilarGames = ({ gameId, genres }) => {
  const [similarGames, setSimilarGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState(''); // 'series' or 'genre'
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    const fetchSimilarGames = async () => {
      setLoading(true);
      setSimilarGames([]);
      setSource('');

      try {
        // First try: Get games from the same series
        const seriesData = await getGameSeries(gameId).catch(() => ({ results: [] }));

        if (seriesData.results && seriesData.results.length > 0) {
          setSimilarGames(seriesData.results.slice(0, 8));
          setSource('series');
        } else if (genres && genres.length > 0) {
          // Fallback: Get games by same genres
          const genreSlugs = genres.map((g) => g.slug).join(',');
          const genreData = await getSimilarGamesByGenre(genreSlugs, gameId);
          setSimilarGames((genreData.results || []).slice(0, 8));
          setSource('genre');
        }
      } catch (err) {
        console.error('Failed to fetch similar games:', err);
      } finally {
        setLoading(false);
      }
    };

    if (gameId) {
      fetchSimilarGames();
    }
  }, [gameId, genres]);

  const scroll = (direction) => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const scrollAmount = 320;
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  // Loading skeleton
  if (loading) {
    return (
      <section className="glass-card p-6 md:p-8 rounded-3xl mt-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-7 w-7 rounded skeleton-shimmer" />
          <div className="h-8 w-56 rounded-xl skeleton-shimmer" />
        </div>
        <div className="flex gap-5 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="min-w-[280px] flex-shrink-0 rounded-2xl overflow-hidden glass-card">
              <div className="aspect-video skeleton-shimmer" />
              <div className="p-4 space-y-3">
                <div className="h-5 w-3/4 rounded skeleton-shimmer" />
                <div className="h-4 w-1/2 rounded skeleton-shimmer" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  // Don't render if no similar games found
  if (similarGames.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass-card p-6 md:p-8 rounded-3xl mt-8"
    >
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-amber-400" />
          <div>
            <h2 className="text-2xl font-bold text-theme-primary">
              {source === 'series' ? 'From the Same Series' : 'You Might Also Like'}
            </h2>
            <p className="text-sm text-theme-secondary mt-0.5">
              {source === 'series'
                ? 'Other games in this franchise'
                : 'Similar games based on genre'}
            </p>
          </div>
        </div>

        {/* Scroll Arrows */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={() => scroll('left')}
            className="p-2 rounded-full bg-theme-bg/60 border border-theme-border text-theme-secondary hover:text-theme-primary hover:bg-theme-hover transition-all"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-2 rounded-full bg-theme-bg/60 border border-theme-border text-theme-secondary hover:text-theme-primary hover:bg-theme-hover transition-all"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Horizontal Scroll Carousel */}
      <div
        ref={scrollContainerRef}
        className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <style>{`div::-webkit-scrollbar { display: none; }`}</style>

        {similarGames.map((game, index) => (
          <motion.div
            key={game.id}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: index * 0.08 }}
            className="min-w-[280px] max-w-[280px] flex-shrink-0 snap-start"
          >
            <Link to={`/game/${game.id}`} className="block h-full">
              <div className="group rounded-2xl overflow-hidden border border-theme-border bg-theme-card hover:border-accent/40 transition-all duration-300 h-full flex flex-col">
                {/* Game Image */}
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={game.background_image || 'https://via.placeholder.com/600x400?text=No+Image'}
                    alt={game.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Metacritic Badge */}
                  {game.metacritic && (
                    <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-green-400 border border-green-500/30">
                      <Star className="w-3 h-3 fill-green-400" />
                      {game.metacritic}
                    </div>
                  )}
                </div>

                {/* Game Info */}
                <div className="p-4 flex flex-col flex-grow">
                  <h3 className="font-bold text-theme-primary text-sm line-clamp-1 group-hover:text-accent transition-colors">
                    {game.name}
                  </h3>

                  <div className="flex items-center gap-1.5 mt-2 text-xs text-theme-secondary">
                    <Calendar className="w-3 h-3" />
                    <span>{game.released || 'TBA'}</span>
                  </div>

                  {/* Genre Tags */}
                  {game.genres && game.genres.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {game.genres.slice(0, 2).map((genre) => (
                        <span
                          key={genre.id}
                          className="text-[10px] bg-accent/10 text-accent border border-accent/20 px-2 py-0.5 rounded-md"
                        >
                          {genre.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
};

export default SimilarGames;
