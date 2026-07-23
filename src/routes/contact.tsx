import { createFileRoute, Link } from "@tanstack/react-router";
import { CONTACT_DETAILS } from "@/lib/constants";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { submitContact } from "@/lib/contact.functions";
import { toast } from "sonner";
import {
  creamTheme,
  Eyebrow,
  FormField,
  PageContainer,
  pageDisplay,
  pageMono,
  Panel,
  PrimaryButton,
  RouteTopbar,
  TextAreaField,
} from "@/components/site/PageShell";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Shafsky Aviation" },
      {
        name: "description",
        content:
          "Speak with Shafsky Aviation's 24/7 concierge desk for charter, cargo, medical evacuation and airport Meet & Greet services across India.",
      },
      { property: "og:title", content: "Contact Shafsky Aviation" },
      {
        property: "og:description",
        content:
          "Reach our 24/7 concierge for charter, cargo, medical and Suswagatam airport services.",
      },
      { property: "og:url", content: "https://aero-launch-sequence.lovable.app/contact" },
    ],
    links: [{ rel: "canonical", href: "https://aero-launch-sequence.lovable.app/contact" }],
  }),
  component: ContactPage,
});

function ContactPage() {
  const submit = useServerFn(submitContact);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    website: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await submit({ data: form });
      setDone(true);
      toast.success("Message received. We'll respond shortly.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <PageContainer>
      <RouteTopbar>
        <Link
          to="/"
          className="text-[10px] uppercase tracking-[0.32em] transition hover:opacity-70"
          style={{ ...pageMono, color: creamTheme.muted }}
        >
          ← Shafsky Aviation
        </Link>
      </RouteTopbar>

      <section className="mt-14">
        <Eyebrow>Concierge Desk</Eyebrow>
        <h1
          className="mt-8 max-w-3xl text-[clamp(3rem,8vw,7rem)] leading-[0.95]"
          style={pageDisplay}
        >
          Talk to <em style={{ color: creamTheme.teal }}>us.</em>
        </h1>
      </section>

      <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-[0.8fr_1.2fr]">
        <Panel className="h-fit space-y-7 text-sm">
          <ContactMeta label="WhatsApp / Call" value={CONTACT_DETAILS.WHATSAPP} />
          <ContactMeta label="Email" value={CONTACT_DETAILS.EMAIL} />
          <ContactMeta label="Head Office" value={CONTACT_DETAILS.OFFICE} />
        </Panel>

        <div className="min-w-0">
          {done ? (
            <Panel className="p-8">
              <h2 className="text-3xl" style={pageDisplay}>
                Thank you.
              </h2>
              <p className="mt-3 text-sm leading-relaxed" style={{ color: creamTheme.muted }}>
                Your message is logged. A team member will reach out within one business hour.
              </p>
            </Panel>
          ) : (
            <form onSubmit={handleSubmit} className="grid gap-6 sm:grid-cols-2">
              <input
                type="text"
                name="website"
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
                className="hidden"
                tabIndex={-1}
                autoComplete="off"
              />
              <FormField
                label="Name"
                value={form.name}
                onChange={(v) => setForm({ ...form, name: v })}
                required
              />
              <FormField
                label="Email"
                type="email"
                value={form.email}
                onChange={(v) => setForm({ ...form, email: v })}
                required
              />
              <FormField
                label="Phone"
                type="tel"
                value={form.phone}
                onChange={(v) => setForm({ ...form, phone: v })}
              />
              <FormField
                label="Subject"
                value={form.subject}
                onChange={(v) => setForm({ ...form, subject: v })}
              />
              <div className="sm:col-span-2">
                <TextAreaField
                  label="Message"
                  value={form.message}
                  onChange={(v) => setForm({ ...form, message: v })}
                  required
                />
              </div>
              <PrimaryButton disabled={busy} className="sm:col-span-2">
                {busy ? "Sending…" : "Send Message"}
              </PrimaryButton>
            </form>
          )}
        </div>
      </div>
    </PageContainer>
  );
}

function ContactMeta({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <div
        className="text-[10px] uppercase tracking-[0.28em]"
        style={{ ...pageMono, color: creamTheme.muted }}
      >
        {label}
      </div>
      <div className="mt-2 break-words text-[16px]" style={{ color: creamTheme.ink }}>
        {value}
      </div>
    </div>
  );
}
