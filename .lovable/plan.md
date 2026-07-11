## FeatherQuest — Phase 2 Feature Expansion

A large but cohesive set of enhancements. All offline-first, all local storage. Grouped into 6 workstreams that can be built in one pass.

---

### 1. Profile foundations (`src/lib/profile.ts` new, `src/routes/profile.tsx`)

Add a lightweight local profile stored in Dexie (new `profile` table, single row keyed `me`):
- `displayName?: string`
- `avatarBlob?: Blob` (from camera or gallery)
- `bio?: string` ("Birdwatching summary")

New profile page layout:
- Large avatar (tap to change → reuse `PhotoPicker` pattern with camera + gallery)
- Editable display name + one-line summary (inline edit → save on blur)
- Achievement strip (top 4 unlocked badges + "View all")
- Personal statistics (existing rich stats)
- Dark mode toggle + Backup shortcuts (already there — polished)
- New: **Share stats card** button

### 2. Shareable statistics card (`src/components/ShareCard.tsx` new)

Render a poster-style card (600×900) into an offscreen `<div>`, then rasterize with **html-to-image** (bundled, no network). Card contains:
- Avatar + display name
- Total sightings · unique species · photos · recordings
- Current streak + longest streak
- Grid of unlocked badge icons (up to 8, "+N more")
- "FeatherQuest" wordmark footer

Actions:
- **Save as image** → download PNG
- **Share** → use `navigator.share({ files: [pngFile] })` when available (mobile), fall back to download + copy hint

Add dependency: `html-to-image`.

### 3. Sighting: number observed (`src/lib/db.ts`, `SightingForm.tsx`, `sighting.$id.tsx`, `SightingCard.tsx`)

- Add optional `count?: number` to `Sighting` (default 1). Non-indexed, no migration.
- Form: small number input next to Rarity ("How many did you see?")
- Card + detail: show "×3" chip when >1.
- All aggregate stats that reference "total observations" now sum `count ?? 1` instead of counting rows.

### 4. Advanced statistics (`src/lib/stats.ts`, `src/routes/profile.tsx`)

Extend `computeRichStats` with:
- Monthly sightings (last 6 months as a mini bar chart via styled divs)
- Weekly activity (7 bars — one per weekday, all-time)
- Average sightings per week (last 12 weeks)
- Favorite category (already have "favorite habitat" — rename display to distinguish habitat = top location text vs category = top folder). Keep both.
- Most observed species (already exists as "most seen species" — keep)

Rendered in a new "Statistics" panel on Profile above the tile grid. Bars are pure CSS (no chart lib).

### 5. "On This Day" memories (`src/components/OnThisDay.tsx` new, `src/routes/index.tsx`)

- On Home, above the timeline: query sightings where the `MM-DD` portion of `date` matches today's `MM-DD` and year < current year.
- If any exist, show a horizontally scrollable strip of memory cards: thumbnail photo, bird name, date ("2 years ago"), first line of notes, tap → `/sighting/$id`.
- Hidden entirely when there are no matches (no empty state noise).

### 6. Enhanced search & filters (`src/routes/search.tsx`)

Expand existing filter bar with collapsible "More filters" panel:
- Habitat (category multi-select) — already partially there, promote to multi
- Behavior (multi-select chips from `BEHAVIORS`)
- Weather condition (multi chips from `WEATHER_CONDITIONS`)
- Number observed (min slider: any / 2+ / 5+ / 10+)
- Date range (from/to date inputs)

All filters AND-combine. Show active filter count on toggle. "Clear all" resets.

### 7. Empty states + UI polish (cross-cutting)

New `src/components/EmptyState.tsx`: icon + heading + subtext + optional CTA. Used on:
- Home (no sightings)
- Search (no results)
- Achievements (all locked)
- Favorites filter (none favorited)
- On This Day is silent when empty

Polish pass:
- Card shadow tokens softened; radius bumped to `rounded-3xl` for hero cards, `rounded-2xl` elsewhere (already close — audit).
- Add `animate-fade-in` on route mount for main content wrappers.
- Consistent lucide icon sizing (`h-4 w-4` inline, `h-5 w-5` in nav).
- Image gallery in sighting detail: 2-col grid with rounded thumbnails, tap-to-zoom lightbox (simple overlay, no new dep).
- Dark mode: tighten contrast on chips and progress bars.

---

## Technical notes

- **New dep:** `html-to-image` (~15KB, no network, works offline). Used only in ShareCard.
- **Dexie v3 bump:** add `profile` store, keep existing stores. Non-indexed `count` on Sighting = no migration.
- **Web Share API:** `navigator.canShare({ files })` — feature-detect, fall back to download.
- **Aggregations:** switch total-observation counters to sum `count ?? 1`; unique-species count unchanged.
- **No network calls anywhere** — preserves offline-first.

## Out of scope

- Cloud sync / accounts (violates privacy-first)
- Native share to specific apps beyond what Web Share provides
- Charting library (all bars are styled divs)
- Push/local notifications
