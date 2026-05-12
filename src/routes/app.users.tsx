import { createFileRoute } from "@tanstack/react-router";
import { ACCOUNTS } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/app/users")({ component: UsersPage });

const ROLE_LABEL: Record<string, string> = { super_admin: "Super Admin", wing_head: "Wing Head", member: "Member", general_user: "General User" };

function UsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
        <p className="text-sm text-muted-foreground">Platform members and their roles.</p>
      </div>
      <div className="bg-gradient-card overflow-hidden rounded-2xl border border-border shadow-soft">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
            <tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Wing</th></tr>
          </thead>
          <tbody>
            {ACCOUNTS.map((u) => (
              <tr key={u.id} className="border-t border-border">
                <td className="px-4 py-3 font-medium">{u.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                <td className="px-4 py-3"><Badge variant="secondary">{ROLE_LABEL[u.role]}</Badge></td>
                <td className="px-4 py-3 text-muted-foreground">{u.wing || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
