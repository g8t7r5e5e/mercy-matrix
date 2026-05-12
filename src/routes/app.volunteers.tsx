import { createFileRoute } from "@tanstack/react-router";
import { VOLUNTEERS } from "@/lib/mock-data";
import { Award } from "lucide-react";

export const Route = createFileRoute("/app/volunteers")({ component: VolPage });

function VolPage() {
  const sorted = [...VOLUNTEERS].sort((a, b) => b.score - a.score);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Volunteers</h1>
        <p className="text-sm text-muted-foreground">{VOLUNTEERS.length} active volunteers</p>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {sorted.map((v, i) => (
          <div key={v.id} className="bg-gradient-card rounded-2xl border border-border p-5 shadow-soft hover-lift">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-brand text-xs font-semibold text-primary-foreground">{v.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}</div>
                <div>
                  <div className="font-medium">{v.name}</div>
                  <div className="text-[11px] text-muted-foreground">Rank #{i + 1}</div>
                </div>
              </div>
              <div className="inline-flex items-center gap-1 rounded-full bg-warning/15 px-2 py-0.5 text-[11px] text-warning-foreground"><Award className="h-3 w-3" />{v.score}</div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
              <Stat n={v.tasks} l="Tasks" />
              <Stat n={v.hours} l="Hours" />
              <Stat n={v.activeProjects} l="Active" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
function Stat({ n, l }: { n: number; l: string }) {
  return <div className="rounded-lg border border-border bg-background/60 py-2"><div className="text-base font-semibold">{n}</div><div className="text-[10px] text-muted-foreground uppercase tracking-wider">{l}</div></div>;
}
