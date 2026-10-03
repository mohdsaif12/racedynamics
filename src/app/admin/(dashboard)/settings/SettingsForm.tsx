"use client";

import { useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import type { PhoneGroup, SiteSettings } from "@/lib/data/types";
import { revalidateSite } from "../../actions";

export default function SettingsForm({ initial }: { initial: SiteSettings }) {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const set = <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    // Blank rows are what "add number" leaves behind if nothing gets typed
    // in — drop them rather than saving an empty line to the footer.
    const phoneGroups = form.phoneGroups
      .map((g) => ({
        label: g.label.trim(),
        numbers: g.numbers.map((n) => n.trim()).filter(Boolean),
      }))
      .filter((g) => g.numbers.length > 0);

    const supabase = getSupabaseBrowser();
    const { error } = await supabase
      .from("site_settings")
      .update({
        phone_primary: form.phonePrimary,
        phone_secondary: form.phoneSecondary,
        phone_groups: phoneGroups,
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
      alert(
        error.message.includes("phone_groups")
          ? "The database needs updating before phone groups can be saved (supabase/migrations/0014_phone_groups_and_logo.sql)."
          : "Couldn't save. Check your connection and try again.",
      );
      return;
    }
    setSaved(true);
    await revalidateSite();
  };

  return (
    <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-6">
      <Section title="Contact">
        <Field label="Main number (used by the floating Call button)">
          <Input value={form.phonePrimary} onChange={(v) => set("phonePrimary", v)} />
        </Field>
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

      <Section title="Phone numbers">
        <p className="-mt-2 mb-4 text-[13px] text-slate">
          Shown in the footer and on the Contact page, grouped by what each
          line is for. Add as many groups and numbers as you need.
        </p>
        <PhoneGroupsEditor
          groups={form.phoneGroups}
          onChange={(groups) => set("phoneGroups", groups)}
        />
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

function PhoneGroupsEditor({
  groups,
  onChange,
}: {
  groups: PhoneGroup[];
  onChange: (groups: PhoneGroup[]) => void;
}) {
  const update = (i: number, patch: Partial<PhoneGroup>) =>
    onChange(groups.map((g, j) => (j === i ? { ...g, ...patch } : g)));

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= groups.length) return;
    const next = [...groups];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-4">
      {groups.map((g, i) => (
        <div key={i} className="rounded-xl border border-line p-4">
          <div className="flex items-end gap-2">
            <Field label="Group name" className="flex-1">
              <Input
                value={g.label}
                onChange={(v) => update(i, { label: v })}
                placeholder="e.g. Sales team"
              />
            </Field>
            <IconButton label="Move up" onClick={() => move(i, -1)} disabled={i === 0}>
              ↑
            </IconButton>
            <IconButton label="Move down" onClick={() => move(i, 1)} disabled={i === groups.length - 1}>
              ↓
            </IconButton>
            <IconButton
              label="Remove group"
              onClick={() => {
                if (confirm(`Remove "${g.label || "this group"}" and its numbers?`)) {
                  onChange(groups.filter((_, j) => j !== i));
                }
              }}
            >
              ✕
            </IconButton>
          </div>

          <div className="mt-3 flex flex-col gap-2">
            {g.numbers.map((n, k) => (
              <div key={k} className="flex gap-2">
                <input
                  value={n}
                  onChange={(e) =>
                    update(i, {
                      numbers: g.numbers.map((x, m) => (m === k ? e.target.value : x)),
                    })
                  }
                  type="tel"
                  placeholder="+91 98765 43210"
                  aria-label={`${g.label || "Group"} number ${k + 1}`}
                  className={inputClass}
                />
                <IconButton
                  label="Remove number"
                  onClick={() => update(i, { numbers: g.numbers.filter((_, m) => m !== k) })}
                >
                  ✕
                </IconButton>
              </div>
            ))}
            <button
              type="button"
              onClick={() => update(i, { numbers: [...g.numbers, ""] })}
              className="self-start text-[13px] font-bold text-red hover:underline"
            >
              + Add number
            </button>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={() => onChange([...groups, { label: "", numbers: [""] }])}
        className="rounded-xl border-2 border-dashed border-line py-3 text-[14px] font-bold text-graphite transition-colors hover:border-red hover:text-red"
      >
        + Add group
      </button>
    </div>
  );
}

function IconButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="grid size-[50px] shrink-0 place-items-center rounded-xl border border-line text-[15px] font-bold text-slate transition-colors hover:border-red hover:text-red disabled:opacity-30 disabled:hover:border-line disabled:hover:text-slate"
    >
      {children}
    </button>
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
