import React from "react";
import Player from "./Player";

const FALLBACK_POSTER =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="600" viewBox="0 0 400 600"><rect width="400" height="600" fill="#020617"/><text x="50%" y="50%" fill="#22d3ee" font-family="Arial, sans-serif" font-size="28" text-anchor="middle" dominant-baseline="middle">No Image</text></svg>'
  );
const FALLBACK_EPISODE_IMAGE =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450"><rect width="800" height="450" fill="#020617"/><text x="50%" y="50%" fill="#22d3ee" font-family="Arial, sans-serif" font-size="34" text-anchor="middle" dominant-baseline="middle">No Episode Image</text></svg>'
  );

const getTrailer = (videos) => {
  const results = videos?.results || [];
  return (
    results.find((v) => v.site === "YouTube" && v.type === "Trailer") ||
    results.find((v) => v.site === "YouTube") ||
    null
  );
};

export default function MovieDetail({
  mediaType = "movie",
  movie,
  seasonDetails,
  watchProviders,
  providerCountry,
  onProviderCountryChange,
  selectedSeason,
  onSeasonSelect,
  onEpisodeSelect,
  onBack,
  onToggleFavorite,
  isFavorite,
  isLoading,
  labels,
  servers = [],
  activeServer,
  setActiveServer,
}) {
  if (!movie) return null;

  const text = labels || {};
  const naText = text.na || "N/A";
  const title = movie.title || movie.name;
  const releaseDate = movie.release_date || movie.first_air_date;

  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : FALLBACK_POSTER;

  const backdropUrl = movie.backdrop_path
    ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`
    : posterUrl;

  const trailer = getTrailer(movie?.videos);
  const providersByCountry = watchProviders?.[providerCountry] || null;
  const officialWatchLink = providersByCountry?.link || "";

  const providerGroups = [
    { key: "flatrate", label: text.stream || "Streaming" },
    { key: "rent", label: text.rent || "Rent" },
    { key: "buy", label: text.buy || "Buy" },
    { key: "free", label: text.free || "Free" },
  ];

  const hasStreams = Array.isArray(servers) && servers.length > 0;

  return (
    <div className="animate-in fade-in space-y-6 duration-500">
      <section className="relative overflow-hidden rounded-[2rem] border border-cyber-cyan/15 bg-cyber-darker/70">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${backdropUrl})` }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(2,6,23,0.95),rgba(2,6,23,0.88),rgba(15,23,42,0.92))]" />

        <div className="relative px-5 py-6 sm:px-8 sm:py-8">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <button
              onClick={onBack}
              className="btn-cyber px-4 py-2 text-sm sm:w-auto"
            >
              {text.back || "Back"}
            </button>

            <button
              type="button"
              onClick={onToggleFavorite}
              className="rounded-xl border border-cyber-cyan/30 px-4 py-2 text-sm text-cyber-cyan transition hover:border-cyber-fuchsia hover:text-cyber-fuchsia"
            >
              {isFavorite
                ? text.removeFavorite || "Remove Favorite"
                : text.addFavorite || "Add Favorite"}
            </button>
          </div>

          <div className="max-w-3xl space-y-3">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.35em] text-cyber-cyan/60">
              {mediaType === "tv" ? "Series view" : "Movie view"}
            </p>
            <h1 className="text-3xl font-black text-white sm:text-4xl lg:text-5xl">
              {title}
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-cyan-50/70 sm:text-base">
              {movie.overview || text.noOverview || "No overview available."}
            </p>
          </div>
        </div>
      </section>

      {isLoading ? (
        <p className="text-cyber-cyan/70">
          {text.loading || "Loading details..."}
        </p>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="card-neon p-5 sm:p-6">
          <div className="mx-auto max-w-xs xl:max-w-none">
            <img
              src={posterUrl}
              alt={title}
              className="w-full rounded-[1.5rem] shadow-lg shadow-cyber-cyan/10"
            />
          </div>

          <div className="mt-5 grid gap-3 text-sm text-cyber-cyan/75 sm:grid-cols-2 xl:grid-cols-1">
            <div className="rounded-2xl border border-cyber-cyan/10 bg-cyber-dark/45 px-4 py-3">
              <p className="text-cyan-50/55">{text.year || "Year"}</p>
              <p className="mt-1 text-base font-semibold text-cyan-50">
                {releaseDate?.split("-")[0] || naText}
              </p>
            </div>
            <div className="rounded-2xl border border-cyber-cyan/10 bg-cyber-dark/45 px-4 py-3">
              <p className="text-cyan-50/55">{text.rating || "Rating"}</p>
              <p className="mt-1 text-base font-semibold text-cyan-50">
                {movie.vote_average ?? naText}
              </p>
            </div>
            <div className="rounded-2xl border border-cyber-cyan/10 bg-cyber-dark/45 px-4 py-3">
              <p className="text-cyan-50/55">{text.runtime || "Runtime"}</p>
              <p className="mt-1 text-base font-semibold text-cyan-50">
                {movie.runtime
                  ? `${movie.runtime} ${text.minutes || "min"}`
                  : naText}
              </p>
            </div>
            {mediaType === "tv" ? (
              <>
                <div className="rounded-2xl border border-cyber-cyan/10 bg-cyber-dark/45 px-4 py-3">
                  <p className="text-cyan-50/55">{text.seasons || "Seasons"}</p>
                  <p className="mt-1 text-base font-semibold text-cyan-50">
                    {movie.number_of_seasons ?? naText}
                  </p>
                </div>
                <div className="rounded-2xl border border-cyber-cyan/10 bg-cyber-dark/45 px-4 py-3">
                  <p className="text-cyan-50/55">{text.episodes || "Episodes"}</p>
                  <p className="mt-1 text-base font-semibold text-cyan-50">
                    {movie.number_of_episodes ?? naText}
                  </p>
                </div>
              </>
            ) : null}
          </div>
        </aside>

        <div className="space-y-6">
          <section className="card-neon p-5 sm:p-6">
            <h2 className="text-xl font-bold text-cyber-cyan">
              {text.info || "Information"}
            </h2>

            <div className="mt-4 grid gap-3 text-sm text-cyber-cyan/80 sm:grid-cols-2">
              <div className="rounded-2xl border border-cyber-cyan/10 bg-cyber-dark/45 px-4 py-3">
                <p className="text-cyan-50/55">{text.status || "Status"}</p>
                <p className="mt-1 font-semibold text-cyan-50">
                  {movie.status || naText}
                </p>
              </div>
              <div className="rounded-2xl border border-cyber-cyan/10 bg-cyber-dark/45 px-4 py-3">
                <p className="text-cyan-50/55">{text.language || "Language"}</p>
                <p className="mt-1 font-semibold text-cyan-50">
                  {movie.original_language || naText}
                </p>
              </div>
              <div className="rounded-2xl border border-cyber-cyan/10 bg-cyber-dark/45 px-4 py-3">
                <p className="text-cyan-50/55">{text.popularity || "Popularity"}</p>
                <p className="mt-1 font-semibold text-cyan-50">
                  {movie.popularity ?? naText}
                </p>
              </div>
              <div className="rounded-2xl border border-cyber-cyan/10 bg-cyber-dark/45 px-4 py-3">
                <p className="text-cyan-50/55">{text.votes || "Votes"}</p>
                <p className="mt-1 font-semibold text-cyan-50">
                  {movie.vote_count ?? naText}
                </p>
              </div>
            </div>

            {Array.isArray(movie.genres) && movie.genres.length > 0 ? (
              <div className="mt-5 flex flex-wrap gap-2">
                {movie.genres.map((genre) => (
                  <span
                    key={genre.id}
                    className="rounded-full border border-cyber-cyan/30 bg-cyber-cyan/10 px-3 py-1 text-sm text-cyber-cyan"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
            ) : null}
          </section>

          <section className="card-neon p-5 sm:p-6">
            <h3 className="mb-3 text-xl font-bold text-cyber-cyan">
              {text.watchNow || "Watch now"}
            </h3>

            {hasStreams ? (
              <Player
                servers={servers}
                activeServer={activeServer}
                setActiveServer={setActiveServer}
                poster={backdropUrl}
                title={title}
              />
            ) : officialWatchLink ? (
              <div className="rounded-[1.5rem] border border-cyber-cyan/20 bg-cyber-dark/45 p-4 text-cyber-cyan/80">
                <p className="text-sm">
                  {text.noDirectStream ||
                    "No direct in-app stream is available for this title. Use the official watch page instead."}
                </p>

                <a
                  href={officialWatchLink}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center justify-center rounded-xl border border-cyber-fuchsia/40 px-4 py-2 text-sm text-cyber-fuchsia transition hover:bg-cyber-fuchsia/10"
                >
                  {text.officialWatch || "Open official watch options"}
                </a>
              </div>
            ) : (
              <div className="rounded-[1.5rem] border border-cyber-cyan/20 bg-cyber-dark/45 p-4">
                <p className="text-sm text-cyber-cyan/70">
                  {text.noDirectStream ||
                    "No direct in-app stream is available for this title."}
                </p>
              </div>
            )}
          </section>

          {trailer ? (
            <section className="card-neon p-5 sm:p-6">
              <h3 className="mb-3 text-xl font-bold text-cyber-cyan">
                {text.trailer || "Trailer"}
              </h3>

              <div className="aspect-video overflow-hidden rounded-[1.5rem] border border-cyber-cyan/20">
                <iframe
                  title="trailer"
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${trailer.key}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </section>
          ) : null}

          <section className="card-neon p-5 sm:p-6">
            <h3 className="mb-3 text-xl font-bold text-cyber-cyan">
              {text.watchProviders || "Where to watch"}
            </h3>

            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="mr-1 text-sm text-cyber-cyan/80">
                {text.providerCountry || "Country"}:
              </span>

              {["MA", "FR", "US"].map((countryCode) => (
                <button
                  key={countryCode}
                  type="button"
                  onClick={() =>
                    onProviderCountryChange && onProviderCountryChange(countryCode)
                  }
                  className={`rounded-xl border px-3 py-2 text-xs font-semibold sm:text-sm ${
                    providerCountry === countryCode
                      ? "border-cyber-fuchsia bg-cyber-fuchsia/10 text-cyber-fuchsia"
                      : "border-cyber-cyan/30 text-cyber-cyan"
                  }`}
                >
                  {countryCode}
                </button>
              ))}
            </div>

            {providersByCountry ? (
              <div className="space-y-4">
                {providerGroups.map((group) =>
                  Array.isArray(providersByCountry[group.key]) &&
                  providersByCountry[group.key].length > 0 ? (
                    <div key={group.key}>
                      <p className="mb-2 text-sm text-cyber-cyan/80">
                        {group.label}
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {providersByCountry[group.key].map((provider) => (
                          <div
                            key={`${group.key}-${provider.provider_id}`}
                            className="flex items-center gap-2 rounded-xl border border-cyber-cyan/20 bg-cyber-darker/40 px-3 py-2"
                          >
                            {provider.logo_path ? (
                              <img
                                src={`https://image.tmdb.org/t/p/w92${provider.logo_path}`}
                                alt={provider.provider_name}
                                className="h-7 w-7 rounded object-cover"
                              />
                            ) : null}
                            <span className="text-xs text-cyber-cyan sm:text-sm">
                              {provider.provider_name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null
                )}

                {providersByCountry.link ? (
                  <a
                    href={providersByCountry.link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block text-sm text-cyber-fuchsia hover:underline"
                  >
                    TMDB watch link
                  </a>
                ) : null}
              </div>
            ) : (
              <p className="text-cyber-cyan/70">
                {text.noProvidersCountry ||
                  "No official providers found for this country."}
              </p>
            )}
          </section>
        </div>
      </div>

      {mediaType === "tv" &&
      Array.isArray(movie.seasons) &&
      movie.seasons.length > 0 ? (
        <section className="card-neon p-5 sm:p-6">
          <h3 className="mb-4 text-xl font-bold text-cyber-cyan">
            {text.seasonsAndEpisodes || "Seasons and episodes"}
          </h3>

          <div className="mb-5 flex flex-wrap gap-2">
            {movie.seasons
              .filter((season) => season.season_number > 0)
              .map((season) => (
                <button
                  key={season.id || season.season_number}
                  type="button"
                  onClick={() =>
                    onSeasonSelect && onSeasonSelect(season.season_number)
                  }
                  className={`rounded-xl border px-3 py-2 text-sm ${
                    selectedSeason === season.season_number
                      ? "border-cyber-fuchsia bg-cyber-fuchsia/10 text-cyber-fuchsia"
                      : "border-cyber-cyan/30 text-cyber-cyan"
                  }`}
                >
                  {text.season || "Season"} {season.season_number}
                </button>
              ))}
          </div>

          {seasonDetails?.episodes?.length ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {seasonDetails.episodes.map((episode) => (
                <div
                  key={episode.id}
                  className="overflow-hidden rounded-[1.5rem] border border-cyber-cyan/20 bg-cyber-darker/40"
                >
                  <div className="aspect-video border-b border-cyber-cyan/10 bg-cyber-dark">
                    <img
                      src={
                        episode.still_path
                          ? `https://image.tmdb.org/t/p/w780${episode.still_path}`
                          : FALLBACK_EPISODE_IMAGE
                      }
                      alt={`${episode.name || title} still`}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>

                  <div className="p-4">
                    <p className="font-semibold text-cyber-cyan">
                      {text.episode || "Episode"} {episode.episode_number}:{" "}
                      {episode.name}
                    </p>

                    <p className="mt-1 text-sm text-cyber-cyan/70">
                      {episode.air_date || naText} -{" "}
                      {episode.runtime
                        ? `${episode.runtime} ${text.minutes || "min"}`
                        : naText}
                    </p>

                    <p className="mt-2 line-clamp-3 text-sm text-cyber-cyan/70">
                      {episode.overview || text.noOverview}
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        onEpisodeSelect &&
                        onEpisodeSelect(episode.episode_number)
                      }
                      className="mt-3 rounded-xl border border-cyber-fuchsia/40 px-3 py-2 text-sm text-cyber-fuchsia transition hover:bg-cyber-fuchsia/10"
                    >
                      {text.watchNow || "Watch now"} - {text.episode || "Episode"}{" "}
                      {episode.episode_number}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-cyber-cyan/70">
              {text.noEpisodes || "No episodes found for this season."}
            </p>
          )}
        </section>
      ) : null}
    </div>
  );
}
