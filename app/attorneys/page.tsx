import { DisplayShell } from "@/components/DisplayShell";
import { EventList } from "@/components/EventList";
import { getCalendarEvents } from "@/lib/calendar";
import { getAnnouncements, getProfile, getSettings } from "@/lib/db";

export const revalidate = 60;

export default async function AttorneysPage() {
  const settings = getSettings();
  const profile = getProfile("attorneys");
  const events = await getCalendarEvents(profile?.calendarIds ?? [], Boolean(profile?.privacySafe ?? 1), 18);
  const rotationSeconds = profile?.rotationSeconds ?? Number(process.env.DISPLAY_REFRESH_SECONDS ?? 60);
  const scrollSeconds = Math.max(20, rotationSeconds - 5);

  return (
    <DisplayShell settings={settings} announcements={getAnnouncements()} label="Attorney Calendar" rotationSeconds={profile?.rotationSeconds}>
      <div className="grid gap-8 lg:grid-cols-[0.45fr_1fr]">
        <div className="flex flex-col justify-center">
          <p className="text-2xl font-semibold uppercase tracking-[0.22em] text-brass">Today</p>
          <h1 className="mt-4 text-7xl font-semibold leading-none">Upcoming attorney events</h1>
          <p className="mt-6 max-w-xl text-2xl leading-snug text-white/74">Privacy-safe mode can reduce private matters to a simple busy status.</p>
        </div>
        <div className="rounded-lg border border-white/16 bg-ink/58 p-5 backdrop-blur">
          <EventList events={events} large autoScroll scrollSeconds={scrollSeconds} scrollSize="tall" />
        </div>
      </div>
    </DisplayShell>
  );
}
