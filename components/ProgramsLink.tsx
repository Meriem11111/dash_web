"use client";

import { useEffect, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

function centerPrograms() {
  const programs = document.getElementById("programs");
  if (!programs) return;
  const bounds = programs.getBoundingClientRect();
  window.scrollTo({
    top: window.scrollY + bounds.top + bounds.height / 2 - window.innerHeight / 2,
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
  });
}

export default function ProgramsLink({ children, className, ariaCurrent }: { children: ReactNode; className?: string; ariaCurrent?: "location" }) {
  const pathname = usePathname();
  useEffect(() => {
    if (pathname !== "/" || window.location.hash !== "#programs") return;
    const frame = requestAnimationFrame(centerPrograms);
    return () => cancelAnimationFrame(frame);
  }, [pathname]);

  return <Link href="/#programs" scroll={false} className={className} aria-current={ariaCurrent} onClick={event => {
    if (pathname !== "/" || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    window.history.replaceState(null, "", "/#programs");
    window.dispatchEvent(new Event("hashchange"));
    centerPrograms();
  }}>{children}</Link>;
}
