import { 
  type User, type InsertUser, 
  type Category, type InsertCategory,
  type Term, type InsertTerm,
  type Proposal, type InsertProposal,
  type Setting, type InsertSetting,
  users, categories, terms, proposals, settings 
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;

  getCategories(): Promise<Category[]>;
  getCategory(id: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: string): Promise<boolean>;

  getTerms(): Promise<Term[]>;
  getTerm(id: string): Promise<Term | undefined>;
  getTermsByCategory(category: string): Promise<Term[]>;
  createTerm(term: InsertTerm): Promise<Term>;
  updateTerm(id: string, term: Partial<InsertTerm>): Promise<Term | undefined>;
  deleteTerm(id: string): Promise<boolean>;

  getProposals(): Promise<Proposal[]>;
  getProposal(id: string): Promise<Proposal | undefined>;
  getProposalsByStatus(status: string): Promise<Proposal[]>;
  createProposal(proposal: InsertProposal): Promise<Proposal>;
  updateProposal(id: string, proposal: Partial<InsertProposal>): Promise<Proposal | undefined>;
  deleteProposal(id: string): Promise<boolean>;

  getSettings(): Promise<Setting[]>;
  getSetting(key: string): Promise<Setting | undefined>;
  upsertSetting(setting: InsertSetting): Promise<Setting>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUsers(): Promise<User[]> {
    return db.select().from(users);
  }

  async createUser(user: InsertUser): Promise<User> {
    const [created] = await db.insert(users).values(user).returning();
    return created;
  }

  async updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined> {
    const [updated] = await db.update(users).set(user).where(eq(users.id, id)).returning();
    return updated;
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getCategories(): Promise<Category[]> {
    return db.select().from(categories).orderBy(asc(categories.sortOrder));
  }

  async getCategory(id: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const existingCategories = await this.getCategories();
    const maxSortOrder = existingCategories.length > 0 
      ? Math.max(...existingCategories.map(c => c.sortOrder)) 
      : -1;
    const [created] = await db.insert(categories).values({
      ...category,
      sortOrder: maxSortOrder + 1
    }).returning();
    return created;
  }

  async updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category | undefined> {
    const [updated] = await db.update(categories).set(category).where(eq(categories.id, id)).returning();
    return updated;
  }

  async deleteCategory(id: string): Promise<boolean> {
    const result = await db.delete(categories).where(eq(categories.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getTerms(): Promise<Term[]> {
    return db.select().from(terms).orderBy(desc(terms.updatedAt));
  }

  async getTerm(id: string): Promise<Term | undefined> {
    const [term] = await db.select().from(terms).where(eq(terms.id, id));
    return term;
  }

  async getTermsByCategory(category: string): Promise<Term[]> {
    return db.select().from(terms).where(eq(terms.category, category)).orderBy(desc(terms.updatedAt));
  }

  async createTerm(term: InsertTerm): Promise<Term> {
    const [created] = await db.insert(terms).values(term).returning();
    return created;
  }

  async updateTerm(id: string, term: Partial<InsertTerm>): Promise<Term | undefined> {
    const [updated] = await db.update(terms).set({
      ...term,
      updatedAt: new Date()
    }).where(eq(terms.id, id)).returning();
    return updated;
  }

  async deleteTerm(id: string): Promise<boolean> {
    const result = await db.delete(terms).where(eq(terms.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getProposals(): Promise<Proposal[]> {
    return db.select().from(proposals).orderBy(desc(proposals.submittedAt));
  }

  async getProposal(id: string): Promise<Proposal | undefined> {
    const [proposal] = await db.select().from(proposals).where(eq(proposals.id, id));
    return proposal;
  }

  async getProposalsByStatus(status: string): Promise<Proposal[]> {
    return db.select().from(proposals)
      .where(eq(proposals.status, status as any))
      .orderBy(desc(proposals.submittedAt));
  }

  async createProposal(proposal: InsertProposal): Promise<Proposal> {
    const [created] = await db.insert(proposals).values(proposal).returning();
    return created;
  }

  async updateProposal(id: string, proposal: Partial<InsertProposal>): Promise<Proposal | undefined> {
    const [updated] = await db.update(proposals).set(proposal).where(eq(proposals.id, id)).returning();
    return updated;
  }

  async deleteProposal(id: string): Promise<boolean> {
    const result = await db.delete(proposals).where(eq(proposals.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getSettings(): Promise<Setting[]> {
    return db.select().from(settings);
  }

  async getSetting(key: string): Promise<Setting | undefined> {
    const [setting] = await db.select().from(settings).where(eq(settings.key, key));
    return setting;
  }

  async upsertSetting(setting: InsertSetting): Promise<Setting> {
    const existing = await this.getSetting(setting.key);
    if (existing) {
      const [updated] = await db.update(settings).set(setting).where(eq(settings.key, setting.key)).returning();
      return updated;
    }
    const [created] = await db.insert(settings).values(setting).returning();
    return created;
  }
}

export const storage = new DatabaseStorage();
