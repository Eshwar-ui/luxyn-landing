"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Must match the `max-width` breakpoint in globals.css that shows `.rv`
 *  immediately on small screens. */
const DESKTOP_QUERY = "(min-width: 1024px) and (prefers-reduced-motion: no-preference)";

/**
 * One IntersectionObserver for every `.rv` element on the page (see reveal.tsx).
 * Desktop only — on phones CSS already shows the content, so this bails out
 * before doing any DOM work. Re-scans on route change.
 */
export default function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    if (!window.matchMedia(DESKTOP_QUERY).matches) return;
    const els = document.querySelectorAll<HTMLElement>(".rv:not(.rv-in)");
    if (!els.length) return;
    if (typeof IntersectionObserver === "undefined") {
      els.forEach(el => el.classList.add("rv-in")); // no IO support — just show it
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
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
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, [pathname]);

  return null;
}
