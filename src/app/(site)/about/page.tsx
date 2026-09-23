import type { Metadata } from "next";
import NextImage from "next/image";
import Link from "next/link";
import { SITE } from "@/lib/site";
import { ChecklistIcon, PaperworkIcon, SoldBadgeIcon, SpecsIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "About Us",
  description: `Lucknow’s Destination for Superbikes & Premium Motorcycles. Established in 2014. Pan-India Delivery.`,
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <article className="mx-auto max-w-[1200px] px-5 py-14 lg:px-10">
      {/* Editorial Header */}
      <header className="mx-auto max-w-3xl text-center">
        <span className="eyebrow text-red tracking-[0.2em]">ESTABLISHED 2014 · LUCKNOW</span>
        <h1 className="display mt-3 text-[clamp(2.25rem,5vw,3.75rem)] text-graphite leading-[1.15]">
          Lucknow’s Destination for Superbikes & Premium Motorcycles
        </h1>
        <p className="mt-5 text-[18px] font-medium leading-relaxed text-slate">
          Since 2014, Race Dynamics has been driven by one thing — a genuine passion for exceptional motorcycles.
        </p>
      </header>

      {/* Main Showcase Banner */}
      <div className="mt-12 overflow-hidden border border-line bg-mist shadow-sm aspect-[16/9] lg:aspect-[21/9] relative">
        <NextImage
          src="/about/workshop.webp"
          alt={`Inside the ${SITE.name} showroom and workshop in ${SITE.city}`}
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
      </div>

      {/* Key Pillars Bar */}
      <div className="mt-10 grid grid-cols-2 gap-4 border-y border-line py-6 sm:grid-cols-4 text-center">
        <div>
          <span className="block text-2xl font-bold text-red">2014</span>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate">Established</span>
        </div>
        <div>
          <span className="block text-2xl font-bold text-graphite">Pan-India</span>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate">Safe Delivery</span>
        </div>
        <div>
          <span className="block text-2xl font-bold text-graphite">100%</span>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate">Evaluated Bikes</span>
        </div>
        <div>
          <span className="block text-2xl font-bold text-graphite">Full</span>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate">Ownership Support</span>
        </div>
      </div>

      {/* Unified Reading Stream */}
      <div className="mx-auto mt-14 max-w-3xl space-y-12 text-[17px] leading-[1.85] text-body">
        {/* Section 1 */}
        <section className="space-y-4">
          <p>
            Over the years, we have grown from a motorcycle enthusiast’s dream into one of the leading destinations for superbikes and premium pre-owned motorcycles in Lucknow, serving riders across India.
          </p>
          <p>
            From iconic superbikes and performance motorcycles to carefully selected premium pre-owned machines, we bring together motorcycles that stand out for their performance, character and desirability.
          </p>
          <p>
            And with <strong>Pan-India delivery</strong>, your next dream motorcycle is never too far away.
          </p>
        </section>

        {/* Section 2 */}
        <section className="border-l-4 border-red pl-6 py-2 bg-paper border-r border-t border-b border-line">
          <h2 className="display text-2xl text-graphite mb-3">
            More Than a Motorcycle Dealership
          </h2>
          <p className="text-[16px] text-body">
            We believe buying a superbike should feel as special as riding one. That’s why we focus on offering our customers a complete experience — from helping you find the right motorcycle to making the purchase process smooth, transparent and hassle-free.
          </p>
          <p className="mt-3 text-[16px] text-body">
            Every motorcycle is carefully evaluated based on its condition, authenticity, history and overall value, so you can make your decision with confidence. Whether you’re upgrading to your first superbike, adding another machine to your collection or looking for a premium pre-owned motorcycle, our team is here to help you find the right ride.
          </p>
        </section>

        {/* Section 3 */}
        <section className="space-y-4">
          <h2 className="display text-2xl lg:text-3xl text-graphite">
            Superbikes. Premium Bikes. Delivered Across India.
          </h2>
          <p>
            Our collection features motorcycles from some of the world’s most sought-after performance and premium brands. Whether you’re in Lucknow, Delhi, Mumbai, Bengaluru, Hyderabad, Chennai, Kolkata or anywhere else in India, Race Dynamics can help bring your motorcycle to you.
          </p>
          <div className="bg-mist p-6 border border-line mt-4">
            <h3 className="font-bold text-graphite text-lg mb-2">Pan-India Delivery</h3>
            <p className="text-[15.5px]">
              Found your dream bike but you’re miles away from Lucknow? We’ve got you covered. We arrange safe and reliable Pan-India motorcycle delivery, making it easier for riders across the country to own a motorcycle from Race Dynamics. From our showroom to your doorstep, we take care of the logistics so you can focus on what matters — your next ride.
            </p>
          </div>
        </section>

        {/* Section 4 */}
        <section className="space-y-4">
          <h2 className="display text-2xl lg:text-3xl text-graphite">
            Built on Trust Since 2014
          </h2>
          <p>
            Buying a pre-owned superbike is a significant decision. We understand that. That’s why our business has always been built around trust, transparency and long-term relationships.
          </p>
          <p>
            We don’t just want to sell you a motorcycle. We want you to feel confident about the motorcycle you are buying and the people you are buying it from. Our customers come to us not only from Lucknow, but from across India — and many return to us when it’s time for their next motorcycle.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-4">
          <h2 className="display text-2xl lg:text-3xl text-graphite">
            The Race Dynamics Experience
          </h2>
          <p>
            Our relationship with a customer doesn’t end when the keys are handed over. From motorcycle sales and purchase to riding gear, accessories, customization, servicing and maintenance, Race Dynamics is built to support the complete ownership experience.
          </p>
          <p className="font-semibold text-graphite">
            Because when you’re passionate about motorcycles, one bike is rarely enough.
          </p>
        </section>

        {/* Manifesto Card (Centered inside max-w-3xl) */}
        <section className="mt-12 bg-ink text-white p-8 lg:p-12 text-center relative overflow-hidden">
          <span
            aria-hidden
            className="ghost-word absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-[clamp(4rem,14vw,11rem)] font-extrabold uppercase tracking-widest text-white/[0.04] pointer-events-none select-none"
          >
            RACE DYNAMICS
          </span>
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="display text-2xl lg:text-3xl text-white mb-4 uppercase tracking-wide">
              For Riders Who Want More
            </h2>
            <p className="text-[16.5px] leading-relaxed text-ash mb-6">
              A superbike isn’t just transportation.<br />
              It’s the sound of the engine. It’s the acceleration. It’s the attention.<br />
              It’s the freedom of an open road. It’s the feeling you get every time you turn the key.
            </p>
            <p className="text-[15.5px] text-ash/80 italic mb-8">
              We understand that feeling — because we’re riders too. For more than a decade, Race Dynamics has been helping motorcycle enthusiasts find machines worth getting excited about.
            </p>

            <div className="pt-6 border-t border-line-dark text-xs font-semibold tracking-widest uppercase text-red mb-6">
              Race Dynamics · Established 2014 · Lucknow, India
            </div>

            <Link href="/inventory" className="btn-red hover:bg-red-dark">
              Explore Superbikes Collection
            </Link>
          </div>
        </section>
      </div>
    </article>
  );
}


