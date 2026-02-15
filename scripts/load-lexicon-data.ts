import XLSX from "xlsx";
import { db } from "../server/db";
import { categories, proposals, settings } from "@shared/schema";
import { eq, and } from "drizzle-orm";

const CATEGORY_COLORS: Record<string, string> = {
  "How & Why We Work": "#97a687",
  "Planning & Strategy": "#656d12",
  "Execution & Accountability": "#78c026",
  "Meetings & Rhythm": "#a5a092",
  "Financial & Metrics": "#a6a2a9",
  "Client & Franchise": "#d9cbaf",
  "Caution Terms": "#8b898b",
};

const SUBMITTER_NAME = "Lexicon Import";

const DEFAULT_SETTINGS = [
  { key: "require_approver_signoff", value: true },
  { key: "require_change_note", value: true },
  { key: "allow_self_approval", value: false },
  { key: "weekly_digest", value: true },
  { key: "new_proposal_alerts", value: true },
  { key: "changes_requested_alerts", value: true },
  { key: "enable_client_portal", value: false },
  { key: "enable_public_glossary", value: false },
];

async function loadLexiconData() {
  const filePath = "attached_assets/katalyst_lexicon_revised_1771193408503.xlsx";
  const wb = XLSX.readFile(filePath);
  const rows = XLSX.utils.sheet_to_json(wb.Sheets["Lexicon Seed Data"]) as Record<string, string>[];

  console.log(`Found ${rows.length} terms in spreadsheet\n`);

  const existingCategories = await db.select().from(categories);
  const existingCategoryNames = new Set(existingCategories.map((c) => c.name));

  const spreadsheetCategories = [...new Set(rows.map((r) => r["Domain / Category"]))];
  const newCategories = spreadsheetCategories.filter((c) => !existingCategoryNames.has(c));

  if (newCategories.length > 0) {
    const maxSortOrder = Math.max(...existingCategories.map((c) => c.sortOrder), -1);
    const categoryValues = newCategories.map((name, i) => ({
      name,
      description: `Terms related to ${name.toLowerCase()}.`,
      color: CATEGORY_COLORS[name] || "#78c026",
      sortOrder: maxSortOrder + 1 + i,
    }));

    console.log(`Creating ${newCategories.length} categories: ${newCategories.join(", ")}`);
    await db.insert(categories).values(categoryValues);
  } else {
    console.log("All categories already exist — skipping");
  }

  const existingProposals = await db.select({ termName: proposals.termName, submittedBy: proposals.submittedBy }).from(proposals);
  const existingProposalKeys = new Set(
    existingProposals
      .filter((p) => p.submittedBy === SUBMITTER_NAME)
      .map((p) => p.termName)
  );

  function cleanArray(row: Record<string, string>, ...keys: string[]): string[] {
    return keys
      .map((k) => (row[k] || "").trim())
      .filter((v) => v.length > 0);
  }

  const proposalValues = rows
    .map((row) => {
      const termName = (row["Term Name"] || "").trim();
      const category = (row["Domain / Category"] || "").trim();
      const definition = (row["Definition"] || "").trim();
      const whyExists = (row["Why It Exists"] || "").trim();
      const usedWhen = (row["Used When (Inclusion)"] || "").trim();
      const notUsedWhen = (row["Not Used When (Exclusion)"] || "").trim();
      const status = (row["Status"] || "").trim();

      const synonyms = cleanArray(row, "Synonym 1", "Synonym 2", "Synonym 3");
      const examplesGood = cleanArray(row, "Good Example 1", "Good Example 2");
      const examplesBad = cleanArray(row, "Bad Example 1", "Bad Example 2");

      const changesSummary = `Imported from Katalyst Lexicon v5.0 spreadsheet. Original status: ${status}. Source: ${(row["Source"] || "").trim()}.`;

      return {
        termName,
        category,
        type: "new" as const,
        status: "pending" as const,
        submittedBy: SUBMITTER_NAME,
        changesSummary,
        definition,
        whyExists,
        usedWhen,
        notUsedWhen,
        examplesGood,
        examplesBad,
        synonyms,
      };
    })
    .filter((p) => {
      if (existingProposalKeys.has(p.termName)) {
        console.log(`  Skipping duplicate: ${p.termName}`);
        return false;
      }
      return true;
    });

  if (proposalValues.length === 0) {
    console.log("\nAll proposals already exist — nothing to insert");
  } else {
    console.log(`\nInserting ${proposalValues.length} proposals...`);
    const batchSize = 20;
    let inserted = 0;
    for (let i = 0; i < proposalValues.length; i += batchSize) {
      const batch = proposalValues.slice(i, i + batchSize);
      await db.insert(proposals).values(batch);
      inserted += batch.length;
      console.log(`  Inserted ${inserted}/${proposalValues.length}`);
    }
  }

  const existingSettings = await db.select().from(settings);
  const existingKeys = new Set(existingSettings.map((s) => s.key));
  const newSettings = DEFAULT_SETTINGS.filter((s) => !existingKeys.has(s.key));

  if (newSettings.length > 0) {
    console.log(`\nCreating ${newSettings.length} default settings...`);
    await db.insert(settings).values(newSettings);
  } else {
    console.log("\nAll settings already exist — skipping");
  }

  console.log("\nDone! Database is ready for launch.");
  process.exit(0);
}

loadLexiconData().catch((err) => {
  console.error("Error loading data:", err);
  process.exit(1);
});
