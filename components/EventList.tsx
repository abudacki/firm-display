import type { CSSProperties } from "react";
import type { CalendarEvent } from "@/lib/types";

function timeRange(event: CalendarEvent) {
  if (event.isAllDay) return "All day";
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

function calendarNames(event: CalendarEvent, showLastNameOnly: boolean) {
  const names = event.calendarNames ?? [event.calendarName];
  return names.map((name) => (showLastNameOnly ? lastName(name) : name)).join(", ");
}

function subjectParts(subject: string) {
  const match = subject.match(/^(\[[^\]]+\])\s*(.+)$/);
  if (!match) return { prefix: null, title: subject };
  return { prefix: match[1], title: match[2] };
}

export function EventList({
  events,
  large = false,
  showStartOnly = false,
  showLastNameOnly = false,
  autoScroll = false,
  scrollSeconds,
  scrollSize = "normal"
}: {
  events: CalendarEvent[];
  large?: boolean;
  showStartOnly?: boolean;
  showLastNameOnly?: boolean;
  autoScroll?: boolean;
  scrollSeconds?: number;
  scrollSize?: "normal" | "tall";
}) {
  const renderedEvents = autoScroll && events.length > 4 ? [...events, ...events] : events;
  const scrollStyle = scrollSeconds ? ({ "--event-scroll-duration": `${scrollSeconds}s` } as CSSProperties) : undefined;
  const scrollHeight = scrollSize === "tall" ? "max-h-[70vh]" : "max-h-[38vh]";

  return (
    <div className={autoScroll ? `event-scroll ${scrollHeight} overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_9%,black_91%,transparent)]` : "space-y-3"} style={scrollStyle}>
      <div className={autoScroll && events.length > 4 ? "event-scroll-track space-y-3" : "space-y-3"}>
        {renderedEvents.map((event, index) => {
          const subject = subjectParts(event.subject);
          return (
            <article className="grid grid-cols-[8rem_1fr] items-center gap-4 rounded-lg border border-white/14 bg-white/12 p-4 backdrop-blur" key={`${event.id}-${index}`}>
              <div className="text-lg font-semibold text-brass">{showStartOnly ? startTime(event) : timeRange(event)}</div>
              <div className="min-w-0">
                <div className={large ? "line-clamp-2 text-3xl font-semibold leading-tight" : "line-clamp-2 text-2xl font-semibold leading-tight"}>
                  {subject.prefix ? <span className="mr-2 text-brass">{subject.prefix}</span> : null}
                  {subject.title}
                </div>
                <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-lg text-white/70">
                  <span>{calendarNames(event, showLastNameOnly)}</span>
                  {event.location ? <span>{event.location}</span> : null}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
