import Dexie, { type Table } from "dexie";

export interface Sighting {
  id?: number;
  birdName: string;
  date: string; // ISO YYYY-MM-DD
  time: string; // HH:MM
  location?: string;
  notes?: string;
  categoryId?: number;
  favorite: boolean;
  createdAt: number;
  // Phase 13 — journal enrichments (all optional, back-compatible)
  mood?: string; // MoodId
  rarity?: string; // RarityId
  behaviors?: string[]; // BehaviorId[]
  weather?: { condition?: string; tempC?: number };
  // Phase 2 expansion — number of birds observed
  count?: number;
}

export interface Profile {
  id: "me";
  displayName?: string;
  bio?: string;
  avatarBlob?: Blob;
  avatarMime?: string;
  updatedAt: number;
}


export interface MediaAsset {
  id?: number;
  sightingId: number;
  kind: "photo" | "audio";
  blob: Blob;
  mimeType: string;
  createdAt: number;
}

export interface Category {
  id?: number;
  name: string;
  icon: string;
  color: string;
}

export interface Badge {
  id: string; // slug
  unlocked: boolean;
  dateUnlocked?: number;
}

class FeatherQuestDB extends Dexie {
  sightings!: Table<Sighting, number>;
  media!: Table<MediaAsset, number>;
  categories!: Table<Category, number>;
  badges!: Table<Badge, string>;

  constructor() {
    super("featherquest");
    this.version(1).stores({
      sightings: "++id, birdName, date, categoryId, favorite, createdAt",
      media: "++id, sightingId, kind, createdAt",
      categories: "++id, name",
      badges: "id, unlocked",
    });
    // v2 — no index changes; new fields on Sighting are non-indexed and
    // default to undefined on existing rows.
    this.version(2).stores({
      sightings: "++id, birdName, date, categoryId, favorite, createdAt",
      media: "++id, sightingId, kind, createdAt",
      categories: "++id, name",
      badges: "id, unlocked",
    });
  }
}

export const db = typeof window !== "undefined" ? new FeatherQuestDB() : (null as unknown as FeatherQuestDB);

export async function seedDefaults() {
  if (!db) return;
  const count = await db.categories.count();
  if (count === 0) {
    await db.categories.bulkAdd([
      { name: "Backyard", icon: "🏡", color: "#5a8a5c" },
      { name: "Forest", icon: "🌲", color: "#1a3c2a" },
      { name: "Wetland", icon: "💧", color: "#2d8a9e" },
    ]);
  }
}
