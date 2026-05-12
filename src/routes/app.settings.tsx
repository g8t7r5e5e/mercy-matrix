import { createFileRoute } from "@tanstack/react-router";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { WINGS } from "@/lib/mock-data";

export const Route = createFileRoute("/app/settings")({ component: SettingsPage });

function SettingsPage() {
  const [org, setOrg] = useState("WelfareOS Foundation");
  const [notif, setNotif] = useState({ email: true, sms: false, push: true });

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Organization, preferences, and roles.</p>
      </div>

      <div className="bg-gradient-card rounded-2xl border border-border p-5 shadow-soft">
        <div className="text-sm font-semibold">Organization</div>
        <label className="mt-3 block text-xs text-muted-foreground">Organization name</label>
        <input value={org} onChange={(e) => setOrg(e.target.value)} className="mt-1 h-10 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-ring" />
      </div>

      <div className="bg-gradient-card rounded-2xl border border-border p-5 shadow-soft space-y-3">
        <div className="text-sm font-semibold">Notifications</div>
        {(["email","sms","push"] as const).map((k) => (
          <div key={k} className="flex items-center justify-between rounded-xl border border-border p-3">
            <div className="text-sm capitalize">{k}</div>
            <Switch checked={notif[k]} onCheckedChange={(v) => setNotif((n) => ({ ...n, [k]: v }))} />
          </div>
        ))}
      </div>

      <div className="bg-gradient-card rounded-2xl border border-border p-5 shadow-soft">
        <div className="text-sm font-semibold">Wings</div>
        <div className="mt-3 grid gap-2 md:grid-cols-2">
          {WINGS.map((w) => (
            <div key={w} className="rounded-xl border border-border bg-background/60 px-3 py-2 text-sm">{w}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
