/**
 * Shared SEO content — single source of truth for the FAQ and the dedicated
 * landing pages. Both the on-page UI and the JSON-LD structured data read from
 * here, so the rich-result markup can never drift from what the user sees
 * (a Google requirement for FAQ/▸ rich results).
 */
import type { Metadata } from "next";

/** Content freshness stamps — surfaced to humans ("Last updated") and to AI
 *  answer engines via schema dateModified, llms.txt, and facts.json. AI
 *  citations skew heavily toward recently-updated content, so bump `updated`
 *  whenever the copy meaningfully changes. Fixed strings keep the static export
 *  deterministic. */
export const contentDates = {
  published: "2026-06-18",
  updated: "2026-06-25",
} as const;

/** Convert a `YYYY-MM-DD` content stamp into a timezone-aware ISO 8601 datetime,
 *  as schema.org date fields (datePublished, dateModified) expect — a bare date
 *  triggers Google's "Invalid datetime value" / "missing a time zone" rich-result
 *  warnings. Stamps are anchored to local noon in Leander, TX (America/Chicago)
 *  with the correct Central offset for that calendar day (CDT/-05:00 in summer,
 *  CST/-06:00 in winter). Deterministic, so it's safe for the static export. */
export function isoDateTime(date: string): string {
  const noonUTC = new Date(`${date}T12:00:00Z`);
  const offset =
    new Intl.DateTimeFormat("en-US", { timeZone: "America/Chicago", timeZoneName: "longOffset" })
      .formatToParts(noonUTC)
      .find((p) => p.type === "timeZoneName")
      ?.value.replace("GMT", "") || "-06:00";
  return `${date}T12:00:00${offset}`;
}

/* ── FAQ ──────────────────────────────────────────────────────────────────
 * Targets the real long-tail questions people ask before renting a salon
 * suite. Rendered on the home page AND emitted as FAQPage JSON-LD, which is
 * exactly the format AI answer engines (ChatGPT, Perplexity, AI Overviews)
 * lift from. Keep answers self-contained — one question, one clear answer. */
export const faqs = [
  {
    q: "What is LUXYN?",
    a: "LUXYN is a private salon and wellness suite leasing studio in Leander, TX. Independent beauty and wellness professionals — stylists, estheticians, nail and lash artists, and massage therapists — lease their own lockable suite and run it as their own studio, while LUXYN handles the building, amenities, and upkeep.",
  },
  {
    q: "What is a salon suite?",
    a: "A salon suite is a private, lockable room that an independent beauty or wellness professional leases as their own studio. You get your own dedicated space to serve clients — instead of renting a chair in a shared, open salon — while LUXYN handles the building, amenities, and upkeep.",
  },
  {
    q: "Who can rent a suite at LUXYN?",
    a: "LUXYN suites are built for independent professionals across beauty and wellness — hair stylists, colorists, nail artists, estheticians, brow and lash artists, massage therapists, and wellness practitioners. If you run your own book of clients, a private suite gives you the space to grow.",
  },
  {
    q: "Where is LUXYN located?",
    a: "LUXYN is in Leander, TX at 14300 Ronald Reagan Blvd, Building 8 — convenient to the greater Austin area and easy for your clients to reach, with on-site parking.",
  },
  {
    q: "What's included in the lease?",
    a: "Your private suite comes with the things that let you focus on your craft: 24/7 secure access, high-speed fiber Wi-Fi, on-site laundry, a styled client lounge, daily cleaning of shared areas, and the freedom to brand and decorate your suite. A real person is on site to welcome your clients.",
  },
  {
    q: "Can I set my own hours and prices?",
    a: "Yes. You own your business completely — your schedule, your pricing, your brand, and your client relationships. LUXYN provides the space and support; how you run your studio is entirely yours.",
  },
  {
    q: "How much does it cost to rent a salon suite?",
    a: "Salon suite pricing depends on suite size and availability. LUXYN shares current rates and lease terms during a private tour so you can compare the available space in person and get an accurate answer for the suite that fits your business.",
  },
  {
    q: "How do I lease a suite or book a tour?",
    a: "Use the contact form on this site to either reserve a suite or book a private tour. Tell us about your craft and the space you envision, and our team will reach out to confirm availability and arrange your visit.",
  },
  {
    q: "I'm a client — how do I find a professional at LUXYN?",
    a: "LUXYN is home to a range of independent beauty and wellness professionals. Browse the artistry on our site to see the categories working from LUXYN, then connect with the professional that fits what you're looking for.",
  },
] as const;

