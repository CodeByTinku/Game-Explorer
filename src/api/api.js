import axios from 'axios';

const API_KEY = import.meta.env.VITE_API_KEY;
const BASE_URL = 'https://api.rawg.io/api';

const api = axios.create({
  baseURL: BASE_URL,
  params: {
    key: API_KEY,
  },
});

export const getGames = async (page = 1, pageSize = 20, search = '') => {
  const params = {
    page,
    page_size: pageSize,
    ordering: '-relevance',
  };
  
  if (search) {
    params.search = search;
  }
  
  const response = await api.get('/games', { params });
  return response.data;
};

export const getPopularGames = async (page = 1) => {
  const response = await api.get('/games', {
    params: {
      page,
      page_size: 20,
      ordering: '-metacritic',
      metacritic: '80,100',
    },
  });

  // Shuffle results on first page so games appear in random order each visit
  if (page === 1 && response.data.results) {
    const shuffled = [...response.data.results];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return { ...response.data, results: shuffled };
  }

  return response.data;
};

export const getGameDetails = async (id) => {
  const response = await api.get(`/games/${id}`);
  return response.data;
};

export const getGameScreenshots = async (id) => {
  const response = await api.get(`/games/${id}/screenshots`);
  return response.data;
};

export const getGameTrailers = async (id) => {
  const response = await api.get(`/games/${id}/movies`);
  return response.data;
};

// Fetch games from the same series/franchise
export const getGameSeries = async (id) => {
  const response = await api.get(`/games/${id}/game-series`, {
    params: { page_size: 8 },
  });
  return response.data;
};

// Fetch similar games based on genres (fallback)
export const getSimilarGamesByGenre = async (genreSlugs, excludeId) => {
  const response = await api.get('/games', {
    params: {
      genres: genreSlugs,
      page_size: 8,
      ordering: '-metacritic',
      metacritic: '70,100',
    },
  });
  // Filter out the current game from results
  return {
    ...response.data,
    results: (response.data.results || []).filter((g) => g.id !== excludeId),
  };
};

// Fetch highly recognizable games for the trivia quiz (sorted by popularity/added count)
export const getQuizGames = async () => {
  const response = await api.get('/games', {
    params: {
      page: 1,
      page_size: 60,
      ordering: '-added',
    },
  });
  return response.data;
};

