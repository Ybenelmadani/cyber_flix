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
      return activeServer;
    }

    if (typeof activeServer === "string") {
      const found = servers.find(
        (server) =>
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
      activeSource.type || (sourceUrl.includes(".m3u8") ? "hls" : "mp4");

    setPlaybackError("");

    if (sourceUrl.includes("your-legal-stream.m3u8")) {
      setPlaybackError(
        "This stream URL is still a placeholder. Replace it in .env, run npm run seed:streams, then reload."
      );
      return;
    }

    video.pause();
    video.removeAttribute("src");
    video.load();

    const handleVideoError = () => {
      setPlaybackError("Unable to load this video source.");
    };

    video.addEventListener("error", handleVideoError);

    if (sourceType === "hls") {
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = sourceUrl;
      } else if (Hls.isSupported()) {
        hlsInstance = new Hls();
        hlsInstance.on(Hls.Events.ERROR, (_, data) => {
          if (data?.fatal) {
            setPlaybackError("Unable to load this HLS stream.");
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
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    };
  }, [activeSource]);

  if (!servers.length) {
    return (
      <div className="overflow-hidden rounded-[1.5rem] border border-cyber-cyan/30 bg-cyber-darker">
        <div className="aspect-video flex items-center justify-center bg-cyber-dark text-cyber-cyan/70">
          No video source available
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-cyber-cyan/30 bg-cyber-darker">
      <div className="flex overflow-x-auto bg-cyber-darker/80 border-b border-cyber-cyan/20 scrollbar-hide">
        {servers.map((server, index) => {
          const serverName =
            server.name ||
            `${server.quality || "Server"}${
              server.language ? ` - ${server.language}` : ""
            }` ||
            `Server ${index + 1}`;

          const isActive =
            activeSource?.url && server?.url
              ? activeSource.url === server.url
              : index === 0;

          return (
            <button
              key={server.url || `${serverName}-${index}`}
              onClick={() => setActiveServer(server)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-all sm:px-6 sm:py-4 ${
                isActive
                  ? "server-active"
                  : "text-cyber-cyan/70 hover:text-cyber-cyan hover:bg-cyber-cyan/5"
              }`}
            >
              {serverName}
            </button>
          );
        })}
      </div>

      <div className="aspect-video bg-black">
        <video
          ref={videoRef}
          controls
          poster={poster}
          className="w-full h-full"
          preload="metadata"
        >
          Your browser does not support video playback.
        </video>
      </div>

      {playbackError ? (
        <div className="px-4 py-3 border-t border-rose-400/20 bg-rose-500/10 text-rose-200 text-sm">
          {playbackError}
        </div>
      ) : null}

      {title ? (
        <div className="border-t border-cyber-cyan/20 px-4 py-3 text-sm text-cyber-cyan/80">
          {title}
        </div>
      ) : null}
    </div>
  );
}
