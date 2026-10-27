"use client";

import { useMemo, useState } from "react";
import {
  sankey,
  sankeyLinkHorizontal,
  type SankeyGraph,
  type SankeyLink,
  type SankeyNode,
} from "d3-sankey";
import type { Study } from "@/lib/getStudies";

export type FlowKind = "country" | "principle" | "domain";
type NodeDatum = { id: string; label: string; kind: FlowKind };
type LinkDatum = { value: number };
type N = SankeyNode<NodeDatum, LinkDatum>;
type Lk = SankeyLink<NodeDatum, LinkDatum>;

const W = 1120;
const H = 620;
const TOP = 66;
const NODE_W = 174;
const MAX_COUNTRIES = 10; // the rest are grouped as "Other countries"

const OTHER = "Other countries";
const NONE: Record<FlowKind, string> = {
  country: "No country",
  principle: "No principle",
  domain: "No domain",
};
const PLACEHOLDERS = new Set([OTHER, ...Object.values(NONE)]);

const PALETTE = [
  "#35bba5", "#9c88d2", "#4396af", "#708bcd", "#7ebda1",
  "#b49aca", "#b0a474", "#5da9a7", "#b87d91", "#8697bb",
  "#8cab77", "#c09d80", "#798bc8",
];
const COUNTRY_FILL = "#338c80";
const DOMAIN_FILL = "#9c88d2";

const unique = (xs: string[]) => Array.from(new Set(xs));
const trunc = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1) + "…" : s);

function buildGraph(studies: Study[]) {
  // how many studies per country → keep the biggest ones
  const totals = new Map<string, number>();
  for (const s of studies) for (const c of s.Countries) totals.set(c, (totals.get(c) ?? 0) + 1);
  const top = new Set(
    Array.from(totals.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, MAX_COUNTRIES)
      .map(([c]) => c)
  );

  const nodes = new Map<string, NodeDatum>();
  const links = new Map<string, number>();
  const node = (kind: FlowKind, label: string): NodeDatum => {
    const n = { id: `${kind}:${label}`, label, kind };
    nodes.set(n.id, n);
    return n;
  };
  const add = (a: NodeDatum, b: NodeDatum, weight: number) => {
    const key = `${a.id}\u0000${b.id}`;
    links.set(key, (links.get(key) ?? 0) + weight);
  };

  for (const s of studies) {
    // Each study contributes one unit across each stage, divided among its tags.
    // Group countries after distributing weight so the Other group retains its share.
    const cs = s.Countries.length ? unique(s.Countries) : [NONE.country];
    const ps = s.Principles.length ? unique(s.Principles) : [NONE.principle];
    const ds = s.Domains.length ? unique(s.Domains) : [NONE.domain];
    for (const c of cs) for (const p of ps) {
      add(node("country", top.has(c) || c === NONE.country ? c : OTHER), node("principle", p), 1 / (cs.length * ps.length));
    }
    for (const p of ps) for (const d of ds) add(node("principle", p), node("domain", d), 1 / (ps.length * ds.length));
  }

  return {
    nodes: Array.from(nodes.values()),
    links: Array.from(links.entries()).map(([key, value]) => {
      const [source, target] = key.split("\u0000");
      return { source, target, value };
    }),
  };
}

type Props = {
  studies: Study[];
  colorLabels: string[];
  selected: { country: string; principle: string; domain: string };
  onPick?: (kind: FlowKind, value: string) => void;
};

