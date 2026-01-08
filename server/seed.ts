import { db } from "./db";
import { categories, terms, users, proposals, settings } from "@shared/schema";

const SEED_CATEGORIES = [
  { name: "Organizational", description: "Definitions and vocabulary related to organizational structure.", color: "bg-primary", sortOrder: 0 },
  { name: "Planning & Execution", description: "Definitions and vocabulary related to planning & execution.", color: "bg-kat-basque", sortOrder: 1 },
  { name: "Commercial", description: "Definitions and vocabulary related to commercial operations.", color: "bg-kat-wheat", sortOrder: 2 },
  { name: "Financial", description: "Definitions and vocabulary related to financial terms.", color: "bg-kat-mystical", sortOrder: 3 },
  { name: "Cultural", description: "Definitions and vocabulary related to cultural values.", color: "bg-kat-edamame", sortOrder: 4 },
  { name: "Methodology", description: "Definitions and vocabulary related to methodology.", color: "bg-kat-zeus", sortOrder: 5 },
  { name: "Systems", description: "Definitions and vocabulary related to systems.", color: "bg-kat-charcoal", sortOrder: 6 },
];

const SEED_TERMS = [
  {
    name: "Condition of Satisfaction (CoS)",
    category: "Planning & Execution",
    definition: "A specific, measurable outcome that defines the successful completion of a deliverable or phase. It must be binary (met/not met) and agreed upon before work begins.",
    whyExists: "To prevent ambiguity about what 'done' looks like and avoid scope creep.",
    usedWhen: "Defining project milestones, creating Scopes of Work (SOWs), and conducting handoffs.",
    notUsedWhen: "Describing general aspirations or non-measurable goals.",
    examplesGood: ["Client approves the wireframe deck via email.", "API response time is under 200ms for 95% of requests."],
    examplesBad: ["The client is happy with the design.", "The system is fast."],
    synonyms: ["Acceptance Criteria", "Definition of Done"],
    status: "Canonical" as const,
    visibility: "Client-Safe" as const,
    owner: "Sarah Jenkins",
    version: 3,
  },
  {
    name: "Golden Path",
    category: "Methodology",
    definition: "The ideal, default user journey through a product that delivers the core value proposition with zero friction or edge cases.",
    whyExists: "To focus design and development efforts on the most critical user flows first.",
    usedWhen: "Designing onboarding flows, prioritizing MVP features.",
    notUsedWhen: "Discussing error handling or edge cases (those are 'Unhappy Paths').",
    examplesGood: ["The Golden Path for sign-up is: Landing Page -> Email Input -> Magic Link Click -> Dashboard."],
    examplesBad: ["The user tries to login but forgets their password."],
    synonyms: ["Happy Path", "Core Flow"],
    status: "Canonical" as const,
    visibility: "Internal" as const,
    owner: "Mike Ross",
    version: 1,
  },
  {
    name: "Sprint",
    category: "Planning & Execution",
    definition: "A fixed timebox of two weeks where a committed set of work is delivered.",
    whyExists: "To provide a regular cadence for delivery and feedback.",
    usedWhen: "Discussing development cycles.",
    notUsedWhen: "Referring to a general period of work (use 'Phase').",
    examplesGood: ["We will tackle the payment integration in Sprint 4."],
    examplesBad: ["Let's sprint on this for a few days."],
    synonyms: ["Cycle", "Iteration"],
    status: "Deprecated" as const,
    visibility: "Internal" as const,
    owner: "Agile Coach",
    version: 5,
  },
  {
    name: "Cycle",
    category: "Planning & Execution",
    definition: "A six-week period of focused work followed by a two-week cool-down. Replaces 'Sprint' in our new methodology.",
    whyExists: "To allow for deeper work without the constant interruption of two-week planning meetings.",
    usedWhen: "Planning product roadmaps and engineering allocation.",
    notUsedWhen: "Referring to daily tasks.",
    examplesGood: ["Cycle 2 focuses on the mobile app refactor."],
    examplesBad: ["The sprint ends on Friday."],
    synonyms: [],
    status: "Canonical" as const,
    visibility: "Internal" as const,
    owner: "VP Engineering",
    version: 1,
  },
  {
    name: "Katalyst Framework",
    category: "Organizational",
    definition: "Our proprietary integrated approach to strategy, design, and execution.",
    whyExists: "To differentiate our offering from standard agencies.",
    usedWhen: "Pitching to new clients, onboarding employees.",
    notUsedWhen: "Referring to a specific software library.",
    examplesGood: [],
    examplesBad: [],
    synonyms: [],
    status: "Draft" as const,
    visibility: "Public" as const,
    owner: "Marketing Lead",
    version: 0,
  },
];

