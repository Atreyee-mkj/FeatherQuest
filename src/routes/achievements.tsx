import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/AppShell";

const badges = [
  { icon: "🌱", name: "First Feather", desc: "Log your first bird" },
  { icon: "🐦", name: "Bird Explorer", desc: "10 unique species" },
  { icon: "🦅", name: "Hawk Eye", desc: "50 unique species" },
  { icon: "🎙", name: "Audio Pioneer", desc: "10 recordings" },
  { icon: "📷", name: "Photographer", desc: "25 photos captured" },
  { icon: "🔥", name: "Weekly Watcher", desc: "7-day logging streak" },
];

export const Route = createFileRoute("/achievements")({
  head: () => ({ meta: [{ title: "Achievements — FeatherQuest" }] }),
  component: Achievements,
});

function Achievements() {
  return (
    <AppShell>
      <PageHeader title="Achievements" subtitle="Milestones on your birding journey" />
      <div className="grid grid-cols-2 gap-3 px-5">
        {badges.map((b) => (
          <div
            key={b.name}
            className="rounded-2xl border border-border bg-card p-4 text-center opacity-70"
          >
            <div className="text-3xl">{b.icon}</div>
            <h3 className="mt-2 font-display text-sm font-semibold">{b.name}</h3>
            <p className="mt-1 text-xs text-muted-foreground">{b.desc}</p>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
