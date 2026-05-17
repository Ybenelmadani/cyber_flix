export const ADS_CONFIG = {
  adsterra: {
    // Remplacer avec votre lien direct Adsterra réel :
    directLinkUrl: "https://www.profitablecpmrate.com/c1y8v42c?key=adsterra_direct_link_placeholder",
    popunderCooldownHours: 2, // Limite de fréquence : seulement 1 pub popunder toutes les 2 heures !
    socialBarScriptSrc: "", // Optionnel : script Adsterra Social Bar
  },
};

/**
 * Lance le Popunder Adsterra de manière douce et intelligente (Frequency Capping).
 * L'utilisateur ne recevra pas de popups à répétition. Maximum 1 pub toutes les 2 heures.
 */
export const triggerPopunderWithCap = () => {
  const directLink = ADS_CONFIG.adsterra.directLinkUrl;
  
  // Si le lien direct n'est pas configuré ou contient le placeholder, on ne fait rien
  if (!directLink || directLink.includes("placeholder")) {
    return;
  }

  try {
    const lastPop = localStorage.getItem("cyberflix_last_pop");
    const now = Date.now();
    const cooldownMs = (ADS_CONFIG.adsterra.popunderCooldownHours || 2) * 60 * 60 * 1000;

    if (!lastPop || now - parseInt(lastPop, 10) > cooldownMs) {
      localStorage.setItem("cyberflix_last_pop", String(now));
      // Ouvre la publicité dans un nouvel onglet
      window.open(directLink, "_blank", "noopener,noreferrer");
    }
  } catch (err) {
    console.error("Adsterra Cap Error:", err);
  }
};
