import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/reports")({
  component: Reports,
  head: () => ({ meta: [{ title: "Reports — NutriCoach" }] }),
});

function Reports() {
  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-6 md:py-10 space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Reports</h1>
        <p className="text-sm text-muted-foreground">Your history and weekly comparisons.</p>
      </header>

      <div className="grid md:grid-cols-2 gap-4">
        <Card title="This week" value="12,890 kcal" hint="−4% vs last week" />
        <Card title="Avg protein" value="112g/day" hint="+8g vs last week" />
        <Card title="Hydration" value="2.1L/day" hint="On target" />
        <Card title="Logged days" value="6 / 7" hint="Great consistency" />
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
        Detailed charts coming soon.
      </div>
    </div>
  );
}

function Card({ title, value, hint }: { title: string; value: string; hint: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="text-xs text-muted-foreground">{title}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{hint}</div>
    </div>
  );
}
