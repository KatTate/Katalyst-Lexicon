import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const termStatusEnum = pgEnum("term_status", ["Draft", "In Review", "Canonical", "Deprecated"]);
export const visibilityEnum = pgEnum("visibility", ["Internal", "Client-Safe", "Public"]);
export const userRoleEnum = pgEnum("user_role", ["Viewer", "Contributor", "Editor", "Approver", "Admin"]);
export const proposalStatusEnum = pgEnum("proposal_status", ["pending", "in_review", "changes_requested", "approved", "rejected"]);
export const proposalTypeEnum = pgEnum("proposal_type", ["new", "edit"]);

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  role: userRoleEnum("role").notNull().default("Viewer"),
  status: text("status").notNull().default("active"),
});

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
  reviewComment: text("review_comment"),
  submittedAt: timestamp("submitted_at").notNull().defaultNow(),
});

export const settings = pgTable("settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: text("key").notNull().unique(),
  value: boolean("value").notNull().default(false),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertCategorySchema = createInsertSchema(categories).omit({ id: true });
export const insertTermSchema = createInsertSchema(terms).omit({ id: true, updatedAt: true });
export const insertProposalSchema = createInsertSchema(proposals).omit({ id: true, submittedAt: true });
export const insertSettingSchema = createInsertSchema(settings).omit({ id: true });

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;
export type InsertTerm = z.infer<typeof insertTermSchema>;
export type Term = typeof terms.$inferSelect;
export type InsertProposal = z.infer<typeof insertProposalSchema>;
export type Proposal = typeof proposals.$inferSelect;
export type InsertSetting = z.infer<typeof insertSettingSchema>;
export type Setting = typeof settings.$inferSelect;
