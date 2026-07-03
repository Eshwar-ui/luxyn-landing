"use client";

import { useEffect, useRef } from "react";
import type { CSSProperties, ElementType, ReactNode } from "react";

/* ── scroll-reveal (framer-motion replacement) ──────────────────────────────
 * A single shared IntersectionObserver reveals any `.rv` element the first time
 * it scrolls into view by adding `.rv-in` (the fade/slide/scale transition lives
 * in globals.css). One observer for the whole page — far cheaper than shipping
 * framer-motion (~46KB gzip) just to fade sections in.
 *
 * No-JS / no-IntersectionObserver: elements reveal immediately, and a <noscript>
 * rule in the layout forces `.rv` visible so crawlers and JS-off visitors always
 * see the content. Reduced-motion visitors get the content with no transition
 * (see globals.css). */

let observer: IntersectionObserver | null = null;

function getObserver(): IntersectionObserver | null {
  if (typeof IntersectionObserver === "undefined") return null;
  if (observer) return observer;
  observer = new IntersectionObserver(
    (entries, obs) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("rv-in");
          obs.unobserve(entry.target);
        }
      }
    },
    // Reveal once the element is ~10% into the viewport (matches the old
    // framer-motion viewport margin).
    { rootMargin: "0px 0px -10% 0px", threshold: 0.01 },
  );
  return observer;
}

function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (el.classList.contains("rv-in")) return;
    const obs = getObserver();
    if (!obs) {
      el.classList.add("rv-in"); // no IO support — just show it
      return;
    }
    obs.observe(el);
    return () => obs.unobserve(el);
  }, []);
  return ref;
}

const VARIANT = { up: "", left: "rv-l", right: "rv-r", scale: "rv-s" } as const;

type RevealProps = {
  as?: ElementType;
  variant?: keyof typeof VARIANT;
  /** stagger delay in seconds */
  delay?: number;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
} & Record<string, unknown>;

/**
 * Drop-in wrapper that fades/slides its element in on scroll. Replaces
 * `<motion.X initial="hidden" whileInView="show" variants={…} />`.
 *   variant: up (default) · left · right · scale   — matches FU / FL / FR / FS.
 */
export default function Reveal({
  as: Tag = "div",
  variant = "up",
  delay = 0,
  className = "",
  style,
  children,
  ...rest
}: RevealProps) {
  const ref = useReveal<HTMLElement>();
  const cls = ["rv", VARIANT[variant], className].filter(Boolean).join(" ");
  const mergedStyle = delay ? { ...style, transitionDelay: `${delay}s` } : style;
  return (
    <Tag ref={ref} className={cls} style={mergedStyle} {...rest}>
      {children}
    </Tag>
  );
}
