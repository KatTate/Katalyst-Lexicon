import XLSX from "xlsx";
import { db } from "../server/db";
import { categories, terms } from "@shared/schema";
import { eq } from "drizzle-orm";

const CATEGORY_COLORS: Record<string, string> = {
  "Planning & Execution": "bg-kat-basque",
  "Altitude & Mindset": "bg-kat-edamame",
  "Blacklist": "bg-kat-charcoal",
  "Confidence & Planning": "bg-kat-zeus",
  "Corporate & Investment": "bg-kat-wheat",
  "Culture & Doctrine": "bg-kat-green",
  "Financial Language": "bg-kat-mystical",
  "Financial Operations": "bg-kat-gauntlet",
  "Franchise & Client Services": "bg-kat-warning",
  "Meeting Rhythm": "bg-primary",
  "Metrics & KPIs": "bg-kat-basque",
  "Roadmap Architecture": "bg-kat-zeus",
  "Sales & Productization": "bg-kat-wheat",
  "Status & Accountability": "bg-kat-edamame",
  "Strategy": "bg-kat-mystical",
  "System & Tools": "bg-kat-charcoal",
  "Work Hierarchy": "bg-kat-gauntlet",
};

const STATUS_MAP: Record<string, string> = {
  Canonical: "Canonical",
  Blacklisted: "Deprecated",
  Draft: "Draft",
  "In Review": "In Review",
  Deprecated: "Deprecated",
};

function cleanQuotes(s: string): string {
  if (!s) return "";
  return s.replace(/^[''""\u2018\u2019\u201C\u201D]+|[''""\u2018\u2019\u201C\u201D]+$/g, "").trim();
}

function parseVersion(v: string): number {
  if (!v) return 1;
  const match = v.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 1;
}

async function loadSeedData() {
  const wb = XLSX.readFile("attached_assets/Seed Data/Katalyst_lexicon_consolidated_seed_data.xlsx");
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, string>>(ws);

  console.log(`Found ${rows.length} terms in spreadsheet`);

  const existingCats = await db.select().from(categories);
  const existingCatNames = new Set(existingCats.map((c) => c.name));
  console.log(`Existing categories: ${existingCatNames.size}`);

  const xlCategories = [...new Set(rows.map((r) => r["Domain / Category"]))];
  const newCats = xlCategories.filter((c) => !existingCatNames.has(c));

  if (newCats.length > 0) {
    console.log(`Creating ${newCats.length} new categories: ${newCats.join(", ")}`);
    const maxSort = existingCats.reduce((m, c) => Math.max(m, c.sortOrder), -1);
    const catValues = newCats.map((name, i) => ({
      name,
      description: `Definitions and vocabulary related to ${name.toLowerCase()}.`,
      color: CATEGORY_COLORS[name] || "bg-primary",
      sortOrder: maxSort + 1 + i,
    }));
    await db.insert(categories).values(catValues);
    console.log("Categories created.");
  }

  const existingTerms = await db.select().from(terms);
  const existingTermNames = new Set(existingTerms.map((t) => t.name.toLowerCase()));
  console.log(`Existing terms: ${existingTermNames.size}`);

  let inserted = 0;
  let skipped = 0;
  let updated = 0;

  for (const row of rows) {
    const name = (row["Term Name"] || "").trim();
    if (!name) continue;

    const category = (row["Domain / Category"] || "").trim();
    const status = STATUS_MAP[row["Status"]] || "Draft";
    const definition = (row["Definition"] || "").trim();
    const whyExists = (row["Why It Exists"] || "").trim();
    const usedWhen = (row["Used When (Inclusion)"] || "").trim();
    const notUsedWhen = (row["Not Used When (Exclusion)"] || "").trim();
    const version = parseVersion(row["Version"]);

    const synonyms = [row["Synonym 1"], row["Synonym 2"], row["Synonym 3"]]
      .map((s) => (s || "").trim())
      .filter(Boolean);

    const examplesGood = [row["Good Example 1"], row["Good Example 2"]]
      .map((s) => cleanQuotes((s || "").trim()))
      .filter(Boolean);

    const examplesBad = [row["Bad Example 1"], row["Bad Example 2"]]
      .map((s) => cleanQuotes((s || "").trim()))
      .filter(Boolean);

    const visibility = "Internal" as const;
    const owner = "Katalyst Team";

    if (existingTermNames.has(name.toLowerCase())) {
      const existing = existingTerms.find(
        (t) => t.name.toLowerCase() === name.toLowerCase()
      );
      if (existing) {
        await db
          .update(terms)
          .set({
            category,
            definition,
            whyExists,
            usedWhen,
            notUsedWhen,
            examplesGood,
            examplesBad,
            synonyms,
            status: status as any,
            version,
          })
          .where(eq(terms.id, existing.id));
        updated++;
        console.log(`  Updated: ${name}`);
      }
      continue;
    }

    await db.insert(terms).values({
      name,
      category,
      definition,
      whyExists,
      usedWhen,
      notUsedWhen,
      examplesGood,
      examplesBad,
      synonyms,
      status: status as any,
      visibility,
      owner,
      version,
    });

    inserted++;
    existingTermNames.add(name.toLowerCase());
  }

  console.log(`\nDone! Inserted: ${inserted}, Updated: ${updated}, Skipped: ${skipped}`);
  
  const finalCount = await db.select().from(terms);
  console.log(`Total terms in database: ${finalCount.length}`);
  
  const finalCats = await db.select().from(categories);
  console.log(`Total categories in database: ${finalCats.length}`);
}

loadSeedData()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Error:", err);
    process.exit(1);
  });
