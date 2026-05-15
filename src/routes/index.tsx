import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Leaf, MessageCircle, BarChart3, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/dashboard" });
  }, [loading, user, navigate]);

  const handleGoogle = async () => {
    setSigningIn(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Sign-in failed. Please try again.");
      setSigningIn(false);
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="px-6 py-5 flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-primary text-primary-foreground grid place-items-center">
            <Leaf className="h-5 w-5" />
          </div>
          <span className="font-semibold text-lg">NutriCoach</span>
        </div>
        <Button onClick={handleGoogle} disabled={signingIn} size="sm">
          Sign in
        </Button>
      </header>

      <section className="max-w-3xl mx-auto px-6 pt-10 pb-20 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-accent text-accent-foreground px-3 py-1 text-xs font-medium mb-6">
          <Sparkles className="h-3.5 w-3.5" /> Your personal nutrition coach
        </div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground">
          Eat better, every day.
        </h1>
        <p className="mt-5 text-lg text-muted-foreground max-w-xl mx-auto">
          Get personalized nutrition guidance, chat with your AI coach, and track your progress — all in one place.
        </p>
        <div className="mt-8 flex justify-center">
          <Button size="lg" onClick={handleGoogle} disabled={signingIn} className="gap-2">
            <GoogleIcon /> Continue with Google
          </Button>
        </div>

        <div className="mt-20 grid sm:grid-cols-3 gap-4 text-left">
          <Feature icon={MessageCircle} title="Coach Chat" desc="Ask anything about meals, macros, and habits." />
          <Feature icon={BarChart3} title="Smart Reports" desc="See your trends and compare weekly progress." />
          <Feature icon={Leaf} title="Tailored Plans" desc="Guidance built around your goals and lifestyle." />
        </div>
      </section>
    </div>
  );
}

function Feature({ icon: Icon, title, desc }: { icon: typeof Leaf; title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary grid place-items-center mb-3">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="font-semibold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#fff" d="M21.35 11.1H12v2.9h5.35c-.23 1.5-1.7 4.4-5.35 4.4-3.22 0-5.85-2.66-5.85-5.95S8.78 6.5 12 6.5c1.83 0 3.06.78 3.76 1.45l2.57-2.47C16.78 4.04 14.6 3.1 12 3.1 6.97 3.1 2.9 7.17 2.9 12.2S6.97 21.3 12 21.3c6.93 0 9.1-4.86 9.1-7.32 0-.5-.05-.88-.1-1.28z"/>
    </svg>
  );
}
