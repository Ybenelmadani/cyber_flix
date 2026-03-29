const normalizeApiBase = (value) => {
  const fallback = "http://localhost:3001/api";

  if (!value) {
    return fallback;
  }

  const trimmed = value.replace(/\/+$/, "");
  if (trimmed.endsWith("/api")) {
    return trimmed;
  }

  return `${trimmed}/api`;
};

const API_BASE = normalizeApiBase(process.env.REACT_APP_API_BASE);
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

export const request = async (path, options = {}) => {
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
      `Unable to reach backend. Verify API is available at ${API_BASE}.`
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

  getMoviePlayback: (tmdbId, source = 0) =>
    request(
      `/streams/movie/${tmdbId}/play?source=${encodeURIComponent(source)}`
    ),

  getEpisodePlayback: (tmdbId, seasonNumber, episodeNumber, source = 0) =>
    request(
      `/streams/tv/${tmdbId}/play?seasonNumber=${encodeURIComponent(
        seasonNumber
      )}&episodeNumber=${encodeURIComponent(
        episodeNumber
      )}&source=${encodeURIComponent(source)}`
    ),

  list: ({ mediaType = "", tmdbId = "" } = {}) => {
    const params = new URLSearchParams();
    if (mediaType) params.set("mediaType", mediaType);
    if (tmdbId) params.set("tmdbId", tmdbId);
    const query = params.toString();
    return request(`/streams${query ? `?${query}` : ""}`);
  },

  create: (payload) =>
    request("/streams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),

  update: (id, payload) =>
    request(`/streams/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),

  remove: (id) =>
    request(`/streams/${encodeURIComponent(id)}`, {
      method: "DELETE",
    }),
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

  tvEpisodeDetails: (id, seasonNumber, episodeNumber, language) =>
    request(
      withLanguage(
        `/tmdb/tv/${id}/season/${seasonNumber}/episode/${episodeNumber}`,
        language
      )
    ),

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

  getReviews: (mediaType, itemId) =>
    request(
      `/movies/${encodeURIComponent(mediaType)}/${encodeURIComponent(
        itemId
      )}/reviews`
    ),

  upsertReview: (mediaType, itemId, payload) =>
    request(
      `/movies/${encodeURIComponent(mediaType)}/${encodeURIComponent(
        itemId
      )}/reviews`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    ),

  deleteReview: (mediaType, itemId) =>
    request(
      `/movies/${encodeURIComponent(mediaType)}/${encodeURIComponent(
        itemId
      )}/reviews`,
      {
        method: "DELETE",
      }
    ),

  createReviewReply: (mediaType, itemId, reviewId, payload) =>
    request(
      `/movies/${encodeURIComponent(mediaType)}/${encodeURIComponent(
        itemId
      )}/reviews/${encodeURIComponent(reviewId)}/replies`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    ),

  deleteReviewReply: (mediaType, itemId, reviewId, replyId) =>
    request(
      `/movies/${encodeURIComponent(mediaType)}/${encodeURIComponent(
        itemId
      )}/reviews/${encodeURIComponent(reviewId)}/replies/${encodeURIComponent(
        replyId
      )}`,
      {
        method: "DELETE",
      }
    ),
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
