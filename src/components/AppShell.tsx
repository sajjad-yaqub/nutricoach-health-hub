import { Link, Outlet, useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, MessageCircle, BarChart3, User, LogOut, Leaf } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/chat", label: "Chat", icon: MessageCircle },
  { to: "/reports", label: "Reports", icon: BarChart3 },
  { to: "/profile", label: "Profile", icon: User },
] as const;

export function AppShell() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:border-r md:border-border md:bg-card">
        <div className="flex items-center gap-2 px-6 py-5 border-b border-border">
          <div className="h-9 w-9 rounded-xl bg-primary text-primary-foreground grid place-items-center">
            <Leaf className="h-5 w-5" />
          </div>
          <span className="font-semibold text-lg">NutriCoach</span>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              activeProps={{ className: "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium bg-primary text-primary-foreground" }}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-border">
          <Button variant="ghost" className="w-full justify-start gap-3" onClick={handleSignOut}>
            <LogOut className="h-4 w-4" /> Sign out
          </Button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-card">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground grid place-items-center">
            <Leaf className="h-4 w-4" />
          </div>
          <span className="font-semibold">NutriCoach</span>
        </div>
        <Button size="sm" variant="ghost" onClick={handleSignOut} aria-label="Sign out">
          <LogOut className="h-4 w-4" />
        </Button>
      </header>

      {/* Main content */}
      <main className="flex-1 pb-20 md:pb-0 overflow-auto">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-card border-t border-border">
        <div className="grid grid-cols-4">
          {navItems.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="flex flex-col items-center justify-center py-2.5 text-xs text-muted-foreground"
              activeProps={{ className: "flex flex-col items-center justify-center py-2.5 text-xs text-primary font-medium" }}
            >
              <Icon className="h-5 w-5 mb-1" />
              {label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
