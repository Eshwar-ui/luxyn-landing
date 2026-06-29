"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { NAV, BLOG_LINK } from "../_lib/nav";
import { site } from "../_lib/site";

const btnGold =
  "h-[40px] px-6 rounded-full font-bold text-[13px] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_26px_rgba(194,160,107,.45)] cursor-pointer";

/**
 * Site-wide header — the glass menu overlay + sticky navbar. Shared by the home
 * page, the section SEO pages and the legal pages. Each menu link navigates to
 * the section's own dedicated, indexable SEO page at /slug (matching the footer),
 * so the nav is plain page-to-page navigation rather than home-page scrolling.
 */
export default function SiteHeader() {
  const pathname = usePathname();
  const onHome = pathname === "/";
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMenuOpen(false); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  const onLogo = (e: React.MouseEvent) => {
    if (onHome) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  /** Flatten the menu into one numbered index: each section links to its own
   *  dedicated /slug SEO page, followed by the Blog route. */
  const menuItems: { label: string; href: string }[] = [
    ...NAV.map(n => ({ label: n.label, href: `/${n.slug}` })),
    { label: BLOG_LINK.label, href: BLOG_LINK.href },
  ];

  return (
    <>
      {/* ── glassmorphism menu overlay ────────────────── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[200]"
            style={{ background: "rgba(5,12,24,.5)" }}
            onClick={e => { if (e.target === e.currentTarget) setMenuOpen(false); }}
          >
            <motion.div
              key="panel"
              initial={{ opacity: 0, y: -20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.97 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="absolute top-3 left-[4%] right-[4%] sm:left-[5%] sm:right-[5%] rounded-[24px] px-6 py-12 sm:px-16"
              style={{
                background: "rgba(33,45,63,0.85)",
                backdropFilter: "blur(24px) saturate(1.2)",
                WebkitBackdropFilter: "blur(24px) saturate(1.2)",
                border: "1px solid rgba(255,255,255,0.4)",
                boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
              }}
            >
              {/* top bar of the panel: overline label + close affordance */}
              <div className="flex items-center justify-between mb-8 sm:mb-10">
                <button
                  onClick={() => setMenuOpen(false)}
                  aria-label="Close menu"
                  className="group flex items-center gap-2 text-cream/70 transition-colors duration-300 hover:text-champagne p-1"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="transition-transform duration-300 group-hover:rotate-90">
                    <path d="M1 1 L13 13 M13 1 L1 13" />
                  </svg>
                  <span className="font-ui text-[11px] tracking-[0.22em] uppercase hidden sm:inline">Close</span>
                </button>
                <span className="font-ui text-[11px] tracking-[0.32em] uppercase text-champagne/70">
                  Explore
                </span>
              </div>

              <div className="grid gap-y-10 lg:grid-cols-[1fr_auto]">
                {/* ── numbered editorial index ───────────────── */}
                <nav className="flex flex-col lg:grid lg:grid-flow-col lg:grid-rows-4 lg:grid-cols-2 lg:gap-x-12 lg:pr-16">
                  {menuItems.map(({ label, href }, i) => (
                    <a
                      key={label}
                      href={href}
                      onClick={() => setMenuOpen(false)}
                      className="group relative flex items-center gap-5 py-[7px] sm:py-2 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-champagne/60"
                    >
                      <span className="w-7 shrink-0 font-ui text-[12px] sm:text-[13px] tabular-nums tracking-[0.18em] text-champagne/55 transition-colors duration-300 group-hover:text-champagne/30 group-focus-visible:text-champagne/30">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="relative flex items-center">
                        {/* arrow slides in from the left on hover/focus */}
                        <span
                          aria-hidden
                          className="absolute -left-6 flex text-champagne opacity-0 -translate-x-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 group-focus-visible:opacity-100 group-focus-visible:translate-x-0"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                        </span>
                        <span className="font-display leading-none text-[26px] sm:text-[32px] text-cream transition-all duration-300 group-hover:translate-x-3 group-hover:text-champ-lit group-focus-visible:translate-x-3 group-focus-visible:text-champ-lit">
                          {label}
                        </span>
                      </span>
                    </a>
                  ))}
                </nav>

                {/* ── supporting panel: where + how to reach us ─ */}
                <aside className="flex flex-col gap-7 border-t border-white/15 pt-8 lg:w-[280px] lg:border-t-0 lg:border-l lg:pt-1 lg:pl-16">
                  <div>
                    <p className="font-ui text-[11px] tracking-[0.28em] uppercase text-champagne/70 mb-3">Visit</p>
                    <p className="font-accent text-[15px] leading-relaxed text-cream/85">
                      {site.contact.address.street}<br />
                      {site.contact.address.locality}, {site.contact.address.region} {site.contact.address.postalCode}
                    </p>
                  </div>
                  <div>
                    <p className="font-ui text-[11px] tracking-[0.28em] uppercase text-champagne/70 mb-3">Contact</p>
                    <a href={`tel:${site.contact.phoneHref}`} className="block font-accent text-[15px] text-cream/85 transition-colors duration-300 hover:text-champagne">
                      {site.contact.phone}
                    </a>
                    <a href={`mailto:${site.contact.email}`} className="block font-accent text-[15px] text-cream/85 transition-colors duration-300 hover:text-champagne break-all">
                      {site.contact.email}
                    </a>
                  </div>
                  <a
                    href="/lease-a-suite"
                    onClick={() => setMenuOpen(false)}
                    className={`${btnGold} inline-flex items-center justify-center gap-2 w-full mt-1`}
                    style={{ background: "rgb(194,160,107)", color: "rgb(20,35,59)", fontFamily: "var(--font-inter), sans-serif" }}
                  >
                    LEASE A SUITE
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                  </a>
                </aside>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── sticky navbar ─────────────────────────────── */}
      <header
        className="fixed top-0 left-0 z-[100] transition-all duration-300 flex justify-center w-full"
        style={{
          paddingTop: scrolled ? 16 : 24,
          paddingBottom: scrolled ? 16 : 24,
          background: scrolled ? "rgba(13, 27, 46, 0.85)" : "transparent",
          backdropFilter: scrolled ? "blur(16px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(16px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(255,255,255,0.08)" : "1px solid transparent",
        }}
      >
        <div className="relative w-full max-w-[1240px] px-6 lg:px-12 flex items-center justify-between h-[50px]">
          <button
            onClick={() => setMenuOpen(true)}
            onMouseEnter={() => setMenuOpen(true)}
            aria-label="Open menu"
            className="w-[44px] h-[44px] md:w-[50px] md:h-[50px] rounded-full flex items-center justify-center transition-[background] duration-300 hover:bg-white/20 shrink-0"
            style={{ background: "rgba(255,255,255,.1)", backdropFilter: "blur(9.8px)", boxShadow: "inset 0 0 0 1px rgb(255,248,248)" }}
          >
            <svg width="22" height="16" viewBox="0 0 22 16" fill="rgb(255,255,255)">
              <path d="M1.571 0H9.429a1.6 1.6 0 0 1 0 3.2H1.571a1.6 1.6 0 0 1 0-3.2ZM12.571 12.8h7.858a1.6 1.6 0 0 1 0 3.2h-7.858a1.6 1.6 0 0 1 0-3.2ZM1.571 6.4h18.858a1.6 1.6 0 0 1 0 3.2H1.571a1.6 1.6 0 0 1 0-3.2Z" />
            </svg>
          </button>

          <a
            href="/"
            onClick={onLogo}
            aria-label="LUXYN — home"
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-opacity hover:opacity-80"
          >
            <img
              src="/assets/logo.svg"
              alt="LUXYN"
              className="h-7 sm:h-9 md:h-11 w-auto"
            />
          </a>

          <a
            href="/lease-a-suite"
            className={`${btnGold} hidden md:flex items-center shrink-0`}
            style={{ background: "rgb(194,160,107)", color: "rgb(20,35,59)", fontFamily: "var(--font-inter), sans-serif" }}
          >
            LEASE A SUITE
          </a>
          <a
            href="/lease-a-suite"
            aria-label="Lease a suite"
            className="md:hidden flex items-center justify-center w-[44px] h-[44px] rounded-full shrink-0"
            style={{ background: "rgb(194,160,107)", color: "rgb(20,35,59)" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
          </a>
        </div>
      </header>
    </>
  );
}
