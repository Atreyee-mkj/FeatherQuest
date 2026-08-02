import { createFileRoute, Link } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { useState } from "react";
import { Download, Loader2, Moon, Pencil, Share2, Sun } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { AppShell, PageHeader } from "@/components/AppShell";
import { CategoryManager } from "@/components/CategoryManager";
import { AvatarPicker } from "@/components/AvatarPicker";
import { ShareCardDialog } from "@/components/ShareCard";
import { db } from "@/lib/db";
import { downloadBackup } from "@/lib/backup";
import { computeRichStats } from "@/lib/stats";
import { getProfile, updateProfile } from "@/lib/profile";
import { BADGES } from "@/lib/badges";

export const Route = createFileRoute("/app/profile")({
  head: () => ({ meta: [{ title: "Profile — FeatherQuest" }] }),
  component: Profile,
});

function Profile() {
  const [shareOpen, setShareOpen] = useState(false);

  const stats = useLiveQuery(
    async () => {
      if (!db) return { total: 0, species: 0, categories: 0, favorites: 0, photos: 0, audios: 0 };
      const all = await db.sightings.toArray();
      const species = new Set(all.map((s) => s.birdName.trim().toLowerCase()).filter(Boolean)).size;
      const categories = await db.categories.count();
      const favorites = all.filter((s) => s.favorite).length;
      const photos = await db.media.where("kind").equals("photo").count();
      const audios = await db.media.where("kind").equals("audio").count();
      return { total: all.length, species, categories, favorites, photos, audios };
    },
    [],
    { total: 0, species: 0, categories: 0, favorites: 0, photos: 0, audios: 0 },
  );

  const sightingCount = useLiveQuery(() => (db ? db.sightings.count() : Promise.resolve(0)), []) ?? 0;
  const catCount = useLiveQuery(() => (db ? db.categories.count() : Promise.resolve(0)), []) ?? 0;
  const rich = useLiveQuery(() => computeRichStats(), [sightingCount, catCount]);
  const profile = useLiveQuery(() => getProfile(), []);
  const badges =
    useLiveQuery(
      () => (db ? db.badges.toArray() : Promise.resolve([] as import("@/lib/db").Badge[])),
      [],
    ) ?? [];
  const unlocked = BADGES.filter((b) => badges.find((x) => x.id === b.id)?.unlocked);


  return (
    <AppShell>
      <PageHeader title="Profile" subtitle="Your birding life list" />

      {/* Identity card */}
      <div className="mx-5 flex items-start gap-4 rounded-3xl border border-border bg-card p-5 shadow-sm">
        <AvatarPicker blob={profile?.avatarBlob} />
        <div className="min-w-0 flex-1">
          <InlineEdit
            value={profile?.displayName ?? ""}
            placeholder="Your name"
            className="font-display text-xl font-semibold"
            onSave={(v) => updateProfile({ displayName: v.trim() || undefined })}
          />
          <InlineEdit
            value={profile?.bio ?? ""}
            placeholder="A short birdwatching summary…"
            className="mt-1 text-sm text-muted-foreground"
            multiline
            onSave={(v) => updateProfile({ bio: v.trim() || undefined })}
          />
        </div>
      </div>

      {/* Achievement strip */}
      <div className="mx-5 mt-4 rounded-2xl border border-border bg-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Achievements
          </h2>
          <Link
            to="/app/achievements"
            className="text-xs font-semibold text-primary"
          >
            View all →
          </Link>
        </div>
        {unlocked.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No badges yet — log a sighting to earn your first.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {unlocked.slice(0, 6).map((b) => (
              <span
                key={b.id}
                title={b.name}
                className="grid h-11 w-11 place-items-center rounded-xl bg-muted text-xl"
              >
                {b.icon}
              </span>
            ))}
            {unlocked.length > 6 && (
              <span className="grid h-11 min-w-11 place-items-center rounded-xl bg-muted px-2 text-xs font-semibold">
                +{unlocked.length - 6}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Share stats */}
      <div className="mx-5 mt-4">
        <button
          type="button"
          onClick={() => setShareOpen(true)}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20"
        >
          <Share2 className="h-4 w-4" /> Share stats card
        </button>
      </div>

      {/* This Month */}
      {rich && stats.total > 0 && (
        <div className="mx-5 mt-5 rounded-2xl border border-border bg-card p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {rich.monthLabel}
          </p>
          <p className="mt-1 font-display text-2xl font-semibold">
            {rich.monthCount} {rich.monthCount === 1 ? "sighting" : "sightings"}
          </p>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{
                width: `${
                  rich.bestMonthCount > 0
                    ? Math.max(4, Math.round((rich.monthCount / rich.bestMonthCount) * 100))
                    : 0
                }%`,
              }}
            />
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <RichRow label="Most active day" value={rich.mostActiveWeekday ?? "—"} />
            <RichRow label="Most observed" value={rich.mostSeenSpecies ?? "—"} />
            <RichRow
              label="Current streak"
              value={`${rich.currentStreak} ${rich.currentStreak === 1 ? "day" : "days"}`}
            />
            <RichRow
              label="Longest streak"
              value={`${rich.longestStreak} ${rich.longestStreak === 1 ? "day" : "days"}`}
            />
            <RichRow label="Favorite habitat" value={rich.favoriteHabitat ?? "—"} />
            <RichRow label="Favorite category" value={rich.favoriteCategory ?? "—"} />
            <RichRow label="Avg per week" value={`${rich.avgPerWeek}`} />
            <RichRow label="Total observed" value={`${rich.totalObservations}`} />
          </dl>
        </div>
      )}

      {/* Monthly bar chart */}
      {rich && stats.total > 0 && (
        <div className="mx-5 mt-4 rounded-2xl border border-border bg-card p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Last 6 months
          </p>
          <MiniBars bars={rich.monthlyBars} />
        </div>
      )}

      {/* Weekday activity */}
      {rich && stats.total > 0 && (
        <div className="mx-5 mt-4 rounded-2xl border border-border bg-card p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Weekly activity
          </p>
          <MiniBars bars={rich.weekdayBars} />
        </div>
      )}

      {/* Tile grid */}
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

      <ShareCardDialog
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        profile={profile ?? undefined}
      />
    </AppShell>
  );
}

function InlineEdit({
  value,
  placeholder,
  className,
  multiline,
  onSave,
}: {
  value: string;
  placeholder: string;
  className?: string;
  multiline?: boolean;
  onSave: (v: string) => void | Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => {
          setDraft(value);
          setEditing(true);
        }}
        className={`group flex w-full items-center gap-1.5 text-left ${className ?? ""}`}
      >
        <span className={value ? "" : "italic text-muted-foreground"}>
          {value || placeholder}
        </span>
        <Pencil className="h-3 w-3 opacity-0 transition group-hover:opacity-60" />
      </button>
    );
  }

  const commit = async () => {
    setEditing(false);
    if (draft !== value) await onSave(draft);
  };

  const shared = `w-full bg-transparent outline-none focus:ring-2 focus:ring-ring rounded-md px-1 ${className ?? ""}`;
  return multiline ? (
    <textarea
      autoFocus
      rows={2}
      value={draft}
      placeholder={placeholder}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      className={shared}
    />
  ) : (
    <input
      autoFocus
      value={draft}
      placeholder={placeholder}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") (e.target as HTMLInputElement).blur();
      }}
      className={shared}
    />
  );
}

function MiniBars({ bars }: { bars: { label: string; count: number }[] }) {
  const max = Math.max(1, ...bars.map((b) => b.count));
  return (
    <div className="flex h-24 items-end gap-1.5">
      {bars.map((b, i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-1">
          <div className="flex h-full w-full items-end">
            <div
              className="w-full rounded-t-md bg-primary/80 transition-all"
              style={{
                height: `${Math.max(4, Math.round((b.count / max) * 100))}%`,
                opacity: b.count === 0 ? 0.2 : 1,
              }}
              title={`${b.label}: ${b.count}`}
            />
          </div>
          <span className="text-[10px] text-muted-foreground">{b.label}</span>
        </div>
      ))}
    </div>
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
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <p className="font-display text-3xl font-semibold">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function RichRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 truncate font-semibold">{value}</dd>
    </div>
  );
}
