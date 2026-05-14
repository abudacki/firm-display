import type { CalendarEvent } from "@/lib/types";

function timeRange(event: CalendarEvent) {
  const start = new Date(event.start);
  const end = new Date(event.end);
  return `${start.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })} - ${end.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
}

function startTime(event: CalendarEvent) {
  if (event.isAllDay) return "All day";
  return new Date(event.start).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function lastName(name: string) {
  const localName = name.includes("@") ? name.split("@")[0] ?? name : name;
  const parts = localName.split(/[ ._-]/).filter(Boolean);
  return parts.at(-1) ?? localName;
}

export function EventList({
  events,
  large = false,
  showStartOnly = false,
  showLastNameOnly = false,
  autoScroll = false
}: {
  events: CalendarEvent[];
  large?: boolean;
  showStartOnly?: boolean;
  showLastNameOnly?: boolean;
  autoScroll?: boolean;
}) {
  const renderedEvents = autoScroll && events.length > 4 ? [...events, ...events] : events;

  return (
    <div className={autoScroll ? "event-scroll max-h-[38vh] overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_9%,black_91%,transparent)]" : "space-y-3"}>
      <div className={autoScroll && events.length > 4 ? "event-scroll-track space-y-3" : "space-y-3"}>
        {renderedEvents.map((event, index) => (
          <article className="grid grid-cols-[8rem_1fr] items-center gap-4 rounded-lg border border-white/14 bg-white/12 p-4 backdrop-blur" key={`${event.id}-${index}`}>
            <div className="text-lg font-semibold text-brass">{showStartOnly ? startTime(event) : timeRange(event)}</div>
            <div className="min-w-0">
              <div className={large ? "truncate text-3xl font-semibold" : "truncate text-2xl font-semibold"}>{event.subject}</div>
              <div className="mt-1 flex gap-3 text-lg text-white/70">
                <span>{showLastNameOnly ? lastName(event.calendarName) : event.calendarName}</span>
                {event.location ? <span>{event.location}</span> : null}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
