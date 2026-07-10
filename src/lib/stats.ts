import { db, type Sighting, type Category } from "./db";

export interface RichStats {
  monthCount: number;
  bestMonthCount: number;
  monthLabel: string;
  mostActiveWeekday: string | null;
  mostSeenSpecies: string | null;
  longestStreak: number;
  favoriteHabitat: string | null;
}

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export async function computeRichStats(): Promise<RichStats> {
  const empty: RichStats = {
    monthCount: 0,
    bestMonthCount: 0,
    monthLabel: new Date().toLocaleString(undefined, { month: "long", year: "numeric" }),
    mostActiveWeekday: null,
    mostSeenSpecies: null,
    longestStreak: 0,
    favoriteHabitat: null,
  };
  if (!db) return empty;
  const sightings: Sighting[] = await db.sightings.toArray();
  if (sightings.length === 0) return empty;

  const now = new Date();
  const ym = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  const currentYm = ym(now);

  const monthCounts = new Map<string, number>();
  const weekdayCounts = new Array(7).fill(0) as number[];
  const speciesCounts = new Map<string, { name: string; n: number }>();
  const categoryCounts = new Map<number, number>();
  const dateSet = new Set<string>();

  for (const s of sightings) {
    // date: YYYY-MM-DD — parse locally, no TZ shift
    const [y, m, d] = s.date.split("-").map(Number);
    if (!y || !m || !d) continue;
    const dt = new Date(y, m - 1, d);
    const key = ym(dt);
    monthCounts.set(key, (monthCounts.get(key) ?? 0) + 1);
    weekdayCounts[dt.getDay()]++;
    const nameKey = s.birdName.trim().toLowerCase();
    if (nameKey) {
      const prev = speciesCounts.get(nameKey);
      if (prev) prev.n++;
      else speciesCounts.set(nameKey, { name: s.birdName.trim(), n: 1 });
    }
    if (s.categoryId != null) {
      categoryCounts.set(s.categoryId, (categoryCounts.get(s.categoryId) ?? 0) + 1);
    }
    dateSet.add(s.date);
  }

  let bestMonthCount = 0;
  for (const v of monthCounts.values()) if (v > bestMonthCount) bestMonthCount = v;

  let mostActiveWeekday: string | null = null;
  let maxW = 0;
  weekdayCounts.forEach((n, i) => {
    if (n > maxW) {
      maxW = n;
      mostActiveWeekday = WEEKDAYS[i];
    }
  });

  let mostSeenSpecies: string | null = null;
  let maxS = 0;
  for (const v of speciesCounts.values()) {
    if (v.n > maxS) {
      maxS = v.n;
      mostSeenSpecies = v.name;
    }
  }

  // Favorite habitat — top category by count
  let favoriteHabitat: string | null = null;
  if (categoryCounts.size > 0) {
    const cats: Category[] = await db.categories.toArray();
    const byId = new Map(cats.map((c) => [c.id!, c]));
    let bestId = -1;
    let bestN = 0;
    for (const [id, n] of categoryCounts) {
      if (n > bestN) {
        bestN = n;
        bestId = id;
      }
    }
    const cat = byId.get(bestId);
    if (cat) favoriteHabitat = `${cat.icon} ${cat.name}`;
  }

  // Longest streak across full history
  const sortedDates = [...dateSet].sort();
  let longestStreak = 0;
  let run = 0;
  let prev: Date | null = null;
  for (const iso of sortedDates) {
    const [y, m, d] = iso.split("-").map(Number);
    const dt = new Date(y, m - 1, d);
    if (prev) {
      const diff = Math.round((dt.getTime() - prev.getTime()) / 86400000);
      if (diff === 1) run++;
      else run = 1;
    } else {
      run = 1;
    }
    if (run > longestStreak) longestStreak = run;
    prev = dt;
  }

  return {
    monthCount: monthCounts.get(currentYm) ?? 0,
    bestMonthCount,
    monthLabel: now.toLocaleString(undefined, { month: "long", year: "numeric" }),
    mostActiveWeekday,
    mostSeenSpecies,
    longestStreak,
    favoriteHabitat,
  };
}
