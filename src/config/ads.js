export const ADS_CONFIG = {
  monetag: {
    directLinkUrl: "",
    zones: {
      directLink: "",
      pushNotifications: "",
      vignetteBanner: "",
      inPagePush: "",
      onClickPopunder: "",
    },
    scripts: {
      inPagePush: "",
      onClickPopunder: "",
    },
  },
  adsterra: {
    popunderScriptSrc: "",
    socialBarScriptSrc: "",
    banner: {
      key: "",
      width: 728,
      height: 90,
      scriptHost: "",
    },
    directLinkUrl: "",
  },
  limits: {
    playerUnlocksBeforeAutoOpen: 3,
  },
};

export const openSponsorDirectLink = () => {
  const link =
    ADS_CONFIG.monetag.directLinkUrl || ADS_CONFIG.adsterra.directLinkUrl;

  if (!link) return;

  window.open(link, "_blank", "noopener,noreferrer");
};
