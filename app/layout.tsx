import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, EB_Garamond, Inter, Jost } from "next/font/google";
import "./globals.css";
import { site, fullAddress } from "./_lib/site";
import CookieConsent from "./_components/CookieConsent";
import RevealObserver from "./_lib/reveal-observer";
import { CONSENT_KEY, CONSENT_VERSION } from "./_lib/consent";

/* Self-hosted via next/font — no render-blocking <link> to Google, automatic
 * `font-display: swap`, and size-adjusted fallbacks that cut layout shift.
 * Each exposes a CSS variable that globals.css maps onto the Tailwind font-* keys.
 * Jost isn't preloaded: on phones nothing in the first viewport uses it, so it
 * loads when the sections/banner that need it render instead of racing the LCP
 * heading. (Preloading a font that *is* needed early is still faster, so the
 * other three stay preloaded.)
 * Inter ships upright only: italics are three small captions, which the browser
 * slants itself — saving a ~52KB high-priority preload that raced the LCP. */
const cormorant = Cormorant_Garamond({
  subsets: ["latin"], weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant", display: "swap",
});
const ebGaramond = EB_Garamond({
  subsets: ["latin"], weight: ["400"],
  variable: "--font-eb", display: "swap",
});
const inter = Inter({
  subsets: ["latin"], weight: ["400", "500", "600", "700"],
  variable: "--font-inter", display: "swap",
});
const jost = Jost({
  subsets: ["latin"], weight: ["400", "600"],
  variable: "--font-jost", display: "swap", preload: false,
});
const fontVars = `${cormorant.variable} ${ebGaramond.variable} ${inter.variable} ${jost.variable}`;

const GA_MEASUREMENT_ID = "G-YRH0H9ZJPP";
const GOOGLE_ADS_TAG_ID = "AW-18344601972";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: site.title,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  keywords: [
    "salon suites",
    "salon suite rental",
    "beauty studio rental",
    "wellness suite lease",
    "private beauty suites",
    "independent stylist space",
    "esthetician room rental",
    site.name,
  ],
  authors: [{ name: site.name }],
  creator: site.name,
  publisher: site.name,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: site.name,
    title: site.title,
    description: site.description,
    url: site.url,
    locale: "en_US",
    images: [
      {
        url: site.ogImage,
        width: 1200,
        height: 630,
        alt: `${site.name} — private, design-led beauty & wellness suites`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: site.title,
    description: site.description,
    images: [site.ogImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-video-preview": -1,
      "max-snippet": -1,
    },
  },
  manifest: "/manifest.webmanifest",
  // Icons are provided by file conventions: app/icon.svg, app/apple-icon.png,
  // app/favicon.ico — Next emits the <link> tags automatically.
  // Search-console ownership tags — only emitted once a token is set in site.ts.
  ...((site.verification.google || site.verification.bing)
    ? {
        verification: {
          ...(site.verification.google ? { google: site.verification.google } : {}),
          ...(site.verification.bing ? { other: { "msvalidate.01": site.verification.bing } } : {}),
        },
      }
    : {}),
  category: "business",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#142337",
  colorScheme: "dark light",
};

/* ── Structured data (JSON-LD) ──────────────────────────────────────────────
 * SITE-WIDE nodes only — Organization, WebSite, and the LocalBusiness — since
 * these describe the business and apply to every URL. Page-specific nodes
 * (WebPage, BreadcrumbList, FAQPage, Review) are emitted by the page that
 * actually renders that content (home page, section pages, blog, /faq), so the
 * markup always matches what's visible — a Google structured-data requirement.
 * Optional fields (geo, opening hours, ratings, verification) are only included
 * once their real values are set in site.ts. */
const orgId = `${site.url}/#organization`;
const siteId = `${site.url}/#website`;
const businessId = `${site.url}/#localbusiness`;
const sameAs = Object.values(site.socials).filter(Boolean);

