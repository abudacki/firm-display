import { Building2 } from "lucide-react";
import { DisplayShell } from "@/components/DisplayShell";
import { EventList } from "@/components/EventList";
import { getCalendarEvents, getCurrentAndNext } from "@/lib/calendar";
import { getAnnouncements, getProfile, getSettings } from "@/lib/db";

export const revalidate = 60;

export default async function RoomPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = await params;
  const settings = getSettings();
  const profile = getProfile(roomId) ?? getProfile("main-conference");
  const calendarIds = profile?.roomMailbox ? [profile.roomMailbox] : profile?.calendarIds ?? [roomId];
  const events = await getCalendarEvents(calendarIds, Boolean(profile?.privacySafe ?? 1), 18);
  const { current, next } = getCurrentAndNext(events);
  const available = !current;

  return (
    <DisplayShell settings={settings} announcements={getAnnouncements()} label={profile?.name ?? "Conference Room"} rotationSeconds={profile?.rotationSeconds}>
      <div className="grid items-center gap-8 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-lg border border-white/16 bg-ink/62 p-8 shadow-display backdrop-blur">
          <div className="flex items-center gap-4">
            <Building2 className="h-12 w-12 text-brass" />
            <div>
              <p className="text-2xl text-white/68">Room status</p>
              <h1 className={available ? "text-7xl font-semibold text-emerald-200" : "text-7xl font-semibold text-brass"}>{available ? "Available" : "In use"}</h1>
            </div>
          </div>
          <div className="mt-10 grid gap-5">
            <section className="rounded-lg bg-white/10 p-5">
              <p className="text-xl uppercase tracking-[0.2em] text-white/58">Current meeting</p>
              <h2 className="mt-3 text-4xl font-semibold">{current?.subject ?? "No current meeting"}</h2>
              {current?.location ? <p className="mt-2 text-xl text-white/68">{current.location}</p> : null}
            </section>
            <section className="rounded-lg bg-white/10 p-5">
              <p className="text-xl uppercase tracking-[0.2em] text-white/58">Next meeting</p>
              <h2 className="mt-3 text-4xl font-semibold">{next?.subject ?? "Open for the rest of the day"}</h2>
              {next ? <p className="mt-2 text-xl text-brass">{new Date(next.start).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</p> : null}
            </section>
          </div>
        </div>
        <div className="rounded-lg border border-white/16 bg-ink/58 p-5 backdrop-blur">
          <h2 className="mb-4 text-3xl font-semibold">Room timeline</h2>
          <EventList events={events.slice(0, 8)} large />
          <p className="mt-5 text-xl text-white/70">{settings.supportMessage}</p>
        </div>
      </div>
    </DisplayShell>
  );
}
