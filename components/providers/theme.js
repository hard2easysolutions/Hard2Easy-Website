"use client";

import { useSyncExternalStore } from "react";

const KEY = "h2e-theme";

/**
 * Runs inline in <head> before paint so there is no flash of the wrong theme.
 * Saved choice wins; otherwise the OS preference.
 */
export const themeScript = `(function(){try{var t=localStorage.getItem("${KEY}");if(t!=="light"&&t!=="dark"){t=matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"}document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme="dark"}})();`;

function subscribe(callback) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}

const getSnapshot = () => document.documentElement.dataset.theme || "dark";
const getServerSnapshot = () => "dark";

/** Current theme ("dark" | "light"), kept in sync with <html data-theme>. */
export function useTheme() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(KEY, theme);
  } catch {
    // storage unavailable (private mode) — theme still applies for this visit
  }
}
