import { useEffect, useState } from "react";
import {
  getCookieConsent,
  initializeMetaPixel,
  isAnalyticsExcluded,
  saveCookieConsent,
  trackMetaPageView,
} from "../services/analytics/metaPixel";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function refreshVisibility() {
      setVisible(
        !getCookieConsent() &&
          !isAnalyticsExcluded(),
      );
    }

    refreshVisibility();

    window.addEventListener(
      "tc-analytics-exclusion-changed",
      refreshVisibility,
    );

    return () => {
      window.removeEventListener(
        "tc-analytics-exclusion-changed",
        refreshVisibility,
      );
    };
  }, []);

  function accept() {
    saveCookieConsent("accepted");
    setVisible(false);

    initializeMetaPixel();
    trackMetaPageView(
      `${window.location.pathname}${window.location.search}`,
    );
  }

  function reject() {
    saveCookieConsent("rejected");
    setVisible(false);
  }

  if (!visible) {
    return null;
  }

  return (
    <div className="fixed inset-x-3 bottom-3 z-[9999] mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl sm:p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-base font-black text-slate-950">
            Privacidad y cookies
          </p>

          <p className="mt-1 text-sm font-medium leading-6 text-slate-600">
            Usamos cookies de medición para saber qué campañas funcionan y
            mejorar TusComercios. No enviamos nombres, correos, teléfonos ni
            otra información personal a Meta.
          </p>
        </div>

        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={reject}
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-100"
          >
            Rechazar
          </button>

          <button
            type="button"
            onClick={accept}
            className="rounded-xl bg-blue-700 px-4 py-3 text-sm font-black text-white transition hover:bg-blue-800"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}
