import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Download, ArrowRight, Share, Plus, X } from "lucide-react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isIos(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && "ontouchend" in document);
}

/**
 * Primary landing-page CTA.
 * - installable browser  → "Install App" (beforeinstallprompt)
 * - already installed    → "Open App" → /app
 * - iOS / unsupported    → "Add to Home Screen" instructions
 */
export function InstallButton({ className = "" }: { className?: string }) {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [ios, setIos] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    setInstalled(isStandalone());
    setIos(isIos());

    const onPrompt = (event: Event) => {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const base =
    "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-base font-semibold shadow-lg shadow-primary/20 transition-transform hover:-translate-y-0.5 " +
    className;

  if (installed) {
    return (
      <Link to="/app" className={`${base} bg-primary text-primary-foreground`}>
        Open App
        <ArrowRight className="h-5 w-5" />
      </Link>
    );
  }

  async function install() {
    if (!deferred) {
      setShowHelp(true);
      return;
    }
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    if (outcome === "accepted") setInstalled(true);
    setDeferred(null);
  }

  return (
    <>
      <button onClick={install} className={`${base} bg-primary text-primary-foreground`}>
        <Download className="h-5 w-5" />
        Install App
      </button>

      {showHelp && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-foreground/40 p-4 backdrop-blur-sm sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-label="How to install FeatherQuest"
          onClick={() => setShowHelp(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl border border-border bg-card p-6 text-left shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <h3 className="font-display text-lg font-semibold">Add to Home Screen</h3>
              <button
                onClick={() => setShowHelp(false)}
                aria-label="Close"
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {ios ? (
              <ol className="space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-3">
                  <Share className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>
                    Tap the <strong className="text-foreground">Share</strong> button in Safari's
                    toolbar.
                  </span>
                </li>
                <li className="flex gap-3">
                  <Plus className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>
                    Choose <strong className="text-foreground">Add to Home Screen</strong>.
                  </span>
                </li>
                <li className="flex gap-3">
                  <Download className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>
                    Tap <strong className="text-foreground">Add</strong> — FeatherQuest opens
                    full-screen, straight into your journal.
                  </span>
                </li>
              </ol>
            ) : (
              <p className="text-sm text-muted-foreground">
                Your browser hasn't offered an install prompt yet. In Chrome or Edge, open the menu
                and choose <strong className="text-foreground">Install FeatherQuest</strong> — or
                just keep using it in the browser.
              </p>
            )}
            <Link
              to="/app"
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
            >
              Continue in browser
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
