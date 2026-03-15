import React, { useCallback, useEffect, useMemo, useState } from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import MovieGrid from "./components/MovieGrid";
import MovieDetail from "./components/MovieDetail";
import AdminStreamsPanel from "./components/AdminStreamsPanel";
import Genres from "./components/Genres";
import Footer from "./components/Footer";
import AdBanner from "./components/AdBanner";
import AuthPanel from "./components/AuthPanel";
import {
  authAPI,
  clearAuthToken,
  getAuthToken,
  moviesAPI,
  paymentsAPI,
  setAuthToken,
  streamsAPI,
  tmdbAPI,
} from "./services/api";
import { trackEvent, trackPageView } from "./services/analytics";

const LANG_ORDER = ["en", "fr", "ar"];
const API_LANGUAGE_MAP = {
  en: "en-US",
  fr: "fr-FR",
  ar: "ar-SA",
};
const ADMIN_STREAMS_PATH = "/admin/streams";

const parseDetailPath = (path) => {
  const match = path.match(/^\/(movie|tv)\/(\d+)$/i);
  if (!match) {
    return null;
  }
  return {
    media: match[1].toLowerCase(),
    id: Number(match[2]),
  };
};

const detailPath = (media, id) => `/${media}/${id}`;
const isAdminPath = (path) => path === ADMIN_STREAMS_PATH;

