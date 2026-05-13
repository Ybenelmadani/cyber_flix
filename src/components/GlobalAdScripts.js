import { useEffect } from "react";
import { ADS_CONFIG } from "../config/ads";

const appendScriptOnce = ({ id, src }) => {
  if (!src || document.getElementById(id)) return null;

  const script = document.createElement("script");
  script.id = id;
  script.type = "text/javascript";
  script.src = src;
  script.async = true;
  document.body.appendChild(script);

  return script;
};

export default function GlobalAdScripts({ hidden = false }) {
  useEffect(() => {
    if (hidden) return undefined;

    const scripts = [
      appendScriptOnce({
        id: "adsterra-popunder-script",
        src: ADS_CONFIG.adsterra.popunderScriptSrc,
      }),
      appendScriptOnce({
        id: "adsterra-social-bar-script",
        src: ADS_CONFIG.adsterra.socialBarScriptSrc,
      }),
      appendScriptOnce({
        id: "monetag-in-page-push-script",
        src: ADS_CONFIG.monetag.scripts.inPagePush,
      }),
      appendScriptOnce({
        id: "monetag-onclick-popunder-script",
        src: ADS_CONFIG.monetag.scripts.onClickPopunder,
      }),
    ].filter(Boolean);

    return () => {
      scripts.forEach((script) => {
        try {
          script.remove();
        } catch {}
      });
    };
  }, [hidden]);

  return null;
}
