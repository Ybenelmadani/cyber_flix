import React from "react";

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
    results.find((video) => video.site === "YouTube" && video.type === "Trailer") ||
    results.find((video) => video.site === "YouTube") ||
    null
  );
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

export default function EpisodeDetail({
  show,
  episode,
  isLoading,
  onBack,
  labels,
}) {
  if (!show || !episode) return null;

  const text = labels || {};
  const naText = text.na || "N/A";
  const trailer = getTrailer(episode.videos);
  const cast =
    episode?.credits?.cast?.length > 0
      ? episode.credits.cast
      : episode.guest_stars || [];
  const crew = episode?.credits?.crew?.length > 0 ? episode.credits.crew : episode.crew || [];
  const stillUrl = buildImageUrl(
    episode.still_path,
    "w1280",
    FALLBACK_EPISODE_IMAGE
  );
  const title = episode.name || `${text.episode || "Episode"} ${episode.episode_number}`;

  return (
    <div className="animate-in fade-in space-y-6 duration-500">
      <section className="relative overflow-hidden rounded-[2rem] border border-cyber-cyan/15 bg-cyber-darker/70">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${stillUrl})` }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(2,6,23,0.95),rgba(2,6,23,0.88),rgba(15,23,42,0.92))]" />

        <div className="relative px-5 py-6 sm:px-8 sm:py-8">
          <button
            type="button"
            onClick={onBack}
            className="btn-cyber mb-4 min-h-[48px] px-4 py-2 text-sm sm:w-auto"
          >
            {text.back || "Back"}
          </button>

          <div className="max-w-4xl space-y-4">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.35em] text-cyber-cyan/60">
              {show.name || show.title}
            </p>
            <h1 className="text-3xl font-black text-white sm:text-4xl">
              {title}
            </h1>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-cyber-fuchsia/30 bg-cyber-fuchsia/10 px-3 py-1 text-sm text-cyber-fuchsia">
                {text.season || "Season"} {episode.season_number}
              </span>
              <span className="rounded-full border border-cyber-cyan/30 bg-cyber-cyan/10 px-3 py-1 text-sm text-cyber-cyan">
                {text.episode || "Episode"} {episode.episode_number}
              </span>
              <span className="rounded-full border border-cyber-cyan/30 bg-cyber-dark/45 px-3 py-1 text-sm text-cyber-cyan">
                {formatDate(episode.air_date, naText)}
              </span>
            </div>
            <p className="max-w-3xl text-sm leading-7 text-cyan-50/70 sm:text-base">
              {episode.overview || text.noOverview || "No overview available."}
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
          <img
            src={buildImageUrl(episode.still_path, "w780", FALLBACK_EPISODE_IMAGE)}
            alt={title}
            className="w-full rounded-[1.5rem] shadow-lg shadow-cyber-cyan/10"
          />

          <div className="mt-5 grid gap-3 text-sm text-cyber-cyan/75">
            <InfoTile
              label={text.episode || "Episode"}
              value={`${episode.episode_number || naText}`}
            />
            <InfoTile
              label={text.runtime || "Runtime"}
              value={
                episode.runtime ? `${episode.runtime} ${text.minutes || "min"}` : naText
              }
            />
            <InfoTile
              label={text.rating || "Rating"}
              value={
                Number.isFinite(Number(episode.vote_average))
                  ? `${Number(episode.vote_average).toFixed(1)}/10`
                  : naText
              }
            />
            <InfoTile
              label={text.votes || "Votes"}
              value={episode.vote_count ?? naText}
            />
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
                    title="episode-trailer"
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

            <div className="mt-4 grid gap-3 text-sm text-cyber-cyan/80 sm:grid-cols-2">
              <InfoTile
                label={text.releaseDate || "Air date"}
                value={formatDate(episode.air_date, naText)}
              />
              <InfoTile
                label={text.runtime || "Runtime"}
                value={
                  episode.runtime ? `${episode.runtime} ${text.minutes || "min"}` : naText
                }
              />
              <InfoTile
                label={text.rating || "Rating"}
                value={
                  Number.isFinite(Number(episode.vote_average))
                    ? `${Number(episode.vote_average).toFixed(1)}/10`
                    : naText
                }
              />
              <InfoTile
                label={text.votes || "Votes"}
                value={episode.vote_count ?? naText}
              />
            </div>
          </section>

          {cast.length > 0 ? (
            <section className="card-neon p-5 sm:p-6">
              <div className="mb-4 flex flex-col gap-2">
                <h3 className="text-xl font-bold text-cyber-cyan">
                  {text.cast || "Cast"}
                </h3>
                <p className="text-sm text-cyber-cyan/70">
                  {text.castCopy || "Guest stars and actors for this episode."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
                {cast.map((person) => (
                  <PersonCard
                    key={`${person.id || person.name}-${person.character || person.name}`}
                    person={person}
                    subtitle={
                      person.character
                        ? `${text.role || "Role"}: ${person.character}`
                        : person.known_for_department || ""
                    }
                    meta={person.known_for_department || ""}
                  />
                ))}
              </div>
            </section>
          ) : null}

          {crew.length > 0 ? (
            <section className="card-neon p-5 sm:p-6">
              <div className="mb-4 flex flex-col gap-2">
                <h3 className="text-xl font-bold text-cyber-cyan">
                  {text.creativeTeam || "Creative team"}
                </h3>
                <p className="text-sm text-cyber-cyan/70">
                  {text.creativeTeamCopy || "Crew members behind this episode."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
                {crew.slice(0, 8).map((person) => (
                  <PersonCard
                    key={`${person.id || person.name}-${person.job || person.department}`}
                    person={person}
                    subtitle={person.job || person.department || ""}
                    meta={person.department || ""}
                  />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
}
