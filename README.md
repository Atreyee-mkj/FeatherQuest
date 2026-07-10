# FeatherQuest 🪶

**Your personal offline bird journal.**

FeatherQuest is a mobile-first, offline-first birdwatching journal. Log
sightings, attach photos, record bird calls, organize by category, track
your life list, and earn achievements — all stored privately on your
device.

---

## Features

- 📖 **Bird journal** — name, date, time, location, notes
- 📷 **Photos** — camera capture, gallery import, multiple per sighting
- 🎙 **Audio** — record, save, play, pause, delete bird calls
- 🗂 **Categories** — create, rename, delete custom folders
- 🔍 **Search & filters** — bird name, notes, date; photos / audio /
  favorites / category filters
- ⭐ **Favorites** — bookmark memorable sightings
- 📊 **Life list dashboard** — sightings, species, photos, recordings,
  categories, favorites
- 🏆 **Achievements** — 6 unlockable badges with streak tracking
- 💾 **Backup** — one-click ZIP export of journal, photos, and audio
- 🌙 **Dark mode**
- 🔌 **Offline-first** — 100% usable without internet

---

## Tech Stack

- **Framework:** TanStack Start (React 19, Vite 7, SSR)
- **Styling:** Tailwind CSS v4
- **Local storage:** Dexie (IndexedDB) for structured data + media Blobs
- **Media capture:** MediaRecorder API, `<input capture>` for photos
- **Backup:** JSZip

---

## Running Locally

```bash
bun install
bun dev
```

Open http://localhost:8080.

### Build

```bash
bun run build
```

---

## Project Structure

```
src/
  routes/          file-based routes (index, new, search, achievements, profile, sighting.$id)
  components/      AppShell, BottomNav, SightingForm, SightingCard, CategoryManager, media/*
  lib/             db (Dexie), badges, backup, error handling
  hooks/           use-theme, use-object-url, use-mobile
```

See [`USER_GUIDE.md`](./USER_GUIDE.md) for end-user documentation.

---

## Privacy

All data lives in your browser's IndexedDB. Nothing is sent to a server.
Use **Profile → Export backup** to save a copy.

---

## License

MIT
