import type { Metadata } from "next";
import { getAllAccessories } from "@/lib/data/accessories";
import { getSiteSettings } from "@/lib/data/settings";
import { SITE } from "@/lib/site";
import AccessoriesBrowser from "./AccessoriesBrowser";

export const metadata: Metadata = {
  title: "Accessories",
  description: `Riding gear and bike accessories from ${SITE.name}, ${SITE.city} — helmets, riding jackets, gloves and more.`,
};

export default async function AccessoriesPage() {
  const [accessories, settings] = await Promise.all([
    getAllAccessories(),
    getSiteSettings(),
  ]);

  return (
    <div className="mx-auto max-w-[1400px] px-5 py-14 lg:px-10">
      <h1 className="display text-[clamp(2.25rem,6vw,4rem)] text-graphite">
        Accessories
      </h1>
      <p className="mt-4 max-w-[52ch] text-[17px] text-body">
        Riding gear and genuine accessories, in stock at the showroom. Message
        us on WhatsApp to check size and availability.
      </p>

      <AccessoriesBrowser accessories={accessories} settings={settings} />
    </div>
  );
}
