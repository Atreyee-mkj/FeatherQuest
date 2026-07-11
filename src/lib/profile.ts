import { db, type Profile } from "./db";

export async function getProfile(): Promise<Profile | undefined> {
  if (!db) return undefined;
  return db.profile.get("me");
}

export async function updateProfile(patch: Partial<Omit<Profile, "id">>) {
  if (!db) return;
  const existing = (await db.profile.get("me")) ?? { id: "me" as const, updatedAt: 0 };
  await db.profile.put({ ...existing, ...patch, id: "me", updatedAt: Date.now() });
}