export type TopicPage = {
  slug: string;
  title: string;
  description: string;
  kicker: string;
  h1: string;
  intro: string;
  points: { title: string; body: string }[];
  image: string;
  cta: { label: string; href: string };
};

/** Focused service pages use only claims already published on the site. */
export const servicePages: TopicPage[] = [
  {
    slug: "hair-stylist-suites",
    title: "Hair Stylist Suites for Rent in Leander, TX",
    description: "Private salon suites for hair stylists and colorists in Leander, TX, with secure access, fiber Wi-Fi, laundry, and a client lounge.",
    kicker: "FOR HAIR PROS",
    h1: "Private hair stylist suites for rent in Leander, TX",
    intro: "LUXYN gives hair stylists and colorists a private, lockable studio where they can welcome clients, shape their own experience, and run their business independently.",
    points: [
      { title: "A private client experience", body: "Work in a calm, dedicated suite rather than an open salon floor." },
      { title: "Built for independence", body: "Set your own schedule, pricing, brand, and client relationships." },
      { title: "Support around the suite", body: "Use secure access, fiber Wi-Fi, laundry, common-area care, and the client lounge." },
    ],
    image: "/assets/gallery-1.webp",
    cta: { label: "Book a private tour", href: "/book-a-tour" },
  },
  {
    slug: "esthetician-room-rental",
    title: "Esthetician Room Rental in Leander, TX",
    description: "Lease a private esthetician room in Leander, TX and build an independent skin-care studio at LUXYN.",
    kicker: "FOR ESTHETICIANS",
    h1: "A private esthetician room in Leander, TX",
    intro: "Create a focused treatment environment for your skin-care business in a private LUXYN suite, with the freedom to manage your own clients, schedule, pricing, and brand.",
    points: [
      { title: "Quiet and private", body: "Give clients a dedicated room designed around a calm, personal service experience." },
      { title: "Your studio, your way", body: "Operate independently while LUXYN handles the building, amenities, and upkeep." },
      { title: "A polished arrival", body: "Welcome clients through a styled lounge and a design-led environment." },
    ],
    image: "/assets/about-2.webp",
    cta: { label: "Lease a suite", href: "/lease-a-suite" },
  },
  {
    slug: "nail-suite-rental",
    title: "Nail Suite Rental in Leander, TX",
    description: "Explore private nail suite rental in Leander, TX for independent nail artists who want their own client experience and schedule.",
    kicker: "FOR NAIL ARTISTS",
    h1: "A private nail suite for your independent business",
    intro: "LUXYN gives nail artists a dedicated space to build a calm, premium service experience while keeping full ownership of their business and client relationships.",
    points: [
      { title: "Designed for your brand", body: "Shape a private suite around the atmosphere and identity your clients know you for." },
      { title: "Flexible independence", body: "Run your own hours, pricing, services, and client policies." },
      { title: "Premium shared amenities", body: "Give clients access to a styled lounge, secure facility, fiber Wi-Fi, and cared-for common areas." },
    ],
    image: "/assets/gallery-2.webp",
    cta: { label: "Book a private tour", href: "/book-a-tour" },
  },
  {
    slug: "lash-brow-studio",
    title: "Lash & Brow Studio Rental in Leander, TX",
    description: "Rent a private lash and brow studio in Leander, TX and create a focused, independent beauty business at LUXYN.",
    kicker: "FOR LASH & BROW PROS",
    h1: "A focused lash and brow studio in Leander, TX",
    intro: "Give detailed lash and brow services the privacy and calm they deserve in a private LUXYN suite, with the independence to grow your own brand and book of clients.",
    points: [
      { title: "A calm service setting", body: "Create a quiet, personal experience for detailed work and returning clients." },
      { title: "Full business ownership", body: "Keep control of your schedule, pricing, brand, and client relationships." },
      { title: "A welcoming destination", body: "Meet clients in a design-led environment with a styled lounge and on-site care." },
    ],
    image: "/assets/findpro-b.webp",
    cta: { label: "Lease a suite", href: "/lease-a-suite" },
  },
  {
    slug: "massage-wellness-room",
    title: "Massage & Wellness Room Rental in Leander, TX",
    description: "Lease a private massage or wellness room in Leander, TX for an independent practice with privacy, flexibility, and on-site support.",
    kicker: "FOR WELLNESS PROS",
    h1: "A private massage and wellness room in Leander, TX",
    intro: "LUXYN supports massage therapists and wellness practitioners with a private setting where they can build a trusted client experience and operate their own business.",
    points: [
      { title: "Privacy for every appointment", body: "Welcome clients into a dedicated room instead of a busy shared floor." },
      { title: "Independent by design", body: "Own your hours, pricing, services, brand, and client relationships." },
      { title: "Support that stays in the background", body: "LUXYN provides the space, amenities, upkeep, and on-site care." },
    ],
    image: "/assets/findpro-a.webp",
    cta: { label: "Book a private tour", href: "/book-a-tour" },
  },
];

