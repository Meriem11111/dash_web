"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import DataNotice from "@/components/DataNotice";
import { useRouter } from "next/navigation";
import type { Study } from "@/lib/getStudies";
import { type Program, publicationUrl } from "@/lib/programs";

export default function StudySelector({ studies, program, initialSelection }: { studies: Study[]; program: Program; initialSelection: string[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState(() => new Set(initialSelection.filter(id => studies.some(s => s.id === id))));
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState(["All", "All", "All", "All"]);
  const [page, setPage] = useState(0);
  const fields = useMemo(() => [
    { label: "Country", options: studies.flatMap(s => s.Countries), values: (s: Study) => s.Countries },
    { label: "Scale", options: studies.map(s => s.Scale), values: (s: Study) => [s.Scale] },
    { label: "Agroecological principle", options: studies.flatMap(s => s.Principles), values: (s: Study) => s.Principles },
    { label: "Impact domain", options: studies.flatMap(s => s.Domains), values: (s: Study) => s.Domains },
  ], [studies]);
  const filtered = useMemo(() => studies.filter(s => s.Title.toLowerCase().includes(search.toLowerCase()) && fields.every((f, i) => filters[i] === "All" || f.values(s).includes(filters[i]))), [studies, search, fields, filters]);
  const rows = filtered.slice(page * 10, (page + 1) * 10);
  function toggle(id: string) { setSelected(old => { const next = new Set(old); if (next.has(id)) next.delete(id); else next.add(id); return next; }); }
  function explore() {
    if (!selected.size) return;
    const query = new URLSearchParams();
    if (program) query.set("program", program.slug);
    selected.forEach(id => query.append("study", id));
    router.push(`/dashboard?${query}`);
  }
  function exportCSV() {
    const quote = (v: string) => `"${(/^[=+@\-\t\r]/.test(v) ? "'" + v : v).replaceAll('"', '""')}"`;
    const csv = ["Study,Country,Year,URL", ...filtered.map(s => [s.Title, s.Countries.join("; "), s.Year, s.Url].map(quote).join(","))].join("\r\n");
    const url = URL.createObjectURL(new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a"); a.href = url; a.download = "technological-innovations.csv"; a.click(); URL.revokeObjectURL(url);
  }
  return <main className="dashboard-main selector-main"><div className="breadcrumb"><Link href="/">Home</Link><span>/</span>{program ? <Link href={`/programs/${program.slug}`}>{program.name}</Link> : "All programs"}<span>/</span>Technological innovations</div><div className="page-heading"><div><p className="eyebrow">{program?.name ?? "Across the evidence base"}</p><h1>Choose your studies.<br /><span>Build your evidence view.</span></h1><p className="intro">Select at least one study to explore in the dashboard.</p></div><button onClick={exportCSV} className="outline-button" disabled={!filtered.length}>Export CSV <span aria-hidden="true">↓</span></button></div>
    <DataNotice studies={studies} />
    <section className="filter-panel" aria-label="Filter studies"><div className="filter-heading"><h2>Find relevant evidence</h2><button className="text-button" onClick={() => { setFilters(["All", "All", "All", "All"]); setSearch(""); setPage(0); }}>Reset filters ↺</button></div><div className="filter-grid">{fields.map((f, i) => <label className="filter-field" key={f.label}><span>{f.label}</span><select value={filters[i]} onChange={e => { setFilters(filters.map((v, index) => index === i ? e.target.value : v)); setPage(0); }}><option value="All">All</option>{[...new Set(f.options)].filter(Boolean).sort().map(o => <option key={o}>{o}</option>)}</select></label>)}</div><div className="filter-status"><span><i className="status-dot" />{filtered.length} studies match your view</span></div></section>
    {program && !studies.length ? <section className="program-empty"><p className="eyebrow">Program evidence</p><h2>Program studies are not available yet</h2><p>The current evidence base has not yet been assigned to individual programs. You can choose another program or visit this program’s publication collection.</p><div className="hero-actions"><Link href="/#programs" className="primary-button">Choose another program →</Link><a className="outline-button" href={publicationUrl(program)} target="_blank" rel="noreferrer">See all publications ↗</a></div></section> : <section className="visual-section"><div className="section-heading"><div><p className="eyebrow">The evidence base</p><h2>Technological innovations</h2><p>Selections stay with you as you filter and move between pages.</p></div></div><div className="records-panel"><div className="records-toolbar"><label><span className="sr-only">Search study titles</span><span aria-hidden="true">⌕</span><input placeholder="Search study titles…" value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} /></label><span>{filtered.length} records</span></div><div className="table-scroll"><table className="selection-table"><thead><tr><th><input type="checkbox" aria-label="Select all studies on this page" checked={!!rows.length && rows.every(s => selected.has(s.id))} disabled={!rows.length} onChange={e => { const checked = e.target.checked; setSelected(old => { const next = new Set(old); rows.forEach(s => { if (checked) next.add(s.id); else next.delete(s.id); }); return next; }); }} /></th><th>Study</th><th>Country</th><th>Year</th><th>Publication</th></tr></thead><tbody>{rows.map(s => <tr key={s.id} className={selected.has(s.id) ? "selected-row" : ""}><td><input type="checkbox" checked={selected.has(s.id)} onChange={() => toggle(s.id)} aria-label={`Select ${s.Title}`} /></td><td><button className="study-title-button" onClick={() => toggle(s.id)} aria-pressed={selected.has(s.id)}>{s.Title}</button></td><td>{s.Countries.join(", ") || "Unspecified"}</td><td>{s.Year || "Not available"}</td><td>{s.Url ? <a href={s.Url} target="_blank" rel="noreferrer">{s.Mock ? "View collection ↗" : "View publication ↗"}</a> : "Not available"}</td></tr>)}{!rows.length && <tr><td colSpan={5} className="empty-state">No studies match. Try adjusting the filters or search.</td></tr>}</tbody></table></div><div className="table-footer"><span>Showing {filtered.length ? page * 10 + 1 : 0}–{Math.min((page + 1) * 10, filtered.length)} of {filtered.length}</span><div><button aria-label="Previous page" disabled={page === 0} onClick={() => setPage(page - 1)}>←</button><span>Page {page + 1} of {Math.max(1, Math.ceil(filtered.length / 10))}</span><button aria-label="Next page" disabled={(page + 1) * 10 >= filtered.length} onClick={() => setPage(page + 1)}>→</button></div></div></div></section>}
    <div className="selection-dock"><div aria-live="polite"><strong>{selected.size} {selected.size === 1 ? "study" : "studies"} selected</strong><span>{selected.size ? "Ready to explore the connections" : "Select at least one study to continue"}</span></div><div className="dock-actions"><button className="text-button" disabled={!selected.size} onClick={() => setSelected(new Set())}>Clear selection</button><button className="primary-button" disabled={!selected.size} onClick={explore}>Explore in the dashboard <span aria-hidden="true">→</span></button></div></div>
    <footer className="site-footer"><span>CIMMYT / CGIAR</span><Link href="/#programs">← All Science Programs</Link></footer></main>;
}
