import type { CalendarEvent } from "@/lib/types";

function timeRange(event: CalendarEvent) {
  const start = new Date(event.start);
  const end = new Date(event.end);
  return `${start.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })} - ${end.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
}

export function EventList({ events, large = false }: { events: CalendarEvent[]; large?: boolean }) {
  return (
    <div className="space-y-3">
      {events.map((event) => (
        <article className="grid grid-cols-[10rem_1fr] items-center gap-4 rounded-lg border border-white/14 bg-white/12 p-4 backdrop-blur" key={event.id}>
          <div className="text-lg font-semibold text-brass">{timeRange(event)}</div>
          <div className="min-w-0">
            <div className={large ? "truncate text-3xl font-semibold" : "truncate text-2xl font-semibold"}>{event.subject}</div>
            <div className="mt-1 flex gap-3 text-lg text-white/70">
              <span>{event.calendarName}</span>
              {event.location ? <span>{event.location}</span> : null}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
