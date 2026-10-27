import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import type { Program } from "@/lib/programs";

export default function SiteHeader({ active, program }: { active: "home" | "overview" | "innovations" | "dashboard"; program?: Program }) {
  return <header className="site-header">
    <Link className="wordmark" href="/" aria-label="CIMMYT CGIAR home">CIMMYT <span className="brand-divider">/</span> CGIAR</Link>
    <nav aria-label="Main navigation">
      <Link href="/" className={active === "home" ? "nav-active" : ""} aria-current={active === "home" ? "page" : undefined}>Home</Link>
      <Link href="/#programs">Search programs</Link>
      {program && <Link href={`/programs/${program.slug}`} className={active === "overview" ? "nav-active" : ""} aria-current={active === "overview" ? "page" : undefined}>Overview</Link>}
      {program && <Link href={`/innovations?program=${program.slug}`} className={active === "innovations" ? "nav-active" : ""} aria-current={active === "innovations" ? "page" : undefined}>Technological innovations</Link>}
      <Link href="/dashboard" className={active === "dashboard" ? "nav-active" : ""} aria-current={active === "dashboard" ? "page" : undefined}>Dashboard</Link>
    </nav>
    <ThemeToggle />
  </header>;
}
