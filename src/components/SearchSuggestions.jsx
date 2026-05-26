import { motion, AnimatePresence } from 'framer-motion';
import { Search, Flame, Star, Sparkles, Gamepad2 } from 'lucide-react';

const SuggestionSkeleton = () => (
  <div className="flex items-center gap-3 p-2.5 rounded-xl border border-transparent">
    <div className="w-14 h-10 rounded-lg skeleton-shimmer flex-shrink-0" />
    <div className="flex-grow space-y-2">
      <div className="h-4 w-1/2 rounded skeleton-shimmer" />
      <div className="h-3 w-1/3 rounded skeleton-shimmer" />
    </div>
    <div className="w-8 h-5 rounded-full skeleton-shimmer flex-shrink-0" />
  </div>
);

const SearchSuggestions = ({
  results = [],
  selectedIndex = -1,
  onSelect,
  loading = false,
  isSearching = false,
  isOpen = false,
}) => {
  if (!isOpen) return null;

  // Decide title and icon based on whether the user is searching or viewing trending recommendations
  const headerTitle = isSearching ? 'Search Recommendations' : 'Trending Games Right Now';
  const HeaderIcon = isSearching ? Sparkles : Flame;
  const iconColor = isSearching ? 'text-blue-400' : 'text-pink-500';
  const glowBorder = isSearching ? 'group-hover:border-blue-500/30' : 'group-hover:border-pink-500/30';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.98 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="absolute top-full left-0 right-0 mt-2 z-50 glass-card rounded-2xl shadow-2xl p-2.5 max-h-[420px] overflow-y-auto w-full select-none"
        style={{
          boxShadow: isSearching 
            ? '0 20px 25px -5px rgba(59, 130, 246, 0.1), 0 10px 10px -5px rgba(59, 130, 246, 0.04)' 
            : '0 20px 25px -5px rgba(236, 72, 153, 0.1), 0 10px 10px -5px rgba(236, 72, 153, 0.04)'
        }}
      >
        {/* Header Title Section */}
        <div className="flex items-center gap-2 px-3 py-2 border-b border-theme-border/50 mb-2">
          <HeaderIcon className={`w-4 h-4 ${iconColor} animate-pulse`} />
          <span className="text-xs font-bold uppercase tracking-wider text-theme-secondary">
            {headerTitle}
          </span>
        </div>

        {/* Suggestions List Container */}
        <div className="space-y-1">
          {loading ? (
            // Render 5 shimmering skeletons during API calls
            Array.from({ length: 5 }).map((_, i) => (
              <SuggestionSkeleton key={`skeleton-${i}`} />
            ))
          ) : results.length === 0 ? (
            // Empty State
            <div className="flex flex-col items-center justify-center py-6 text-center text-theme-secondary">
              <Gamepad2 className="w-8 h-8 opacity-40 mb-2 text-theme-secondary/60" />
              <p className="text-sm font-medium">No game suggestions found</p>
              {isSearching && <p className="text-xs mt-0.5 opacity-70">Try searching with a different name</p>}
            </div>
          ) : (
            // Render recommendations list
            results.map((game, index) => {
              const isSelected = selectedIndex === index;
              const hasMetacritic = !!game.metacritic;
              const metaColor = game.metacritic >= 75 
                ? 'text-green-400 bg-green-500/10 border-green-500/20' 
                : game.metacritic >= 50 
                ? 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' 
                : 'text-red-400 bg-red-500/10 border-red-500/20';

              return (
                <div
                  key={game.id}
                  onClick={() => onSelect(game)}
                  onMouseEnter={() => {
                    // Update index if needed (optional)
                  }}
                  className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all duration-200 border border-transparent group ${
                    isSelected 
                      ? 'bg-theme-hover border-theme-border translate-x-1 shadow-md' 
                      : 'hover:bg-theme-hover/60 hover:translate-x-1'
                  }`}
                >
                  {/* Game Thumbnail */}
                  <div className={`relative w-14 h-10 rounded-lg overflow-hidden flex-shrink-0 border border-theme-border/60 ${glowBorder} transition-colors duration-300`}>
                    <img
                      src={game.background_image || 'https://via.placeholder.com/150x100?text=No+Image'}
                      alt={game.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>

                  {/* Game details: Title, release year and platforms */}
                  <div className="flex-grow min-w-0">
                    <h4 className={`text-sm font-bold text-theme-primary truncate transition-colors duration-200 ${
                      isSelected ? 'text-accent' : 'group-hover:text-accent'
                    }`}>
                      {game.name}
                    </h4>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-theme-secondary mt-0.5">
                      <span>{game.released ? game.released.split('-')[0] : 'TBA'}</span>
                      {game.parent_platforms && game.parent_platforms.length > 0 && (
                        <>
                          <span className="opacity-40">•</span>
                          <span className="truncate max-w-[150px] sm:max-w-none opacity-80">
                            {game.parent_platforms.slice(0, 3).map(p => p.platform.name).join(', ')}
                            {game.parent_platforms.length > 3 && '...'}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Metacritic Badge */}
                  {hasMetacritic && (
                    <div className={`text-xs px-2 py-0.5 rounded-full font-extrabold border ${metaColor} flex items-center gap-0.5 flex-shrink-0 shadow-sm`}>
                      <Star className="w-3 h-3 fill-current" />
                      {game.metacritic}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SearchSuggestions;
