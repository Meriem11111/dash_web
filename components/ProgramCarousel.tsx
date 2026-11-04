"use client";

import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";
import Icon from "@/components/Icon";

export default function ProgramCarousel({ children, total }: { children: ReactNode; total: number }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const metricsRef = useRef({ step: 1, visible: 1, max: 0 });
  const dragRef = useRef<{ pointerId: number; x: number; scroll: number; moved: boolean } | null>(null);
  const suppressClickRef = useRef(false);
  const [view, setView] = useState({ first: 1, last: 1, previous: false, next: total > 1 });

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let frame = 0;
    function update() {
      if (!track) return;
      const { step, visible, max } = metricsRef.current;
      const position = Math.max(0, Math.min(max, track.scrollLeft));
      const first = Math.max(1, Math.min(total - visible + 1, Math.round(position / step) + 1));
      const next = {
        first,
        last: Math.min(total, first + visible - 1),
        previous: position > 2,
        next: position < max - 2,
      };
      setView(previous => previous.first === next.first && previous.last === next.last && previous.previous === next.previous && previous.next === next.next ? previous : next);
    }
    function measure() {
      if (!track) return;
      const card = track.firstElementChild as HTMLElement | null;
      if (!card) return;
      const style = getComputedStyle(track);
      const gap = parseFloat(style.columnGap) || 0;
      const padding = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
      const step = parseFloat(getComputedStyle(card).width) + gap;
      metricsRef.current = {
        step,
        visible: Math.max(1, Math.floor((track.clientWidth - padding + gap + 1) / step)),
        max: Math.max(0, track.scrollWidth - track.clientWidth),
      };
      update();
    }
    function onScroll() {
      if (frame) return;
      frame = requestAnimationFrame(() => { frame = 0; update(); });
    }
    measure();
    track.addEventListener("scroll", onScroll, { passive: true });
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    return () => {
      track.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [total]);

  function move(direction: number) {
    const track = trackRef.current;
    if (!track) return;
    const { step, max } = metricsRef.current;
    track.scrollTo({
      left: Math.max(0, Math.min(max, (Math.round(track.scrollLeft / step) + direction) * step)),
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
    });
  }

  function startDrag(event: PointerEvent<HTMLDivElement>) {
    suppressClickRef.current = false;
    if (event.pointerType !== "mouse" || event.button !== 0) return;
    dragRef.current = { pointerId: event.pointerId, x: event.clientX, scroll: event.currentTarget.scrollLeft, moved: false };
  }

  function drag(event: PointerEvent<HTMLDivElement>) {
    const active = dragRef.current;
    if (!active || active.pointerId !== event.pointerId) return;
    const distance = event.clientX - active.x;
    if (!active.moved && Math.abs(distance) < 6) return;
    if (!active.moved) {
      active.moved = true;
      event.currentTarget.dataset.dragging = "true";
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    event.preventDefault();
    event.currentTarget.scrollLeft = active.scroll - distance;
  }

  function endDrag(event: PointerEvent<HTMLDivElement>) {
    const active = dragRef.current;
    if (!active || active.pointerId !== event.pointerId) return;
    suppressClickRef.current = active.moved;
    dragRef.current = null;
    delete event.currentTarget.dataset.dragging;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  }

  return <div className="program-carousel" role="region" aria-roledescription="carousel" aria-labelledby="programs-title">
    <div className="program-carousel-stage">
    <div id="programs" ref={trackRef} className="discovery-program-track" tabIndex={0} aria-label="Programs and initiatives. Swipe, drag, or use the arrow keys to browse."
      onPointerDown={startDrag} onPointerMove={drag} onPointerUp={endDrag} onPointerCancel={endDrag} onLostPointerCapture={endDrag}
      onPointerLeave={event => { if (!dragRef.current?.moved) endDrag(event); }}
      onDragStart={event => event.preventDefault()}
      onClickCapture={event => {
        if (!suppressClickRef.current) return;
        event.preventDefault();
        event.stopPropagation();
        suppressClickRef.current = false;
      }} onKeyDown={event => {
      if (event.target !== event.currentTarget) return;
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        move(event.key === "ArrowLeft" ? -1 : 1);
      }
    }}>{children}</div>
      <button type="button" className="program-carousel-arrow program-carousel-previous" aria-label="Previous programs" aria-controls="programs" disabled={!view.previous} onClick={() => move(-1)}><Icon name="arrow-right" /></button>
      <button type="button" className="program-carousel-arrow program-carousel-next" aria-label="Next programs" aria-controls="programs" disabled={!view.next} onClick={() => move(1)}><Icon name="arrow-right" /></button>
    </div>
    <div className="program-carousel-toolbar">
      <p>Swipe to explore</p>
      <span className="program-carousel-position" aria-live="polite" aria-atomic="true">{String(view.first).padStart(2, "0")}{view.last > view.first ? `–${String(view.last).padStart(2, "0")}` : ""} <span>/ {total}</span></span>
    </div>
  </div>;
}
