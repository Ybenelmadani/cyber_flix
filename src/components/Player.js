/* eslint-disable */
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
      {servers.length > 1 && (
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
      )}

      {playbackError && (
        <div className="rounded-lg bg-red-500/10 p-4 text-sm text-red-500 border border-red-500/20">
          {playbackError}
        </div>
      )}
    </div>
  );
}
