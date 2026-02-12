import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db } from "./db";
import { insertTermSchema, insertCategorySchema, insertProposalSchema, insertUserSchema, insertSettingSchema, insertPrincipleSchema, principles, principleTermLinks, proposals, proposalEvents, terms, termVersions } from "@shared/schema";
import { z } from "zod";
import { sql, asc, eq, and, or as drizzleOr } from "drizzle-orm";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // ===== TERMS =====
  app.get("/api/terms", async (req, res) => {
    try {
      const terms = await storage.getTerms();
      res.json(terms);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch terms" });
    }
  });

  app.get("/api/terms/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query || query.trim().length < 2) {
        return res.json([]);
      }
      const terms = await storage.searchTerms(query.trim());
      res.json(terms);
    } catch (error) {
      res.status(500).json({ error: "Failed to search terms" });
    }
  });

  app.get("/api/terms/:id", async (req, res) => {
    try {
      const term = await storage.getTerm(req.params.id);
      if (!term) {
        return res.status(404).json({ error: "Term not found" });
      }
      res.json(term);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch term" });
    }
  });

  app.get("/api/terms/:id/versions", async (req, res) => {
    try {
      const versions = await storage.getTermVersions(req.params.id);
      res.json(versions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch term versions" });
    }
  });

  app.get("/api/terms/category/:category", async (req, res) => {
    try {
      const terms = await storage.getTermsByCategory(decodeURIComponent(req.params.category));
      res.json(terms);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch terms by category" });
    }
  });

  app.post("/api/terms", async (req, res) => {
    try {
      const parsed = insertTermSchema.parse(req.body);
      const changeNote = req.body.changeNote || "Initial creation";
      const changedBy = req.body.changedBy || "System";
      const term = await storage.createTerm(parsed, changeNote, changedBy);
      res.status(201).json(term);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create term" });
    }
  });

  app.patch("/api/terms/:id", async (req, res) => {
    try {
      const changeNote = req.body.changeNote || "Updated";
      const changedBy = req.body.changedBy || "System";
      const { changeNote: _, changedBy: __, ...termData } = req.body;
      const term = await storage.updateTerm(req.params.id, termData, changeNote, changedBy);
      if (!term) {
        return res.status(404).json({ error: "Term not found" });
      }
      res.json(term);
    } catch (error) {
      res.status(500).json({ error: "Failed to update term" });
    }
  });

  app.delete("/api/terms/:id", async (req, res) => {
    try {
      const success = await storage.deleteTerm(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Term not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete term" });
    }
  });

  // ===== CATEGORIES =====
  app.get("/api/categories", async (req, res) => {
    try {
      const cats = await storage.getCategories();
      res.json(cats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  app.get("/api/categories/:id", async (req, res) => {
    try {
      const category = await storage.getCategory(req.params.id);
      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch category" });
    }
  });

  app.post("/api/categories", async (req, res) => {
    try {
      const parsed = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(parsed);
      res.status(201).json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create category" });
    }
  });

  app.patch("/api/categories/:id", async (req, res) => {
    try {
      const category = await storage.updateCategory(req.params.id, req.body);
      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      res.status(500).json({ error: "Failed to update category" });
    }
  });

  app.delete("/api/categories/:id", async (req, res) => {
    try {
      const success = await storage.deleteCategory(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Category not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete category" });
    }
  });

  // ===== PROPOSALS =====
  app.get("/api/proposals", async (req, res) => {
    try {
      const status = req.query.status as string | undefined;
      const list = status 
        ? await storage.getProposalsByStatus(status)
        : await storage.getProposals();
      res.json(list);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch proposals" });
    }
  });

  app.get("/api/proposals/:id", async (req, res) => {
    try {
      const proposal = await storage.getProposal(req.params.id);
      if (!proposal) {
        return res.status(404).json({ error: "Proposal not found" });
      }
      const events = await storage.getProposalEvents(req.params.id);
      res.json({ ...proposal, events });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch proposal" });
    }
  });

  app.post("/api/proposals", async (req, res) => {
    try {
      const parsed = insertProposalSchema.parse(req.body);
      const proposal = await storage.createProposal(parsed);
      // Record "submitted" audit event (non-fatal — proposal is the primary write)
      try {
        await storage.createProposalEvent({
          proposalId: proposal.id,
          eventType: "submitted",
          actorId: proposal.submittedBy,
        });
      } catch {
        // Audit event failure should not fail the proposal creation
      }
      res.status(201).json(proposal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create proposal" });
    }
  });

  app.patch("/api/proposals/:id", async (req, res) => {
    try {
      const proposal = await storage.updateProposal(req.params.id, req.body);
      if (!proposal) {
        return res.status(404).json({ error: "Proposal not found" });
      }
      res.json(proposal);
    } catch (error) {
      res.status(500).json({ error: "Failed to update proposal" });
    }
  });

  app.post("/api/proposals/:id/approve", async (req, res) => {
    try {
      const proposal = await storage.getProposal(req.params.id);
      if (!proposal) {
        return res.status(404).json({ error: "Proposal not found" });
      }

      // Race condition protection: only pending proposals can be approved
      if (proposal.status !== "pending" && proposal.status !== "changes_requested") {
        return res.status(409).json({ error: "This proposal has already been reviewed" });
      }

      const result = await db.transaction(async (tx) => {
        const updateResult = await tx.update(proposals).set({
          status: "approved",
          reviewComment: req.body.comment || null
        }).where(
          and(
            eq(proposals.id, req.params.id),
            drizzleOr(
              eq(proposals.status, "pending"),
              eq(proposals.status, "changes_requested")
            )
          )
        );

        if ((updateResult.rowCount ?? 0) === 0) {
          return { conflict: true };
        }

        const approvedBy = req.body.approvedBy || "Approver";
        const changeNote = proposal.type === "new"
          ? `Approved from proposal: ${proposal.changesSummary}`
          : `Approved edit: ${proposal.changesSummary}`;

        if (proposal.type === "new") {
          const [created] = await tx.insert(terms).values({
            name: proposal.termName,
            category: proposal.category,
            definition: proposal.definition,
            whyExists: proposal.whyExists,
            usedWhen: proposal.usedWhen,
            notUsedWhen: proposal.notUsedWhen,
            status: "Canonical",
            visibility: "Internal",
            owner: proposal.submittedBy,
            examplesGood: proposal.examplesGood || [],
            examplesBad: proposal.examplesBad || [],
            synonyms: proposal.synonyms || [],
            version: 1
          }).returning();

          await tx.insert(termVersions).values({
            termId: created.id,
            versionNumber: 1,
            snapshotJson: created,
            changeNote,
            changedBy: approvedBy
          });
        } else if (proposal.termId) {
          const [existing] = await tx.select().from(terms).where(eq(terms.id, proposal.termId));
          if (existing) {
            const newVersion = existing.version + 1;
            const [updated] = await tx.update(terms).set({
              category: proposal.category,
              definition: proposal.definition,
              whyExists: proposal.whyExists,
              usedWhen: proposal.usedWhen,
              notUsedWhen: proposal.notUsedWhen,
              examplesGood: proposal.examplesGood || [],
              examplesBad: proposal.examplesBad || [],
              synonyms: proposal.synonyms || [],
              version: newVersion,
              updatedAt: new Date()
            }).where(eq(terms.id, proposal.termId)).returning();

            if (updated) {
              await tx.insert(termVersions).values({
                termId: proposal.termId,
                versionNumber: newVersion,
                snapshotJson: updated,
                changeNote,
                changedBy: approvedBy
              });
            }
          }
        }

        await tx.insert(proposalEvents).values({
          proposalId: req.params.id,
          eventType: "approved",
          actorId: approvedBy,
          comment: req.body.comment || null,
        });

        return { conflict: false };
      });

      if (result.conflict) {
        return res.status(409).json({ error: "This proposal has already been reviewed" });
      }

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to approve proposal" });
    }
  });

  app.post("/api/proposals/:id/reject", async (req, res) => {
    try {
      const existing = await storage.getProposal(req.params.id);
      if (!existing) {
        return res.status(404).json({ error: "Proposal not found" });
      }
      if (existing.status !== "pending" && existing.status !== "changes_requested") {
        return res.status(409).json({ error: "This proposal has already been reviewed" });
      }
      await storage.updateProposal(req.params.id, {
        status: "rejected",
        reviewComment: req.body.comment || null
      });
      // Record audit event (non-fatal)
      try {
        await storage.createProposalEvent({
          proposalId: req.params.id,
          eventType: "rejected",
          actorId: "Approver",
          comment: req.body.comment || null,
        });
      } catch {
        // Audit event failure should not fail the rejection
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to reject proposal" });
    }
  });

  app.post("/api/proposals/:id/request-changes", async (req, res) => {
    try {
      const existing = await storage.getProposal(req.params.id);
      if (!existing) {
        return res.status(404).json({ error: "Proposal not found" });
      }
      if (existing.status !== "pending" && existing.status !== "changes_requested") {
        return res.status(409).json({ error: "This proposal has already been reviewed" });
      }
      await storage.updateProposal(req.params.id, {
        status: "changes_requested",
        reviewComment: req.body.comment || null
      });
      // Record audit event (non-fatal)
      try {
        await storage.createProposalEvent({
          proposalId: req.params.id,
          eventType: "changes_requested",
          actorId: "Approver",
          comment: req.body.comment || null,
        });
      } catch {
        // Audit event failure should not fail the request-changes action
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to request changes" });
    }
  });

  app.post("/api/proposals/:id/resubmit", async (req, res) => {
    try {
      const existing = await storage.getProposal(req.params.id);
      if (!existing) {
        return res.status(404).json({ error: "Proposal not found" });
      }
      if (existing.status !== "changes_requested") {
        return res.status(409).json({ error: "Only proposals with changes requested can be resubmitted" });
      }
      // Validate and extract only permitted proposal fields
      const resubmitSchema = insertProposalSchema.partial().pick({
        termName: true,
        category: true,
        definition: true,
        whyExists: true,
        usedWhen: true,
        notUsedWhen: true,
        examplesGood: true,
        examplesBad: true,
        synonyms: true,
        changesSummary: true,
      });
      const updates = resubmitSchema.parse(req.body);
      const proposal = await storage.updateProposal(req.params.id, {
        ...updates,
        status: "pending",
        reviewComment: null,
      });
      // Record audit event (non-fatal)
      try {
        await storage.createProposalEvent({
          proposalId: req.params.id,
          eventType: "resubmitted",
          actorId: existing.submittedBy,
        });
      } catch {
        // Audit event failure should not fail the resubmission
      }
      res.json(proposal);
    } catch (error) {
      res.status(500).json({ error: "Failed to resubmit proposal" });
    }
  });

  app.post("/api/proposals/:id/withdraw", async (req, res) => {
    try {
      const existing = await storage.getProposal(req.params.id);
      if (!existing) {
        return res.status(404).json({ error: "Proposal not found" });
      }
      if (existing.status !== "pending" && existing.status !== "changes_requested") {
        return res.status(409).json({ error: "This proposal cannot be withdrawn" });
      }
      await storage.updateProposal(req.params.id, { status: "withdrawn" });
      // Record audit event (non-fatal)
      try {
        await storage.createProposalEvent({
          proposalId: req.params.id,
          eventType: "withdrawn",
          actorId: existing.submittedBy,
        });
      } catch {
        // Audit event failure should not fail the withdrawal
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to withdraw proposal" });
    }
  });

  app.delete("/api/proposals/:id", async (req, res) => {
    try {
      const success = await storage.deleteProposal(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Proposal not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete proposal" });
    }
  });

  // ===== USERS =====
  app.get("/api/users", async (req, res) => {
    try {
      const list = await storage.getUsers();
      res.json(list);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const parsed = insertUserSchema.parse(req.body);
      const user = await storage.createUser(parsed);
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create user" });
    }
  });

  app.patch("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.updateUser(req.params.id, req.body);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  app.delete("/api/users/:id", async (req, res) => {
    try {
      const success = await storage.deleteUser(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "User not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete user" });
    }
  });

  // ===== SETTINGS =====
  app.get("/api/settings", async (req, res) => {
    try {
      const list = await storage.getSettings();
      res.json(list);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  app.post("/api/settings", async (req, res) => {
    try {
      const parsed = insertSettingSchema.parse(req.body);
      const setting = await storage.upsertSetting(parsed);
      res.json(setting);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to save setting" });
    }
  });

  app.post("/api/settings/batch", async (req, res) => {
    try {
      const { settings: settingsToSave } = req.body;
      const results = [];
      for (const setting of settingsToSave) {
        const parsed = insertSettingSchema.parse(setting);
        const saved = await storage.upsertSetting(parsed);
        results.push(saved);
      }
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: "Failed to save settings" });
    }
  });

  // ===== PRINCIPLES =====
  app.get("/api/principles", async (req, res) => {
    try {
      const list = await db.select({
        id: principles.id,
        title: principles.title,
        slug: principles.slug,
        summary: principles.summary,
        body: principles.body,
        status: principles.status,
        visibility: principles.visibility,
        owner: principles.owner,
        tags: principles.tags,
        sortOrder: principles.sortOrder,
        createdAt: principles.createdAt,
        updatedAt: principles.updatedAt,
        linkedTermCount: sql<number>`COALESCE((SELECT COUNT(*)::int FROM ${principleTermLinks} WHERE ${principleTermLinks.principleId} = ${principles.id}), 0)`,
      }).from(principles).orderBy(asc(principles.sortOrder));
      res.json(list);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch principles" });
    }
  });

  app.get("/api/principles/:id", async (req, res) => {
    try {
      const principle = await storage.getPrinciple(req.params.id);
      if (!principle) {
        const bySlug = await storage.getPrincipleBySlug(req.params.id);
        if (!bySlug) {
          return res.status(404).json({ error: "Principle not found" });
        }
        return res.json(bySlug);
      }
      res.json(principle);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch principle" });
    }
  });

  app.post("/api/principles", async (req, res) => {
    try {
      const parsed = insertPrincipleSchema.parse(req.body);
      const principle = await storage.createPrinciple(parsed);
      res.status(201).json(principle);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create principle" });
    }
  });

  app.patch("/api/principles/:id", async (req, res) => {
    try {
      const principle = await storage.updatePrinciple(req.params.id, req.body);
      if (!principle) {
        return res.status(404).json({ error: "Principle not found" });
      }
      res.json(principle);
    } catch (error) {
      res.status(500).json({ error: "Failed to update principle" });
    }
  });

  app.delete("/api/principles/:id", async (req, res) => {
    try {
      const success = await storage.deletePrinciple(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Principle not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete principle" });
    }
  });

  app.get("/api/principles/:id/terms", async (req, res) => {
    try {
      const terms = await storage.getTermsForPrinciple(req.params.id);
      res.json(terms);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch terms for principle" });
    }
  });

  app.post("/api/principles/:id/terms", async (req, res) => {
    try {
      const { termId } = req.body;
      const link = await storage.linkPrincipleToTerm(req.params.id, termId);
      res.status(201).json(link);
    } catch (error) {
      res.status(500).json({ error: "Failed to link term to principle" });
    }
  });

  app.delete("/api/principles/:principleId/terms/:termId", async (req, res) => {
    try {
      const success = await storage.unlinkPrincipleFromTerm(req.params.principleId, req.params.termId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to unlink term from principle" });
    }
  });

  app.get("/api/terms/:id/principles", async (req, res) => {
    try {
      const principles = await storage.getPrinciplesForTerm(req.params.id);
      res.json(principles);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch principles for term" });
    }
  });

  return httpServer;
}
