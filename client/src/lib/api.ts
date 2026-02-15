import { apiRequest } from "./queryClient";

export interface Term {
  id: string;
  name: string;
  category: string;
  definition: string;
  whyExists: string;
  usedWhen: string;
  notUsedWhen: string;
  examplesGood: string[];
  examplesBad: string[];
  synonyms: string[];
  status: "Draft" | "In Review" | "Canonical" | "Deprecated";
  visibility: "Internal" | "Client-Safe" | "Public";
  owner: string;
  version: number;
  updatedAt: string;
}

export interface TermVersion {
  id: string;
  termId: string;
  versionNumber: number;
  snapshotJson: Term;
  changeNote: string;
  changedBy: string;
  changedAt: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
  sortOrder: number;
}

export interface ProposalEvent {
  id: string;
  proposalId: string;
  eventType: "submitted" | "changes_requested" | "resubmitted" | "approved" | "rejected" | "withdrawn";
  actorId: string;
  comment: string | null;
  timestamp: string;
}

export interface Proposal {
  id: string;
  termId: string | null;
  termName: string;
  category: string;
  type: "new" | "edit";
  status: "pending" | "in_review" | "changes_requested" | "approved" | "rejected" | "withdrawn";
  submittedBy: string;
  assignedTo: string | null;
  changesSummary: string;
  definition: string;
  whyExists: string;
  usedWhen: string;
  notUsedWhen: string;
  examplesGood: string[];
  examplesBad: string[];
  synonyms: string[];
  reviewComment: string | null;
  submittedAt: string;
  events?: ProposalEvent[];
}

export interface User {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  role: "Member" | "Approver" | "Admin";
  createdAt: string;
  updatedAt: string;
}

export interface Setting {
  id: string;
  key: string;
  value: boolean;
}

export interface Principle {
  id: string;
  title: string;
  slug: string;
  summary: string;
  body: string;
  status: "Draft" | "Published" | "Archived";
  visibility: "Internal" | "Client-Safe" | "Public";
  owner: string;
  tags: string[];
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export type PrincipleWithCount = Principle & { linkedTermCount: number };

async function fetchJson<T>(method: string, url: string, data?: unknown): Promise<T> {
  const res = await apiRequest(method, url, data);
  if (method === "DELETE") {
    return undefined as T;
  }
  return res.json();
}

export const api = {
  terms: {
    getAll: () => fetchJson<Term[]>("GET", "/api/terms"),
    get: (id: string) => fetchJson<Term>("GET", `/api/terms/${id}`),
    getByCategory: (category: string) => fetchJson<Term[]>("GET", `/api/terms/category/${encodeURIComponent(category)}`),
    search: (query: string) => fetchJson<Term[]>("GET", `/api/terms/search?q=${encodeURIComponent(query)}`),
    getVersions: (id: string) => fetchJson<TermVersion[]>("GET", `/api/terms/${id}/versions`),
    getPrinciples: (id: string) => fetchJson<Principle[]>("GET", `/api/terms/${id}/principles`),
    create: (data: Partial<Term> & { changeNote?: string; changedBy?: string }) => fetchJson<Term>("POST", "/api/terms", data),
    update: (id: string, data: Partial<Term> & { changeNote?: string; changedBy?: string }) => fetchJson<Term>("PATCH", `/api/terms/${id}`, data),
    delete: (id: string) => fetchJson<void>("DELETE", `/api/terms/${id}`),
  },
  categories: {
    getAll: () => fetchJson<Category[]>("GET", "/api/categories"),
    get: (id: string) => fetchJson<Category>("GET", `/api/categories/${id}`),
    create: (data: Partial<Category>) => fetchJson<Category>("POST", "/api/categories", data),
    update: (id: string, data: Partial<Category>) => fetchJson<Category>("PATCH", `/api/categories/${id}`, data),
    delete: (id: string) => fetchJson<void>("DELETE", `/api/categories/${id}`),
  },
  proposals: {
    getAll: () => fetchJson<Proposal[]>("GET", "/api/proposals"),
    getByStatus: (status: string) => fetchJson<Proposal[]>("GET", `/api/proposals?status=${status}`),
    get: (id: string) => fetchJson<Proposal>("GET", `/api/proposals/${id}`),
    create: (data: Partial<Proposal>) => fetchJson<Proposal>("POST", "/api/proposals", data),
    update: (id: string, data: Partial<Proposal>) => fetchJson<Proposal>("PATCH", `/api/proposals/${id}`, data),
    approve: (id: string, comment?: string, edits?: Partial<Pick<Proposal, 'termName' | 'category' | 'definition' | 'whyExists' | 'usedWhen' | 'notUsedWhen' | 'examplesGood' | 'examplesBad' | 'synonyms'>>) => fetchJson<{success: boolean; approvedWithEdits?: boolean; editedFields?: string[]}>("POST", `/api/proposals/${id}/approve`, { comment, edits }),
    reject: (id: string, comment?: string) => fetchJson<{success: boolean}>("POST", `/api/proposals/${id}/reject`, { comment }),
    requestChanges: (id: string, comment?: string) => fetchJson<{success: boolean}>("POST", `/api/proposals/${id}/request-changes`, { comment }),
    resubmit: (id: string, data: Partial<Proposal>) => fetchJson<Proposal>("POST", `/api/proposals/${id}/resubmit`, data),
    withdraw: (id: string) => fetchJson<{success: boolean}>("POST", `/api/proposals/${id}/withdraw`),
    delete: (id: string) => fetchJson<void>("DELETE", `/api/proposals/${id}`),
  },
  users: {
    getAll: () => fetchJson<User[]>("GET", "/api/users"),
    get: (id: string) => fetchJson<User>("GET", `/api/users/${id}`),
    create: (data: Partial<User>) => fetchJson<User>("POST", "/api/users", data),
    update: (id: string, data: Partial<User>) => fetchJson<User>("PATCH", `/api/users/${id}`, data),
    delete: (id: string) => fetchJson<void>("DELETE", `/api/users/${id}`),
  },
  settings: {
    getAll: () => fetchJson<Setting[]>("GET", "/api/settings"),
    save: (key: string, value: boolean) => fetchJson<Setting>("POST", "/api/settings", { key, value }),
    saveBatch: (settingsData: {key: string; value: boolean}[]) => fetchJson<Setting[]>("POST", "/api/settings/batch", { settings: settingsData }),
  },
  principles: {
    getAll: () => fetchJson<PrincipleWithCount[]>("GET", "/api/principles"),
    get: (idOrSlug: string) => fetchJson<Principle>("GET", `/api/principles/${idOrSlug}`),
    getTerms: (id: string) => fetchJson<Term[]>("GET", `/api/principles/${id}/terms`),
    create: (data: Partial<Principle>) => fetchJson<Principle>("POST", "/api/principles", data),
    update: (id: string, data: Partial<Principle>) => fetchJson<Principle>("PATCH", `/api/principles/${id}`, data),
    delete: (id: string) => fetchJson<void>("DELETE", `/api/principles/${id}`),
    linkTerm: (principleId: string, termId: string) => fetchJson<any>("POST", `/api/principles/${principleId}/terms`, { termId }),
    unlinkTerm: (principleId: string, termId: string) => fetchJson<void>("DELETE", `/api/principles/${principleId}/terms/${termId}`),
  },
};
