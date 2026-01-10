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

export interface Proposal {
  id: string;
  termId: string | null;
  termName: string;
  category: string;
  type: "new" | "edit";
  status: "pending" | "in_review" | "changes_requested" | "approved" | "rejected";
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
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "Member" | "Approver" | "Admin";
  status: string;
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
    approve: (id: string, comment?: string, approvedBy?: string) => fetchJson<{success: boolean}>("POST", `/api/proposals/${id}/approve`, { comment, approvedBy }),
    reject: (id: string, comment?: string) => fetchJson<{success: boolean}>("POST", `/api/proposals/${id}/reject`, { comment }),
    requestChanges: (id: string, comment?: string) => fetchJson<{success: boolean}>("POST", `/api/proposals/${id}/request-changes`, { comment }),
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
    getAll: () => fetchJson<Principle[]>("GET", "/api/principles"),
    get: (idOrSlug: string) => fetchJson<Principle>("GET", `/api/principles/${idOrSlug}`),
    getTerms: (id: string) => fetchJson<Term[]>("GET", `/api/principles/${id}/terms`),
    create: (data: Partial<Principle>) => fetchJson<Principle>("POST", "/api/principles", data),
    update: (id: string, data: Partial<Principle>) => fetchJson<Principle>("PATCH", `/api/principles/${id}`, data),
    delete: (id: string) => fetchJson<void>("DELETE", `/api/principles/${id}`),
  },
};
