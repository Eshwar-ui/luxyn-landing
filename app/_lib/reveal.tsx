import type { CSSProperties, ElementType, ReactNode } from "react";

/* ── scroll-reveal (framer-motion replacement) ──────────────────────────────
 * <Reveal> is a plain, server-renderable wrapper: it only stamps the `.rv`
 * classes. It ships no JS of its own, so sections built from it can stay server
 * components. A single <RevealObserver> (mounted once in the root layout) adds
 * `.rv-in` to every `.rv` element the first time it scrolls into view — the
 * fade/slide/scale transition lives in globals.css.
 *
 * Mobile (< lg), reduced-motion and no-JS visitors get no reveal at all: CSS
 * shows `.rv` immediately and the observer never starts, so phones pay nothing
 * for it (see globals.css + the <noscript> rule in the layout). */

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
  const cls = ["rv", VARIANT[variant], className].filter(Boolean).join(" ");
  const mergedStyle = delay ? { ...style, transitionDelay: `${delay}s` } : style;
  return (
    <Tag className={cls} style={mergedStyle} {...rest}>
      {children}
    </Tag>
  );
}
