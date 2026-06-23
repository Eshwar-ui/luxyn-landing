# LUXYN contact Worker

A tiny Cloudflare Worker that receives the website contact-form POST and sends
**two emails** via [Resend](https://resend.com): the lead to your sales inbox,
and a confirmation back to the person who filled in the form. The Resend API key
lives here (server-side), never in the browser.

```
                              ┌──▶ lead email        → TO_EMAIL (sales inbox)
Browser form ──POST──▶ Worker ┤
                              └──▶ confirmation email → the submitter
```

## One-time setup

1. **Install deps**
   ```bash
   cd worker
   npm install
   ```

2. **Resend account + API key**
   - Create an account at https://resend.com and copy an **API key**.
   - **Verify the sending domain** (`luxynstudios.com`) under Resend → Domains,
     and add the DNS records it gives you. This lets you send *from*
     `noreply@luxynstudios.com`.
   - Not verified yet? For testing, set `FROM_EMAIL = "onboarding@resend.dev"`
     in `wrangler.toml` — but Resend will only deliver test mail to **your own
     Resend account email**, not to `luxynsales@gmail.com`.

3. **Log in to Cloudflare**
   ```bash
   npx wrangler login
   ```

4. **Set the secret** (the API key — never commit it)
   ```bash
   npx wrangler secret put RESEND_API_KEY
   # paste the key when prompted
   ```

5. **Check `wrangler.toml` vars** — `TO_EMAIL`, `FROM_EMAIL`, and
   `ALLOWED_ORIGINS` (must include the live site origin).

6. **Deploy**
   ```bash
   npx wrangler deploy
   ```
   Copy the printed URL, e.g. `https://luxyn-contact.<your-subdomain>.workers.dev`.

7. **Point the site at it** — paste that URL into
   [`app/lib/site.ts`](../app/lib/site.ts) → `contactEndpoint`, then rebuild and
   redeploy the site.

## Optional: spam protection (Cloudflare Turnstile)

The form already has a honeypot + origin allow-list. To add Turnstile (a
privacy-friendly CAPTCHA):

1. In the Cloudflare dashboard → **Turnstile**, create a widget for
   `luxynstudios.com`. You get a **site key** (public) and a **secret key**.
2. Paste the **site key** into [`app/lib/site.ts`](../app/lib/site.ts) →
   `turnstileSiteKey`, then rebuild the site. The widget now renders in the form.
3. Set the **secret key** on the Worker and redeploy:
   ```bash
   npx wrangler secret put TURNSTILE_SECRET
   npx wrangler deploy
   ```

When `TURNSTILE_SECRET` is set the Worker rejects any submission without a valid
token. Leave both unset to keep Turnstile off — the form still works.

## Local development

```bash
npm run dev          # runs the Worker locally on http://localhost:8787
npm run tail         # live-stream production logs (handy for debugging Resend errors)
```

For local form testing, temporarily set `contactEndpoint` to the
`wrangler dev` URL and make sure `http://localhost:3000` is in `ALLOWED_ORIGINS`.

## What it does

- Accepts `POST` JSON `{ variant, name, email, phone, message, ... }`.
- CORS-restricts to `ALLOWED_ORIGINS`; handles the `OPTIONS` preflight.
- Drops bot submissions via the hidden `_gotcha` honeypot (returns 200, sends nothing).
- Validates required fields + email format.
- Sends a **lead email** to `TO_EMAIL` with `reply_to` set to the submitter (so
  a reply goes straight to the lead), **and** a **confirmation email** back to
  the submitter with `reply_to` set to your sales inbox.
- The lead email must send for the request to succeed; the confirmation is
  best-effort (the response includes `"confirmation": true/false`).
