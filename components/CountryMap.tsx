"use client";

import { MapContainer, GeoJSON, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import type { Layer, PathOptions, LatLngBounds } from "leaflet";
import type { Feature, FeatureCollection } from "geojson";
import { useEffect, useMemo, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
// World countries (Natural Earth 50m recommended), saved as src/data/world.json
import worldData from "@/data/world.json";
import moroccoDisplay from "@/data/map-morocco.json";
import regionCodes from "@/data/map-regions.json";
import { referencePalette } from "@/lib/referencePalette";
import { createMapLevels, isMapColor, studyCountColor, type MapLevel } from "@/lib/mapColorScale";

/* ---------- Regions (ISO-2 codes) ---------- */
type RegionName = keyof typeof regionCodes;
type View = RegionName | "All";

const REGION_CODES = regionCodes;
const VIEWS: View[] = ["Africa", "Middle East", "Asia", "South America", "All"];

const regionOfIso: Record<string, RegionName> = {};
for (const region of Object.keys(REGION_CODES) as RegionName[]) {
  for (const code of REGION_CODES[region].split(" ")) regionOfIso[code] = region;
}

/* ---------- GeoJSON helpers (work with Natural Earth and similar files) ---------- */
const isoOf = (f: Feature): string => {
  const p = (f.properties ?? {}) as Record<string, unknown>;
  const v = p.ISO_A2_EH ?? p.ISO_A2 ?? p["ISO3166-1-Alpha-2"] ?? p.iso_a2;
  return typeof v === "string" ? v : "";
};
const nameOf = (f: Feature): string => {
  const p = (f.properties ?? {}) as Record<string, unknown>;
  return String(p.name ?? p.NAME ?? p.ADMIN ?? "");
};

// Apply the site's requested display boundary without editing source geography.
const features = (worldData as unknown as FeatureCollection).features
  .filter(f => regionOfIso[isoOf(f)] && isoOf(f) !== "EH")
  .map(f => isoOf(f) === "MA" ? moroccoDisplay as Feature : f);
const mapData: FeatureCollection = { type: "FeatureCollection", features };
const mapNames = new Set(features.map(nameOf));

const boundsOf = (fs: Feature[]): LatLngBounds =>
  L.geoJSON({ type: "FeatureCollection", features: fs } as FeatureCollection).getBounds();

const viewBounds: Record<View, LatLngBounds> = {
  Africa: boundsOf(features.filter((f) => regionOfIso[isoOf(f)] === "Africa")),
  "Middle East": boundsOf(features.filter((f) => regionOfIso[isoOf(f)] === "Middle East")),
  Asia: boundsOf(features.filter((f) => regionOfIso[isoOf(f)] === "Asia")),
  "South America": boundsOf(features.filter((f) => regionOfIso[isoOf(f)] === "South America")),
  All: boundsOf(features),
};

// center point of every country, computed once (used for the labels)
const centers = features.map((f) => ({
  name: nameOf(f),
  center: boundsOf([f]).getCenter(),
}));

const LABEL_ZOOM = 4.5; // country names + counts appear from this zoom level

const MAP_COLOR_KEY = "evidence-map-color";
const HOVER_BORDER = referencePalette.slate;

/* ---------- current zoom level, updates when the user zooms ---------- */
function useZoom() {
  const map = useMap();
  const [zoom, setZoom] = useState(map.getZoom());
  useMapEvents({ zoomend: () => setZoom(map.getZoom()) });
  return zoom;
}

/* ---------- Zoom + reset buttons ---------- */
function Controls({ home }: { home: LatLngBounds }) {
  const map = useMap();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) L.DomEvent.disableClickPropagation(ref.current);
  }, []);

  const btn =
    "flex h-9 w-9 items-center justify-center rounded-full bg-white text-lg font-medium text-[#30383f] shadow-md transition hover:underline";

  return (
    <div ref={ref} className="map-controls absolute right-4 top-4 z-[1000] flex flex-col gap-2">
      <button aria-label="Zoom in" className={btn} onClick={() => map.zoomIn()}>+</button>
      <button aria-label="Zoom out" className={btn} onClick={() => map.zoomOut()}>−</button>
      <button aria-label="Reset view" className={btn} onClick={() => map.fitBounds(home)}>⤢</button>
    </div>
  );
}

