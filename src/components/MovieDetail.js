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
const FALLBACK_PERSON_IMAGE =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="400" viewBox="0 0 320 400"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#081226"/><stop offset="100%" stop-color="#111c34"/></linearGradient><linearGradient id="card" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#16233f"/><stop offset="100%" stop-color="#0c1427"/></linearGradient></defs><rect width="320" height="400" rx="28" fill="url(#bg)"/><circle cx="272" cy="48" r="56" fill="#22d3ee" opacity=".08"/><circle cx="56" cy="338" r="72" fill="#ec4899" opacity=".08"/><rect x="28" y="28" width="264" height="344" rx="24" fill="url(#card)" stroke="#2dd4bf" stroke-opacity=".18"/><circle cx="160" cy="135" r="54" fill="#0f172a" stroke="#22d3ee" stroke-width="5"/><path d="M88 286c18-46 52-76 72-76s54 30 72 76" fill="#0f172a" stroke="#22d3ee" stroke-width="5" stroke-linecap="round"/><text x="50%" y="328" fill="#e2e8f0" font-family="Arial, sans-serif" font-size="22" font-weight="700" text-anchor="middle">Profile unavailable</text><text x="50%" y="352" fill="#7dd3fc" font-family="Arial, sans-serif" font-size="14" text-anchor="middle">TMDB has no image for this person</text></svg>'
  );

const getTrailer = (videos) => {
  const results = videos?.results || [];
  return (
    results.find((v) => v.site === "YouTube" && v.type === "Trailer") ||
    results.find((v) => v.site === "YouTube") ||
    null
  );
};

