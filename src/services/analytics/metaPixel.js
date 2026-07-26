const META_PIXEL_ID = "969202696139357";
const CONSENT_KEY = "tc_cookie_consent";
const EXCLUDED_KEY = "tc_analytics_excluded";

let pixelInitialized = false;
let lastPageViewKey = "";

export function getCookieConsent() {
  return localStorage.getItem(CONSENT_KEY);
}

export function hasAnalyticsConsent() {
  return getCookieConsent() === "accepted";
}

export function saveCookieConsent(value) {
  const normalized = value === "accepted" ? "accepted" : "rejected";
  localStorage.setItem(CONSENT_KEY, normalized);

  window.dispatchEvent(
    new CustomEvent("tc-cookie-consent-changed", {
      detail: { value: normalized },
    }),
  );
}

export function isAnalyticsExcluded() {
  return localStorage.getItem(EXCLUDED_KEY) === "true";
}

export function setAnalyticsExcluded(excluded) {
  localStorage.setItem(EXCLUDED_KEY, excluded ? "true" : "false");

  if (excluded) {
    lastPageViewKey = "";
  }

  window.dispatchEvent(
    new CustomEvent("tc-analytics-exclusion-changed", {
      detail: { excluded: Boolean(excluded) },
    }),
  );
}

function canTrack() {
  return hasAnalyticsConsent() && !isAnalyticsExcluded();
}

function installMetaScript() {
  if (window.fbq) {
    return;
  }

  const fbq = function (...args) {
    if (fbq.callMethod) {
      fbq.callMethod(...args);
    } else {
      fbq.queue.push(args);
    }
  };

  fbq.push = fbq;
  fbq.loaded = true;
  fbq.version = "2.0";
  fbq.queue = [];

  window.fbq = fbq;
  window._fbq = fbq;

  const script = document.createElement("script");
  script.async = true;
  script.src = "https://connect.facebook.net/en_US/fbevents.js";
  script.dataset.tcMetaPixel = "true";

  const firstScript = document.getElementsByTagName("script")[0];

  if (firstScript?.parentNode) {
    firstScript.parentNode.insertBefore(script, firstScript);
  } else {
    document.head.appendChild(script);
  }
}

export function initializeMetaPixel() {
  if (!canTrack()) {
    return false;
  }

  installMetaScript();

  if (!pixelInitialized) {
    window.fbq("init", META_PIXEL_ID);
    pixelInitialized = true;
  }

  return true;
}

export function trackMetaPageView(pageKey = window.location.pathname) {
  if (!initializeMetaPixel()) {
    return;
  }

  const normalizedKey = String(pageKey || "/");

  if (lastPageViewKey === normalizedKey) {
    return;
  }

  lastPageViewKey = normalizedKey;
  window.fbq("track", "PageView");
}

export function trackMetaEvent(eventName, parameters = {}) {
  if (!initializeMetaPixel()) {
    return;
  }

  const safeParameters = {};

  for (const [key, value] of Object.entries(parameters || {})) {
    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      safeParameters[key] = value;
    }
  }

  window.fbq("trackCustom", String(eventName), safeParameters);
}

/*
Eventos preparados para próximos pasos:

trackMetaEvent("Search", { category, city });
trackMetaEvent("BusinessView", { business_id, category, city });
trackMetaEvent("WhatsAppClick", { business_id, category });
trackMetaEvent("CompleteRegistration", { source: "web" });
trackMetaEvent("InitiateCheckout", { plan, value, currency: "ARS" });
trackMetaEvent("Purchase", { plan, value, currency: "ARS" });

Nunca enviar:
- nombre
- email
- teléfono
- DNI
- dirección exacta
- contenido escrito por el usuario
*/