const setMeta = (name, content) => {
  let tag = document.querySelector(`meta[name="${name}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("name", name);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
};

const TRANSLATIONS = {
  en: {
    modes: { movie: "Movies", tv: "Series" },
    categories: {
      movie: {
        popular: "Popular",
        trending: "Trending",
        topRated: "Top Rated",
        release: "Upcoming",
        favorites: "Favorites",
      },
      tv: {
        popular: "Popular",
        trending: "Trending",
        topRated: "Top Rated",
        release: "On Air",
        favorites: "Favorites",
      },
    },
    header: {
      genres: "Genres",
      searchPlaceholder: "Search for a movie or series...",
      login: "Login",
      logout: "Logout",
      upgrade: "Go Premium",
      premium: "Premium",
    },
    hero: {
      movieTitle: "Streaming cinema, fast and simple",
      movieSubtitle:
        "Popular, trending, top-rated and upcoming movies in one place.",
      tvTitle: "Series hub with full seasons",
      tvSubtitle: "Explore show details, seasons, episodes, and trailers.",
    },
    genres: { title: "Filter by genre", selectedPrefix: "Genre" },
    errorBanner: { retry: "Retry", close: "Close" },
    empty: {
      search: "No results found for this search.",
      favorites: "No favorites yet.",
      defaultMovie: "No movies available.",
      defaultTv: "No series available.",
    },
    errors: {
      loadGenres: "Unable to load genres.",
      loadFavorites: "Unable to load favorites.",
      authRequired: "Please log in to manage favorites.",
      loadItems: "Unable to load titles.",
      search: "Search failed.",
      details: "Unable to load details.",
      season: "Unable to load season episodes.",
      favoritesUpdate: "Unable to update favorites.",
      auth: "Authentication failed.",
    },
    card: { yearLabel: "Year", unavailableLabel: "Unavailable" },
    detail: {
      back: "Back",
      addFavorite: "Add Favorite",
      removeFavorite: "Remove Favorite",
      loading: "Loading details...",
      noOverview: "No overview available.",
      year: "Year",
      rating: "Rating",
      runtime: "Runtime",
      minutes: "min",
      info: "Information",
      status: "Status",
      language: "Language",
      popularity: "Popularity",
      votes: "Votes",
      watchNow: "Watch now",
      noTrailer: "No trailer available for this title.",
      seasonsAndEpisodes: "Seasons and episodes",
      season: "Season",
      seasons: "Seasons",
      episode: "Episode",
      episodes: "Episodes",
      noEpisodes: "No episodes found for this season.",
      watchProviders: "Where to watch",
      providerCountry: "Country",
      noProvidersCountry: "No official providers found for this country.",
      stream: "Streaming",
      rent: "Rent",
      buy: "Buy",
      free: "Free",
      na: "N/A",
    },
    auth: {
      loginTitle: "Sign in",
      registerTitle: "Create account",
      close: "Close",
      name: "Full name",
      email: "Email",
      password: "Password",
      login: "Login",
      register: "Register",
      loading: "Please wait...",
      switchToRegister: "No account? Create one",
      switchToLogin: "Already have an account? Login",
      error: "Unable to authenticate",
    },
    ads: { label: "Advertisement" },
    footer: { rights: "(c) 2026 CYBERFLIX - All rights reserved" },
  },
  fr: {
    modes: { movie: "Films", tv: "Series" },
    categories: {
      movie: {
        popular: "Populaires",
        trending: "Tendances",
        topRated: "Mieux notes",
        release: "A venir",
        favorites: "Favoris",
      },
      tv: {
        popular: "Populaires",
        trending: "Tendances",
        topRated: "Mieux notes",
        release: "En diffusion",
        favorites: "Favoris",
      },
    },
    header: {
      genres: "Genres",
      searchPlaceholder: "Rechercher un film ou une serie...",
      login: "Connexion",
      logout: "Deconnexion",
      upgrade: "Passer Premium",
      premium: "Premium",
    },
    hero: {
      movieTitle: "Cinema en streaming, simple et rapide",
      movieSubtitle:
        "Populaires, tendances, tops et nouveautes en un seul endroit.",
      tvTitle: "Univers series avec saisons completes",
      tvSubtitle: "Consulte les details, saisons, episodes et trailers.",
    },
    genres: { title: "Filtrer par genre", selectedPrefix: "Genre" },
    errorBanner: { retry: "Reessayer", close: "Fermer" },
    empty: {
      search: "Aucun resultat pour cette recherche.",
      favorites: "Aucun favori pour le moment.",
      defaultMovie: "Aucun film disponible.",
      defaultTv: "Aucune serie disponible.",
    },
    errors: {
      loadGenres: "Impossible de charger les genres.",
      loadFavorites: "Impossible de charger les favoris.",
      authRequired: "Connecte-toi pour gerer les favoris.",
      loadItems: "Impossible de charger les titres.",
      search: "La recherche a echoue.",
      details: "Impossible de charger les details.",
      season: "Impossible de charger les episodes de la saison.",
      favoritesUpdate: "Mise a jour des favoris impossible.",
      auth: "Authentification echouee.",
    },
    card: { yearLabel: "Annee", unavailableLabel: "Indisponible" },
    detail: {
      back: "Retour",
      addFavorite: "Ajouter aux favoris",
      removeFavorite: "Retirer des favoris",
      loading: "Chargement des details...",
      noOverview: "Aucun resume disponible.",
      year: "Annee",
      rating: "Note",
      runtime: "Duree",
      minutes: "min",
      info: "Informations",
      status: "Statut",
      language: "Langue",
      popularity: "Popularite",
      votes: "Votes",
      watchNow: "Regarder",
      noTrailer: "Aucun trailer disponible pour ce titre.",
      seasonsAndEpisodes: "Saisons et episodes",
      season: "Saison",
      seasons: "Saisons",
      episode: "Episode",
      episodes: "Episodes",
      noEpisodes: "Aucun episode trouve pour cette saison.",
      watchProviders: "Ou regarder",
      providerCountry: "Pays",
      noProvidersCountry:
        "Aucun fournisseur officiel trouve pour ce pays.",
      stream: "Streaming",
      rent: "Location",
      buy: "Achat",
      free: "Gratuit",
      na: "N/A",
    },
    auth: {
      loginTitle: "Connexion",
      registerTitle: "Creer un compte",
      close: "Fermer",
      name: "Nom complet",
      email: "Email",
      password: "Mot de passe",
      login: "Connexion",
      register: "Inscription",
      loading: "Patiente...",
      switchToRegister: "Pas de compte ? Creer un compte",
      switchToLogin: "Deja un compte ? Connecte-toi",
      error: "Impossible de s'authentifier",
    },
    ads: { label: "Publicite" },
    footer: { rights: "(c) 2026 CYBERFLIX - Tous droits reserves" },
  },
  ar: {
    modes: { movie: "أفلام", tv: "مسلسلات" },
    categories: {
      movie: {
        popular: "الشائع",
        trending: "الرائج",
        topRated: "الأعلى تقييما",
        release: "قريبا",
        favorites: "المفضلة",
      },
      tv: {
        popular: "الشائع",
        trending: "الرائج",
        topRated: "الأعلى تقييما",
        release: "يعرض الآن",
        favorites: "المفضلة",
      },
    },
    header: {
      genres: "التصنيفات",
      searchPlaceholder: "ابحث عن فيلم أو مسلسل...",
      login: "تسجيل الدخول",
      logout: "تسجيل الخروج",
      upgrade: "ترقية بريميوم",
      premium: "بريميوم",
    },
    hero: {
      movieTitle: "سينما رقمية بسرعة وسهولة",
      movieSubtitle:
        "الأفلام الشائعة والرائجة والأعلى تقييما في مكان واحد.",
      tvTitle: "عالم المسلسلات مع المواسم الكاملة",
      tvSubtitle: "استكشف التفاصيل والمواسم والحلقات والمقاطع الرسمية.",
    },
    genres: { title: "تصفية حسب النوع", selectedPrefix: "النوع" },
    errorBanner: { retry: "إعادة المحاولة", close: "إغلاق" },
    empty: {
      search: "لا توجد نتائج لهذا البحث.",
      favorites: "لا توجد عناصر مفضلة بعد.",
      defaultMovie: "لا توجد أفلام متاحة.",
      defaultTv: "لا توجد مسلسلات متاحة.",
    },
    errors: {
      loadGenres: "تعذر تحميل الأنواع.",
      loadFavorites: "تعذر تحميل المفضلة.",
      authRequired: "يرجى تسجيل الدخول لإدارة المفضلة.",
      loadItems: "تعذر تحميل المحتوى.",
      search: "فشل البحث.",
      details: "تعذر تحميل التفاصيل.",
      season: "تعذر تحميل حلقات الموسم.",
      favoritesUpdate: "تعذر تحديث المفضلة.",
      auth: "فشلت المصادقة.",
    },
    card: { yearLabel: "السنة", unavailableLabel: "غير متوفر" },
    detail: {
      back: "رجوع",
      addFavorite: "إضافة للمفضلة",
      removeFavorite: "إزالة من المفضلة",
      loading: "جاري تحميل التفاصيل...",
      noOverview: "لا يوجد ملخص متاح.",
      year: "السنة",
      rating: "التقييم",
      runtime: "المدة",
      minutes: "د",
      info: "معلومات",
      status: "الحالة",
      language: "اللغة",
      popularity: "الشعبية",
      votes: "الأصوات",
      watchNow: "مشاهدة",
      noTrailer: "لا يوجد مقطع متاح لهذا العنوان.",
      seasonsAndEpisodes: "المواسم والحلقات",
      season: "الموسم",
      seasons: "المواسم",
      episode: "الحلقة",
      episodes: "الحلقات",
      noEpisodes: "لا توجد حلقات لهذا الموسم.",
      watchProviders: "أين تشاهد",
      providerCountry: "الدولة",
      noProvidersCountry: "لا توجد منصات رسمية لهذا البلد.",
      stream: "بث",
      rent: "إيجار",
      buy: "شراء",
      free: "مجاني",
      na: "غير متوفر",
    },
    auth: {
      loginTitle: "تسجيل الدخول",
      registerTitle: "إنشاء حساب",
      close: "إغلاق",
      name: "الاسم الكامل",
      email: "البريد الإلكتروني",
      password: "كلمة المرور",
      login: "دخول",
      register: "تسجيل",
      loading: "يرجى الانتظار...",
      switchToRegister: "ليس لديك حساب؟ أنشئ حسابا",
      switchToLogin: "لديك حساب؟ سجل الدخول",
      error: "تعذر تسجيل الدخول",
    },
    ads: { label: "إعلان" },
    footer: { rights: "(c) 2026 CYBERFLIX - جميع الحقوق محفوظة" },
  },
};

export default function App() {
  const [routePath, setRoutePath] = useState(
    () => window.location.pathname || "/"
  );
  const [language, setLanguage] = useState(
    () => localStorage.getItem("cyberflix_lang") || "en"
  );
  const [mediaType, setMediaType] = useState("movie");
  const [items, setItems] = useState([]);
  const [genres, setGenres] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedDetails, setSelectedDetails] = useState(null);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [activeCategory, setActiveCategory] = useState("popular");
  const [favorites, setFavorites] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [seasonDetails, setSeasonDetails] = useState(null);
  const [watchProviders, setWatchProviders] = useState(null);
  const [providerCountry, setProviderCountry] = useState("MA");
  const [isLoading, setIsLoading] = useState(false);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAuthPanel, setShowAuthPanel] = useState(false);
  const [authUser, setAuthUser] = useState(null);

  const [servers, setServers] = useState([]);
  const [activeServer, setActiveServer] = useState(null);

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const apiLanguage = API_LANGUAGE_MAP[language] || API_LANGUAGE_MAP.en;
  const currentCategories =
    mediaType === "movie" ? t.categories.movie : t.categories.tv;
  const isRTL = language === "ar";
  const hasPremium = authUser?.plan === "premium";
  const isAdminRoute = isAdminPath(routePath);

  const nextLanguageLabel = useMemo(() => {
    const index = LANG_ORDER.indexOf(language);
    const next = LANG_ORDER[(index + 1) % LANG_ORDER.length] || "en";
    return next.toUpperCase();
  }, [language]);

  const uiCopy = useMemo(
    () =>
      language === "fr"
        ? {
            heroPrimary: "Voir le catalogue",
            heroSecondary: "Explorer les genres",
            controlsTitle: "Navigation rapide",
            controlsSubtitle:
              "Bascule entre films, series et categories sans perdre une mise en page propre sur mobile.",
            modeLabel: "Type de contenu",
            categoryLabel: "Categories",
            browseTitle: "Catalogue en direct",
            browseSubtitle:
              "Une landing plus riche, mais toujours lisible sur petit ecran.",
            featureEyebrow: "Landing page",
            features: [
              {
                title: "Header compact",
                description:
                  "Les actions essentielles restent accessibles meme sur petit ecran.",
              },
              {
                title: "Cartes plus stables",
                description:
                  "Les posters et titres gardent une bonne densite sans casser la grille.",
              },
              {
                title: "Sections mieux rythmees",
                description:
                  "Hero, filtres, catalogue et genres ont maintenant une vraie hierarchie visuelle.",
              },
            ],
          }
        : {
            heroPrimary: "Browse catalog",
            heroSecondary: "Explore genres",
            controlsTitle: "Quick navigation",
            controlsSubtitle:
              "Switch between movies, series and categories without losing a clean mobile layout.",
            modeLabel: "Content type",
            categoryLabel: "Categories",
            browseTitle: "Live catalog",
            browseSubtitle:
              "A stronger landing page that still feels clear on small screens.",
            featureEyebrow: "Landing page",
            features: [
              {
                title: "Compact header",
                description:
                  "Core actions stay reachable even on smaller screens.",
              },
              {
                title: "More stable cards",
                description:
                  "Posters and titles keep a tighter rhythm without breaking the grid.",
              },
              {
                title: "Better section pacing",
                description:
                  "Hero, filters, catalog and genres now have clearer visual hierarchy.",
              },
            ],
          },
    [language]
  );

  const scrollToSection = useCallback((sectionId) => {
    document
      .getElementById(sectionId)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const clearError = () => setError("");
  const scrollToPlayer = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const normalizeServers = useCallback((sources = []) => {
    return sources
      .filter((source) => source?.url)
      .map((source, index) => ({
        name:
          source.name ||
          `${source.quality || "Server"}${
            source.language ? ` - ${source.language}` : ""
          }` ||
          `Server ${index + 1}`,
        url: source.url,
        type: source.type || (source.url?.includes(".m3u8") ? "hls" : "mp4"),
        quality: source.quality || null,
        language: source.language || null,
        isPremium: Boolean(source.isPremium),
      }));
  }, []);

  const loadAuthUser = useCallback(async () => {
    if (!getAuthToken()) {
      setAuthUser(null);
      setFavorites([]);
      return;
    }

    try {
      const response = await authAPI.me();
      setAuthUser(response.user);
    } catch {
      clearAuthToken();
      setAuthUser(null);
      setFavorites([]);
    }
  }, []);

  const loadFavorites = useCallback(async () => {
    if (!getAuthToken()) {
      setFavorites([]);
      return;
    }

    try {
      const data = await moviesAPI.getFavorites();
      setFavorites(data.favorites || []);
    } catch (err) {
      if (err.status === 401) {
        clearAuthToken();
        setAuthUser(null);
        setFavorites([]);
        return;
      }
      setError(t.errors.loadFavorites);
    }
  }, [t.errors.loadFavorites]);

  const loadGenres = useCallback(async () => {
    try {
      const data =
        mediaType === "movie"
          ? await tmdbAPI.genres(apiLanguage)
          : await tmdbAPI.tvGenres(apiLanguage);
      setGenres(data.genres || []);
    } catch {
      setError(t.errors.loadGenres);
    }
  }, [apiLanguage, mediaType, t.errors.loadGenres]);

  const loadItems = useCallback(
    async ({ category = "popular", genreId = null, media = mediaType } = {}) => {
      setIsLoading(true);
      clearError();

      try {
        let data;

        if (category === "favorites") {
          if (!getAuthToken()) {
            setError(t.errors.authRequired);
            setShowAuthPanel(true);
            setItems([]);
            return;
          }
          await loadFavorites();
          setItems([]);
        } else if (genreId) {
          data =
            media === "movie"
              ? await tmdbAPI.byGenre(genreId, 1, apiLanguage)
              : await tmdbAPI.tvByGenre(genreId, 1, apiLanguage);
          setItems(data.results || []);
        } else if (category === "trending") {
          data =
            media === "movie"
              ? await tmdbAPI.trending("week", apiLanguage)
              : await tmdbAPI.tvTrending("week", apiLanguage);
          setItems(data.results || []);
        } else if (category === "topRated") {
          data =
            media === "movie"
              ? await tmdbAPI.topRated(1, apiLanguage)
              : await tmdbAPI.tvTopRated(1, apiLanguage);
          setItems(data.results || []);
        } else if (category === "release") {
          data =
            media === "movie"
              ? await tmdbAPI.upcoming(1, apiLanguage)
              : await tmdbAPI.tvOnTheAir(1, apiLanguage);
          setItems(data.results || []);
        } else {
          data =
            media === "movie"
              ? await tmdbAPI.popular(1, apiLanguage)
              : await tmdbAPI.tvPopular(1, apiLanguage);
          setItems(data.results || []);
        }
      } catch {
        setError(t.errors.loadItems);
      } finally {
        setIsLoading(false);
      }
    },
    [apiLanguage, loadFavorites, mediaType, t.errors.authRequired, t.errors.loadItems]
  );

  const loadSeason = useCallback(
    async (showId, seasonNumber) => {
      try {
        const season = await tmdbAPI.tvSeasonDetails(
          showId,
          seasonNumber,
          apiLanguage
        );
        setSeasonDetails(season);
        setSelectedSeason(seasonNumber);
        setServers([]);
        setActiveServer(null);
      } catch {
        setError(t.errors.season);
      }
    },
    [apiLanguage, t.errors.season]
  );

  const handleEpisodeSelect = useCallback(
    async (episodeNumber) => {
      const showId = (selectedDetails || selectedItem)?.id;
      if (!showId || !selectedSeason) return;
      clearError();

      try {
        const response = await streamsAPI.getEpisodeStream(
          showId,
          selectedSeason,
          episodeNumber
        );
        const episodeServers = normalizeServers(response?.stream?.sources || []);
        setServers(episodeServers);
        setActiveServer(episodeServers[0] || null);
        window.requestAnimationFrame(scrollToPlayer);
      } catch (err) {
        setServers([]);
        setActiveServer(null);
        setError(err.message || t.errors.details);
      }
    },
    [normalizeServers, scrollToPlayer, selectedDetails, selectedItem, selectedSeason, t.errors.details]
  );

  const openDetailById = useCallback(
    async ({ media, id, seedItem = null, pushState = true }) => {
      const path = detailPath(media, id);

      if (pushState) {
        window.history.pushState({}, "", path);
      }

      setRoutePath(path);
      setMediaType(media);
      setSelectedItem(seedItem || { id, title: "...", name: "..." });
      setSelectedDetails(null);
      setSeasonDetails(null);
      setSelectedSeason(null);
      setWatchProviders(null);
      setServers([]);
      setActiveServer(null);
      setIsDetailsLoading(true);
      clearError();

      try {
        const data =
          media === "movie"
            ? await tmdbAPI.details(id, apiLanguage)
            : await tmdbAPI.tvDetails(id, apiLanguage);

        setSelectedDetails(data);

        const providers =
          media === "movie"
            ? await tmdbAPI.movieWatchProviders(id)
            : await tmdbAPI.tvWatchProviders(id);

        setWatchProviders(providers?.results || {});

        if (media === "movie") {
          try {
            const streamResponse = await streamsAPI.getMovieStream(id);
            const movieServers = normalizeServers(
              streamResponse?.stream?.sources || []
            );
            setServers(movieServers);
            setActiveServer(movieServers[0] || null);
          } catch {
            setServers([]);
            setActiveServer(null);
          }
        }

        if (media === "tv" && Array.isArray(data.seasons)) {
          const firstSeason = data.seasons.find(
            (season) => season.season_number > 0
          );
          if (firstSeason) {
            await loadSeason(id, firstSeason.season_number);
          }
        }

        trackEvent("open_detail", { media_type: media, item_id: id });
      } catch {
        setError(t.errors.details);
      } finally {
        setIsDetailsLoading(false);
      }
    },
    [apiLanguage, loadSeason, normalizeServers, t.errors.details]
  );

  const goHome = useCallback((pushState = true) => {
    if (pushState) {
      window.history.pushState({}, "", "/");
    }
    setRoutePath("/");
    setSelectedItem(null);
    setSelectedDetails(null);
    setSelectedSeason(null);
    setSeasonDetails(null);
    setWatchProviders(null);
    setServers([]);
    setActiveServer(null);
  }, []);

  const openAdminPanel = useCallback((pushState = true) => {
    if (pushState) {
      window.history.pushState({}, "", ADMIN_STREAMS_PATH);
    }
    setRoutePath(ADMIN_STREAMS_PATH);
    setSelectedItem(null);
    setSelectedDetails(null);
    setSelectedSeason(null);
    setSeasonDetails(null);
    setWatchProviders(null);
    setServers([]);
    setActiveServer(null);
    setError("");
  }, []);

  useEffect(() => {
    trackPageView(routePath);
  }, [routePath]);

  useEffect(() => {
    const path = window.location.pathname;
    const parsed = parseDetailPath(path);

    if (isAdminPath(path)) {
      openAdminPanel(false);
    } else if (parsed) {
      openDetailById({ media: parsed.media, id: parsed.id, pushState: false });
    } else {
      setRoutePath("/");
    }

    const onPopState = () => {
      const path = window.location.pathname;
      const detail = parseDetailPath(path);

      if (isAdminPath(path)) {
        openAdminPanel(false);
      } else if (detail) {
        openDetailById({
          media: detail.media,
          id: detail.id,
          pushState: false,
        });
      } else {
        goHome(false);
      }
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [goHome, openAdminPanel, openDetailById]);

  useEffect(() => {
    localStorage.setItem("cyberflix_lang", language);
    if (authUser) {
      authAPI.setLanguage(language).catch(() => {});
    }
  }, [authUser, language]);

  useEffect(() => {
    const titleBase = mediaType === "movie" ? "Movies" : "Series";

    if (selectedDetails) {
      const detailTitle =
        selectedDetails.title || selectedDetails.name || "Details";
      document.title = `${detailTitle} | CYBERFLIX`;
      setMeta(
        "description",
        selectedDetails.overview ||
          `Watch ${detailTitle} details, seasons, episodes and legal providers.`
      );
    } else {
      document.title = `CYBERFLIX | ${titleBase}`;
      setMeta(
        "description",
        "Movies and series discovery platform with legal watch providers."
      );
    }
  }, [mediaType, selectedDetails]);

  useEffect(() => {
    loadAuthUser();
  }, [loadAuthUser]);

  useEffect(() => {
    if (routePath !== "/") return;

    setSelectedGenre(null);
    setActiveCategory("popular");
    loadGenres();
    loadItems({ category: "popular", genreId: null, media: mediaType });
  }, [language, loadGenres, loadItems, mediaType, routePath]);

  useEffect(() => {
    if (routePath !== "/") return;

    const timer = setTimeout(async () => {
      const query = searchQuery.trim();

      if (!query) {
        loadItems({
          category: activeCategory,
          genreId: selectedGenre?.id || null,
          media: mediaType,
        });
        return;
      }

      setSelectedGenre(null);
      setActiveCategory("popular");
      setIsLoading(true);
      clearError();

      try {
        const data =
          mediaType === "movie"
            ? await tmdbAPI.search(query, 1, apiLanguage)
            : await tmdbAPI.tvSearch(query, 1, apiLanguage);
        setItems(data.results || []);
      } catch {
        setError(t.errors.search);
      } finally {
        setIsLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [
    activeCategory,
    apiLanguage,
    loadItems,
    mediaType,
    routePath,
    searchQuery,
    selectedGenre?.id,
    t.errors.search,
  ]);

  const displayedItems = useMemo(() => {
    if (activeCategory !== "favorites") {
      return items;
    }

    return favorites
      .filter((fav) => (fav.mediaType || "movie") === mediaType)
      .map((fav) => ({
        id: fav.movieId,
        title: fav.title,
        name: fav.title,
        poster_path: fav.poster,
        vote_average: fav.rating,
        favoriteKey: fav.favoriteKey,
      }));
  }, [activeCategory, favorites, items, mediaType]);

  const selectedId = selectedDetails?.id || selectedItem?.id;
  const selectedFavoriteKey = `${mediaType}-${selectedId}`;
  const isSelectedFavorite = favorites.some(
    (fav) => fav.favoriteKey === selectedFavoriteKey
  );
  const heroStats = [
    {
      label: language === "fr" ? "Titres visibles" : "Visible titles",
      value: isLoading ? "..." : String(displayedItems.length || items.length || 0),
    },
    {
      label: language === "fr" ? "Genres" : "Genres",
      value: String(genres.length || 0),
    },
    {
      label: language === "fr" ? "Favoris" : "Favorites",
      value: String(favorites.length || 0),
    },
  ];

  const handleCategoryChange = async (category) => {
    setActiveCategory(category);
    setSelectedGenre(null);
    await loadItems({ category, genreId: null, media: mediaType });
    trackEvent("change_category", { category, media_type: mediaType });
  };

  const handleGenreSelect = async (genre) => {
    setSelectedGenre(genre);
    setActiveCategory("popular");
    await loadItems({ category: "popular", genreId: genre.id, media: mediaType });
  };

  const handleToggleFavorite = async () => {
    const target = selectedDetails || selectedItem;
    if (!target) return;

    if (!getAuthToken()) {
      setError(t.errors.authRequired);
      setShowAuthPanel(true);
      return;
    }

    const key = `${mediaType}-${target.id}`;
    clearError();

    try {
      if (isSelectedFavorite) {
        await moviesAPI.removeFavorite(key);
      } else {
        await moviesAPI.addFavorite({
          movieId: target.id,
          mediaType,
          favoriteKey: key,
          title: target.title || target.name,
          poster: target.poster_path,
          rating: target.vote_average,
        });
      }
      await loadFavorites();
    } catch {
      setError(t.errors.favoritesUpdate);
    }
  };

  const toggleLanguage = () => {
    const index = LANG_ORDER.indexOf(language);
    const next = LANG_ORDER[(index + 1) % LANG_ORDER.length] || "en";
    setLanguage(next);
  };

  const handleLogin = async ({ email, password }) => {
    const response = await authAPI.login({ email, password });
    setAuthToken(response.token);
    setAuthUser(response.user);
    setShowAuthPanel(false);
    await loadFavorites();
  };

  const handleRegister = async ({ name, email, password }) => {
    const response = await authAPI.register({ name, email, password });
    setAuthToken(response.token);
    setAuthUser(response.user);
    setShowAuthPanel(false);
    await loadFavorites();
  };

  const handleLogout = () => {
    clearAuthToken();
    setAuthUser(null);
    setFavorites([]);

    if (activeCategory === "favorites") {
      setActiveCategory("popular");
      loadItems({ category: "popular", genreId: null, media: mediaType });
    }
  };

  const handleUpgrade = async () => {
    if (!getAuthToken()) {
      setShowAuthPanel(true);
      return;
    }

    try {
      const checkout = await paymentsAPI.createCheckoutSession();
      if (checkout?.checkoutUrl) {
        window.location.href = checkout.checkoutUrl;
        return;
      }

      const response = await paymentsAPI.mockUpgrade();
      setAuthUser(response.user);
    } catch (err) {
      if (err.status === 400) {
        const response = await paymentsAPI.mockUpgrade();
        setAuthUser(response.user);
      } else {
        setError(t.errors.auth);
      }
    }
  };

  return (
    <div
      className="min-h-screen bg-cyber-dark text-cyan-50"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        genres={genres}
        onGenreSelect={handleGenreSelect}
        genreLabel={t.header.genres}
        searchPlaceholder={t.header.searchPlaceholder}
        languageSwitchLabel={nextLanguageLabel}
        onToggleLanguage={toggleLanguage}
        user={authUser}
        labels={t.header}
        onOpenAuth={() => setShowAuthPanel(true)}
        onOpenAdmin={() => openAdminPanel(true)}
        onLogout={handleLogout}
        onUpgrade={handleUpgrade}
      />

      <main className="mx-auto flex w-full max-w-7xl flex-col px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {isAdminRoute ? (
          <AdminStreamsPanel user={authUser} onBack={() => goHome(true)} />
        ) : !selectedItem ? (
          <>
            <Hero
              title={mediaType === "movie" ? t.hero.movieTitle : t.hero.tvTitle}
              subtitle={
                mediaType === "movie" ? t.hero.movieSubtitle : t.hero.tvSubtitle
              }
              modeLabel={mediaType === "movie" ? t.modes.movie : t.modes.tv}
              categoryLabel={currentCategories[activeCategory]}
              stats={heroStats}
              primaryLabel={uiCopy.heroPrimary}
              secondaryLabel={uiCopy.heroSecondary}
              onPrimaryAction={() => scrollToSection("catalog-section")}
              onSecondaryAction={() => scrollToSection("genres-section")}
            />

            <AdBanner hidden={hasPremium} label={t.ads.label} />

            <section className="mb-8 rounded-[2rem] border border-cyber-cyan/15 bg-cyber-darker/45 p-5 sm:p-6">
              <div className="mb-6 flex flex-col gap-2">
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyber-cyan/55">
                  {uiCopy.featureEyebrow}
                </p>
                <h2 className="text-2xl font-bold text-cyan-50">
                  {uiCopy.controlsTitle}
                </h2>
                <p className="max-w-3xl text-sm leading-6 text-cyan-50/60">
                  {uiCopy.controlsSubtitle}
                </p>
              </div>

              <div className="grid gap-4 lg:grid-cols-[minmax(220px,0.35fr)_minmax(0,1fr)]">
                <div className="rounded-[1.5rem] border border-cyber-cyan/10 bg-cyber-dark/40 p-4">
                  <p className="mb-3 text-sm font-semibold text-cyan-50">
                    {uiCopy.modeLabel}
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setMediaType("movie");
                        goHome();
                      }}
                      className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                        mediaType === "movie"
                          ? "border-cyber-fuchsia bg-cyber-fuchsia/10 text-cyber-fuchsia"
                          : "border-cyber-cyan/30 text-cyber-cyan"
                      }`}
                    >
                      {t.modes.movie}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setMediaType("tv");
                        goHome();
                      }}
                      className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                        mediaType === "tv"
                          ? "border-cyber-fuchsia bg-cyber-fuchsia/10 text-cyber-fuchsia"
                          : "border-cyber-cyan/30 text-cyber-cyan"
                      }`}
                    >
                      {t.modes.tv}
                    </button>
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-cyber-cyan/10 bg-cyber-dark/40 p-4">
                  <p className="mb-3 text-sm font-semibold text-cyan-50">
                    {uiCopy.categoryLabel}
                  </p>
                  <div className="flex flex-wrap gap-1  ">
                    {Object.entries(currentCategories).map(([key, label]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handleCategoryChange(key)}
                        className={`rounded-2xl w-50 border px-4 py-3 text-sm font-semibold transition ${
                          activeCategory === key
                            ? "border-cyber-fuchsia bg-cyber-fuchsia/10 text-cyber-fuchsia"
                            : "border-cyber-cyan/30 text-cyber-cyan hover:border-cyber-cyan"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-8 grid gap-4 md:grid-cols-3">
              {uiCopy.features.map((feature) => (
                <article
                  key={feature.title}
                  className="rounded-[1.75rem] border border-cyber-cyan/15 bg-cyber-darker/45 p-5"
                >
                  <h3 className="text-lg font-bold text-cyan-50">
                    {feature.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-cyan-50/60">
                    {feature.description}
                  </p>
                </article>
              ))}
            </section>

            <section id="catalog-section" className="mb-8">
              <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyber-cyan/55">
                    {uiCopy.featureEyebrow}
                  </p>
                  <h2 className="mt-2 text-2xl font-bold text-cyan-50">
                    {selectedGenre
                      ? `${t.genres.selectedPrefix}: ${selectedGenre.name}`
                      : currentCategories[activeCategory] || uiCopy.browseTitle}
                  </h2>
                </div>
                <p className="max-w-2xl text-sm leading-6 text-cyan-50/60">
                  {uiCopy.browseSubtitle}
                </p>
              </div>

              {error ? (
                <div className="mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-rose-400/40 bg-rose-500/10 px-4 py-3">
                  <p className="text-sm text-rose-200">{error}</p>
                  <button
                    type="button"
                    onClick={() =>
                      loadItems({
                        category: activeCategory,
                        genreId: selectedGenre?.id || null,
                        media: mediaType,
                      })
                    }
                    className="rounded border border-rose-300/40 px-3 py-1 text-sm text-rose-100 hover:bg-rose-400/10"
                  >
                    {t.errorBanner.retry}
                  </button>
                  <button
                    type="button"
                    onClick={clearError}
                    className="rounded border border-cyber-cyan/30 px-3 py-1 text-sm text-cyber-cyan hover:bg-cyber-cyan/10"
                  >
                    {t.errorBanner.close}
                  </button>
                </div>
              ) : null}

              <MovieGrid
                movies={displayedItems}
                onSelect={(item) =>
                  openDetailById({
                    media: mediaType,
                    id: item.id,
                    seedItem: item,
                    pushState: true,
                  })
                }
                isLoading={isLoading}
                detailBasePath={mediaType}
                emptyMessage={
                  searchQuery.trim()
                    ? t.empty.search
                    : activeCategory === "favorites"
                    ? t.empty.favorites
                    : mediaType === "movie"
                    ? t.empty.defaultMovie
                    : t.empty.defaultTv
                }
                movieCardLabels={t.card}
              />
            </section>

            <section id="genres-section">
              <Genres
                genres={genres}
                onSelect={handleGenreSelect}
                title={t.genres.title}
              />
            </section>
          </>
        ) : (
          <>
            {!hasPremium ? <AdBanner label={t.ads.label} /> : null}

            {error ? (
              <div className="mb-4 rounded-xl border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-rose-200 text-sm">
                {error}
              </div>
            ) : null}

            <MovieDetail
              mediaType={mediaType}
              movie={selectedDetails || selectedItem}
              seasonDetails={seasonDetails}
              watchProviders={watchProviders}
              providerCountry={providerCountry}
              onProviderCountryChange={setProviderCountry}
              selectedSeason={selectedSeason}
              onSeasonSelect={(seasonNumber) =>
                loadSeason((selectedDetails || selectedItem).id, seasonNumber)
              }
              onEpisodeSelect={handleEpisodeSelect}
              onBack={() => goHome(true)}
              onToggleFavorite={handleToggleFavorite}
              isFavorite={isSelectedFavorite}
              isLoading={isDetailsLoading}
              labels={t.detail}
              servers={servers}
              activeServer={activeServer}
              setActiveServer={setActiveServer}
            />
          </>
        )}
      </main>

      <Footer text={t.footer.rights} />

      {showAuthPanel ? (
        <AuthPanel
          labels={t.auth}
          onLogin={handleLogin}
          onRegister={handleRegister}
          onClose={() => setShowAuthPanel(false)}
        />
      ) : null}
    </div>
  );
}
