import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";
import PageHero from "./PageHero";
import { site } from "../_lib/site";
import type { TopicPage as TopicPageData } from "../_lib/content";

export default function TopicPage({ page, section }: { page: TopicPageData; section: "services" | "questions" }) {
  const url = `${site.url}/${section}/${page.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: page.title,
        description: page.description,
        isPartOf: { "@id": `${site.url}/#website` },
        about: { "@id": `${site.url}/#localbusiness` },
        inLanguage: "en-US",
      },
      ...(section === "services"
        ? [{
            "@type": "Service",
            "@id": `${url}#service`,
            name: page.h1,
            description: page.description,
            provider: { "@id": `${site.url}/#organization` },
            areaServed: { "@type": "City", name: "Leander" },
            url,
          }]
        : []),
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${site.url}/` },
          { "@type": "ListItem", position: 2, name: section === "services" ? "Services" : "Guides", item: `${site.url}/${section}` },
          { "@type": "ListItem", position: 3, name: page.title, item: url },
        ],
      },
    ],
  };

  return (
    <>
      <SiteHeader />
      <main className="relative w-full" style={{ background: "rgb(243,236,220)" }}>
        <PageHero
          crumbs={[{ label: "Home", href: "/" }, { label: section === "services" ? "Services" : "Guides" }, { label: page.kicker }]}
          kicker={page.kicker}
          h1={page.h1}
          narrow
          image={{ src: page.image, alt: page.h1 }}
        >
          <p className="mt-6 max-w-[680px] font-ui text-[17px]" style={{ color: "rgba(255,255,255,.78)", lineHeight: 1.7 }}>
            {page.intro}
          </p>
        </PageHero>

        <section className="mx-auto w-full max-w-[1000px] px-6 py-14 lg:px-12 lg:py-20">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {page.points.map((point) => (
              <div key={point.title} className="rounded-[14px] p-6" style={{ background: "rgb(252,250,244)", boxShadow: "inset 0 0 0 1px rgb(225,216,194)" }}>
                <h2 className="font-display text-[22px] font-bold text-[rgb(33,58,92)]" style={{ lineHeight: 1.25 }}>{point.title}</h2>
                <p className="mt-2 font-ui text-[14.5px] text-[rgb(22,38,60)]" style={{ lineHeight: 1.6 }}>{point.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 flex flex-wrap gap-3">
            <a href={page.cta.href} className="inline-flex h-[52px] items-center justify-center rounded-full px-8 font-ui text-[14px] font-bold text-white" style={{ background: "rgb(20,35,59)" }}>{page.cta.label}</a>
            <a href="/salon-suites" className="inline-flex h-[52px] items-center justify-center rounded-full px-8 font-ui text-[14px] font-bold text-[rgb(20,35,59)]" style={{ boxShadow: "inset 0 0 0 1px rgb(194,160,107)" }}>Explore LUXYN suites</a>
          </div>
        </section>
      </main>
      <SiteFooter />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
    </>
  );
}
