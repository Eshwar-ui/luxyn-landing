"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

/* ─── animation helpers ─────────────────────────────────── */
const ease = [0.16, 1, 0.3, 1] as const;
const FU  = { hidden: { opacity: 0, y: 36 },  show: { opacity: 1, y: 0,    transition: { duration: 1,   ease } } };
const FS  = { hidden: { opacity: 0, scale:.9}, show: { opacity: 1, scale:1, transition: { duration: 1,   ease } } };
const FL  = { hidden: { opacity: 0, x: -48 }, show: { opacity: 1, x: 0,    transition: { duration: 1,   ease } } };
const FR  = { hidden: { opacity: 0, x:  48 }, show: { opacity: 1, x: 0,    transition: { duration: 1,   ease } } };
const FI  = { hidden: { opacity: 0 },          show: { opacity: 1,           transition: { duration: .8         } } };
const vp  = { once: true, margin: "-10%" } as const;

function delay(d: number) {
  return { transition: { delay: d, duration: 1, ease } };
}

/* ─── nav data ──────────────────────────────────────────── */
const NAV = [
  { label: "Suites",            target: "philosophy" },
  { label: "Amenities",         target: "amenities"  },
  { label: "For Professionals", target: "difference" },
  { label: "Gallery",           target: "gallery"    },
  { label: "Find a Pro",        target: "findpro"    },
  { label: "About",             target: "footer"     },
];

/* ─── difference cards ──────────────────────────────────── */
const DIFF = [
  {
    icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 21V9a6 6 0 0 1 12 0v12" /><path d="M10 21v-5a2 2 0 0 1 4 0v5" /></svg>,
    title: "Design-led suites",
    body:  "The most beautiful private suites in the category — finished to feel like a destination, not a cubicle.",
  },
  {
    icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21C12 21 7 15 12 5C17 15 12 21 12 21Z"/><path d="M11 18C6 17 4 12 5 7C7 10 11 14 11 18Z"/><path d="M13 18C18 17 20 12 19 7C17 10 13 14 13 18Z"/></svg>,
    title: "Wellness under one roof",
    body:  "Hair, skin, nails, brows, massage and more — a full sensory experience for every client.",
  },
  {
    icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="7" r="4" /><path d="M6 21c0-4 3-7 6-7s6 3 6 7" /></svg>,
    title: "Independence, supported",
    body:  "Own your business and your hours. Lean on LUXYN for the front desk, upkeep, and marketing.",
  },
  {
    icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v2" /><path d="M6 16c0-6 2-8 6-8s6 2 6 8" /><path d="M4 16h16" /><path d="M10 16a2 2 0 0 0 4 0" /></svg>,
    title: "On-site care",
    body:  "A real person on site every day to welcome your clients and keep your space effortless.",
  },
];

