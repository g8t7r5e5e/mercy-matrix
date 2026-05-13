export type Role = "super_admin" | "wing_head" | "member" | "volunteer" | "general_user" | "donor" | "blood_donor";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  wing?: string;
  avatar?: string;
  wingId?: string;
}

export const ACCOUNTS: Array<User & { password: string }> = [
  { id: "u1", name: "Ayesha Khan", email: "admin@welfareos.org", password: "password123", role: "super_admin" },
  { id: "u2", name: "Bilal Ahmad", email: "head@welfareos.org", password: "password123", role: "wing_head", wing: "Medical Aid Wing" },
  { id: "u3", name: "Hamza Tariq", email: "member@welfareos.org", password: "password123", role: "member", wing: "Medical Aid Wing" },
  { id: "u4", name: "Sana Riaz", email: "user@welfareos.org", password: "password123", role: "general_user" },
];

export type ProjectType = "Medical Aid" | "Blood Donation" | "Financial Aid" | "Welfare Campaign" | "Community Support" | "Emergency Patient";
export type ProjectStatus = "Pending Review" | "Verified" | "Active" | "In Progress" | "Partially Funded" | "Donor Matched" | "Completed" | "Closed" | "Archived" | "Rejected";
export type Urgency = "Low" | "Medium" | "High" | "Critical";

export interface TimelineEvent { id: string; at: string; actor: string; text: string; }
export interface Donation { id: string; donor: string; amount: number; at: string; }
export interface Message { id: string; author: string; role: Role; text: string; at: string; }
export interface DocItem { id: string; name: string; kind: string; size: string; }

export interface Project {
  id: string;
  title: string;
  type: ProjectType;
  status: ProjectStatus;
  urgency: Urgency;
  wing: string;
  assignedMember: string;
  city: string;
  hospital?: string;
  requester: string;
  contact: string;
  description: string;
  target: number;
  raised: number;
  bloodGroup?: string;
  unitsRequired?: number;
  unitsArranged?: number;
  createdAt: string;
  updatedAt: string;
  timeline: TimelineEvent[];
  donations: Donation[];
  messages: Message[];
  documents: DocItem[];
  dbId?: string;
  livesImpacted?: number;
  metadata?: Record<string, unknown>;
}

const now = new Date();
const daysAgo = (n: number) => new Date(now.getTime() - n * 86400000).toISOString();

export const SEED_PROJECTS: Project[] = [
  {
    id: "WOS-101", title: "Emergency Surgery Support for Child Patient", type: "Medical Aid",
    status: "Active", urgency: "Critical", wing: "Medical Aid Wing", assignedMember: "Hamza Tariq",
    city: "Peshawar", hospital: "Lady Reading Hospital", requester: "Imran Ali", contact: "+92 300 1234567",
    description: "8-year-old patient requires urgent cardiac surgery. Family unable to afford the procedure.",
    target: 850000, raised: 612000, createdAt: daysAgo(7), updatedAt: daysAgo(0),
    timeline: [
      { id: "t1", at: daysAgo(7), actor: "Imran Ali", text: "Project submitted" },
      { id: "t2", at: daysAgo(6), actor: "Bilal Ahmad", text: "Documents verified" },
      { id: "t3", at: daysAgo(5), actor: "Ayesha Khan", text: "Assigned to Medical Aid Wing" },
      { id: "t4", at: daysAgo(2), actor: "System", text: "Donation of PKR 100,000 received" },
    ],
    donations: [
      { id: "d1", donor: "Anonymous", amount: 250000, at: daysAgo(4) },
      { id: "d2", donor: "Ahmed Foundation", amount: 200000, at: daysAgo(3) },
      { id: "d3", donor: "Local Donor", amount: 162000, at: daysAgo(1) },
    ],
    messages: [
      { id: "m1", author: "Bilal Ahmad", role: "wing_head", text: "Hospital confirmed admission. Proceeding with verification.", at: daysAgo(5) },
      { id: "m2", author: "Hamza Tariq", role: "member", text: "Visited family today. Documents collected.", at: daysAgo(4) },
    ],
    documents: [
      { id: "doc1", name: "Medical Report.pdf", kind: "Medical", size: "1.2 MB" },
      { id: "doc2", name: "Hospital Bill.pdf", kind: "Bill", size: "340 KB" },
      { id: "doc3", name: "CNIC.jpg", kind: "Identity", size: "210 KB" },
    ],
  },
  {
    id: "WOS-102", title: "B Negative Blood Needed at Northwest Hospital", type: "Blood Donation",
    status: "Donor Matched", urgency: "Critical", wing: "Blood Wing", assignedMember: "Hamza Tariq",
    city: "Peshawar", hospital: "Northwest General Hospital", requester: "Dr. Saima", contact: "+92 311 2233445",
    description: "Patient post-surgery requires 3 units of B- blood within 24 hours.",
    target: 0, raised: 0, bloodGroup: "B-", unitsRequired: 3, unitsArranged: 2,
    createdAt: daysAgo(1), updatedAt: daysAgo(0),
    timeline: [
      { id: "t1", at: daysAgo(1), actor: "Dr. Saima", text: "Blood request submitted" },
      { id: "t2", at: daysAgo(0), actor: "System", text: "2 donors matched" },
    ],
    donations: [], messages: [], documents: [],
  },
  {
    id: "WOS-103", title: "Dialysis Support for Chronic Kidney Patient", type: "Medical Aid",
    status: "Partially Funded", urgency: "High", wing: "Medical Aid Wing", assignedMember: "Hamza Tariq",
    city: "Mardan", hospital: "Mardan Medical Complex", requester: "Khalid Khan", contact: "+92 333 7654321",
    description: "Monthly dialysis sessions support for 6 months.",
    target: 360000, raised: 145000, createdAt: daysAgo(14), updatedAt: daysAgo(2),
    timeline: [{ id: "t1", at: daysAgo(14), actor: "Khalid Khan", text: "Project submitted" }],
    donations: [{ id: "d1", donor: "Noor Trust", amount: 145000, at: daysAgo(10) }],
    messages: [], documents: [],
  },
  {
    id: "WOS-104", title: "Winter Relief Drive for 200 Families", type: "Welfare Campaign",
    status: "In Progress", urgency: "Medium", wing: "Volunteer Wing", assignedMember: "Hamza Tariq",
    city: "Swat", requester: "WelfareOS Team", contact: "—",
    description: "Distribution of blankets, warm clothing, and food packs across remote villages.",
    target: 1200000, raised: 980000, createdAt: daysAgo(20), updatedAt: daysAgo(1),
    timeline: [], donations: [], messages: [], documents: [],
  },
  {
    id: "WOS-105", title: "Education Support for Orphan Students", type: "Financial Aid",
    status: "Verified", urgency: "Medium", wing: "Student Wing", assignedMember: "Hamza Tariq",
    city: "Islamabad", requester: "Hope Orphanage", contact: "+92 51 9988776",
    description: "School fees and supplies for 25 orphan students for one academic year.",
    target: 540000, raised: 120000, createdAt: daysAgo(9), updatedAt: daysAgo(3),
    timeline: [], donations: [], messages: [], documents: [],
  },
  {
    id: "WOS-106", title: "Medicine Support for Cancer Patient", type: "Emergency Patient",
    status: "Pending Review", urgency: "High", wing: "Medical Aid Wing", assignedMember: "—",
    city: "Peshawar", hospital: "Shaukat Khanum", requester: "Family of Patient", contact: "+92 345 1112233",
    description: "Chemotherapy medicine support for 3 cycles.",
    target: 420000, raised: 0, createdAt: daysAgo(0), updatedAt: daysAgo(0),
    timeline: [], donations: [], messages: [], documents: [],
  },
  {
    id: "WOS-107", title: "Community Water Filter Installation", type: "Community Support",
    status: "Completed", urgency: "Low", wing: "Volunteer Wing", assignedMember: "Hamza Tariq",
    city: "Swat", requester: "Village Council", contact: "—",
    description: "Installed 4 community water filters serving 1,200 residents.",
    target: 280000, raised: 280000, createdAt: daysAgo(45), updatedAt: daysAgo(15),
    timeline: [], donations: [], messages: [], documents: [],
  },
];

