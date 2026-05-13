export const ADS_CONFIG = {
  monetag: {
    directLinkUrl: "https://omg10.com/4/10993786",
    zones: {
      directLink: "10993786",
      pushNotifications: "10993770",
      vignetteBanner: "10993769",
      inPagePush: "10993768",
      onClickPopunder: "10993767",
    },
    scripts: {
      inPagePush: "",
      onClickPopunder: "",
    },
  },
  adsterra: {
    popunderScriptSrc:
      "//pl29419513.profitablecpmratenetwork.com/59/01/25/5901250872819b228a07ae053b34d586.js",
    socialBarScriptSrc: "",
    banner: {
      key: "a7e69f1222d0e03a598849486a0d33b2c",
      width: 728,
      height: 90,
      scriptHost: "//www.highperformanceformat.com",
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
