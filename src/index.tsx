import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { initializeApp } from './lib/init';

// Initialize app optimizations
initializeApp();

createRoot(document.getElementById("app") as HTMLElement).render(
  <StrictMode>
    <App />
    <Analytics />
    <SpeedInsights />
  </StrictMode>,
);
