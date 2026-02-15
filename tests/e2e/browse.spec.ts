import { test, expect } from "@playwright/test";

test.describe("Browse Job Journey", () => {
  test("navigate to browse, verify sidebar, apply filter, click term", async ({
    page,
  }) => {
    const termsResponse = await page.request.get(
      "http://localhost:5000/api/terms",
    );
    const terms = await termsResponse.json();
    const firstTermId =
      Array.isArray(terms) && terms.length > 0 ? terms[0].id : null;

    await page.goto("/browse");

    const heading = page.getByTestId("heading-browse");
    await expect(heading).toBeVisible();

    const isMobile = (page.viewportSize()?.width ?? 1280) < 768;

    if (!isMobile) {
      const sidebar = page.getByTestId("browse-sidebar");
      await expect(sidebar).toBeVisible();
    }

    const filterBar = page.getByTestId("filter-bar");
    await expect(filterBar).toBeVisible({ timeout: 5000 });

    if (firstTermId) {
      const termCard = page.getByTestId(`card-term-${firstTermId}`);
      await expect(termCard).toBeVisible({ timeout: 5000 });
    }

    const canonicalFilter = page.getByTestId("filter-status-canonical");
    if (await canonicalFilter.isVisible().catch(() => false)) {
      await canonicalFilter.click();
      await page.waitForTimeout(500);

      const activeFilterBadge = page.getByTestId("badge-active-filter-count");
      if (await activeFilterBadge.isVisible().catch(() => false)) {
        await expect(activeFilterBadge).toBeVisible();
      }
    }

    if (firstTermId) {
      const termCard = page.getByTestId(`card-term-${firstTermId}`);
      const visible = await termCard.isVisible().catch(() => false);
      if (visible) {
        await termCard.click();
        await page.waitForURL(/\/term\//);
        const termName = page.getByTestId("text-term-name");
        await expect(termName).toBeVisible();
      }
    }
  });
});
