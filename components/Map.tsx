// "use client";

// import { MapContainer, GeoJSON, useMap } from "react-leaflet";
// import L from "leaflet";
// import type { Layer, PathOptions } from "leaflet";
// import type { Feature, FeatureCollection } from "geojson";
// import { useEffect, useRef } from "react";
// import "leaflet/dist/leaflet.css";
// import africaData from "@/data/africa.json";

// const africa = africaData as unknown as FeatureCollection;
// const bounds = L.geoJSON(africa).getBounds();

// // Color scale: edit the numbers here and the legend updates automatically
// const LEVELS = [
//   { min: 25, color: "#134e2f", label: "25+" },
//   { min: 12, color: "#2f7d4f", label: "12 – 24" },
//   { min: 5, color: "#6aa874", label: "5 – 11" },
//   { min: 1, color: "#b9d9a8", label: "1 – 4" },
//   { min: 0, color: "#e9e6da", label: "No studies" },
// ];
// const colorFor = (n: number) => LEVELS.find((l) => n >= l.min)!.color;

// const HOVER_BORDER = "#0E3715";

// /* ---------- Zoom + reset buttons ---------- */
// function Controls() {
//   const map = useMap();
//   const ref = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     if (ref.current) L.DomEvent.disableClickPropagation(ref.current);
//   }, []);

//   const btn =
//     "flex h-9 w-9 items-center justify-center rounded-full bg-white text-lg font-medium text-[#134e2f] shadow-md transition hover:bg-[#f0f5ea]";

//   return (
//     <div ref={ref} className="absolute right-4 top-4 z-[1000] flex flex-col gap-2">
//       <button aria-label="Zoom in" className={btn} onClick={() => map.zoomIn()}>+</button>
//       <button aria-label="Zoom out" className={btn} onClick={() => map.zoomOut()}>−</button>
//       <button aria-label="Reset view" className={btn} onClick={() => map.fitBounds(bounds)}>⤢</button>
//     </div>
//   );
// }

// /* ---------- Legend ---------- */
// function Legend() {
//   const ref = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     if (ref.current) L.DomEvent.disableClickPropagation(ref.current);
//   }, []);

//   return (
//     <div
//       ref={ref}
//       className="absolute bottom-4 left-4 z-[1000] rounded-xl bg-white/95 px-4 py-3 text-xs shadow-md"
//     >
//       <p className="mb-2 font-semibold text-[#0E3715]">Number of studies</p>
//       {LEVELS.map((l) => (
//         <div key={l.label} className="flex items-center gap-2 py-0.5 text-gray-700">
//           <span className="h-3 w-5 rounded-sm" style={{ backgroundColor: l.color }} />
//           {l.label}
//         </div>
//       ))}
//     </div>
//   );
// }

// /* ---------- The map ---------- */
// type Props = {
//   counts: Record<string, number>;
//   selected?: string; // currently selected country ("All" = none)
//   onSelect?: (country: string) => void; // called when a country is clicked
// };

// export default function StudyMap({ counts, selected = "All", onSelect }: Props) {
//   // Refs always hold the latest values, so the hover/click code never uses old data
//   const countsRef = useRef(counts);
//   const selectedRef = useRef(selected);
//   const onSelectRef = useRef(onSelect);
//   countsRef.current = counts;
//   selectedRef.current = selected;
//   onSelectRef.current = onSelect;

//   const styleFor = (feature?: Feature): PathOptions => {
//     const name = feature?.properties?.name as string;
//     const isSelected = name === selectedRef.current;
//     return {
//       fillColor: colorFor(countsRef.current[name] ?? 0),
//       fillOpacity: 1,
//       color: isSelected ? HOVER_BORDER : "#ffffff",
//       weight: isSelected ? 2.5 : 0.8,
//     };
//   };

//   const onEachFeature = (feature: Feature, layer: Layer) => {
//     const name = feature.properties?.name as string;

//     // Tooltip follows the mouse and always shows the current count
//     layer.bindTooltip(
//       () => {
//         const n = countsRef.current[name] ?? 0;
//         return `<strong>${name}</strong><br/>${n} ${n === 1 ? "study" : "studies"}`;
//       },
//       { sticky: true, direction: "top", opacity: 1 }
//     );

