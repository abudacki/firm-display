import { Megaphone } from "lucide-react";
import { DisplayShell } from "@/components/DisplayShell";
import { getAnnouncements, getProfile, getSettings } from "@/lib/db";

export const revalidate = 60;

export default function AnnouncementsPage() {
  const settings = getSettings();
  const announcements = getAnnouncements();
  const urgent = announcements.find((announcement) => announcement.urgent);
  const profile = getProfile("announcements");

  return (
    <DisplayShell settings={settings} backgroundImage={settings.announcementsBackgroundImage || undefined} announcements={announcements} label="Announcements" rotationSeconds={profile?.rotationSeconds}>
      <div className="mx-auto w-full max-w-6xl">
        {urgent ? (
          <section className="mb-6 rounded-lg bg-berry p-7 shadow-display">
            <p className="text-xl font-semibold uppercase tracking-[0.22em] text-white/75">Urgent</p>
            <h1 className="mt-3 text-6xl font-semibold">{urgent.title}</h1>
            <p className="mt-4 text-3xl leading-snug">{urgent.body}</p>
          </section>
        ) : null}
        <div className="grid gap-5 md:grid-cols-2">
          {announcements.map((announcement) => (
            <article className="rounded-lg border border-white/16 bg-white/12 p-7 backdrop-blur" key={announcement.id}>
              <div className="flex items-start gap-4">
                <Megaphone className="mt-1 h-8 w-8 shrink-0 text-brass" />
                <div>
                  <p className="text-lg font-semibold uppercase tracking-[0.18em] text-white/58">{announcement.office ?? "All Offices"}</p>
                  <h2 className="mt-2 text-4xl font-semibold">{announcement.title}</h2>
                  <p className="mt-4 text-2xl leading-snug text-white/78">{announcement.body}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </DisplayShell>
  );
}
