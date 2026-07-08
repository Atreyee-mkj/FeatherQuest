import { useLiveQuery } from "dexie-react-hooks";
import { useState } from "react";
import { db, type Category } from "@/lib/db";
import { Pencil, Trash2, Plus, Check, X } from "lucide-react";

const PALETTE = ["#5a8a5c", "#1a3c2a", "#2d8a9e", "#b56c3a", "#7d5ba6", "#c94f4f"];
const ICONS = ["🏡", "🌲", "💧", "🏞️", "🏔️", "🌾", "🌊", "🦉", "🪶", "🌅"];

export function CategoryManager() {
  const categories =
    useLiveQuery<Category[]>(
      () => (db ? db.categories.orderBy("name").toArray() : Promise.resolve([] as Category[])),
      [],
    ) ?? [];

  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState(ICONS[0]);
  const [color, setColor] = useState(PALETTE[0]);
  const [editingId, setEditingId] = useState<number | null>(null);

  async function create() {
    const trimmed = name.trim();
    if (!trimmed) return;
    await db.categories.add({ name: trimmed, icon, color });
    setName("");
    setIcon(ICONS[0]);
    setColor(PALETTE[0]);
    setAdding(false);
  }

  async function remove(id: number) {
    if (!confirm("Delete this category? Sightings will keep their notes but lose the tag.")) return;
    await db.categories.delete(id);
    // detach from sightings
    const affected = await db.sightings.where("categoryId").equals(id).toArray();
    await Promise.all(
      affected.map((s) => s.id ? db.sightings.update(s.id, { categoryId: undefined }) : null),
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold">Categories</h2>
        {!adding && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
          >
            <Plus className="h-3.5 w-3.5" /> New
          </button>
        )}
      </div>

      {adding && (
        <div className="mb-3 space-y-2 rounded-xl border border-border bg-background p-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Category name"
            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            autoFocus
          />
          <div className="flex flex-wrap gap-1">
            {ICONS.map((i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIcon(i)}
                className={`h-8 w-8 rounded-lg text-base ${icon === i ? "bg-primary text-primary-foreground" : "bg-card"}`}
              >
                {i}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-1">
            {PALETTE.map((c) => (
              <button
                key={c}
                type="button"
                aria-label={c}
                onClick={() => setColor(c)}
                className={`h-7 w-7 rounded-full border-2 ${color === c ? "border-foreground" : "border-transparent"}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setAdding(false);
                setName("");
              }}
              className="flex-1 rounded-full border border-border py-2 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={create}
              disabled={!name.trim()}
              className="flex-1 rounded-full bg-primary py-2 text-xs font-semibold text-primary-foreground disabled:opacity-50"
            >
              Add
            </button>
          </div>
        </div>
      )}

      {categories.length === 0 ? (
        <p className="text-sm text-muted-foreground">No categories yet. Add one to organize sightings.</p>
      ) : (
        <ul className="space-y-2">
          {categories.map((c) =>
            editingId === c.id ? (
              <EditRow key={c.id} category={c} onDone={() => setEditingId(null)} />
            ) : (
              <li
                key={c.id}
                className="flex items-center justify-between rounded-xl border border-border bg-background px-3 py-2"
              >
                <span
                  className="inline-flex items-center gap-2 rounded-full px-2 py-0.5 text-sm font-semibold"
                  style={{ backgroundColor: `${c.color}22`, color: c.color }}
                >
                  <span aria-hidden>{c.icon}</span> {c.name}
                </span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setEditingId(c.id!)}
                    aria-label="Rename"
                    className="rounded-full p-1.5 text-muted-foreground"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => c.id && remove(c.id)}
                    aria-label="Delete"
                    className="rounded-full p-1.5 text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ),
          )}
        </ul>
      )}
    </div>
  );
}

function EditRow({ category, onDone }: { category: Category; onDone: () => void }) {
  const [name, setName] = useState(category.name);
  const [icon, setIcon] = useState(category.icon);
  const [color, setColor] = useState(category.color);

  async function save() {
    const trimmed = name.trim();
    if (!trimmed || !category.id) return;
    await db.categories.update(category.id, { name: trimmed, icon, color });
    onDone();
  }

  return (
    <li className="space-y-2 rounded-xl border border-border bg-background p-3">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
        autoFocus
      />
      <div className="flex flex-wrap gap-1">
        {ICONS.map((i) => (
          <button
            key={i}
            type="button"
            onClick={() => setIcon(i)}
            className={`h-8 w-8 rounded-lg text-base ${icon === i ? "bg-primary text-primary-foreground" : "bg-card"}`}
          >
            {i}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-1">
        {PALETTE.map((c) => (
          <button
            key={c}
            type="button"
            aria-label={c}
            onClick={() => setColor(c)}
            className={`h-7 w-7 rounded-full border-2 ${color === c ? "border-foreground" : "border-transparent"}`}
            style={{ backgroundColor: c }}
          />
        ))}
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onDone}
          className="flex-1 inline-flex items-center justify-center gap-1 rounded-full border border-border py-2 text-xs font-semibold"
        >
          <X className="h-3.5 w-3.5" /> Cancel
        </button>
        <button
          type="button"
          onClick={save}
          disabled={!name.trim()}
          className="flex-1 inline-flex items-center justify-center gap-1 rounded-full bg-primary py-2 text-xs font-semibold text-primary-foreground disabled:opacity-50"
        >
          <Check className="h-3.5 w-3.5" /> Save
        </button>
      </div>
    </li>
  );
}