const uniquePeople = (people = []) => {
  const seen = new Set();

  return people.filter((person) => {
    const key = `${person.id || person.name}-${person.job || person.character || person.name}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const formatNumber = (value, fallback) => {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  const numericValue = Number(value);
  if (Number.isNaN(numericValue)) {
    return value;
  }

  return numericValue.toLocaleString();
};

const formatCurrency = (value, fallback) => {
  const numericValue = Number(value);
  if (!numericValue) {
    return fallback;
  }

  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(numericValue);
};

const formatDate = (value, fallback) => {
  if (!value) return fallback;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const joinValues = (items = [], selector, fallback) => {
  if (!Array.isArray(items) || items.length === 0) {
    return fallback;
  }

  const values = items.map((item) => selector(item)).filter(Boolean);
  return values.length ? values.join(", ") : fallback;
};

const buildImageUrl = (path, size, fallback) =>
  path ? `https://image.tmdb.org/t/p/${size}${path}` : fallback;

function InfoTile({ label, value }) {
  return (
    <div className="rounded-2xl border border-cyber-cyan/10 bg-cyber-dark/45 px-4 py-3">
      <p className="text-cyan-50/55">{label}</p>
      <p className="mt-1 font-semibold text-cyan-50">{value}</p>
    </div>
  );
}

function PersonCard({ person, subtitle, meta }) {
  return (
    <article className="overflow-hidden rounded-[1.5rem] border border-cyber-cyan/15 bg-cyber-darker/45">
      <div className="aspect-[4/5] border-b border-cyber-cyan/10 bg-cyber-dark">
        <img
          src={buildImageUrl(person?.profile_path, "w300", FALLBACK_PERSON_IMAGE)}
          alt={person?.name || "Person"}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>

      <div className="space-y-2 p-4">
        <h4 className="text-sm font-semibold text-cyan-50 sm:text-base">
          {person?.name || "Unknown"}
        </h4>

        {subtitle ? (
          <p className="text-sm text-cyber-fuchsia">{subtitle}</p>
        ) : null}

        {meta ? (
          <p className="text-xs leading-6 text-cyber-cyan/70 sm:text-sm">
            {meta}
          </p>
        ) : null}
      </div>
    </article>
  );
}

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
  const originalTitle = movie.original_title || movie.original_name || title;
  const lastAirDate = movie.last_air_date;
  const runtimeMinutes = movie.runtime || movie.episode_run_time?.[0] || null;
  const ratingValue = Number(movie.vote_average);
  const ratingText = Number.isFinite(ratingValue)
    ? `${ratingValue.toFixed(1)}/10`
    : naText;
  const userScore = Number.isFinite(ratingValue)
    ? `${Math.round(ratingValue * 10)}%`
    : naText;

  const posterUrl = buildImageUrl(movie.poster_path, "w500", FALLBACK_POSTER);

  const backdropUrl = buildImageUrl(movie.backdrop_path, "w1280", posterUrl);

  const trailer = getTrailer(movie?.videos);
  const providersByCountry = watchProviders?.[providerCountry] || null;
  const officialWatchLink = providersByCountry?.link || "";
  const cast = uniquePeople(movie?.credits?.cast || []).slice(0, 18);
  const crew = uniquePeople(movie?.credits?.crew || []);
  const directors = uniquePeople(
    crew.filter((person) => person.job === "Director")
  ).slice(0, 4);
  const writers = uniquePeople(
    crew.filter((person) =>
      ["Writer", "Screenplay", "Story", "Teleplay", "Novel"].includes(person.job)
    )
  ).slice(0, 6);
  const creators = uniquePeople(
    (movie.created_by || []).map((person) => ({
      ...person,
      job: text.creator || "Creator",
    }))
  ).slice(0, 4);
  const creativeTeam = uniquePeople(
    [...(mediaType === "tv" ? creators : directors), ...writers].map((person) => ({
      ...person,
      creditLabel:
        person.creditLabel ||
        person.job ||
        (mediaType === "tv" ? text.creator || "Creator" : text.director || "Director"),
    }))
  ).slice(0, 10);
  const spokenLanguages = joinValues(
    movie.spoken_languages,
    (language) => language.english_name || language.name,
    naText
  );
  const productionCountries = joinValues(
    movie.production_countries,
    (country) => country.name,
    joinValues(movie.origin_country, (countryCode) => countryCode, naText)
  );
  const networks = Array.isArray(movie.networks) ? movie.networks : [];
  const productionCompanies = Array.isArray(movie.production_companies)
    ? movie.production_companies
    : [];
  const similarTitles = Array.isArray(movie?.similar?.results)
    ? movie.similar.results.slice(0, 6)
    : [];

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
                className="btn-cyber min-h-[48px] px-4 py-2 text-sm sm:w-auto"
              >
                {text.back || "Back"}
              </button>

              <button
                type="button"
                onClick={onToggleFavorite}
                className="min-h-[48px] rounded-xl border border-cyber-cyan/30 px-4 py-2 text-sm text-cyber-cyan transition hover:border-cyber-fuchsia hover:text-cyber-fuchsia"
              >
              {isFavorite
                ? text.removeFavorite || "Remove Favorite"
                : text.addFavorite || "Add Favorite"}
            </button>
          </div>

          <div className="max-w-4xl space-y-4">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.35em] text-cyber-cyan/60">
              {mediaType === "tv" ? "Series view" : "Movie view"}
            </p>
            <h1 className="text-3xl font-black text-white sm:text-4xl lg:text-5xl">
              {title}
            </h1>

            {movie.tagline ? (
              <p className="max-w-3xl text-base italic text-cyber-fuchsia/90 sm:text-lg">
                {movie.tagline}
              </p>
            ) : null}

            <p className="max-w-2xl text-sm leading-7 text-cyan-50/70 sm:text-base">
              {movie.overview || text.noOverview || "No overview available."}
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              <span className="rounded-full border border-cyber-fuchsia/30 bg-cyber-fuchsia/10 px-3 py-1 text-sm text-cyber-fuchsia">
                {text.rating || "Rating"}: {ratingText}
              </span>
              <span className="rounded-full border border-cyber-cyan/30 bg-cyber-cyan/10 px-3 py-1 text-sm text-cyber-cyan">
                {text.userScore || "User score"}: {userScore}
              </span>
              <span className="rounded-full border border-cyber-cyan/30 bg-cyber-dark/45 px-3 py-1 text-sm text-cyber-cyan">
                {text.year || "Year"}: {releaseDate?.split("-")[0] || naText}
              </span>
              {Array.isArray(movie.genres) && movie.genres.length > 0
                ? movie.genres.map((genre) => (
                    <span
                      key={genre.id}
                      className="rounded-full border border-cyber-cyan/30 bg-cyber-cyan/10 px-3 py-1 text-sm text-cyber-cyan"
                    >
                      {genre.name}
                    </span>
                  ))
                : null}
            </div>
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
            <InfoTile
              label={text.year || "Year"}
              value={releaseDate?.split("-")[0] || naText}
            />
            <InfoTile label={text.rating || "Rating"} value={ratingText} />
            <InfoTile
              label={text.userScore || "User score"}
              value={userScore}
            />
            <InfoTile
              label={text.runtime || "Runtime"}
              value={
                runtimeMinutes
                  ? `${runtimeMinutes} ${text.minutes || "min"}`
                  : naText
              }
            />
            {mediaType === "tv" ? (
              <>
                <InfoTile
                  label={text.seasons || "Seasons"}
                  value={movie.number_of_seasons ?? naText}
                />
                <InfoTile
                  label={text.episodes || "Episodes"}
                  value={movie.number_of_episodes ?? naText}
                />
              </>
            ) : null}
          </div>
        </aside>

        <div className="space-y-6">
          {trailer ? (
            <section className="card-neon p-5 sm:p-6">
              <h3 className="mb-3 text-xl font-bold text-cyber-cyan">
                {text.trailer || "Trailer"}
              </h3>

              <div className="w-full overflow-hidden rounded-[1.5rem] border border-cyber-cyan/20">
                <div className="relative w-full pt-[56.25%]">
                  <iframe
                    title="trailer"
                    className="absolute inset-0 block h-full w-full"
                    src={`https://www.youtube.com/embed/${trailer.key}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            </section>
          ) : null}

          <section className="card-neon p-5 sm:p-6">
            <h2 className="text-xl font-bold text-cyber-cyan">
              {text.info || "Information"}
            </h2>

            <div className="mt-4 grid gap-3 text-sm text-cyber-cyan/80 sm:grid-cols-2 xl:grid-cols-3">
              <InfoTile
                label={text.status || "Status"}
                value={movie.status || naText}
              />
              <InfoTile
                label={text.language || "Language"}
                value={movie.original_language || naText}
              />
              <InfoTile
                label={text.originalTitle || "Original title"}
                value={originalTitle || naText}
              />
              <InfoTile
                label={text.releaseDate || "Release date"}
                value={formatDate(releaseDate, naText)}
              />
              <InfoTile
                label={text.lastAirDate || "Last air date"}
                value={mediaType === "tv" ? formatDate(lastAirDate, naText) : naText}
              />
              <InfoTile
                label={text.popularity || "Popularity"}
                value={formatNumber(movie.popularity, naText)}
              />
              <InfoTile
                label={text.votes || "Votes"}
                value={formatNumber(movie.vote_count, naText)}
              />
              <InfoTile
                label={text.spokenLanguages || "Spoken languages"}
                value={spokenLanguages}
              />
              <InfoTile
                label={text.countries || "Countries"}
                value={productionCountries}
              />
              {mediaType === "movie" ? (
                <>
                  <InfoTile
                    label={text.budget || "Budget"}
                    value={formatCurrency(movie.budget, naText)}
                  />
                  <InfoTile
                    label={text.revenue || "Revenue"}
                    value={formatCurrency(movie.revenue, naText)}
                  />
                  <InfoTile
                    label={text.collection || "Collection"}
                    value={movie.belongs_to_collection?.name || naText}
                  />
                </>
              ) : (
                <>
                  <InfoTile
                    label={text.type || "Type"}
                    value={movie.type || naText}
                  />
                  <InfoTile
                    label={text.inProduction || "In production"}
                    value={
                      typeof movie.in_production === "boolean"
                        ? movie.in_production
                          ? text.yes || "Yes"
                          : text.no || "No"
                        : naText
                    }
                  />
                  <InfoTile
                    label={text.nextEpisode || "Next episode"}
                    value={movie.next_episode_to_air?.name || naText}
                  />
                </>
              )}
            </div>

            {movie.homepage ? (
              <a
                href={movie.homepage}
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex items-center justify-center rounded-xl border border-cyber-fuchsia/40 px-4 py-2 text-sm text-cyber-fuchsia transition hover:bg-cyber-fuchsia/10"
              >
                {text.officialSite || "Open official site"}
              </a>
            ) : null}
          </section>

          {creativeTeam.length > 0 ? (
            <section className="card-neon p-5 sm:p-6">
              <div className="mb-4 flex flex-col gap-2">
                <h3 className="text-xl font-bold text-cyber-cyan">
                  {text.creativeTeam || "Creative team"}
                </h3>
                <p className="text-sm text-cyber-cyan/70">
                  {text.creativeTeamCopy ||
                    "Directors, creators and writers behind this title."}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {creativeTeam.map((person) => (
                  <PersonCard
                    key={`${person.id || person.name}-${person.creditLabel}`}
                    person={person}
                    subtitle={person.creditLabel}
                    meta={person.known_for_department || person.department || ""}
                  />
                ))}
              </div>
            </section>
          ) : null}

          {cast.length > 0 ? (
            <section className="card-neon p-5 sm:p-6">
              <div className="mb-4 flex flex-col gap-2">
                <h3 className="text-xl font-bold text-cyber-cyan">
                  {text.cast || "Cast"}
                </h3>
                <p className="text-sm text-cyber-cyan/70">
                  {text.castCopy ||
                    "Actors, names, profile photos and character roles."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
                {cast.map((person) => (
                  <PersonCard
                    key={person.cast_id || `${person.id}-${person.character}`}
                    person={person}
                    subtitle={
                      person.character
                        ? `${text.role || "Role"}: ${person.character}`
                        : person.known_for_department || ""
                    }
                    meta={
                      person.popularity
                        ? `${text.popularity || "Popularity"}: ${Number(
                            person.popularity
                          ).toFixed(1)}`
                        : person.known_for_department || ""
                    }
                  />
                ))}
              </div>
            </section>
          ) : null}

          {(productionCompanies.length > 0 || networks.length > 0) ? (
            <section className="card-neon p-5 sm:p-6">
              <h3 className="text-xl font-bold text-cyber-cyan">
                {text.production || "Production"}
              </h3>

              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                {productionCompanies.length > 0 ? (
                  <div>
                    <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-cyber-cyan/65">
                      {text.productionCompanies || "Production companies"}
                    </p>
                    <div className="grid gap-3">
                      {productionCompanies.map((company) => (
                        <div
                          key={company.id || company.name}
                          className="flex items-center gap-3 rounded-2xl border border-cyber-cyan/10 bg-cyber-dark/45 px-4 py-3"
                        >
                          {company.logo_path ? (
                            <img
                              src={buildImageUrl(
                                company.logo_path,
                                "w185",
                                FALLBACK_PERSON_IMAGE
                              )}
                              alt={company.name}
                              className="h-10 w-10 rounded-lg bg-white/95 object-contain p-1"
                              loading="lazy"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-cyber-cyan/20 bg-cyber-dark text-xs text-cyber-cyan">
                              {company.name?.slice(0, 2)?.toUpperCase() || "NA"}
                            </div>
                          )}

                          <div>
                            <p className="font-semibold text-cyan-50">
                              {company.name}
                            </p>
                            <p className="text-xs text-cyber-cyan/70">
                              {company.origin_country || naText}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {networks.length > 0 ? (
                  <div>
                    <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-cyber-cyan/65">
                      {text.networks || "Networks"}
                    </p>
                    <div className="grid gap-3">
                      {networks.map((network) => (
                        <div
                          key={network.id || network.name}
                          className="flex items-center gap-3 rounded-2xl border border-cyber-cyan/10 bg-cyber-dark/45 px-4 py-3"
                        >
                          {network.logo_path ? (
                            <img
                              src={buildImageUrl(
                                network.logo_path,
                                "w185",
                                FALLBACK_PERSON_IMAGE
                              )}
                              alt={network.name}
                              className="h-10 w-10 rounded-lg bg-white/95 object-contain p-1"
                              loading="lazy"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-cyber-cyan/20 bg-cyber-dark text-xs text-cyber-cyan">
                              {network.name?.slice(0, 2)?.toUpperCase() || "NA"}
                            </div>
                          )}

                          <div>
                            <p className="font-semibold text-cyan-50">
                              {network.name}
                            </p>
                            <p className="text-xs text-cyber-cyan/70">
                              {network.origin_country || naText}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </section>
          ) : null}

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

          {similarTitles.length > 0 ? (
            <section className="card-neon p-5 sm:p-6">
              <h3 className="mb-4 text-xl font-bold text-cyber-cyan">
                {text.similarTitles || "Similar titles"}
              </h3>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {similarTitles.map((item) => {
                  const similarTitle = item.title || item.name;

                  return (
                    <div
                      key={item.id}
                      className="rounded-[1.5rem] border border-cyber-cyan/15 bg-cyber-darker/45 p-4"
                    >
                      <p className="font-semibold text-cyan-50">
                        {similarTitle}
                      </p>
                      <p className="mt-2 text-sm text-cyber-cyan/70">
                        {formatDate(
                          item.release_date || item.first_air_date,
                          naText
                        )}
                      </p>
                      <p className="mt-1 text-sm text-cyber-fuchsia">
                        {text.rating || "Rating"}:{" "}
                        {Number.isFinite(Number(item.vote_average))
                          ? Number(item.vote_average).toFixed(1)
                          : naText}
                      </p>
                    </div>
                  );
                })}
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

            <div className="-mx-1 mb-5 flex gap-2 overflow-x-auto px-1 pb-1 scrollbar-hide sm:mx-0 sm:flex-wrap sm:px-0">
              {movie.seasons
                .filter((season) => season.season_number > 0)
                .map((season) => (
                  <button
                    key={season.id || season.season_number}
                    type="button"
                    onClick={() =>
                      onSeasonSelect && onSeasonSelect(season.season_number)
                    }
                    className={`shrink-0 rounded-xl border px-3 py-2 text-sm ${
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
                <button
                  key={episode.id}
                  type="button"
                  onClick={() =>
                    onEpisodeSelect &&
                    onEpisodeSelect(episode.episode_number)
                  }
                  className="overflow-hidden rounded-[1.5rem] border border-cyber-cyan/20 bg-cyber-darker/40 text-left transition hover:-translate-y-1 hover:border-cyber-fuchsia/40 hover:shadow-lg hover:shadow-cyber-fuchsia/10"
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
                  </div>
                </button>
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
