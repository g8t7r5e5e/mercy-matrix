import type { ProjectStatus, Urgency } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const statusColor: Record<ProjectStatus, string> = {
  "Pending Review": "bg-warning/15 text-warning-foreground border-warning/30",
  "Verified": "bg-info/15 text-info border-info/30",
  "Active": "bg-primary/10 text-primary border-primary/30",
  "In Progress": "bg-primary/10 text-primary border-primary/30",
  "Partially Funded": "bg-accent/15 text-accent-foreground border-accent/30",
  "Donor Matched": "bg-success/15 text-success border-success/30",
  "Completed": "bg-success/15 text-success border-success/30",
  "Closed": "bg-muted text-muted-foreground border-border",
  "Archived": "bg-muted text-muted-foreground border-border",
  "Rejected": "bg-destructive/15 text-destructive border-destructive/30",
};
const urgencyColor: Record<Urgency, string> = {
  Low: "bg-muted text-muted-foreground border-border",
  Medium: "bg-info/10 text-info border-info/30",
  High: "bg-warning/15 text-warning-foreground border-warning/40",
  Critical: "bg-destructive/15 text-destructive border-destructive/40",
};

export function StatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium", statusColor[status])}>
      {status}
    </span>
  );
}
export function UrgencyBadge({ urgency }: { urgency: Urgency }) {
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium", urgencyColor[urgency], urgency === "Critical" && "pulse-ring")}>
      {urgency}
    </span>
  );
}