export const questionPages: TopicPage[] = [
  {
    slug: "what-is-included-in-a-salon-suite-lease",
    title: "What Is Included in a Salon Suite Lease? | LUXYN",
    description: "Learn what LUXYN includes with a private salon suite lease in Leander, TX, from secure access and Wi-Fi to laundry and common-area care.",
    kicker: "A PRACTICAL GUIDE",
    h1: "What is included in a salon suite lease?",
    intro: "A salon suite lease usually combines a private workspace with shared building amenities and the support needed to welcome clients. At LUXYN, the published inclusions are designed to let independent professionals focus on their craft.",
    points: [
      { title: "Private, lockable space", body: "Your suite is your dedicated studio for serving clients and building your brand." },
      { title: "Published LUXYN amenities", body: "LUXYN lists 24/7 secure access, high-speed fiber Wi-Fi, on-site laundry, a client lounge, daily common-area cleaning, and custom suite branding." },
      { title: "Business independence", body: "You keep control of your hours, pricing, brand, and client relationships." },
    ],
    image: "/assets/amenities-illustration.webp",
    cta: { label: "Ask about current terms", href: "/lease-a-suite" },
  },
  {
    slug: "salon-suite-vs-booth-rent",
    title: "Salon Suite vs Booth Rent: What Is the Difference? | LUXYN",
    description: "Compare salon suite leasing and booth rent, including privacy, business control, client experience, and the questions to ask before choosing.",
    kicker: "MAKE THE RIGHT MOVE",
    h1: "Salon suite vs booth rent: what is the difference?",
    intro: "Booth rent typically places an independent professional inside a shared salon, while a salon suite gives them a private, dedicated room. The right choice depends on how much privacy, control, and ownership you want in the client experience.",
    points: [
      { title: "Privacy", body: "A suite gives each appointment a private setting; booth rent generally shares the salon floor with other professionals." },
      { title: "Control", body: "Both models can support independence, but a suite gives you a dedicated environment for your schedule, pricing, brand, and client experience." },
      { title: "Fit for your business", body: "Consider your service type, client expectations, growth plans, and the amenities that matter to your workflow." },
    ],
    image: "/assets/about-1.webp",
    cta: { label: "See LUXYN in person", href: "/book-a-tour" },
  },
  {
    slug: "how-to-lease-a-salon-suite",
    title: "How to Lease a Salon Suite: 4 Practical Steps | LUXYN",
    description: "Follow four practical steps to explore, compare, and lease a private salon or wellness suite at LUXYN in Leander, TX.",
    kicker: "YOUR NEXT FOUR STEPS",
    h1: "How to lease a salon suite",
    intro: "Leasing a salon suite starts with understanding your business, seeing the space, reviewing availability, and choosing the next step that fits your timeline. LUXYN keeps the first step simple: book a private tour.",
    points: [
      { title: "1. Define your studio", body: "Know your specialty, the client experience you want, and the kind of space your work needs." },
      { title: "2. Book a private tour", body: "See the available suites, shared amenities, access, parking, and client journey in person." },
      { title: "3. Review current terms", body: "Ask the LUXYN team about availability, current pricing, and the lease terms for the suite that fits." },
      { title: "4. Plan your opening", body: "Once you choose a suite, prepare your branding, booking flow, supplies, and client communication." },
    ],
    image: "/assets/cta-bg.webp",
    cta: { label: "Book a private tour", href: "/book-a-tour" },
  },
];

