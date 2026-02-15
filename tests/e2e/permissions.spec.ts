import { test, expect } from "@playwright/test";

test.describe("Permission Matrix Tests", () => {
  test("unauthenticated users can access read-only pages", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page).toHaveURL("/");
    const searchHero = page.getByTestId("search-hero");
    await expect(searchHero).toBeVisible();

    await page.goto("/browse");
    const browseHeading = page.getByTestId("heading-browse");
    await expect(browseHeading).toBeVisible();

    await page.goto("/principles");
    const principlesTitle = page.getByTestId("text-principles-title");
    await expect(principlesTitle).toBeVisible();
  });

  test("unauthenticated users can access term detail pages", async ({
    page,
  }) => {
    const termsResponse = await page.request.get(
      "http://localhost:5000/api/terms",
    );
    expect(termsResponse.ok()).toBe(true);
    const terms = await termsResponse.json();

    if (Array.isArray(terms) && terms.length > 0) {
      await page.goto(`/term/${terms[0].id}`);
      const termName = page.getByTestId("text-term-name");
      await expect(termName).toBeVisible();
    }
  });

  test("unauthenticated users see access restriction on review page", async ({
    page,
  }) => {
    await page.goto("/review");
    const permissionDenied = page.getByTestId("permission-denied-review");
    await expect(permissionDenied).toBeVisible({ timeout: 5000 });
  });

  test("unauthenticated API calls to write endpoints are rejected", async ({
    request,
  }) => {
    const proposalResponse = await request.post(
      "http://localhost:5000/api/proposals",
      {
        data: {
          termName: "Test Unauthorized",
          category: "test",
          definition: "Should be rejected",
        },
      },
    );
    expect(proposalResponse.status()).toBeGreaterThanOrEqual(400);
  });
});
