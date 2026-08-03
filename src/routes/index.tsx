import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Feather,
  Camera,
  Mic,
  Search,
  Trophy,
  WifiOff,
  ShieldCheck,
  BarChart3,
  Download,
  Star,
} from "lucide-react";
import { InstallButton } from "@/components/InstallButton";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FeatherQuest — Offline Bird Journal for Birdwatchers" },
      {
        name: "description",
        content:
          "Log bird sightings in seconds with photos, calls and field notes. Private, offline-first, and installable on any phone. Free forever.",
      },
      { property: "og:title", content: "FeatherQuest — Offline Bird Journal for Birdwatchers" },
      {
        property: "og:description",
        content:
          "Log bird sightings in seconds with photos, calls and field notes. Private, offline-first, installable on any phone.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://feather-quest.lovable.app/" },
    ],
    links: [{ rel: "canonical", href: "https://feather-quest.lovable.app/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "FeatherQuest",
          applicationCategory: "LifestyleApplication",
          operatingSystem: "Web, Android, iOS",
          description:
            "A private, offline-first birdwatching journal for photos, audio and field notes.",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        }),
      },
    ],
  }),
  component: Landing,
});

const features = [
  {
    icon: Feather,
    title: "Sightings in seconds",
    body: "Species, date, time, place, mood, rarity and behaviour — captured before the bird flies off.",
  },
  {
    icon: Camera,
    title: "Photos that stay yours",
    body: "Snap from the camera or import from your gallery. Multiple shots per sighting, stored on-device.",
  },
  {
    icon: Mic,
    title: "Record the call",
    body: "Tap once to record song and calls, replay them any time, and keep them linked to the sighting.",
  },
  {
    icon: Search,
    title: "Find anything, instantly",
    body: "Search names and notes, then narrow by habitat, behaviour, weather, count, favourites or date range.",
  },
  {
    icon: BarChart3,
    title: "Statistics you'll revisit",
    body: "Life list, monthly activity, most active day, top species, longest streak and favourite habitat.",
  },
  {
    icon: Trophy,
    title: "Badges worth chasing",
    body: "Sunrise Birder, Night Owl, Hawk Eye, Trail Walker and more unlock as your journal grows.",
  },
];

const benefits = [
  {
    icon: WifiOff,
    title: "Works with zero signal",
    body: "Ridges, wetlands, forest floors. The whole app runs offline once installed — nothing to load in the field.",
  },
  {
    icon: ShieldCheck,
    title: "Private by default",
    body: "Every note, photo and recording lives in your device's storage. No accounts, no servers, no tracking.",
  },
  {
    icon: Download,
    title: "Yours to export",
    body: "One tap packages your journal, photos and audio into a ZIP archive you can keep or move anywhere.",
  },
];

const guarantees = [
  {
    icon: ShieldCheck,
    title: "No account, ever",
    body: "There's no sign-up, no email, no password. Open the app and start logging immediately.",
  },
  {
    icon: WifiOff,
    title: "Nothing is uploaded",
    body: "Photos, recordings and notes are written to your device's local database — never to a server.",
  },
  {
    icon: Search,
    title: "Zero tracking",
    body: "No analytics, no ads, no third-party scripts following you between screens.",
  },
  {
    icon: Download,
    title: "You own the exit",
    body: "Export everything as a ZIP whenever you like. Your journal is never locked inside the app.",
  },
];

const capabilities = [
  {
    icon: Mic,
    title: "Record the song",
    body: "Capture calls straight from the field, replay them in the detail view, and keep them attached to the sighting forever.",
  },
  {
    icon: Camera,
    title: "Photos, plural",
    body: "Add as many shots as you like per bird — camera or gallery — with thumbnails on the timeline.",
  },
  {
    icon: BarChart3,
    title: "Shareable stats card",
    body: "Turn your life list, streak and top species into a poster image you can share in one tap.",
  },
  {
    icon: Star,
    title: "Memories & badges",
    body: "\"On This Day\" resurfaces past sightings, while badges track streaks, species counts and habits.",
  },
];

const faqs = [
  {
    q: "Is FeatherQuest really free?",
    a: "Yes. There are no accounts, subscriptions or in-app purchases. Install it and start logging.",
  },
  {
    q: "Where is my data stored?",
    a: "Entirely in your browser's local database on your device. Nothing is uploaded, so only you can see it.",
  },
  {
    q: "Does it work without internet?",
    a: "Once installed, the whole app runs offline — logging, photos, audio, search and statistics all work with no signal.",
  },
  {
    q: "How do I install it on iPhone?",
    a: "Open the site in Safari, tap Share, then Add to Home Screen. It launches full-screen straight into your journal.",
  },
  {
    q: "Can I back my journal up?",
    a: "Yes. Profile → Export creates a ZIP with your sightings, categories, badges, photos and audio recordings.",
  },
  {
    q: "Does it identify birds for me?",
    a: "No — FeatherQuest is a journal, not an identifier. It focuses on recording and reliving the observation itself.",
  },
];

