import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Download, FileSpreadsheet, FileText } from "lucide-react";

export const Route = createFileRoute("/app/reports")({ component: ReportsPage });

const REPORTS = [
  { t: "Monthly impact report", d: "Lives impacted, projects closed, fund flow" },
  { t: "Funds report", d: "Raised vs disbursed by wing and project" },
  { t: "Blood donation report", d: "Requests fulfilled, donor turnover" },
  { t: "Wing performance report", d: "Comparative wing outcomes" },
  { t: "Project completion report", d: "Timelines, delays, success rate" },
];

function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
        <p className="text-sm text-muted-foreground">Generate transparent reports for donors and stakeholders.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {REPORTS.map((r) => (
          <div key={r.t} className="bg-gradient-card rounded-2xl border border-border p-5 shadow-soft hover-lift">
            <div className="font-medium">{r.t}</div>
            <p className="mt-1 text-xs text-muted-foreground">{r.d}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => toast.success(`${r.t} exported as PDF`)}><FileText className="mr-1 h-3.5 w-3.5" />PDF</Button>
              <Button size="sm" variant="outline" onClick={() => toast.success(`${r.t} exported as CSV`)}><FileSpreadsheet className="mr-1 h-3.5 w-3.5" />CSV</Button>
              <Button size="sm" onClick={() => toast.success(`${r.t} generated`)}><Download className="mr-1 h-3.5 w-3.5" />Generate</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
