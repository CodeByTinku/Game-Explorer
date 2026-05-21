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
