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
  /** OG / Twitter share image (lives in /public/assets). */
  ogImage: "/assets/cta-bg.png",

  /** Contact details — surface in the footer + JSON-LD structured data. */
  contact: {
    email: "hello@luxynstudios.com", // PLACEHOLDER — confirm the real inbox
    phone: "+1 (555) 012-3456", // PLACEHOLDER
    phoneHref: "+15550123456", // PLACEHOLDER — digits only, for tel:
    address: {
      street: "100 Atelier Way", // PLACEHOLDER
      locality: "Beverly Hills", // PLACEHOLDER
      region: "CA", // PLACEHOLDER
      postalCode: "90210", // PLACEHOLDER
      country: "US",
    },
  },

  /** Social profiles — empty strings are hidden in the footer. */
  socials: {
    instagram: "https://instagram.com/luxynstudios", // PLACEHOLDER — confirm handle
    facebook: "", // PLACEHOLDER
    linkedin: "https://linkedin.com/company/luxynstudios", // PLACEHOLDER — confirm handle
  },

  /**
   * Contact-form submission endpoint. This is a static export, so the form
   * POSTs to a third-party service. Create a free form at https://formspree.io
   * (or similar) and paste its endpoint here. While left as the placeholder,
   * the form short-circuits to a friendly "not configured" message instead of
   * silently failing.
   */
  formEndpoint: "https://formspree.io/f/your-form-id", // PLACEHOLDER
} as const;

/** True once a real form endpoint has been configured. */
export const isFormConfigured = !site.formEndpoint.includes("your-form-id");

export const fullAddress = [
  site.contact.address.street,
  `${site.contact.address.locality}, ${site.contact.address.region} ${site.contact.address.postalCode}`,
].join(", ");
