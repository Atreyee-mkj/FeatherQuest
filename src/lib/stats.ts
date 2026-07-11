import { db, type Sighting, type Category } from "./db";

export interface MonthBar {
  key: string; // YYYY-MM
  label: string; // "Jan"
  count: number;
}

export interface WeekdayBar {
  label: string; // "Mon"
  count: number;
}

export interface RichStats {
  monthCount: number;
  bestMonthCount: number;
  monthLabel: string;
  mostActiveWeekday: string | null;
  mostSeenSpecies: string | null;
  longestStreak: number;
  currentStreak: number;
  favoriteHabitat: string | null; // top location text
  favoriteCategory: string | null; // top category
  totalObservations: number; // sum of count ?? 1
  monthlyBars: MonthBar[]; // last 6 months
  weekdayBars: WeekdayBar[]; // Sun..Sat
  avgPerWeek: number; // last 12 weeks
}

const WEEKDAYS_FULL = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const WEEKDAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export async function computeRichStats(): Promise<RichStats> {
  const empty: RichStats = {
    monthCount: 0,
    bestMonthCount: 0,
    monthLabel: new Date().toLocaleString(undefined, {
      month: "long",
      year: "numeric",
    }),
    mostActiveWeekday: null,
    mostSeenSpecies: null,
    longestStreak: 0,
    currentStreak: 0,
    favoriteHabitat: null,
    favoriteCategory: null,
    totalObservations: 0,
    monthlyBars: buildEmptyMonthly(),
    weekdayBars: WEEKDAYS_SHORT.map((label) => ({ label, count: 0 })),
    avgPerWeek: 0,
  };
  if (!db) return empty;
  const sightings: Sighting[] = await db.sightings.toArray();
  if (sightings.length === 0) return empty;

  const now = new Date();
  const ym = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  const currentYm = ym(now);

  const monthCounts = new Map<string, number>();
  const weekdayCounts = new Array(7).fill(0) as number[];
  const speciesCounts = new Map<string, { name: string; n: number }>();
  const categoryCounts = new Map<number, number>();
  const locationCounts = new Map<string, number>();
  const dateSet = new Set<string>();
  let totalObservations = 0;

  for (const s of sightings) {
    const [y, m, d] = s.date.split("-").map(Number);
    if (!y || !m || !d) continue;
    const dt = new Date(y, m - 1, d);
    const key = ym(dt);
    monthCounts.set(key, (monthCounts.get(key) ?? 0) + 1);
    weekdayCounts[dt.getDay()]++;
    const nameKey = s.birdName.trim().toLowerCase();
    if (nameKey) {
      const prev = speciesCounts.get(nameKey);
      if (prev) prev.n += s.count ?? 1;
      else
        speciesCounts.set(nameKey, {
          name: s.birdName.trim(),
          n: s.count ?? 1,
        });
    }
    if (s.categoryId != null) {
      categoryCounts.set(
        s.categoryId,
        (categoryCounts.get(s.categoryId) ?? 0) + 1,
      );
    }
    if (s.location && s.location.trim()) {
      const loc = s.location.trim();
      locationCounts.set(loc, (locationCounts.get(loc) ?? 0) + 1);
    }
    dateSet.add(s.date);
    totalObservations += s.count ?? 1;
  }

  let bestMonthCount = 0;
  for (const v of monthCounts.values()) if (v > bestMonthCount) bestMonthCount = v;

  let mostActiveWeekday: string | null = null;
  let maxW = 0;
  weekdayCounts.forEach((n, i) => {
    if (n > maxW) {
      maxW = n;
      mostActiveWeekday = WEEKDAYS_FULL[i];
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

  let favoriteCategory: string | null = null;
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
    if (cat) favoriteCategory = `${cat.icon} ${cat.name}`;
  }

  let favoriteHabitat: string | null = null;
  {
    let bestN = 0;
    for (const [loc, n] of locationCounts) {
      if (n > bestN) {
        bestN = n;
        favoriteHabitat = loc;
      }
    }
  }

  // Streaks
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
  // Current streak — days back from today with consecutive entries
  let currentStreak = 0;
  {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const iso = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const cursor = new Date(today);
    if (!dateSet.has(iso(cursor))) cursor.setDate(cursor.getDate() - 1);
    while (dateSet.has(iso(cursor))) {
      currentStreak++;
      cursor.setDate(cursor.getDate() - 1);
    }
  }

  // Monthly bars — last 6 months including current
  const monthlyBars: MonthBar[] = [];
  for (let i = 5; i >= 0; i--) {
    const dt = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = ym(dt);
    monthlyBars.push({
      key,
      label: MONTH_SHORT[dt.getMonth()],
      count: monthCounts.get(key) ?? 0,
    });
  }

  const weekdayBars: WeekdayBar[] = WEEKDAYS_SHORT.map((label, i) => ({
    label,
    count: weekdayCounts[i],
  }));

  // avgPerWeek — sightings in the last 12 weeks / 12
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - 12 * 7);
  const inLast12 = sightings.filter((s) => {
    const [y, m, d] = s.date.split("-").map(Number);
    if (!y) return false;
    return new Date(y, m - 1, d) >= cutoff;
  }).length;
  const avgPerWeek = Math.round((inLast12 / 12) * 10) / 10;

  return {
    monthCount: monthCounts.get(currentYm) ?? 0,
    bestMonthCount,
    monthLabel: now.toLocaleString(undefined, {
      month: "long",
      year: "numeric",
    }),
    mostActiveWeekday,
    mostSeenSpecies,
    longestStreak,
    currentStreak,
    favoriteHabitat,
    favoriteCategory,
    totalObservations,
    monthlyBars,
    weekdayBars,
    avgPerWeek,
  };
}

function buildEmptyMonthly(): MonthBar[] {
  const now = new Date();
  const out: MonthBar[] = [];
  for (let i = 5; i >= 0; i--) {
    const dt = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push({
      key: `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`,
      label: MONTH_SHORT[dt.getMonth()],
      count: 0,
    });
  }
  return out;
}
