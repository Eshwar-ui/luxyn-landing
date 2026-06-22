/**
 * Single source of truth for site-wide constants.
 *
 * ⚠️ BEFORE LAUNCH — replace every value marked `PLACEHOLDER` with the real
 * thing. Everything else (SEO metadata, sitemap, footer, structured data,
 * contact form) reads from here, so you only change it once.
 */

export const site = {
  name: "LUXYN",
  /** Production origin — used for canonical URLs, sitemap, and Open Graph. */
  url: "https://luxynstudios.com",
  title: "LUXYN — Space to do your best work",
  description:
    "LUXYN leases private, design-led suites to independent beauty and wellness professionals — the freedom to build, serve, and grow in an elevated space.",
  /** Short, punchy strapline — used as the site's slogan in structured data. */
  tagline: "Private, design-led suites for beauty & wellness professionals.",
  /** OG / Twitter share image (lives in /public/assets). 1536×1024 source. */
  ogImage: "/assets/cta-bg.png",
  /** Square brand mark (1200×1200) — used for the manifest, Apple touch icon,
   *  and the `logo` field in Organization / LocalBusiness structured data. */
  logo: "/assets/logo.png",

  // ════════════════════════════════════════════════════════════════════
  //  ⚠️  FILL BEFORE LAUNCH — every value below is fake placeholder data.
  //  Replace with the real LUXYN business details. These feed the footer,
  //  the contact section, AND the SEO/JSON-LD structured data, so getting
  //  them right matters for both customers and search engines.
  //  Checklist:  [ ] email   [x] phone + phoneHref   [x] full address
  //              [ ] social handles   [x] formEndpoints (see below)
  // ════════════════════════════════════════════════════════════════════

  /** Contact details — surface in the footer + JSON-LD structured data. */
  contact: {
    email: "luxynsales@gmail.com", // primary sales/lead inbox
    phone: "+1 737-287-7396", // display format
    phoneHref: "+17372877396", // same number, digits + leading "+" only, for tel:
    address: {
      street: "14300 Ronald Reagan Blvd, Building 8",
      locality: "Leander", // city
      region: "TX", // state / region
      postalCode: "78641",
      country: "US", // ISO country code
    },
  },

  /** Social profiles — empty strings are hidden in the footer. */
  socials: {
    instagram: "https://www.instagram.com/luxynstudios/",
    facebook: "https://facebook.com/luxynstudios",
  },

  /**
   * Contact-form submission endpoints — one per enquiry type. This is a static
   * export, so the form POSTs to a third-party service (Formspree). Each variant
   * targets its own form so leads land in the right inbox. While a value is left
   * as the placeholder, that variant short-circuits to a friendly "not
   * configured" message instead of silently dropping leads.
   */
  formEndpoints: {
    lease: "https://formspree.io/f/xlgkqeqp",
    tour: "https://formspree.io/f/xjgdnvnw",
  },

  /** Extra signals for richer search results (Google LocalBusiness rich data). */
  business: {
    /** Price band shown in LocalBusiness rich results: "$" – "$$$$". */
    priceRange: "$$", // TODO PLACEHOLDER — confirm band
    /** Map coordinates for the LocalBusiness "geo" — improves local/Maps SEO.
     *  Leave both "" until known; empty values are omitted from structured data. */
    geo: {
      latitude: "", // TODO PLACEHOLDER — e.g. "34.0696"
      longitude: "", // TODO PLACEHOLDER — e.g. "-118.4053"
    },
    /** Opening hours in schema.org format. Leave [] to omit.
     *  Example: ["Mo-Fr 09:00-19:00", "Sa 10:00-17:00"] */
    openingHours: [] as string[], // TODO PLACEHOLDER
  },

  /** Search-engine ownership verification tokens. Paste the value from the
   *  provider's TXT/meta verification step; empty strings are omitted. */
  verification: {
    google: "", // TODO PLACEHOLDER — Google Search Console meta token
    bing: "", // TODO PLACEHOLDER — Bing Webmaster Tools meta token
  },
} as const;

/** True once a real form endpoint has been configured for the given variant. */
export const isFormConfigured = (variant: keyof typeof site.formEndpoints): boolean =>
  !site.formEndpoints[variant].includes("your-form-id");

export const fullAddress = [
  site.contact.address.street,
  `${site.contact.address.locality}, ${site.contact.address.region} ${site.contact.address.postalCode}`,
].join(", ");