export default function EvidenceFlow({ studies, colorLabels, selected, onPick }: Props) {
  const [hover, setHover] = useState<string | null>(null);

  const layout = useMemo(() => {
    const g = buildGraph(studies);
    if (g.links.length === 0) return null;
    const generator = sankey<NodeDatum, LinkDatum>()
      .nodeId((d) => d.id)
      .nodeWidth(NODE_W)
      .nodePadding(3)
      .nodeSort((a, b) => a.label.localeCompare(b.label))
      .extent([[0, TOP], [W, H - 20]]);
    // d3-sankey mutates its input, so give it fresh copies
    const input = {
      nodes: g.nodes.map((n) => ({ ...n })),
      links: g.links.map((l) => ({ ...l })),
    } as unknown as SankeyGraph<NodeDatum, LinkDatum>;
    return generator(input);
  }, [studies]);

  // one color per principle (used by the links and the middle column)
  const principleColor = useMemo(() => {
    const labels = [...colorLabels, NONE.principle].sort();
    return new Map(labels.map((l, i) => [l, PALETTE[i % PALETTE.length]]));
  }, [colorLabels]);

  if (!layout) {
    return <div className="empty-state">No evidence matches these filters. Reset or adjust your view to explore the connections.</div>;
  }

  const fillOf = (n: N) =>
    n.kind === "principle" ? principleColor.get(n.label) ?? PALETTE[0]
    : n.kind === "country" ? COUNTRY_FILL
    : DOMAIN_FILL;

  const linkColor = (l: Lk) => {
    const s = l.source as N;
    const t = l.target as N;
    return s.kind === "principle" ? fillOf(s) : fillOf(t);
  };

  const isSelected = (n: N) =>
    (n.kind === "country" && n.label === selected.country) ||
    (n.kind === "principle" && n.label === selected.principle) ||
    (n.kind === "domain" && n.label === selected.domain);

  const path = sankeyLinkHorizontal();
  const nodes = layout.nodes as N[];
  const links = layout.links as Lk[];

  const focusedNode = nodes.find(n => n.id === hover);
  const detail = focusedNode ? `${focusedNode.label} · ${new Set(studies.filter(s => focusedNode.kind === "country" ? (focusedNode.label === OTHER ? s.Countries.some(c => !nodes.some(n => n.kind === "country" && n.label === c)) : s.Countries.includes(focusedNode.label)) : focusedNode.kind === "principle" ? s.Principles.includes(focusedNode.label) : s.Domains.includes(focusedNode.label)).map(s => s.id)).size} study records` : "Hover or focus a segment to inspect its connections. Click or press Enter to filter.";
  const header = (x: number, number: string, label: string) => <g>
    <text x={x} y={17} fontSize={10} letterSpacing={1.5} fill="var(--teal)">{number}</text>
    <text x={x} y={38} fontSize={13} fontWeight={500} fill="var(--ink)">{label}</text>
  </g>;
  function labelLines(label: string) {
    const words = label.replaceAll("_", " ").split(" ");
    const lines: string[] = [""];
    for (const word of words) {
      if ((lines[lines.length - 1] + " " + word).trim().length > 23 && lines[lines.length - 1]) lines.push(word);
      else lines[lines.length - 1] = (lines[lines.length - 1] + " " + word).trim();
    }
    return lines;
  }
  return (
    <div>
      <div className="flow-scroll" tabIndex={0} role="region" aria-label="Scrollable evidence flow diagram">
        <svg viewBox={`0 0 ${W} ${H}`} className="flow-svg" role="group" aria-labelledby="flow-title flow-description">
          <title id="flow-title">Country to agroecological principle to impact domain</title>
          <desc id="flow-description">Three stacked columns connected by ribbons. Ribbon width represents weighted study contributions. Interactive segments filter the dashboard.</desc>
          {header(0, "01", "Country")}
          {header((W - NODE_W) / 2, "02", "Agroecological principle")}
          {header(W - NODE_W, "03", "Impact domain")}
          <g fill="none">
            {links.map((l, i) => {
              const source = l.source as N;
              const target = l.target as N;
              const active = hover === null || source.id === hover || target.id === hover;
              return <path key={i} d={path(l) ?? ""} stroke={linkColor(l)} strokeWidth={l.width ?? 0} strokeOpacity={active ? (hover ? 0.85 : 0.48) : 0.06} style={{ transition: "stroke-opacity .18s" }}><title>{`${source.label} → ${target.label}: ${l.value.toFixed(2)} weighted study contributions`}</title></path>;
            })}
          </g>
          {nodes.map(n => {
            const x0 = n.x0 ?? 0;
            const y0 = n.y0 ?? 0;
            const h = (n.y1 ?? 0) - y0;
            const clickable = !PLACEHOLDERS.has(n.label) && Boolean(onPick);
            const lines = labelLines(n.label);
            const visibleLines = h >= lines.length * 13 + 2 ? lines : [trunc(n.label.replaceAll("_", " "), 23)];
            return <g key={n.id} className="flow-node" role={clickable ? "button" : "graphics-symbol"} tabIndex={clickable ? 0 : undefined} aria-label={`${n.label}. ${clickable ? "Select to toggle filter." : "Grouped or unspecified evidence."}`} aria-pressed={clickable ? isSelected(n) : undefined} onMouseEnter={() => setHover(n.id)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(n.id)} onBlur={() => setHover(null)} onClick={() => clickable && onPick?.(n.kind, n.label)} onKeyDown={e => { if (clickable && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); onPick?.(n.kind, n.label); } }} style={{ cursor: clickable ? "pointer" : "default" }}>
              <rect x={x0} y={y0} width={NODE_W} height={Math.max(h, 0.5)} fill={fillOf(n)} stroke={isSelected(n) ? "var(--ink)" : "var(--surface-alt)"} strokeWidth={isSelected(n) ? 2.5 : 1} />
              {h >= 13 && <text x={x0 + NODE_W / 2} y={y0 + h / 2 - (visibleLines.length - 1) * 6.5} dy=".35em" textAnchor="middle" fontSize={11} fontWeight={600} fill={n.kind === "domain" ? "#161c29" : "#fff"} pointerEvents="none">{visibleLines.map((line, i) => <tspan key={i} x={x0 + NODE_W / 2} dy={i === 0 ? 0 : 13}>{line}</tspan>)}</text>}
              <title>{`${n.label}: ${(n.value ?? 0).toFixed(2)} weighted study contributions`}</title>
            </g>;
          })}
        </svg>
      </div>
      <p className="flow-detail" aria-live="polite">{detail}</p>
      <div className="flow-help"><p>Read from left to right. Wider ribbons represent more evidence. Each study contributes one unit, shared across its countries, principles and domains. The ten most represented countries are shown; the rest are grouped.</p><span>Ribbon colors follow the principle</span></div>
    </div>
  );
}
