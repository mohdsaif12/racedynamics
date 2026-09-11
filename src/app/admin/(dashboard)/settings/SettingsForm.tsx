"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import type { SiteSettings } from "@/lib/data/types";
import { revalidateSite } from "../../actions";

export default function SettingsForm({ initial }: { initial: SiteSettings }) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const set = <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    const supabase = getSupabaseBrowser();
    const { error } = await supabase
      .from("site_settings")
      .update({
        phone_primary: form.phonePrimary,
        phone_secondary: form.phoneSecondary,
        whatsapp: form.whatsapp,
        email: form.email,
        address: form.address,
        tagline: form.tagline,
        description: form.description,
        stat_bikes_sold: form.stats.bikesSold,
        stat_years_trading: form.stats.yearsTrading,
        stat_cities: form.stats.cities,
        stat_avg_days: form.stats.avgDays,
        instagram_url: form.social.instagram,
        facebook_url: form.social.facebook,
        youtube_url: form.social.youtube,
      })
      .eq("id", 1);

    setSaving(false);
    if (error) {
      alert("Couldn't save. Check your connection and try again.");
      return;
    }
    setSaved(true);
    await revalidateSite();
    router.refresh();
  };

  return (
    <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-6">
      <Section title="Contact">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Primary phone">
            <Input value={form.phonePrimary} onChange={(v) => set("phonePrimary", v)} />
          </Field>
          <Field label="Secondary phone">
            <Input value={form.phoneSecondary} onChange={(v) => set("phoneSecondary", v)} />
          </Field>
        </div>
        <Field label="WhatsApp number (digits only, with country code)" className="mt-4">
          <Input value={form.whatsapp} onChange={(v) => set("whatsapp", v)} placeholder="919000000000" />
        </Field>
        <Field label="Email" className="mt-4">
          <Input value={form.email} onChange={(v) => set("email", v)} type="email" />
        </Field>
        <Field label="Address" className="mt-4">
          <Input value={form.address} onChange={(v) => set("address", v)} />
        </Field>
      </Section>

      <Section title="Homepage stats">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Field label="Bikes sold">
            <Input
              value={String(form.stats.bikesSold)}
              onChange={(v) => set("stats", { ...form.stats, bikesSold: Number(v) || 0 })}
              type="number"
            />
          </Field>
          <Field label="Years trading">
            <Input
              value={String(form.stats.yearsTrading)}
              onChange={(v) => set("stats", { ...form.stats, yearsTrading: Number(v) || 0 })}
              type="number"
            />
          </Field>
          <Field label="Cities">
            <Input
              value={String(form.stats.cities)}
              onChange={(v) => set("stats", { ...form.stats, cities: Number(v) || 0 })}
              type="number"
            />
          </Field>
          <Field label="Avg. days to sell">
            <Input
              value={String(form.stats.avgDays)}
              onChange={(v) => set("stats", { ...form.stats, avgDays: Number(v) || 0 })}
              type="number"
            />
          </Field>
        </div>
      </Section>

      <Section title="Social links">
        <div className="flex flex-col gap-4">
          <Field label="Instagram">
            <Input value={form.social.instagram} onChange={(v) => set("social", { ...form.social, instagram: v })} />
          </Field>
          <Field label="Facebook">
            <Input value={form.social.facebook} onChange={(v) => set("social", { ...form.social, facebook: v })} />
          </Field>
          <Field label="YouTube">
            <Input value={form.social.youtube} onChange={(v) => set("social", { ...form.social, youtube: v })} />
          </Field>
        </div>
      </Section>

      {/* Sticky for the same reason as the bike form — see BikeForm.tsx. */}
      <div className="sticky bottom-16 z-30 -mx-5 flex items-center gap-4 border-t border-line bg-mist/95 px-5 py-4 backdrop-blur lg:bottom-0 lg:-mx-10 lg:px-10">
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-red px-8 py-3.5 text-[15px] font-bold text-white transition-colors hover:bg-red-dark disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save"}
        </button>
        {saved && <span className="text-[14px] font-semibold text-red">Saved.</span>}
      </div>
    </form>
  );
}

const inputClass =
  "w-full rounded-xl border border-line bg-white px-4 py-3 text-[15px] text-graphite outline-none focus:border-red";

function Input({
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={inputClass}
    />
  );
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`flex flex-col gap-1.5 ${className}`}>
      <span className="text-[13px] font-semibold text-slate">{label}</span>
      {children}
    </label>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="text-[13px] font-bold uppercase tracking-wide text-slate">
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </div>
  );
}
