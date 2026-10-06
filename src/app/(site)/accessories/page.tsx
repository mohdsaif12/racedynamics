import type { Metadata } from "next";
import Image from "next/image";
import { getAllAccessories } from "@/lib/data/accessories";
import { getSiteSettings } from "@/lib/data/settings";
import { SITE } from "@/lib/site";
import { BoxIcon, ChatIcon, TruckIcon, VerifiedIcon } from "@/components/icons";
import AccessoriesBrowser from "./AccessoriesBrowser";

export const metadata: Metadata = {
  title: "Accessories",
  description: `Riding gear and bike accessories from ${SITE.name}, ${SITE.city} — helmets, riding jackets, gloves, exhausts and more.`,
  alternates: { canonical: "/accessories" },
};

const PROMISES = [
  { icon: VerifiedIcon, title: "100% Genuine", sub: "Parts & Accessories" },
  { icon: TruckIcon, title: "Worldwide Brands", sub: "Top manufacturers" },
  { icon: BoxIcon, title: "In-Stock at Showroom", sub: "Ready for pickup" },
  { icon: ChatIcon, title: "Chat on WhatsApp", sub: "Check size & availability" },
];

export default async function AccessoriesPage() {
  const [accessories, settings] = await Promise.all([
    getAllAccessories(),
    getSiteSettings(),
  ]);

  return (
    <>
      <section className="relative overflow-hidden border-b border-line bg-[linear-gradient(115deg,#ffffff_0%,#f6f6f7_45%,#ececee_100%)]">
        <div className="relative z-10 mx-auto max-w-[1400px] px-5 pb-10 pt-10 sm:pt-12 lg:px-10 lg:pb-12 lg:pt-14">
          <div className="lg:w-[52%] xl:w-[60%]">
            <p className="eyebrow tracking-[0.32em] text-slate">Genuine parts &amp; accessories</p>
            <h1 className="display mt-3 text-[clamp(2.9rem,7.4vw,5.6rem)] font-extrabold italic leading-[0.9] text-graphite">
              Accessories
            </h1>
            <span aria-hidden className="mt-3 block h-[6px] w-[42%] max-w-[13rem] bg-red" />
            <p className="mt-5 max-w-[48ch] text-[16px] leading-relaxed text-body sm:text-[17px]">
              Riding gear and genuine accessories, in stock at the showroom.
              Message us on WhatsApp to check size and availability.
            </p>

            <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-5 lg:mt-10 lg:max-w-[34rem] min-[1440px]:flex min-[1440px]:max-w-none min-[1440px]:gap-0 min-[1440px]:divide-x min-[1440px]:divide-line">
              {PROMISES.map(({ icon: Icon, title, sub }) => (
                <li key={title} className="flex items-center gap-3 min-[1440px]:px-4 min-[1440px]:first:pl-0 2xl:px-5">
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-white text-red shadow-[0_2px_10px_rgba(0,0,0,0.07)]">
                    <Icon size={22} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[13.5px] font-bold leading-tight text-graphite lg:whitespace-nowrap">{title}</span>
                    <span className="mt-0.5 block text-[12px] leading-tight text-slate lg:whitespace-nowrap">{sub}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Full-bleed art: the right half on desktop, a band under the copy
            on phones. Decorative only — the h1 above carries the meaning. */}
        <div
          aria-hidden
          className="relative h-[250px] sm:h-[320px] lg:absolute lg:inset-y-0 lg:right-0 lg:h-auto lg:w-[48%] xl:w-[42%] min-[1440px]:w-[40%]"
        >
          <Image
            src="/accessories-hero-panel.webp"
            alt=""
            fill
            priority
            sizes="(min-width: 1024px) 52vw, 100vw"
            className="object-cover object-left"
          />
          <div className="absolute inset-y-[4%] right-[-8%] w-[82%] lg:inset-y-[8%] lg:right-[-5%] lg:w-[74%]">
            <Image
              src="/bikes/streetfighter-v4-2023.webp"
              alt=""
              fill
              priority
              sizes="(min-width: 1024px) 40vw, 82vw"
              className="-scale-x-100 object-contain drop-shadow-[0_30px_28px_rgba(0,0,0,0.65)]"
            />
          </div>
          <p className="display absolute left-[14%] top-[10%] -rotate-[7deg] text-[clamp(2rem,4.4vw,4.1rem)] font-extrabold italic leading-[0.84] drop-shadow-[0_4px_14px_rgba(0,0,0,0.5)] lg:left-[18%] lg:top-[12%]">
            <span className="block text-white">Ride</span>
            <span className="block pl-[0.35em] text-red">Equip</span>
            <span className="block pl-[0.7em] text-white/85">Upgrade</span>
          </p>
        </div>
      </section>

      <AccessoriesBrowser accessories={accessories} settings={settings} />
    </>
  );
}
