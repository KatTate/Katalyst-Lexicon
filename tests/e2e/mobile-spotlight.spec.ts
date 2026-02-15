import { test, expect } from "@playwright/test";

test.describe("Mobile Spotlight Search", () => {
  test.skip(
    ({ viewport }) => (viewport?.width ?? 1280) > 767,
    "Spotlight is mobile-only",
  );

  test("open Spotlight overlay, search, and navigate to result", async ({
    page,
  }) => {
    const termsResponse = await page.request.get(
      "http://localhost:5000/api/terms",
    );
    const terms = await termsResponse.json();
    const firstTermId =
      Array.isArray(terms) && terms.length > 0 ? terms[0].id : null;

    await page.goto("/");

    const spotlightButton = page.getByTestId("button-open-spotlight");
    await expect(spotlightButton).toBeVisible();
    await spotlightButton.click();

    const overlay = page.getByTestId("spotlight-overlay");
    await expect(overlay).toBeVisible();

    const searchInput = page.getByTestId("spotlight-search-input");
    await expect(searchInput).toBeFocused();

    await searchInput.fill("term");

    const results = page.getByTestId("spotlight-results");
    await expect(results).toBeVisible({ timeout: 5000 });

    if (firstTermId) {
      const firstResult = page.getByTestId(
        `spotlight-result-${firstTermId}`,
      );
      await expect(firstResult).toBeVisible({ timeout: 5000 });
      await firstResult.click();
    }

    await page.waitForURL(/\/term\//, { timeout: 5000 });

    const termName = page.getByTestId("text-term-name");
    await expect(termName).toBeVisible();
  });

  test("Spotlight shows empty state for no results", async ({ page }) => {
    await page.goto("/");

    const spotlightButton = page.getByTestId("button-open-spotlight");
    await spotlightButton.click();

    const searchInput = page.getByTestId("spotlight-search-input");
    await searchInput.fill("xyznonexistentterm999");

    const emptyState = page.getByTestId("spotlight-empty-state");
    await expect(emptyState).toBeVisible({ timeout: 5000 });
  });
});
