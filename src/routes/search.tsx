import { createFileRoute } from "@tanstack/react-router";
import { AppShell, EmptyState, PageHeader } from "@/components/AppShell";
import { Search as SearchIcon } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/search")({
  head: () => ({ meta: [{ title: "Search — FeatherQuest" }] }),
  component: SearchPage,
});

function SearchPage() {
  const [q, setQ] = useState("");
  return (
    <AppShell>
      <PageHeader title="Search" subtitle="Find birds, notes, or dates" />
      <div className="px-5">
        <div className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-3">
          <SearchIcon className="h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search sightings…"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
      </div>
      <EmptyState
        icon="🔍"
        title="Start typing"
        description="Search is wired to your local journal — results appear as you add sightings."
      />
    </AppShell>
  );
}
