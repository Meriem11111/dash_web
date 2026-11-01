"use client";

import { useRef, useState, type ReactNode } from "react";

export default function EvidenceScreenshot({ children, kind }: { children: ReactNode; kind: "chart" | "map" }) {
  const captureRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");

  async function download() {
    const node = captureRef.current;
    if (!node || saving) return;
    if (node.querySelector(".map-loading")) {
      setStatus("The map is still loading. Please try again in a moment.");
      return;
    }
    setSaving(true);
    setStatus("");
    let exportHost: HTMLDivElement | undefined;
    try {
      const { toPng } = await import("html-to-image");
      await document.fonts.ready;
      let target = node;
      // Expand the chart for export so its horizontally scrolling columns
      // are all included on small screens. Keep the map's current viewport.
      if (kind === "chart") {
        exportHost = document.createElement("div");
        exportHost.setAttribute("aria-hidden", "true");
        exportHost.inert = true;
        Object.assign(exportHost.style, { position: "fixed", left: "-100000px", top: "0" });
        target = node.cloneNode(true) as HTMLDivElement;
        target.style.width = `${Math.max(node.clientWidth, 900)}px`;
        exportHost.appendChild(target);
        document.body.appendChild(exportHost);
      }
      const image = await toPng(target, {
        backgroundColor: getComputedStyle(node).backgroundColor,
        pixelRatio: 2,
        // All text uses system fonts; no remote font requests are needed.
        skipFonts: true,
        filter: element => !(element instanceof Element && element.classList.contains("leaflet-tooltip-pane")),
      });
      const link = document.createElement("a");
      link.download = `landscape-evidence-${kind}.png`;
      link.href = image;
      link.click();
    } catch (error) {
      console.error("Could not export the evidence screenshot", error);
      setStatus("The screenshot could not be saved. Please try again.");
    } finally {
      exportHost?.remove();
      setSaving(false);
    }
  }

  return <>
    <div className="screenshot-toolbar">
      <span role="status" className="screenshot-status">{status}</span>
      <button type="button" className="outline-button" onClick={download} disabled={saving} aria-busy={saving}>
        {saving ? "Saving image…" : `Download ${kind}`}
      </button>
    </div>
    <div ref={captureRef} className="evidence-capture">
      {children}
    </div>
  </>;
}
