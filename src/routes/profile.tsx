import { createFileRoute } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { useState } from "react";
import { Download, Loader2, Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { AppShell, PageHeader } from "@/components/AppShell";
import { CategoryManager } from "@/components/CategoryManager";
import { db } from "@/lib/db";
import { downloadBackup } from "@/lib/backup";
import appIcon from "@/assets/app-icon.png";


export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile — FeatherQuest" }] }),
  component: Profile,
});

function Profile() {
  const stats = useLiveQuery(async () => {
    if (!db) return { total: 0, species: 0, categories: 0, favorites: 0, photos: 0, audios: 0 };
    const all = await db.sightings.toArray();
    const species = new Set(all.map((s) => s.birdName.trim().toLowerCase()).filter(Boolean)).size;
    const categories = await db.categories.count();
    const favorites = all.filter((s) => s.favorite).length;
    const photos = await db.media.where("kind").equals("photo").count();
    const audios = await db.media.where("kind").equals("audio").count();
    return { total: all.length, species, categories, favorites, photos, audios };
  }, [], { total: 0, species: 0, categories: 0, favorites: 0, photos: 0, audios: 0 });


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
        <Stat label="Photos" value={stats.photos} />
        <Stat label="Recordings" value={stats.audios} />
        <Stat label="Categories" value={stats.categories} />
        <Stat label="Favorites" value={stats.favorites} />
      </div>


      <div className="mt-6 px-5">
        <CategoryManager />
      </div>

      <div className="mt-4 space-y-2 px-5">
        <BackupRow />
        <DarkModeRow />
      </div>
    </AppShell>
  );
}

function DarkModeRow() {
  const { theme, toggle, ready } = useTheme();
  const on = theme === "dark";
  return (
    <button
      type="button"
      onClick={toggle}
      disabled={!ready}
      className="flex w-full items-center justify-between rounded-xl border border-border bg-card px-4 py-3 text-left transition hover:bg-accent/20"
    >
      <div className="flex items-center gap-3">
        {on ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        <span className="text-sm font-medium">Dark mode</span>
      </div>
      <span
        aria-hidden
        className={`relative h-6 w-11 rounded-full transition ${on ? "bg-primary" : "bg-muted"}`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-background shadow transition-transform ${on ? "translate-x-5" : "translate-x-0.5"}`}
        />
      </span>
    </button>
  );
}

function BackupRow() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function handleExport() {
    setBusy(true);
    setError(null);
    try {
      await downloadBackup();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Export failed");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Backup &amp; export</p>
          <p className="text-xs text-muted-foreground">
            Download a ZIP with all sightings, photos, and audio.
          </p>
        </div>
        <button
          type="button"
          onClick={handleExport}
          disabled={busy}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-60"
        >
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
          {busy ? "Preparing…" : "Export"}
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
    </div>
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

