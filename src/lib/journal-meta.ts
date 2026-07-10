// Shared taxonomy for mood, rarity, behavior, and weather tags.
// Kept as `as const` arrays so both the form (chips) and detail view
// (display) render from the same source of truth.

export const MOODS = [
  { id: "amazed", emoji: "😍", label: "Amazed" },
  { id: "peaceful", emoji: "😌", label: "Peaceful" },
  { id: "excited", emoji: "🤯", label: "Excited" },
  { id: "proud", emoji: "📸", label: "Proud" },
] as const;
export type MoodId = (typeof MOODS)[number]["id"];

export const RARITIES = [
  { id: "common", label: "Common" },
  { id: "uncommon", label: "Uncommon" },
  { id: "rare", label: "Rare" },
  { id: "lifer", label: "Lifer!" },
] as const;
export type RarityId = (typeof RARITIES)[number]["id"];

export const BEHAVIORS = [
  { id: "singing", emoji: "🎶", label: "Singing" },
  { id: "flying", emoji: "🪽", label: "Flying" },
  { id: "feeding", emoji: "🌾", label: "Feeding" },
  { id: "nesting", emoji: "🪺", label: "Nesting" },
  { id: "perched", emoji: "🌳", label: "Perched" },
  { id: "hunting", emoji: "🦅", label: "Hunting" },
] as const;
export type BehaviorId = (typeof BEHAVIORS)[number]["id"];

export const WEATHER_CONDITIONS = [
  { id: "sunny", emoji: "☀️", label: "Sunny" },
  { id: "cloudy", emoji: "⛅", label: "Cloudy" },
  { id: "rainy", emoji: "🌧", label: "Rainy" },
  { id: "snow", emoji: "❄️", label: "Snow" },
  { id: "foggy", emoji: "🌫", label: "Foggy" },
  { id: "windy", emoji: "💨", label: "Windy" },
] as const;
export type WeatherConditionId = (typeof WEATHER_CONDITIONS)[number]["id"];

export function moodOf(id?: string) {
  return MOODS.find((m) => m.id === id);
}
export function rarityOf(id?: string) {
  return RARITIES.find((r) => r.id === id);
}
export function behaviorOf(id: string) {
  return BEHAVIORS.find((b) => b.id === id);
}
export function weatherOf(id?: string) {
  return WEATHER_CONDITIONS.find((w) => w.id === id);
}
