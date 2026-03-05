import { Link, useLocation } from "wouter";
import { Home, Calendar, Dumbbell, Activity, User, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { UserButton, useUser, SignOutButton } from "@clerk/clerk-react";
import { useAppContext } from "@/lib/store";
import { Spinner } from "@/components/ui/spinner";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user, isSignedIn, isLoaded: isClerkLoaded } = useUser();
  const { isLoading: isStoreLoading } = useAppContext();

  const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/planner", icon: Calendar, label: "Plan" },
    { href: "/workout", icon: Dumbbell, label: "Train" },
    { href: "/progress", icon: Activity, label: "Stats" },
    { href: "/profile", icon: User, label: "Profile" },
  ];

  if (!isClerkLoaded || (isSignedIn && isStoreLoading)) {
    return (
      <div className="fixed inset-0 bg-background flex flex-col items-center justify-center gap-4 z-[100]">
        <Spinner className="w-12 h-12 text-primary" />
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground animate-pulse">
          Synchronizing Neural Interface...
        </p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background text-foreground flex flex-col md:flex-row overflow-hidden">
      {/* Mobile-optimized Header */}
      {isSignedIn && (
        <header className="shrink-0 h-16 bg-card/80 backdrop-blur-md border-b border-border z-[60] px-4 flex items-center justify-between safe-top">
          <div className="flex items-center gap-3">
            <UserButton afterSignOutUrl="/sign-in" />
            <div className="flex flex-col">
              <p className="text-sm font-bold leading-none truncate max-w-[120px]">
                {user.firstName || user.username}
              </p>
              <p className="text-[10px] text-primary uppercase tracking-wider font-bold mt-0.5">
                Active Protocol
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <SignOutButton>
              <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-secondary/50 text-muted-foreground hover:text-destructive active:scale-95 transition-all">
                <LogOut size={18} />
              </button>
            </SignOutButton>
          </div>
        </header>
      )}

      {/* Content Area - Optimized for scrolling on mobile */}
      <main className={cn(
        "flex-1 overflow-y-auto w-full no-scrollbar relative md:pl-20",
        isSignedIn ? "pb-24" : "pb-0"
      )}>
        <div className="max-w-4xl mx-auto w-full">
          {children}
        </div>
      </main>

      {/* Navigation - Bottom for Mobile, Left for Desktop */}
      <nav className="shrink-0 h-20 bg-card/95 backdrop-blur-md border-t border-border z-50 flex items-center justify-around px-2 safe-bottom md:fixed md:left-0 md:top-0 md:bottom-0 md:w-20 md:h-screen md:flex-col md:border-t-0 md:border-r md:justify-center md:gap-8 md:py-8">
        {navItems.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <a
                className={cn(
                  "flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300 active:scale-90",
                  isActive
                    ? "text-primary bg-primary/10 shadow-[0_0_15px_-5px_hsl(var(--primary)/0.4)]"
                    : "text-muted-foreground hover:text-foreground"
                )}
                data-testid={`nav-${item.label.toLowerCase()}`}
              >
                <Icon
                  size={isActive ? 26 : 24}
                  strokeWidth={isActive ? 2.5 : 2}
                  className={cn(
                    "transition-transform duration-300",
                    isActive && "scale-110"
                  )}
                />
                <span className={cn(
                  "text-[9px] font-bold uppercase tracking-tighter mt-1 md:block",
                  isActive ? "opacity-100" : "opacity-60"
                )}>
                  {item.label}
                </span>
              </a>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
