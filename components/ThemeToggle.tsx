"use client";

import { useSyncExternalStore } from "react";

const storageKey = "evidence-theme";
const changeEvent = "evidence-theme-change";
const getTheme = () => document.documentElement.dataset.theme === "light" ? "light" : "dark";
const getServerTheme = () => "dark" as const;

function subscribe(onChange: () => void) {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const syncPreference = () => {
    let saved: string | null = null;
    try { saved = localStorage.getItem(storageKey); } catch { /* Browser storage is optional. */ }
    document.documentElement.dataset.theme = saved === "light" || saved === "dark" ? saved : media.matches ? "dark" : "light";
    onChange();
  };
  const onStorage = (event: StorageEvent) => {
    if (event.key === storageKey || event.key === null) syncPreference();
  };
  window.addEventListener(changeEvent, onChange);
  window.addEventListener("storage", onStorage);
  media.addEventListener("change", syncPreference);
  return () => {
    window.removeEventListener(changeEvent, onChange);
    window.removeEventListener("storage", onStorage);
    media.removeEventListener("change", syncPreference);
  };
}

export default function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getTheme, getServerTheme);
  function selectTheme(value: "light" | "dark") {
    document.documentElement.dataset.theme = value;
    try { localStorage.setItem(storageKey, value); } catch { /* Keep the switch usable without storage. */ }
    window.dispatchEvent(new Event(changeEvent));
  }

  return <div className="theme-toggle" role="group" aria-label="Color theme">
    <button className="theme-option" type="button" aria-pressed={theme === "light"} onClick={() => selectTheme("light")}>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" /></svg>
      <span>Light</span>
    </button>
    <button className="theme-option" type="button" aria-pressed={theme === "dark"} onClick={() => selectTheme("dark")}>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20.8 13A9 9 0 0 1 11 3.2 9 9 0 1 0 20.8 13Z" /></svg>
      <span>Dark</span>
    </button>
  </div>;
}