/* ---------- Legend ---------- */
function Legend({ levels, color, onColorChange }: { levels: MapLevel[]; color: string | null; onColorChange: (color: string | null) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    L.DomEvent.disableClickPropagation(ref.current);
    L.DomEvent.disableScrollPropagation(ref.current);
  }, []);

  return (
    <div ref={ref} className="map-legend absolute bottom-4 left-4 z-[1000] rounded-xl bg-white/95 px-4 py-3 text-xs shadow-md">
      <p className="mb-2 font-semibold text-[#232326]">Number of studies</p>
      <div className="map-legend-color">
        <label className="map-color-picker"><span>Map color</span><input type="color" aria-label="Choose map gradient color" value={color ?? referencePalette.deepTeal} onChange={event => onColorChange(event.target.value)} /></label>
        <button type="button" className="map-color-reset" disabled={color === null} onClick={() => onColorChange(null)}>Reset</button>
      </div>
      {levels.map((l) => (
        <div key={l.label} className="flex items-center gap-2 py-0.5 text-[#30383f]">
          <span className="h-3 w-5 rounded-sm" style={{ backgroundColor: l.color }} />
          {l.label}
        </div>
      ))}
    </div>
  );
}

/* ---------- Region tabs ---------- */
function RegionTabs({ view, onChange }: { view: View; onChange: (v: View) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) L.DomEvent.disableClickPropagation(ref.current);
  }, []);

  return (
    <div
      ref={ref}
      className="map-region-tabs absolute left-1/2 top-4 z-[1000] flex -translate-x-1/2 gap-1 bg-white p-1 text-sm shadow-md"
    >
      {VIEWS.map((v) => (
        <button
          key={v}
          onClick={() => onChange(v)}
          className={`whitespace-nowrap rounded-full px-3 py-1.5 font-medium transition ${
            v === view ? "bg-[#30383f] text-white" : "text-[#30383f] hover:underline"
          }`}
        >
          {v}
        </button>
      ))}
    </div>
  );
}

/* ---------- zoom to the selected country, or to the chosen region ---------- */
function FlyTo({ selected, view }: { selected: string; view: View }) {
  const map = useMap();
  useEffect(() => {
    if (selected !== "All") {
      const feature = features.find((f) => nameOf(f) === selected);
      if (feature) {
        map.flyToBounds(boundsOf([feature]), { padding: [40, 40], maxZoom: 6, duration: 0.8 });
        return;
      }
    }
    map.flyToBounds(viewBounds[view], { duration: 0.8 });
  }, [selected, view, map]);
  return null; // draws nothing, it only controls the map
}

/* ---------- country names + counts when zoomed in ---------- */
function CountryLabels({ counts }: { counts: Record<string, number> }) {
  const zoom = useZoom();
  if (zoom < LABEL_ZOOM) return null;

  return (
    <>
      {centers.map(({ name, center }) => {
        const n = counts[name] ?? 0;
        const countText =
          n > 0 ? `<br/><span style="font-weight:400">${n} ${n === 1 ? "study" : "studies"}</span>` : "";
        const icon = L.divIcon({
          className: "",
          iconSize: [110, 34],
          iconAnchor: [55, 17],
          html: `<div style="text-align:center;font:600 11px sans-serif;color:#232326;text-shadow:0 0 3px #fff,0 0 3px #fff;pointer-events:none">${name}${countText}</div>`,
        });
        return <Marker key={name} position={center} icon={icon} interactive={false} />;
      })}
    </>
  );
}

/* ---------- The map ---------- */
type Props = {
  counts: Record<string, number>;
  selected?: string; // selected country ("All" = none)
  onSelect?: (country: string) => void;
};

