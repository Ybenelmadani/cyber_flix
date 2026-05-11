import React, { useEffect, useMemo, useRef, useState } from "react";
import Hls from "hls.js";

export default function Player({
  servers = [],
  activeServer,
  setActiveServer,
  poster,
  title,
}) {
  const videoRef = useRef(null);
  const [playbackError, setPlaybackError] = useState("");
  // Vérifier si l'utilisateur a déjà débloqué 3 fois aujourd'hui
  const [isUnlocked, setIsUnlocked] = useState(() => {
    try {
      const count = parseInt(localStorage.getItem("cyberflix_unlock_count") || "0");
      return count >= 3; // Débloqué auto après 3 fois
    } catch {
      return false;
    }
  });

  const activeSource = useMemo(() => {
    if (!Array.isArray(servers) || servers.length === 0) return null;

    if (activeServer && typeof activeServer === "object" && activeServer.url) {
      const foundById = servers.find(
        (server) => String(server?.id || "") === String(activeServer?.id || "")
      );
      if (foundById) {
        return {
          ...foundById,
          ...activeServer,
        };
      }

      const foundByUrl = servers.find(
        (server) => String(server?.url || "") === String(activeServer?.url || "")
      );
      if (foundByUrl) {
        return {
          ...foundByUrl,
          ...activeServer,
        };
      }

      return activeServer;
    }

    if (activeServer && typeof activeServer === "object" && activeServer.id) {
      const found = servers.find(
        (server) => String(server?.id) === String(activeServer.id)
      );
      if (found) return found;
    }

    if (typeof activeServer === "string") {
      const found = servers.find(
        (server) =>
          String(server?.id) === activeServer ||
          server?.name === activeServer ||
          server?.quality === activeServer ||
          server?.url === activeServer
      );
      if (found) return found;
    }

    return servers[0] || null;
  }, [servers, activeServer]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !activeSource?.url) return;

    let hlsInstance = null;
    const sourceUrl = activeSource.url;
    const sourceType =
      activeSource.type ||
      (sourceUrl.includes("youtube.com/embed/") ||
      sourceUrl.includes("player.vimeo.com/video/") ||
      sourceUrl.includes("dailymotion.com/embed/video/")
        ? "embed"
        : sourceUrl.includes(".m3u8")
        ? "hls"
        : "mp4");

    if (sourceType === "embed") {
      try {
        video.pause();
        video.removeAttribute("src");
        video.load();
      } catch {}
      setPlaybackError("");
      return undefined;
    }

    setPlaybackError("");

    if (sourceUrl.includes("your-legal-stream.m3u8")) {
      setPlaybackError(
        "This stream URL is still a placeholder. Replace it in your stream source, then reload."
      );
      return;
    }

    try {
      video.pause();
      if (videoRef.current) {
        video.removeAttribute("src");
        video.load();
      }
    } catch {}

    const handleVideoError = () => {
      setPlaybackError("Unable to load this video source.");
    };

    video.addEventListener("error", handleVideoError);

    if (sourceType === "hls") {
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = sourceUrl;
      } else if (Hls.isSupported()) {
        hlsInstance = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
        });

        hlsInstance.on(Hls.Events.ERROR, (_, data) => {
          if (!data) return;

          if (data.fatal) {
            if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
              setPlaybackError("Network error while loading this HLS stream.");
              try {
                hlsInstance.startLoad();
              } catch {}
            } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
              setPlaybackError("Media error while playing this HLS stream.");
              try {
                hlsInstance.recoverMediaError();
              } catch {}
            } else {
              setPlaybackError("Unable to load this HLS stream.");
              try {
                hlsInstance.destroy();
              } catch {}
            }
          }
        });

        hlsInstance.loadSource(sourceUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = sourceUrl;
      }
    } else {
      video.src = sourceUrl;
    }

    return () => {
      video.removeEventListener("error", handleVideoError);

      try {
        video.pause();
      } catch {}

      if (hlsInstance) {
        try {
          hlsInstance.destroy();
        } catch {}
      }
    };
  }, [activeSource]);

  const resolvedSourceType = useMemo(() => {
    const sourceUrl = String(activeSource?.url || "");
    return (
      activeSource?.type ||
      (sourceUrl.includes("youtube.com/embed/") ||
      sourceUrl.includes("player.vimeo.com/video/") ||
      sourceUrl.includes("dailymotion.com/embed/video/")
        ? "embed"
        : sourceUrl.includes(".m3u8")
        ? "hls"
        : "mp4")
    );
  }, [activeSource]);

  if (!servers.length) {
    return (
      <div className="rounded-[1.5rem] border border-cyber-cyan/30 bg-cyber-darker">
        <div className="aspect-video flex items-center justify-center bg-cyber-dark text-cyber-cyan/70">
          No video source available
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-[1.5rem] border border-cyber-cyan/30 bg-cyber-darker"
      style={{ overflow: "clip" /* clips visually without blocking touch */ }}
    >
      {/* Server selector tabs */}
      {/* 
      <div className="flex overflow-x-auto border-b border-cyber-cyan/20 bg-cyber-darker/80 scrollbar-hide">
        {servers.map((server, index) => {
          const serverName =
            server.name ||
            `${server.quality || "Server"}${
              server.language ? ` - ${server.language}` : ""
            }` ||
            `Server ${index + 1}`;

          const isActive =
            String(activeSource?.id || "") === String(server?.id || "");

          return (
            <button
              key={server.id || server.url || `${serverName}-${index}`}
              onClick={() => setActiveServer(server)}
              className={`whitespace-nowrap px-4 py-3 text-sm font-medium transition-all sm:px-6 sm:py-4 ${
                isActive
                  ? "server-active"
                  : "text-cyber-cyan/70 hover:bg-cyber-cyan/5 hover:text-cyber-cyan"
              }`}
            >
              <span>{serverName}</span>
              {server.isLegal ? (
                <span className="ml-2 rounded-full border border-emerald-300/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-200">
                  LEGAL
                </span>
              ) : null}
              {server.isPremium ? (
                <span className="ml-2 rounded-full border border-amber-300/40 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-200">
                  PREMIUM
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
      */}

      {/* Video area */}
      <div
        className="relative bg-black"
        style={{
          aspectRatio: "16 / 9",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {!isUnlocked ? (
          <div className="absolute inset-0 z-[20] flex flex-col items-center justify-center bg-cyber-darker/90 backdrop-blur-sm">
            <div 
              className="absolute inset-0 opacity-30 grayscale"
              style={{ 
                backgroundImage: `url(${poster})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            />
            <div className="relative z-10 flex flex-col items-center p-6 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-cyber-fuchsia/20 text-cyber-fuchsia shadow-lg shadow-cyber-fuchsia/20">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </div>
              <h4 className="mb-2 text-xl font-bold text-white">Flux Protégé</h4>
              <p className="mb-6 max-w-xs text-sm text-cyber-cyan/70">
                Cliquez sur le bouton ci-dessous pour débloquer le lecteur Haute Définition.
              </p>
              
              <button
                onClick={() => {
                  // Incrémenter le compteur
                  try {
                    const current = parseInt(localStorage.getItem("cyberflix_unlock_count") || "0");
                    localStorage.setItem("cyberflix_unlock_count", (current + 1).toString());
                  } catch (e) {}

                  // Ouvrir le lien de pub Monetag Direct Link
                  window.open("https://omg10.com/4/10993786", "_blank");
                  setIsUnlocked(true);
                }}
                className="group relative flex items-center gap-3 overflow-hidden rounded-2xl bg-cyber-fuchsia px-8 py-4 text-lg font-black text-white shadow-xl shadow-cyber-fuchsia/30 transition-all hover:scale-105 active:scale-95"
              >
                <span className="relative z-10">DÉBLOQUER LE STREAMING</span>
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
              </button>
              
              <p className="mt-4 text-[10px] uppercase tracking-widest text-cyber-cyan/40">
                Sponsorisé par nos partenaires
              </p>
            </div>
          </div>
        ) : null}

        {resolvedSourceType === "embed" ? (
          <iframe
            key={activeSource?.url}
            title={title || activeSource?.name || "Embedded stream"}
            src={activeSource?.url}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              border: "none",
              pointerEvents: "auto",
              zIndex: 1,
            }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen; web-share"
            allowFullScreen
            referrerPolicy="no-referrer"
            scrolling="no"
          />
        ) : (
          <video
            ref={videoRef}
            controls
            playsInline
            poster={poster}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "auto",
            }}
            preload="metadata"
          >
            Your browser does not support video playback.
          </video>
        )}
      </div>

      {playbackError ? (
        <div className="border-t border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {playbackError}
        </div>
      ) : null}

      {/* 
      {title ? (
        <div className="border-t border-cyber-cyan/20 px-4 py-3 text-sm text-cyber-cyan/80">
          {title}
          {activeSource?.provider ? ` - ${activeSource.provider}` : ""}
        </div>
      ) : null}
      */}
    </div>
  );
}
