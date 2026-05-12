import { createFileRoute } from "@tanstack/react-router";
import { BLOOD_DONORS } from "@/lib/mock-data";
import { timeAgo } from "@/lib/format";

export const Route = createFileRoute("/app/blood-donors")({ component: BDPage });

function BDPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Blood donor registry</h1>
        <p className="text-sm text-muted-foreground">{BLOOD_DONORS.length} registered donors across cities.</p>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {BLOOD_DONORS.map((d) => (
          <div key={d.id} className="bg-gradient-card flex items-center gap-3 rounded-2xl border border-border p-4 shadow-soft hover-lift">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive font-semibold">{d.bloodGroup}</div>
            <div className="min-w-0 flex-1">
              <div className="font-medium">{d.name}</div>
              <div className="text-xs text-muted-foreground">{d.city} · {d.total} donations</div>
              <div className="text-[11px] text-muted-foreground">Last donated {timeAgo(d.lastDonation)}</div>
            </div>
            <span className={`inline-flex h-2 w-2 rounded-full ${d.available ? "bg-success" : "bg-muted-foreground"}`} />
          </div>
        ))}
      </div>
    </div>
  );
}
