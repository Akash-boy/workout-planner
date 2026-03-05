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

  // Global loading state for authentication or initial data sync
  if (!isClerkLoaded || (isSignedIn && isStoreLoading)) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <Spinner className="w-12 h-12 text-primary" />
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground animate-pulse">
          Synchronizing Neural Interface...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row pb-20 md:pb-0">
      {/* Header for Desktop/Mobile with User Info */}
      {isSignedIn && (
        <header className="fixed top-0 left-0 right-0 h-16 bg-card/80 backdrop-blur-md border-b border-border z-[60] px-6 flex items-center justify-between md:left-20">
          <div className="flex items-center gap-3">
            <UserButton afterSignOutUrl="/sign-in" />
            <div className="hidden sm:block">
              <p className="text-sm font-bold leading-none">{user.firstName || user.username}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">Status: Active</p>
            </div>
          </div>
          <div className="md:hidden">
            <SignOutButton>
              <button className="p-2 text-muted-foreground hover:text-destructive transition-colors">
                <LogOut size={20} />
              </button>
            </SignOutButton>
          </div>
        </header>
      )}

      <main className={cn(
        "flex-1 overflow-y-auto w-full max-w-md mx-auto md:max-w-none md:pl-20",
        isSignedIn && "pt-16"
      )}>
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 h-20 bg-card border-t border-border z-50 flex items-center justify-around px-4 md:flex-col md:w-20 md:h-screen md:top-0 md:right-auto md:border-t-0 md:border-r md:justify-center md:gap-8 md:py-8">
        {navItems.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;
          return (isSignedIn || item.href === "/sign-in") && (
            <Link key={item.href} href={item.href}>
              <a
                className={cn(
                  "flex flex-col items-center justify-center w-14 h-14 rounded-xl transition-all duration-300",
                  isActive
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                )}
                data-testid={`nav-${item.label.toLowerCase()}`}
              >
                <Icon
                  size={24}
                  strokeWidth={isActive ? 2.5 : 2}
                  className={cn(
                    "mb-1 transition-transform duration-300",
                    isActive && "scale-110"
                  )}
                />
                <span className="text-[10px] font-medium hidden md:block">
                  {item.label}
                </span>
              </a>
            </Link>
          );
        })}
        {isSignedIn && (
          <div className="hidden md:block mt-auto">
            <SignOutButton>
              <button className="flex flex-col items-center justify-center w-14 h-14 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-300">
                <LogOut size={24} />
                <span className="text-[10px] font-medium mt-1">Exit</span>
              </button>
            </SignOutButton>
          </div>
        )}
      </nav>
    </div>
  );
}
