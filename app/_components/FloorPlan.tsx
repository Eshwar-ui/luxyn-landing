"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Floor plan for the LUXYN Studios building — the real leasing blueprint (a navy
 * plan that already matches the brand), extracted from the source PDF into an
 * optimised WebP. The plan is shown in a navy card and opens into a zoom-/pan-
 * able lightbox so visitors can read every suite label. Below it, a crawlable
 * suite directory lists each suite's size (the raster's text isn't indexable),
 * and any chip opens the plan zoomed in.
 *
 * Client component: it owns the lightbox open / zoom / pan state.
 */

const PLAN_FULL = "/assets/floor-plan.webp";
const PLAN_PREVIEW = "/assets/floor-plan-preview.webp";
const PLAN_RATIO = "3344 / 1320";

/** Leasable suites, transcribed from the blueprint (letter → net SF). */
const SUITES: { id: string; sqft: number }[] = [
  { id: "A", sqft: 209 }, { id: "B", sqft: 143 }, { id: "C", sqft: 144 },
  { id: "D", sqft: 143 }, { id: "E", sqft: 143 }, { id: "F", sqft: 143 },
  { id: "G", sqft: 143 }, { id: "H", sqft: 144 }, { id: "J", sqft: 147 },
  { id: "K", sqft: 149 }, { id: "L", sqft: 143 }, { id: "M", sqft: 136 },
  { id: "N", sqft: 132 }, { id: "O", sqft: 136 }, { id: "P", sqft: 132 },
  { id: "Q", sqft: 130 }, { id: "R", sqft: 126 }, { id: "S", sqft: 134 },
  { id: "T", sqft: 132 }, { id: "U", sqft: 128 }, { id: "V", sqft: 135 },
  { id: "W", sqft: 149 }, { id: "X", sqft: 128 },
];

const SUITE_COUNT = SUITES.length;
const MIN_SF = Math.min(...SUITES.map(s => s.sqft));
const MAX_SF = Math.max(...SUITES.map(s => s.sqft));

const CHAMPAGNE = "rgb(194,160,107)";
const CREAM = "rgb(243,236,220)";
const NAVY = "rgb(20,35,59)";

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;

