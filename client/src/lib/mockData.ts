export type TermStatus = 'Draft' | 'In Review' | 'Canonical' | 'Deprecated';
export type Visibility = 'Internal' | 'Client-Safe' | 'Public';

export interface Term {
  id: string;
  name: string;
  category: string;
  definition: string;
  why_exists: string;
  used_when: string;
  not_used_when: string;
  examples_good: string[];
  examples_bad: string[];
  synonyms: string[];
  status: TermStatus;
  visibility: Visibility;
  owner: string;
  updated_at: string;
  version: number;
}

export const CATEGORIES = [
  "Organizational",
  "Planning & Execution",
  "Commercial",
  "Financial",
  "Cultural",
  "Methodology",
  "Systems"
];

export const MOCK_TERMS: Term[] = [
  {
    id: "1",
    name: "Condition of Satisfaction (CoS)",
    category: "Planning & Execution",
    definition: "A specific, measurable outcome that defines the successful completion of a deliverable or phase. It must be binary (met/not met) and agreed upon before work begins.",
    why_exists: "To prevent ambiguity about what 'done' looks like and avoid scope creep.",
    used_when: "Defining project milestones, creating Scopes of Work (SOWs), and conducting handoffs.",
    not_used_when: "Describing general aspirations or non-measurable goals.",
    examples_good: [
      "Client approves the wireframe deck via email.",
      "API response time is under 200ms for 95% of requests."
    ],
    examples_bad: [
      "The client is happy with the design.",
      "The system is fast."
    ],
    synonyms: ["Acceptance Criteria", "Definition of Done"],
    status: "Canonical",
    visibility: "Client-Safe",
    owner: "Sarah Jenkins",
    updated_at: "2025-01-05",
    version: 3
  },
  {
    id: "2",
    name: "Golden Path",
    category: "Methodology",
    definition: "The ideal, default user journey through a product that delivers the core value proposition with zero friction or edge cases.",
    why_exists: "To focus design and development efforts on the most critical user flows first.",
    used_when: "Designing onboarding flows, prioritizing MVP features.",
    not_used_when: "Discussing error handling or edge cases (those are 'Unhappy Paths').",
    examples_good: [
      "The Golden Path for sign-up is: Landing Page -> Email Input -> Magic Link Click -> Dashboard."
    ],
    examples_bad: [
      "The user tries to login but forgets their password."
    ],
    synonyms: ["Happy Path", "Core Flow"],
    status: "Canonical",
    visibility: "Internal",
    owner: "Mike Ross",
    updated_at: "2024-12-10",
    version: 1
  },
  {
    id: "3",
    name: "Sprint",
    category: "Planning & Execution",
    definition: "A fixed timebox of two weeks where a committed set of work is delivered.",
    why_exists: "To provide a regular cadence for delivery and feedback.",
    used_when: "Discussing development cycles.",
    not_used_when: "Referring to a general period of work (use 'Phase').",
    examples_good: [
      "We will tackle the payment integration in Sprint 4."
    ],
    examples_bad: [
      "Let's sprint on this for a few days."
    ],
    synonyms: ["Cycle", "Iteration"],
    status: "Deprecated",
    visibility: "Internal",
    owner: "Agile Coach",
    updated_at: "2023-11-20",
    version: 5
  },
  {
    id: "4",
    name: "Cycle",
    category: "Planning & Execution",
    definition: "A six-week period of focused work followed by a two-week cool-down. Replaces 'Sprint' in our new methodology.",
    why_exists: "To allow for deeper work without the constant interruption of two-week planning meetings.",
    used_when: "Planning product roadmaps and engineering allocation.",
    not_used_when: "Referring to daily tasks.",
    examples_good: [
      "Cycle 2 focuses on the mobile app refactor."
    ],
    examples_bad: [
      "The sprint ends on Friday."
    ],
    synonyms: [],
    status: "Canonical",
    visibility: "Internal",
    owner: "VP Engineering",
    updated_at: "2025-01-02",
    version: 1
  },
  {
    id: "5",
    name: "Katalyst Framework",
    category: "Organizational",
    definition: "Our proprietary integrated approach to strategy, design, and execution.",
    why_exists: "To differentiate our offering from standard agencies.",
    used_when: "Pitching to new clients, onboarding employees.",
    not_used_when: "Referring to a specific software library.",
    examples_good: [],
    examples_bad: [],
    synonyms: [],
    status: "Draft",
    visibility: "Public",
    owner: "Marketing Lead",
    updated_at: "2025-01-07",
    version: 0
  }
];
