import React from "react";

export default function AdBanner({ 
  hidden = false, 
  label = "Sponsorisé",
  type = "placeholder", // "image" ou "placeholder"
  imageUrl = "",
  linkUrl = "#",
  fallbackText = "Espace Publicitaire"
}) {
  if (hidden) return null;

  return (
    <div className="my-6 overflow-hidden rounded-[2rem] border border-cyber-cyan/15 bg-cyber-darker/45 p-4 text-center sm:my-8 sm:p-5 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col items-center gap-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-cyber-cyan/40">
          {label}
        </p>
        
        {type === "image" && imageUrl ? (
          <a 
            href={linkUrl} 
            target="_blank" 
            rel="noreferrer"
            className="group relative block w-full overflow-hidden rounded-2xl border border-cyber-cyan/20 transition hover:border-cyber-fuchsia/50"
          >
            <img 
              src={imageUrl} 
              alt="Publicité" 
              className="h-auto w-full object-cover transition duration-500 group-hover:scale-105" 
            />
            <div className="absolute inset-0 bg-cyber-fuchsia/5 opacity-0 transition group-hover:opacity-100" />
          </a>
        ) : (
          <div className="flex h-24 w-full items-center justify-center rounded-2xl border border-dashed border-cyber-cyan/20 bg-cyber-dark/45 px-4 text-xs italic text-cyber-cyan/40 sm:h-28">
            {fallbackText} (728x90)
          </div>
        )}
        
        <p className="text-[9px] text-cyber-cyan/30">
          Devenez Premium pour supprimer les publicités
        </p>
      </div>
    </div>
  );
}
