import { test, expect } from "@playwright/test";

test.describe("Dark Mode Tests", () => {
  test.beforeEach(async ({ context }) => {
    await context.addInitScript(() => {
      window.localStorage.removeItem("theme");
    });
  });

  test("toggle dark mode and verify Lookup journey works", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForTimeout(500);

    const isMobile = (page.viewportSize()?.width ?? 1280) < 768;
    const toggleTestId = isMobile
      ? "button-theme-toggle-mobile"
      : "button-theme-toggle";

    const themeToggle = page.getByTestId(toggleTestId);
    await expect(themeToggle).toBeVisible();
    await themeToggle.click();
    await page.waitForTimeout(300);

    const isDark = await page.evaluate(() =>
      document.documentElement.classList.contains("dark"),
    );
    expect(isDark).toBe(true);

    if (isMobile) {
      const spotlightButton = page.getByTestId("button-open-spotlight");
      await spotlightButton.click();
      const searchInput = page.getByTestId("spotlight-search-input");
      await expect(searchInput).toBeVisible();
    } else {
      const searchInput = page.getByTestId("search-input");
      await expect(searchInput).toBeVisible();
    }

    const stillDark = await page.evaluate(() =>
      document.documentElement.classList.contains("dark"),
    );
    expect(stillDark).toBe(true);
  });

  test("toggle dark mode and verify Browse page works", async ({ page }) => {
    const termsResponse = await page.request.get(
      "http://localhost:5000/api/terms",
    );
    const terms = await termsResponse.json();
    const firstTermId =
      Array.isArray(terms) && terms.length > 0 ? terms[0].id : null;

    await page.goto("/browse");
    await page.waitForTimeout(500);

    const isMobile = (page.viewportSize()?.width ?? 1280) < 768;
    const toggleTestId = isMobile
      ? "button-theme-toggle-mobile"
      : "button-theme-toggle";

    const themeToggle = page.getByTestId(toggleTestId);
    await expect(themeToggle).toBeVisible();
    await themeToggle.click();
    await page.waitForTimeout(300);

    const isDark = await page.evaluate(() =>
      document.documentElement.classList.contains("dark"),
    );
    expect(isDark).toBe(true);

    const heading = page.getByTestId("heading-browse");
    await expect(heading).toBeVisible();

    if (firstTermId) {
      const termCard = page.getByTestId(`card-term-${firstTermId}`);
      await expect(termCard).toBeVisible({ timeout: 5000 });
    }
  });
});
