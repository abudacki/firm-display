import type { Announcement } from "@/lib/types";

export function AnnouncementTicker({ announcements }: { announcements: Announcement[] }) {
  if (!announcements.length) return null;
  const urgent = announcements.find((announcement) => announcement.urgent);
  return (
    <footer className="rounded-lg border border-white/16 bg-ink/68 p-5 backdrop-blur">
      {urgent ? (
        <div className="mb-3 rounded-md bg-berry px-4 py-2 text-xl font-semibold">{urgent.title}: {urgent.body}</div>
      ) : null}
      <div className="flex gap-8 overflow-hidden text-2xl font-medium text-white/86">
        {announcements.slice(0, 4).map((announcement) => (
          <span className="shrink-0" key={announcement.id}>
            {announcement.title}: {announcement.body}
          </span>
        ))}
      </div>
    </footer>
  );
}
