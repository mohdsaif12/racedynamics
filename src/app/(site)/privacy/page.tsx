import type { Metadata } from "next";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy",
  description: `How ${SITE.name} handles the information you send us.`,
  alternates: { canonical: "/privacy" },
};

/**
 * Reflects what this codebase actually does with visitor data — every claim
 * here should be checked against reality again if the site's data flow
 * changes (a new form, a new third party, an analytics script, etc.).
 * Last reviewed against the code: 2026-09-29.
 */
export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-[1400px] px-5 py-14 lg:px-10">
      <h1 className="display text-[clamp(2.25rem,6vw,4rem)] text-graphite">
        Privacy
      </h1>
      <p className="mt-3 max-w-[60ch] text-[15px] text-slate">
        Last updated 29 September 2026. This page explains what {SITE.name}{" "}
        collects when you use this website, why, and how to get it deleted.
      </p>

      <div className="mt-10 flex max-w-[68ch] flex-col gap-9 text-[15px] leading-relaxed text-body">
        <Section title="WhatsApp enquiries">
          <p>
            When you message us on WhatsApp, whether by tapping a link on this
            site or scanning our number directly, we keep your phone number,
            your name (if you give one or it&rsquo;s attached to your WhatsApp
            profile), and the conversation itself, including anything you tell
            us about the bike you&rsquo;re after, your budget, your city, and
            whether you&rsquo;d like a visit, a call or a test ride.
          </p>
          <p>
            Replies are handled by an AI assistant we run, backed by
            OpenAI&rsquo;s API, so your messages pass through OpenAI to
            generate a response. Our sales team can also read the conversation
            and take over directly. We use this only to answer you, follow up
            on your enquiry, and book an appointment if you ask for one — not
            for advertising, and not shared with anyone outside our own team.
          </p>
        </Section>

        <Section title="Selling us your bike">
          <p>
            The &ldquo;Sell us&rdquo; form asks for your name, phone number,
            email, and details about the bike (model, year, kilometres, the
            price you&rsquo;re expecting, and any notes). We use this to call
            you back with a quote. We don&rsquo;t ask for photos through the
            form on purpose — you send those over WhatsApp instead, the same
            place we&rsquo;ll be talking to you anyway.
          </p>
        </Section>

        <Section title="Appointments">
          <p>
            If you book a showroom visit, a call, or a test ride, we keep the
            date, time, and which bike it&rsquo;s about, tied to your phone
            number, so our team knows to expect you.
          </p>
        </Section>

        <Section title="Cookies and other sites we load">
          <p>
            This site does not run any advertising or analytics trackers. The
            only cookie set for a regular visitor comes from the Google Maps
            embed on the contact page and in the footer — that&rsquo;s
            Google&rsquo;s own cookie, governed by{" "}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-red hover:underline"
            >
              Google&rsquo;s privacy policy
            </a>
            , not ours. Our own staff get a login cookie when they sign in to
            manage the site — that one only applies to our team, not
            customers.
          </p>
        </Section>

        <Section title="Where it's stored">
          <p>
            Enquiries, appointments and chat history are stored in our
            database (Supabase), hosted outside India. Access is restricted to
            our team.
          </p>
        </Section>

        <Section title="What we don't do">
          <p>
            We don&rsquo;t sell your details, and we don&rsquo;t pass them to
            other dealers or marketers. We don&rsquo;t run ads that track you
            across other sites.
          </p>
        </Section>

        <Section title="Deleting your data">
          <p>
            Ask us to delete what we have on you, by WhatsApp, phone, or
            email, and we will. Contact details are on the{" "}
            <a href="/contact" className="text-red hover:underline">
              contact page
            </a>
            .
          </p>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="display text-xl text-graphite">{title}</h2>
      <div className="mt-2.5 flex flex-col gap-3">{children}</div>
    </section>
  );
}
