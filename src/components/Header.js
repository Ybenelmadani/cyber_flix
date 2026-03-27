import React, { useEffect, useRef, useState } from "react";
import { Globe2, House, LogIn, LogOut, Search, Sparkles } from "lucide-react";
import NavDropdown from "./NavDropdown";
import CyberflixLogo from "./CyberflixLogo";

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
}) {
  const [showDropdown, setShowDropdown] = useState(false);
  const menuRef = useRef(null);
  const actionButtonClass =
    "shrink-0 whitespace-nowrap rounded-xl border border-cyber-cyan/25 bg-cyber-darker/70 px-4 py-2.5 text-sm font-semibold text-cyber-cyan transition hover:border-cyber-fuchsia hover:text-cyber-fuchsia";

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleGenreSelect = (genre) => {
    if (onGenreSelect) {
      onGenreSelect(genre);
    }
    setShowDropdown(false);
  };

  return (
    <header className="sticky top-0 z-30 border-b border-cyber-cyan/15 bg-cyber-dark/88 px-3 py-3 backdrop-blur-xl sm:px-4 sm:py-4">
      <div className="mx-auto flex max-w-7xl flex-col gap-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-3 lg:flex-1">
            <div className="flex items-center justify-between gap-3 sm:justify-start">
              <button
                type="button"
                onClick={onGoHome}
                className="shrink-0 text-left transition hover:opacity-90"
                aria-label="Go to home page"
              >
                <CyberflixLogo />
              </button>

              <span className="inline-flex items-center gap-2 rounded-full border border-cyber-fuchsia/20 bg-cyber-fuchsia/10 px-3 py-1.5 text-xs font-semibold text-cyber-fuchsia sm:hidden">
                <Sparkles className="h-4 w-4" />
                Mobile ready
              </span>
            </div>

            <div
              className="relative -mx-1 flex items-center gap-2 overflow-x-auto px-1 pb-1 scrollbar-hide"
              ref={menuRef}
            >
              <button
                type="button"
                onClick={() => setShowDropdown((prev) => !prev)}
                className={actionButtonClass}
                aria-expanded={showDropdown}
                aria-haspopup="menu"
              >
                {genreLabel}
              </button>

              <button
                type="button"
                onClick={onGoHome}
                className={`inline-flex items-center gap-2 ${actionButtonClass}`}
              >
                <House className="h-4 w-4" />
                {labels.home || "Home"}
              </button>

              <button
                type="button"
                onClick={onToggleLanguage}
                className={`inline-flex items-center gap-2 ${actionButtonClass}`}
                aria-label="Switch language"
              >
                <Globe2 className="h-4 w-4" />
                {languageSwitchLabel}
              </button>

              {showDropdown ? (
                <NavDropdown genres={genres} onSelect={handleGenreSelect} />
              ) : null}
            </div>
          </div>

          <div className="-mx-1 flex items-center gap-2 overflow-x-auto px-1 pb-1 scrollbar-hide lg:justify-end">
            <span className="hidden items-center gap-2 rounded-full border border-cyber-fuchsia/20 bg-cyber-fuchsia/10 px-3 py-1.5 text-xs font-semibold text-cyber-fuchsia sm:inline-flex">
              <Sparkles className="h-4 w-4" />
              Mobile ready
            </span>

            {user ? (
              <>
                {user.role === "admin" ? (
                  <button
                    type="button"
                    onClick={onOpenAdmin}
                    className={actionButtonClass}
                  >
                    {labels.admin || "Admin"}
                  </button>
                ) : null}
                {user.plan !== "premium" ? (
                  <button
                    type="button"
                    onClick={onUpgrade}
                    className="shrink-0 whitespace-nowrap rounded-xl border border-amber-300/50 bg-amber-400/10 px-4 py-2.5 text-sm font-semibold text-amber-200 transition hover:bg-amber-400/15"
                  >
                    {labels.upgrade || "Go Premium"}
                  </button>
                ) : (
                  <span className="shrink-0 whitespace-nowrap rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-2.5 text-sm font-semibold text-emerald-200">
                    {labels.premium || "Premium"}
                  </span>
                )}
                <button
                  type="button"
                  onClick={onLogout}
                  className={`inline-flex items-center gap-2 ${actionButtonClass}`}
                >
                  <LogOut className="h-4 w-4" />
                  {labels.logout || "Logout"}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={onOpenAuth}
                className={`inline-flex items-center gap-2 ${actionButtonClass}`}
              >
                <LogIn className="h-4 w-4" />
                {labels.login || "Login"}
              </button>
            )}
          </div>
        </div>

        <label className="relative block">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-cyber-cyan/50" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full rounded-2xl border border-cyber-cyan/20 bg-cyber-darker/80 py-3 pl-11 pr-4 text-sm text-cyber-cyan placeholder-cyber-cyan/45 outline-none transition focus:border-cyber-fuchsia focus:ring-2 focus:ring-cyber-fuchsia/15 sm:text-base"
          />
        </label>
      </div>
    </header>
  );
}
