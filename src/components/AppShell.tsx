import { useEffect, type ReactNode } from "react";
import { BottomNav } from "./BottomNav";
import { seedDefaults } from "@/lib/db";
import { registerServiceWorker } from "@/lib/register-sw";

export function AppShell({ children }: { children: ReactNode }) {
  useEffect(() => {
    seedDefaults().catch(console.error);
    registerServiceWorker();
  }, []);

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-background pb-24">
      <main className="flex-1 animate-fade-in">{children}</main>
      <BottomNav />
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  return (
    <header className="flex items-start justify-between gap-3 px-5 pt-8 pb-4">
      <div>
        <h1 className="font-display text-3xl font-semibold leading-tight">{title}</h1>
        {subtitle && (
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {right}
    </header>
  );
}

export function EmptyState({
  icon,
  title,
  description,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
}) {
  return (
    <div className="mx-5 mt-8 flex flex-col items-center rounded-2xl border border-dashed border-border bg-card/40 px-6 py-12 text-center">
      {icon && <div className="mb-3 text-4xl">{icon}</div>}
      <h3 className="font-display text-lg font-semibold">{title}</h3>
      {description && (
        <p className="mt-2 max-w-xs text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
