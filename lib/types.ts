export type WeatherLocation = {
  id: string;
  name: string;
  locality: string;
  tempF: number;
  condition: string;
  highF: number;
  lowF: number;
};

export type CalendarEvent = {
  id: string;
  calendarId: string;
  calendarName: string;
  calendarNames?: string[];
  subject: string;
  location?: string;
  start: string;
  end: string;
  isPrivate?: boolean;
  isAllDay?: boolean;
};

export type Quote = {
  id: number;
  text: string;
  attribution: string | null;
  backgroundImage: string | null;
  active: number;
};

export type Announcement = {
  id: number;
  title: string;
  body: string;
  office: string | null;
  urgent: number;
  active: number;
  startsAt: string | null;
  endsAt: string | null;
};

export type DisplayProfile = {
  id: string;
  name: string;
  mode: "morning" | "attorneys" | "room" | "announcements";
  calendarIds: string;
  officeIds: string[];
  rotationSeconds: number;
  privacySafe: number;
  roomMailbox: string | null;
};

export type DisplaySettings = {
  firmName: string;
  defaultBackgroundImage: string;
  morningBackgroundImage: string;
  attorneysBackgroundImage: string;
  roomsBackgroundImage: string;
  announcementsBackgroundImage: string;
  logoImage: string;
  supportMessage: string;
};
