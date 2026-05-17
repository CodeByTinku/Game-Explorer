import { motion } from 'framer-motion';
import { Star, Calendar, Monitor } from 'lucide-react';

const GameCard = ({ game }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -10, scale: 1.02 }}
      className="glass-card rounded-2xl overflow-hidden cursor-pointer flex flex-col h-full group"
    >
      <div className="relative aspect-video overflow-hidden">
        <img
          src={game.background_image || 'https://via.placeholder.com/600x400?text=No+Image'}
          alt={game.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        {game.metacritic && (
          <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-gray-600 flex items-center gap-1 font-bold text-green-400">
            <Star className="w-4 h-4 fill-green-400" />
            {game.metacritic}
          </div>
        )}
      </div>
      
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-xl font-bold mb-2 text-white line-clamp-1">{game.name}</h3>
        
        <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
          <Calendar className="w-4 h-4" />
          <span>{game.released || 'TBA'}</span>
        </div>
        
        <div className="mt-auto pt-4 border-t border-gray-700/50 flex flex-wrap gap-2">
          {game.parent_platforms?.map(({ platform }) => (
            <span key={platform.id} className="text-xs bg-gray-800/80 px-2 py-1 rounded-md text-gray-300">
              {platform.name}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default GameCard;