/* ─── amenity cards ─────────────────────────────────────── */
const AMEN = [
  { icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16"/><path d="M10 21V7h4v14"/><path d="M5 21h14"/></svg>,  title: "24/7 SECURE ACCESS",  body: "Your business, your hours. Complete autonomy with a state-of-the-art security system for peace of mind." },
  { icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8l-8 5h16z"/><path d="M12 8V6a2 2 0 0 1 2-2"/></svg>, title: "ON-SITE LAUNDRY",    body: "Complimentary high-capacity laundry facilities designed to keep your workflow seamless and stress-free." },
  { icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 6h8v7a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3V6z"/><path d="M14 8h2a2 2 0 0 1 0 4h-2"/><path d="M4 20h12"/></svg>, title: "CLIENT LOUNGE",      body: "A sophisticated waiting area with specialty coffee and refreshments to delight your guests from arrival." },
  { icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="16" width="16" height="4" rx="1" /><path d="M7 16v-4" /><path d="M17 16v-4" /><path d="M9 8a3 3 0 0 1 6 0" /><path d="M12 12v.01" /></svg>, title: "HIGH-SPEED FIBER",    body: "Dedicated enterprise-grade Wi-Fi for seamless booking, processing, and social media management." },
  { icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v9" /><path d="M8 11h8v4H8z" /><path d="M8 15v5" /><path d="M12 15v5" /><path d="M16 15v5" /></svg>, title: "DAILY COMMON CARE",  body: "Professional cleaning of all shared areas ensures the facility always reflects your high standards." },
  { icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3l6 6-12 12H3v-6L15 3z" /><path d="M14 6l4 4" /><path d="M9 9l-6 6" /></svg>, title: "CUSTOM BRANDING",    body: "Paint and decorate your suite to match your brand's unique identity and professional aesthetic." },
];

/* ─── shared button styles ──────────────────────────────── */
const btnGold = "h-[40px] px-6 rounded-full font-bold text-[13px] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_26px_rgba(194,160,107,.45)] cursor-pointer";
const btnOutline = "h-[40px] px-6 rounded-full font-bold text-[13px] transition-all duration-300 hover:-translate-y-0.5 cursor-pointer";

export default function Landing() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrollY, setScrollY]   = useState(0);
  const [heroH,   setHeroH]     = useState(750);
  const heroRef  = useRef<HTMLElement>(null);
  const heroBgRef = useRef<HTMLDivElement>(null);

  /* smooth-scroll */
  const nav = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    window.scrollTo({ top: Math.max(0, el.getBoundingClientRect().top + window.scrollY - 64), behavior: "smooth" });
  };
  const menuNav = (id: string) => { setMenuOpen(false); setTimeout(() => nav(id), 50); };

  /* measure hero height once */
  useEffect(() => { if (heroRef.current) setHeroH(heroRef.current.offsetHeight); }, []);

  /* viewport zoom */
  useEffect(() => {
    const apply = () => {
      const el = document.getElementById("pageRoot");
      if (!el) return;
      el.style.zoom = String(window.innerWidth / 1440);
    };
    apply();
    window.addEventListener("resize", apply);
    return () => window.removeEventListener("resize", apply);
  }, []);

  /* scroll effects */
  useEffect(() => {
    const tick = () => {
      setScrollY(window.scrollY);
      const dh = document.documentElement.scrollHeight - window.innerHeight || 1;
      const p = document.getElementById("prog");
      if (p) p.style.width = Math.min(100, (window.scrollY / dh) * 100) + "%";
      if (heroBgRef.current && window.scrollY < heroH * 1.5)
        heroBgRef.current.style.transform = `translate3d(0,${window.scrollY * 0.28}px,0)`;
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMenuOpen(false); };
    window.addEventListener("scroll", tick, { passive: true });
    window.addEventListener("resize", tick);
    window.addEventListener("keydown", onKey);
    requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("scroll", tick);
      window.removeEventListener("resize", tick);
      window.removeEventListener("keydown", onKey);
    };
  }, [heroH]);

  const showTop = scrollY > 900;

  return (
    <div className="relative overflow-x-hidden">

      {/* ── progress bar ─────────────────────────────── */}
      <div id="prog" className="fixed top-0 left-0 h-[3px] bg-champagne z-[120]" style={{ width: 0, transition: "width .1s linear" }} />


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
              className="absolute top-3 left-[5%] right-[5%] rounded-[24px]"
              style={{
                padding: "48px 64px",
                background: "rgba(33,45,63,0.85)",
                backdropFilter: "blur(24px) saturate(1.2)",
                WebkitBackdropFilter: "blur(24px) saturate(1.2)",
                border: "1px solid rgba(255,255,255,0.4)",
                boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
              }}
            >
              <button
                onClick={() => setMenuOpen(false)}
                className="absolute top-[32px] left-[32px] flex items-center justify-center transition-opacity duration-300 opacity-80 hover:opacity-100"
              >
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="rgb(225,216,194)" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M1 1 L13 13 M13 1 L1 13"/>
                </svg>
              </button>
              <div className="grid grid-cols-2" style={{ gap: "24px 80px" }}>
                {NAV.map(({ label, target }) => (
                  <button key={label} onClick={() => menuNav(target)} className="font-display text-left transition-opacity duration-300 hover:opacity-100" style={{ fontSize: 26, color: "rgb(225,216,194)", opacity: 0.9 }}>
                    {label}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── back to top ──────────────────────────────── */}
      {/* <motion.button
        onClick={() => nav("hero")}
        className="fixed right-7 bottom-7 w-[50px] h-[50px] rounded-full flex items-center justify-center z-[115] cursor-pointer"
        style={{ background: "rgb(194,160,107)", boxShadow: "0 10px 26px rgba(0,0,0,.3)" }}
        animate={{ opacity: showTop ? 1 : 0, y: showTop ? 0 : 12, pointerEvents: showTop ? "auto" : "none" }}
        transition={{ duration: 0.4 }}
        whileHover={{ boxShadow: "0 16px 34px rgba(194,160,107,.55)" }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgb(20,35,59)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 19V5M5 12l7-7 7 7"/>
        </svg>
      </motion.button> */}

      {/* ═══════════════ PAGE ROOT (zoomed) ════════════ */}
      <div id="pageRoot" style={{ position: "relative", width: 1440, fontFamily: "'Inter',sans-serif" }}>

        {/* ── STICKY NAVBAR ──────────────────────────── */}
          <div
            className={`fixed top-0 left-0 z-[100] transition-all duration-300 flex justify-center`}
            style={{
              width: 1440,
              paddingTop: scrollY > 50 ? 20 : 32,
              paddingBottom: scrollY > 50 ? 16 : 24,
              background: scrollY > 50 ? "rgba(13, 27, 46, 0.85)" : "transparent",
              backdropFilter: scrollY > 50 ? "blur(16px)" : "none",
              WebkitBackdropFilter: scrollY > 50 ? "blur(16px)" : "none",
              borderBottom: scrollY > 50 ? "1px solid rgba(255,255,255,0.08)" : "1px solid transparent",
            }}
          >
          <div className="relative w-[1240px] flex items-center justify-between h-[50px]">
            <button
              onClick={() => setMenuOpen(true)}
              className="w-[50px] h-[50px] rounded-full flex items-center justify-center transition-[background] duration-300 hover:bg-white/20"
              style={{ background: "rgba(255,255,255,.1)", backdropFilter: "blur(9.8px)", boxShadow: "inset 0 0 0 1px rgb(255,248,248)" }}
            >
              <HamburgerSVG />
            </button>

            <div
              onClick={() => nav("hero")}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-opacity hover:opacity-80"
              style={{ width: 265, height: 76, background: "url(/assets/logo.png) 51.02% 65.351%/119.522% 416.667% no-repeat" }}
              aria-label="Back to top"
              role="button"
            />

            <button
              onClick={() => nav("cta")}
              className={btnGold}
              style={{ background: "rgb(194,160,107)", color: "rgb(20,35,59)", fontFamily: "'Inter',sans-serif" }}
            >
              LEASE A SUITE
            </button>
          </div>
        </div>

        {/* ── HERO ───────────────────────────────────── */}
        <section
          ref={heroRef}
          id="hero"
          className="relative overflow-hidden flex items-center justify-center"
          style={{ width: 1440, height: 775, background: "rgb(20,35,59)" }}
        >
          <div
            ref={heroBgRef}
            className="absolute will-change-transform"
            style={{ left: 0, top: "-8%", width: 1440, height: "124%", background: "url(/assets/hero-bg.png) center/cover no-repeat" }}
          />
          <div className="absolute inset-0" style={{ background: "linear-gradient(110deg,rgba(20,35,59,.86) 0%,rgba(20,35,59,.45) 46%,rgba(20,35,59,.08) 70%)" }} />

          {/* hero content */}
          <div className="relative z-[4]" style={{ width: 1440, height: 560 }}>
            {/* left copy */}
            <motion.div
              className="absolute flex flex-col"
              style={{ left: 182, top: 120, width: 513 }}
              initial="hidden"
              animate="show"
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.13 } } }}
            >
              <motion.h1
                variants={FU}
                className="m-0 font-display font-medium text-white"
                style={{ fontSize: 52, lineHeight: 1.0, letterSpacing: "-0.01em" }}
              >
                Space To Do Your Best Work. A Calm Home For Your Craft.
              </motion.h1>
              <motion.p
                variants={FU}
                className="font-ui font-normal text-white/40"
                style={{ marginTop: 18, width: 499, fontSize: 12, lineHeight: 1.6 }}
              >
                LUXYN Leases Private, Design-Led Suites To Independent Beauty And Wellness Professionals — Giving You The Freedom To Build, Serve, And Grow In An Elevated Space.
              </motion.p>
              <motion.div variants={FU} className="flex gap-3 items-center" style={{ marginTop: 30 }}>
                <button
                  onClick={() => nav("cta")}
                  className={btnGold}
                  style={{ background: "rgb(194,160,107)", color: "rgb(20,35,59)", fontFamily: "'Inter',sans-serif" }}
                >
                  LEASE A SUITE
                </button>
                <button
                  onClick={() => nav("findpro")}
                  className={btnOutline}
                  style={{ boxShadow: "inset 0 0 0 1px rgb(194,160,107)", color: "rgb(194,160,107)", fontFamily: "'Inter',sans-serif" }}
                >
                  BOOK A TOUR
                </button>
              </motion.div>
            </motion.div>

            {/* right: arch + quote */}
            <motion.div
              className="absolute"
              style={{ left: 787, top: 14, width: 456, height: 533 }}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <div
                className="absolute pointer-events-none z-[1]"
                style={{
                  left: 24, top: 16, width: 400, height: 500,
                  borderRadius: "500px 500px 0 0",
                  border: "5px solid rgb(194,160,107)",
                }}
              />
              <div
                className="absolute z-[2]"
                style={{
                  left: 0, top: 16, width: 400, height: 500,
                  borderRadius: "500px 500px 0 0",
                  border: "5px solid rgb(194,160,107)",
                  overflow: "hidden"
                }}
              >
                <div
                  style={{
                    position: "absolute", left: -5, top: -6, width: 400, height: 512,
                    borderRadius: "3333px 3333px 0 0",
                    background: "url(/assets/hero-arch.png) 50% 0%/125% 132.27% no-repeat"
                  }}
                />
              </div>
              <div
                className="absolute flex flex-col justify-center rounded-[24px] z-[3]"
                style={{
                  left: -32, top: 330, width: 220, height: 140, padding: "0 24px",
                  background: "rgb(255,255,255)",
                  boxShadow: "0 20px 40px rgba(10,22,40,.1)",
                }}
              >
                <span className="font-ui text-[rgb(20,35,59)]" style={{ fontSize: 15, lineHeight: 1.6 }}>
                  &quot;A space that honors<br/>the artistry of my<br/>work.&quot;
                </span>
              </div>
            </motion.div>
          </div>

          {/* champagne marquee */}
          <div
            className="absolute left-0 bottom-0 overflow-hidden flex items-center z-[5]"
            style={{ width: 1440, height: 39, background: "rgb(194,160,107)" }}
          >
            <div className="marq">
              {[0, 1].map(i => (
                <span key={i} className="font-ui text-white pr-[.29em]" style={{ fontSize: 16, letterSpacing: ".29em" }}>
                  SALON · WELLNESS · SPA · Private Suites · Premium Amenities · Flexible Leasing · Client-Friendly Location ·{" "}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── PHILOSOPHY ─────────────────────────────── */}
        <section id="philosophy" className="relative overflow-hidden" style={{ width: 1440, minHeight: 775, background: "rgb(243,236,220)" }}>
          <div className="absolute top-1/2 -translate-y-1/2" style={{ left: 144, width: 466 }}>
            <motion.span initial="hidden" whileInView="show" viewport={vp} variants={FU}
              className="block font-ui font-semibold text-[rgb(198,155,95)]"
              style={{ fontSize: 12, letterSpacing: 1.8 }}
            >
              OUR PHILOSOPHY
            </motion.span>
            <motion.h2 initial="hidden" whileInView="show" viewport={vp} variants={FU} {...delay(0.08)}
              className="font-editorial font-normal text-[rgb(2,36,72)]"
              style={{ margin: "26px 0 0", width: 466, fontSize: 34, lineHeight: 1.1 }}
            >
              A refined space for professionals who care deeply about their work.
            </motion.h2>
            <motion.p initial="hidden" whileInView="show" viewport={vp} variants={FU} {...delay(0.16)}
              className="font-ui font-normal text-[rgb(67,71,78)]"
              style={{ margin: "34px 0 0", width: 466, fontSize: 16, lineHeight: 1.6 }}
            >
              LUXYN was founded on the belief that environment dictates energy. We provide more than just four walls; we provide a curated atmosphere designed to enhance the client experience and support your professional growth with architectural elegance.
            </motion.p>
            <motion.div initial="hidden" whileInView="show" viewport={vp} variants={FU} {...delay(0.24)}
              className="flex flex-col gap-2"
              style={{ marginTop: 34, borderTop: "1px solid rgba(196,198,207,.5)", borderBottom: "1px solid rgba(196,198,207,.5)", padding: "16px 0" }}
            >
              <span className="font-ui font-semibold italic text-[rgb(2,36,72)]" style={{ fontSize: 16, lineHeight: 1.6 }}>
                &quot;Luxyn has completely transformed how my clients perceive my brand.&quot;
              </span>
              <span className="font-ui font-semibold text-[rgb(67,71,78)]" style={{ fontSize: 12, letterSpacing: 1.8 }}>
                — SARAH J., MASTER COLORIST
              </span>
            </motion.div>
          </div>

          {/* arch image 1 */}
          <motion.div
            initial="hidden" whileInView="show" viewport={vp} variants={FR}
            className="absolute group overflow-hidden"
            style={{ left: 633, top: 203, width: 323, height: 450, borderRadius: "500px 500px 0 0" }}
          >
            <div
              className="absolute inset-0 transition-[transform] duration-[900ms] group-hover:-translate-y-[10px] group-hover:scale-[1.06]"
              style={{ background: "url(/assets/about-2.png) 50% 50%/139.319% 100% no-repeat", borderRadius: "500px 500px 0 0" }}
            />
          </motion.div>

          {/* arch image 2 */}
          <motion.div
            initial="hidden" whileInView="show" viewport={vp} variants={FR} {...delay(0.14)}
            className="absolute group overflow-hidden"
            style={{ left: 972, top: 123, width: 323, height: 450, borderRadius: "500px 500px 0 0" }}
          >
            <div
              className="absolute inset-0 transition-[transform] duration-[900ms] group-hover:-translate-y-[10px] group-hover:scale-[1.06]"
              style={{ background: "url(/assets/about-1.png) 50% 50%/139.319% 100% no-repeat", borderRadius: "500px 500px 0 0" }}
            />
          </motion.div>
        </section>

        {/* ── DIVERSE ARTISTRY ───────────────────────── */}
        <section id="gallery" className="relative overflow-hidden" style={{ width: 1440, minHeight: 775, background: "rgb(251,248,241)" }}>
          <div className="absolute flex flex-col items-center" style={{ left: 299, top: 70, width: 843 }}>
            <motion.span initial="hidden" whileInView="show" viewport={vp} variants={FU}
              className="font-ui font-semibold text-[rgb(198,155,95)]" style={{ fontSize: 12, letterSpacing: 1.8 }}
            >
              DIVERSE ARTISTRY
            </motion.span>
            <motion.h2 initial="hidden" whileInView="show" viewport={vp} variants={FU} {...delay(0.08)}
              className="font-display font-semibold text-[rgb(33,58,92)] text-center"
              style={{ margin: "10px 0 0", width: 843, fontSize: 46, lineHeight: 1.0 }}
            >
              A space for independent beauty &amp; wellness professionals.
            </motion.h2>
          </div>

          <div className="absolute flex gap-4 items-start" style={{ left: 106, top: 227, width: 1229, height: 483 }}>
            {/* tall left */}
            <motion.div initial="hidden" whileInView="show" viewport={vp} variants={FS}
              className="gallery-card relative overflow-hidden flex-shrink-0 rounded-[32px]"
              style={{ width: 228, height: 483, background: "#fff" }}
            >
              <div className="absolute transition-transform duration-[800ms] hover:scale-[1.07]" style={{ left: -5, top: 0, width: 252, height: 488, background: "url(/assets/gallery-1.png) 41.808% 8.108%/634.711% 218.337% no-repeat" }} />
              <div className="card-overlay absolute inset-0 z-[3] flex items-end justify-center rounded-[32px]" style={{ padding: "0 14px 32px", background: "linear-gradient(to top,rgba(28,18,8,.85) 0%,rgba(28,18,8,.25) 100%)" }}>
                <span className="card-label font-display font-medium text-white text-center" style={{ fontSize: 22, letterSpacing: 4 }}>Brow & Lash Artists</span>
              </div>
            </motion.div>

            <div className="flex flex-col gap-4" style={{ width: 985 }}>
              <div className="flex gap-4 items-center">
                {[
                  { w:454, h:231, bg:"url(/assets/gallery-2.png) 7.79% 7.154%/355.556% 268.766% no-repeat", iL:-17, iT:-96, iW:471, iH:416, label:"Hair Stylists", d:0.08 },
                  { w:515, h:231, bg:"url(/assets/gallery-2.png) 49.597% 81.944%/366.587% 272.34% no-repeat",  iL:0,   iT:-244,iW:567, iH:508, label:"Nail Artists",    d:0.16 },
                ].map(({ w, h, bg, iL, iT, iW, iH, label, d }) => (
                  <motion.div key={label} initial="hidden" whileInView="show" viewport={vp} variants={FS} {...delay(d)}
                    className="gallery-card relative overflow-hidden rounded-[32px]" style={{ width: w, height: h }}
                  >
                    <div className="absolute transition-transform duration-[800ms] hover:scale-[1.07]" style={{ left: iL, top: iT, width: iW, height: iH, background: bg }} />
                    <div className="card-overlay absolute inset-0 z-[3] flex items-end justify-center rounded-[32px]" style={{ padding: "0 14px 32px", background: "linear-gradient(to top,rgba(28,18,8,.85) 0%,rgba(28,18,8,.25) 100%)" }}>
                      <span className="card-label font-display font-medium text-white text-center" style={{ fontSize: 22, letterSpacing: 4 }}>{label}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="flex gap-4 items-end">
                {[
                  { w:406, h:230, bg:"url(/assets/gallery-1.png) 16.764% 94.851%/447.813% 358.042% no-repeat", iL:0,   iT:-89,  iW:406, iH:339, label:"Massage Therapists",  d:0.12 },
                  { w:233, h:227, bg:"url(/assets/gallery-2.png) 90% 81.364%/378.325% 281.319% no-repeat",      iL:-10, iT:0,    iW:253, iH:227, label:"Wellness Practitioners",         d:0.20 },
                  { w:314, h:231, bg:"url(/assets/gallery-2.png) 88.462% 8.602%/391.837% 274.531% no-repeat",   iL:-16, iT:-142, iW:392, iH:373, label:"Estheticians",   d:0.28 },
                ].map(({ w, h, bg, iL, iT, iW, iH, label, d }) => (
                  <motion.div key={label} initial="hidden" whileInView="show" viewport={vp} variants={FS} {...delay(d)}
                    className="gallery-card relative overflow-hidden rounded-[32px]" style={{ width: w, height: h }}
                  >
                    <div className="absolute transition-transform duration-[800ms] hover:scale-[1.07]" style={{ left: iL, top: iT, width: iW, height: iH, background: bg }} />
                    <div className="card-overlay absolute inset-0 z-[3] flex items-end justify-center rounded-[32px]" style={{ padding: "0 14px 32px", background: "linear-gradient(to top,rgba(28,18,8,.85) 0%,rgba(28,18,8,.25) 100%)" }}>
                      <span className="card-label font-display font-medium text-white text-center" style={{ fontSize: 22, letterSpacing: 4 }}>{label}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── THE LUXYN DIFFERENCE ───────────────────── */}
        <section id="difference" className="relative overflow-hidden" style={{ width: 1440, minHeight: 555, background: "rgb(244,238,225)" }}>
          <div className="absolute flex flex-col items-center gap-3" style={{ left: 270, top: 61, width: 900 }}>
            <motion.span initial="hidden" whileInView="show" viewport={vp} variants={FU}
              className="font-accent font-semibold text-[rgb(184,153,104)]" style={{ fontSize: 13, letterSpacing: 4 }}
            >
              THE LUXYN DIFFERENCE
            </motion.span>
            <motion.span initial="hidden" whileInView="show" viewport={vp} variants={FU} {...delay(0.08)}
              className="font-display font-semibold text-[rgb(33,58,92)]" style={{ fontSize: 46, lineHeight: 1.0 }}
            >
              A sanctuary, not a rented room
            </motion.span>
          </div>
          <div className="absolute flex gap-6 items-start" style={{ left: 120, top: 191, width: 1200 }}>
            {DIFF.map(({ icon, title, body }, i) => (
              <motion.div
                key={title}
                initial="hidden" whileInView="show" viewport={vp} variants={FU} {...delay(i * 0.09)}
                className="flex flex-col rounded-[8px] transition-[transform,box-shadow] duration-[400ms] cursor-default"
                style={{ width: 282, height: 300, background: "rgb(252,250,244)", boxShadow: "inset 0 0 0 1px rgb(225,216,194)", padding: "32px 28px" }}
                whileHover={{ y: -8, boxShadow: "inset 0 0 0 1px rgb(225,216,194), 0 22px 44px rgba(33,58,92,.08)" }}
              >
                <span className="text-[rgb(33,58,92)]" style={{ marginBottom: 20 }}>{icon}</span>
                <span className="font-display font-bold text-[rgb(33,58,92)]" style={{ fontSize: 24, lineHeight: 1.2, marginBottom: 12 }}>{title}</span>
                <span className="font-ui font-normal opacity-80 text-[rgb(22,38,60)]" style={{ fontSize: 14.5, lineHeight: 1.6 }}>{body}</span>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── BANNER ─────────────────────────────────── */}
        <section id="banner" className="relative overflow-hidden flex items-center justify-center" style={{ width: 1440, height: 550, background: "rgb(244,238,225)" }}>
          <div className="absolute" style={{ left: 0, top: "-15%", width: 1440, height: "130%", background: "url(/assets/cta-bg.png) center/cover no-repeat" }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(0deg,rgb(20,35,59) 0%,rgba(45,79,127,.5) 50%,rgba(70,122,194,0) 100%)" }} />
          <div className="relative z-[2] flex flex-col items-center gap-6 text-center" style={{ maxWidth: 760, padding: "0 40px" }}>
            <motion.h2 initial="hidden" whileInView="show" viewport={vp} variants={FU}
              className="m-0 font-display font-bold text-white" style={{ fontSize: 72, lineHeight: 1.0 }}
            >
              Your suite. Your schedule. Your brand.
            </motion.h2>
            <motion.p initial="hidden" whileInView="show" viewport={vp} variants={FU} {...delay(0.14)}
              className="m-0 font-ui font-medium text-[rgb(255,220,164)]" style={{ maxWidth: 610, fontSize: 16, lineHeight: 1.5 }}
            >
              Create a space that feels like your own, serve clients with privacy, and grow your business inside a calm, elevated environment.
            </motion.p>
          </div>
        </section>

        {/* ── AMENITIES ──────────────────────────────── */}
        <section id="amenities" className="relative flex flex-col items-center justify-center" style={{ width: 1440, height: 835, background: "rgb(20,35,59)", gap: 48 }}>
          <div className="absolute opacity-50 pointer-events-none" style={{ left: "50%", top: "50%", transform: "translate(-50%,-50%)", width: 1550, height: "120%", background: "url(/assets/amenities-illustration.png) center/cover no-repeat" }} />
          <div className="relative z-[2] flex flex-col items-center gap-4">
            <motion.span initial="hidden" whileInView="show" viewport={vp} variants={FU}
              className="font-accent font-semibold text-[rgb(184,153,104)]" style={{ fontSize: 13, letterSpacing: 4 }}
            >
              AMENITIES
            </motion.span>
            <motion.span initial="hidden" whileInView="show" viewport={vp} variants={FU} {...delay(0.08)}
              className="font-display font-bold text-white text-center" style={{ width: 448, fontSize: 44, lineHeight: 1.0 }}
            >
              Designed around comfort, care, and craft.
            </motion.span>
          </div>
          <div className="relative z-[2] grid" style={{ width: 1152, gridTemplateColumns: "1fr 1fr 1fr", gap: 24 }}>
            {AMEN.map(({ icon, title, body }, i) => (
              <motion.div
                key={title}
                initial="hidden" whileInView="show" viewport={vp} variants={FU} {...delay(i * 0.08)}
                className="flex flex-col rounded-[24px] bg-white cursor-default"
                style={{ padding: "32px 36px", boxShadow: "inset 0 0 0 1px rgba(196,198,207,.3)", minHeight: 250 }}
                whileHover={{ y: -6, boxShadow: "0 24px 48px rgba(20,35,59,.16)" }}
              >
                <span className="text-[rgb(198,155,95)]" style={{ marginBottom: 24 }}>{icon}</span>
                <span className="font-ui font-semibold text-[rgb(33,58,92)] uppercase" style={{ fontSize: 15, letterSpacing: 1.5, marginBottom: 16 }}>{title}</span>
                <span className="font-ui font-normal text-[rgb(67,71,78)]" style={{ fontSize: 16, lineHeight: 1.6 }}>{body}</span>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── FIND A PRO ─────────────────────────────── */}
        <section id="findpro" className="relative overflow-hidden flex items-center" style={{ width: 1440, minHeight: 676, background: "rgb(244,238,225)" }}>
          <div className="absolute left-0 top-0 overflow-hidden" style={{ width: 700, height: 596, zIndex: 1 }}>
            <motion.div
              initial="hidden" whileInView="show" viewport={vp} variants={FL}
              className="absolute overflow-hidden"
              style={{ left: 144, top: 80, width: 516, height: 516, borderRadius: "500px 500px 0 0", background: "url(/assets/findpro-a.png) center/cover no-repeat", boxShadow: "0 28px 60px rgba(20,35,59,.18)" }}
              whileHover={{ y: -10, boxShadow: "0 40px 80px rgba(20,35,59,.28)" }}
            />
            <motion.div
              initial="hidden" whileInView="show" viewport={vp} variants={FL} {...delay(0.12)}
              className="absolute floaty"
              style={{ left: 155, top: 30, width: 490, height: 590, background: "url(/assets/findpro-stylist.png) bottom center/contain no-repeat", filter: "drop-shadow(0 24px 36px rgba(20,35,59,.32))" }}
              whileHover={{ y: -8, scale: 1.02 }}
            />
          </div>
          <div className="absolute flex flex-col items-start" style={{ left: 780, top: 210, width: 516, gap: 28, zIndex: 2 }}>
            <motion.span initial="hidden" whileInView="show" viewport={vp} variants={FU}
              className="font-ui font-semibold text-[rgb(74,98,106)]" style={{ fontSize: 14, letterSpacing: 1.8 }}
            >
              FOR CLIENTS
            </motion.span>
            <motion.h2 initial="hidden" whileInView="show" viewport={vp} variants={FU} {...delay(0.08)}
              className="m-0 font-display font-bold text-[rgb(2,36,72)]" style={{ width: 516, fontSize: 48, lineHeight: 1.0 }}
            >
              Looking for a professional?
            </motion.h2>
            <motion.p initial="hidden" whileInView="show" viewport={vp} variants={FU} {...delay(0.16)}
              className="m-0 font-ui font-normal text-[rgb(67,71,78)]" style={{ width: 516, fontSize: 19, lineHeight: 1.6 }}
            >
              Explore independent beauty and wellness professionals working from LUXYN.
            </motion.p>
            <motion.button
              initial="hidden" whileInView="show" viewport={vp} variants={FU} {...delay(0.24)}
              onClick={() => nav("gallery")}
              className="h-[52px] px-10 rounded-full font-ui font-bold text-white cursor-pointer transition-[transform,box-shadow,background] duration-300 hover:-translate-y-0.5"
              style={{ fontSize: 15, letterSpacing: .5, background: "rgb(20,35,59)" }}
              whileHover={{ boxShadow: "0 14px 30px rgba(20,35,59,.32)" }}
            >
              FIND A PRO
            </motion.button>
          </div>
        </section>

        {/* ── READY CTA ──────────────────────────────── */}
        <section id="cta" className="relative overflow-hidden flex items-center justify-center" style={{ width: 1440, height: 340, background: "rgb(26,45,76)" }}>
          <div className="absolute inset-0 overflow-hidden">
            {[
              { s: 500, stroke: 5, opacity: 0.15 },
              { s: 650, stroke: 4, opacity: 0.10 },
              { s: 800, stroke: 2, opacity: 0.07 }
            ].map(({ s, stroke, opacity }, i) => (
              <div key={i} className="absolute rounded-full" style={{ left: "50%", top: "100%", width: s, height: s, marginLeft: -s / 2, marginTop: -s / 2, border: `${stroke}px solid rgba(225,216,194,${opacity})` }} />
            ))}
          </div>
          <div className="relative z-[2] flex flex-col items-center gap-8 text-center mt-10" style={{ maxWidth: 1176, padding: "0 40px" }}>
            <div className="flex flex-col items-center gap-5">
              <motion.span initial="hidden" whileInView="show" viewport={vp} variants={FU}
                className="font-display font-normal text-white" style={{ fontSize: 44, lineHeight: 1.05 }}
              >
                Ready to make LUXYN your new professional home?
              </motion.span>
              <motion.span initial="hidden" whileInView="show" viewport={vp} variants={FU} {...delay(0.08)}
                className="font-ui font-normal" style={{ fontSize: 16, color: "rgba(255,255,255,0.85)" }}
              >
                Book a private tour and explore available suites designed for your next chapter.
              </motion.span>
            </div>
            <motion.div initial="hidden" whileInView="show" viewport={vp} variants={FU} {...delay(0.16)} className="flex gap-5">
              <button onClick={() => nav("findpro")} className={`${btnGold} h-[44px] px-8 text-[12px] tracking-wide`} style={{ background: "rgb(194,160,107)", color: "rgb(20,35,59)", fontFamily: "'Inter',sans-serif" }}>LEASE A SUITE</button>
              <button onClick={() => nav("gallery")}  className={`${btnOutline} h-[44px] px-8 text-[12px] tracking-wide`} style={{ boxShadow: "inset 0 0 0 1px rgb(194,160,107)", color: "rgb(194,160,107)", fontFamily: "'Inter',sans-serif" }}>BOOK A TOUR</button>
            </motion.div>
          </div>
        </section>

        {/* ── FOOTER ─────────────────────────────────── */}
        <section id="footer" className="relative overflow-hidden" style={{ width: 1440, minHeight: 624, background: "linear-gradient(180deg,rgb(26,45,76) 49.52%,rgb(62,120,197) 100%)" }}>
          <div className="absolute flex flex-col items-center" style={{ left: 429, top: 35, width: 583, gap: 26 }}>
            <button onClick={() => nav("hero")} className="cursor-pointer transition-opacity hover:opacity-80" style={{ width: 265, height: 76, background: "url(/assets/logo.png) 51.02% 65.351%/119.522% 416.667% no-repeat" }} aria-label="Back to top" />
            <div className="flex items-center" style={{ gap: 48 }}>
              {[
                { label: "Suites",            id: "gallery"    },
                { label: "For Professionals", id: "difference" },
                { label: "Find a Pro",        id: "findpro"    },
                { label: "Amenities",         id: "amenities"  },
                { label: "Contact",           id: "cta"        },
              ].map(({ label, id }) => (
                <button key={label} onClick={() => nav(id)}
                  className="font-accent font-light text-white cursor-pointer whitespace-nowrap transition-colors duration-300 hover:text-champagne underline underline-offset-4 decoration-[1px] decoration-white/50 hover:decoration-champagne"
                  style={{ fontSize: 18 }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="absolute left-0 w-full h-px" style={{ top: 223, background: "rgb(138,146,157)" }} />
          <motion.div
            initial="hidden" whileInView="show" viewport={vp} variants={FI}
            className="absolute"
            style={{ left: 0, top: 268, width: 1440, height: 301, background: "url(/assets/logo.png) 50% 60.271%/146.25% 699.668% no-repeat" }}
          />
          <div className="absolute flex justify-between items-start" style={{ left: 80, top: 569, width: 1280 }}>
            <div className="flex gap-8">
              {["Privacy Policy", "Terms of Service", "Cookies Settings"].map(l => (
                <button key={l} className="font-ui font-light text-white/85 transition-colors duration-300 hover:text-white cursor-pointer underline underline-offset-4 decoration-[1px] decoration-white/30 hover:decoration-white" style={{ fontSize: 15.5 }}>{l}</button>
              ))}
            </div>
            <span className="font-ui text-white" style={{ fontSize: 16 }}>© 2026 LUXYN. All rights reserved.</span>
          </div>
        </section>

      </div>{/* /pageRoot */}
    </div>
  );
}

function HamburgerSVG() {
  return (
    <svg width="22" height="16" viewBox="0 0 22 16" fill="rgb(255,255,255)">
      <path d="M1.571 0H9.429a1.6 1.6 0 0 1 0 3.2H1.571a1.6 1.6 0 0 1 0-3.2ZM12.571 12.8h7.858a1.6 1.6 0 0 1 0 3.2h-7.858a1.6 1.6 0 0 1 0-3.2ZM1.571 6.4h18.858a1.6 1.6 0 0 1 0 3.2H1.571a1.6 1.6 0 0 1 0-3.2Z"/>
    </svg>
  );
}
