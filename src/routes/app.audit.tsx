import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { timeAgo } from "@/lib/format";

export const Route = createFileRoute("/app/audit")({ component: AuditPage });

function AuditPage() {
  const { activity } = useStore();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Audit logs</h1>
        <p className="text-sm text-muted-foreground">Every system action recorded for transparency.</p>
      </div>
      <div className="bg-gradient-card overflow-hidden rounded-2xl border border-border shadow-soft">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
            <tr><th className="px-4 py-3">Time</th><th className="px-4 py-3">Action</th><th className="px-4 py-3">Kind</th></tr>
          </thead>
          <tbody>
            {activity.map((a) => (
              <tr key={a.id} className="border-t border-border">
                <td className="px-4 py-3 text-muted-foreground">{timeAgo(a.at)}</td>
                <td className="px-4 py-3">{a.text}</td>
                <td className="px-4 py-3"><span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[11px] capitalize">{a.kind}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
