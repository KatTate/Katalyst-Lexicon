import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, pgEnum, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export * from "./models/auth";
export { users, userRoleEnum } from "./models/auth";
import { users } from "./models/auth";

export const termStatusEnum = pgEnum("term_status", ["Draft", "In Review", "Canonical", "Deprecated"]);
export const visibilityEnum = pgEnum("visibility", ["Internal", "Client-Safe", "Public"]);
export const proposalStatusEnum = pgEnum("proposal_status", ["pending", "in_review", "changes_requested", "approved", "rejected", "withdrawn"]);
export const proposalTypeEnum = pgEnum("proposal_type", ["new", "edit"]);
export const principleStatusEnum = pgEnum("principle_status", ["Draft", "Published", "Archived"]);
export const proposalEventTypeEnum = pgEnum("proposal_event_type", ["submitted", "changes_requested", "resubmitted", "approved", "rejected", "withdrawn"]);

export const categories = pgTable("categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
  color: text("color").notNull().default("bg-primary"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const terms = pgTable("terms", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  category: text("category").notNull(),
  definition: text("definition").notNull(),
  whyExists: text("why_exists").notNull(),
  usedWhen: text("used_when").notNull().default(""),
  notUsedWhen: text("not_used_when").notNull().default(""),
  examplesGood: text("examples_good").array().notNull().default(sql`'{}'::text[]`),
  examplesBad: text("examples_bad").array().notNull().default(sql`'{}'::text[]`),
  synonyms: text("synonyms").array().notNull().default(sql`'{}'::text[]`),
  status: termStatusEnum("status").notNull().default("Draft"),
  visibility: visibilityEnum("visibility").notNull().default("Internal"),
  owner: text("owner").notNull(),
  version: integer("version").notNull().default(1),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const termVersions = pgTable("term_versions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  termId: varchar("term_id").notNull(),
  versionNumber: integer("version_number").notNull(),
  snapshotJson: jsonb("snapshot_json").notNull(),
  changeNote: text("change_note").notNull(),
  changedBy: text("changed_by").notNull(),
  changedAt: timestamp("changed_at").notNull().defaultNow(),
});

export const proposals = pgTable("proposals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  termId: varchar("term_id"),
  termName: text("term_name").notNull(),
  category: text("category").notNull(),
  type: proposalTypeEnum("type").notNull(),
  status: proposalStatusEnum("status").notNull().default("pending"),
  submittedBy: text("submitted_by").notNull(),
  assignedTo: text("assigned_to"),
  changesSummary: text("changes_summary").notNull(),
  definition: text("definition").notNull(),
  whyExists: text("why_exists").notNull(),
  usedWhen: text("used_when").notNull().default(""),
  notUsedWhen: text("not_used_when").notNull().default(""),
  examplesGood: text("examples_good").array().notNull().default(sql`'{}'::text[]`),
  examplesBad: text("examples_bad").array().notNull().default(sql`'{}'::text[]`),
  synonyms: text("synonyms").array().notNull().default(sql`'{}'::text[]`),
  reviewComment: text("review_comment"),
  submittedAt: timestamp("submitted_at").notNull().defaultNow(),
});

export const proposalEvents = pgTable("proposal_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  proposalId: varchar("proposal_id").notNull(),
  eventType: proposalEventTypeEnum("event_type").notNull(),
  actorId: text("actor_id").notNull(),
  comment: text("comment"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const settings = pgTable("settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: text("key").notNull().unique(),
  value: boolean("value").notNull().default(false),
});

export const principles = pgTable("principles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  summary: text("summary").notNull(),
  body: text("body").notNull(),
  status: principleStatusEnum("status").notNull().default("Draft"),
  visibility: visibilityEnum("visibility").notNull().default("Internal"),
  owner: text("owner").notNull(),
  tags: text("tags").array().notNull().default(sql`'{}'::text[]`),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const principleTermLinks = pgTable("principle_term_links", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  principleId: varchar("principle_id").notNull(),
  termId: varchar("term_id").notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCategorySchema = createInsertSchema(categories).omit({ id: true });
export const insertTermSchema = createInsertSchema(terms).omit({ id: true, updatedAt: true });
export const insertProposalSchema = createInsertSchema(proposals).omit({ id: true, submittedAt: true });
export const insertSettingSchema = createInsertSchema(settings).omit({ id: true });
export const insertPrincipleSchema = createInsertSchema(principles).omit({ id: true, createdAt: true, updatedAt: true });
export const insertPrincipleTermLinkSchema = createInsertSchema(principleTermLinks).omit({ id: true });
export const insertTermVersionSchema = createInsertSchema(termVersions).omit({ id: true, changedAt: true });
export const insertProposalEventSchema = createInsertSchema(proposalEvents).omit({ id: true, timestamp: true });

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;
export type InsertTerm = z.infer<typeof insertTermSchema>;
export type Term = typeof terms.$inferSelect;
export type InsertProposal = z.infer<typeof insertProposalSchema>;
export type Proposal = typeof proposals.$inferSelect;
export type InsertSetting = z.infer<typeof insertSettingSchema>;
export type Setting = typeof settings.$inferSelect;
export type InsertPrinciple = z.infer<typeof insertPrincipleSchema>;
export type Principle = typeof principles.$inferSelect;
export type PrincipleWithCount = Principle & { linkedTermCount: number };
export type InsertPrincipleTermLink = z.infer<typeof insertPrincipleTermLinkSchema>;
export type PrincipleTermLink = typeof principleTermLinks.$inferSelect;
export type InsertTermVersion = z.infer<typeof insertTermVersionSchema>;
export type TermVersion = typeof termVersions.$inferSelect;
export type InsertProposalEvent = z.infer<typeof insertProposalEventSchema>;
export type ProposalEvent = typeof proposalEvents.$inferSelect;
