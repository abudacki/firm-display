import { Clock } from "@/components/Clock";
import { DisplayShell } from "@/components/DisplayShell";
import { EventList } from "@/components/EventList";
import { WeatherCards } from "@/components/WeatherCards";
import { getCalendarEvents } from "@/lib/calendar";
import { getActiveQuote, getAnnouncements, getProfile, getSettings } from "@/lib/db";
import { getWeatherLocations } from "@/lib/weather/provider";

export const revalidate = 60;

export default async function MorningPage() {
  const settings = getSettings();
  const profile = getProfile("morning");
  const quote = getActiveQuote();
  const announcements = getAnnouncements();
  const events = await getCalendarEvents(profile?.calendarIds ?? [], Boolean(profile?.privacySafe ?? 1), 18);
  const weather = await getWeatherLocations(profile?.officeIds ?? []);

  return (
    <DisplayShell settings={settings} backgroundImage={quote.backgroundImage} announcements={announcements} label="Morning Meeting" rotationSeconds={profile?.rotationSeconds}>
      <div className="grid items-center gap-8 xl:grid-cols-[1.05fr_0.95fr]">
        <div>
          <Clock />
          <blockquote className="mt-10 max-w-4xl text-balance text-4xl font-medium leading-tight text-white/88">
            “{quote.text}”
            {quote.attribution ? <footer className="mt-4 text-2xl text-brass">{quote.attribution}</footer> : null}
          </blockquote>
        </div>
        <div className="space-y-5">
          <WeatherCards locations={weather} />
          <div className="rounded-lg border border-white/16 bg-ink/58 p-5 backdrop-blur">
            <h2 className="mb-4 text-3xl font-semibold">Associate calendars</h2>
            <EventList events={events.slice(0, 5)} />
          </div>
        </div>
      </div>
    </DisplayShell>
  );
}
