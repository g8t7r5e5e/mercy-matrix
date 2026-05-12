import { createFileRoute } from "@tanstack/react-router";
import { DONORS } from "@/lib/mock-data";
import { formatPKR, timeAgo } from "@/lib/format";
import { Trophy, Heart } from "lucide-react";

export const Route = createFileRoute("/app/donors")({ component: DonorsPage });

function DonorsPage() {
  const sorted = [...DONORS].sort((a, b) => b.totalDonated - a.totalDonated);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Donors</h1>
        <p className="text-sm text-muted-foreground">{DONORS.length} active donors · {formatPKR(DONORS.reduce((s, d) => s + d.totalDonated, 0))} contributed</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="bg-gradient-card lg:col-span-2 rounded-2xl border border-border p-5 shadow-soft">
          <div className="overflow-hidden rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <tr><th className="px-4 py-3">Donor</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Total</th><th className="px-4 py-3">Projects</th><th className="px-4 py-3">Last</th></tr>
              </thead>
              <tbody>
                {sorted.map((d) => (
                  <tr key={d.id} className="border-t border-border hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{d.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{d.type}</td>
                    <td className="px-4 py-3 text-success font-semibold">{formatPKR(d.totalDonated)}</td>
                    <td className="px-4 py-3">{d.projects}</td>
                    <td className="px-4 py-3 text-muted-foreground">{timeAgo(d.lastDonation)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-gradient-card rounded-2xl border border-border p-5 shadow-soft">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold"><Trophy className="h-4 w-4 text-warning" />Top donors</div>
          <ol className="space-y-3">
            {sorted.slice(0, 5).map((d, i) => (
              <li key={d.id} className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-brand text-xs font-semibold text-primary-foreground">{i + 1}</div>
                <div className="flex-1 min-w-0">
                  <div className="truncate text-sm font-medium">{d.name}</div>
                  <div className="text-[11px] text-muted-foreground">{formatPKR(d.totalDonated)}</div>
                </div>
                <Heart className="h-4 w-4 text-destructive" />
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