export default function FloorPlan() {
  const [open, setOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);

  const openViewer = useCallback(() => {
    setZoom(1);
    setPos({ x: 0, y: 0 });
    setOpen(true);
  }, []);

  // Lock body scroll + wire Esc while the lightbox is open; focus the close button.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "+" || e.key === "=") setZoom(z => Math.min(MAX_ZOOM, z + 0.5));
      if (e.key === "-") setZoom(z => Math.max(MIN_ZOOM, z - 0.5));
    };
    window.addEventListener("keydown", onKey);
    closeBtn.current?.focus();
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Reset pan whenever we zoom back out to fit.
  useEffect(() => {
    if (zoom <= 1) setPos({ x: 0, y: 0 });
  }, [zoom]);

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setZoom(z => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z - e.deltaY * 0.002)));
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (zoom <= 1) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, ox: pos.x, oy: pos.y };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    setPos({ x: drag.current.ox + (e.clientX - drag.current.x), y: drag.current.oy + (e.clientY - drag.current.y) });
  };
  const onPointerUp = () => { drag.current = null; };

  return (
    <section className="w-full" style={{ background: CREAM }}>
      <div className="mx-auto w-full max-w-[1180px] px-6 lg:px-12 pt-12 pb-16 lg:pt-14 lg:pb-24">
        {/* headline stats */}
        <div className="flex flex-wrap items-end justify-between gap-6 mb-7">
          <div>
            <p className="font-accent font-semibold" style={{ color: CHAMPAGNE, fontSize: 13, letterSpacing: 4 }}>
              THE BUILDING
            </p>
            <h2 className="font-display font-semibold text-[26px] sm:text-[32px]" style={{ color: NAVY, lineHeight: 1.15, marginTop: 8 }}>
              {SUITE_COUNT} private suites, one address
            </h2>
          </div>
          <dl className="flex gap-8">
            <div>
              <dt className="font-ui text-[11px] uppercase tracking-[0.18em]" style={{ color: "rgba(20,35,59,.55)" }}>Suites</dt>
              <dd className="font-display font-semibold text-[24px]" style={{ color: NAVY }}>{SUITE_COUNT}</dd>
            </div>
            <div>
              <dt className="font-ui text-[11px] uppercase tracking-[0.18em]" style={{ color: "rgba(20,35,59,.55)" }}>Suite size</dt>
              <dd className="font-display font-semibold text-[24px]" style={{ color: NAVY }}>{MIN_SF}–{MAX_SF} <span className="text-[15px] font-normal">SF</span></dd>
            </div>
          </dl>
        </div>

        {/* ── the plan: the real navy blueprint, click to zoom ───────── */}
        <figure
          className="relative rounded-[18px] p-3 sm:p-5"
          style={{ background: NAVY, boxShadow: "0 24px 60px rgba(20,35,59,.28), inset 0 0 0 1px rgba(225,216,194,.14)" }}
        >
          <button
            type="button"
            onClick={openViewer}
            aria-label="Open the full-size, zoomable floor plan"
            className="group block w-full overflow-hidden rounded-[10px] cursor-zoom-in outline-none focus-visible:ring-2 focus-visible:ring-champagne"
            style={{ ["--tw-ring-color" as string]: CHAMPAGNE }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={PLAN_PREVIEW}
              alt={`LUXYN Studios floor plan — ${SUITE_COUNT} private suites from ${MIN_SF} to ${MAX_SF} SF, a conference room, shared reception and restrooms, arranged along a central hall with multiple exits.`}
              loading="lazy"
              decoding="async"
              className="w-full h-auto block transition-transform duration-500 group-hover:scale-[1.015]"
              style={{ aspectRatio: PLAN_RATIO }}
            />
            {/* zoom affordance */}
            <span
              className="absolute right-5 top-5 sm:right-8 sm:top-8 inline-flex items-center gap-2 rounded-full px-3.5 py-2 font-ui text-[11px] uppercase tracking-[0.14em] transition-colors duration-300"
              style={{ background: "rgba(20,35,59,.72)", color: CREAM, backdropFilter: "blur(6px)", border: "1px solid rgba(225,216,194,.3)" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3M11 8v6M8 11h6" /></svg>
              Click to zoom
            </span>
          </button>
          <figcaption className="flex flex-wrap items-center justify-between gap-3 mt-3 px-1">
            <span className="font-ui text-[11px] uppercase tracking-[0.22em]" style={{ color: "rgba(225,216,194,.55)" }}>
              Suite Map · Ground Floor
            </span>
            <span className="font-ui text-[11px]" style={{ color: "rgba(225,216,194,.45)" }}>
              Tap any suite below to view it enlarged
            </span>
          </figcaption>
        </figure>

        {/* ── suite directory (crawlable) ────────────────────────────── */}
        <div className="mt-10">
          <h3 className="font-display font-semibold text-[20px] sm:text-[22px]" style={{ color: NAVY, marginBottom: 14 }}>
            Suite directory
          </h3>
          <ul className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
            {SUITES.map(suite => (
              <li key={suite.id}>
                <button
                  type="button"
                  onClick={openViewer}
                  aria-label={`Suite ${suite.id}, ${suite.sqft} square feet — open floor plan`}
                  className="w-full flex items-center justify-between rounded-[10px] px-3 py-2.5 transition-all duration-200 cursor-pointer outline-none focus-visible:ring-2 hover:-translate-y-0.5 hover:shadow-[0_10px_22px_rgba(20,35,59,.14)]"
                  style={{
                    background: "rgb(252,250,244)",
                    boxShadow: "inset 0 0 0 1px rgb(225,216,194)",
                    ["--tw-ring-color" as string]: CHAMPAGNE,
                  }}
                >
                  <span className="font-display font-bold text-[19px]" style={{ color: NAVY }}>{suite.id}</span>
                  <span className="font-ui text-[12px] tabular-nums" style={{ color: "rgba(20,35,59,.6)" }}>{suite.sqft} SF</span>
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-4 font-ui text-[13px]" style={{ color: "rgba(20,35,59,.6)", lineHeight: 1.6 }}>
            Shared amenities include a staffed reception, a 90 SF meeting room, women&rsquo;s and
            men&rsquo;s restrooms, a printing / stationery room and a private phone booth.
          </p>
        </div>

        {/* CTA */}
        <a
          href="/lease-a-suite"
          className="inline-flex items-center justify-center h-[52px] px-10 mt-10 rounded-full font-ui font-bold text-white cursor-pointer transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(20,35,59,.32)]"
          style={{ fontSize: 15, letterSpacing: 0.5, background: NAVY }}
        >
          Enquire about a suite
        </a>
      </div>

      {/* ── zoom / pan lightbox ──────────────────────────────────────── */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Floor plan, enlarged"
          className="fixed inset-0 z-[300] flex flex-col"
          style={{ background: "rgba(9,16,28,.94)", backdropFilter: "blur(6px)" }}
          onClick={e => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          {/* toolbar */}
          <div className="flex items-center justify-between px-5 py-4 sm:px-8">
            <span className="font-ui text-[12px] uppercase tracking-[0.22em]" style={{ color: "rgba(225,216,194,.7)" }}>
              LUXYN · Floor Plan
            </span>
            <div className="flex items-center gap-2">
              {[
                { l: "Zoom out", d: "M8 11h6", on: () => setZoom(z => Math.max(MIN_ZOOM, z - 0.5)) },
                { l: "Zoom in", d: "M11 8v6M8 11h6", on: () => setZoom(z => Math.min(MAX_ZOOM, z + 0.5)) },
              ].map(({ l, d, on }) => (
                <button key={l} type="button" onClick={on} aria-label={l}
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-200 hover:bg-white/10"
                  style={{ border: "1px solid rgba(225,216,194,.3)", color: CREAM }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7" /><path d={d} /><path d="m21 21-4.3-4.3" /></svg>
                </button>
              ))}
              <button ref={closeBtn} type="button" onClick={() => setOpen(false)} aria-label="Close"
                className="w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-200 hover:bg-white/10"
                style={{ border: "1px solid rgba(225,216,194,.3)", color: CREAM }}>
                <svg width="16" height="16" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M1 1 L13 13 M13 1 L1 13" /></svg>
              </button>
            </div>
          </div>

          {/* stage */}
          <div
            className="relative flex-1 overflow-hidden flex items-center justify-center px-3 pb-3"
            onWheel={onWheel}
            style={{ touchAction: "none", cursor: zoom > 1 ? (drag.current ? "grabbing" : "grab") : "zoom-in" }}
            onClick={() => { if (zoom <= 1) setZoom(2); }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={PLAN_FULL}
              alt="LUXYN Studios floor plan, enlarged"
              draggable={false}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              className="max-w-full max-h-full object-contain select-none"
              style={{
                transform: `translate(${pos.x}px, ${pos.y}px) scale(${zoom})`,
                transition: drag.current ? "none" : "transform .15s ease-out",
                aspectRatio: PLAN_RATIO,
              }}
            />
          </div>
          <p className="text-center pb-4 font-ui text-[11px]" style={{ color: "rgba(225,216,194,.45)" }}>
            Scroll or use + / − to zoom · drag to pan · Esc to close
          </p>
        </div>
      )}
    </section>
  );
}
