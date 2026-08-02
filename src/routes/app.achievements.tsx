import { createFileRoute } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { useEffect } from "react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { db, type Badge } from "@/lib/db";
import { BADGES, evaluateBadges } from "@/lib/badges";

export const Route = createFileRoute("/app/achievements")({
  head: () => ({ meta: [{ title: "Achievements — FeatherQuest" }] }),
  component: Achievements,
});

function Achievements() {
  // Reactive triggers: re-evaluate when data changes
  const sightingCount = useLiveQuery(() => (db ? db.sightings.count() : Promise.resolve(0)), []) ?? 0;
  const mediaCount = useLiveQuery(() => (db ? db.media.count() : Promise.resolve(0)), []) ?? 0;

  useEffect(() => {
    void evaluateBadges();
  }, [sightingCount, mediaCount]);

  const badges =
    useLiveQuery<Badge[]>(() => (db ? db.badges.toArray() : Promise.resolve([] as Badge[])), []) ?? [];
  const byId = new Map(badges.map((b) => [b.id, b]));

  const unlockedCount = BADGES.filter((d) => byId.get(d.id)?.unlocked).length;

  return (
    <AppShell>
      <PageHeader
        title="Achievements"
        subtitle={`${unlockedCount} of ${BADGES.length} unlocked`}
      />
      <div className="grid grid-cols-2 gap-3 px-5">
        {BADGES.map((b) => {
          const state = byId.get(b.id);
          const unlocked = !!state?.unlocked;
          return (
            <div
              key={b.id}
              className={`rounded-2xl border p-4 text-center transition ${
                unlocked
                  ? "border-primary/40 bg-card"
                  : "border-border bg-card opacity-50 grayscale"
              }`}
            >
              <div className="text-3xl">{b.icon}</div>
              <h3 className="mt-2 font-display text-sm font-semibold">{b.name}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{b.desc}</p>
              {unlocked && state?.dateUnlocked && (
                <p className="mt-2 text-[10px] font-semibold uppercase tracking-wide text-primary">
                  Unlocked {new Date(state.dateUnlocked).toLocaleDateString()}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}
