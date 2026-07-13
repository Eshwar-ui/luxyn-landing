import type { Metadata } from "next";
import SiteHeader from "../../_components/SiteHeader";
import SiteFooter from "../../_components/SiteFooter";
import PageHero from "../../_components/PageHero";
import FloorPlan from "../../_components/FloorPlan";
import { site } from "../../_lib/site";

// Dedicated, indexable floor-plan page — its own title/description, self-
// canonical, with the interactive suite map. Not part of the home-page scroll.
const path = "/floor-plan";
const title = "Floor Plan — Suite Map & Availability";
const description =
  "Explore the LUXYN Studios floor plan: 23 private salon & wellness suites from 126 to 209 SF, plus a conference room, shared reception, restrooms and common areas. Zoom the full plan and see each suite's location and size.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: path },
  openGraph: { type: "website", title, description, url: path },
  robots: { index: true, follow: true },
};

export default function Page() {
  const url = `${site.url}${path}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: title,
        description,
        isPartOf: { "@id": `${site.url}/#website` },
        about: { "@id": `${site.url}/#localbusiness` },
        inLanguage: "en-US",
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${site.url}/` },
          { "@type": "ListItem", position: 2, name: "Floor Plan", item: url },
        ],
      },
    ],
  };

  return (
    <>
      <SiteHeader />

      <main id="hero" className="relative w-full" style={{ background: "rgb(243,236,220)" }}>
        <PageHero
          crumbs={[{ label: "Home", href: "/" }, { label: "Floor Plan" }]}
          kicker="FLOOR PLAN"
          h1="Find your suite"
        >
          <div className="mt-7 max-w-[680px] flex flex-col gap-4">
            <p className="font-ui font-normal" style={{ color: "rgba(255,255,255,.78)", fontSize: 17, lineHeight: 1.7 }}>
              Twenty-three private, move-in-ready suites arranged around a shared reception, restrooms
              and common areas. Hover any suite to see its size, or browse the full directory below.
            </p>
          </div>
        </PageHero>

        <FloorPlan />
      </main>

      <SiteFooter />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
