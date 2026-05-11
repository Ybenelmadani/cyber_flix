import React, { useEffect, useRef } from "react";

export default function AdBanner({ 
  hidden = false, 
  label = "Sponsorisé"
}) {
  const adContainerRef = useRef(null);

  useEffect(() => {
    if (hidden || !adContainerRef.current) return;

    // Nettoyer le conteneur avant d'ajouter le script
    adContainerRef.current.innerHTML = "";

    try {
      // Configuration d'Adsterra
      const scriptConfig = document.createElement("script");
      scriptConfig.type = "text/javascript";
      scriptConfig.innerHTML = `
        atOptions = {
          'key' : 'a7e69f1222d0e03a598849486a0d33b2c',
          'format' : 'iframe',
          'height' : 90,
          'width' : 728,
          'params' : {}
        };
      `;

      // Script de chargement de la pub
      const scriptInvoke = document.createElement("script");
      scriptInvoke.type = "text/javascript";
      scriptInvoke.src = `//www.highperformanceformat.com/a7e69f1222d0e03a598849486a0d33b2c/invoke.js`;

      adContainerRef.current.appendChild(scriptConfig);
      adContainerRef.current.appendChild(scriptInvoke);
    } catch (err) {
      console.error("Erreur lors du chargement de la pub Adsterra:", err);
    }
  }, [hidden]);

  if (hidden) return null;

  return (
    <div className="my-6 overflow-hidden rounded-[2rem] border border-cyber-cyan/15 bg-cyber-darker/45 p-4 text-center sm:my-8 sm:p-5">
      <div className="flex flex-col items-center gap-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-cyber-cyan/40">
          {label}
        </p>
        
        {/* Conteneur pour le script Adsterra */}
        <div 
          ref={adContainerRef}
          className="flex min-h-[90px] w-full items-center justify-center overflow-hidden rounded-2xl bg-cyber-dark/45"
        />
        
        <p className="text-[9px] text-cyber-cyan/30">
          Devenez Premium pour supprimer les publicités
        </p>
      </div>
    </div>
  );
}
