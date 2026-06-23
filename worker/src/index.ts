/**
 * LUXYN contact Worker — receives the contact-form POST from the static site
 * and sends TWO emails via Resend:
 *   1. a lead email to the sales inbox (TO_EMAIL) with the enquiry details, and
 *   2. a confirmation email back to the person who submitted the form.
 * The Resend API key lives here (server-side only), never in the browser.
 *
 * Endpoints:
 *   OPTIONS  → CORS preflight
 *   POST     → { variant, name, email, phone, message, ... }
 *
 * Deploy + config: see worker/README.md.
 */

export interface Env {
  /** Secret — set with `wrangler secret put RESEND_API_KEY`. */
  RESEND_API_KEY: string;
  /** Sales inbox — where leads are delivered. Comma-separated for several. */
  TO_EMAIL: string;
  /** Verified Resend sender, e.g. `LUXYN <noreply@luxynstudios.com>`. */
  FROM_EMAIL: string;
  /** Comma-separated list of origins allowed to call this Worker. */
  ALLOWED_ORIGINS: string;
  /** Optional — phone shown in the confirmation email. */
  BRAND_PHONE?: string;
  /** Optional secret — when set, Cloudflare Turnstile tokens are verified.
   *  Set with `wrangler secret put TURNSTILE_SECRET`. */
  TURNSTILE_SECRET?: string;
}

type Variant = "lease" | "tour";

const ESCAPE: Record<string, string> = {
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
};
const esc = (v: unknown): string => String(v ?? "").replace(/[&<>"']/g, c => ESCAPE[c]);

function corsHeaders(origin: string | null): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": origin ?? "null",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

function jsonResponse(data: unknown, status: number, origin: string | null): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
  });
}

/** Return the request's Origin only if it's in the allow-list. */
function allowedOrigin(request: Request, env: Env): string | null {
  const allow = env.ALLOWED_ORIGINS.split(",").map(s => s.trim()).filter(Boolean);
  const origin = request.headers.get("Origin");
  return origin && allow.includes(origin) ? origin : null;
}

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

/** Render a label/value list as a simple branded HTML table. */
function renderRows(rows: [string, string][]): string {
  return `<table style="border-collapse:collapse;width:100%;max-width:560px">
    ${rows
      .map(
        ([k, v]) =>
          `<tr>
             <td style="padding:8px 12px;background:#f3ecdc;border:1px solid #e8e0cd;font-weight:600;white-space:nowrap;vertical-align:top">${esc(k)}</td>
             <td style="padding:8px 12px;border:1px solid #e8e0cd">${esc(v).replace(/\n/g, "<br>")}</td>
           </tr>`,
      )
      .join("")}
  </table>`;
}

