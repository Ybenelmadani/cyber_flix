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
      className="group block cursor-pointer text-left active:scale-[0.99]"
    >
      <div className="relative mb-2.5 aspect-[2/3] overflow-hidden rounded-[1.15rem] border border-cyber-cyan/20 bg-cyber-darker shadow-lg transition-all group-hover:border-cyber-fuchsia/50 group-hover:shadow-cyber-fuchsia/20 sm:mb-3 sm:rounded-[1.4rem]">
        <img
          src={posterUrl}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />

        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-2.5 sm:p-3">
          <span className="rounded-full border border-white/10 bg-cyber-dark/75 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-cyan-50/80 backdrop-blur sm:px-2.5 sm:text-[11px] sm:tracking-[0.2em]">
            {releaseDate?.split("-")[0] || unavailableLabel}
          </span>
          {rating ? (
            <span className="rounded-full border border-cyber-cyan/20 bg-cyber-cyan/15 px-2 py-1 text-[10px] font-semibold text-cyber-cyan backdrop-blur sm:px-2.5 sm:text-[11px]">
              {rating}
            </span>
          ) : null}
        </div>

        <div className="absolute right-2.5 top-2.5 flex h-9 w-9 items-center justify-center rounded-full border border-cyber-fuchsia/30 bg-cyber-dark/75 text-cyber-fuchsia shadow-lg shadow-cyber-fuchsia/10 sm:hidden">
          <Play className="mr-0.5 h-4 w-4 fill-current" />
        </div>

        <div className="absolute inset-0 hidden items-center justify-center bg-cyber-dark/60 opacity-0 transition-opacity backdrop-blur-sm sm:flex sm:group-hover:opacity-100">
          <div className="flex h-14 w-14 scale-90 items-center justify-center rounded-full bg-cyber-gradient shadow-lg transition-transform group-hover:scale-100 sm:h-16 sm:w-16">
            <Play className="mr-0.5 h-6 w-6 fill-white text-white sm:h-8 sm:w-8" />
          </div>
        </div>
      </div>

      <h3 className="line-clamp-2 text-sm font-bold leading-5 text-cyber-cyan transition-colors group-hover:text-cyber-fuchsia sm:text-base sm:leading-6">
        {title}
      </h3>
      <p className="mt-1 text-[11px] text-cyber-cyan/60 sm:text-sm">
        {yearLabel}: {releaseDate?.split("-")[0] || unavailableLabel}
      </p>
    </a>
  );
}
