import { useState } from 'react';
import { Search, Gamepad2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 glass-card border-b-0 border-x-0 border-t-0 rounded-none bg-opacity-80 px-4 py-4 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
          <Gamepad2 className="w-8 h-8 text-blue-400" />
          GameExplorer
        </Link>
        
        <form onSubmit={handleSearch} className="w-full md:w-96 relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400 group-focus-within:text-blue-400 transition-colors" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-full leading-5 bg-gray-800/50 text-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all focus:bg-gray-800"
            placeholder="Search for games..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
      </div>
    </header>
  );
};

export default Header;
