"use client";

import { useState } from "react";
import { ImageUp, Save, Settings, Quote as QuoteIcon, Megaphone, Monitor } from "lucide-react";
import type { Announcement, DisplayProfile, DisplaySettings, Quote } from "@/lib/types";

const imageSettings: Array<{ key: keyof DisplaySettings; label: string }> = [
  { key: "logoImage", label: "Firm logo" },
  { key: "defaultBackgroundImage", label: "Default background" },
  { key: "morningBackgroundImage", label: "Morning page background" },
  { key: "attorneysBackgroundImage", label: "Attorney page background" },
  { key: "roomsBackgroundImage", label: "Conference room background" },
  { key: "announcementsBackgroundImage", label: "Announcements background" }
];

export function AdminConsole({
  initialSettings,
  initialQuotes,
  initialAnnouncements,
  initialProfiles
}: {
  initialSettings: DisplaySettings;
  initialQuotes: Quote[];
  initialAnnouncements: Announcement[];
  initialProfiles: DisplayProfile[];
}) {
  const [settings, setSettings] = useState(initialSettings);
  const [profiles, setProfiles] = useState(initialProfiles);
  const [saved, setSaved] = useState("");

  async function post(url: string, body: unknown) {
    const response = await fetch(url, { method: "POST", body: JSON.stringify(body), headers: { "Content-Type": "application/json" } });
    if (!response.ok) throw new Error("Save failed");
    setSaved("Saved");
    window.setTimeout(() => setSaved(""), 1800);
  }

  async function uploadAsset(file: File, settingKey: keyof DisplaySettings) {
    const form = new FormData();
    form.append("file", file);
    const response = await fetch("/api/admin/backgrounds", { method: "POST", body: form });
    const json = (await response.json()) as { path?: string };
    if (!json.path) {
      setSaved("Upload failed");
      return;
    }
    const nextSettings = { ...settings, [settingKey]: json.path };
    setSettings(nextSettings);
    await post("/api/admin/settings", nextSettings);
    setSaved(`Uploaded ${json.path}`);
  }

  return (
    <main className="min-h-screen bg-linen px-6 py-8 text-ink">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cypress">Admin</p>
            <h1 className="mt-2 text-4xl font-semibold">Firm display controls</h1>
          </div>
          <span className="min-h-6 font-semibold text-cypress">{saved}</span>
        </header>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-lg border border-ink/10 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-2xl font-semibold"><Settings className="h-5 w-5" />General</h2>
            <div className="mt-5 grid gap-4">
              <label className="grid gap-2 font-medium">
                Firm name
                <input className="rounded-md border border-ink/20 px-3 py-2" value={settings.firmName} onChange={(event) => setSettings({ ...settings, firmName: event.target.value })} />
              </label>
              <label className="grid gap-2 font-medium">
                Default background path
                <input className="rounded-md border border-ink/20 px-3 py-2" value={settings.defaultBackgroundImage} onChange={(event) => setSettings({ ...settings, defaultBackgroundImage: event.target.value })} />
              </label>
              <label className="grid gap-2 font-medium">
                Support message
                <input className="rounded-md border border-ink/20 px-3 py-2" value={settings.supportMessage} onChange={(event) => setSettings({ ...settings, supportMessage: event.target.value })} />
              </label>
              <button className="flex w-fit items-center gap-2 rounded-md bg-cypress px-4 py-2 font-semibold text-white" onClick={() => post("/api/admin/settings", settings)}>
                <Save className="h-4 w-4" /> Save settings
              </button>
            </div>
          </div>

          <div
            className="rounded-lg border border-ink/10 bg-white p-6 shadow-sm"
          >
            <h2 className="flex items-center gap-2 text-2xl font-semibold"><ImageUp className="h-5 w-5" />Images and logo</h2>
            <div className="mt-5 grid gap-3">
              {imageSettings.map(({ key, label }) => (
                <label className="grid gap-2 rounded-md border border-ink/10 p-3 font-medium" key={key}>
                  {label}
                  <input
                    className="rounded-md border border-ink/20 px-3 py-2"
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) void uploadAsset(file, key);
                      event.currentTarget.value = "";
                    }}
                  />
                  <input
                    className="rounded-md border border-ink/20 px-3 py-2 text-sm"
                    value={settings[key]}
                    onChange={(event) => setSettings({ ...settings, [key]: event.target.value })}
                    placeholder="/uploads/image.svg"
                  />
                </label>
              ))}
            </div>
          </div>

          <form
            className="rounded-lg border border-ink/10 bg-white p-6 shadow-sm"
            onSubmit={async (event) => {
              event.preventDefault();
              const form = new FormData(event.currentTarget);
              await post("/api/admin/quotes", Object.fromEntries(form));
              event.currentTarget.reset();
            }}
          >
            <h2 className="flex items-center gap-2 text-2xl font-semibold"><QuoteIcon className="h-5 w-5" />Quotes</h2>
            <div className="mt-5 grid gap-4">
              <textarea className="min-h-28 rounded-md border border-ink/20 px-3 py-2" name="text" placeholder="Quote text" required />
              <input className="rounded-md border border-ink/20 px-3 py-2" name="attribution" placeholder="Attribution" />
              <input className="rounded-md border border-ink/20 px-3 py-2" name="backgroundImage" placeholder="/backgrounds/library.svg" />
              <button className="flex w-fit items-center gap-2 rounded-md bg-cypress px-4 py-2 font-semibold text-white">
                <Save className="h-4 w-4" /> Add quote
              </button>
            </div>
            <div className="mt-5 max-h-40 overflow-auto text-sm text-ink/70">
              {initialQuotes.map((quote) => <div key={quote.id}>{quote.text} {quote.attribution ? `- ${quote.attribution}` : ""}</div>)}
            </div>
          </form>

          <form
            className="rounded-lg border border-ink/10 bg-white p-6 shadow-sm"
            onSubmit={async (event) => {
              event.preventDefault();
              const form = new FormData(event.currentTarget);
              await post("/api/admin/announcements", { ...Object.fromEntries(form), urgent: form.get("urgent") === "on" });
              event.currentTarget.reset();
            }}
          >
            <h2 className="flex items-center gap-2 text-2xl font-semibold"><Megaphone className="h-5 w-5" />Announcements</h2>
            <div className="mt-5 grid gap-4">
              <input className="rounded-md border border-ink/20 px-3 py-2" name="title" placeholder="Title" required />
              <textarea className="min-h-24 rounded-md border border-ink/20 px-3 py-2" name="body" placeholder="Message" required />
              <input className="rounded-md border border-ink/20 px-3 py-2" name="office" placeholder="Office or All Offices" />
              <label className="flex items-center gap-2 font-medium"><input type="checkbox" name="urgent" /> Urgent banner</label>
              <button className="flex w-fit items-center gap-2 rounded-md bg-cypress px-4 py-2 font-semibold text-white">
                <Save className="h-4 w-4" /> Add announcement
              </button>
            </div>
            <div className="mt-5 max-h-40 overflow-auto text-sm text-ink/70">
              {initialAnnouncements.map((announcement) => <div key={announcement.id}>{announcement.title}: {announcement.body}</div>)}
            </div>
          </form>

          <div className="rounded-lg border border-ink/10 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-2xl font-semibold"><Monitor className="h-5 w-5" />Display profiles</h2>
            <div className="mt-5 grid gap-4">
              {profiles.map((profile, index) => (
                <div className="rounded-md border border-ink/10 p-4" key={profile.id}>
                  <div className="grid gap-3 md:grid-cols-2">
                    <input className="rounded-md border border-ink/20 px-3 py-2 font-semibold" value={profile.name} onChange={(event) => {
                      const next = [...profiles];
                      next[index] = { ...profile, name: event.target.value };
                      setProfiles(next);
                    }} />
                    <label className="grid gap-1">
                      <input className="rounded-md border border-ink/20 px-3 py-2" value={profile.calendarIds} onChange={(event) => {
                        const next = [...profiles];
                        next[index] = { ...profile, calendarIds: event.target.value };
                        setProfiles(next);
                      }} />
                      <span className="text-sm text-ink/62">Use comma-separated Microsoft 365 mailbox addresses.</span>
                    </label>
                    <input className="rounded-md border border-ink/20 px-3 py-2" type="number" min="10" value={profile.rotationSeconds} onChange={(event) => {
                      const next = [...profiles];
                      next[index] = { ...profile, rotationSeconds: Number(event.target.value) };
                      setProfiles(next);
                    }} />
                    <label className="flex items-center gap-2 font-medium"><input type="checkbox" checked={Boolean(profile.privacySafe)} onChange={(event) => {
                      const next = [...profiles];
                      next[index] = { ...profile, privacySafe: event.target.checked ? 1 : 0 };
                      setProfiles(next);
                    }} /> Privacy-safe</label>
                  </div>
                  <button className="mt-3 flex w-fit items-center gap-2 rounded-md bg-cypress px-4 py-2 font-semibold text-white" type="button" onClick={() => post("/api/admin/display-profiles", { ...profile, calendarIds: profile.calendarIds.trim() })}>
                    <Save className="h-4 w-4" /> Save profile
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
