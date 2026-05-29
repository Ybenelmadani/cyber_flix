/**
 * Free Streaming Providers — Frontend utility
 * Generates embed URLs directly in the browser — no backend needed!
 * Works on Vercel without any server configuration.
 */

const FREE_PROVIDERS = [];

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
