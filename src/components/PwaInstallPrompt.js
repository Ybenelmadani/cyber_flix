import React, { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

export default function PwaInstallPrompt({ language = "en" }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Check if user dismissed it in this session
      const dismissed = sessionStorage.getItem("pwa_dismissed");
      if (!dismissed) {
        setIsVisible(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsVisible(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem("pwa_dismissed", "true");
  };

  if (!isVisible) return null;

  const labels = {
    ar: {
      title: "تثبيت تطبيق CYBERFLIX",
      desc: "أضف الموقع إلى شاشتك الرئيسية لتجربة سريعة ومشاهدة سلسة بدون متصفح.",
      btn: "تثبيت الآن",
    },
    fr: {
      title: "Installer l'application CYBERFLIX",
      desc: "Ajoutez l'application sur votre écran d'accueil pour un accès rapide et sans navigateur.",
      btn: "Installer",
    },
    en: {
      title: "Install CYBERFLIX App",
      desc: "Add CYBERFLIX to your home screen for quick access and a fullscreen native experience.",
      btn: "Install Now",
    },
  };

  const l = labels[language] || labels.en;

  return (
    <aside
      aria-label="PWA Install"
      className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-lg animate-in slide-in-from-bottom duration-300"
    >
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-cyber-cyan/30 bg-cyber-darker/95 p-4 shadow-[0_10px_35px_rgba(0,0,0,0.8)] backdrop-blur-md">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-cyber-cyan to-cyber-fuchsia text-white shadow-md shadow-cyber-cyan/20">
            <Download className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-bold text-cyan-50 truncate">{l.title}</h4>
            <p className="text-xs text-cyber-cyan/70 line-clamp-1">{l.desc}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleInstall}
            className="rounded-xl bg-cyber-cyan px-3.5 py-1.5 text-xs font-bold text-cyber-dark transition-all hover:bg-cyan-300 active:scale-95 shadow-md shadow-cyber-cyan/20"
          >
            {l.btn}
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Dismiss"
            className="rounded-lg p-1.5 text-cyber-cyan/60 hover:text-white hover:bg-white/5"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
