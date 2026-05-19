import { CloudSun } from "lucide-react";
import type { WeatherLocation } from "@/lib/types";

export function WeatherCards({ locations }: { locations: WeatherLocation[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 2xl:grid-cols-5">
      {locations.map((location) => (
        <article className="rounded-lg border border-white/16 bg-white/12 p-4 shadow-display backdrop-blur" key={location.id}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-xl font-semibold leading-tight">{location.name}</h2>
              <p className="mt-1 truncate text-base text-white/72">{location.locality}</p>
            </div>
            <CloudSun aria-hidden className="h-8 w-8 shrink-0 text-brass" />
          </div>
          <div className="mt-5 flex items-end justify-between gap-3">
            <div className="text-5xl font-semibold leading-none">{location.tempF}°</div>
            <div className="pb-1 text-right text-base font-medium leading-tight text-white/78">
              <div>{location.condition}</div>
              <div>
                {location.highF}° / {location.lowF}°
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
