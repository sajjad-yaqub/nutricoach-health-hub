import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { lovable } from "@/integrations/lovable";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    if (loading || !user) return;

    const checkOnboarding = async () => {
      const { data } = await supabase
        .from("user_profiles")
        .select("onboarding_complete")
        .eq("id", user.id)
        .maybeSingle();

      if (!data || !data.onboarding_complete) {
        navigate({ to: "/onboarding" });
      } else {
        navigate({ to: "/dashboard" });
      }
    };

    checkOnboarding();
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
    <div className="min-h-screen bg-background flex flex-col">
      <header className="px-6 py-5 flex items-center justify-between max-w-6xl mx-auto w-full">
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

      <main className="flex-1">
        <section className="max-w-3xl mx-auto px-6 pt-12 md:pt-20 pb-16 text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground leading-tight">
            Your Personal AI<br className="hidden md:block" /> Nutrition Coach
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Track calories, macros, vitamins and minerals through simple conversation. Free, smart, and built around your goals.
          </p>
          <div className="mt-10 flex justify-center">
            <Button
              size="lg"
              onClick={handleGoogle}
              disabled={signingIn}
              className="gap-3 px-8 py-6 text-base shadow-soft hover:shadow-lg transition-shadow"
            >
              <GoogleIcon />
              Sign in with Google
            </Button>
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-6 pb-20">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <FeatureCard
              emoji="🍽️"
              title="Smart Food Logging"
              desc="Just type what you ate in plain language"
            />
            <FeatureCard
              emoji="📊"
              title="Complete Nutrition Tracking"
              desc="Calories, protein, fiber, vitamins, minerals and more"
            />
            <FeatureCard
              emoji="🎯"
              title="Personalized Goals"
              desc="Targets calculated from your body, activity and goals"
            />
            <FeatureCard
              emoji="📈"
              title="Progress Reports"
              desc="Daily, weekly, monthly summaries and comparisons"
            />
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Leaf className="h-4 w-4 text-primary" />
          NutriCoach
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  emoji,
  title,
  desc,
}: {
  emoji: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 text-center hover:shadow-soft transition-shadow">
      <div className="text-3xl mb-4">{emoji}</div>
      <h3 className="font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}
