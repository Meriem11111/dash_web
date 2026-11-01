"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Icon from "@/components/Icon";
import DataNotice from "@/components/DataNotice";
import SiteHeader from "@/components/SiteHeader";
import { findProgram } from "@/lib/programs";
import EvidenceScreenshot from "@/components/EvidenceScreenshot";
import EvidenceFlow, { type FlowKind } from "@/components/EvidenceFlow";
import type { Study } from "@/lib/getStudies";

const CountryMap = dynamic(() => import("@/components/CountryMap"), {
  ssr: false,
  loading: () => <div className="map-loading">Loading geographical coverage…</div>,
});
const withAll = (values: string[]) => ["All", ...Array.from(new Set(values.filter(Boolean))).sort()];
const matches = (values: string[], value: string) => value === "All" || values.includes(value);

export default function Dashboard({ studies, selected = false, programSlug }: { studies: Study[]; selected?: boolean; programSlug?: string }) {
  const program = findProgram(programSlug);
  const editQuery = new URLSearchParams();
  if (program) editQuery.set("program", program.slug);
  if (selected) studies.forEach(s => editQuery.append("study", s.id));
  const [country, setCountry] = useState("All");
  const [scale, setScale] = useState("All");
  const [principle, setPrinciple] = useState("All");
  const [domain, setDomain] = useState("All");
  const countries = useMemo(() => withAll(studies.flatMap(s => s.Countries)), [studies]);
  const scales = useMemo(() => withAll(studies.map(s => s.Scale)), [studies]);
  const principles = useMemo(() => withAll(studies.flatMap(s => s.Principles)), [studies]);
  const domains = useMemo(() => withAll(studies.flatMap(s => s.Domains)), [studies]);
  const mapStudies = useMemo(() => studies.filter(s => (scale === "All" || s.Scale === scale) && matches(s.Principles, principle) && matches(s.Domains, domain)), [studies, scale, principle, domain]);
  const filteredStudies = useMemo(() => mapStudies.filter(s => matches(s.Countries, country)), [mapStudies, country]);
  const counts = useMemo(() => {
    const result: Record<string, number> = {};
    for (const s of mapStudies) for (const c of s.Countries) result[c] = (result[c] ?? 0) + 1;
    return result;
  }, [mapStudies]);
  const activeFilters = [
    { label: "Country", value: country, clear: () => setCountry("All") },
    { label: "Scale", value: scale, clear: () => setScale("All") },
    { label: "Principle", value: principle, clear: () => setPrinciple("All") },
    { label: "Domain", value: domain, clear: () => setDomain("All") },
  ].filter(f => f.value !== "All");
  function resetFilters() { setCountry("All"); setScale("All"); setPrinciple("All"); setDomain("All"); }
  function onPick(kind: FlowKind, value: string) {
    if (kind === "country") setCountry(country === value ? "All" : value);
    else if (kind === "principle") setPrinciple(principle === value ? "All" : value);
    else setDomain(domain === value ? "All" : value);
  }
  function exportStudies() {
    const columns = ["Title", "Countries", "Scale", "Principles", "Domains", "Year", "Url"] as const;
    const quote = (v: string) => `"${v.replaceAll('"', '""')}"`;
    const csv = [columns.join(","), ...filteredStudies.map(s => columns.map(c => {
      const v = s[c];
      const value = Array.isArray(v) ? v.join("; ") : v;
      return quote(/^[=+@\-\t\r]/.test(value) ? `'${value}` : value);
    }).join(","))].join("\r\n");
    const url = URL.createObjectURL(new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a"); a.href = url; a.download = "landscape-evidence.csv"; a.click(); URL.revokeObjectURL(url);
  }
  return (
    <div className="dashboard app-bg">
      <SiteHeader active="dashboard" program={program} />
      <main id="top" className="dashboard-main">
        <div className="breadcrumb"><Link href="/">Home</Link> <span>/</span> Evidence synthesis</div>
        {selected && <div className="selection-banner"><span>Selected evidence · {studies.length} {studies.length === 1 ? "study" : "studies"}{program ? ` · ${program.name}` : ""}</span><div><Link href={program ? `/innovations?${editQuery}` : "/#programs"}>{program ? "Edit selection →" : "Choose a program →"}</Link><Link href="/dashboard">View all studies ↗</Link></div></div>}
        <div className="page-heading"><div><p className="eyebrow">{program?.name ?? "Across the evidence base"}</p><h1>See the evidence.<br /><span>Follow the connections.</span></h1><p className="intro">Explore how agroecological principles connect to environmental,<br className="desktop-break" /> economic and social outcomes across landscapes.</p></div><a className="outline-button" href="#records">Explore study records <Icon name="chevron-down" /></a></div>
        <DataNotice studies={studies} />
        <section className="stats-strip" aria-label="Evidence summary" aria-live="polite">
          <Stat number={filteredStudies.length} label="Studies in view" note={`from ${studies.length} study records`} />
          <Stat number={new Set(filteredStudies.flatMap(s => s.Countries)).size} label="Countries represented" note="across the evidence base" />
          <Stat number={new Set(filteredStudies.flatMap(s => s.Principles)).size} label="Agroecological principles" note="linked to landscape outcomes" />
          <Stat number={new Set(filteredStudies.flatMap(s => s.Domains)).size} label="Impact domains" note="dimensions of change" />
        </section>
        <section className="filter-panel" aria-label="Filter the evidence">
          <div className="filter-heading"><h2>Refine your view</h2><button className="text-button" onClick={resetFilters} disabled={!activeFilters.length}>Reset filters <Icon name="reset" /></button></div>
          <div className="filter-grid"><Field label="Country" value={country} onChange={setCountry} options={countries} /><Field label="Landscape scale" value={scale} onChange={setScale} options={scales} /><Field label="Agroecological principle" value={principle} onChange={setPrinciple} options={principles} /><Field label="Impact domain" value={domain} onChange={setDomain} options={domains} /></div>
          <div className="filter-status"><span aria-live="polite"><i className="status-dot" />{filteredStudies.length} studies match your view</span><div className="filter-chips">{activeFilters.map(f => <button key={f.label} onClick={f.clear} aria-label={`Remove ${f.label} filter: ${f.value}`}>{f.value} <span aria-hidden="true">×</span></button>)}</div></div>
        </section>
        <section id="evidence-flow" className="visual-section">
          <div className="section-heading"><div><p className="eyebrow">01 / Connected evidence</p><h2>From place to practice to impact</h2><p>Trace the relationships within the studies. Select a segment to explore it.</p></div></div>
          <EvidenceScreenshot kind="chart"><div className="flow-panel"><EvidenceFlow studies={filteredStudies} colorLabels={principles.filter(p => p !== "All")} selected={{ country, principle, domain }} onPick={onPick} /></div></EvidenceScreenshot>
        </section>
        <section id="coverage" className="visual-section"><div className="section-heading"><div><p className="eyebrow">02 / Geographical coverage</p><h2>Where the evidence comes from</h2><p>Select a country on the map to focus your view. Use the tabs to explore each region.</p></div></div><EvidenceScreenshot kind="map"><CountryMap counts={counts} selected={country} onSelect={setCountry} /></EvidenceScreenshot><p className="map-note">Map shading reflects the scale, principle and domain filters. Country selection focuses the flow and study records.</p></section>
        <section id="records" className="visual-section"><div className="section-heading"><div><p className="eyebrow">03 / The evidence base</p><h2>A closer look at the research</h2><p>Browse the study records behind the connections.</p></div><button className="outline-button" onClick={exportStudies}>Export CSV <Icon name="download" /></button></div><StudyTable key={`${country}|${scale}|${principle}|${domain}`} studies={filteredStudies} /></section>
        <footer className="site-footer"><span>CIMMYT / CGIAR</span><span>CGIAR Science Programs · Evidence Synthesis</span><a href="#top">Back to top ↑</a></footer>
      </main>
    </div>
  );
}
function Stat({ number, label, note }: { number: number; label: string; note: string }) { return <div className="stat"><strong>{String(number).padStart(2, "0")}</strong><div><p>{label}</p><span>{note}</span></div></div>; }
function Field({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) { return <label className="filter-field"><span>{label}</span><select value={value} onChange={e => onChange(e.target.value)}>{options.map(o => <option key={o} value={o}>{o === "All" ? "All " + (label === "Country" ? "countries" : label === "Landscape scale" ? "scales" : label === "Impact domain" ? "domains" : "principles") : o}</option>)}</select></label>; }
function StudyTable({ studies }: { studies: Study[] }) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const matching = useMemo(() => studies.filter(s => [s.Title, ...s.Countries, ...s.Principles, ...s.Domains].join(" ").toLowerCase().includes(search.toLowerCase())), [studies, search]);
  const rows = matching.slice(page * 10, (page + 1) * 10);
  return <div className="records-panel"><div className="records-toolbar"><label><span className="sr-only">Search study records</span><Icon name="search" /><input placeholder="Search titles, countries or principles…" value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} /></label><span>{matching.length} records</span></div><div className="table-scroll"><table><thead><tr><th>Study / source</th><th>Country</th><th>Scale</th><th>Principle</th><th>Impact domain</th></tr></thead><tbody>{rows.map(s => <tr key={s.id}><td>{s.Url ? <a href={s.Url} target="_blank" rel="noreferrer">{s.Title}</a> : s.Title}</td><td>{s.Countries.join(", ") || "Unspecified"}</td><td><span className="scale-tag">{s.Scale}</span></td><td>{s.Principles.join(", ") || "Unspecified"}</td><td>{s.Domains.join(", ") || "Unspecified"}</td></tr>)}{!rows.length && <tr><td colSpan={5} className="empty-state">No studies match this view. Try adjusting the filters or search.</td></tr>}</tbody></table></div><div className="table-footer"><span>Showing {matching.length ? page * 10 + 1 : 0}–{Math.min((page + 1) * 10, matching.length)} of {matching.length} records</span><div><button onClick={() => setPage(page - 1)} disabled={page === 0} aria-label="Previous page">Previous</button><span>Page {page + 1} of {Math.max(1, Math.ceil(matching.length / 10))}</span><button onClick={() => setPage(page + 1)} disabled={(page + 1) * 10 >= matching.length} aria-label="Next page">Next</button></div></div></div>;
}
