import type { WeatherLocation } from "../types";

const offices = [
  { id: "main", name: "Main Office", locality: "New York, NY", tempF: 66, condition: "Clear", highF: 72, lowF: 58 },
  { id: "north", name: "North Office", locality: "White Plains, NY", tempF: 63, condition: "Partly cloudy", highF: 70, lowF: 55 },
  { id: "shore", name: "Shore Office", locality: "Red Bank, NJ", tempF: 64, condition: "Light breeze", highF: 69, lowF: 57 }
];

export async function getWeatherLocations(officeIds: string[]): Promise<WeatherLocation[]> {
  const selected = officeIds.length ? offices.filter((office) => officeIds.includes(office.id)) : offices;
  return selected.length ? selected : offices.slice(0, 2);
}
