const sendGA = (eventName, params = {}) => {
  if (typeof window === "undefined") {
    return;
  }
  if (window.gtag) {
    window.gtag("event", eventName, params);
  }
};

export const trackPageView = (path) => {
  sendGA("page_view", { page_path: path });
};

export const trackEvent = (name, params = {}) => {
  sendGA(name, params);
};
