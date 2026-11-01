"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import ProgramsLink from "@/components/ProgramsLink";
import ThemeToggle from "@/components/ThemeToggle";
import type { Program } from "@/lib/programs";

function subscribeToHash(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  window.addEventListener("popstate", onChange);
  return () => {
    window.removeEventListener("hashchange", onChange);
    window.removeEventListener("popstate", onChange);
  };
}
const getHash = () => window.location.hash;
const getServerHash = () => "";

export default function SiteHeader({ active, program }: { active: "home" | "overview" | "innovations" | "dashboard"; program?: Program }) {
  const hash = useSyncExternalStore(subscribeToHash, getHash, getServerHash);
  const programsActive = active === "home" && hash === "#programs";
  const homeActive = active === "home" && !programsActive;
  return <header className="site-header">
    <Link className="wordmark" href="/" aria-label="CIMMYT CGIAR home">CIMMYT <span className="brand-divider">/</span> CGIAR</Link>
    <nav aria-label="Main navigation">
      <Link href="/" className={homeActive ? "nav-active" : ""} aria-current={homeActive ? "page" : undefined} onNavigate={() => {
        if (active !== "home") return;
        window.history.replaceState(null, "", "/");
        window.dispatchEvent(new Event("hashchange"));
      }}>Home</Link>
      <ProgramsLink className={programsActive ? "nav-active" : ""} ariaCurrent={programsActive ? "location" : undefined}>Programs</ProgramsLink>
      {program && <Link href={`/programs/${program.slug}`} className={active === "overview" ? "nav-active" : ""} aria-current={active === "overview" ? "page" : undefined}>Overview</Link>}
      {program && <Link href={`/innovations?program=${program.slug}`} className={active === "innovations" ? "nav-active" : ""} aria-current={active === "innovations" ? "page" : undefined}>Technological innovations</Link>}
      <Link href="/dashboard" className={active === "dashboard" ? "nav-active" : ""} aria-current={active === "dashboard" ? "page" : undefined}>Dashboard</Link>
    </nav>
    <ThemeToggle />
  </header>;
}