import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { formatPKR } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/app/finance")({ component: FinancePage });

function FinancePage() {
  const { projects } = useStore();
  const items = projects.filter((p) => p.target > 0);
  const total = items.reduce((s, p) => s + p.raised, 0);
  const target = items.reduce((s, p) => s + p.target, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Financial aid</h1>
          <p className="text-sm text-muted-foreground">{formatPKR(total)} raised across {items.length} active campaigns.</p>
        </div>
        <Button onClick={() => toast.success("Donor proof report generated")}>Generate donor report</Button>
      </div>

      <div className="bg-gradient-card rounded-2xl border border-border p-5 shadow-soft">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-semibold">Overall fundraising</span>
          <span className="text-muted-foreground">{formatPKR(total)} / {formatPKR(target)}</span>
        </div>
        <Progress value={Math.min(100, (total / Math.max(1, target)) * 100)} className="h-2.5" />
      </div>

      <div className="bg-gradient-card overflow-hidden rounded-2xl border border-border shadow-soft">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
            <tr><th className="px-4 py-3">Project</th><th className="px-4 py-3">Target</th><th className="px-4 py-3">Raised</th><th className="px-4 py-3">Donors</th><th className="px-4 py-3 w-64">Progress</th></tr>
          </thead>
          <tbody>
            {items.map((p) => {
              const pct = Math.min(100, (p.raised / p.target) * 100);
              return (
                <tr key={p.id} className="border-t border-border hover:bg-muted/30">
                  <td className="px-4 py-3"><Link to="/app/projects/$id" params={{ id: p.id }} className="font-medium hover:text-primary">{p.title}</Link><div className="text-[11px] text-muted-foreground">{p.id}</div></td>
                  <td className="px-4 py-3">{formatPKR(p.target)}</td>
                  <td className="px-4 py-3 text-success font-medium">{formatPKR(p.raised)}</td>
                  <td className="px-4 py-3">{p.donations.length}</td>
                  <td className="px-4 py-3"><Progress value={pct} className="h-2" /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
