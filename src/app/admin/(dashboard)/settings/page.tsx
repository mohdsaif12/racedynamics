import { getSiteSettings } from "@/lib/data/settings";
import { getN8nBookingWebhook } from "@/lib/admin/integrations";
import SettingsForm from "./SettingsForm";
import N8nWebhookForm from "./N8nWebhookForm";
import LogoForm from "./LogoForm";
import ChangePasswordForm from "./ChangePasswordForm";

export default async function AdminSettingsPage() {
  const [settings, webhookUrl] = await Promise.all([
    getSiteSettings(),
    getN8nBookingWebhook(),
  ]);
  return (
    <div className="mx-auto max-w-xl px-5 py-8 lg:px-10">
      <h1 className="text-2xl font-bold text-graphite">Site settings</h1>
      <p className="mt-1 text-[14px] text-slate">
        Logo, phone numbers, contact details, your password and integrations.
      </p>
      <LogoForm initialPath={settings.logoPath} initialUrl={settings.logoUrl} />
      <ChangePasswordForm />
      <N8nWebhookForm initialUrl={webhookUrl} />
      <SettingsForm initial={settings} />
    </div>
  );
}
