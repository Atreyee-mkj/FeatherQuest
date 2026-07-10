import { db, type Badge } from "./db";

export interface BadgeDef {
  id: string;
  icon: string;
  name: string;
  desc: string;
  check: (s: Stats) => boolean;
}

export interface Stats {
  total: number;
  species: number;
  photos: number;
  audios: number;
  streak: number;
  hasSunrise: boolean; // any sighting before 07:00
  hasNightOwl: boolean; // any sighting at or after 19:00
  weekendMonthComplete: boolean; // sighting on every Sat & Sun of last 4 weekends
}

export const BADGES: BadgeDef[] = [
  { id: "first-feather", icon: "🌱", name: "First Feather", desc: "Log your first bird", check: (s) => s.total >= 1 },
  { id: "bird-explorer", icon: "🐦", name: "Bird Explorer", desc: "10 unique species", check: (s) => s.species >= 10 },
  { id: "hawk-eye", icon: "🦅", name: "Hawk Eye", desc: "50 unique species", check: (s) => s.species >= 50 },
  { id: "photographer", icon: "📷", name: "Photographer", desc: "25 photos captured", check: (s) => s.photos >= 25 },
  { id: "audio-pioneer", icon: "🎙", name: "Audio Pioneer", desc: "10 recordings", check: (s) => s.audios >= 10 },
  { id: "weekly-watcher", icon: "🔥", name: "Weekly Watcher", desc: "7-day logging streak", check: (s) => s.streak >= 7 },
  { id: "sunrise-birder", icon: "🌄", name: "Sunrise Birder", desc: "Logged before 7 AM", check: (s) => s.hasSunrise },
  { id: "night-owl", icon: "🌙", name: "Night Owl", desc: "Logged after 7 PM", check: (s) => s.hasNightOwl },
  { id: "trail-walker", icon: "🚶", name: "Trail Walker", desc: "100 sightings", check: (s) => s.total >= 100 },
  { id: "weekend-warrior", icon: "🌈", name: "Weekend Warrior", desc: "Every weekend for a month", check: (s) => s.weekendMonthComplete },
  { id: "feather-collector", icon: "🪶", name: "Feather Collector", desc: "100 total observations", check: (s) => s.total >= 100 },
];

export async function computeStats(): Promise<Stats> {
  if (!db)
    return {
      total: 0,
      species: 0,
      photos: 0,
      audios: 0,
      streak: 0,
      hasSunrise: false,
      hasNightOwl: false,
      weekendMonthComplete: false,
    };
  const all = await db.sightings.toArray();
  const species = new Set(all.map((s) => s.birdName.trim().toLowerCase()).filter(Boolean)).size;
  const photos = await db.media.where("kind").equals("photo").count();
  const audios = await db.media.where("kind").equals("audio").count();
  const streak = computeStreak(all.map((s) => s.date));

  let hasSunrise = false;
  let hasNightOwl = false;
  for (const s of all) {
    const hour = parseInt(s.time?.slice(0, 2) ?? "", 10);
    if (!Number.isNaN(hour)) {
      if (hour < 7) hasSunrise = true;
      if (hour >= 19) hasNightOwl = true;
    }
  }

  const dateSet = new Set(all.map((s) => s.date));
  const weekendMonthComplete = checkWeekendMonth(dateSet);

  return { total: all.length, species, photos, audios, streak, hasSunrise, hasNightOwl, weekendMonthComplete };
}

function computeStreak(dates: string[]): number {
  if (dates.length === 0) return 0;
  const set = new Set(dates);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let streak = 0;
  const cursor = new Date(today);
  const todayStr = toISO(cursor);
  if (!set.has(todayStr)) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (set.has(toISO(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

// True if there's a sighting on each of the last 4 Saturdays AND last 4 Sundays.
function checkWeekendMonth(dateSet: Set<string>): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  // Walk back 28 days; collect the last 4 Saturdays and Sundays.
  const sats: string[] = [];
  const suns: string[] = [];
  for (let i = 0; i < 35 && (sats.length < 4 || suns.length < 4); i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dow = d.getDay();
    if (dow === 6 && sats.length < 4) sats.push(toISO(d));
    if (dow === 0 && suns.length < 4) suns.push(toISO(d));
  }
  if (sats.length < 4 || suns.length < 4) return false;
  return [...sats, ...suns].every((iso) => dateSet.has(iso));
}

function toISO(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export async function evaluateBadges(): Promise<Badge[]> {
  if (!db) return [];
  const stats = await computeStats();
  const existing = await db.badges.toArray();
  const map = new Map(existing.map((b) => [b.id, b]));
  const now = Date.now();
  const updates: Badge[] = [];
  for (const def of BADGES) {
    const prev = map.get(def.id);
    const shouldUnlock = def.check(stats);
    if (shouldUnlock && !prev?.unlocked) {
      updates.push({ id: def.id, unlocked: true, dateUnlocked: now });
    } else if (!prev) {
      updates.push({ id: def.id, unlocked: false });
    }
  }
  if (updates.length) await db.badges.bulkPut(updates);
  return db.badges.toArray();
}
