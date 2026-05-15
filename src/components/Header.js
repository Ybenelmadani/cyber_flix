import React, { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown, Globe2, House, LogIn, LogOut, Menu, Search, X } from "lucide-react";
import NavDropdown from "./NavDropdown";
import HeaderDropdown from "./HeaderDropdown";
import CyberflixLogo from "./CyberflixLogo";

const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w92";
const FALLBACK_POSTER =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="46" height="69" viewBox="0 0 46 69"><rect width="46" height="69" fill="#0f172a"/><text x="50%" y="50%" fill="#22d3ee" font-family="Arial" font-size="9" text-anchor="middle" dominant-baseline="middle">No img</text></svg>'
  );

function SearchDropdown({ results, isLoading, onSelect, mediaType }) {
  if (isLoading) {
    return (
      <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-cyber-cyan/20 bg-cyber-dark/95 p-3 shadow-[0_20px_60px_rgba(2,6,23,0.8)] backdrop-blur-xl">
        <div className="flex items-center justify-center gap-2 py-4 text-sm text-cyber-cyan/60">
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-cyber-cyan/30 border-t-cyber-cyan" />
          Searching...
        </div>
      </div>
    );
  }

  if (!results.length) {
    return (
      <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-cyber-cyan/20 bg-cyber-dark/95 p-4 shadow-[0_20px_60px_rgba(2,6,23,0.8)] backdrop-blur-xl">
        <p className="text-center text-sm text-cyber-cyan/50">No results found.</p>
      </div>
    );
  }

  return (
    <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[480px] overflow-y-auto overflow-x-hidden rounded-2xl border border-cyber-cyan/20 bg-cyber-dark/95 py-2 shadow-[0_20px_60px_rgba(2,6,23,0.8)] backdrop-blur-xl">
      {results.map((item) => {
        const title = item.title || item.name || "Unknown";
        const year = (item.release_date || item.first_air_date || "").slice(0, 4);
        const poster = item.poster_path
          ? `${TMDB_IMAGE_BASE}${item.poster_path}`
          : FALLBACK_POSTER;
        const type = item.title ? "movie" : "tv";

        return (
          <button
            key={`${type}-${item.id}`}
            type="button"
            onClick={() => onSelect(item, type)}
            className="flex w-full items-center gap-3 px-3 py-2 text-left transition hover:bg-cyber-cyan/10"
          >
            <img
              src={poster}
              alt={title}
              className="h-14 w-10 shrink-0 rounded-lg object-cover shadow-md"
              onError={(e) => { e.currentTarget.src = FALLBACK_POSTER; }}
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-cyan-50">{title}</p>
              <div className="mt-0.5 flex items-center gap-2">
                {year ? (
                  <span className="text-xs text-cyber-cyan/60">{year}</span>
                ) : null}
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                  type === "tv"
                    ? "bg-cyber-fuchsia/15 text-cyber-fuchsia"
                    : "bg-cyber-cyan/15 text-cyber-cyan"
                }`}>
                  {type === "tv" ? "Series" : "Movie"}
                </span>
              </div>
              {item.vote_average ? (
                <p className="mt-0.5 text-xs text-cyber-cyan/45">
                  ⭐ {Number(item.vote_average).toFixed(1)}
                </p>
              ) : null}
            </div>
          </button>
        );
      })}
    </div>
  );
}

export default function Header({
  searchQuery,
  setSearchQuery,
  genres = [],
  onGenreSelect,
  onGoHome = () => {},
  genreLabel = "Genres",
  searchPlaceholder = "Search for a movie...",
  languageSwitchLabel = "FR",
  onToggleLanguage = () => {},
  user = null,
  labels = {},
  onOpenAuth = () => {},
  onOpenAdmin = () => {},
  onLogout = () => {},
  onUpgrade = () => {},
  onSelectSearchResult = () => {},
  apiBase = "",
  apiLanguage = "en-US",
  mediaType = "movie",
  activeCategory = "popular",
  onMediaTypeChange = () => {},
  onCategoryChange = () => {},
  categories = {},
  modes = {},
}) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);

  // Live search state
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchRef = useRef(null);
  const searchDebounceRef = useRef(null);

  const menuRef = useRef(null);
  const desktopButtonClass =
    "inline-flex h-9 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border border-cyber-cyan/25 bg-cyber-darker/70 px-2.5 text-sm font-semibold text-cyber-cyan transition hover:border-cyber-fuchsia hover:text-cyber-fuchsia";
  const mobileButtonClass =
    "inline-flex w-full items-center justify-start gap-2 rounded-xl border border-cyber-cyan/20 bg-cyber-darker/70 px-3 py-2.5 text-sm font-semibold text-cyber-cyan transition hover:border-cyber-fuchsia hover:text-cyber-fuchsia";

  // Resolve API base
  const resolvedBase = apiBase || (
    process.env.REACT_APP_API_BASE
      ? process.env.REACT_APP_API_BASE.replace(/\/+$/, "").replace(/\/api$/, "") + "/api"
      : "http://localhost:3001/api"
  );

  const fetchSearchResults = useCallback(
    async (query) => {
      if (!query || query.trim().length < 2) {
        setSearchResults([]);
        setShowSearchDropdown(false);
        return;
      }

      setSearchLoading(true);
      setShowSearchDropdown(true);

      try {
        const lang = encodeURIComponent(apiLanguage);
        const q = encodeURIComponent(query.trim());

        const [movieRes, tvRes] = await Promise.allSettled([
          fetch(`${resolvedBase}/tmdb/search?query=${q}&page=1&language=${lang}`).then((r) => r.json()),
          fetch(`${resolvedBase}/tmdb/tv/search?query=${q}&page=1&language=${lang}`).then((r) => r.json()),
        ]);

        const movies = movieRes.status === "fulfilled" ? (movieRes.value.results || []) : [];
        const tvShows = tvRes.status === "fulfilled" ? (tvRes.value.results || []) : [];

        // Merge and sort by popularity, limit to 8 results
        const merged = [...movies.slice(0, 5), ...tvShows.slice(0, 5)]
          .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
          .slice(0, 8);

        setSearchResults(merged);
      } catch {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    },
    [resolvedBase, apiLanguage]
  );

  const handleSearchInput = useCallback(
    (value) => {
      setSearchQuery(value);

      clearTimeout(searchDebounceRef.current);

      if (!value.trim()) {
        setSearchResults([]);
        setShowSearchDropdown(false);
        return;
      }

      searchDebounceRef.current = setTimeout(() => {
        fetchSearchResults(value);
      }, 300);
    },
    [fetchSearchResults, setSearchQuery]
  );

  const handleResultSelect = useCallback(
    (item, type) => {
      setShowSearchDropdown(false);
      setSearchQuery("");
      setSearchResults([]);
      onSelectSearchResult(item, type);
    },
    [onSelectSearchResult, setSearchQuery]
  );

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchDropdown(false);
      }
      // Close new dropdowns
      if (!event.target.closest('.header-dropdown-trigger')) {
        setShowTypeDropdown(false);
        setShowCategoryDropdown(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setShowDropdown(false);
        setShowMobileNav(false);
        setShowSearchDropdown(false);
        setShowTypeDropdown(false);
        setShowCategoryDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useEffect(() => {
    return () => clearTimeout(searchDebounceRef.current);
  }, []);

  const handleGenreSelect = (genre) => {
    if (onGenreSelect) {
      onGenreSelect(genre);
    }
    setShowDropdown(false);
    setShowMobileNav(false);
  };



  return (
    <header className="sticky top-0 z-50 border-b border-cyber-cyan/20 bg-[#020617] px-2 py-2 sm:px-3">
      <div className="mx-auto flex w-full max-w-[118rem] items-center gap-2">
        <button
          type="button"
          onClick={() => setShowMobileNav(true)}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyber-cyan/20 bg-cyber-darker/75 text-cyber-cyan lg:hidden"
          aria-label="Open navigation menu"
          aria-expanded={showMobileNav}
        >
          <Menu className="h-5 w-5" />
        </button>

        <button
          type="button"
          onClick={onGoHome}
          className="shrink-0 text-left transition hover:opacity-90"
          aria-label="Go to home page"
        >
          <CyberflixLogo compact />
        </button>

        {/* Mobile search — inline to avoid remount bug */}
        <div className="relative flex-1 lg:hidden" ref={searchRef}>
          <label className="relative block">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-cyber-cyan/50" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchInput(e.target.value)}
              onFocus={() => { if (searchResults.length > 0) setShowSearchDropdown(true); }}
              placeholder={searchPlaceholder}
              className="h-10 w-full rounded-xl border border-cyber-cyan/20 bg-cyber-darker/80 pl-11 pr-8 text-sm text-cyber-cyan placeholder-cyber-cyan/45 outline-none transition focus:border-cyber-fuchsia focus:ring-2 focus:ring-cyber-fuchsia/15"
              autoComplete="off"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => { setSearchQuery(""); setSearchResults([]); setShowSearchDropdown(false); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-cyber-cyan/40 hover:text-cyber-cyan/70"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </label>
          {showSearchDropdown && searchQuery.trim().length >= 2 ? (
            <SearchDropdown
              results={searchResults}
              isLoading={searchLoading}
              onSelect={handleResultSelect}
              mediaType={mediaType}
            />
          ) : null}
        </div>

        {/* Desktop nav bar */}
        <div className="hidden min-w-max flex-1 rounded-[1.6rem] border border-cyber-cyan/15 bg-cyber-darker/55 p-1.5 shadow-[0_18px_60px_rgba(8,18,38,0.28)] lg:block">
          <div className="flex items-center gap-2">
            {/* Desktop search — inline to avoid remount bug */}
            <div className="relative w-[20rem]" ref={searchRef}>
              <label className="relative block">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-cyber-cyan/50" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchInput(e.target.value)}
                  onFocus={() => { if (searchResults.length > 0) setShowSearchDropdown(true); }}
                  placeholder={searchPlaceholder}
                  className="h-9 w-full rounded-xl border border-cyber-cyan/20 bg-cyber-darker/80 pl-11 pr-8 text-sm text-cyber-cyan placeholder-cyber-cyan/45 outline-none transition focus:border-cyber-fuchsia focus:ring-2 focus:ring-cyber-fuchsia/15"
                  autoComplete="off"
                />
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => { setSearchQuery(""); setSearchResults([]); setShowSearchDropdown(false); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-cyber-cyan/40 hover:text-cyber-cyan/70"
                    aria-label="Clear search"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                ) : null}
              </label>
              {showSearchDropdown && searchQuery.trim().length >= 2 ? (
                <SearchDropdown
                  results={searchResults}
                  isLoading={searchLoading}
                  onSelect={handleResultSelect}
                  mediaType={mediaType}
                />
              ) : null}
            </div>

            <div className="ml-auto flex items-center gap-2">
              {/* Content Type Dropdown */}
              <div className="relative header-dropdown-trigger">
                <button
                  type="button"
                  onClick={() => {
                    setShowTypeDropdown(!showTypeDropdown);
                    setShowCategoryDropdown(false);
                    setShowDropdown(false);
                  }}
                  className={desktopButtonClass}
                >
                  <span>{modes[mediaType] || "Content"}</span>
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showTypeDropdown ? 'rotate-180' : ''}`} />
                </button>
                {showTypeDropdown && (
                  <HeaderDropdown 
                    items={modes}
                    activeKey={mediaType}
                    onSelect={onMediaTypeChange}
                    onClose={() => setShowTypeDropdown(false)}
                  />
                )}
              </div>

              {/* Category Dropdown */}
              <div className="relative header-dropdown-trigger">
                <button
                  type="button"
                  onClick={() => {
                    setShowCategoryDropdown(!showCategoryDropdown);
                    setShowTypeDropdown(false);
                    setShowDropdown(false);
                  }}
                  className={desktopButtonClass}
                >
                  <span>{categories[activeCategory] || "Category"}</span>
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`} />
                </button>
                {showCategoryDropdown && (
                  <HeaderDropdown 
                    items={categories}
                    activeKey={activeCategory}
                    onSelect={onCategoryChange}
                    onClose={() => setShowCategoryDropdown(false)}
                  />
                )}
              </div>

              <div className="relative shrink-0 header-dropdown-trigger" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => {
                    setShowDropdown((prev) => !prev);
                    setShowTypeDropdown(false);
                    setShowCategoryDropdown(false);
                  }}
                  className={desktopButtonClass}
                  aria-expanded={showDropdown}
                  aria-haspopup="menu"
                >
                  {genreLabel}
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showDropdown ? (
                  <NavDropdown genres={genres} onSelect={handleGenreSelect} />
                ) : null}
              </div>

              <button
                type="button"
                onClick={onGoHome}
                className={desktopButtonClass}
              >
                <House className="h-4 w-4" />
                {labels.home || "Home"}
              </button>

              <button
                type="button"
                onClick={onToggleLanguage}
                className={desktopButtonClass}
                aria-label="Switch language"
              >
                <Globe2 className="h-4 w-4" />
                {languageSwitchLabel}
              </button>


              {user ? (
                <>
                  {user.role === "admin" ? (
                    <button type="button" onClick={onOpenAdmin} className={desktopButtonClass}>
                      {labels.admin || "Admin"}
                    </button>
                  ) : null}
                  {user.plan !== "premium" ? (
                    <button
                      type="button"
                      onClick={onUpgrade}
                      className="inline-flex h-9 shrink-0 items-center justify-center whitespace-nowrap rounded-xl border border-amber-300/50 bg-amber-400/10 px-3 text-sm font-semibold text-amber-200 transition hover:bg-amber-400/15"
                    >
                      {labels.upgrade || "Go Premium"}
                    </button>
                  ) : (
                    <span className="inline-flex h-9 shrink-0 items-center justify-center whitespace-nowrap rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-3 text-sm font-semibold text-emerald-200">
                      {labels.premium || "Premium"}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={onLogout}
                    className={desktopButtonClass}
                  >
                    <LogOut className="h-4 w-4" />
                    {labels.logout || "Logout"}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={onOpenAuth}
                  className={desktopButtonClass}
                >
                  <LogIn className="h-4 w-4" />
                  {labels.login || "Login"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {showMobileNav ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/45 lg:hidden"
            onClick={() => setShowMobileNav(false)}
            aria-label="Close mobile navigation overlay"
          />

          <aside className="fixed inset-y-0 left-0 z-50 w-72 border-r border-cyber-cyan/20 bg-cyber-dark/95 p-4 shadow-[0_20px_55px_rgba(2,6,23,0.7)] backdrop-blur-xl lg:hidden">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-cyber-cyan/60">
                Navigation
              </span>
              <button
                type="button"
                onClick={() => setShowMobileNav(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-cyber-cyan/25 bg-cyber-darker/70 text-cyber-cyan"
                aria-label="Close mobile navigation"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2" ref={menuRef}>
              <div className="px-3 pb-1 pt-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-cyber-cyan/40">
                  Content Type
                </span>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {Object.entries(modes).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => {
                        onMediaTypeChange(key);
                        setShowMobileNav(false);
                      }}
                      className={`rounded-xl border py-2 text-sm font-semibold transition ${
                        mediaType === key
                          ? "border-cyber-fuchsia bg-cyber-fuchsia/10 text-cyber-fuchsia"
                          : "border-cyber-cyan/20 bg-cyber-darker/50 text-cyber-cyan"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="px-3 pb-2 pt-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-cyber-cyan/40">
                  Category
                </span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {Object.entries(categories).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => {
                        onCategoryChange(key);
                        setShowMobileNav(false);
                      }}
                      className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                        activeCategory === key
                          ? "border-cyber-fuchsia bg-cyber-fuchsia/10 text-cyber-fuchsia"
                          : "border-cyber-cyan/20 bg-cyber-darker/50 text-cyber-cyan"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-px bg-cyber-cyan/10 mx-3 my-2" />

              <button
                type="button"
                onClick={() => setShowDropdown((prev) => !prev)}
                className={mobileButtonClass}
                aria-expanded={showDropdown}
                aria-haspopup="menu"
              >
                <div className="flex w-full items-center justify-between">
                  <span>{genreLabel}</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                </div>
              </button>

              {showDropdown ? (
                <NavDropdown genres={genres} onSelect={handleGenreSelect} />
              ) : null}

              <button
                type="button"
                onClick={() => {
                  onGoHome();
                  setShowMobileNav(false);
                }}
                className={mobileButtonClass}
              >
                <House className="h-4 w-4" />
                {labels.home || "Home"}
              </button>

              <button
                type="button"
                onClick={() => {
                  onToggleLanguage();
                  setShowMobileNav(false);
                }}
                className={mobileButtonClass}
              >
                <Globe2 className="h-4 w-4" />
                {languageSwitchLabel}
              </button>


              {user ? (
                <>
                  {user.role === "admin" ? (
                    <button
                      type="button"
                      onClick={() => {
                        onOpenAdmin();
                        setShowMobileNav(false);
                      }}
                      className={mobileButtonClass}
                    >
                      {labels.admin || "Admin"}
                    </button>
                  ) : null}

                  {user.plan !== "premium" ? (
                    <button
                      type="button"
                      onClick={() => {
                        onUpgrade();
                        setShowMobileNav(false);
                      }}
                      className="inline-flex w-full items-center justify-start rounded-xl border border-amber-300/50 bg-amber-400/10 px-3 py-2.5 text-sm font-semibold text-amber-200 transition hover:bg-amber-400/15"
                    >
                      {labels.upgrade || "Go Premium"}
                    </button>
                  ) : (
                    <span className="inline-flex w-full items-center justify-start rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-3 py-2.5 text-sm font-semibold text-emerald-200">
                      {labels.premium || "Premium"}
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      onLogout();
                      setShowMobileNav(false);
                    }}
                    className={mobileButtonClass}
                  >
                    <LogOut className="h-4 w-4" />
                    {labels.logout || "Logout"}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    onOpenAuth();
                    setShowMobileNav(false);
                  }}
                  className={mobileButtonClass}
                >
                  <LogIn className="h-4 w-4" />
                  {labels.login || "Login"}
                </button>
              )}
            </div>
          </aside>
        </>
      ) : null}
    </header>
  );
}
