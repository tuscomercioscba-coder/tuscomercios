import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";

import App from "./App";
import "./index.css";

const isDevelopment =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

async function configureServiceWorker() {
  if (!("serviceWorker" in navigator)) return;

  if (isDevelopment) {
    const registrations =
      await navigator.serviceWorker.getRegistrations();

    await Promise.all(
      registrations.map((registration) =>
        registration.unregister()
      )
    );

    if ("caches" in window) {
      const cacheNames = await caches.keys();

      await Promise.all(
        cacheNames.map((cacheName) =>
          caches.delete(cacheName)
        )
      );
    }

    console.log(
      "Service Worker desactivado en localhost."
    );

    return;
  }

  window.addEventListener("load", async () => {
    try {
      await navigator.serviceWorker.register("/sw.js");

      console.log(
        "Service Worker registrado correctamente."
      );
    } catch (error) {
      console.error(
        "No se pudo registrar el Service Worker:",
        error
      );
    }
  });
}

configureServiceWorker();

ReactDOM.createRoot(
  document.getElementById("root")
).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);