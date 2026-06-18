"use client";

import { useId, useState } from "react";
import { site, isFormConfigured } from "../lib/site";

type Status = "idle" | "submitting" | "success" | "error";

const INTERESTS = ["Lease a suite", "Book a tour", "Find a professional", "General enquiry"] as const;

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Fields = { name: string; email: string; phone: string; interest: string; message: string };
type Errors = Partial<Record<keyof Fields, string>>;

const FIELD_BASE =
  "lx-field w-full rounded-[12px] bg-white px-4 py-3 font-ui text-[15px] text-[rgb(2,36,72)] outline-none transition-[box-shadow] duration-200 placeholder:text-[rgb(150,150,150)]";

const fieldCls = (invalid: boolean) => `${FIELD_BASE}${invalid ? " lx-field--invalid" : ""}`;

/** Brand-styled, accessible lease/tour enquiry form. POSTs to the endpoint in
 *  site.ts (a static export can't run a server, so this targets a third-party
 *  form service such as Formspree). */
export default function ContactForm({ defaultInterest = "Lease a suite" }: { defaultInterest?: string }) {
  const uid = useId();
  const [fields, setFields] = useState<Fields>({
    name: "", email: "", phone: "", interest: defaultInterest, message: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [serverMsg, setServerMsg] = useState("");

  const set = (k: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFields(f => ({ ...f, [k]: e.target.value }));
    if (errors[k]) setErrors(er => ({ ...er, [k]: undefined }));
  };

  const validate = (): boolean => {
    const next: Errors = {};
    if (!fields.name.trim()) next.name = "Please enter your name.";
    if (!fields.email.trim()) next.email = "Please enter your email.";
    else if (!emailRe.test(fields.email.trim())) next.email = "Please enter a valid email.";
    if (!fields.message.trim()) next.message = "Tell us a little about what you need.";
    else if (fields.message.trim().length < 10) next.message = "A few more words, please.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === "submitting") return;
    if (!validate()) return;

    // honeypot — bots fill hidden fields; humans don't
    if ((e.currentTarget.elements.namedItem("_gotcha") as HTMLInputElement)?.value) return;

    if (!isFormConfigured) {
      setStatus("error");
      setServerMsg(
        "The contact form isn't connected to a delivery service yet. Reach us directly at " +
          site.contact.email + " and we'll respond right away.",
      );
      return;
    }

    setStatus("submitting");
    setServerMsg("");
    try {
      const res = await fetch(site.formEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          name: fields.name.trim(),
          email: fields.email.trim(),
          phone: fields.phone.trim(),
          interest: fields.interest,
          message: fields.message.trim(),
          _subject: `New ${fields.interest} enquiry — ${site.name}`,
        }),
      });
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      setStatus("success");
      setFields({ name: "", email: "", phone: "", interest: defaultInterest, message: "" });
    } catch {
      setStatus("error");
      setServerMsg(
        "Something went wrong sending your message. Please try again, or email us at " +
          site.contact.email + ".",
      );
    }
  };

  if (status === "success") {
    return (
      <div
        role="status"
        className="flex flex-col items-center justify-center gap-3 rounded-[20px] bg-white px-8 py-14 text-center"
        style={{ boxShadow: "inset 0 0 0 1px rgb(225,216,194)" }}
      >
        <span
          className="flex h-14 w-14 items-center justify-center rounded-full"
          style={{ background: "rgb(194,160,107)" }}
          aria-hidden="true"
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="rgb(20,35,59)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </span>
        <h3 className="m-0 font-display font-semibold" style={{ color: "rgb(2,36,72)", fontSize: 26 }}>
          Thank you — we&apos;ll be in touch.
        </h3>
        <p className="m-0 font-ui" style={{ color: "rgb(67,71,78)", fontSize: 15, maxWidth: 360, lineHeight: 1.6 }}>
          Your enquiry is on its way to our team. We typically respond within one business day.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-2 font-accent font-semibold transition-colors duration-300 hover:opacity-70"
          style={{ color: "rgb(194,160,107)", fontSize: 13, letterSpacing: 1 }}
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="flex flex-col gap-4 rounded-[20px] bg-white p-6 sm:p-8"
      style={{ boxShadow: "inset 0 0 0 1px rgb(225,216,194), 0 24px 50px rgba(20,35,59,.10)" }}
    >
      <Field id={`${uid}-name`} label="Name" error={errors.name}>
        <input
          id={`${uid}-name`} name="name" type="text" autoComplete="name"
          value={fields.name} onChange={set("name")}
          aria-invalid={!!errors.name} aria-describedby={errors.name ? `${uid}-name-err` : undefined}
          className={fieldCls(!!errors.name)} placeholder="Your full name"
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field id={`${uid}-email`} label="Email" error={errors.email}>
          <input
            id={`${uid}-email`} name="email" type="email" autoComplete="email" inputMode="email"
            value={fields.email} onChange={set("email")}
            aria-invalid={!!errors.email} aria-describedby={errors.email ? `${uid}-email-err` : undefined}
            className={fieldCls(!!errors.email)} placeholder="you@example.com"
          />
        </Field>
        <Field id={`${uid}-phone`} label="Phone" optional>
          <input
            id={`${uid}-phone`} name="phone" type="tel" autoComplete="tel"
            value={fields.phone} onChange={set("phone")}
            className={fieldCls(false)} placeholder="Optional"
          />
        </Field>
      </div>

      <Field id={`${uid}-interest`} label="I'm interested in">
        <select
          id={`${uid}-interest`} name="interest" value={fields.interest} onChange={set("interest")}
          className={`${fieldCls(false)} lx-select cursor-pointer appearance-none`}
        >
          {INTERESTS.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </Field>

      <Field id={`${uid}-message`} label="Message" error={errors.message}>
        <textarea
          id={`${uid}-message`} name="message" rows={4}
          value={fields.message} onChange={set("message")}
          aria-invalid={!!errors.message} aria-describedby={errors.message ? `${uid}-message-err` : undefined}
          className={`${fieldCls(!!errors.message)} resize-y`}
          placeholder="Tell us about your craft and what you're looking for."
        />
      </Field>

      {/* honeypot — visually hidden, off the tab order */}
      <input
        type="text" name="_gotcha" tabIndex={-1} autoComplete="off" aria-hidden="true"
        className="absolute -left-[9999px] h-0 w-0 opacity-0"
      />

      {status === "error" && (
        <p role="alert" className="m-0 font-ui" style={{ color: "rgb(176,58,46)", fontSize: 14, lineHeight: 1.5 }}>
          {serverMsg}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="mt-1 h-[50px] rounded-full font-ui font-bold text-white transition-[transform,box-shadow,opacity] duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
        style={{ fontSize: 14, letterSpacing: 0.4, background: "rgb(20,35,59)" }}
      >
        {status === "submitting" ? "Sending…" : "Send enquiry"}
      </button>
      <p className="m-0 text-center font-ui" style={{ color: "rgb(120,124,131)", fontSize: 12, lineHeight: 1.5 }}>
        We&apos;ll only use your details to respond to this enquiry.
      </p>
    </form>
  );
}

function Field({
  id, label, error, optional, children,
}: {
  id: string; label: string; error?: string; optional?: boolean; children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="font-accent font-semibold" style={{ color: "rgb(33,58,92)", fontSize: 12, letterSpacing: 1 }}>
        {label}{optional && <span style={{ color: "rgb(150,150,150)", fontWeight: 400 }}> (optional)</span>}
      </label>
      {children}
      {error && (
        <p id={`${id}-err`} role="alert" className="m-0 font-ui" style={{ color: "rgb(176,58,46)", fontSize: 13 }}>
          {error}
        </p>
      )}
    </div>
  );
}
