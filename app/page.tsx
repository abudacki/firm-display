import Link from "next/link";
import { Building2, CalendarDays, Megaphone, UsersRound } from "lucide-react";

const links = [
  { href: "/morning", label: "Morning", icon: CalendarDays },
  { href: "/attorneys", label: "Attorneys", icon: UsersRound },
  { href: "/rooms/main-conference", label: "Room", icon: Building2 },
  { href: "/announcements", label: "Announcements", icon: Megaphone }
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-linen text-ink">
      <section className="mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center gap-10 px-8 py-12">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cypress">Firm Display</p>
          <h1 className="mt-4 max-w-3xl text-5xl font-semibold">Internal kiosk screens for offices, rooms, and meetings.</h1>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {links.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                className="flex items-center gap-3 rounded-lg border border-ink/10 bg-white p-5 text-lg font-semibold shadow-sm transition hover:border-cypress hover:text-cypress"
                href={item.href}
                key={item.href}
              >
                <Icon aria-hidden className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </div>
        <Link className="w-fit rounded-lg bg-cypress px-5 py-3 font-semibold text-white" href="/admin">
          Open admin
        </Link>
      </section>
    </main>
  );
}
