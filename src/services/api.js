const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:3001/api";
const TOKEN_KEY = "cyberflix_token";

const parseResponseBody = async (response) => {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
};

export const getAuthToken = () => localStorage.getItem(TOKEN_KEY);

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  }
};

export const clearAuthToken = () => localStorage.removeItem(TOKEN_KEY);

const request = async (path, options = {}) => {
  const token = getAuthToken();

  const headers = {
    Accept: "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;

  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
    });
  } catch {
    const networkError = new Error(
      "Unable to reach backend. Verify API is running on port 3001."
    );
    networkError.status = 0;
    throw networkError;
  }

  const data = await parseResponseBody(response);

  if (!response.ok) {
    const serverMessage = typeof data === "object" ? data?.message : data;
    const error = new Error(serverMessage || "API error");
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};

const withLanguage = (path, language) => {
  if (!language) return path;
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}language=${encodeURIComponent(language)}`;
};

export const streamsAPI = {
  getMovieStream: (tmdbId) => request(`/streams/movie/${tmdbId}`),

  getEpisodeStream: (tmdbId, seasonNumber, episodeNumber) =>
    request(
      `/streams/tv/${tmdbId}?seasonNumber=${encodeURIComponent(
        seasonNumber
      )}&episodeNumber=${encodeURIComponent(episodeNumber)}`
    ),
};

export const tmdbAPI = {
  popular: (page = 1, language) =>
    request(withLanguage(`/tmdb/popular?page=${page}`, language)),

  search: (query, page = 1, language) =>
    request(
      withLanguage(
        `/tmdb/search?query=${encodeURIComponent(query)}&page=${page}`,
        language
      )
    ),

  details: (id, language) =>
    request(withLanguage(`/tmdb/movie/${id}`, language)),

  byGenre: (genreId, page = 1, language) =>
    request(withLanguage(`/tmdb/genre/${genreId}?page=${page}`, language)),

  genres: (language) => request(withLanguage("/tmdb/genres", language)),

  trending: (timeWindow = "week", language) =>
    request(withLanguage(`/tmdb/trending/${timeWindow}`, language)),

  topRated: (page = 1, language) =>
    request(withLanguage(`/tmdb/top-rated?page=${page}`, language)),

  upcoming: (page = 1, language) =>
    request(withLanguage(`/tmdb/upcoming?page=${page}`, language)),

  movieWatchProviders: (id) => request(`/tmdb/movie/${id}/watch/providers`),

  tvPopular: (page = 1, language) =>
    request(withLanguage(`/tmdb/tv/popular?page=${page}`, language)),

  tvSearch: (query, page = 1, language) =>
    request(
      withLanguage(
        `/tmdb/tv/search?query=${encodeURIComponent(query)}&page=${page}`,
        language
      )
    ),

  tvDetails: (id, language) =>
    request(withLanguage(`/tmdb/tv/${id}`, language)),

  tvSeasonDetails: (id, seasonNumber, language) =>
    request(withLanguage(`/tmdb/tv/${id}/season/${seasonNumber}`, language)),

  tvByGenre: (genreId, page = 1, language) =>
    request(withLanguage(`/tmdb/tv/genre/${genreId}?page=${page}`, language)),

  tvGenres: (language) => request(withLanguage("/tmdb/tv/genres", language)),

  tvTrending: (timeWindow = "week", language) =>
    request(withLanguage(`/tmdb/tv/trending/${timeWindow}`, language)),

  tvTopRated: (page = 1, language) =>
    request(withLanguage(`/tmdb/tv/top-rated?page=${page}`, language)),

  tvOnTheAir: (page = 1, language) =>
    request(withLanguage(`/tmdb/tv/on-the-air?page=${page}`, language)),

  tvWatchProviders: (id) => request(`/tmdb/tv/${id}/watch/providers`),
};

export const moviesAPI = {
  getFavorites: () => request("/movies/favorites"),

  addFavorite: (movie) =>
    request("/movies/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(movie),
    }),

  removeFavorite: (movieId) =>
    request(`/movies/favorites/${encodeURIComponent(movieId)}`, {
      method: "DELETE",
    }),
};

export const authAPI = {
  register: ({ email, password, name }) =>
    request("/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    }),

  login: ({ email, password }) =>
    request("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    }),

  me: () => request("/auth/me"),

  setLanguage: (language) =>
    request("/auth/language", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ language }),
    }),

  upgradePremium: () =>
    request("/auth/upgrade", {
      method: "POST",
    }),
};

export const paymentsAPI = {
  createCheckoutSession: () =>
    request("/payments/checkout-session", {
      method: "POST",
    }),

  mockUpgrade: () =>
    request("/payments/mock-upgrade", {
      method: "POST",
    }),
};