import React from "react";

export default function Genres({ genres = [], onSelect, title = "Filter by genre" }) {
  if (!Array.isArray(genres) || genres.length === 0) {
    return null;
  }

  return (
    <section className="mt-10 rounded-[2rem] border border-cyber-cyan/15 bg-cyber-darker/45 p-5 sm:p-6">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyber-cyan/60">
            Explore
          </p>
          <h2 className="mt-2 text-2xl font-bold text-cyan-50">{title}</h2>
        </div>
        <p className="max-w-xl text-sm leading-6 text-cyan-50/60">
          Pick a genre to rebuild the catalog without losing the clean mobile layout.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:gap-4">
        {genres.map((genre) => (
          <button
            key={genre.id}
            type="button"
            onClick={() => onSelect && onSelect(genre)}
            className="rounded-2xl border border-cyber-cyan/25 bg-cyber-dark/50 px-4 py-3 text-sm font-medium text-cyber-cyan transition hover:border-cyber-fuchsia/35 hover:bg-cyber-fuchsia/10 hover:text-cyan-50 sm:text-base"
          >
            {genre.name}
          </button>
        ))}
      </div>
    </section>
  );
}
