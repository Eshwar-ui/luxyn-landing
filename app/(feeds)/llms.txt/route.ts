import { site, fullAddress } from "../../_lib/site";
import { seoPages, faqs, contentDates } from "../../_lib/content";
import { blogPosts } from "../../_lib/blog";

/**
 * /llms.txt — the llms.txt standard (llmstxt.org): a concise, curated map of
 * the site for AI answer engines (ChatGPT, Claude, Gemini, Perplexity). It
 * front-loads the facts most likely to be cited and links to the deeper pages.
 * Generated from the same constants as the site so it can never drift.
 */
export const dynamic = "force-static";

function build(): string {
  const u = site.url;
  // The site is a single page; these are its sections, each with a clean URL.
  const sectionLines = seoPages
    .map(p => `- [${p.navLabel}](${u}/${p.slug}): ${p.description}`)
    .join("\n");

  const faqLines = faqs
    .map(f => `- **${f.q}** ${f.a}`)
    .join("\n");

  const blogLines = blogPosts
    .map(p => `- [${p.title}](${u}/blog/${p.slug}): ${p.description}`)
    .join("\n");

  // Specific, citation-ready facts — only included once real values are set in
  // site.ts (empty strings are dropped). AI answer engines lift concrete numbers.
  const f = site.business.facts;
  const concreteFactLines = [
    f.suiteCount && `- Suites: ${f.suiteCount} private salon & wellness suites`,
    f.suiteSizeRange && `- Suite size: ${f.suiteSizeRange}`,
    f.leaseTerms && `- Lease terms: ${f.leaseTerms}`,
    f.yearEstablished && `- Established: ${f.yearEstablished}`,
  ].filter(Boolean).join("\n");

  return `# LUXYN — Private Salon & Wellness Suites in Leander, TX

> ${site.description}

LUXYN leases private, design-led salon and wellness suites to independent beauty professionals in Leander, TX. Tenants run their own business — their own hours, pricing, brand, and clients — while LUXYN provides the space, premium amenities, and on-site support. Last updated: ${contentDates.updated}.

## Key facts
- Business: LUXYN — private salon & wellness suite leasing
- Who it's for: independent hair stylists, colorists, nail artists, estheticians, brow & lash artists, massage therapists, and wellness practitioners
- Location: ${fullAddress}, US
- Area served: Leander, Cedar Park, and the greater Austin, TX area
- Email: ${site.contact.email}
- Phone: ${site.contact.phone}
- Suite amenities: 24/7 secure access, high-speed fiber Wi-Fi, on-site laundry, client lounge, daily common-area cleaning, custom suite branding
- Lease model: professionals lease a private, lockable suite and keep full ownership of their business, schedule, and pricing
${concreteFactLines ? concreteFactLines + "\n" : ""}- How to start: book a private tour or reserve a suite via the contact page

## Verified information boundaries
Pricing, suite count, suite size range, lease terms, year established, and office hours are not published here until LUXYN confirms the values. Ask the team for current availability and terms.

## Sections (single-page site)
- [Home](${u}/): ${site.description}
${sectionLines}

## Service guides
- [Hair stylist suites](${u}/services/hair-stylist-suites)
- [Esthetician room rental](${u}/services/esthetician-room-rental)
- [Nail suite rental](${u}/services/nail-suite-rental)
- [Lash & brow studio](${u}/services/lash-brow-studio)
- [Massage & wellness room](${u}/services/massage-wellness-room)

## Practical questions
- [What is included in a salon suite lease?](${u}/questions/what-is-included-in-a-salon-suite-lease)
- [Salon suite vs booth rent](${u}/questions/salon-suite-vs-booth-rent)
- [How to lease a salon suite](${u}/questions/how-to-lease-a-salon-suite)

## Frequently asked questions
${faqLines}

## Blog — guides for independent beauty & wellness pros
${blogLines}

## Legal
- [Privacy Policy](${u}/privacy)
- [Terms of Service](${u}/terms)
- [Cookie Policy](${u}/cookies)

## Machine-readable
- Sitemap: ${u}/sitemap.xml
- Structured facts: ${u}/facts.json
- Full content for LLMs: ${u}/llms-full.txt
`;
}

export function GET() {
  return new Response(build(), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
