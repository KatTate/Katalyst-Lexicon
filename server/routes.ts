import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTermSchema, insertCategorySchema, insertProposalSchema, insertUserSchema, insertSettingSchema, insertPrincipleSchema } from "@shared/schema";
import { z } from "zod";

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
      const term = await storage.createTerm(parsed);
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
      const term = await storage.updateTerm(req.params.id, req.body);
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
      res.json(proposal);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch proposal" });
    }
  });

  app.post("/api/proposals", async (req, res) => {
    try {
      const parsed = insertProposalSchema.parse(req.body);
      const proposal = await storage.createProposal(parsed);
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

      await storage.updateProposal(req.params.id, { 
        status: "approved",
        reviewComment: req.body.comment || null
      });

      if (proposal.type === "new") {
        await storage.createTerm({
          name: proposal.termName,
          category: proposal.category,
          definition: proposal.definition,
          whyExists: proposal.whyExists,
          usedWhen: proposal.usedWhen,
          notUsedWhen: proposal.notUsedWhen,
          status: "Canonical",
          visibility: "Internal",
          owner: proposal.submittedBy,
          examplesGood: [],
          examplesBad: [],
          synonyms: [],
          version: 1
        });
      } else if (proposal.termId) {
        await storage.updateTerm(proposal.termId, {
          definition: proposal.definition,
          whyExists: proposal.whyExists,
          usedWhen: proposal.usedWhen,
          notUsedWhen: proposal.notUsedWhen,
        });
      }

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to approve proposal" });
    }
  });

  app.post("/api/proposals/:id/reject", async (req, res) => {
    try {
      const proposal = await storage.updateProposal(req.params.id, { 
        status: "rejected",
        reviewComment: req.body.comment || null
      });
      if (!proposal) {
        return res.status(404).json({ error: "Proposal not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to reject proposal" });
    }
  });

  app.post("/api/proposals/:id/request-changes", async (req, res) => {
    try {
      const proposal = await storage.updateProposal(req.params.id, { 
        status: "changes_requested",
        reviewComment: req.body.comment || null
      });
      if (!proposal) {
        return res.status(404).json({ error: "Proposal not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to request changes" });
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
      const list = await storage.getPrinciples();
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
