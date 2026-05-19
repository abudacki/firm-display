import type { Announcement } from "@/lib/types";

export function AnnouncementTicker({ announcements, urgentOnly = false }: { announcements: Announcement[]; urgentOnly?: boolean }) {
  if (!announcements.length) return null;
  const urgent = announcements.find((announcement) => announcement.urgent);
  const urgentText = urgent ? `${urgent.title}: ${urgent.body}` : "";

  if (urgentOnly) {
    if (!urgent) return null;
    return (
      <footer className="announcement-scroll overflow-hidden rounded-md bg-berry px-4 py-3 text-xl font-semibold">
        <div className="announcement-scroll-track flex w-max gap-12">
          {[urgentText, urgentText].map((text, index) => (
            <span className="shrink-0" key={index}>{text}</span>
          ))}
        </div>
      </footer>
    );
  }

  const regularAnnouncements = announcements.filter((announcement) => !announcement.urgent).slice(0, 4);
  if (!urgent && !regularAnnouncements.length) return null;
  const regularItems = regularAnnouncements.map((announcement) => `${announcement.title}: ${announcement.body}`);

  return (
    <footer className="rounded-lg border border-white/16 bg-ink/68 p-5 backdrop-blur">
      {urgent ? (
        <div className="announcement-scroll mb-3 overflow-hidden rounded-md bg-berry px-4 py-2 text-xl font-semibold">
          <div className="announcement-scroll-track flex w-max gap-12">
            {[urgentText, urgentText].map((text, index) => (
              <span className="shrink-0" key={index}>{text}</span>
            ))}
          </div>
        </div>
      ) : null}
      {regularAnnouncements.length ? (
        <div className="announcement-scroll overflow-hidden text-2xl font-medium text-white/86">
          <div className="announcement-scroll-track flex w-max gap-12">
            {[...regularItems, ...regularItems].map((item, index) => (
              <span className="shrink-0" key={index}>
                {item}
            </span>
          ))}
          </div>
        </div>
      ) : null}
    </footer>
  );
}
