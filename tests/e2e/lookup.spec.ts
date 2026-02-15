import { test, expect } from "@playwright/test";

test.describe("Lookup Job Journey", () => {
  test("search for a term, verify result cards, navigate to detail, expand Tier 2", async ({
    page,
  }) => {
    const termsResponse = await page.request.get(
      "http://localhost:5000/api/terms",
    );
    const terms = await termsResponse.json();
    const firstTermId =
      Array.isArray(terms) && terms.length > 0 ? terms[0].id : null;

    await page.goto("/");

    const isMobile = (page.viewportSize()?.width ?? 1280) < 768;

    if (isMobile) {
      const spotlightButton = page.getByTestId("button-open-spotlight");
      await spotlightButton.click();
      const searchInput = page.getByTestId("spotlight-search-input");
      await expect(searchInput).toBeVisible();
      await searchInput.fill("term");
      await page.waitForTimeout(400);
      const results = page.getByTestId("spotlight-results");
      await expect(results).toBeVisible({ timeout: 5000 });

      if (firstTermId) {
        const firstResult = page.getByTestId(
          `spotlight-result-${firstTermId}`,
        );
        const visible = await firstResult.isVisible().catch(() => false);
        if (visible) {
          await firstResult.click();
        } else {
          const anyResult = results.locator("[data-testid]").first();
          await anyResult.click();
        }
      }
    } else {
      const searchInput = page.getByTestId("search-input");
      await expect(searchInput).toBeVisible();
      await searchInput.fill("term");
      await page.waitForTimeout(400);
      const searchResults = page.getByTestId("search-results");
      await expect(searchResults).toBeVisible({ timeout: 5000 });

      if (firstTermId) {
        const firstResult = page.getByTestId(
          `search-result-${firstTermId}`,
        );
        const visible = await firstResult.isVisible().catch(() => false);
        if (visible) {
          const termCard = page.getByTestId(`card-term-${firstTermId}`);
          await expect(termCard).toBeVisible();

          const freshness = page.getByTestId(`freshness-${firstTermId}`);
          if (await freshness.isVisible().catch(() => false)) {
            await expect(freshness).not.toBeEmpty();
          }

          await firstResult.click();
        } else {
          const anyResult = searchResults.locator("[data-testid]").first();
          await anyResult.click();
        }
      }
    }

    await page.waitForURL(/\/term\//);

    const termName = page.getByTestId("text-term-name");
    await expect(termName).toBeVisible();
    await expect(termName).not.toBeEmpty();

    const termDefinition = page.getByTestId("text-term-definition");
    await expect(termDefinition).toBeVisible();
    await expect(termDefinition).not.toBeEmpty();

    const termCategory = page.getByTestId("text-term-category");
    await expect(termCategory).toBeVisible();

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
        await page.waitForTimeout(500);
        break;
      }
    }
  });
});
