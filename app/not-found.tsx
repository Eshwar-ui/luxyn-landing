import type { Metadata } from "next";
import Link from "next/link";
import { site } from "./lib/site";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center px-6 text-center"
      style={{ background: "rgb(20,35,59)", fontFamily: "'Inter',sans-serif" }}
    >
      <span className="font-display font-semibold" style={{ color: "rgb(194,160,107)", fontSize: "clamp(80px,18vw,140px)", lineHeight: 1 }}>
        404
      </span>
      <h1 className="font-display font-medium text-white" style={{ margin: "12px 0 0", fontSize: "clamp(26px,5vw,38px)", lineHeight: 1.1 }}>
        This space doesn&apos;t exist.
      </h1>
      <p className="font-ui" style={{ margin: "16px 0 0", maxWidth: 420, color: "rgba(255,255,255,.6)", fontSize: 15, lineHeight: 1.6 }}>
        The page you&apos;re looking for may have moved or never existed. Let&apos;s get you back to {site.name}.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex h-[50px] items-center justify-center rounded-full px-8 font-ui font-bold transition-transform duration-300 hover:-translate-y-0.5"
        style={{ background: "rgb(194,160,107)", color: "rgb(20,35,59)", fontSize: 14, letterSpacing: 0.4 }}
      >
        Back to home
      </Link>
    </main>
  );
}
