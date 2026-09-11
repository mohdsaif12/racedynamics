import { getSiteSettings } from "@/lib/data/settings";
import SettingsForm from "./SettingsForm";

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();
  return (
    <div className="mx-auto max-w-xl px-5 py-8 lg:px-10">
      <h1 className="text-2xl font-bold text-graphite">Site settings</h1>
      <p className="mt-1 text-[14px] text-slate">
        Contact details and the numbers shown on the homepage.
      </p>
      <SettingsForm initial={settings} />
    </div>
  );
}
