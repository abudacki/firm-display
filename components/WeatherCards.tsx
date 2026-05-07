import { CloudSun } from "lucide-react";
import type { WeatherLocation } from "@/lib/types";

export function WeatherCards({ locations }: { locations: WeatherLocation[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {locations.map((location) => (
        <article className="rounded-lg border border-white/16 bg-white/12 p-5 shadow-display backdrop-blur" key={location.id}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold">{location.name}</h2>
              <p className="mt-1 text-lg text-white/72">{location.locality}</p>
            </div>
            <CloudSun aria-hidden className="h-9 w-9 text-brass" />
          </div>
          <div className="mt-6 flex items-end justify-between">
            <div className="text-6xl font-semibold leading-none">{location.tempF}°</div>
            <div className="pb-1 text-right text-lg text-white/78">
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
