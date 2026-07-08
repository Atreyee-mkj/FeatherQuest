import { createFileRoute } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { AppShell, PageHeader } from "@/components/AppShell";
import { CategoryManager } from "@/components/CategoryManager";
import { db } from "@/lib/db";
import appIcon from "@/assets/app-icon.png";


export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile — FeatherQuest" }] }),
  component: Profile,
});

function Profile() {
  const stats = useLiveQuery(async () => {
    if (!db) return { total: 0, species: 0, categories: 0, favorites: 0 };
    const all = await db.sightings.toArray();
    const species = new Set(all.map((s) => s.birdName.toLowerCase())).size;
    const categories = await db.categories.count();
    const favorites = all.filter((s) => s.favorite).length;
    return { total: all.length, species, categories, favorites };
  }, [], { total: 0, species: 0, categories: 0, favorites: 0 });

  return (
    <AppShell>
      <PageHeader title="Profile" subtitle="Your birding life list" />
      <div className="mx-5 flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
        <img src={appIcon} alt="FeatherQuest" className="h-14 w-14 rounded-xl" />
        <div>
          <p className="font-display text-lg font-semibold">FeatherQuest</p>
          <p className="text-xs text-muted-foreground">Your private field journal</p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 px-5">
        <Stat label="Sightings" value={stats.total} />
        <Stat label="Unique species" value={stats.species} />
        <Stat label="Categories" value={stats.categories} />
        <Stat label="Favorites" value={stats.favorites} />
      </div>

      <div className="mt-6 space-y-2 px-5">
        <Row label="Dark mode" hint="Coming in Phase 10" />
        <Row label="Backup / Export" hint="Coming in Phase 9" />
        <Row label="Categories" hint="Manage in Phase 6" />
      </div>
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="font-display text-3xl font-semibold">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function Row({ label, hint }: { label: string; hint: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3">
      <span className="text-sm font-medium">{label}</span>
      <span className="text-xs text-muted-foreground">{hint}</span>
    </div>
  );
}
