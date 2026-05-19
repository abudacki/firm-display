import type { WeatherLocation } from "../types";

type GeocodingResult = {
  name: string;
  admin1?: string;
  country_code?: string;
  latitude: number;
  longitude: number;
};

type ForecastResult = {
  current?: {
    temperature_2m?: number;
    weather_code?: number;
  };
  daily?: {
    temperature_2m_max?: number[];
    temperature_2m_min?: number[];
  };
};

const offices = [
  { id: "pittsburgh", name: "Pittsburgh Office", locality: "Pittsburgh, PA", tempF: 66, condition: "Clear", highF: 72, lowF: 58 },
  { id: "ebensburg", name: "Ebensburg Office", locality: "Ebensburg, PA", tempF: 63, condition: "Partly cloudy", highF: 70, lowF: 55 },
  { id: "arkansas", name: "Arkansas Office", locality: "Russellville, AR", tempF: 72, condition: "Clear", highF: 78, lowF: 61 },
  { id: "mexico", name: "Mexico Office", locality: "Tepic, Nayarit", tempF: 76, condition: "Mainly clear", highF: 81, lowF: 58 },
  { id: "south-africa", name: "South Africa Office", locality: "Krugersdorp, Gauteng", tempF: 68, condition: "Clear", highF: 74, lowF: 52 }
];

const weatherCodes: Record<number, string> = {
  0: "Clear",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Cloudy",
  45: "Fog",
  48: "Rime fog",
  51: "Light drizzle",
  53: "Drizzle",
  55: "Heavy drizzle",
  61: "Light rain",
  63: "Rain",
  65: "Heavy rain",
  71: "Light snow",
  73: "Snow",
  75: "Heavy snow",
  80: "Rain showers",
  81: "Rain showers",
  82: "Heavy showers",
  95: "Thunderstorms"
};

function getMockWeather(officeIds: string[]) {
  const selected = officeIds.length ? offices.filter((office) => officeIds.includes(office.id)) : offices;
  return selected.length ? selected : offices.slice(0, 2);
}

function configuredLocations() {
  const multi = process.env.WEATHER_LOCATIONS;
  if (multi) {
    return multi
      .split(";")
      .map((entry, index) => {
        const [name, location] = entry.split("|").map((part) => part.trim());
        return location ? { id: `weather-${index}`, name, query: location } : { id: `weather-${index}`, name: location || name, query: location || name };
      })
      .filter((entry) => entry.query);
  }

  const location = process.env.WEATHER_LOCATION?.trim();
  if (location) {
    return [{ id: "local", name: "Pittsburgh Office", query: location }];
  }

  return [];
}

async function geocodeLocation(query: string) {
  const queryParts = query.split(",").map((part) => part.trim()).filter(Boolean);
  const attempts = Array.from(new Set([query, query.replaceAll(",", " "), queryParts[0]].filter(Boolean)));

  for (const attempt of attempts) {
    const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
    url.searchParams.set("name", attempt);
    url.searchParams.set("count", "1");
    url.searchParams.set("language", "en");
    url.searchParams.set("format", "json");

    const response = await fetch(url, { next: { revalidate: 60 * 60 * 12 } });
    if (!response.ok) continue;

    const json = (await response.json()) as { results?: GeocodingResult[] };
    const result = json.results?.[0] ?? null;
    if (result) return result;
  }

  return null;
}

async function getOpenMeteoWeather(location: { id: string; name: string; query: string }): Promise<WeatherLocation | null> {
  const geocoded = await geocodeLocation(location.query);
  if (!geocoded) return null;

  const url = new URL(process.env.WEATHER_API_BASE_URL || "https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(geocoded.latitude));
  url.searchParams.set("longitude", String(geocoded.longitude));
  url.searchParams.set("current", "temperature_2m,weather_code");
  url.searchParams.set("daily", "temperature_2m_max,temperature_2m_min");
  url.searchParams.set("temperature_unit", "fahrenheit");
  url.searchParams.set("timezone", "auto");
  url.searchParams.set("forecast_days", "1");

  const response = await fetch(url, { next: { revalidate: 60 * 15 } });
  if (!response.ok) return null;

  const forecast = (await response.json()) as ForecastResult;
  const temp = forecast.current?.temperature_2m;
  const code = forecast.current?.weather_code;
  const high = forecast.daily?.temperature_2m_max?.[0];
  const low = forecast.daily?.temperature_2m_min?.[0];

  if (typeof temp !== "number" || typeof high !== "number" || typeof low !== "number") {
    return null;
  }

  return {
    id: location.id,
    name: location.name,
    locality: [geocoded.name, geocoded.admin1 || geocoded.country_code].filter(Boolean).join(", "),
    tempF: Math.round(temp),
    condition: typeof code === "number" ? weatherCodes[code] ?? "Current weather" : "Current weather",
    highF: Math.round(high),
    lowF: Math.round(low)
  };
}

export async function getWeatherLocations(officeIds: string[]): Promise<WeatherLocation[]> {
  if (process.env.WEATHER_PROVIDER === "openmeteo") {
    const liveWeather = await Promise.all(configuredLocations().map((location) => getOpenMeteoWeather(location)));
    const validWeather = liveWeather.filter((location): location is WeatherLocation => Boolean(location));
    if (validWeather.length) return validWeather;
  }

  return getMockWeather(officeIds);
}
