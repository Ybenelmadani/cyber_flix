import React from "react";

export default function NavDropdown({ genres = [], onSelect }) {
  if (!Array.isArray(genres) || genres.length === 0) {
    return null;
  }

  return (
    <div className="absolute left-0 top-full z-40 mt-2 w-[min(22rem,calc(100vw-2rem))] max-h-80 overflow-y-auto rounded-2xl border border-cyber-cyan/25 bg-cyber-darker/95 p-2 shadow-2xl shadow-cyber-cyan/10 backdrop-blur-xl">
      {genres.map((genre) => (
        <button
          key={genre.id}
          type="button"
          onClick={() => onSelect && onSelect(genre)}
          className="w-full cursor-pointer rounded-xl px-3 py-2.5 text-left text-sm text-cyber-cyan transition hover:bg-cyber-cyan/10 hover:text-cyan-50 sm:text-base"
        >
          {genre.name}
        </button>
      ))}
    </div>
  );
}
