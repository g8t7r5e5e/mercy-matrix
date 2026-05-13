import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { useState } from "react";
import { StatusBadge, UrgencyBadge } from "@/components/Badges";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatPKR, timeAgo } from "@/lib/format";
import {
  ArrowLeft, MapPin, Building2, User, Phone, Calendar, Plus, Upload, MessagesSquare,
  CheckCircle2, FileText, Pin, Send, Droplets, Users as UsersIcon, ScrollText,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/projects/$id")({
  component: ProjectDetail,
});

function ProjectDetail() {
  const { id } = Route.useParams();
  const { projects, user, addDonation, addMessage, addProjectUpdate, closeProject, markBloodUsed, updateProject, refreshProjects, projectsLoading } = useStore();
  const project = projects.find((p) => p.id === id);

  const [donor, setDonor] = useState("");
  const [amount, setAmount] = useState<number>(10000);
  const [msg, setMsg] = useState("");

  if (!project) {
    return (
      <div className="space-y-4">
        <Link to="/app/projects" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="mr-1 h-4 w-4" />Back to projects</Link>
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          {projectsLoading ? "Loading project details..." : "Project not found."}
          <div className="mt-4"><Button variant="outline" onClick={() => void refreshProjects(true)}>Retry / Refresh Data</Button></div>
        </div>
      </div>
    );
  }

  const pct = project.target > 0 ? Math.min(100, (project.raised / project.target) * 100) : 0;
  const remaining = Math.max(0, project.target - project.raised);

  const onAddDonation = async () => {
    if (!donor.trim() || !amount || amount <= 0) return toast.error("Enter donor name and amount");
    try {
      await addDonation(project.id, donor, amount);
      toast.success(`Funds added · ${formatPKR(amount)}`);
      setDonor(""); setAmount(10000);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to add donation");
    }
  };
  const onSend = async () => {
    if (!msg.trim() || !user) return toast.error("Write a message first");
    try {
      await addMessage(project.id, user.name, user.role, msg);
      toast.success("Project message sent");
      setMsg("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to send message");
    }
  };
  const setStatus = async (status: typeof project.status) => {
    try {
      await updateProject(project.id, { status });
      toast.success(`Project ${status.toLowerCase()} successfully`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update project");
    }
  };
  const onClose = async () => {
    try {
      await closeProject(project.id);
      toast.success("Project closed successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to close project");
    }
  };
  const onBlood = async () => {
    try {
      await markBloodUsed(project.id);
      toast.success("Thank-you message sent to donors");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update blood request");
    }
  };
  const prepared = () => toast.info("This action is prepared and will be connected in the next module.");
  const onAddUpdate = async () => {
    const note = window.prompt("Add a short timeline note for this project");
    if (!note?.trim()) return;
    try {
      await addProjectUpdate(project.id, note.trim());
      toast.success("Update added");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to add update");
    }
  };

  return (
    <div className="space-y-6">
      <Link to="/app/projects" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="mr-1 h-4 w-4" />Back to projects</Link>

      <div className="bg-gradient-card relative overflow-hidden rounded-2xl border border-border p-6 shadow-soft">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{project.id} · {project.type}</div>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">{project.title}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <StatusBadge status={project.status} />
              <UrgencyBadge urgency={project.urgency} />
              <span className="text-xs text-muted-foreground">· {project.wing}</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{project.city}</span>
              {project.hospital && <span className="inline-flex items-center gap-1"><Building2 className="h-3 w-3" />{project.hospital}</span>}
              <span className="inline-flex items-center gap-1"><User className="h-3 w-3" />{project.assignedMember}</span>
              <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" />Created {timeAgo(project.createdAt)}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => void refreshProjects(true)} disabled={projectsLoading}>Refresh Data</Button>
            <Button variant="outline" onClick={() => void setStatus("Verified")}><CheckCircle2 className="mr-1 h-4 w-4" />Mark as Verified</Button>
            <Button variant="outline" onClick={() => void setStatus("Active")}>Mark as Active</Button>
            <Button variant="outline" onClick={() => void setStatus("Completed")}>Mark as Completed</Button>
            <Button variant="outline" onClick={() => void setStatus("Archived")}>Archive Project</Button>
            <Button variant="outline" onClick={prepared}>Assign Member</Button>
            <Button onClick={() => void onClose()} className="bg-gradient-brand">Close Project</Button>
          </div>
        </div>

        {project.target > 0 && (
          <div className="relative mt-6 grid gap-4 md:grid-cols-4">
            <Stat label="Target" value={formatPKR(project.target)} />
            <Stat label="Raised" value={formatPKR(project.raised)} tone="text-success" />
            <Stat label="Remaining" value={formatPKR(remaining)} tone="text-warning" />
            <Stat label="Progress" value={`${pct.toFixed(0)}%`} />
            <div className="md:col-span-4"><Progress value={pct} className="h-2.5" /></div>
          </div>
        )}
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="flex w-full flex-wrap justify-start gap-1 bg-card p-1">
          {["overview", "timeline", "financials", "blood", "documents", "team", "chat", "activity", "closure"].map((t) => (
            <TabsTrigger key={t} value={t} className="capitalize">{t}</TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="bg-gradient-card lg:col-span-2 rounded-2xl border border-border p-5 shadow-soft">
              <div className="text-sm font-semibold">Case summary</div>
              <p className="mt-2 text-sm text-muted-foreground">{project.description}</p>
            </div>
            <div className="bg-gradient-card rounded-2xl border border-border p-5 shadow-soft space-y-3 text-sm">
              <div className="text-sm font-semibold">Contact</div>
              <Row icon={User} label={project.requester} />
              <Row icon={Phone} label={project.contact} />
              {project.hospital && <Row icon={Building2} label={project.hospital} />}
              <Row icon={MapPin} label={project.city} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="timeline" className="mt-4">
          <div className="bg-gradient-card rounded-2xl border border-border p-5 shadow-soft">
            <div className="mb-4 flex items-center justify-between gap-2">
              <div className="text-sm font-semibold">Project timeline</div>
              <Button variant="outline" size="sm" onClick={() => void onAddUpdate()}>Add Update</Button>
            </div>
            <ol className="relative ml-3 border-l border-border">
              {project.timeline.length === 0 && <li className="ml-4 py-2 text-sm text-muted-foreground">No timeline events yet.</li>}
              {project.timeline.map((t) => (
                <li key={t.id} className="mb-5 ml-5">
                  <span className="absolute -left-[7px] mt-1 h-3 w-3 rounded-full bg-primary ring-4 ring-background" />
                  <div className="text-sm font-medium">{t.text}</div>
                  <div className="text-xs text-muted-foreground">{t.actor} · {timeAgo(t.at)}</div>
                </li>
              ))}
            </ol>
          </div>
        </TabsContent>

        <TabsContent value="financials" className="mt-4">
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="bg-gradient-card lg:col-span-2 rounded-2xl border border-border p-5 shadow-soft">
              <div className="mb-3 flex items-center justify-between">
                <div className="text-sm font-semibold">Donations</div>
                <span className="text-xs text-muted-foreground">{project.donations.length} entries</span>
              </div>
              <div className="divide-y divide-border">
                {project.donations.length === 0 && <div className="py-3 text-sm text-muted-foreground">No donations yet.</div>}
                {project.donations.map((d) => (
                  <div key={d.id} className="flex items-center justify-between py-3 text-sm">
                    <div>
                      <div className="font-medium">{d.donor}</div>
                      <div className="text-xs text-muted-foreground">{timeAgo(d.at)}</div>
                    </div>
                    <div className="font-semibold text-success">{formatPKR(d.amount)}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-card rounded-2xl border border-border p-5 shadow-soft">
              <div className="mb-3 text-sm font-semibold">Add donation</div>
              <div className="space-y-3">
                <input value={donor} onChange={(e) => setDonor(e.target.value)} placeholder="Donor name" className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-ring" />
                <input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} placeholder="Amount (PKR)" className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-ring" />
                <Button onClick={() => void onAddDonation()} className="w-full bg-gradient-brand"><Plus className="mr-1 h-4 w-4" />Add donation</Button>
                <Button variant="outline" onClick={prepared} className="w-full"><Upload className="mr-1 h-4 w-4" />Upload receipt</Button>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="blood" className="mt-4">
          <div className="bg-gradient-card rounded-2xl border border-border p-6 shadow-soft">
            {project.bloodGroup ? (
              <div className="grid gap-4 md:grid-cols-3">
                <Stat label="Blood group" value={project.bloodGroup} tone="text-destructive" />
                <Stat label="Units required" value={String(project.unitsRequired ?? 0)} />
                <Stat label="Units arranged" value={`${project.unitsArranged ?? 0}/${project.unitsRequired ?? 0}`} tone="text-success" />
                <div className="md:col-span-3">
                  <Button onClick={() => void onBlood()} className="bg-destructive text-destructive-foreground hover:opacity-90"><Droplets className="mr-1 h-4 w-4" />Mark blood used</Button>
                </div>
              </div>
            ) : <div className="text-sm text-muted-foreground">This project is not a blood request.</div>}
          </div>
        </TabsContent>

        <TabsContent value="documents" className="mt-4">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {project.documents.map((d) => (
              <div key={d.id} className="bg-gradient-card flex items-center gap-3 rounded-2xl border border-border p-4 shadow-soft hover-lift">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><FileText className="h-5 w-5" /></div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{d.name}</div>
                  <div className="text-xs text-muted-foreground">{d.kind} · {d.size}</div>
                </div>
              </div>
            ))}
            <button onClick={prepared} className="bg-gradient-card flex items-center justify-center gap-2 rounded-2xl border border-dashed border-border p-4 text-sm text-muted-foreground hover-lift">
              <Upload className="h-4 w-4" /> Upload document
            </button>
          </div>
        </TabsContent>

        <TabsContent value="team" className="mt-4">
          <div className="bg-gradient-card rounded-2xl border border-border p-5 shadow-soft">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-sm font-semibold">Assigned team</div>
              <Button variant="outline" size="sm" onClick={prepared}><UsersIcon className="mr-1 h-4 w-4" />Assign new member</Button>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <TeamCard role="Wing Head" name="Bilal Ahmad" />
              <TeamCard role="Member" name={project.assignedMember} />
              <TeamCard role="Volunteer" name="Mariam Sheikh" />
              <TeamCard role="Volunteer" name="Daniyal Shah" />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="chat" className="mt-4">
          <div className="bg-gradient-card flex h-[480px] flex-col rounded-2xl border border-border shadow-soft">
            <div className="flex items-center gap-2 border-b border-border px-4 py-3">
              <MessagesSquare className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold">Project chat</span>
              <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground"><Pin className="h-3 w-3" />Pinned: verify hospital admission</span>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {project.messages.length === 0 && <div className="text-sm text-muted-foreground">No messages yet. Start the conversation.</div>}
              {project.messages.map((m) => {
                const me = m.author === user?.name;
                return (
                  <div key={m.id} className={`flex ${me ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm shadow-soft ${me ? "bg-gradient-brand text-primary-foreground" : "bg-muted"}`}>
                      {!me && <div className="mb-0.5 text-[10px] font-medium uppercase tracking-wider opacity-70">{m.author}</div>}
                      <div>{m.text}</div>
                      <div className={`mt-1 text-[10px] ${me ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{timeAgo(m.at)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-2 border-t border-border p-3">
              <input value={msg} onChange={(e) => setMsg(e.target.value)} onKeyDown={(e) => e.key === "Enter" && void onSend()} placeholder="Write a message..." className="h-10 flex-1 rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-ring" />
              <Button onClick={() => void onSend()} className="bg-gradient-brand"><Send className="h-4 w-4" /></Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="mt-4">
          <div className="bg-gradient-card rounded-2xl border border-border p-5 shadow-soft">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold"><ScrollText className="h-4 w-4" />Activity logs</div>
            <ul className="divide-y divide-border">
              {project.timeline.map((t) => (
                <li key={t.id} className="flex items-center justify-between py-2 text-sm">
                  <div>{t.text}</div>
                  <div className="text-xs text-muted-foreground">{t.actor} · {timeAgo(t.at)}</div>
                </li>
              ))}
            </ul>
          </div>
        </TabsContent>

        <TabsContent value="closure" className="mt-4">
          <div className="bg-gradient-card rounded-2xl border border-border p-6 shadow-soft">
            <div className="text-sm font-semibold">Final outcome</div>
            <p className="mt-1 text-sm text-muted-foreground">Confirm proofs and close this project. Donors will receive a financial proof summary.</p>
            <ul className="mt-4 space-y-2 text-sm">
              {["All proofs uploaded", "Hospital receipts verified", "Donor list reconciled", "Wing head sign-off"].map((s) => (
                <li key={s} className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" />{s}</li>
              ))}
            </ul>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button onClick={prepared}>Generate donor report</Button>
              <Button onClick={() => void onClose()} className="bg-gradient-brand">Close project</Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="rounded-xl border border-border bg-background/60 p-3">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`mt-1 text-lg font-semibold ${tone || ""}`}>{value}</div>
    </div>
  );
}
function Row({ icon: Icon, label }: { icon: any; label: string }) {
  return <div className="flex items-center gap-2 text-sm text-muted-foreground"><Icon className="h-3.5 w-3.5" />{label}</div>;
}
function TeamCard({ role, name }: { role: string; name: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-background/60 p-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-brand text-xs font-semibold text-primary-foreground">{name.split(" ").map((n) => n[0]).join("").slice(0, 2)}</div>
      <div>
        <div className="text-sm font-medium">{name}</div>
        <div className="text-[11px] text-muted-foreground">{role}</div>
      </div>
    </div>
  );
}