//     layer.on({
//       mouseover: (e) => {
//         const path = e.target as L.Path;
//         path.setStyle({ weight: 2.5, color: HOVER_BORDER });
//         path.bringToFront();
//       },
//       mouseout: (e) => (e.target as L.Path).setStyle(styleFor(feature)),
//       click: () => {
//         // click again on the same country to clear the filter
//         onSelectRef.current?.(name === selectedRef.current ? "All" : name);
//       },
//     });
//   };

//   return (
//     <div className="relative overflow-hidden rounded-2xl border border-[#d8dfc8] bg-white shadow-sm">
//       <MapContainer
//         bounds={bounds}
//         maxBounds={bounds.pad(0.3)}
//         maxBoundsViscosity={0.8}
//         minZoom={3}
//         zoomSnap={0.25}
//         style={{ height: "520px", width: "100%", background: "#f4f7fa" }}
//         zoomControl={false}
//         attributionControl={false}
//         scrollWheelZoom={false}
//       >
//         <GeoJSON
//           data={africa}
//           // a new function each render makes Leaflet recolor when counts change
//           style={(f) => styleFor(f)}
//           onEachFeature={onEachFeature}
//         />
//         <Controls />
//         <Legend />
//       </MapContainer>
//     </div>
//   );
// }


"use client";

import { MapContainer, GeoJSON, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import type { Layer, PathOptions } from "leaflet";
import type { Feature, FeatureCollection } from "geojson";
import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import africaData from "@/data/africa.json";

const africa = africaData as unknown as FeatureCollection;
const bounds = L.geoJSON(africa).getBounds();

// center point of every country, computed once (used for the labels)
const centers = africa.features.map((f) => ({
  name: f.properties?.name as string,
  center: L.geoJSON(f).getBounds().getCenter(),
}));

const LABEL_ZOOM = 4.5; // country names + counts appear from this zoom level

const LEVELS = [
  { min: 25, color: "#134e2f", label: "25+" },
  { min: 12, color: "#2f7d4f", label: "12 – 24" },
  { min: 5, color: "#6aa874", label: "5 – 11" },
  { min: 1, color: "#b9d9a8", label: "1 – 4" },
  { min: 0, color: "#e9e6da", label: "No studies" },
];

// const LEVELS = [
//   { min: 25, color: "#9cf5d8", label: "25+" },
//   { min: 12, color: "#2de2b3", label: "12 – 24" },
//   { min: 5,  color: "#17a98a", label: "5 – 11" },
//   { min: 1,  color: "#1b6f66", label: "1 – 4" },
//   { min: 0,  color: "#1c2724", label: "No studies" },
// ];
const colorFor = (n: number) => LEVELS.find((l) => n >= l.min)!.color;
const HOVER_BORDER = "#0E3715";

/* ---------- current zoom level, updates when the user zooms ---------- */
function useZoom() {
  const map = useMap();
  const [zoom, setZoom] = useState(map.getZoom());
  useMapEvents({ zoomend: () => setZoom(map.getZoom()) });
  return zoom;
}

/* ---------- Zoom + reset buttons ---------- */
function Controls() {
  const map = useMap();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) L.DomEvent.disableClickPropagation(ref.current);
  }, []);

  const btn =
    "flex h-9 w-9 items-center justify-center rounded-full bg-white text-lg font-medium text-[#134e2f] shadow-md transition hover:bg-[#f0f5ea]";

  return (
    <div ref={ref} className="absolute right-4 top-4 z-[1000] flex flex-col gap-2">
      <button aria-label="Zoom in" className={btn} onClick={() => map.zoomIn()}>+</button>
      <button aria-label="Zoom out" className={btn} onClick={() => map.zoomOut()}>−</button>
      <button aria-label="Reset view" className={btn} onClick={() => map.fitBounds(bounds)}>⤢</button>
    </div>
  );
}

