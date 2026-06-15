/* eslint-disable */
import React, { useEffect, useMemo, useRef, useState } from "react";
import Hls from "hls.js";

// Provider icon/color mapping for the EgyDead-style tabs
const PROVIDER_META = {
  vidlink:    { label: "VidLink",    color: "#e11d48" },
  vidsrc:     { label: "VidSrc",    color: "#7c3aed" },
  "2embed":   { label: "2Embed",    color: "#0284c7" },
  embedsu:    { label: "Embed.su",  color: "#0891b2" },
  autoembed:  { label: "AutoEmbed", color: "#059669" },
  multiembed: { label: "MultiEmbed",color: "#d97706" },
  nontongo:   { label: "NontonGo",  color: "#db2777" },
  codespecters:{ label: "Codespecters", color: "#6d28d9" },
  youtube:    { label: "YouTube",   color: "#dc2626" },
  vimeo:      { label: "Vimeo",     color: "#1d4ed8" },
  custom:     { label: "Direct",    color: "#0f766e" },
  
  // EgyDead Scraped Hosts
  voe:        { label: "Voe",        color: "#f43f5e" },
  doodstream: { label: "DoodStream", color: "#0ea5e9" },
  mixdrop:    { label: "Mixdrop",    color: "#f59e0b" },
  earnvids:   { label: "EarnVids",   color: "#10b981" },
  streamix:   { label: "Streamix",   color: "#8b5cf6" },
  byse:       { label: "Byse",       color: "#ec4899" },
  streamhg:   { label: "StreamHG",   color: "#14b8a6" },
  streamruby: { label: "StreamRuby", color: "#ef4444" },
  egybestvid: { label: "EgyBestVid", color: "#22c55e" },
  egydead:    { label: "EgyDead",    color: "#06b6d4" },
};

const EMBED_PROVIDERS = new Set([
  "vidlink",
  "vidsrc",
  "2embed",
  "embedsu",
  "autoembed",
  "multiembed",
  "nontongo",
  "codespecters",
  "youtube",
  "vimeo",
  "voe",
  "doodstream",
  "mixdrop",
  "earnvids",
  "streamix",
  "byse",
  "streamhg",
  "streamruby",
  "egybestvid",
  "egydead",
  "vidtube",
  "google drive",
]);

