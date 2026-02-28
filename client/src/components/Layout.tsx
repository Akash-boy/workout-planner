import { Link, useLocation } from "wouter";
import { Home, Calendar, Dumbbell, Activity, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/planner", icon: Calendar, label: "Plan" },
    { href: "/workout", icon: Dumbbell, label: "Train" },
    { href: "/progress", icon: Activity, label: "Stats" },
    { href: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row pb-20 md:pb-0">
      <main className="flex-1 overflow-y-auto w-full max-w-md mx-auto md:max-w-none md:pl-20">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 h-20 bg-card border-t border-border z-50 flex items-center justify-around px-4 md:flex-col md:w-20 md:h-screen md:top-0 md:right-auto md:border-t-0 md:border-r md:justify-center md:gap-8 md:py-8">
        {navItems.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;
          return (
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
      </nav>
    </div>
  );
}
