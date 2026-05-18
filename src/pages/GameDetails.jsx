import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getGameDetails } from '../api/api';
import { motion } from 'framer-motion';
import { ArrowLeft, Star, Calendar, Monitor, Globe, Code, Loader2 } from 'lucide-react';

const GameDetails = () => {
  const { id } = useParams();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getGameDetails(id);
        setGame(data);
      } catch (err) {
        setError('Failed to fetch game details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="text-center text-red-400 mt-20 p-8 glass-card rounded-2xl">
        <h2 className="text-2xl font-bold mb-2">Oops!</h2>
        <p>{error || 'Game not found.'}</p>
        <Link to="/" className="inline-block mt-4 text-blue-400 hover:text-blue-300">
          &larr; Back to Home
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-8 pb-10"
    >
      <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Discover
      </Link>

      <div className="relative h-[40vh] md:h-[60vh] rounded-3xl overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/60 to-transparent z-10" />
        <img 
          src={game.background_image || 'https://via.placeholder.com/1920x1080?text=No+Image'} 
          alt={game.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-0 left-0 p-6 md:p-10 z-20 w-full">
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-4xl md:text-6xl font-extrabold text-white mb-4 drop-shadow-lg"
          >
            {game.name}
          </motion.h1>
          <div className="flex flex-wrap items-center gap-4 text-sm md:text-base">
            {game.metacritic && (
              <span className="flex items-center gap-1 bg-green-500/20 text-green-400 px-3 py-1.5 rounded-full border border-green-500/30 font-bold">
                <Star className="w-4 h-4 fill-green-400" /> {game.metacritic}
              </span>
            )}
            <span className="flex items-center gap-1 text-gray-300">
              <Calendar className="w-4 h-4" /> {game.released || 'TBA'}
            </span>
            {game.playtime > 0 && (
              <span className="flex items-center gap-1 text-gray-300">
                <Monitor className="w-4 h-4" /> {game.playtime} hrs avg
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <section className="glass-card p-6 md:p-8 rounded-3xl">
            <h2 className="text-2xl font-bold mb-4 text-white">About</h2>
            <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed space-y-4">
              {game.description_raw ? (
                 <p className="whitespace-pre-wrap">{game.description_raw}</p>
              ) : (
                <div dangerouslySetInnerHTML={{ __html: game.description }} />
              )}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="glass-card p-6 rounded-3xl">
            <h3 className="text-xl font-bold mb-4 text-white">Details</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-sm text-gray-500 uppercase font-semibold mb-1">Platforms</h4>
                <div className="flex flex-wrap gap-2">
                  {game.platforms?.map(({ platform }) => (
                    <span key={platform.id} className="text-xs bg-gray-800 px-2.5 py-1 rounded-md text-gray-300">
                      {platform.name}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm text-gray-500 uppercase font-semibold mb-1">Genres</h4>
                <div className="flex flex-wrap gap-2">
                  {game.genres?.map(genre => (
                    <span key={genre.id} className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-1 rounded-md">
                      {genre.name}
                    </span>
                  ))}
                </div>
              </div>

              {game.developers?.length > 0 && (
                <div>
                  <h4 className="text-sm text-gray-500 uppercase font-semibold mb-1">Developers</h4>
                  <div className="flex flex-wrap gap-2">
                    {game.developers?.map(dev => (
                      <span key={dev.id} className="text-sm text-gray-300 flex items-center gap-1">
                        <Code className="w-3 h-3" /> {dev.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {game.website && (
              <a 
                href={game.website}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-medium transition-colors"
              >
                <Globe className="w-4 h-4" /> Official Website
              </a>
            )}
          </section>
        </div>
      </div>
    </motion.div>
  );
};

export default GameDetails;
