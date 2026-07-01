import { Link } from "@tanstack/react-router";
import { Home, Search, Plus, Trophy, User } from "lucide-react";

type NavItem = {
  to: "/" | "/search" | "/new" | "/achievements" | "/profile";
  label: string;
  icon: typeof Home;
  primary?: boolean;
  exact?: boolean;
};

const items: NavItem[] = [
  { to: "/", label: "Home", icon: Home, exact: true },
  { to: "/search", label: "Search", icon: Search },
  { to: "/new", label: "New", icon: Plus, primary: true },
  { to: "/achievements", label: "Awards", icon: Trophy },
  { to: "/profile", label: "Profile", icon: User },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <ul className="mx-auto flex max-w-md items-end justify-around px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2">
        {items.map(({ to, label, icon: Icon, primary, exact }) => (
          <li key={to} className="flex-1">
            <Link
              to={to}
              activeOptions={exact ? { exact: true } : undefined}
              activeProps={{ className: "text-primary" }}
              inactiveProps={{ className: "text-muted-foreground" }}
              className="group flex flex-col items-center gap-1 py-1 text-xs font-medium transition-colors"
            >
              <span
                className={
                  primary
                    ? "flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 -mt-6"
                    : "flex h-6 w-6 items-center justify-center"
                }
              >
                <Icon className={primary ? "h-6 w-6" : "h-5 w-5"} strokeWidth={2} />
              </span>
              {!primary && <span>{label}</span>}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
