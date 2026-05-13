import React from "react";

export default function AdBanner() {
  // Désactivation totale pour le moment pour avoir une UI propre
  return null;

  /* 
  Le code ci-dessous est mis en commentaire pour éviter les erreurs de build Vercel (Unreachable Code)
  quand on réactivera les pubs, il suffira de décommenter et supprimer le "return null" ci-dessus.

  const adContainerRef = useRef(null);

  useEffect(() => {
    if (!adContainerRef.current) return;
    adContainerRef.current.innerHTML = "";
    try {
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
      const scriptInvoke = document.createElement("script");
      scriptInvoke.type = "text/javascript";
      scriptInvoke.src = `//www.highperformanceformat.com/a7e69f1222d0e03a598849486a0d33b2c/invoke.js`;
      adContainerRef.current.appendChild(scriptConfig);
      adContainerRef.current.appendChild(scriptInvoke);
    } catch (err) {
      console.error("Erreur pub:", err);
    }
  }, []);

  return (
    <div className="my-6 overflow-hidden rounded-[2rem] border border-cyber-cyan/15 bg-cyber-darker/45 p-4 text-center">
      <div ref={adContainerRef} />
    </div>
  );
  */
}
