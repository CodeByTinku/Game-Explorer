import { motion } from 'framer-motion';

const GameCardSkeleton = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass-card rounded-2xl overflow-hidden flex flex-col h-full"
    >
      {/* Image Skeleton */}
      <div className="relative aspect-video overflow-hidden">
        <div className="w-full h-full skeleton-shimmer" />
        {/* Metacritic badge skeleton */}
        <div className="absolute top-4 right-4 w-16 h-7 rounded-full skeleton-shimmer" />
        {/* Heart button skeleton */}
        <div className="absolute top-4 left-4 w-9 h-9 rounded-full skeleton-shimmer" />
      </div>

      {/* Content Skeleton */}
      <div className="p-5 flex flex-col flex-grow">
        {/* Title */}
        <div className="h-6 w-3/4 rounded-lg skeleton-shimmer mb-3" />
        
        {/* Date */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-4 h-4 rounded skeleton-shimmer" />
          <div className="h-4 w-24 rounded skeleton-shimmer" />
        </div>

        {/* Platform tags */}
        <div className="mt-auto pt-4 border-t border-theme-border flex flex-wrap gap-2">
          <div className="h-6 w-14 rounded-md skeleton-shimmer" />
          <div className="h-6 w-10 rounded-md skeleton-shimmer" />
          <div className="h-6 w-16 rounded-md skeleton-shimmer" />
        </div>
      </div>
    </motion.div>
  );
};

export default GameCardSkeleton;