const postalAddress = {
  "@type": "PostalAddress",
  streetAddress: site.contact.address.street,
  addressLocality: site.contact.address.locality,
  addressRegion: site.contact.address.region,
  postalCode: site.contact.address.postalCode,
  addressCountry: site.contact.address.country,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": orgId,
      name: site.name,
      url: site.url,
      description: site.description,
      slogan: site.tagline,
      logo: { "@type": "ImageObject", url: `${site.url}${site.logo}`, width: 1200, height: 1200 },
      image: `${site.url}${site.ogImage}`,
      email: site.contact.email,
      telephone: site.contact.phone,
      address: postalAddress,
      ...(sameAs.length ? { sameAs } : {}),
    },
    {
      "@type": "WebSite",
      "@id": siteId,
      url: site.url,
      name: site.name,
      description: site.description,
      inLanguage: "en-US",
      publisher: { "@id": orgId },
    },
    {
      "@type": "HealthAndBeautyBusiness",
      "@id": businessId,
      name: site.name,
      description: site.description,
      url: site.url,
      image: `${site.url}${site.ogImage}`,
      logo: `${site.url}${site.logo}`,
      email: site.contact.email,
      telephone: site.contact.phone,
      priceRange: site.business.priceRange,
      currenciesAccepted: "USD",
      address: postalAddress,
      areaServed: [
        { "@type": "City", name: "Leander" },
        { "@type": "City", name: "Cedar Park" },
        { "@type": "City", name: "Austin" },
      ],
      parentOrganization: { "@id": orgId },
      ...(sameAs.length ? { sameAs } : {}),
      ...(site.business.openingHours.length ? { openingHours: site.business.openingHours } : {}),
      ...(site.business.aggregateRating.reviewCount > 0 && site.business.aggregateRating.ratingValue
        ? {
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: site.business.aggregateRating.ratingValue,
              reviewCount: site.business.aggregateRating.reviewCount,
            },
          }
        : {}),
      ...(site.business.geo.latitude && site.business.geo.longitude
        ? {
            geo: {
              "@type": "GeoCoordinates",
              latitude: site.business.geo.latitude,
              longitude: site.business.geo.longitude,
            },
          }
        : {}),
      makesOffer: {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Private salon & wellness suite leasing",
          serviceType: "Salon suite rental",
          provider: { "@id": orgId },
          areaServed: {
            "@type": "City",
            name: site.contact.address.locality,
          },
        },
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={fontVars} suppressHydrationWarning>
      <head>
        {/* Consent Mode default — a plain inline script in <head> so it runs
            synchronously before gtag.js loads: GA starts with analytics_storage
            denied, then we grant it only if the visitor has already opted in
            (stored choice). The banner flips it live thereafter. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('consent', 'default', {
                analytics_storage: 'denied',
                ad_storage: 'denied',
                ad_user_data: 'denied',
                ad_personalization: 'denied',
                wait_for_update: 500
              });
              try {
                var c = JSON.parse(localStorage.getItem('${CONSENT_KEY}'));
                if (c && c.v === ${CONSENT_VERSION} && c.analytics) {
                  gtag('consent', 'update', { analytics_storage: 'granted' });
                }
              } catch (e) {}
            `,
          }}
        />
        {/* Google tag (Ads + GA4). The config commands queue on dataLayer
            right away, but gtag.js itself (~350KB across the Ads + GA bundles)
            is only fetched on the visitor's first interaction, or once the page
            has been idle for a few seconds after load — so it never competes
            with first paint or blocks the main thread during startup. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              gtag('js', new Date());
              gtag('config', '${GOOGLE_ADS_TAG_ID}');
              gtag('config', 'AW-18344601972/P5lkCP2JsNccEPTSsatE', {
                'phone_conversion_number': '+1 737-287-7396'
              });
              gtag('config', '${GA_MEASUREMENT_ID}');
              (function () {
                var done = false, evs = ['pointerdown', 'keydown', 'touchstart', 'scroll'];
                function load() {
                  if (done) return;
                  done = true;
                  evs.forEach(function (e) { removeEventListener(e, load, { passive: true }); });
                  var s = document.createElement('script');
                  s.async = true;
                  s.src = 'https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_TAG_ID}';
                  document.head.appendChild(s);
                }
                evs.forEach(function (e) { addEventListener(e, load, { passive: true }); });
                addEventListener('load', function () { setTimeout(load, 5000); });
              })();
            `,
          }}
        />
        {/* The hero <img> is in the HTML with fetchPriority="high", so the
            browser finds it without a preload. The arch photo is decorative and
            not the LCP element, so it isn't preloaded either — fewer high-priority
            requests racing the hero heading on mobile. */}
        {/* Scroll-reveal starts elements at opacity:0, then JS reveals them. If JS
            never runs (crawler without JS, or a blocked script), force `.rv`
            visible so the content is always present. */}
        <noscript>
          <style>{`.rv{opacity:1 !important;transform:none !important}`}</style>
        </noscript>
        <meta name="format-detection" content="telephone=no" />
        <link rel="author" href={`mailto:${site.contact.email}`} />
        <meta itemProp="name" content={site.name} />
        <meta name="geo.placename" content={fullAddress} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        {children}
        <RevealObserver />
        <CookieConsent />
      </body>
    </html>
  );
}
