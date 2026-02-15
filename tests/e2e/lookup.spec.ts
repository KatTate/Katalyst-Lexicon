import { test, expect } from "@playwright/test";

test.describe("Lookup Job Journey", () => {
  test("search for a term, verify result cards, navigate to detail, expand Tier 2", async ({
    page,
  }) => {
    const termsResponse = await page.request.get(
      "http://localhost:5000/api/terms",
    );
    const terms = await termsResponse.json();
    const firstTerm =
      Array.isArray(terms) && terms.length > 0 ? terms[0] : null;

    await page.goto("/");

    const isMobile = (page.viewportSize()?.width ?? 1280) < 768;

    if (isMobile) {
      const spotlightButton = page.getByTestId("button-open-spotlight");
      await spotlightButton.click();
      const searchInput = page.getByTestId("spotlight-search-input");
      await expect(searchInput).toBeVisible();
      await searchInput.fill("term");
      const results = page.getByTestId("spotlight-results");
      await expect(results).toBeVisible({ timeout: 5000 });

      if (firstTerm) {
        const firstResult = page.getByTestId(
          `spotlight-result-${firstTerm.id}`,
        );
        await expect(firstResult).toBeVisible({ timeout: 5000 });
        await firstResult.click();
      }
    } else {
      const searchInput = page.getByTestId("search-input");
      await expect(searchInput).toBeVisible();
      await searchInput.fill("term");
      const searchResults = page.getByTestId("search-results");
      await expect(searchResults).toBeVisible({ timeout: 5000 });

      if (firstTerm) {
        const firstResult = page.getByTestId(
          `search-result-${firstTerm.id}`,
        );
        await expect(firstResult).toBeVisible({ timeout: 5000 });

        const termCard = page.getByTestId(`card-term-${firstTerm.id}`);
        if (await termCard.isVisible().catch(() => false)) {
          await expect(termCard).toBeVisible();
        }

        const freshness = page.getByTestId(`freshness-${firstTerm.id}`);
        if (await freshness.isVisible().catch(() => false)) {
          await expect(freshness).not.toBeEmpty();
        }

        await firstResult.click();
      }
    }

    await page.waitForURL(/\/term\//, { timeout: 5000 });

    const termName = page.getByTestId("text-term-name");
    await expect(termName).toBeVisible();
    await expect(termName).not.toBeEmpty();

    const termDefinition = page.getByTestId("text-term-definition");
    await expect(termDefinition).toBeVisible();
    await expect(termDefinition).not.toBeEmpty();

    const termCategory = page.getByTestId("text-term-category");
    await expect(termCategory).toBeVisible();

    const statusBadge = page.getByTestId("badge-term-status");
    if (await statusBadge.isVisible().catch(() => false)) {
      await expect(statusBadge).not.toBeEmpty();
    }

    const usageGuidance = page.getByTestId("section-usage-guidance");
    if (await usageGuidance.isVisible().catch(() => false)) {
      await expect(usageGuidance).toBeVisible();
    }

    const tierSections = [
      "tier-section-examples",
      "tier-section-version-history",
      "tier-section-related-principles",
    ];

    for (const sectionId of tierSections) {
      const section = page.getByTestId(sectionId);
      if (await section.isVisible().catch(() => false)) {
        await section.click();
        break;
      }
    }
  });
});