const SEED_USERS = [
  { name: "Sarah Jenkins", email: "sarah@katalyst.com", role: "Admin" as const, status: "active" },
  { name: "Mike Ross", email: "mike@katalyst.com", role: "Approver" as const, status: "active" },
  { name: "Rachel Zane", email: "rachel@katalyst.com", role: "Editor" as const, status: "active" },
  { name: "Harvey Specter", email: "harvey@katalyst.com", role: "Contributor" as const, status: "active" },
  { name: "Louis Litt", email: "louis@katalyst.com", role: "Viewer" as const, status: "invited" },
];

const SEED_PROPOSALS = [
  {
    termName: "Phase Gate",
    category: "Planning & Execution",
    type: "new" as const,
    status: "pending" as const,
    submittedBy: "Mike Ross",
    changesSummary: "New term proposal for defining milestone checkpoints in project lifecycle.",
    definition: "A checkpoint at the end of each project phase where key stakeholders review deliverables and decide whether to proceed.",
    whyExists: "To ensure proper governance and decision-making between project phases.",
    usedWhen: "Managing large projects with multiple phases.",
    notUsedWhen: "Small, iterative tasks without formal governance.",
  },
  {
    termName: "Condition of Satisfaction (CoS)",
    category: "Planning & Execution",
    type: "edit" as const,
    status: "in_review" as const,
    submittedBy: "Rachel Zane",
    assignedTo: "Sarah Jenkins",
    changesSummary: "Updated examples section and added new exclusion rules.",
    definition: "A specific, measurable outcome that defines the successful completion of a deliverable or phase.",
    whyExists: "To prevent ambiguity about what 'done' looks like.",
    usedWhen: "Defining project milestones and handoffs.",
    notUsedWhen: "Describing general aspirations.",
  },
  {
    termName: "Client Success Metric",
    category: "Commercial",
    type: "new" as const,
    status: "changes_requested" as const,
    submittedBy: "Harvey Specter",
    assignedTo: "Sarah Jenkins",
    changesSummary: "Definition needs to differentiate from 'KPI' more clearly.",
    definition: "A quantitative measure of value delivered to a client.",
    whyExists: "To track client satisfaction and success.",
    usedWhen: "Reporting on client engagements.",
    notUsedWhen: "Internal performance tracking.",
  },
];

const SEED_SETTINGS = [
  { key: "require_approver_signoff", value: true },
  { key: "require_change_note", value: true },
  { key: "allow_self_approval", value: false },
  { key: "weekly_digest", value: true },
  { key: "new_proposal_alerts", value: true },
  { key: "changes_requested_alerts", value: true },
  { key: "enable_client_portal", value: false },
  { key: "enable_public_glossary", value: false },
];

export async function seed() {
  console.log("Seeding database...");

  const existingCategories = await db.select().from(categories);
  if (existingCategories.length === 0) {
    console.log("Seeding categories...");
    await db.insert(categories).values(SEED_CATEGORIES);
  }

  const existingTerms = await db.select().from(terms);
  if (existingTerms.length === 0) {
    console.log("Seeding terms...");
    await db.insert(terms).values(SEED_TERMS);
  }

  const existingUsers = await db.select().from(users);
  if (existingUsers.length === 0) {
    console.log("Seeding users...");
    await db.insert(users).values(SEED_USERS);
  }

  const existingProposals = await db.select().from(proposals);
  if (existingProposals.length === 0) {
    console.log("Seeding proposals...");
    await db.insert(proposals).values(SEED_PROPOSALS);
  }

  const existingSettings = await db.select().from(settings);
  if (existingSettings.length === 0) {
    console.log("Seeding settings...");
    await db.insert(settings).values(SEED_SETTINGS);
  }

  console.log("Database seeding complete!");
}