/* ── Dedicated SEO landing pages ──────────────────────────────────────────
 * Each entry becomes a real crawlable route (/<slug>) with its own <title>,
 * description, H1 and content — giving search engines a focused page per topic
 * while the home page keeps its single-scroll experience. `homeAnchor` deep-
 * links back into that experience so navigation still feels continuous. */
export type SeoPage = {
  slug: string;
  /** Short label for nav / footer / breadcrumb. */
  navLabel: string;
  /** Page <title> — the layout template appends " — LUXYN". */
  title: string;
  description: string;
  /** Small eyebrow above the H1. */
  kicker: string;
  h1: string;
  /** Lead paragraphs. */
  intro: string[];
  /** Feature bullets surfaced as a list. */
  points: { title: string; body: string }[];
  /** Section id on the home page this topic maps to (deep-link target). */
  homeAnchor: string;
  /** Primary call-to-action shown at the foot of the page. */
  cta: { label: string; href: string };
  /** Hero image (in /public/assets) — shown as an upright arched frame in the
   *  hero band. Must be a real portrait/interior photo (not a sprite sheet or
   *  illustration), since it's shown un-cropped-at-the-top in a 4:5 frame. */
  image: string;
};

export const seoPages: SeoPage[] = [
  {
    slug: "salon-suites",
    navLabel: "Salon Suites",
    title: "Private Salon Suites for Rent in Leander, TX",
    description:
      "Lease a private, design-led salon suite in Leander, TX. Own your hours, your brand, and your client experience in a space built for independent beauty pros.",
    kicker: "PRIVATE SUITES",
    h1: "Private salon suites for rent in Leander, TX",
    intro: [
      "LUXYN leases private, design-led salon suites to independent beauty and wellness professionals in Leander, TX. Each suite is a finished, lockable studio — a destination for your clients, not a cubicle.",
      "Founded on the belief that environment dictates energy, LUXYN gives you a curated atmosphere that elevates the client experience and supports your growth, with the independence to run your business your way.",
    ],
    points: [
      { title: "Design-led suites", body: "The most beautiful private suites in the category — finished to feel like a destination." },
      { title: "Independence, supported", body: "Own your business and your hours. Lean on LUXYN for the front desk, upkeep, and marketing." },
      { title: "Wellness under one roof", body: "Hair, skin, nails, brows, massage and more — a full sensory experience for every client." },
      { title: "On-site care", body: "A real person on site every day to welcome your clients and keep your space effortless." },
    ],
    homeAnchor: "philosophy",
    cta: { label: "Lease a suite", href: "/lease-a-suite" },
    image: "/assets/about-1.webp",
  },
  {
    slug: "amenities",
    navLabel: "Amenities",
    title: "Salon Suite Amenities in Leander, TX",
    description:
      "Every LUXYN suite in Leander, TX includes 24/7 secure access, fiber Wi-Fi, on-site laundry, a styled client lounge, daily cleaning, and custom branding.",
    kicker: "AMENITIES",
    h1: "Salon suite amenities designed around comfort, care, and craft",
    intro: [
      "A LUXYN suite comes with everything you need to deliver a premium experience and run an effortless studio. The amenities are included so you can focus entirely on your clients and your craft.",
    ],
    points: [
      { title: "24/7 secure access", body: "Your business, your hours. Complete autonomy with a state-of-the-art security system for peace of mind." },
      { title: "On-site laundry", body: "Complimentary high-capacity laundry facilities to keep your workflow seamless and stress-free." },
      { title: "Client lounge", body: "A sophisticated waiting area with specialty coffee and refreshments to delight your guests." },
      { title: "High-speed fiber", body: "Dedicated enterprise-grade Wi-Fi for seamless booking, processing, and social media." },
      { title: "Daily common care", body: "Professional cleaning of all shared areas keeps the facility reflecting your high standards." },
      { title: "Custom branding", body: "Paint and decorate your suite to match your brand's unique identity and aesthetic." },
    ],
    homeAnchor: "amenities",
    cta: { label: "Book a tour", href: "/book-a-tour" },
    image: "/assets/about-2.webp",
  },
  {
    slug: "gallery",
    navLabel: "Gallery",
    title: "Salon Suites for Beauty & Wellness Pros in Leander, TX",
    description:
      "From hair stylists and colorists to nail artists, estheticians, brow & lash artists and massage therapists — LUXYN suites in Leander, TX host diverse artistry.",
    kicker: "DIVERSE ARTISTRY",
    h1: "A space for independent beauty & wellness professionals",
    intro: [
      "LUXYN is home to a diverse community of independent professionals. Whatever your specialty, there's a private suite designed to showcase your work and elevate how clients experience your brand.",
    ],
    points: [
      { title: "Hair stylists & colorists", body: "Private, well-lit suites built for cut, color, and styling work." },
      { title: "Nail artists", body: "Dedicated space for a calm, premium nail experience." },
      { title: "Estheticians", body: "Treatment-ready rooms for skin and facial services." },
      { title: "Brow & lash artists", body: "Quiet, focused suites for detailed brow and lash work." },
      { title: "Massage therapists", body: "Serene, private rooms for massage and bodywork." },
      { title: "Wellness practitioners", body: "Flexible suites for the full range of wellness services." },
    ],
    homeAnchor: "gallery",
    cta: { label: "Lease a suite", href: "/lease-a-suite" },
    image: "/assets/findpro-b.webp",
  },
  {
    slug: "find-a-pro",
    navLabel: "Find a Pro",
    title: "Find a Beauty or Wellness Professional in Leander, TX",
    description:
      "Looking for a stylist, nail artist, esthetician, or massage therapist near Leander, TX? Discover independent beauty & wellness pros working from LUXYN.",
    kicker: "FOR CLIENTS",
    h1: "Find a beauty or wellness professional in Leander, TX",
    intro: [
      "Looking for a professional? LUXYN is home to independent beauty and wellness experts across hair, skin, nails, brows, lashes, massage, and more — each working from their own private suite in Leander, TX.",
      "Explore the artistry working from LUXYN and connect with the professional that fits exactly what you're looking for.",
    ],
    points: [
      { title: "Independent experts", body: "Every professional runs their own studio and owns their client experience." },
      { title: "Private, comfortable suites", body: "Enjoy your service in a calm, private space — not a busy open floor." },
      { title: "A range of specialties", body: "Hair, skin, nails, brows, lashes, massage, and wellness, all under one roof." },
    ],
    homeAnchor: "findpro",
    cta: { label: "Explore the gallery", href: "/gallery" },
    image: "/assets/findpro-a.webp",
  },
  {
    slug: "lease-a-suite",
    navLabel: "Lease a Suite",
    title: "Lease a Private Salon Suite in Leander, TX",
    description:
      "Reserve your private, design-led salon suite at LUXYN in Leander, TX. Tell us about your craft and we'll confirm availability and walk you through the terms.",
    kicker: "RESERVE YOUR SUITE",
    h1: "Lease a private salon suite in Leander, TX",
    intro: [
      "Ready to make LUXYN your professional home? Reserve a private suite and our team will reach out to confirm availability, share exact terms, and get you settled in.",
    ],
    points: [],
    homeAnchor: "contact",
    // Links to itself so the on-page form is the CTA — SeoSectionPage hides it.
    cta: { label: "Lease a suite", href: "/lease-a-suite" },
    image: "/assets/about-2.webp",
  },
  {
    slug: "book-a-tour",
    navLabel: "Book a Tour",
    title: "Book a Private Tour of LUXYN in Leander, TX",
    description:
      "Book a private tour of LUXYN's salon suites in Leander, TX. See the available suites in person and get current pricing — we'll arrange a time that suits you.",
    kicker: "BOOK A TOUR",
    h1: "Book a private tour in Leander, TX",
    intro: [
      "See it in person. Book a private tour and we'll walk you through the available suites and share current pricing — no pressure, just a real look at the space.",
    ],
    points: [],
    homeAnchor: "contact",
    cta: { label: "Book a tour", href: "/book-a-tour" },
    image: "/assets/findpro-a.webp",
  },
  {
    slug: "for-professionals",
    navLabel: "For Professionals",
    title: "Salon Suites for Independent Beauty Pros in Leander, TX",
    description:
      "A sanctuary, not a rented room. See why independent beauty & wellness pros choose LUXYN's private, design-led salon suites in Leander, TX.",
    kicker: "THE LUXYN DIFFERENCE",
    h1: "A sanctuary, not a rented room",
    intro: [
      "LUXYN gives independent beauty and wellness professionals more than four walls — a curated, design-led environment built to elevate the client experience and support how you grow.",
      "You own your business, your hours, and your brand. We handle the building, the amenities, the front desk, and the upkeep, so you can focus entirely on your craft.",
    ],
    points: [
      { title: "Design-led suites", body: "The most beautiful private suites in the category — finished to feel like a destination, not a cubicle." },
      { title: "Wellness under one roof", body: "Hair, skin, nails, brows, massage and more — a full sensory experience for every client." },
      { title: "Independence, supported", body: "Own your business and your hours. Lean on LUXYN for the front desk, upkeep, and marketing." },
      { title: "On-site care", body: "A real person on site every day to welcome your clients and keep your space effortless." },
    ],
    homeAnchor: "difference",
    cta: { label: "Lease a suite", href: "/lease-a-suite" },
    image: "/assets/about-1.webp",
  },
  {
    slug: "faq",
    navLabel: "FAQ",
    title: "Salon Suite Rental FAQ — Leander, TX",
    description:
      "Common questions about renting a private salon or wellness suite at LUXYN in Leander, TX — what's included, pricing, who can lease, and how to book a tour.",
    kicker: "QUESTIONS & ANSWERS",
    h1: "Renting a salon suite in Leander, TX",
    intro: [
      "Everything you need to know about leasing a private salon or wellness suite at LUXYN — what's included, who it's for, and how to get started.",
    ],
    points: [],
    homeAnchor: "faq",
    cta: { label: "Book a tour", href: "/book-a-tour" },
    image: "/assets/findpro-a.webp",
  },
];

/** Build the per-page Metadata for a section route from its SeoPage entry — each
 *  page gets its own title, description, OpenGraph and a self-canonical URL, and
 *  is indexable so search engines can rank each topic independently. */
export function sectionMetadata(slug: string): Metadata {
  const p = seoPages.find(x => x.slug === slug);
  if (!p) throw new Error(`sectionMetadata: unknown slug "${slug}"`);
  const path = `/${p.slug}`;
  return {
    title: p.title,
    description: p.description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      title: p.title,
      description: p.description,
      url: path,
    },
    robots: { index: true, follow: true },
  };
}

export function topicMetadata(page: TopicPage, section: "services" | "questions"): Metadata {
  const path = `/${section}/${page.slug}`;
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: path },
    openGraph: { type: "website", title: page.title, description: page.description, url: path },
    robots: { index: true, follow: true },
  };
}
