import { createFileRoute } from "@tanstack/react-router";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line } from "recharts";

export const Route = createFileRoute("/app/analytics")({ component: AnalyticsPage });

const monthly = [
  { m: "Jun", v: 80 }, { m: "Jul", v: 110 }, { m: "Aug", v: 140 },
  { m: "Sep", v: 170 }, { m: "Oct", v: 220 }, { m: "Nov", v: 280 }, { m: "Dec", v: 284 },
];
const status = [
  { s: "Active", v: 12 }, { s: "Pending", v: 5 }, { s: "Completed", v: 18 }, { s: "Closed", v: 7 },
];

function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground">Trends and distributions across the platform.</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="bg-gradient-card rounded-2xl border border-border p-5 shadow-soft">
          <div className="mb-3 text-sm font-semibold">Lives impacted</div>
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="m" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }} />
                <Line type="monotone" dataKey="v" stroke="var(--primary)" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-gradient-card rounded-2xl border border-border p-5 shadow-soft">
          <div className="mb-3 text-sm font-semibold">Project status distribution</div>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={status}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="s" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }} />
                <Bar dataKey="v" fill="var(--accent)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
