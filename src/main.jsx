import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import { HelmetProvider } from "react-helmet-async";

import App from "./App";

import "./index.css";

if ("serviceWorker" in navigator) {
window.addEventListener(
"load",
() => {
navigator.serviceWorker
.register("/sw.js")
.then(() => {
console.log(
"App instalada correctamente"
);
})
.catch((error) => {
console.log(
"Error SW",
error
);
});
}
);
}

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