function PhoneMock({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`w-[220px] shrink-0 rounded-[2rem] border-[6px] border-foreground/85 bg-card p-3 shadow-2xl shadow-foreground/20 ${className}`}
    >
      <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-foreground/20" />
      {children}
    </div>
  );
}

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <span className="flex items-center gap-2">
            <img src="/icons/icon-96.png" alt="" className="h-8 w-8" />
            <span className="font-display text-lg font-semibold">FeatherQuest</span>
          </span>
          <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
            <a href="#features" className="transition-colors hover:text-foreground">
              Features
            </a>
            <a href="#benefits" className="transition-colors hover:text-foreground">
              Why offline
            </a>
            <a href="#faq" className="transition-colors hover:text-foreground">
              FAQ
            </a>
          </nav>
          <Link
            to="/app"
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-semibold transition-colors hover:bg-accent"
          >
            Open App
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-32 h-[28rem] w-[28rem] rounded-full bg-primary/10 blur-3xl"
        />
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 md:grid-cols-2 md:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-muted-foreground">
              <WifiOff className="h-3.5 w-3.5 text-primary" />
              Offline-first · No account needed
            </span>
            <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.1] md:text-6xl">
              Your field notebook for every bird you meet.
            </h1>
            <p className="mt-5 max-w-lg text-lg text-muted-foreground">
              FeatherQuest is a private birdwatching journal: photos, calls, notes and statistics,
              captured in seconds and stored entirely on your own device.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <InstallButton />
              <Link
                to="/app"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-6 py-3.5 text-base font-semibold transition-colors hover:bg-accent"
              >
                Open App
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Free forever · Works on Android, iPhone and desktop
            </p>
          </div>

          {/* Hero mockup */}
          <div className="flex justify-center md:justify-end">
            <PhoneMock className="rotate-[-3deg]">
              <div className="space-y-3">
                <p className="font-display text-lg font-semibold">Field Journal</p>
                <div className="rounded-xl border border-border bg-background p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">Indian Robin</span>
                    <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    📍 Delhi Ridge · 🌤 29°C
                  </p>
                  <p className="mt-2 text-[11px] leading-snug text-muted-foreground">
                    "Calling loudly from an acacia tree."
                  </p>
                  <div className="mt-2 flex gap-1.5 text-[10px] text-muted-foreground">
                    <span className="rounded-full bg-accent px-2 py-0.5">🎶 Singing</span>
                    <span className="rounded-full bg-accent px-2 py-0.5">🎙 0:12</span>
                  </div>
                </div>
                <div className="rounded-xl border border-border bg-background p-3">
                  <span className="text-sm font-semibold">Common Kingfisher</span>
                  <p className="mt-1 text-[11px] text-muted-foreground">💧 Wetland · ⭐ Lifer</p>
                  <div className="mt-2 h-14 rounded-lg bg-primary/15" />
                </div>
              </div>
            </PhoneMock>
          </div>
        </div>
      </section>

      {/* Product description */}
      <section className="border-y border-border/60 bg-card/40">
        <div className="mx-auto max-w-3xl px-5 py-16 text-center">
          <h2 className="font-display text-3xl font-semibold md:text-4xl">
            A journal, not a spreadsheet
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Most birding apps race to name the bird. FeatherQuest cares about the morning you saw
            it — the light, the call, the tree it sang from. Log a sighting in under thirty seconds,
            then come back months later to a timeline that still feels like the day itself.
          </p>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-5 py-16 md:py-24">
        <h2 className="font-display text-3xl font-semibold md:text-4xl">Everything in your pocket</h2>
        <p className="mt-3 max-w-xl text-muted-foreground">
          Built for the field: big targets, fast saves, and no waiting on a network.
        </p>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, body }) => (
            <article
              key={title}
              className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-display text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Screenshots / mockups */}
      <section className="border-y border-border/60 bg-card/40">
        <div className="mx-auto max-w-6xl px-5 py-16 md:py-24">
          <h2 className="font-display text-3xl font-semibold md:text-4xl">Take a look inside</h2>
          <div className="mt-10 flex gap-6 overflow-x-auto pb-4">
            <PhoneMock>
              <p className="font-display text-base font-semibold">New Sighting</p>
              <div className="mt-3 space-y-2 text-[11px]">
                <div className="rounded-lg border border-border px-3 py-2 text-muted-foreground">
                  Bird name
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 rounded-lg border border-border px-3 py-2 text-muted-foreground">
                    Date
                  </div>
                  <div className="flex-1 rounded-lg border border-border px-3 py-2 text-muted-foreground">
                    Time
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {["😍 Amazed", "😌 Peaceful", "⭐ Lifer"].map((c) => (
                    <span key={c} className="rounded-full bg-accent px-2 py-1">
                      {c}
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <div className="flex h-16 flex-1 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Camera className="h-5 w-5" />
                  </div>
                  <div className="flex h-16 flex-1 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Mic className="h-5 w-5" />
                  </div>
                </div>
              </div>
            </PhoneMock>

            <PhoneMock>
              <p className="font-display text-base font-semibold">Statistics</p>
              <div className="mt-3 space-y-3 text-[11px]">
                <div className="grid grid-cols-2 gap-2">
                  {[
                    ["128", "Sightings"],
                    ["47", "Species"],
                    ["96", "Photos"],
                    ["23", "Recordings"],
                  ].map(([n, l]) => (
                    <div key={l} className="rounded-lg border border-border p-2">
                      <p className="font-display text-lg font-semibold">{n}</p>
                      <p className="text-muted-foreground">{l}</p>
                    </div>
                  ))}
                </div>
                <div className="space-y-1.5">
                  {[70, 45, 90, 30, 60].map((w, i) => (
                    <div key={i} className="h-2 rounded-full bg-accent">
                      <div className="h-2 rounded-full bg-primary" style={{ width: `${w}%` }} />
                    </div>
                  ))}
                </div>
                <p className="text-muted-foreground">Longest streak · 12 days</p>
              </div>
            </PhoneMock>

            <PhoneMock>
              <p className="font-display text-base font-semibold">Achievements</p>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[10px]">
                {["🌱", "🐦", "🦅", "📷", "🎙", "🔥", "🌄", "🌙", "🪶"].map((e, i) => (
                  <div
                    key={i}
                    className={`rounded-xl border border-border py-3 text-lg ${
                      i > 5 ? "opacity-35" : "bg-primary/10"
                    }`}
                  >
                    {e}
                  </div>
                ))}
              </div>
              <p className="mt-3 text-[11px] text-muted-foreground">6 of 11 badges unlocked</p>
            </PhoneMock>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section id="benefits" className="mx-auto max-w-6xl px-5 py-16 md:py-24">
        <div className="grid gap-8 md:grid-cols-3">
          {benefits.map(({ icon: Icon, title, body }) => (
            <div key={title}>
              <Icon className="h-7 w-7 text-primary" />
              <h3 className="mt-4 font-display text-xl font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-y border-border/60 bg-card/40">
        <div className="mx-auto max-w-6xl px-5 py-16 md:py-24">
          <h2 className="font-display text-3xl font-semibold md:text-4xl">From the field</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Placeholder quotes — swap in real ones once you gather feedback.
          </p>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {testimonials.map((t) => (
              <figure key={t.quote} className="rounded-2xl border border-border bg-card p-6">
                <div className="flex gap-0.5 text-primary">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <blockquote className="mt-4 text-sm leading-relaxed">"{t.quote}"</blockquote>
                <figcaption className="mt-4 text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">{t.name}</span> · {t.role}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl px-5 py-16 md:py-24">
        <h2 className="font-display text-3xl font-semibold md:text-4xl">Questions, answered</h2>
        <div className="mt-8 divide-y divide-border border-y border-border">
          {faqs.map((f) => (
            <details key={f.q} className="group py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                {f.q}
                <span className="text-muted-foreground transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-6xl px-5 pb-16">
        <div className="rounded-3xl bg-primary px-6 py-14 text-center text-primary-foreground">
          <h2 className="font-display text-3xl font-semibold md:text-4xl">
            Your next sighting deserves a home.
          </h2>
          <p className="mx-auto mt-3 max-w-md text-primary-foreground/80">
            Install FeatherQuest and start your life list today — no signup, no signal required.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <InstallButton className="!bg-background !text-foreground" />
            <Link
              to="/app"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-primary-foreground/30 px-6 py-3.5 text-base font-semibold transition-colors hover:bg-primary-foreground/10"
            >
              Open App
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="border-t border-border">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 sm:grid-cols-3">
          <div>
            <span className="flex items-center gap-2">
              <img src="/icons/icon-96.png" alt="" className="h-7 w-7" />
              <span className="font-display font-semibold">FeatherQuest</span>
            </span>
            <p className="mt-3 text-sm text-muted-foreground">
              A private, offline-first bird journal. Built for people who'd rather watch than scroll.
            </p>
          </div>
          <div className="text-sm">
            <h3 className="font-semibold">Product</h3>
            <ul className="mt-3 space-y-2 text-muted-foreground">
              <li>
                <a href="#features" className="hover:text-foreground">
                  Features
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-foreground">
                  FAQ
                </a>
              </li>
              <li>
                <Link to="/app" className="hover:text-foreground">
                  Open the app
                </Link>
              </li>
            </ul>
          </div>
          <div className="text-sm">
            <h3 className="font-semibold">Feedback &amp; Support</h3>
            <p className="mt-3 text-muted-foreground">
              Have a suggestion, found a bug, or need help? We'd love to hear from you.
            </p>
            <a
              href="https://forms.gle/pesHKSpWVVEuBayx7"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 font-semibold transition-colors hover:bg-accent"
            >
              Send Feedback
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
        <div className="border-t border-border py-5 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} FeatherQuest · Your data never leaves your device.
        </div>
      </footer>
    </div>
  );
}