/* ---------- Legend ---------- */
function Legend() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) L.DomEvent.disableClickPropagation(ref.current);
  }, []);

  return (
    <div ref={ref} className="absolute bottom-4 left-4 z-[1000] rounded-xl bg-white/95 px-4 py-3 text-xs shadow-md">
      <p className="mb-2 font-semibold text-[#0E3715]">Number of studies</p>
      {LEVELS.map((l) => (
        <div key={l.label} className="flex items-center gap-2 py-0.5 text-gray-700">
          <span className="h-3 w-5 rounded-sm" style={{ backgroundColor: l.color }} />
          {l.label}
        </div>
      ))}
    </div>
  );
}

/* ---------- OPTION 1: zoom to the selected country ---------- */
function FlyToSelected({ selected }: { selected: string }) {
  const map = useMap();
  useEffect(() => {
    if (selected === "All") {
      map.flyToBounds(bounds, { duration: 0.8 });
      return;
    }
    const feature = africa.features.find((f) => f.properties?.name === selected);
    if (feature) {
      map.flyToBounds(L.geoJSON(feature).getBounds(), {
        padding: [40, 40],
        maxZoom: 6,
        duration: 0.8,
      });
    }
  }, [selected, map]);
  return null; // draws nothing, it only controls the map
}

/* ---------- OPTION 2: country names + counts when zoomed in ---------- */
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
          html: `<div style="text-align:center;font:600 11px sans-serif;color:#0E3715;text-shadow:0 0 3px #fff,0 0 3px #fff;pointer-events:none">${name}${countText}</div>`,
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
  // refs always hold the latest values, so hover/click code never uses old data
  const countsRef = useRef(counts);
  const selectedRef = useRef(selected);
  const onSelectRef = useRef(onSelect);
  countsRef.current = counts;
  selectedRef.current = selected;
  onSelectRef.current = onSelect;

  const styleFor = (feature?: Feature): PathOptions => {
    const name = feature?.properties?.name as string;
    const isSelected = name === selectedRef.current;
    return {
      fillColor: colorFor(countsRef.current[name] ?? 0),
      fillOpacity: 1,
      color: isSelected ? HOVER_BORDER : "#ffffff",
      weight: isSelected ? 2.5 : 0.8,
    };
  };

  const onEachFeature = (feature: Feature, layer: Layer) => {
    const name = feature.properties?.name as string;

    layer.bindTooltip(
      () => {
        const n = countsRef.current[name] ?? 0;
        return `<strong>${name}</strong><br/>${n} ${n === 1 ? "study" : "studies"}`;
      },
      { sticky: true, direction: "top", opacity: 1 }
    );

    layer.on({
      mouseover: (e) => {
        const path = e.target as L.Path;
        path.setStyle({ weight: 2.5, color: HOVER_BORDER });
        path.bringToFront();
      },
      mouseout: (e) => (e.target as L.Path).setStyle(styleFor(feature)),
      click: () => {
        // click the same country again to go back to "All"
        onSelectRef.current?.(name === selectedRef.current ? "All" : name);
      },
    });
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#d8dfc8] bg-white shadow-sm">
      {/* "Back" button, only visible when a country is selected */}
      {selected !== "All" && (
        <button
          onClick={() => onSelect?.("All")}
          className="absolute left-4 top-4 z-[1000] rounded-full bg-white px-4 py-2 text-sm font-medium text-[#134e2f] shadow-md hover:bg-[#f0f5ea]"
        >
          ← All Africa
        </button>
      )}

      <MapContainer
        bounds={bounds}
        maxBounds={bounds.pad(0.3)}
        maxBoundsViscosity={0.8}
        minZoom={3}
        zoomSnap={0.25}
        style={{ height: "520px", width: "100%", background: "#f4f7fa" }}
        zoomControl={false}
        attributionControl={false}
        scrollWheelZoom={false}
      >
        <GeoJSON data={africa} style={(f) => styleFor(f)} onEachFeature={onEachFeature} />
        <CountryLabels counts={counts} />
        <FlyToSelected selected={selected} />
        <Controls />
        <Legend />
      </MapContainer>
    </div>
  );
}