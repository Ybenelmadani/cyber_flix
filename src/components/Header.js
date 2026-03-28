import React, { useEffect, useRef, useState } from "react";
import { Globe2, House, LogIn, LogOut, Menu, Search, Sparkles, X } from "lucide-react";
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
  const [showMobileNav, setShowMobileNav] = useState(false);
  const menuRef = useRef(null);
  const desktopButtonClass =
    "inline-flex h-9 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-cyber-cyan/25 bg-cyber-darker/70 px-3 text-sm font-semibold text-cyber-cyan transition hover:border-cyber-fuchsia hover:text-cyber-fuchsia";
  const mobileButtonClass =
    "inline-flex w-full items-center justify-start gap-2 rounded-xl border border-cyber-cyan/20 bg-cyber-darker/70 px-3 py-2.5 text-sm font-semibold text-cyber-cyan transition hover:border-cyber-fuchsia hover:text-cyber-fuchsia";

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setShowDropdown(false);
        setShowMobileNav(false);
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
    setShowMobileNav(false);
  };

  return (
    <header className="sticky top-0 z-30 border-b border-cyber-cyan/15 bg-cyber-dark/88 px-2 py-1.5 backdrop-blur-xl sm:px-3">
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

        <label className="relative block flex-1 lg:hidden">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-cyber-cyan/50" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className="h-10 w-full rounded-xl border border-cyber-cyan/20 bg-cyber-darker/80 pl-11 pr-4 text-sm text-cyber-cyan placeholder-cyber-cyan/45 outline-none transition focus:border-cyber-fuchsia focus:ring-2 focus:ring-cyber-fuchsia/15"
          />
        </label>

        <div className="hidden min-w-max flex-1 rounded-[1.6rem] border border-cyber-cyan/15 bg-cyber-darker/55 p-1.5 shadow-[0_18px_60px_rgba(8,18,38,0.28)] lg:block">
          <div className="flex items-center gap-2">
            <label className="relative block w-[30rem]">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-cyber-cyan/50" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="h-9 w-full rounded-xl border border-cyber-cyan/20 bg-cyber-darker/80 pl-11 pr-4 text-sm text-cyber-cyan placeholder-cyber-cyan/45 outline-none transition focus:border-cyber-fuchsia focus:ring-2 focus:ring-cyber-fuchsia/15"
              />
            </label>

            <div className="ml-auto flex items-center gap-2">
              <div className="relative shrink-0" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setShowDropdown((prev) => !prev)}
                  className={desktopButtonClass}
                  aria-expanded={showDropdown}
                  aria-haspopup="menu"
                >
                  {genreLabel}
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

              <span className="inline-flex h-9 items-center gap-2 rounded-xl border border-cyber-fuchsia/20 bg-cyber-fuchsia/10 px-3 text-sm font-semibold text-cyber-fuchsia">
                <Sparkles className="h-4 w-4" />
                Mobile ready
              </span>

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
              <button
                type="button"
                onClick={() => setShowDropdown((prev) => !prev)}
                className={mobileButtonClass}
                aria-expanded={showDropdown}
                aria-haspopup="menu"
              >
                {genreLabel}
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

              <span className="inline-flex w-full items-center gap-2 rounded-xl border border-cyber-fuchsia/20 bg-cyber-fuchsia/10 px-3 py-2.5 text-sm font-semibold text-cyber-fuchsia">
                <Sparkles className="h-4 w-4" />
                Mobile ready
              </span>

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
