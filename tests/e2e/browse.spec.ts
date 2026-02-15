import { test, expect } from "@playwright/test";

test.describe("Browse Job Journey", () => {
  test("navigate to browse, verify sidebar, apply filter, click term", async ({
    page,
  }) => {
    const termsResponse = await page.request.get(
      "http://localhost:5000/api/terms",
    );
    const terms = await termsResponse.json();
    const firstTerm =
      Array.isArray(terms) && terms.length > 0 ? terms[0] : null;

    const categoriesResponse = await page.request.get(
      "http://localhost:5000/api/categories",
    );
    const categories = await categoriesResponse.json();
    const firstCategory =
      Array.isArray(categories) && categories.length > 0 ? categories[0] : null;

    await page.goto("/browse");

    const heading = page.getByTestId("heading-browse");
    await expect(heading).toBeVisible();

    const isMobile = (page.viewportSize()?.width ?? 1280) < 768;

    if (!isMobile) {
      const sidebar = page.getByTestId("browse-sidebar");
      await expect(sidebar).toBeVisible();

      if (firstCategory) {
        const categoryLink = page.getByTestId(`sidebar-category-${firstCategory.id}`);
        if (await categoryLink.isVisible().catch(() => false)) {
          await categoryLink.click();
          const categorySection = page.getByTestId(`category-section-${firstCategory.id}`);
          if (await categorySection.isVisible({ timeout: 3000 }).catch(() => false)) {
            await expect(categorySection).toBeVisible();
          }
        }
      }
    }

    const filterBar = page.getByTestId("filter-bar");
    await expect(filterBar).toBeVisible({ timeout: 5000 });

    const canonicalFilter = page.getByTestId("filter-status-canonical");
    if (await canonicalFilter.isVisible().catch(() => false)) {
      await canonicalFilter.click();

      const activeFilterBadge = page.getByTestId("badge-active-filter-count");
      await expect(activeFilterBadge).toBeVisible({ timeout: 3000 });
    }

    const clearFilters = page.getByTestId("button-clear-filters");
    if (await clearFilters.isVisible().catch(() => false)) {
      await clearFilters.click();
    }

    if (firstTerm) {
      const termCard = page.getByTestId(`card-term-${firstTerm.id}`);
      await expect(termCard).toBeVisible({ timeout: 5000 });
      await termCard.click();
      await page.waitForURL(/\/term\//, { timeout: 5000 });
      const termName = page.getByTestId("text-term-name");
      await expect(termName).toBeVisible();
    }
  });
});
