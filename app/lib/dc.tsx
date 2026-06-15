"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * Parse a raw CSS declaration string ("a:b;c:d") into a React style object.
 * This lets us transcribe the Claude Design handoff's inline styles verbatim.
 * Splits declarations on ";" and each declaration on its FIRST ":" only, so
 * values containing ":" / "/" / "," (url(), rgba(), gradients) are preserved.
 */
export function S(css?: string): React.CSSProperties {
  const out: React.CSSProperties = {};
  if (!css) return out;
  const write = out as Record<string, string>;
  for (const decl of css.split(";")) {
    const i = decl.indexOf(":");
    if (i < 0) continue;
    const prop = decl.slice(0, i).trim();
    const value = decl.slice(i + 1).trim();
    if (!prop || !value) continue;
    let key: string;
    if (prop.startsWith("-")) {
      // vendor prefix: -webkit-foo -> WebkitFoo
      key = prop.slice(1).replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
      key = key.charAt(0).toUpperCase() + key.slice(1);
    } else {
      key = prop.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
    }
    write[key] = value;
  }
  return out;
}

type EProps = {
  /** base inline CSS string (transcribed from the design) */
  css?: string;
  /** CSS applied while hovered — mirrors the design's `style-hover` */
  hover?: string;
  /** element tag, default "div" */
  as?: keyof React.JSX.IntrinsicElements;
  className?: string;
  children?: React.ReactNode;
} & { [dataAttr: `data-${string}`]: string | number | undefined } & Omit<
    React.HTMLAttributes<HTMLElement>,
    "style" | "className"
  >;

/**
 * Universal styled element used to recreate the design.
 * - `css` / `hover` accept raw CSS strings (parsed by `S`).
 * - When `className` contains the `rv` token, the element self-reveals via an
 *   IntersectionObserver (adds `rv-in` once it scrolls into view), reproducing
 *   the design's scroll-reveal without a DOM/React className conflict.
 */
export function E({
  css,
  hover,
  as = "div",
  className = "",
  children,
  ...rest
}: EProps) {
  const isRv = useMemo(
    () => className.split(/\s+/).includes("rv"),
    [className]
  );
  const [revealed, setRevealed] = useState(false);
  const [hovered, setHovered] = useState(false);
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isRv) return;
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setRevealed(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setRevealed(true);
            io.disconnect();
            break;
          }
        }
      },
      { root: null, rootMargin: "0px 0px -8% 0px", threshold: 0 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [isRv]);

  const cls = [className, isRv && revealed ? "rv-in" : ""]
    .filter(Boolean)
    .join(" ");

  const style = useMemo<React.CSSProperties>(
    () => ({ ...S(css), ...(hovered && hover ? S(hover) : {}) }),
    [css, hover, hovered]
  );

  const Tag = as as React.ElementType;
  return (
    <Tag
      {...rest}
      ref={ref}
      className={cls || undefined}
      style={style}
      onMouseEnter={hover ? () => setHovered(true) : rest.onMouseEnter}
      onMouseLeave={hover ? () => setHovered(false) : rest.onMouseLeave}
    >
      {children}
    </Tag>
  );
}
