import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Gamepad2, Trophy, Heart, CheckCircle2, XCircle, 
  Sparkles, RefreshCw, ArrowRight, Eye, EyeOff, Loader2 
} from 'lucide-react';
import { getQuizGames } from '../api/api';

const TIMER_DURATION = 15; // 15 seconds per question

const Quiz = () => {
  // Game States: 'START', 'LOADING', 'PLAYING', 'GAME_OVER'
  const [gameState, setGameState] = useState('START');
  const [gamePool, setGamePool] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Gameplay States
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [options, setOptions] = useState([]);
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [lives, setLives] = useState(3);
  const [roundNumber, setRoundNumber] = useState(1);
  const [isImageBlurred, setIsImageBlurred] = useState(true);
  const [usedGameIds, setUsedGameIds] = useState(new Set());

  // Timer States
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const timerRef = useRef(null);

  // Stats / Highscore
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('game-explorer-quiz-high-score');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [isNewHighScore, setIsNewHighScore] = useState(false);

  // Fetch games pool when starting
  const fetchPool = async () => {
    setLoading(true);
    setError(null);
    setGameState('LOADING');
    try {
      const data = await getQuizGames();
      const results = data.results || [];
      if (results.length < 10) {
        throw new Error('Not enough games found in the database.');
      }
      setGamePool(results);
      setGameState('START');
    } catch (err) {
      console.error(err);
      setError('Failed to load trivia database. Please check your internet connection.');
      setGameState('START');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPool();
  }, []);

  // Timer Tick Hook
  useEffect(() => {
    if (gameState !== 'PLAYING' || isAnswered) return;

    if (timeLeft <= 0) {
      handleTimeOut();
      return;
    }

    timerRef.current = setTimeout(() => {
      setTimeLeft((prev) => +(prev - 0.1).toFixed(1));
    }, 100);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timeLeft, gameState, isAnswered]);

  // Load a new question
  const loadQuestion = (pool = gamePool, usedIds = usedGameIds) => {
    // Reset timer and visual states
    setTimeLeft(TIMER_DURATION);
    setIsAnswered(false);
    setSelectedOptionId(null);
    setIsImageBlurred(true);

    // Filter out games already used in this session to avoid repetition
    let availableGames = pool.filter((g) => !usedIds.has(g.id));
    
    // If we run out of fresh games, reset the used game tracker
    if (availableGames.length < 4) {
      usedIds.clear();
      availableGames = [...pool];
    }

    // Pick a random target game
    const randomIndex = Math.floor(Math.random() * availableGames.length);
    const target = availableGames[randomIndex];
    
    // Mark target as used
    const nextUsedIds = new Set(usedIds);
    nextUsedIds.add(target.id);
    setUsedGameIds(nextUsedIds);

    // Set clue details
    setCurrentQuestion(target);

    // Select 3 random distractor games
    const distractorsPool = pool.filter((g) => g.id !== target.id);
    const shuffledDistractors = [...distractorsPool].sort(() => 0.5 - Math.random());
    const distractors = shuffledDistractors.slice(0, 3);

    // Combine distractors + target and shuffle them
    const quizOptions = [target, ...distractors].sort(() => 0.5 - Math.random());
    setOptions(quizOptions);
  };

  // Start the Quiz
  const handleStartGame = () => {
    if (gamePool.length === 0) return;
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setLives(3);
    setRoundNumber(1);
    setIsNewHighScore(false);
    const emptyUsedSet = new Set();
    setUsedGameIds(emptyUsedSet);
    setGameState('PLAYING');
    loadQuestion(gamePool, emptyUsedSet);
  };

  // Answer selected
  const handleOptionClick = (optionId) => {
    if (isAnswered) return;

    if (timerRef.current) clearTimeout(timerRef.current);
    setSelectedOptionId(optionId);
    setIsAnswered(true);
    setIsImageBlurred(false);

    const isCorrect = optionId === currentQuestion.id;

    if (isCorrect) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > maxStreak) setMaxStreak(newStreak);

      // Score formula: 10 points basic + streak bonus (up to +10 extra)
      const streakBonus = Math.min(newStreak - 1, 10);
      setScore((prev) => prev + 10 + streakBonus);
    } else {
      setStreak(0);
      const nextLives = lives - 1;
      setLives(nextLives);
      if (nextLives <= 0) {
        handleGameOver(score);
      }
    }
  };

  // Time Out Handler
  const handleTimeOut = () => {
    setIsAnswered(true);
    setIsImageBlurred(false);
    setStreak(0);
    const nextLives = lives - 1;
    setLives(nextLives);
    if (nextLives <= 0) {
      handleGameOver(score);
    }
  };

  // Trigger game over screen
  const handleGameOver = (finalScore) => {
    setGameState('GAME_OVER');
    if (finalScore > highScore) {
      setHighScore(finalScore);
      localStorage.setItem('game-explorer-quiz-high-score', finalScore.toString());
      setIsNewHighScore(true);
    }
  };

  // Move to next question
  const handleNextQuestion = () => {
    if (lives <= 0) {
      handleGameOver(score);
      return;
    }
    setRoundNumber((prev) => prev + 1);
    loadQuestion();
  };

  // Force reveal blurred image (costs 3 seconds)
  const handleRevealImage = () => {
    if (!isImageBlurred || isAnswered) return;
    setIsImageBlurred(false);
    setTimeLeft((prev) => Math.max(0.1, prev - 3));
  };

  return (
    <div className="max-w-3xl mx-auto px-2 py-4 pb-20">
      <AnimatePresence mode="wait">
        
        {/* START SCREEN */}
        {gameState === 'START' && (
          <motion.div
            key="start-screen"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className="glass-card rounded-3xl p-6 md:p-10 text-center space-y-8 relative overflow-hidden"
          >
            {/* Design highlights */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl" />

            <div className="inline-flex p-5 rounded-full bg-gradient-to-tr from-blue-500/20 to-purple-500/20 border border-blue-500/30 shadow-lg text-blue-400 relative">
              <Gamepad2 className="w-16 h-16 animate-bounce" />
              <Trophy className="w-8 h-8 text-amber-400 absolute -top-1 -right-1" />
            </div>

            <div className="space-y-3">
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
                GAMING TRIVIA
              </h1>
              <p className="text-theme-secondary text-lg max-w-lg mx-auto">
                Test your gaming database knowledge! Can you identify these famous titles from blurred screenshots, release dates, and platforms?
              </p>
            </div>

            {/* Highscore section */}
            <div className="inline-flex items-center gap-3 bg-theme-bg/60 border border-theme-border px-6 py-3 rounded-full text-theme-primary">
              <Trophy className="w-5 h-5 text-amber-500 fill-amber-500/20" />
              <span className="font-semibold text-sm">Personal High Score:</span>
              <span className="font-extrabold text-amber-400 text-lg">{highScore} pts</span>
            </div>

            {/* Instruction rules */}
            <div className="bg-theme-bg/30 rounded-2xl p-5 border border-theme-border/40 text-left max-w-md mx-auto space-y-3 text-sm">
              <h3 className="font-bold text-theme-primary uppercase text-xs tracking-wider mb-2 text-center text-blue-400">Rules of Survival</h3>
              <div className="flex items-start gap-3">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 font-bold text-xs shrink-0 mt-0.5">1</span>
                <p className="text-theme-secondary">You have <strong>15 seconds</strong> per question to select the correct game name.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 font-bold text-xs shrink-0 mt-0.5">2</span>
                <p className="text-theme-secondary">You start with <strong>3 Lives ❤️</strong>. A wrong answer or timeout costs 1 Life.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 font-bold text-xs shrink-0 mt-0.5">3</span>
                <p className="text-theme-secondary">Correct answers build your <strong>Streak 🔥</strong>. Higher streaks multiply score points!</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 font-bold text-xs shrink-0 mt-0.5">4</span>
                <p className="text-theme-secondary">Screenshots are blurred by default. Unblurring costs <strong>3 seconds</strong> of time.</p>
              </div>
            </div>

            {error && (
              <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 py-2.5 px-4 rounded-xl max-w-md mx-auto">
                {error}
              </div>
            )}

            <div>
              {loading ? (
                <button disabled className="bg-blue-500/50 text-white font-bold px-10 py-4 rounded-full flex items-center gap-2 mx-auto cursor-not-allowed">
                  <Loader2 className="w-5 h-5 animate-spin" /> Preparing database...
                </button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleStartGame}
                  disabled={gamePool.length === 0}
                  className="px-10 py-4 rounded-full bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 hover:from-blue-600 hover:to-pink-600 text-white font-extrabold tracking-wide text-lg shadow-lg shadow-blue-500/25 transition-all duration-300 border border-white/20"
                >
                  START CHALLENGE
                </motion.button>
              )}
            </div>
          </motion.div>
        )}

        {/* LOADING STATE */}
        {gameState === 'LOADING' && (
          <motion.div
            key="loading-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4"
          >
            <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
            <h2 className="text-2xl font-bold text-theme-primary">Assembling Game Database...</h2>
            <p className="text-theme-secondary">Shuffling levels, polishing screenshots, and preparing the quiz board...</p>
          </motion.div>
        )}

        {/* PLAYING STATE */}
        {gameState === 'PLAYING' && currentQuestion && (
          <motion.div
            key="quiz-play"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-6"
          >
            {/* TOP DASHBOARD PANEL */}
            <div className="flex justify-between items-center bg-theme-card/60 backdrop-blur-md px-6 py-4 rounded-2xl border border-theme-border">
              <div className="flex flex-col">
                <span className="text-xs text-theme-secondary font-bold uppercase tracking-wider">Score</span>
                <span className="text-2xl font-extrabold text-blue-400">{score}</span>
              </div>

              <div className="flex flex-col items-center bg-theme-bg/60 border border-theme-border/50 px-4 py-1.5 rounded-full">
                <span className="text-xs text-theme-secondary font-semibold">QUESTION {roundNumber}</span>
                {streak > 0 && (
                  <motion.span 
                    initial={{ scale: 0.8 }} 
                    animate={{ scale: [1, 1.2, 1] }}
                    className="text-xs font-bold text-amber-500 flex items-center gap-0.5 mt-0.5"
                  >
                    🔥 {streak} Streak
                  </motion.span>
                )}
              </div>

              <div className="flex flex-col items-end">
                <span className="text-xs text-theme-secondary font-bold uppercase tracking-wider mb-1">Lives</span>
                <div className="flex gap-1">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 1 }}
                      animate={i < lives ? { scale: 1 } : { scale: 0.6, opacity: 0.3 }}
                      transition={{ type: 'spring', damping: 10 }}
                    >
                      <Heart 
                        className={`w-6 h-6 ${
                          i < lives ? 'text-pink-500 fill-pink-500 drop-shadow-[0_0_8px_rgba(236,72,153,0.5)]' : 'text-zinc-600'
                        }`} 
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* COUNTDOWN TIMER PROGRESS BAR */}
            <div className="w-full h-2.5 bg-theme-border rounded-full overflow-hidden relative">
              <motion.div
                className={`h-full ${
                  timeLeft <= 4 
                    ? 'bg-gradient-to-r from-red-500 to-pink-500 animate-pulse' 
                    : 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500'
                }`}
                initial={{ width: '100%' }}
                animate={{ width: `${(timeLeft / TIMER_DURATION) * 100}%` }}
                transition={{ duration: 0.1, ease: 'linear' }}
              />
              <span className="absolute top-0 right-3 -translate-y-2/3 text-[10px] font-bold text-theme-primary/80 bg-theme-bg px-2 py-0.5 rounded-full border border-theme-border">
                {Math.ceil(timeLeft)}s
              </span>
            </div>

            {/* CLUE CARD CONTAINER */}
            <div className="glass-card rounded-3xl p-5 md:p-6 space-y-6 border border-theme-border/60 shadow-xl relative overflow-hidden">
              
              {/* Mystery Image Screen */}
              <div className="relative aspect-video rounded-2xl overflow-hidden border border-theme-border/40 shadow-inner group">
                <img
                  src={currentQuestion.background_image || 'https://via.placeholder.com/600x400?text=No+Image'}
                  alt="Mystery game gameplay clue"
                  className={`w-full h-full object-cover transition-all duration-700 ${
                    isImageBlurred ? 'blur-xl scale-105 saturate-[0.1]' : 'blur-none scale-100'
                  }`}
                />
                
                {/* Reveal blur button Overlay */}
                {isImageBlurred && !isAnswered && (
                  <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-2 p-4 text-center">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleRevealImage}
                      className="px-4 py-2 bg-theme-bg/90 hover:bg-theme-bg border border-theme-border rounded-full text-xs font-bold text-theme-primary flex items-center gap-2 shadow-lg backdrop-blur-md transition-colors"
                    >
                      <Eye className="w-4 h-4 text-blue-400" />
                      Reveal Clue (-3s Penalty)
                    </motion.button>
                    <p className="text-[10px] text-theme-secondary">Or guess from the text clues below!</p>
                  </div>
                )}

                {/* Answer status overlay */}
                {isAnswered && (
                  <div className={`absolute top-4 left-4 p-3 rounded-xl border backdrop-blur-md flex items-center gap-2 font-bold text-sm shadow-xl ${
                    selectedOptionId === currentQuestion.id 
                      ? 'bg-green-500/25 border-green-500/40 text-green-300'
                      : 'bg-red-500/25 border-red-500/40 text-red-300'
                  }`}>
                    {selectedOptionId === currentQuestion.id ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-green-400" /> Correct Guess!
                      </>
                    ) : selectedOptionId === null ? (
                      <>
                        <XCircle className="w-5 h-5 text-red-400" /> Out of Time!
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5 text-red-400" /> Wrong Game!
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Textual Clues */}
              <div className="space-y-4">

                {/* Meta details Badges */}
                <div className="flex flex-wrap items-center justify-center gap-3">
                  {currentQuestion.released && (
                    <span className="px-3 py-1.5 bg-theme-bg/60 border border-theme-border/50 text-xs font-semibold rounded-full flex items-center gap-1.5">
                      📅 {new Date(currentQuestion.released).getFullYear()}
                    </span>
                  )}
                  {currentQuestion.metacritic && (
                    <span className="px-3 py-1.5 bg-theme-bg/60 border border-theme-border/50 text-xs font-semibold rounded-full flex items-center gap-1.5">
                      ⭐ Metacritic: <strong className="text-green-400">{currentQuestion.metacritic}</strong>
                    </span>
                  )}
                  {currentQuestion.genres?.slice(0, 3).map((genre) => (
                    <span key={genre.id} className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold rounded-full">
                      {genre.name}
                    </span>
                  ))}
                </div>

                {/* Parent Platforms clue */}
                {currentQuestion.parent_platforms && (
                  <div className="text-center text-xs text-theme-secondary">
                    Available on:{' '}
                    <span className="text-theme-primary font-medium">
                      {currentQuestion.parent_platforms.map(({ platform }) => platform.name).join(', ')}
                    </span>
                  </div>
                )}

              </div>
            </div>

            {/* MULTIPLE CHOICE GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {options.map((option, index) => {
                const isSelected = selectedOptionId === option.id;
                const isCorrect = option.id === currentQuestion.id;
                
                let buttonStyle = 'bg-theme-card hover:bg-theme-hover border-theme-border text-theme-primary';
                let Icon = null;

                if (isAnswered) {
                  if (isCorrect) {
                    // Correct answer glows green
                    buttonStyle = 'bg-green-500/15 border-green-500/60 text-green-300 drop-shadow-[0_0_15px_rgba(34,197,94,0.15)]';
                    Icon = <CheckCircle2 className="w-5 h-5 text-green-400" />;
                  } else if (isSelected) {
                    // Selected wrong answer glows red
                    buttonStyle = 'bg-red-500/15 border-red-500/60 text-red-300 drop-shadow-[0_0_15px_rgba(239,68,68,0.15)]';
                    Icon = <XCircle className="w-5 h-5 text-red-400" />;
                  } else {
                    // Other options fade
                    buttonStyle = 'opacity-40 border-theme-border/40 text-theme-secondary/80';
                  }
                }

                return (
                  <motion.button
                    key={option.id}
                    disabled={isAnswered}
                    whileHover={!isAnswered ? { scale: 1.02 } : {}}
                    whileTap={!isAnswered ? { scale: 0.98 } : {}}
                    onClick={() => handleOptionClick(option.id)}
                    className={`w-full text-left px-5 py-4 border rounded-2xl flex items-center justify-between gap-4 font-bold transition-all duration-300 group shadow-md ${buttonStyle}`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Badge indicator */}
                      <span className={`w-7 h-7 rounded-lg text-xs font-black flex items-center justify-center border transition-colors ${
                        isAnswered && isCorrect 
                          ? 'bg-green-500/20 border-green-500/40 text-green-300'
                          : isAnswered && isSelected
                          ? 'bg-red-500/20 border-red-500/40 text-red-300'
                          : 'bg-theme-bg border-theme-border text-theme-secondary group-hover:border-blue-500/50'
                      }`}>
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className="text-sm md:text-base line-clamp-1">{option.name}</span>
                    </div>
                    {Icon}
                  </motion.button>
                );
              })}
            </div>

            {/* NEXT ROUND ACTION SLIDER */}
            <AnimatePresence>
              {isAnswered && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 15 }}
                  className="flex justify-center pt-2"
                >
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleNextQuestion}
                    className="px-8 py-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-extrabold flex items-center gap-2 shadow-lg shadow-blue-500/20 border border-white/10"
                  >
                    {lives <= 0 ? 'See Results' : 'Next Question'} <ArrowRight className="w-5 h-5" />
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>

          </motion.div>
        )}

        {/* GAME OVER SCREEN */}
        {gameState === 'GAME_OVER' && (
          <motion.div
            key="game-over"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="glass-card rounded-3xl p-6 md:p-10 text-center space-y-8 relative overflow-hidden"
          >
            {/* Confetti details */}
            {isNewHighScore && (
              <div className="absolute -inset-0 pointer-events-none bg-gradient-to-b from-amber-500/5 to-transparent animate-pulse" />
            )}

            <div className="inline-flex p-5 rounded-full bg-gradient-to-tr from-pink-500/20 to-red-500/20 border border-pink-500/30 shadow-lg text-pink-500 relative">
              <Trophy className={`w-16 h-16 ${isNewHighScore ? 'text-amber-400 animate-pulse' : 'text-zinc-500'}`} />
            </div>

            <div className="space-y-3">
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-600 to-red-500">
                GAME OVER!
              </h1>
              <p className="text-theme-secondary text-lg">
                {isNewHighScore 
                  ? "Outstanding! You set a brand new high score! You're a true gaming wizard." 
                  : "Excellent effort! You fought well, but the lives expired. Try again to beat your personal best!"
                }
              </p>
            </div>

            {/* Score Showcase board */}
            <div className="max-w-md mx-auto grid grid-cols-2 gap-4 bg-theme-bg/60 border border-theme-border p-6 rounded-2xl">
              <div className="flex flex-col text-center">
                <span className="text-xs text-theme-secondary font-semibold uppercase tracking-wider">Final Score</span>
                <span className="text-3xl font-black text-blue-400 mt-1">{score} pts</span>
              </div>
              <div className="flex flex-col text-center border-l border-theme-border">
                <span className="text-xs text-theme-secondary font-semibold uppercase tracking-wider">Max Streak</span>
                <span className="text-3xl font-black text-amber-400 mt-1">{maxStreak} 🔥</span>
              </div>
            </div>

            {/* Highscore celebrate alert */}
            {isNewHighScore && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: [1, 1.1, 1], opacity: 1 }}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500/25 border border-amber-500/40 text-amber-300 rounded-full font-black text-sm drop-shadow-[0_0_12px_rgba(245,158,11,0.2)]"
              >
                <Sparkles className="w-5 h-5 text-amber-400 fill-amber-400" />
                👑 NEW PERSONAL RECORD!
              </motion.div>
            )}

            {/* Actions button */}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleStartGame}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 text-white font-extrabold shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 border border-white/10"
              >
                <RefreshCw className="w-5 h-5" /> Play Again
              </motion.button>

              <Link to="/" className="w-full sm:w-auto">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full px-8 py-3.5 rounded-full bg-theme-card hover:bg-theme-hover border border-theme-border text-theme-primary font-bold shadow-md flex items-center justify-center gap-2"
                >
                  Back to Discover
                </motion.button>
              </Link>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
};

export default Quiz;