const getProviderMeta = (provider = "") => {
  const key = String(provider).toLowerCase().trim();
  return PROVIDER_META[key] || { label: provider || "Server", color: "#374151" };
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
  const [isLoading, setIsLoading] = useState(false);

  const activeSource = useMemo(() => {
    if (!Array.isArray(servers) || servers.length === 0) return null;

    if (activeServer && typeof activeServer === "object" && activeServer.url) {
      const foundById = servers.find(
        (server) => String(server?.id || "") === String(activeServer?.id || "")
      );
      if (foundById) return { ...foundById, ...activeServer };

      const foundByUrl = servers.find(
        (server) => String(server?.url || "") === String(activeServer?.url || "")
      );
      if (foundByUrl) return { ...foundByUrl, ...activeServer };

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
          server?.url === activeServer
      );
      if (found) return found;
    }

    return servers[0] || null;
  }, [servers, activeServer]);

  const resolvedSourceType = useMemo(() => {
    if (!activeSource) return "video";
    const url = activeSource.url?.toLowerCase() || "";
    const provider = String(activeSource.provider || "").toLowerCase().trim();
    if (EMBED_PROVIDERS.has(provider)) {
      return "embed";
    }
    if (url.includes("embed") || url.includes("iframe") || url.includes("player") || url.includes("vidlink") || url.includes("vidsrc") || url.includes("2embed") || url.includes("autoembed") || url.includes("multiembed") || url.includes("nontongo") || url.includes("embed.su") || url.includes("voe") || url.includes("mixdrop") || url.includes("dood") || url.includes("streamruby") || url.includes("streamhg") || url.includes("earnvids")) {
      return "embed";
    }
    if (activeSource.type === "embed") return "embed";
    return "video";
  }, [activeSource]);

  const subtitleTracks = useMemo(() => {
    if (!Array.isArray(activeSource?.subtitles)) {
      return [];
    }

    return activeSource.subtitles.filter(
      (track) => track && String(track.src || "").trim()
    );
  }, [activeSource]);

  const hasPlayableUrl = Boolean(String(activeSource?.url || "").trim());

  useEffect(() => {
    setPlaybackError("");
  }, [activeSource]);

  useEffect(() => {
    if (!activeSource) {
      setIsLoading(false);
      return;
    }

    if (!hasPlayableUrl) {
      setIsLoading(true);
    }
  }, [activeSource, hasPlayableUrl]);

  useEffect(() => {
    if (!videoRef.current || !activeSource || !hasPlayableUrl || resolvedSourceType !== "video") return;

    const video = videoRef.current;
    const isHls = activeSource.url?.toLowerCase().endsWith(".m3u8");
    setPlaybackError("");
    setIsLoading(true);

    if (isHls && Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(activeSource.url);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLoading(false);
      });
      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          setPlaybackError("Erreur de lecture du flux vidéo.");
          setIsLoading(false);
        }
      });
      return () => hls.destroy();
    } else if (activeSource.url) {
      video.src = activeSource.url;
      video.onloadeddata = () => setIsLoading(false);
      video.onerror = () => {
        setPlaybackError("Impossible de charger la vidéo.");
        setIsLoading(false);
      };
    }
  }, [activeSource, hasPlayableUrl, resolvedSourceType]);

  // Change server handler — show loading shimmer on iframe change
  const handleServerSelect = (server) => {
    setIsLoading(true);
    setPlaybackError("");
    setActiveServer(server);
  };

  const isCodespecters = useMemo(() => {
    if (!activeSource) return false;
    const provider = String(activeSource.provider || "").toLowerCase();
    const name = String(activeSource.name || "").toLowerCase();
    const id = String(activeSource.id || "").toLowerCase();
    return provider === "codespecters" || name.includes("codespecters") || id.includes("codespecters");
  }, [activeSource]);


  return (
    <div className="egydead-player">
      {/* ── Server Tabs (EgyDead style) ── */}
      {servers.length > 0 && (
        <div className="server-tabs-bar">
          <div className="server-tabs-list">
            {servers.map((server) => {
              const meta = getProviderMeta(server.provider);
              const isActive =
                activeSource?.id === server.id ||
                activeSource?.url === server.url;
              return (
                <button
                  key={server.id || server.url}
                  onClick={() => handleServerSelect(server)}
                  className="server-tab"
                  style={{
                    "--tab-color": meta.color,
                    background: isActive ? meta.color : "rgba(255,255,255,0.05)",
                    borderColor: isActive ? meta.color : "rgba(255,255,255,0.1)",
                    color: isActive ? "#fff" : "rgba(255,255,255,0.65)",
                    fontWeight: isActive ? 700 : 500,
                    boxShadow: isActive ? `0 0 18px ${meta.color}55` : "none",
                    transform: isActive ? "translateY(-2px)" : "none",
                  }}
                  title={server.quality ? `${meta.label} — ${server.quality}` : meta.label}
                >
                  <span className="server-tab-dot" style={{ background: isActive ? "#fff" : meta.color }} />
                  {meta.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Video Player ── */}
      <div className="player-viewport">
        {/* Loading shimmer */}
        {isLoading && (
          <div className="player-shimmer">
            <div className="player-shimmer-icon">
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </div>
            <p style={{ color: "#22d3ee", marginTop: 12, fontSize: 13, opacity: 0.7 }}>Chargement du serveur…</p>
          </div>
        )}

        {hasPlayableUrl && resolvedSourceType === "embed" ? (
          <iframe
            key={activeSource?.url}
            title={title || activeSource?.name || "Embedded stream"}
            src={activeSource?.url}
            className="player-iframe"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen; web-share"
            allowFullScreen
            scrolling="no"
            onLoad={() => setIsLoading(false)}
          />
        ) : hasPlayableUrl ? (
          <video
            key={activeSource?.url || "video"}
            ref={videoRef}
            controls
            playsInline
            poster={poster}
            className="player-video"
            preload="metadata"
          >
            {subtitleTracks.map((track) => (
              <track
                key={track.id || `${track.srcLang || "ar"}-${track.src}`}
                kind={track.kind || "subtitles"}
                src={track.src}
                srcLang={track.srcLang || "ar"}
                label={track.label || "Arabic"}
                default={Boolean(track.default)}
              />
            ))}
            Your browser does not support video playback.
          </video>
        ) : null}
      </div>

      {/* Playback error */}
      {playbackError && (
        <div className="player-error">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {playbackError}
        </div>
      )}

      {/* EgyDead-style Player Styles */}
      <style>{`
        .egydead-player {
          font-family: 'Inter', 'Segoe UI', sans-serif;
          display: flex;
          flex-direction: column;
          gap: 0;
          width: 100%;
          background: #0a0a0f;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 25px 60px rgba(0,0,0,0.6);
          border: 1px solid rgba(34,211,238,0.12);
        }

        /* ── Server Tabs Bar ── */
        .server-tabs-bar {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          background: linear-gradient(135deg, #0d1117 0%, #131820 100%);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          flex-wrap: wrap;
        }

        .server-tabs-list {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
        }

        .server-tab {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 5px 13px 5px 10px;
          border-radius: 8px;
          border: 1px solid;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
          line-height: 1;
        }

        .server-tab:hover {
          opacity: 0.9;
          transform: translateY(-1px) !important;
        }

        .server-tab-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .server-tab-quality {
          background: rgba(0,0,0,0.3);
          border-radius: 4px;
          padding: 1px 5px;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.05em;
          margin-left: 2px;
        }

        /* ── Player Viewport ── */
        .player-viewport {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 9;
          background: #000;
          overflow: hidden;
        }

        .player-iframe {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          border: none;
          z-index: 1;
        }

        .player-video {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
        }

        /* ── Loading Shimmer ── */
        .player-shimmer {
          position: absolute;
          inset: 0;
          z-index: 20;
          background: linear-gradient(135deg, #0d1117 0%, #0a1628 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          animation: pulseShimmer 1.8s ease-in-out infinite;
        }

        @keyframes pulseShimmer {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }

        .player-shimmer-icon {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background: rgba(34,211,238,0.08);
          border: 1px solid rgba(34,211,238,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          animation: rotatePulse 2s linear infinite;
        }

        @keyframes rotatePulse {
          0% { box-shadow: 0 0 0 0 rgba(34,211,238,0.3); }
          70% { box-shadow: 0 0 0 15px rgba(34,211,238,0); }
          100% { box-shadow: 0 0 0 0 rgba(34,211,238,0); }
        }

        /* ── Provider badge overlay ── */
        .player-provider-badge {
          position: absolute;
          top: 10px;
          left: 10px;
          z-index: 5;
          padding: 3px 10px;
          border-radius: 6px;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.08em;
          color: #fff;
          text-transform: uppercase;
          opacity: 0.8;
          pointer-events: none;
        }

        /* ── Error ── */
        .player-error {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          background: rgba(239,68,68,0.1);
          border-top: 1px solid rgba(239,68,68,0.25);
          color: #f87171;
          font-size: 13px;
        }
      `}</style>
    </div>
  );
}
