import { createFileRoute } from "@tanstack/react-router";
import { Flame, Droplet, Apple, TrendingUp } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
  head: () => ({ meta: [{ title: "Dashboard — NutriCoach" }] }),
});

function Dashboard() {
  const { user } = useAuth();
  const name = user?.user_metadata?.full_name?.split(" ")[0] ?? "there";

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-6 md:py-10 space-y-8">
      <header>
        <p className="text-sm text-muted-foreground">Welcome back</p>
        <h1 className="text-2xl md:text-3xl font-bold">Hi, {name} 👋</h1>
      </header>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat icon={Flame} label="Calories" value="1,840" hint="of 2,200" />
        <Stat icon={Apple} label="Protein" value="98g" hint="of 130g" />
        <Stat icon={Droplet} label="Water" value="1.6L" hint="of 2.5L" />
        <Stat icon={TrendingUp} label="Streak" value="7d" hint="keep it up" />
      </section>

      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-semibold mb-2">Today's focus</h2>
        <p className="text-sm text-muted-foreground">
          Aim for one extra serving of vegetables at lunch and stay hydrated this afternoon.
        </p>
      </section>
    </div>
  );
}

function Stat({ icon: Icon, label, value, hint }: { icon: typeof Flame; label: string; value: string; hint: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2">
        <Icon className="h-4 w-4" /> {label}
      </div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{hint}</div>
    </div>
  );
}
