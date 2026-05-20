import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import GameDetails from './pages/GameDetails';
import Wishlist from './pages/Wishlist';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-theme-bg text-theme-primary transition-colors duration-300">
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/game/:id" element={<GameDetails />} />
            <Route path="/wishlist" element={<Wishlist />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
