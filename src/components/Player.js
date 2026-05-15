/* eslint-disable */
import React, { useEffect, useMemo, useRef, useState } from "react";
import Hls from "hls.js";
import { openSponsorDirectLink } from "../config/ads";

const unlockCountKey = "cyberflix_unlock_count";
const unlockDateKey = "cyberflix_unlock_date";

const todayKey = () => new Date().toISOString().slice(0, 10);

const getTodayUnlockCount = () => {
  try {
    if (localStorage.getItem(unlockDateKey) !== todayKey()) {
      localStorage.setItem(unlockDateKey, todayKey());
      localStorage.setItem(unlockCountKey, "0");
      return 0;
    }

    return parseInt(localStorage.getItem(unlockCountKey) || "0", 10);
  } catch {
    return 0;
  }
};

const incrementTodayUnlockCount = () => {
  try {
    const current = getTodayUnlockCount();
    localStorage.setItem(unlockCountKey, String(current + 1));
  } catch {}
};

export default function Player({
  servers = [],
  activeServer,
  setActiveServer,
  poster,
  title,
}) {
  const videoRef = useRef(null);
  const [playbackError, setPlaybackError] = useState("");
  // Désactivé temporairement : Toujours débloqué pour une UI propre
  const [isUnlocked, setIsUnlocked] = useState(true);
  /* Ancienne logique de pub
  const [isUnlocked, setIsUnlocked] = useState(() => {
    try {
      const count = parseInt(localStorage.getItem("cyberflix_unlock_count") || "0");
      return count >= 3; 
    } catch {
      return false;
    }
  });
  */

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
    if (!videoRef.current || !activeSource) return;

    const video = videoRef.current;
    const isHls = activeSource.url?.toLowerCase().endsWith(".m3u8");

    if (isHls && Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(activeSource.url);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        // video.play().catch(() => {});
      });

      return () => {
        hls.destroy();
      };
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = activeSource.url;
    } else if (activeSource.url) {
      video.src = activeSource.url;
    }
  }, [activeSource]);

  const resolvedSourceType = useMemo(() => {
    if (!activeSource) return "video";
    const url = activeSource.url?.toLowerCase() || "";
    if (url.includes("embed") || url.includes("iframe") || url.includes("player")) {
      return "embed";
    }
    return "video";
  }, [activeSource]);

  return (
    <div className="flex flex-col gap-4">
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

                  // Lien supprimé pour éviter l'alerte
                  // window.open("...", "_blank");
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

      {/* Sources / Servers */}
      <div className="flex flex-wrap gap-2">
        {servers.map((server) => (
          <button
            key={server.id || server.url}
            onClick={() => setActiveServer(server)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              (activeSource?.id === server.id || activeSource?.url === server.url)
                ? "bg-cyber-fuchsia text-white shadow-lg shadow-cyber-fuchsia/25"
                : "bg-cyber-darker text-cyber-cyan/70 hover:bg-cyber-dark hover:text-white"
            }`}
          >
            {server.name || server.quality || "Source"}
          </button>
        ))}
      </div>

      {playbackError && (
        <div className="rounded-lg bg-red-500/10 p-4 text-sm text-red-500 border border-red-500/20">
          {playbackError}
        </div>
      )}
    </div>
  );
}
