import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import type { Announcement, DisplayProfile, DisplaySettings, Quote } from "./types";

const dbPath = path.resolve(process.cwd(), process.env.DATABASE_PATH ?? "data/kiosk.sqlite");
let db: Database.Database | null = null;

function getDatabase() {
  if (db) return db;
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  migrate(db);
  return db;
}

function migrate(database: Database.Database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS quotes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT NOT NULL,
      attribution TEXT,
      background_image TEXT,
      active INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS announcements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      office TEXT,
      urgent INTEGER NOT NULL DEFAULT 0,
      active INTEGER NOT NULL DEFAULT 1,
      starts_at TEXT,
      ends_at TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS display_profiles (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      mode TEXT NOT NULL,
      calendar_ids TEXT NOT NULL DEFAULT '[]',
      office_ids TEXT NOT NULL DEFAULT '[]',
      rotation_seconds INTEGER NOT NULL DEFAULT 45,
      privacy_safe INTEGER NOT NULL DEFAULT 1,
      room_mailbox TEXT
    );
  `);
}

export function seedDatabase() {
  const database = getDatabase();
  const settingsCount = database.prepare("SELECT COUNT(*) as count FROM settings").get() as { count: number };
  if (settingsCount.count === 0) {
    const insert = database.prepare("INSERT INTO settings (key, value) VALUES (?, ?)");
    insert.run("firmName", "Hamilton & Myers LLP");
    insert.run("defaultBackgroundImage", "/backgrounds/courthouse.svg");
    insert.run("supportMessage", "For room support, contact IT.");
  }

  const quoteCount = database.prepare("SELECT COUNT(*) as count FROM quotes").get() as { count: number };
  if (quoteCount.count === 0) {
    database
      .prepare("INSERT INTO quotes (text, attribution, background_image) VALUES (?, ?, ?)")
      .run("Excellence is not an act, but a habit.", "Aristotle", "/backgrounds/courthouse.svg");
    database
      .prepare("INSERT INTO quotes (text, attribution, background_image) VALUES (?, ?, ?)")
      .run("The law is reason free from passion.", "Aristotle", "/backgrounds/library.svg");
  }

  const announcementCount = database.prepare("SELECT COUNT(*) as count FROM announcements").get() as { count: number };
  if (announcementCount.count === 0) {
    database
      .prepare("INSERT INTO announcements (title, body, office, urgent) VALUES (?, ?, ?, ?)")
      .run("Welcome visiting counsel", "Please direct guests to Reception before conference room seating.", "Main Office", 0);
    database
      .prepare("INSERT INTO announcements (title, body, office, urgent) VALUES (?, ?, ?, ?)")
      .run("Filing deadline reminder", "All litigation teams should confirm today’s court filings by 3:00 PM.", "All Offices", 1);
  }

  const profileCount = database.prepare("SELECT COUNT(*) as count FROM display_profiles").get() as { count: number };
  if (profileCount.count === 0) {
    const insert = database.prepare(
      "INSERT INTO display_profiles (id, name, mode, calendar_ids, office_ids, rotation_seconds, privacy_safe, room_mailbox) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
    );
    insert.run("morning", "Morning Meeting", "morning", JSON.stringify(["alex.rivera", "jordan.lee", "morgan.patel"]), JSON.stringify(["main", "north"]), 45, 1, null);
    insert.run("attorneys", "Attorney Calendar", "attorneys", JSON.stringify(["alex.rivera", "jordan.lee", "morgan.patel"]), JSON.stringify(["main"]), 35, 1, null);
    insert.run("main-conference", "Main Conference Room", "room", JSON.stringify(["main-conference-room"]), JSON.stringify(["main"]), 30, 1, "main-conference-room@example.com");
    insert.run("announcements", "Announcements", "announcements", JSON.stringify([]), JSON.stringify(["main", "north"]), 25, 1, null);
  }
}

export function getSettings(): DisplaySettings {
  seedDatabase();
  const rows = getDatabase().prepare("SELECT key, value FROM settings").all() as Array<{ key: string; value: string }>;
  const values = Object.fromEntries(rows.map((row) => [row.key, row.value]));
  return {
    firmName: values.firmName ?? "Firm Display",
    defaultBackgroundImage: values.defaultBackgroundImage ?? "/backgrounds/courthouse.svg",
    supportMessage: values.supportMessage ?? "Contact IT for support."
  };
}

export function updateSetting(key: keyof DisplaySettings, value: string) {
  getDatabase().prepare("INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").run(key, value);
}

export function getQuotes(): Quote[] {
  seedDatabase();
  return getDatabase().prepare("SELECT id, text, attribution, background_image as backgroundImage, active FROM quotes ORDER BY id DESC").all() as Quote[];
}

export function getActiveQuote(): Quote {
  const quotes = getQuotes().filter((quote) => quote.active);
  return quotes[Math.floor(Date.now() / 60000) % Math.max(quotes.length, 1)] ?? {
    id: 0,
    text: "Good morning.",
    attribution: null,
    backgroundImage: null,
    active: 1
  };
}

export function addQuote(input: { text: string; attribution?: string; backgroundImage?: string }) {
  getDatabase()
    .prepare("INSERT INTO quotes (text, attribution, background_image) VALUES (?, ?, ?)")
    .run(input.text, input.attribution || null, input.backgroundImage || null);
}

export function getAnnouncements(includeInactive = false): Announcement[] {
  seedDatabase();
  const now = new Date().toISOString();
  const clause = includeInactive
    ? ""
    : "WHERE active = 1 AND (starts_at IS NULL OR starts_at <= @now) AND (ends_at IS NULL OR ends_at >= @now)";
  return getDatabase()
    .prepare(`SELECT id, title, body, office, urgent, active, starts_at as startsAt, ends_at as endsAt FROM announcements ${clause} ORDER BY urgent DESC, id DESC`)
    .all({ now }) as Announcement[];
}

export function addAnnouncement(input: Omit<Announcement, "id" | "active" | "urgent"> & { urgent?: boolean }) {
  getDatabase()
    .prepare("INSERT INTO announcements (title, body, office, urgent, starts_at, ends_at) VALUES (?, ?, ?, ?, ?, ?)")
    .run(input.title, input.body, input.office || null, input.urgent ? 1 : 0, input.startsAt || null, input.endsAt || null);
}

export function getProfiles(): DisplayProfile[] {
  seedDatabase();
  const rows = getDatabase()
    .prepare("SELECT id, name, mode, calendar_ids as calendarIds, office_ids as officeIds, rotation_seconds as rotationSeconds, privacy_safe as privacySafe, room_mailbox as roomMailbox FROM display_profiles ORDER BY mode, name")
    .all() as Array<Omit<DisplayProfile, "calendarIds" | "officeIds"> & { calendarIds: string; officeIds: string }>;
  return rows.map((row) => ({
    ...row,
    calendarIds: JSON.parse(row.calendarIds),
    officeIds: JSON.parse(row.officeIds)
  }));
}

export function getProfile(id: string): DisplayProfile | undefined {
  return getProfiles().find((profile) => profile.id === id);
}

export function upsertProfile(profile: DisplayProfile) {
  getDatabase()
    .prepare(
      "INSERT INTO display_profiles (id, name, mode, calendar_ids, office_ids, rotation_seconds, privacy_safe, room_mailbox) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET name = excluded.name, mode = excluded.mode, calendar_ids = excluded.calendar_ids, office_ids = excluded.office_ids, rotation_seconds = excluded.rotation_seconds, privacy_safe = excluded.privacy_safe, room_mailbox = excluded.room_mailbox"
    )
    .run(profile.id, profile.name, profile.mode, JSON.stringify(profile.calendarIds), JSON.stringify(profile.officeIds), profile.rotationSeconds, profile.privacySafe, profile.roomMailbox || null);
}
