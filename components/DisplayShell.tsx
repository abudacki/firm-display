import type { CSSProperties } from "react";
import type { Announcement, DisplaySettings } from "@/lib/types";
import { AnnouncementTicker } from "./AnnouncementTicker";
import { AutoRefresh } from "./AutoRefresh";

export function DisplayShell({
  children,
  settings,
  backgroundImage,
  announcements,
  label,
  rotationSeconds
}: {
  children: React.ReactNode;
  settings: DisplaySettings;
  backgroundImage?: string | null;
  announcements?: Announcement[];
  label: string;
  rotationSeconds?: number;
}) {
  const image = backgroundImage ?? settings.defaultBackgroundImage;
  return (
    <main
      className="display-bg slow-pan relative min-h-screen overflow-hidden px-10 py-8 text-white"
      style={{ "--display-image": `url(${image})` } as CSSProperties}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_74%_22%,rgba(185,143,69,0.28),transparent_34%)]" />
      <AutoRefresh seconds={rotationSeconds ?? Number(process.env.DISPLAY_REFRESH_SECONDS ?? 60)} />
      <div className="relative z-10 flex min-h-[calc(100vh-4rem)] flex-col">
        <header className="flex items-center justify-between text-white/78">
          <div className="text-xl font-semibold">{settings.firmName}</div>
          <div className="rounded-md border border-white/18 bg-white/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.24em]">{label}</div>
        </header>
        <section className="flex flex-1 flex-col justify-center py-8">{children}</section>
        {announcements ? <AnnouncementTicker announcements={announcements} /> : null}
      </div>
    </main>
  );
}
