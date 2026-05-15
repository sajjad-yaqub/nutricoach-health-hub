import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export const Route = createFileRoute("/_authenticated/profile")({
  component: Profile,
  head: () => ({ meta: [{ title: "Profile — NutriCoach" }] }),
});

function Profile() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const name = user?.user_metadata?.full_name ?? "—";
  const avatar = user?.user_metadata?.avatar_url as string | undefined;

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/" });
  };

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-8 py-6 md:py-10 space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-sm text-muted-foreground">Manage your account and preferences.</p>
      </header>

      <div className="rounded-2xl border border-border bg-card p-6 flex items-center gap-4">
        {avatar ? (
          <img src={avatar} alt="" className="h-16 w-16 rounded-full" />
        ) : (
          <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground grid place-items-center text-xl font-semibold">
            {name.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <div className="font-semibold">{name}</div>
          <div className="text-sm text-muted-foreground">{user?.email}</div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
        <h2 className="font-semibold">Preferences</h2>
        <p className="text-sm text-muted-foreground">Settings will appear here as we build them out.</p>
      </div>

      <Button variant="outline" className="gap-2" onClick={handleSignOut}>
        <LogOut className="h-4 w-4" /> Sign out
      </Button>
    </div>
  );
}
