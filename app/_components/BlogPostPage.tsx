import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";
import PageHero from "./PageHero";
import ArticleProgress from "./ArticleProgress";
import ArticleToc from "./ArticleToc";
import ArticleShare from "./ArticleShare";
import { site } from "../_lib/site";
import { type BlogPost, formatPostDate, postUrl, headings, otherPosts, authorBio, slugify, howToSteps } from "../_lib/blog";

/**
 * Renders a single blog article — an editorial layout with a sticky table of
 * contents, reading-progress bar, drop-cap intro, pull-quotes, a share row, an
 * author note and related reading. Emits BlogPosting + BreadcrumbList JSON-LD
 * scoped to the article URL so it can earn an article result and breadcrumb.
 */
export default function BlogPostPage({ post }: { post: BlogPost }) {
  const url = postUrl(post.slug);
  const toc = headings(post);
  const related = otherPosts(post.slug);
  const firstParaIdx = post.body.findIndex((b) => b.type === "p");

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `${url}#article`,
        headline: post.title,
        description: post.description,
        url,
        image: `${site.url}${post.image}`,
        datePublished: post.published,
        dateModified: post.updated,
        inLanguage: "en-US",
        wordCount: post.body.reduce((n, b) => n + ("text" in b ? b.text.split(/\s+/).length : 0), 0),
        author: { "@type": "Organization", name: post.author, "@id": `${site.url}/#organization` },
        publisher: { "@id": `${site.url}/#organization` },
        isPartOf: { "@id": `${site.url}/#website` },
        mainEntityOfPage: { "@type": "WebPage", "@id": `${url}#webpage` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${site.url}/` },
          { "@type": "ListItem", position: 2, name: "Blog", item: `${site.url}/blog` },
          { "@type": "ListItem", position: 3, name: post.title, item: url },
        ],
      },
      // Step-by-step guides also emit HowTo, with each step deep-linking to its
      // on-page heading anchor. Steps are derived from the numbered H2s.
      ...(post.howTo
        ? [
            {
              "@type": "HowTo",
              "@id": `${url}#howto`,
              name: post.title,
              description: post.description,
              image: `${site.url}${post.image}`,
              step: howToSteps(post).map((s, i) => ({
                "@type": "HowToStep",
                position: i + 1,
                name: s.name,
                text: s.text,
                url: `${url}#${s.id}`,
              })),
            },
          ]
        : []),
    ],
  };

  return (
    <>
      <ArticleProgress />
      <SiteHeader />

      <main id="hero" className="relative w-full" style={{ background: "rgb(243,236,220)" }}>
        <PageHero
          crumbs={[{ label: "Home", href: "/" }, { label: "Blog", href: "/blog" }, { label: post.kicker }]}
          kicker={post.kicker}
          h1={post.h1}
          narrow
          image={{ src: post.image, alt: post.title }}
        >
          {/* byline */}
          <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 font-ui text-[14px]" style={{ color: "rgba(225,216,194,.7)" }}>
            <span className="font-semibold" style={{ color: "rgb(255,255,255)" }}>{post.author}</span>
            <span style={{ color: "rgba(225,216,194,.4)" }}>·</span>
            <time dateTime={post.published}>{formatPostDate(post.published)}</time>
            <span style={{ color: "rgba(225,216,194,.4)" }}>·</span>
            <span>{post.readMins} min read</span>
          </div>
        </PageHero>

        <div className="mx-auto w-full max-w-[1120px] px-6 lg:px-12 pt-14 pb-16 lg:pt-16 lg:pb-24">
          <div className="grid gap-10 lg:grid-cols-[210px_minmax(0,1fr)] lg:gap-14">
            {/* table of contents */}
            <ArticleToc items={toc} />

            {/* article body */}
            <article className="min-w-0 max-w-[720px]">
              <div className="flex flex-col gap-5">
                {post.body.map((block, i) => {
                  if (block.type === "h2") {
                    const id = slugify(block.text);
                    return (
                      <h2
                        key={i}
                        id={id}
                        className="mt-6 scroll-mt-24 font-display font-bold text-[rgb(33,58,92)] text-[24px] lg:text-[28px]"
                        style={{ lineHeight: 1.25 }}
                      >
                        {block.text}
                      </h2>
                    );
                  }
                  if (block.type === "quote") {
                    return (
                      <blockquote
                        key={i}
                        className="my-4 rounded-r-[14px] py-2 pl-6 pr-4"
                        style={{ borderLeft: "3px solid rgb(194,160,107)", background: "rgba(194,160,107,.07)" }}
                      >
                        <p className="font-display font-medium text-[rgb(33,58,92)] text-[21px] lg:text-[24px]" style={{ lineHeight: 1.4 }}>
                          “{block.text}”
                        </p>
                      </blockquote>
                    );
                  }
                  if (block.type === "ul") {
                    return (
                      <ul key={i} className="flex flex-col gap-2.5 pl-1">
                        {block.items.map((item, j) => (
                          <li key={j} className="flex gap-3 font-ui font-normal text-[rgb(67,71,78)]" style={{ fontSize: 17, lineHeight: 1.7 }}>
                            <span aria-hidden="true" className="mt-[10px] h-[6px] w-[6px] shrink-0 rounded-full" style={{ background: "rgb(194,160,107)" }} />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    );
                  }
                  const dropCap =
                    i === firstParaIdx
                      ? "first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:font-display first-letter:font-semibold first-letter:text-[58px] first-letter:leading-[0.8] first-letter:text-[rgb(160,128,72)]"
                      : "";
                  return (
                    <p key={i} className={`font-ui font-normal text-[rgb(67,71,78)] ${dropCap}`} style={{ fontSize: 17, lineHeight: 1.7 }}>
                      {block.text}
                    </p>
                  );
                })}
              </div>

              {/* CTA card */}
              <div
                className="mt-12 flex flex-col gap-4 rounded-[18px] p-7 sm:flex-row sm:items-center sm:justify-between sm:p-8"
                style={{ background: "rgb(20,35,59)" }}
              >
                <div>
                  <p className="font-accent font-semibold text-[rgb(194,160,107)]" style={{ fontSize: 12, letterSpacing: 3 }}>
                    LUXYN · LEANDER, TX
                  </p>
                  <p className="mt-1.5 font-display font-semibold text-white text-[21px]" style={{ lineHeight: 1.25 }}>
                    Ready to picture your own suite?
                  </p>
                </div>
                <a
                  href={post.cta.href}
                  className="inline-flex h-[50px] shrink-0 items-center justify-center rounded-full px-8 font-ui font-bold transition-transform duration-300 hover:-translate-y-0.5"
                  style={{ fontSize: 14.5, letterSpacing: 0.4, background: "rgb(194,160,107)", color: "rgb(20,35,59)" }}
                >
                  {post.cta.label}
                </a>
              </div>

              {/* share + author */}
              <div className="mt-10 flex flex-col gap-6 border-t pt-8" style={{ borderColor: "rgb(225,216,194)" }}>
                <ArticleShare url={url} title={post.title} />
                <div className="flex items-start gap-4">
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full font-display font-bold text-white"
                    style={{ background: "rgb(20,35,59)", fontSize: 18 }}
                    aria-hidden="true"
                  >
                    L
                  </div>
                  <div>
                    <p className="font-ui font-semibold text-[15px] text-[rgb(2,36,72)]">{post.author}</p>
                    <p className="mt-1 font-ui font-normal text-[rgb(67,71,78)] text-[14px]" style={{ lineHeight: 1.6 }}>
                      {authorBio}
                    </p>
                  </div>
                </div>
              </div>
            </article>
          </div>

          {/* related reading */}
          {related.length > 0 && (
            <section className="mt-16 border-t pt-12" style={{ borderColor: "rgb(225,216,194)" }} aria-label="Continue reading">
              <h2 className="font-display font-bold text-[rgb(2,36,72)] text-[26px]">Continue reading</h2>
              <div className="mt-7 grid gap-5 sm:grid-cols-2">
                {related.map((p) => (
                  <a
                    key={p.slug}
                    href={`/blog/${p.slug}`}
                    className="group flex flex-col overflow-hidden rounded-[16px] transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(20,35,59,.12)]"
                    style={{ background: "rgb(252,250,244)", boxShadow: "inset 0 0 0 1px rgb(225,216,194)" }}
                  >
                    <div className="relative overflow-hidden" style={{ aspectRatio: "16 / 9" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.image} alt={p.title} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.05]" />
                    </div>
                    <div className="flex flex-col p-5 lg:p-6">
                      <span className="font-accent font-semibold text-[rgb(184,153,104)]" style={{ fontSize: 12, letterSpacing: 2 }}>{p.kicker}</span>
                      <h3 className="mt-2 font-display font-bold text-[rgb(33,58,92)] text-[19px] transition-colors duration-200 group-hover:text-[rgb(160,128,72)]" style={{ lineHeight: 1.3 }}>
                        {p.title}
                      </h3>
                      <span className="mt-3 font-ui font-semibold text-[13.5px] text-[rgb(2,36,72)]">
                        Read article <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">→</span>
                      </span>
                    </div>
                  </a>
                ))}
              </div>

              <a href="/blog" className="mt-10 inline-block font-ui font-semibold text-[15px] text-[rgb(2,36,72)] transition-colors duration-200 hover:text-[rgb(160,128,72)]">
                ← All articles
              </a>
            </section>
          )}
        </div>
      </main>

      <SiteFooter />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
