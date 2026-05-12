import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { BLOOD_DONORS } from "@/lib/mock-data";
import { UrgencyBadge, StatusBadge } from "@/components/Badges";
import { Button } from "@/components/ui/button";
import { Droplets, MapPin, Phone } from "lucide-react";
import { toast } from "sonner";
import { timeAgo } from "@/lib/format";

export const Route = createFileRoute("/app/blood")({ component: BloodPage });

function BloodPage() {
  const { projects, markBloodUsed } = useStore();
  const requests = projects.filter((p) => p.type === "Blood Donation" || p.bloodGroup);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Blood requests</h1>
        <p className="text-sm text-muted-foreground">Active hospital requests and matched donors.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {requests.map((p) => (
          <div key={p.id} className="bg-gradient-card rounded-2xl border border-border p-5 shadow-soft hover-lift">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{p.id}</div>
                <Link to="/app/projects/$id" params={{ id: p.id }} className="font-medium hover:text-primary">{p.title}</Link>
                <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{p.city}</span>
                  <span>{p.hospital}</span>
                </div>
              </div>
              <UrgencyBadge urgency={p.urgency} />
            </div>
            <div className="mt-4 flex items-center justify-between rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive text-destructive-foreground"><Droplets className="h-5 w-5" /></div>
                <div>
                  <div className="text-sm font-semibold text-destructive">{p.bloodGroup || "—"}</div>
                  <div className="text-[11px] text-muted-foreground">{p.unitsArranged ?? 0}/{p.unitsRequired ?? 0} units arranged</div>
                </div>
              </div>
              <StatusBadge status={p.status} />
            </div>
            <div className="mt-4 flex gap-2">
              <Button size="sm" variant="outline" onClick={() => toast.success("Donor matched successfully")}>Match donor</Button>
              <Button size="sm" className="bg-destructive text-destructive-foreground" onClick={() => { markBloodUsed(p.id); toast.success("Thank-you sent to donors"); }}>Mark blood used</Button>
            </div>
          </div>
        ))}
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold">Blood donor registry</h2>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {BLOOD_DONORS.map((d) => (
            <div key={d.id} className="bg-gradient-card flex items-center gap-3 rounded-2xl border border-border p-4 shadow-soft hover-lift">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive font-semibold">{d.bloodGroup}</div>
              <div className="min-w-0 flex-1">
                <div className="font-medium">{d.name}</div>
                <div className="text-xs text-muted-foreground">{d.city} · last donated {timeAgo(d.lastDonation)} · {d.total} donations</div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`inline-flex h-2 w-2 rounded-full ${d.available ? "bg-success" : "bg-muted-foreground"}`} />
                <Button size="sm" variant="outline" onClick={() => toast.success(`Calling ${d.name}…`)}><Phone className="h-3.5 w-3.5" /></Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
