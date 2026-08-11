"use client";

import { useState, type FormEvent } from "react";

const initial = { name: "", email: "", school: "", subject: "", message: "" };
type FormState = typeof initial;

type SubmissionStatus = "idle" | "sending" | "success" | "error";

export function ContactForm() {
  const [form, setForm] = useState<FormState>(initial);
  const [status, setStatus] = useState<SubmissionStatus>("idle");
  const [message, setMessage] = useState("");

  const update = (key: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to send your message.");
      }

      setStatus("success");
      setMessage(data.message);
      setForm(initial);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Unable to send your message.");
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      <div>
        <label htmlFor="contact-name" className="mb-1.5 block text-sm font-medium text-navy">Full name</label>
        <input id="contact-name" name="name" required maxLength={200} value={form.name} onChange={(event) => update("name", event.target.value)} type="text" autoComplete="name" className="h-11 w-full rounded-md border border-border bg-white px-4 text-sm focus:border-navy focus:ring-1 focus:ring-navy focus:outline-none" />
      </div>
      <div>
        <label htmlFor="contact-email" className="mb-1.5 block text-sm font-medium text-navy">Email</label>
        <input id="contact-email" name="email" required maxLength={320} value={form.email} onChange={(event) => update("email", event.target.value)} type="email" autoComplete="email" className="h-11 w-full rounded-md border border-border bg-white px-4 text-sm focus:border-navy focus:ring-1 focus:ring-navy focus:outline-none" />
      </div>
      <div>
        <label htmlFor="contact-school" className="mb-1.5 block text-sm font-medium text-navy">School <span className="font-normal text-charcoal-light">(optional)</span></label>
        <input id="contact-school" name="school" maxLength={200} value={form.school} onChange={(event) => update("school", event.target.value)} type="text" autoComplete="organization" className="h-11 w-full rounded-md border border-border bg-white px-4 text-sm focus:border-navy focus:ring-1 focus:ring-navy focus:outline-none" />
      </div>
      <div>
        <label htmlFor="contact-subject" className="mb-1.5 block text-sm font-medium text-navy">How can we help?</label>
        <select id="contact-subject" name="subject" required value={form.subject} onChange={(event) => update("subject", event.target.value)} className="h-11 w-full rounded-md border border-border bg-white px-4 text-sm focus:border-navy focus:ring-1 focus:ring-navy focus:outline-none">
          <option value="">Select a subject</option>
          <option value="consultancy">English Department Consultancy</option>
          <option value="pd">Professional Development</option>
          <option value="ai">AI Platform</option>
          <option value="general">General Inquiry</option>
        </select>
      </div>
      <div>
        <label htmlFor="contact-message" className="mb-1.5 block text-sm font-medium text-navy">Message</label>
        <textarea id="contact-message" name="message" required minLength={10} maxLength={5000} value={form.message} onChange={(event) => update("message", event.target.value)} rows={5} className="w-full resize-none rounded-md border border-border bg-white px-4 py-3 text-sm focus:border-navy focus:ring-1 focus:ring-navy focus:outline-none" />
      </div>
      {status === "success" && <p role="status" className="text-sm text-success">{message}</p>}
      {status === "error" && <p role="alert" className="text-sm text-error">{message}</p>}
      <button disabled={status === "sending"} type="submit" className="h-12 w-full rounded-lg bg-navy font-semibold text-white transition-all hover:bg-navy-light disabled:opacity-60">
        {status === "sending" ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