export interface BloodDonor { id: string; name: string; bloodGroup: string; city: string; lastDonation: string; available: boolean; total: number; }
export const BLOOD_DONORS: BloodDonor[] = [
  { id: "b1", name: "Usman Ali", bloodGroup: "B-", city: "Peshawar", lastDonation: daysAgo(95), available: true, total: 7 },
  { id: "b2", name: "Fahad Iqbal", bloodGroup: "O+", city: "Mardan", lastDonation: daysAgo(40), available: true, total: 4 },
  { id: "b3", name: "Sara Malik", bloodGroup: "A+", city: "Islamabad", lastDonation: daysAgo(120), available: true, total: 9 },
  { id: "b4", name: "Zain Hussain", bloodGroup: "B-", city: "Peshawar", lastDonation: daysAgo(180), available: true, total: 12 },
  { id: "b5", name: "Hira Shah", bloodGroup: "AB+", city: "Swat", lastDonation: daysAgo(60), available: false, total: 3 },
  { id: "b6", name: "Asad Khan", bloodGroup: "O-", city: "Peshawar", lastDonation: daysAgo(200), available: true, total: 15 },
];

export interface Donor { id: string; name: string; type: string; totalDonated: number; lastDonation: string; projects: number; }
export const DONORS: Donor[] = [
  { id: "do1", name: "Ahmed Foundation", type: "Organization", totalDonated: 1250000, lastDonation: daysAgo(3), projects: 8 },
  { id: "do2", name: "Noor Trust", type: "Organization", totalDonated: 845000, lastDonation: daysAgo(10), projects: 5 },
  { id: "do3", name: "Anonymous", type: "Individual", totalDonated: 620000, lastDonation: daysAgo(4), projects: 12 },
  { id: "do4", name: "Tariq Mehmood", type: "Individual", totalDonated: 410000, lastDonation: daysAgo(7), projects: 4 },
  { id: "do5", name: "Green Crescent", type: "Organization", totalDonated: 380000, lastDonation: daysAgo(20), projects: 3 },
];

export interface Volunteer { id: string; name: string; tasks: number; hours: number; activeProjects: number; score: number; }
export const VOLUNTEERS: Volunteer[] = [
  { id: "v1", name: "Hamza Tariq", tasks: 28, hours: 142, activeProjects: 4, score: 980 },
  { id: "v2", name: "Mariam Sheikh", tasks: 22, hours: 110, activeProjects: 3, score: 870 },
  { id: "v3", name: "Daniyal Shah", tasks: 18, hours: 88, activeProjects: 2, score: 720 },
  { id: "v4", name: "Aisha Naveed", tasks: 14, hours: 70, activeProjects: 2, score: 640 },
];

export const WINGS = ["Medical Aid Wing", "Blood Wing", "Finance Wing", "Volunteer Wing", "Student Wing"];
