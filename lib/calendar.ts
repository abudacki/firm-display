import { getGraphCalendarView, hasGraphConfig } from "./graph/client";
import type { CalendarEvent } from "./types";

const names: Record<string, string> = {
  "alex.rivera": "Alex Rivera",
  "jordan.lee": "Jordan Lee",
  "morgan.patel": "Morgan Patel",
  "main-conference-room": "Main Conference"
};

const defaultMockCalendarIds = ["alex.rivera", "jordan.lee", "morgan.patel"];

function parseCalendarIds(calendarIds: string | string[]) {
  const value = Array.isArray(calendarIds) ? calendarIds.join(",") : calendarIds;
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function atToday(hours: number, minutes = 0) {
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date.toISOString();
}

function addMinutes(iso: string, minutes: number) {
  return new Date(new Date(iso).getTime() + minutes * 60_000).toISOString();
}

function mockEvents(calendarIds: string[], privacySafe: boolean): CalendarEvent[] {
  const templates = [
    ["Client strategy session", 9, 0, 60, "Conference A"],
    ["Deposition prep", 10, 30, 45, "War Room"],
    ["Court filing review", 13, 15, 45, "Teams"],
    ["Partner check-in", 15, 0, 30, "Office 4B"]
  ] as const;

  return calendarIds.flatMap((calendarId, index) =>
    templates.slice(0, 3 + (index % 2)).map(([subject, hour, minute, duration, location], eventIndex) => {
      const start = atToday(hour + (index % 2), minute);
      const isPrivate = privacySafe && eventIndex === 1 && index === 0;
      return {
        id: `${calendarId}-${eventIndex}`,
        calendarId,
        calendarName: names[calendarId] ?? calendarId,
        subject: isPrivate ? "Busy" : subject,
        location: isPrivate ? undefined : location,
        start,
        end: addMinutes(start, duration),
        isPrivate
      };
    })
  );
}

export async function getCalendarEvents(calendarIds: string | string[], privacySafe: boolean, hoursAhead = 16) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start.getTime() + hoursAhead * 60 * 60_000);
  const graphConfigured = hasGraphConfig();
  const parsedCalendarIds = parseCalendarIds(calendarIds);

  if (graphConfigured && parsedCalendarIds.length === 0) {
    return [];
  }

  try {
    const graphResults = await Promise.all(parsedCalendarIds.map((calendarId) => getGraphCalendarView(calendarId, start, end, privacySafe)));
    return graphResults.flatMap((events) => events).sort((a, b) => a.start.localeCompare(b.start));
  } catch (error) {
    return [];
  }

  if (graphConfigured) {
    return [];
  }

  return mockEvents(parsedCalendarIds.length ? parsedCalendarIds : defaultMockCalendarIds, privacySafe).sort((a, b) => a.start.localeCompare(b.start));
}

export function getCurrentAndNext(events: CalendarEvent[]) {
  const now = Date.now();
  const current = events.find((event) => new Date(event.start).getTime() <= now && new Date(event.end).getTime() > now);
  const next = events.find((event) => new Date(event.start).getTime() > now);
  return { current, next };
}