/** Send one email through the Resend REST API. Returns true on success. */
async function sendEmail(
  env: Env,
  params: { to: string[]; replyTo?: string; subject: string; html: string; text: string },
): Promise<boolean> {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env.FROM_EMAIL,
      to: params.to,
      reply_to: params.replyTo,
      subject: params.subject,
      html: params.html,
      text: params.text,
    }),
  });
  if (!res.ok) {
    console.error("Resend error", res.status, await res.text());
    return false;
  }
  return true;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = allowedOrigin(request, env);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }
    if (request.method !== "POST") {
      return jsonResponse({ ok: false, error: "Method not allowed" }, 405, origin);
    }
    // Reject requests from origins that aren't allow-listed.
    if (request.headers.get("Origin") && !origin) {
      return jsonResponse({ ok: false, error: "Origin not allowed" }, 403, origin);
    }

    let body: Record<string, unknown>;
    try {
      body = (await request.json()) as Record<string, unknown>;
    } catch {
      return jsonResponse({ ok: false, error: "Invalid JSON" }, 400, origin);
    }

    // Honeypot: bots fill the hidden _gotcha field. Pretend success, send nothing.
    if (body._gotcha) return jsonResponse({ ok: true }, 200, origin);

    // Turnstile: verify the token when a secret is configured (skipped otherwise).
    if (env.TURNSTILE_SECRET) {
      const token = String(body.turnstileToken ?? "");
      if (!token) {
        return jsonResponse({ ok: false, error: "Verification required" }, 403, origin);
      }
      const form = new FormData();
      form.append("secret", env.TURNSTILE_SECRET);
      form.append("response", token);
      const ip = request.headers.get("CF-Connecting-IP");
      if (ip) form.append("remoteip", ip);
      const verify = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
        method: "POST",
        body: form,
      });
      const result = (await verify.json().catch(() => ({ success: false }))) as { success?: boolean };
      if (!result.success) {
        return jsonResponse({ ok: false, error: "Verification failed" }, 403, origin);
      }
    }

    const variant: Variant = body.variant === "tour" ? "tour" : "lease";
    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim();
    const phone = String(body.phone ?? "").trim();
    const message = String(body.message ?? "").trim();

    if (!name || !email || !phone) {
      return jsonResponse({ ok: false, error: "Missing required fields" }, 422, origin);
    }
    if (!isEmail(email)) {
      return jsonResponse({ ok: false, error: "Invalid email" }, 422, origin);
    }

    const interest = variant === "tour" ? "Book a tour" : "Lease a suite";
    const requestKind = variant === "tour" ? "tour request" : "enquiry";
    const firstName = name.split(" ")[0] || name;

    // Field list shown in both emails — common fields + variant extras.
    const rows: [string, string][] = [
      ["Name", name],
      ["Email", email],
      ["Phone", phone],
      ["Interest", interest],
    ];
    if (variant === "lease") {
      if (body.suiteType) rows.push(["Suite type", String(body.suiteType)]);
      if (body.moveIn) rows.push(["Target move-in", String(body.moveIn)]);
    } else {
      if (body.preferredDate) rows.push(["Preferred date", String(body.preferredDate)]);
      if (body.preferredTime) rows.push(["Preferred time", String(body.preferredTime)]);
    }
    if (message) rows.push(["Message", message]);

    const toList = env.TO_EMAIL.split(",").map(s => s.trim()).filter(Boolean);
    const salesInbox = toList[0];

    // 1) Lead email → sales inbox. reply_to is the submitter, so a reply goes
    //    straight back to the lead.
    const leadHtml = `
      <div style="font-family:Inter,Arial,sans-serif;color:#142337;max-width:560px">
        <h2 style="margin:0 0 4px">New ${esc(interest)} enquiry</h2>
        <p style="margin:0 0 16px;color:#43474e">via the LUXYN website</p>
        ${renderRows(rows)}
      </div>`;
    const leadText =
      `New ${interest} enquiry — via the LUXYN website\n\n` +
      rows.map(([k, v]) => `${k}: ${v}`).join("\n");

    // 2) Confirmation email → the person who submitted the form. reply_to is the
    //    sales inbox, so if they reply it reaches the team.
    const callLine = env.BRAND_PHONE
      ? ` or call us at ${esc(env.BRAND_PHONE)}`
      : "";
    const confHtml = `
      <div style="font-family:Inter,Arial,sans-serif;color:#142337;max-width:560px;line-height:1.6">
        <h2 style="margin:0 0 8px">Thanks, ${esc(firstName)} — we've received your ${esc(requestKind)}.</h2>
        <p style="margin:0 0 16px;color:#43474e">A member of the LUXYN team will be in touch within one business day. Here's a copy of what you sent us:</p>
        ${renderRows(rows)}
        <p style="margin:16px 0 0;color:#43474e">If anything changes, just reply to this email${callLine}.</p>
        <p style="margin:16px 0 0">— The LUXYN Team</p>
      </div>`;
    const confText =
      `Thanks, ${firstName} — we've received your ${requestKind}.\n\n` +
      `A member of the LUXYN team will be in touch within one business day. ` +
      `Here's a copy of what you sent us:\n\n` +
      rows.map(([k, v]) => `${k}: ${v}`).join("\n") +
      `\n\nIf anything changes, just reply to this email${env.BRAND_PHONE ? ` or call us at ${env.BRAND_PHONE}` : ""}.\n— The LUXYN Team`;

    const [leadOk, confOk] = await Promise.all([
      sendEmail(env, {
        to: toList,
        replyTo: email,
        subject: `New ${interest} enquiry — LUXYN`,
        html: leadHtml,
        text: leadText,
      }),
      sendEmail(env, {
        to: [email],
        replyTo: salesInbox,
        subject: `We've received your ${requestKind} — LUXYN`,
        html: confHtml,
        text: confText,
      }),
    ]);

    // The lead email is the one that must land. The confirmation is best-effort —
    // if it fails we've still captured the lead, so the submission succeeds.
    if (!leadOk) {
      return jsonResponse({ ok: false, error: "Could not send message" }, 502, origin);
    }
    return jsonResponse({ ok: true, confirmation: confOk }, 200, origin);
  },
};
