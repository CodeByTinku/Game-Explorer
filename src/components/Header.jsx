import { useState } from 'react';
import { Search, Gamepad2, Heart } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useWishlist } from '../hooks/useWishlist';
import ThemeToggle from './ThemeToggle';

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { wishlist } = useWishlist();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery(''); // Clear the search bar
    }
  };

  return (
    <header className="sticky top-0 z-50 glass-card border-b-0 border-x-0 border-t-0 rounded-none bg-opacity-80 px-4 py-4 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
          <Gamepad2 className="w-8 h-8 text-blue-400" />
          GameExplorer
        </Link>
        
        <div className="flex w-full md:w-auto gap-4 items-center flex-1 md:justify-end">
          <form onSubmit={handleSearch} className="w-full md:w-96 relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-theme-secondary group-focus-within:text-accent transition-colors" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-theme-border rounded-full leading-5 bg-theme-card text-theme-primary placeholder-theme-secondary focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent sm:text-sm transition-all focus:bg-theme-hover"
              placeholder="Search for games..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>

          <ThemeToggle />

          <Link to="/wishlist" className="relative p-2 text-theme-secondary hover:text-pink-500 transition-colors group">
            <Heart className="w-6 h-6 group-hover:fill-pink-500/20" />
            {wishlist.length > 0 && (
              <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-pink-500 rounded-full">
                {wishlist.length}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
