import type { Metadata } from "next";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy",
  description: `How ${SITE.name} handles the information you send us.`,
  alternates: { canonical: "/privacy" },
};

/** Skeleton — needs review by the client before launch. */
export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-[1400px] px-5 py-14 lg:px-10">
      <h1 className="display text-[clamp(2.25rem,6vw,4rem)] text-graphite">
        Privacy
      </h1>

      <div className="mt-8 flex max-w-[68ch] flex-col gap-5 text-[15px] leading-relaxed text-body">
        <p>
          When you enquire about a bike or ask us to quote on yours, we keep your
          name, phone number and whatever you send us about the machine. We use
          it to answer you and nothing else.
        </p>
        <p>
          We don&rsquo;t sell your details, and we don&rsquo;t pass them to other
          dealers. Ask us to delete them and we will.
        </p>
      </div>
    </div>
  );
}
