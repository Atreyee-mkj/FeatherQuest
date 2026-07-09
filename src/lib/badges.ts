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
}

export const BADGES: BadgeDef[] = [
  { id: "first-feather", icon: "🌱", name: "First Feather", desc: "Log your first bird", check: (s) => s.total >= 1 },
  { id: "bird-explorer", icon: "🐦", name: "Bird Explorer", desc: "10 unique species", check: (s) => s.species >= 10 },
  { id: "hawk-eye", icon: "🦅", name: "Hawk Eye", desc: "50 unique species", check: (s) => s.species >= 50 },
  { id: "photographer", icon: "📷", name: "Photographer", desc: "25 photos captured", check: (s) => s.photos >= 25 },
  { id: "audio-pioneer", icon: "🎙", name: "Audio Pioneer", desc: "10 recordings", check: (s) => s.audios >= 10 },
  { id: "weekly-watcher", icon: "🔥", name: "Weekly Watcher", desc: "7-day logging streak", check: (s) => s.streak >= 7 },
];

export async function computeStats(): Promise<Stats> {
  if (!db) return { total: 0, species: 0, photos: 0, audios: 0, streak: 0 };
  const all = await db.sightings.toArray();
  const species = new Set(all.map((s) => s.birdName.trim().toLowerCase()).filter(Boolean)).size;
  const photos = await db.media.where("kind").equals("photo").count();
  const audios = await db.media.where("kind").equals("audio").count();
  const streak = computeStreak(all.map((s) => s.date));
  return { total: all.length, species, photos, audios, streak };
}

function computeStreak(dates: string[]): number {
  if (dates.length === 0) return 0;
  const set = new Set(dates);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let streak = 0;
  const cursor = new Date(today);
  // If no entry today, allow starting from yesterday
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
