"use client";

import { useEffect, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import dynamic from "next/dynamic";
import Reveal from "../_lib/reveal";
import type { ContactVariant } from "./ContactForm";
import { site, fullAddress } from "../_lib/site";
import { SCROLL_TARGET_KEY, scrollToId } from "../_lib/nav";

/* The interactive islands of the home page. Landing itself is a server
 * component, so only these few pieces hydrate — far less JS to parse and run
 * on phones than hydrating the whole single-scroll page. */

/* The form (+ its Turnstile/validation code) sits at the very bottom of the
   page, so its chunk is fetched after hydration rather than on the critical
   path. The placeholder reserves roughly the form's height. */
const ContactForm = dynamic(() => import("./ContactForm"), {
  ssr: false,
  loading: () => <div aria-hidden="true" style={{ minHeight: 560 }} />,
});

/** Window event a CTA fires to pre-select the contact form's enquiry type. */
const CONTACT_VARIANT_EVENT = "luxyn:contact-variant";

/** Button that smooth-scrolls to an in-page section, optionally pre-setting the
 *  contact form to the right enquiry type on the way. */
export function SectionButton({
  to, variant, className, style, children,
}: {
  to: string;
  variant?: ContactVariant;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const onClick = () => {
    if (variant) window.dispatchEvent(new CustomEvent<ContactVariant>(CONTACT_VARIANT_EVENT, { detail: variant }));
    scrollToId(to);
  };
  return (
    <button type="button" onClick={onClick} className={className} style={style}>
      {children}
    </button>
  );
}

/** Page-level scroll behaviour: the cross-page section hand-off, plus the
 *  desktop-only progress bar and hero parallax. */
export function LandingEffects() {
  /* cross-page hand-off: when a header menu link is clicked from another page
     (a section SEO page or a legal page), it stores the target section and sends
     the visitor here. Scroll to it once, then clear the flag. */
  useEffect(() => {
    let id: string | null = null;
    try {
      id = sessionStorage.getItem(SCROLL_TARGET_KEY);
      if (id) sessionStorage.removeItem(SCROLL_TARGET_KEY);
    } catch { /* storage blocked — nothing to scroll to */ }
    if (!id) return;
    const target = id;
    const t = window.setTimeout(() => scrollToId(target), 90);
    return () => window.clearTimeout(t);
  }, []);

  /* scroll effects — progress bar + hero parallax. Desktop + motion-allowed only:
     on phones there is no scroll listener at all (the bar is hidden in CSS).
     • The scroll-height is cached and only remeasured on resize, so the hot
       scroll path never forces a synchronous layout.
     • The bar scales on the compositor (transform) instead of animating width. */
  useEffect(() => {
    if (!window.matchMedia("(min-width: 1024px) and (prefers-reduced-motion: no-preference)").matches) return;
    const bar = document.getElementById("prog");
    const heroBg = document.getElementById("hero-bg");
    const heroH = document.getElementById("hero")?.offsetHeight ?? 750;

    let dh = document.documentElement.scrollHeight - window.innerHeight || 1;
    const tick = () => {
      const y = window.scrollY;
      if (bar) bar.style.transform = `scaleX(${Math.min(1, y / dh)})`;
      if (heroBg && y < heroH * 1.5) heroBg.style.transform = `translate3d(0,${y * 0.28}px,0)`;
    };
    const onResize = () => { dh = document.documentElement.scrollHeight - window.innerHeight || 1; tick(); };

    window.addEventListener("scroll", tick, { passive: true });
    window.addEventListener("resize", onResize);
    requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("scroll", tick);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return null;
}

/** The contact section — intro copy + the lease/tour switcher + form. */
export function ContactSection() {
  const [contactVariant, setContactVariant] = useState<ContactVariant>("lease");

  useEffect(() => {
    const onVariant = (e: Event) => setContactVariant((e as CustomEvent<ContactVariant>).detail);
    window.addEventListener(CONTACT_VARIANT_EVENT, onVariant);
    return () => window.removeEventListener(CONTACT_VARIANT_EVENT, onVariant);
  }, []);

  return (
    <section id="contact" className="cv-auto relative overflow-hidden w-full py-12 lg:py-20 flex justify-center" style={{ background: "rgb(243,236,220)" }}>
      <div className="w-full max-w-[1151px] px-6 lg:px-12 xl:px-0 flex flex-col lg:flex-row items-start justify-center gap-12 lg:gap-16">
        {/* intro + details */}
        <Reveal
          variant="left"
          className="flex flex-col w-full lg:w-[45%] xl:w-[488px] shrink-0"
        >
          <span className="block font-ui font-semibold text-[rgb(128,96,46)]" style={{ fontSize: 12, letterSpacing: 1.8 }}>
            GET IN TOUCH
          </span>
          <h2 className="m-0 font-display font-semibold text-[rgb(2,36,72)] text-3xl sm:text-4xl lg:text-[46px]" style={{ margin: "22px 0 0", lineHeight: 1.1 }}>
            {contactVariant === "tour" ? "Book a private tour." : "Pre-book your suite at LUXYN."}
          </h2>
          <p className="font-ui font-normal text-[rgb(67,71,78)]" style={{ margin: "24px 0 0", fontSize: 16, lineHeight: 1.6 }}>
            {contactVariant === "tour"
              ? "Pick a date and time that suits you. Our team will confirm your visit and walk you through the available suites in person."
              : "Pre-book a premium private salon or wellness suite in Leander, TX. Tell us about your craft and the space you envision, and our team will reach out to arrange a private tour and walk you through availability."}
          </p>
          <div className="flex flex-col gap-5 mt-9">
            <ContactLine type="email" />
            <ContactLine type="phone" />
            <ContactLine type="address" />
          </div>
        </Reveal>

        {/* form */}
        <Reveal
          variant="right" delay={0.12}
          className="w-full lg:w-[50%] xl:w-[520px] shrink-0"
        >
          {/* intent switcher — keeps the two enquiry types distinct */}
          <div
            role="tablist" aria-label="Enquiry type"
            className="mb-5 flex gap-1.5 rounded-full p-1.5"
            style={{ background: "rgba(20,35,59,0.06)" }}
          >
            {([
              { key: "lease", label: "Pre-book a suite" },
              { key: "tour",  label: "Book a tour"   },
            ] as const).map(({ key, label }) => {
              const active = contactVariant === key;
              return (
                <button
                  key={key}
                  role="tab"
                  aria-selected={active}
                  onClick={() => setContactVariant(key)}
                  className="flex-1 h-[42px] rounded-full font-ui font-bold transition-all duration-300"
                  style={{
                    fontSize: 13, letterSpacing: 0.3,
                    background: active ? "rgb(20,35,59)" : "transparent",
                    color: active ? "rgb(225,216,194)" : "rgb(67,71,78)",
                    boxShadow: active ? "0 8px 20px rgba(20,35,59,.18)" : "none",
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
          <ContactForm key={contactVariant} variant={contactVariant} />
        </Reveal>
      </div>
    </section>
  );
}

/* ─── contact detail line ─────────────────────────────────── */
const CONTACT_ICONS = {
  email: <path d="M3 5h18v14H3zM3 6l9 7 9-7" />,
  phone: <path d="M4 4h4l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 2 6a2 2 0 0 1 2-2Z" />,
  address: <><path d="M12 21s-7-6.4-7-11a7 7 0 0 1 14 0c0 4.6-7 11-7 11Z" /><circle cx="12" cy="10" r="2.5" /></>,
};

function reportPhoneClick(): void {
  window.gtag?.("event", "phone_click", { phone_number: site.contact.phoneHref });
}

function ContactLine({ type }: { type: "email" | "phone" | "address" }) {
  const data = {
    email:   { label: "EMAIL", value: site.contact.email, href: `mailto:${site.contact.email}` },
    phone:   { label: "CALL",  value: site.contact.phone, href: `tel:${site.contact.phoneHref}` },
    address: { label: "VISIT", value: fullAddress,        href: null as string | null },
  }[type];

  const value = data.href ? (
    <a href={data.href} onClick={type === "phone" ? reportPhoneClick : undefined} className="font-ui text-[rgb(2,36,72)] text-[15.5px] transition-opacity duration-300 hover:opacity-70">{data.value}</a>
  ) : (
    <span className="font-ui text-[rgb(2,36,72)] text-[15.5px]">{data.value}</span>
  );

  return (
    <div className="flex items-start gap-3.5">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgb(198,155,95)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0" aria-hidden="true">
        {CONTACT_ICONS[type]}
      </svg>
      <span className="flex flex-col gap-0.5">
        <span className="font-accent font-semibold text-[rgb(95,99,106)]" style={{ fontSize: 11, letterSpacing: 1.4 }}>{data.label}</span>
        {value}
      </span>
    </div>
  );
}
