import Link from "next/link";
import { site } from "../lib/site";

const YEAR = 2026;

/** Shared chrome for the legal/utility pages (privacy, terms, cookies).
 *  Server component — purely presentational, no client JS. */
export default function LegalLayout({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen" style={{ background: "rgb(243,236,220)", fontFamily: "'Inter',sans-serif" }}>
      {/* header band */}
      <header className="relative overflow-hidden" style={{ background: "rgb(20,35,59)" }}>
        <div className="mx-auto w-full max-w-[760px] px-6 pt-10 pb-12 sm:pt-12 sm:pb-16">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-accent font-semibold transition-opacity duration-300 hover:opacity-70"
            style={{ color: "rgb(194,160,107)", fontSize: 13, letterSpacing: 1 }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to {site.name}
          </Link>
          <h1 className="font-display font-semibold text-white" style={{ margin: "22px 0 0", fontSize: "clamp(34px,7vw,52px)", lineHeight: 1.05 }}>
            {title}
          </h1>
          <p className="font-ui" style={{ margin: "14px 0 0", color: "rgba(255,255,255,.55)", fontSize: 14 }}>
            Last updated {updated}
          </p>
        </div>
      </header>

      {/* body */}
      <div className="mx-auto w-full max-w-[760px] px-6 py-14 sm:py-16">
        <div
          className="rounded-[12px] px-4 py-3"
          style={{ background: "rgba(194,160,107,.12)", boxShadow: "inset 0 0 0 1px rgba(194,160,107,.35)" }}
        >
          <p className="m-0 font-ui" style={{ color: "rgb(67,71,78)", fontSize: 13.5, lineHeight: 1.6 }}>
            <strong style={{ color: "rgb(2,36,72)" }}>Template notice:</strong> this is placeholder
            legal copy. Replace it with policy reviewed by your own counsel before launch.
          </p>
        </div>

        <article className="legal-prose">{children}</article>

        <p className="font-ui" style={{ marginTop: 48, color: "rgb(120,124,131)", fontSize: 13 }}>
          © {YEAR} {site.name}. All rights reserved.
        </p>
      </div>
    </main>
  );
}
