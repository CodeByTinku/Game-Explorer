import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import GameDetails from './pages/GameDetails';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#0f172a] text-white">
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/game/:id" element={<GameDetails />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
