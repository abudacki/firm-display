import type { CalendarEvent } from "../types";

type GraphEvent = {
  id: string;
  subject?: string;
  sensitivity?: string;
  isPrivate?: boolean;
  location?: { displayName?: string };
  start: { dateTime: string; timeZone: string };
  end: { dateTime: string; timeZone: string };
};

const graphBase = "https://graph.microsoft.com/v1.0";

function hasGraphConfig() {
  return Boolean(process.env.MICROSOFT_TENANT_ID && process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET);
}

async function getAccessToken() {
  const tenantId = process.env.MICROSOFT_TENANT_ID;
  const clientId = process.env.MICROSOFT_CLIENT_ID;
  const clientSecret = process.env.MICROSOFT_CLIENT_SECRET;
  if (!tenantId || !clientId || !clientSecret) {
    throw new Error("Microsoft Graph credentials are not configured.");
  }

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    scope: process.env.MICROSOFT_GRAPH_SCOPE ?? "https://graph.microsoft.com/.default",
    grant_type: "client_credentials"
  });

  const response = await fetch(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`, {
    method: "POST",
    body,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`Graph token request failed: ${response.status}`);
  }

  const json = (await response.json()) as { access_token: string };
  return json.access_token;
}

export async function getGraphCalendarView(calendarId: string, start: Date, end: Date, privacySafe: boolean): Promise<CalendarEvent[] | null> {
  if (!hasGraphConfig()) return null;

  const token = await getAccessToken();
  const url = new URL(`${graphBase}/users/${encodeURIComponent(calendarId)}/calendarView`);
  url.searchParams.set("startDateTime", start.toISOString());
  url.searchParams.set("endDateTime", end.toISOString());
  url.searchParams.set("$orderby", "start/dateTime");
  url.searchParams.set("$select", "id,subject,sensitivity,isPrivate,location,start,end");

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Prefer: 'outlook.timezone="America/New_York"'
    },
    next: { revalidate: 60 }
  });

  if (!response.ok) {
    throw new Error(`Graph calendarView failed for ${calendarId}: ${response.status}`);
  }

  const json = (await response.json()) as { value: GraphEvent[] };
  return json.value.map((event) => {
    const privateEvent = event.isPrivate || event.sensitivity === "private";
    return {
      id: event.id,
      calendarId,
      calendarName: calendarId.split("@")[0] ?? calendarId,
      subject: privacySafe && privateEvent ? "Busy" : event.subject || "Busy",
      location: privacySafe && privateEvent ? undefined : event.location?.displayName,
      start: event.start.dateTime,
      end: event.end.dateTime,
      isPrivate: privateEvent
    };
  });
}
