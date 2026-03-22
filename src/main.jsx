import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/global.css";
import { HelmetProvider } from "react-helmet-async";

const root = ReactDOM.createRoot(document.getElementById("root"));

// Only enable StrictMode in development to catch bugs
// In production, disable it to avoid double-rendering overhead
const isDev = import.meta.env.DEV;

const app = (
  <HelmetProvider>
    <App />
  </HelmetProvider>
);

root.render(isDev ? <React.StrictMode>{app}</React.StrictMode> : app);