export default function StudyMap({ counts, selected = "All", onSelect }: Props) {
  // Africa first, so the map opens exactly like before
  const [view, setView] = useState<View>("Africa");
  const [mapColor, setMapColor] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const stored = window.localStorage.getItem(MAP_COLOR_KEY);
      return isMapColor(stored) ? stored : null;
    } catch { return null; }
  });
  const levels = useMemo(() => createMapLevels(mapColor), [mapColor]);

  function changeMapColor(color: string | null) {
    if (color !== null && !isMapColor(color)) return;
    setMapColor(color);
    try {
      if (color === null) window.localStorage.removeItem(MAP_COLOR_KEY);
      else window.localStorage.setItem(MAP_COLOR_KEY, color);
    } catch { /* The color picker still works when browser storage is unavailable. */ }
  }

  // refs always hold the latest values, so hover/click code never uses old data
  const countsRef = useRef(counts);
  const selectedRef = useRef(selected);
  const onSelectRef = useRef(onSelect);
  const levelsRef = useRef(levels);
  countsRef.current = counts;
  selectedRef.current = selected;
  onSelectRef.current = onSelect;
  levelsRef.current = levels;

  // dev help: dataset countries that have no shape on the map (usually a spelling difference)
  useEffect(() => {
    const missing = Object.keys(counts).filter((c) => !mapNames.has(c));
    if (missing.length) console.warn("Countries in the data but not on the map:", missing);
  }, [counts]);

  const changeView = (v: View) => {
    onSelect?.("All");
    setView(v);
  };

  const styleFor = (feature?: Feature): PathOptions => {
    const name = feature ? nameOf(feature) : "";
    const isSelected = name === selectedRef.current;
    return {
      fillColor: studyCountColor(countsRef.current[name] ?? 0, levelsRef.current),
      fillOpacity: 1,
      color: isSelected ? HOVER_BORDER : "#ffffff",
      weight: isSelected ? 2.5 : 0.8,
    };
  };

  const onEachFeature = (feature: Feature, layer: Layer) => {
    const name = nameOf(feature);

    layer.bindTooltip(
      () => {
        const n = countsRef.current[name] ?? 0;
        return `<strong>${name}</strong><br/>${n} ${n === 1 ? "study" : "studies"}`;
      },
      { sticky: true, direction: "top", opacity: 1 }
    );

    layer.on({
      add: () => {
        if (!(layer instanceof L.Path)) return;
        const element = layer.getElement();
        if (!element) return;
        element.setAttribute("data-country", name);
        element.setAttribute("role", "button");
        element.setAttribute("tabindex", "0");
        element.setAttribute("aria-label", `${name}. Select to filter studies.`);
        element.addEventListener("keydown", event => {
          if (!(event instanceof KeyboardEvent) || (event.key !== "Enter" && event.key !== " ")) return;
          event.preventDefault();
          event.stopPropagation();
          onSelectRef.current?.(name === selectedRef.current ? "All" : name);
        });
      },
      mouseover: (e) => {
        const path = e.target as L.Path;
        path.setStyle({ weight: 2.5, color: HOVER_BORDER });
        path.bringToFront();
      },
      mouseout: (e) => (e.target as L.Path).setStyle(styleFor(feature)),
      click: () => {
        // click the same country again to go back to the region view
        onSelectRef.current?.(name === selectedRef.current ? "All" : name);
      },
    });
  };

  return (
    <div className="study-map relative bg-white">
      {/* "Back" button, only visible when a country is selected */}
      {selected !== "All" && (
        <button
          onClick={() => onSelect?.("All")}
          className="absolute left-4 top-16 z-[1000] rounded-full bg-white px-4 py-2 text-sm font-medium text-[#30383f] shadow-md hover:underline"
        >
          ← {view === "All" ? "All regions" : view}
        </button>
      )}

      <MapContainer
        bounds={viewBounds.Africa}
        maxBounds={viewBounds.All.pad(0.3)}
        maxBoundsViscosity={0.8}
        minZoom={2}
        zoomSnap={0.25}
        style={{ height: "clamp(320px, 65svh, 520px)", width: "100%", background: "var(--map-water)" }}
        zoomControl={false}
        attributionControl={true}
        scrollWheelZoom={false}
      >
        <GeoJSON data={mapData} style={(f) => styleFor(f)} onEachFeature={onEachFeature} />
        <CountryLabels counts={counts} />
        <FlyTo selected={selected} view={view} />
        <RegionTabs view={view} onChange={changeView} />
        <Controls home={viewBounds[view]} />
        <Legend levels={levels} color={mapColor} onColorChange={changeMapColor} />
      </MapContainer>
    </div>
  );
}
