import { test, expect } from "@playwright/test";

test.describe("Principles Job Journey", () => {
  test("navigate to principles, view list, click into detail, verify content", async ({
    page,
  }) => {
    const principlesResponse = await page.request.get(
      "http://localhost:5000/api/principles",
    );
    const principles = await principlesResponse.json();
    const firstPrinciple =
      Array.isArray(principles) && principles.length > 0
        ? principles[0]
        : null;

    await page.goto("/principles");

    const title = page.getByTestId("text-principles-title");
    await expect(title).toBeVisible();

    const principlesGrid = page.getByTestId("principles-grid");
    await expect(principlesGrid).toBeVisible({ timeout: 5000 });

    if (firstPrinciple) {
      const firstCard = page.getByTestId(
        `card-principle-${firstPrinciple.id}`,
      );
      await expect(firstCard).toBeVisible({ timeout: 5000 });
      await firstCard.click();
    }

    await page.waitForURL(/\/principle\//);

    const principleTitle = page.getByTestId("text-principle-title");
    await expect(principleTitle).toBeVisible();
    await expect(principleTitle).not.toBeEmpty();

    const principleSummary = page.getByTestId("text-principle-summary");
    if (await principleSummary.isVisible().catch(() => false)) {
      await expect(principleSummary).not.toBeEmpty();
    }

    const principleBody = page.getByTestId("text-principle-body");
    await expect(principleBody).toBeVisible();

    const relatedTerms = page.getByTestId("heading-related-terms");
    if (await relatedTerms.isVisible().catch(() => false)) {
      await expect(relatedTerms).toBeVisible();
    }
  });
});
