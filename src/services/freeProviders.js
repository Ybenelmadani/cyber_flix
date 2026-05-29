/**
 * Free Streaming Providers — Frontend utility
 * Generates embed URLs directly in the browser — no backend needed!
 * Works on Vercel without any server configuration.
 */

const FREE_PROVIDERS = [
  {
    id: "vidsrc",
    name: "VidSrc",
    provider: "vidsrc",
    quality: "HD",
    movie: (id) => `https://vidsrc.to/embed/movie/${id}`,
    tv: (id, s, e) => `https://vidsrc.to/embed/tv/${id}/${s}/${e}`,
  },
  {
    id: "vidlink",
    name: "VidLink",
    provider: "vidlink",
    quality: "HD",
    movie: (id) => `https://vidlink.pro/movie/${id}`,
    tv: (id, s, e) => `https://vidlink.pro/tv/${id}/${s}/${e}`,
  },
  {
    id: "2embed",
    name: "2Embed",
    provider: "2embed",
    quality: "HD",
    movie: (id) => `https://www.2embed.cc/embed/${id}`,
    tv: (id, s, e) => `https://www.2embed.cc/embedtv/${id}&s=${s}&e=${e}`,
  },
  {
    id: "embedsu",
    name: "Embed.su",
    provider: "embedsu",
    quality: "Auto",
    movie: (id) => `https://embed.su/embed/movie/${id}`,
    tv: (id, s, e) => `https://embed.su/embed/tv/${id}/${s}/${e}`,
  },
  {
    id: "autoembed",
    name: "AutoEmbed",
    provider: "autoembed",
    quality: "Auto",
    movie: (id) => `https://autoembed.cc/movie/tmdb-${id}`,
    tv: (id, s, e) => `https://autoembed.cc/tv/tmdb-${id}-${s}-${e}`,
  },
  {
    id: "multiembed",
    name: "MultiEmbed",
    provider: "multiembed",
    quality: "HD",
    movie: (id) => `https://multiembed.mov/?video_id=${id}&tmdb=1`,
    tv: (id, s, e) => `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${s}&e=${e}`,
  },
  {
    id: "nontongo",
    name: "NontonGo",
    provider: "nontongo",
    quality: "HD",
    movie: (id) => `https://www.NontonGo.net/embed/movie/${id}`,
    tv: (id, s, e) => `https://www.NontonGo.net/embed/tv/${id}/${s}/${e}`,
  },
];

/**
 * Get server list for movies.
 * @param {string|number} tmdbId
 * @returns {Array} servers
 */
export const getMovieProviders = (tmdbId) =>
  FREE_PROVIDERS.map((p) => ({
    id: `free-${p.id}`,
    name: p.name,
    provider: p.provider,
    quality: p.quality,
    url: p.movie(tmdbId),
    type: "embed",
    isLegal: false,
    isPremium: false,
    isFreeProvider: true,
  }));

/**
 * Get server list for a TV episode.
 * @param {string|number} tmdbId
 * @param {number} season
 * @param {number} episode
 * @returns {Array} servers
 */
export const getTvEpisodeProviders = (tmdbId, season, episode) =>
  FREE_PROVIDERS.map((p) => ({
    id: `free-${p.id}-s${season}e${episode}`,
    name: p.name,
    provider: p.provider,
    quality: p.quality,
    url: p.tv(tmdbId, season, episode),
    type: "embed",
    isLegal: false,
    isPremium: false,
    isFreeProvider: true,
  }));
