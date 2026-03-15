import React from "react";
import { Play } from "lucide-react";

const FALLBACK_POSTER =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="600" viewBox="0 0 400 600"><rect width="400" height="600" fill="#020617"/><text x="50%" y="50%" fill="#22d3ee" font-family="Arial, sans-serif" font-size="28" text-anchor="middle" dominant-baseline="middle">No Image</text></svg>'
  );

export default function MovieCard({
  movie,
  onClick,
  href = "#",
  yearLabel = "Year",
  unavailableLabel = "Unavailable",
}) {
  const title = movie.title || movie.name;
  const releaseDate = movie.release_date || movie.first_air_date;
  const rating = movie.vote_average ? Number(movie.vote_average).toFixed(1) : null;
  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : FALLBACK_POSTER;

  return (
    <a
      href={href}
      onClick={(event) => {
        event.preventDefault();
        if (onClick) {
          onClick();
        }
      }}
      className="group block cursor-pointer text-left"
    >
      <div className="relative mb-3 aspect-[2/3] overflow-hidden rounded-[1.4rem] border border-cyber-cyan/20 bg-cyber-darker shadow-lg transition-all group-hover:border-cyber-fuchsia/50 group-hover:shadow-cyber-fuchsia/20">
        <img
          src={posterUrl}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />

        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
          <span className="rounded-full border border-white/10 bg-cyber-dark/75 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-50/80 backdrop-blur">
            {releaseDate?.split("-")[0] || unavailableLabel}
          </span>
          {rating ? (
            <span className="rounded-full border border-cyber-cyan/20 bg-cyber-cyan/15 px-2.5 py-1 text-[11px] font-semibold text-cyber-cyan backdrop-blur">
              {rating}
            </span>
          ) : null}
        </div>

        <div className="absolute inset-0 flex items-center justify-center bg-cyber-dark/60 opacity-0 transition-opacity backdrop-blur-sm group-hover:opacity-100">
          <div className="flex h-14 w-14 scale-90 items-center justify-center rounded-full bg-cyber-gradient shadow-lg transition-transform group-hover:scale-100 sm:h-16 sm:w-16">
            <Play className="mr-0.5 h-6 w-6 fill-white text-white sm:h-8 sm:w-8" />
          </div>
        </div>
      </div>

      <h3 className="line-clamp-2 text-sm font-bold leading-6 text-cyber-cyan transition-colors group-hover:text-cyber-fuchsia sm:text-base">
        {title}
      </h3>
      <p className="mt-1 text-xs text-cyber-cyan/60 sm:text-sm">
        {yearLabel}: {releaseDate?.split("-")[0] || unavailableLabel}
      </p>
    </a>
  );
}
