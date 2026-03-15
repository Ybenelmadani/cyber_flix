const GA_ID = process.env.REACT_APP_GA_MEASUREMENT_ID;

const sendGA = (eventName, params = {}) => {
  if (typeof window === "undefined") {
    return;
  }
  if (window.gtag && GA_ID) {
    window.gtag("event", eventName, params);
  }
};

export const trackPageView = (path) => {
  sendGA("page_view", { page_path: path });
};

export const trackEvent = (name, params = {}) => {
  sendGA(name, params);
};

