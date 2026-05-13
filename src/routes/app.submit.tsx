import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CheckCircle2, FileUp } from "lucide-react";
import { type ProjectType, type Urgency } from "@/lib/mock-data";

export const Route = createFileRoute("/app/submit")({
  component: SubmitPage,
});

const TYPES: ProjectType[] = ["Medical Aid", "Blood Donation", "Financial Aid", "Welfare Campaign", "Community Support", "Emergency Patient"];
const URGENCIES: Urgency[] = ["Low", "Medium", "High", "Critical"];

function SubmitPage() {
  const { addProject, isSupabaseData } = useStore();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    requester: "", contact: "", email: "", city: "Peshawar",
    type: "Medical Aid" as ProjectType, title: "", description: "",
    hospital: "", target: 0, bloodGroup: "", units: 0,
    urgency: "Medium" as Urgency, consent: false,
  });
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const set = (k: keyof typeof form, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.requester || !form.contact || !form.consent) {
      toast.error("Please fill all required fields and accept consent");
      return;
    }
    setSubmitting(true);
    try {
      const id = await addProject({
        title: form.title, type: form.type, status: "Pending Review", urgency: form.urgency,
        wing: form.type === "Blood Donation" ? "Blood Wing" : form.type === "Financial Aid" ? "Finance Wing" : form.type === "Welfare Campaign" || form.type === "Community Support" ? "Volunteer Wing" : "Medical Aid Wing",
        assignedMember: "—", city: form.city, hospital: form.hospital || undefined,
        requester: form.requester, contact: form.contact,
        description: form.description, target: Number(form.target) || 0,
        bloodGroup: form.bloodGroup || undefined, unitsRequired: Number(form.units) || undefined, unitsArranged: 0,
      });
      setSubmittedId(id);
      toast.success(`${isSupabaseData ? "Project submitted to Supabase" : "Demo project submitted"} · ${id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Project submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (submittedId) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-border bg-gradient-card p-8 text-center shadow-elev">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-success/15 text-success"><CheckCircle2 className="h-7 w-7" /></div>
        <h2 className="text-xl font-semibold">Request submitted</h2>
        <p className="mt-2 text-sm text-muted-foreground">Track your case using the ID below. Our team will review and contact you shortly.</p>
        <div className="mt-4 inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2 font-mono text-sm">{submittedId}</div>
        <div className="mt-6 flex justify-center gap-2">
          <Button onClick={() => navigate({ to: "/app/projects/$id", params: { id: submittedId } })}>View project</Button>
          <Button variant="outline" onClick={() => { setSubmittedId(null); }}>Submit another</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Submit a project</h1>
        <p className="text-sm text-muted-foreground">Tell us about the case. We review every submission within 24 hours.</p>
      </div>

      <form onSubmit={onSubmit} className="bg-gradient-card space-y-6 rounded-2xl border border-border p-6 shadow-soft">
        <Section title="Requester details">
          <Field label="Full name" required><Input value={form.requester} onChange={(v) => set("requester", v)} /></Field>
          <Field label="Contact number" required><Input value={form.contact} onChange={(v) => set("contact", v)} /></Field>
          <Field label="Email"><Input type="email" value={form.email} onChange={(v) => set("email", v)} /></Field>
          <Field label="City"><Input value={form.city} onChange={(v) => set("city", v)} /></Field>
        </Section>

        <Section title="Project details">
          <Field label="Project type">
            <Select value={form.type} onChange={(v) => set("type", v as ProjectType)} options={TYPES} />
          </Field>
          <Field label="Urgency">
            <Select value={form.urgency} onChange={(v) => set("urgency", v as Urgency)} options={URGENCIES} />
          </Field>
          <Field label="Project title" required full><Input value={form.title} onChange={(v) => set("title", v)} placeholder="e.g. Dialysis support for kidney patient" /></Field>
          <Field label="Description" full>
            <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={4}
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring" />
          </Field>
          <Field label="Hospital / Organization"><Input value={form.hospital} onChange={(v) => set("hospital", v)} /></Field>
          <Field label="Required amount (PKR)"><Input type="number" value={String(form.target)} onChange={(v) => set("target", Number(v))} /></Field>
        </Section>

        {form.type === "Blood Donation" && (
          <Section title="Blood request">
            <Field label="Blood group">
              <Select value={form.bloodGroup} onChange={(v) => set("bloodGroup", v)} options={["A+","A-","B+","B-","AB+","AB-","O+","O-"]} />
            </Field>
            <Field label="Units required"><Input type="number" value={String(form.units)} onChange={(v) => set("units", Number(v))} /></Field>
          </Section>
        )}

        <Section title="Documents">
          <div className="md:col-span-2">
            <button type="button" onClick={() => toast.success("Document attached")} className="bg-gradient-card flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border py-6 text-sm text-muted-foreground hover-lift">
              <FileUp className="h-4 w-4" /> Click to upload medical reports, bills, or identity documents
            </button>
          </div>
        </Section>

        <label className="flex cursor-pointer items-start gap-2 text-sm">
          <input type="checkbox" checked={form.consent} onChange={(e) => set("consent", e.target.checked)} className="mt-0.5" />
          <span className="text-muted-foreground">I confirm the information provided is accurate and consent to its verification by WelfareOS.</span>
        </label>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => history.back()}>Cancel</Button>
          <Button type="submit" disabled={submitting} className="bg-gradient-brand">{submitting ? "Submitting..." : "Submit project"}</Button>
        </div>
      </form>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-3 text-sm font-semibold">{title}</div>
      <div className="grid gap-4 md:grid-cols-2">{children}</div>
    </div>
  );
}
function Field({ label, required, full, children }: { label: string; required?: boolean; full?: boolean; children: React.ReactNode }) {
  return (
    <div className={full ? "md:col-span-2" : ""}>
      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{label} {required && <span className="text-destructive">*</span>}</label>
      {children}
    </div>
  );
}
function Input({ value, onChange, type = "text", placeholder }: { value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
    className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-ring" />;
}
function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}
      className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-ring">
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}
