import { useState, useEffect } from 'react';
import { getGames, getPopularGames } from '../api/api';

export const useSearchSuggestions = (query) => {
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [searchResults, setSearchResults] = useState([]);
  const [popularResults, setPopularResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Debounce the query search value
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 250); // 250ms debounce time

    return () => {
      clearTimeout(handler);
    };
  }, [query]);

  // Fetch popular games once on mount (cached for autocomplete recommendations)
  useEffect(() => {
    const fetchPopular = async () => {
      try {
        const data = await getPopularGames(1);
        if (data && data.results) {
          // Take top 5 for the autocomplete list
          setPopularResults(data.results.slice(0, 5));
        }
      } catch (err) {
        console.error('Error fetching popular recommendations:', err);
      }
    };
    fetchPopular();
  }, []);

  // Fetch matching results when debounced query changes
  useEffect(() => {
    if (debouncedQuery.trim().length < 2) {
      setSearchResults([]);
      setLoading(false);
      return;
    }

    let isMounted = true;
    const fetchMatches = async () => {
      setLoading(true);
      try {
        const data = await getGames(1, 5, debouncedQuery);
        if (isMounted && data && data.results) {
          setSearchResults(data.results);
        }
      } catch (err) {
        console.error('Error fetching search autocomplete suggestions:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchMatches();

    return () => {
      isMounted = false;
    };
  }, [debouncedQuery]);

  return {
    searchResults,
    popularResults,
    loading,
    isSearching: debouncedQuery.trim().length >= 2,
  };
};
