import { createFileRoute } from "@tanstack/react-router";
import { Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/chat")({
  component: Chat,
  head: () => ({ meta: [{ title: "Chat — NutriCoach" }] }),
});

function Chat() {
  return (
    <div className="max-w-3xl mx-auto h-full flex flex-col px-4 md:px-8 py-6 md:py-10">
      <header className="mb-4">
        <h1 className="text-2xl font-bold">Coach Chat</h1>
        <p className="text-sm text-muted-foreground">Ask your nutrition coach anything.</p>
      </header>

      <div className="flex-1 rounded-2xl border border-border bg-card p-4 space-y-3 overflow-auto min-h-[400px]">
        <Bubble from="coach">Hi! I'm your nutrition coach. What would you like to work on today?</Bubble>
      </div>

      <form className="mt-4 flex gap-2" onSubmit={(e) => e.preventDefault()}>
        <Input placeholder="Type a message..." className="flex-1" />
        <Button type="submit" size="icon" aria-label="Send"><Send className="h-4 w-4" /></Button>
      </form>
    </div>
  );
}

function Bubble({ from, children }: { from: "coach" | "me"; children: React.ReactNode }) {
  const mine = from === "me";
  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${mine ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
        {children}
      </div>
    </div>
  );
}
