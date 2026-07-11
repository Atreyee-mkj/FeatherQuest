import { useState, type ReactNode } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, type Category } from "@/lib/db";
import {
  BEHAVIORS,
  MOODS,
  RARITIES,
  WEATHER_CONDITIONS,
} from "@/lib/journal-meta";

export interface SightingFormValues {
  birdName: string;
  date: string;
  time: string;
  location: string;
  notes: string;
  categoryId?: number;
  mood?: string;
  rarity?: string;
  behaviors: string[];
  weatherCondition?: string;
  weatherTempC?: number;
  count?: number;
}


export function SightingForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
  extraContent,
}: {
  extraContent?: ReactNode;
  initial: SightingFormValues;
  submitLabel: string;
  onSubmit: (values: SightingFormValues) => Promise<void> | void;
  onCancel?: () => void;
}) {
  const [values, setValues] = useState<SightingFormValues>(initial);
  const [saving, setSaving] = useState(false);

  function update<K extends keyof SightingFormValues>(key: K, val: SightingFormValues[K]) {
    setValues((v) => ({ ...v, [key]: val }));
  }

  function toggleBehavior(id: string) {
    setValues((v) => {
      const has = v.behaviors.includes(id);
      return { ...v, behaviors: has ? v.behaviors.filter((b) => b !== id) : [...v.behaviors, id] };
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!values.birdName.trim()) return;
    setSaving(true);
    try {
      await onSubmit(values);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 px-5">
      <Field label="Bird name">
        <input
          value={values.birdName}
          onChange={(e) => update("birdName", e.target.value)}
          placeholder="American Robin"
          className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Date">
          <input
            type="date"
            value={values.date}
            onChange={(e) => update("date", e.target.value)}
            className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </Field>
        <Field label="Time">
          <input
            type="time"
            value={values.time}
            onChange={(e) => update("time", e.target.value)}
            className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </Field>
      </div>
      <Field label="Location (optional)">
        <input
          value={values.location}
          onChange={(e) => update("location", e.target.value)}
          placeholder="Backyard oak tree"
          className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
      </Field>
      <Field label="Category">
        <CategorySelect
          value={values.categoryId}
          onChange={(id) => update("categoryId", id)}
        />
      </Field>

      <div className="grid grid-cols-[1fr_auto] gap-3">
        <Field label="Rarity">
          <div className="flex flex-wrap gap-2">
            <Chip active={!values.rarity} onClick={() => update("rarity", undefined)}>
              —
            </Chip>
            {RARITIES.map((r) => (
              <Chip
                key={r.id}
                active={values.rarity === r.id}
                onClick={() => update("rarity", values.rarity === r.id ? undefined : r.id)}
                highlight={r.id === "lifer"}
              >
                {r.label}
              </Chip>
            ))}
          </div>
        </Field>
        <Field label="How many?">
          <input
            type="number"
            inputMode="numeric"
            min={1}
            value={values.count ?? ""}
            onChange={(e) =>
              update(
                "count",
                e.target.value === "" ? undefined : Math.max(1, Number(e.target.value)),
              )
            }
            placeholder="1"
            className="w-20 rounded-xl border border-border bg-card px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </Field>
      </div>


      <Field label="Mood">
        <div className="flex flex-wrap gap-2">
          <Chip active={!values.mood} onClick={() => update("mood", undefined)}>
            —
          </Chip>
          {MOODS.map((m) => (
            <Chip
              key={m.id}
              active={values.mood === m.id}
              onClick={() => update("mood", values.mood === m.id ? undefined : m.id)}
            >
              <span aria-hidden>{m.emoji}</span> {m.label}
            </Chip>
          ))}
        </div>
      </Field>

      <Field label="Behavior">
        <div className="flex flex-wrap gap-2">
          {BEHAVIORS.map((b) => (
            <Chip
              key={b.id}
              active={values.behaviors.includes(b.id)}
              onClick={() => toggleBehavior(b.id)}
            >
              <span aria-hidden>{b.emoji}</span> {b.label}
            </Chip>
          ))}
        </div>
      </Field>

      <Field label="Weather">
        <div className="flex flex-wrap gap-2">
          <Chip
            active={!values.weatherCondition}
            onClick={() => update("weatherCondition", undefined)}
          >
            —
          </Chip>
          {WEATHER_CONDITIONS.map((w) => (
            <Chip
              key={w.id}
              active={values.weatherCondition === w.id}
              onClick={() =>
                update(
                  "weatherCondition",
                  values.weatherCondition === w.id ? undefined : w.id,
                )
              }
            >
              <span aria-hidden>{w.emoji}</span> {w.label}
            </Chip>
          ))}
        </div>
        <div className="mt-2">
          <input
            type="number"
            inputMode="numeric"
            value={values.weatherTempC ?? ""}
            onChange={(e) =>
              update(
                "weatherTempC",
                e.target.value === "" ? undefined : Number(e.target.value),
              )
            }
            placeholder="Temperature °C (optional)"
            className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </Field>

      <Field label="Notes">
        <textarea
          value={values.notes}
          onChange={(e) => update("notes", e.target.value)}
          rows={4}
          placeholder="Behavior, weather, what caught your eye…"
          className="w-full resize-none rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
      </Field>
      {extraContent}
      <div className="flex gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-full border border-border bg-card py-3 text-sm font-semibold"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={saving || !values.birdName.trim()}
          className="flex-1 rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-opacity disabled:opacity-50"
        >
          {saving ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}

function CategorySelect({
  value,
  onChange,
}: {
  value: number | undefined;
  onChange: (id: number | undefined) => void;
}) {
  const categories =
    useLiveQuery<Category[]>(
      () => (db ? db.categories.toArray() : Promise.resolve([] as Category[])),
      [],
    ) ?? [];
  return (
    <div className="flex flex-wrap gap-2">
      <Chip active={value === undefined} onClick={() => onChange(undefined)}>
        None
      </Chip>
      {categories.map((c) => (
        <Chip key={c.id} active={value === c.id} onClick={() => onChange(c.id)}>
          <span aria-hidden>{c.icon}</span> {c.name}
        </Chip>
      ))}
    </div>
  );
}

function Chip({
  active,
  onClick,
  highlight,
  children,
}: {
  active: boolean;
  onClick: () => void;
  highlight?: boolean;
  children: React.ReactNode;
}) {
  const base = "inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors";
  const cls = active
    ? "border-primary bg-primary text-primary-foreground"
    : highlight
      ? "border-accent bg-accent/10 text-accent"
      : "border-border bg-card text-foreground";
  return (
    <button type="button" onClick={onClick} className={`${base} ${cls}`}>
      {children}
    </button>
  );
}
