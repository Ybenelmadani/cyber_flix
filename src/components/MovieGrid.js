import React from "react";
import MovieCard from "./MovieCard";

function GridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5">
      {Array.from({ length: 10 }).map((_, idx) => (
        <div key={idx} className="animate-pulse">
          <div className="mb-3 aspect-[2/3] rounded-2xl border border-cyber-cyan/10 bg-cyber-darker" />
          <div className="h-4 rounded bg-cyber-darker/80 mb-2" />
          <div className="h-3 w-2/3 rounded bg-cyber-darker/80" />
        </div>
      ))}
    </div>
  );
}

export default function MovieGrid({
  movies = [],
  onSelect,
  isLoading = false,
  emptyMessage = "No movies to display.",
  detailBasePath = "movie",
  movieCardLabels,
}) {
  if (isLoading) {
    return <GridSkeleton />;
  }

  if (!Array.isArray(movies) || movies.length === 0) {
    return (
      <div className="rounded-[1.75rem] border border-cyber-cyan/15 bg-cyber-darker/40 px-5 py-8 text-center text-cyber-cyan/70">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5">
      {movies.map((movie) => (
        <MovieCard
          key={movie.id}
          movie={movie}
          onClick={() => onSelect && onSelect(movie)}
          href={`/${detailBasePath}/${movie.id}`}
          yearLabel={movieCardLabels?.yearLabel}
          unavailableLabel={movieCardLabels?.unavailableLabel}
        />
      ))}
    </div>
  );
}
