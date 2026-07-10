## Overview

Expand FeatherQuest with journal-style enrichments: 5 new badges, a real stats dashboard, and per-sighting mood/rarity/behavior/weather fields. All offline, all local.

## 1. Data model (`src/lib/db.ts`)

Bump Dexie to **version 2** with new optional fields on `Sighting` (all optional so existing records keep working — no migration script needed):

- `mood?: "amazed" | "peaceful" | "excited" | "proud"`
- `rarity?: "common" | "uncommon" | "rare" | "lifer"`
- `behaviors?: string[]` (singing, flying, feeding, nesting, perched, hunting)
- `weather?: { condition?: string; tempC?: number }` — free-form, user-entered (no network calls, offline-first)

## 2. New badges (`src/lib/badges.ts`)

Add to `Stats`: `earliestHour`, `latestHour`, `weekendMonthStreak`.

New defs:
- 🌄 **Sunrise Birder** — any sighting with time < 07:00
- 🌙 **Night Owl** — any sighting with time ≥ 19:00
- 🚶 **Trail Walker** — 100 sightings
- 🌈 **Weekend Warrior** — at least one sighting on every Sat+Sun of the last 4 weekends
- 🪶 **Feather Collector** — 100 total observations (same threshold as Trail Walker but framed on observations count including re-sightings; keep both, they unlock together at 100)

## 3. Sighting form (`src/components/SightingForm.tsx`)

Add four new sections rendered as chip groups / simple inputs:
- **Mood** — 4 emoji chips (single select)
- **Rarity** — 4 chips (single select), "Lifer" highlighted
- **Behavior** — 6 chips (multi-select)
- **Weather** — condition chips (☀️ Sunny, ⛅ Cloudy, 🌧 Rainy, ❄️ Snow, 🌫 Foggy, 💨 Windy) + optional temperature number input

Wire values through `SightingFormValues` and pass to save handlers in `new.tsx` and `sighting.$id.tsx`.

## 4. Sighting detail (`src/routes/sighting.$id.tsx`)

Display the new fields as compact metadata rows: mood emoji, rarity pill (Lifer glows), behavior chips, weather line ("🌤 Sunny · 29°C").

## 5. Sighting card (`src/components/SightingCard.tsx`)

Add small indicators: rarity pill ("Lifer!" gets accent color) and mood emoji next to the favorite star.

## 6. Statistics dashboard (`src/routes/profile.tsx`)

Replace flat number grid with a richer **This Month** panel:
- Sightings this month with a horizontal bar (proportion vs best month)
- Most active weekday (e.g. "Saturday")
- Most seen species
- Longest streak (days)
- Favorite habitat (top category by sighting count)

Keep the existing 6 stat tiles below as a compact grid.

New helper `src/lib/stats.ts` computes all of the above from Dexie in one pass.

## Technical notes

- Dexie v2 upgrade: `this.version(2).stores({...})` — no schema index changes required (new fields aren't indexed), so we can just re-declare version 2 with the same stores string to trigger a no-op upgrade; existing rows keep old shape and reads default missing fields to undefined.
- All new UI uses existing semantic tokens (`bg-card`, `text-primary`, etc.) — no hardcoded colors.
- No network: weather is user-tagged, not fetched.

## Out of scope

- Auto weather fetch (would require online API + geolocation permission — conflicts with "offline first")
- Charts library (bar rendered with a styled div for the This Month panel)
