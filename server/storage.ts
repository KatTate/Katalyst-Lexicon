import { 
  type User, type InsertUser, 
  type Category, type InsertCategory,
  type Term, type InsertTerm,
  type Proposal, type InsertProposal,
  type Setting, type InsertSetting,
  type Principle, type InsertPrinciple,
  type PrincipleTermLink, type InsertPrincipleTermLink,
  type TermVersion, type InsertTermVersion,
  users, categories, terms, proposals, settings, principles, principleTermLinks, termVersions
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, inArray, or, ilike, sql } from "drizzle-orm";

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
  searchTerms(query: string): Promise<Term[]>;
  createTerm(term: InsertTerm, changeNote?: string, changedBy?: string): Promise<Term>;
  updateTerm(id: string, term: Partial<InsertTerm>, changeNote?: string, changedBy?: string): Promise<Term | undefined>;
  deleteTerm(id: string): Promise<boolean>;

  getTermVersions(termId: string): Promise<TermVersion[]>;
  getTermVersion(id: string): Promise<TermVersion | undefined>;
  createTermVersion(version: InsertTermVersion): Promise<TermVersion>;

  getProposals(): Promise<Proposal[]>;
  getProposal(id: string): Promise<Proposal | undefined>;
  getProposalsByStatus(status: string): Promise<Proposal[]>;
  createProposal(proposal: InsertProposal): Promise<Proposal>;
  updateProposal(id: string, proposal: Partial<InsertProposal>): Promise<Proposal | undefined>;
  deleteProposal(id: string): Promise<boolean>;

  getSettings(): Promise<Setting[]>;
  getSetting(key: string): Promise<Setting | undefined>;
  upsertSetting(setting: InsertSetting): Promise<Setting>;

  getPrinciples(): Promise<Principle[]>;
  getPrinciple(id: string): Promise<Principle | undefined>;
  getPrincipleBySlug(slug: string): Promise<Principle | undefined>;
  createPrinciple(principle: InsertPrinciple): Promise<Principle>;
  updatePrinciple(id: string, principle: Partial<InsertPrinciple>): Promise<Principle | undefined>;
  deletePrinciple(id: string): Promise<boolean>;

  getPrincipleTermLinks(principleId: string): Promise<PrincipleTermLink[]>;
  getTermPrincipleLinks(termId: string): Promise<PrincipleTermLink[]>;
  linkPrincipleToTerm(principleId: string, termId: string): Promise<PrincipleTermLink>;
  unlinkPrincipleFromTerm(principleId: string, termId: string): Promise<boolean>;
  getTermsForPrinciple(principleId: string): Promise<Term[]>;
  getPrinciplesForTerm(termId: string): Promise<Principle[]>;
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

  async searchTerms(query: string): Promise<Term[]> {
    const lowerQuery = query.toLowerCase();
    const searchPattern = `%${lowerQuery}%`;
    const startsWithPattern = `${lowerQuery}%`;

    const rankScore = sql<number>`CASE 
      WHEN LOWER(${terms.name}) = ${lowerQuery} THEN 1
      WHEN LOWER(${terms.name}) LIKE ${startsWithPattern} THEN 2
      WHEN LOWER(${terms.name}) LIKE ${searchPattern} THEN 3
      ELSE 4
    END`;

    return db.select().from(terms).where(
      or(
        ilike(terms.name, searchPattern),
        ilike(terms.definition, searchPattern),
        ilike(terms.whyExists, searchPattern),
        ilike(terms.usedWhen, searchPattern),
        ilike(terms.notUsedWhen, searchPattern),
        sql`array_to_string(${terms.synonyms}, ' ') ILIKE ${searchPattern}`,
        sql`array_to_string(${terms.examplesGood}, ' ') ILIKE ${searchPattern}`,
        sql`array_to_string(${terms.examplesBad}, ' ') ILIKE ${searchPattern}`
      )
    ).orderBy(rankScore, asc(terms.name)).limit(10);
  }

  async createTerm(term: InsertTerm, changeNote: string = "Initial creation", changedBy: string = "System"): Promise<Term> {
    const [created] = await db.insert(terms).values(term).returning();
    
    await this.createTermVersion({
      termId: created.id,
      versionNumber: 1,
      snapshotJson: created,
      changeNote,
      changedBy
    });
    
    return created;
  }

  async updateTerm(id: string, term: Partial<InsertTerm>, changeNote: string = "Updated", changedBy: string = "System"): Promise<Term | undefined> {
    const existing = await this.getTerm(id);
    if (!existing) return undefined;
    
    const newVersion = existing.version + 1;
    const [updated] = await db.update(terms).set({
      ...term,
      version: newVersion,
      updatedAt: new Date()
    }).where(eq(terms.id, id)).returning();
    
    if (updated) {
      await this.createTermVersion({
        termId: id,
        versionNumber: newVersion,
        snapshotJson: updated,
        changeNote,
        changedBy
      });
    }
    
    return updated;
  }

  async deleteTerm(id: string): Promise<boolean> {
    await db.delete(termVersions).where(eq(termVersions.termId, id));
    await db.delete(principleTermLinks).where(eq(principleTermLinks.termId, id));
    const result = await db.delete(terms).where(eq(terms.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getTermVersions(termId: string): Promise<TermVersion[]> {
    return db.select().from(termVersions)
      .where(eq(termVersions.termId, termId))
      .orderBy(desc(termVersions.versionNumber));
  }

  async getTermVersion(id: string): Promise<TermVersion | undefined> {
    const [version] = await db.select().from(termVersions).where(eq(termVersions.id, id));
    return version;
  }

  async createTermVersion(version: InsertTermVersion): Promise<TermVersion> {
    const [created] = await db.insert(termVersions).values(version).returning();
    return created;
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

  async getPrinciples(): Promise<Principle[]> {
    return db.select().from(principles).orderBy(asc(principles.sortOrder));
  }

  async getPrinciple(id: string): Promise<Principle | undefined> {
    const [principle] = await db.select().from(principles).where(eq(principles.id, id));
    return principle;
  }

  async getPrincipleBySlug(slug: string): Promise<Principle | undefined> {
    const [principle] = await db.select().from(principles).where(eq(principles.slug, slug));
    return principle;
  }

  async createPrinciple(principle: InsertPrinciple): Promise<Principle> {
    const existingPrinciples = await this.getPrinciples();
    const maxSortOrder = existingPrinciples.length > 0 
      ? Math.max(...existingPrinciples.map(p => p.sortOrder)) 
      : -1;
    const [created] = await db.insert(principles).values({
      ...principle,
      sortOrder: maxSortOrder + 1
    }).returning();
    return created;
  }

  async updatePrinciple(id: string, principle: Partial<InsertPrinciple>): Promise<Principle | undefined> {
    const [updated] = await db.update(principles).set({
      ...principle,
      updatedAt: new Date()
    }).where(eq(principles.id, id)).returning();
    return updated;
  }

  async deletePrinciple(id: string): Promise<boolean> {
    await db.delete(principleTermLinks).where(eq(principleTermLinks.principleId, id));
    const result = await db.delete(principles).where(eq(principles.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getPrincipleTermLinks(principleId: string): Promise<PrincipleTermLink[]> {
    return db.select().from(principleTermLinks).where(eq(principleTermLinks.principleId, principleId));
  }

  async getTermPrincipleLinks(termId: string): Promise<PrincipleTermLink[]> {
    return db.select().from(principleTermLinks).where(eq(principleTermLinks.termId, termId));
  }

  async linkPrincipleToTerm(principleId: string, termId: string): Promise<PrincipleTermLink> {
    const [created] = await db.insert(principleTermLinks).values({ principleId, termId }).returning();
    return created;
  }

  async unlinkPrincipleFromTerm(principleId: string, termId: string): Promise<boolean> {
    const result = await db.delete(principleTermLinks)
      .where(sql`${principleTermLinks.principleId} = ${principleId} AND ${principleTermLinks.termId} = ${termId}`);
    return (result.rowCount ?? 0) > 0;
  }

  async getTermsForPrinciple(principleId: string): Promise<Term[]> {
    const links = await this.getPrincipleTermLinks(principleId);
    if (links.length === 0) return [];
    const termIds = links.map(l => l.termId);
    return db.select().from(terms).where(inArray(terms.id, termIds));
  }

  async getPrinciplesForTerm(termId: string): Promise<Principle[]> {
    const links = await this.getTermPrincipleLinks(termId);
    if (links.length === 0) return [];
    const principleIds = links.map(l => l.principleId);
    return db.select().from(principles).where(inArray(principles.id, principleIds));
  }
}

export const storage = new DatabaseStorage();
