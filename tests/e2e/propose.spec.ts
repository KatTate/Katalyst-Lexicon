import { test, expect } from "@playwright/test";

test.describe("Propose Job Journey", () => {
  test("navigate to propose page and verify form elements are visible", async ({
    page,
  }) => {
    await page.goto("/propose");

    const heading = page.getByTestId("text-propose-heading");
    await expect(heading).toBeVisible({ timeout: 5000 });

    const nameInput = page.getByTestId("input-term-name");
    await expect(nameInput).toBeVisible();

    const categorySelect = page.getByTestId("select-category");
    await expect(categorySelect).toBeVisible();

    const definitionInput = page.getByTestId("input-definition");
    await expect(definitionInput).toBeVisible();

    const whyExistsInput = page.getByTestId("input-why-exists");
    await expect(whyExistsInput).toBeVisible();

    const submitButton = page.getByTestId("button-submit-proposal");
    await expect(submitButton).toBeVisible();
  });

  test("fill form fields and verify validation indicators appear", async ({
    page,
  }) => {
    await page.goto("/propose");

    const heading = page.getByTestId("text-propose-heading");
    await expect(heading).toBeVisible({ timeout: 5000 });

    const nameInput = page.getByTestId("input-term-name");
    const definitionInput = page.getByTestId("input-definition");
    const whyExistsInput = page.getByTestId("input-why-exists");

    await nameInput.fill(`TestTerm_${Date.now()}`);
    await page.waitForTimeout(200);

    const categorySelect = page.getByTestId("select-category");
    await categorySelect.click();
    await page.waitForTimeout(300);
    const firstOption = page.getByRole("option").first();
    await firstOption.click();

    await definitionInput.fill("A test definition for validation purposes");
    await page.waitForTimeout(200);

    await whyExistsInput.fill("Testing why this term exists");
    await page.waitForTimeout(200);

    const validName = page.getByTestId("icon-valid-name");
    const validDef = page.getByTestId("icon-valid-definition");
    const validCategory = page.getByTestId("icon-valid-category");
    const validWhyExists = page.getByTestId("icon-valid-why-exists");

    await expect(validName).toBeVisible({ timeout: 3000 });
    await expect(validDef).toBeVisible({ timeout: 3000 });
    await expect(validCategory).toBeVisible({ timeout: 3000 });
    await expect(validWhyExists).toBeVisible({ timeout: 3000 });
  });

  test("trigger duplicate detection warning with existing term name", async ({
    page,
  }) => {
    const termsResponse = await page.request.get(
      "http://localhost:5000/api/terms",
    );
    const terms = await termsResponse.json();

    if (!Array.isArray(terms) || terms.length === 0) {
      test.skip(true, "No existing terms to test duplicate detection");
      return;
    }

    const existingTermName = terms[0].name;

    await page.goto("/propose");

    const heading = page.getByTestId("text-propose-heading");
    await expect(heading).toBeVisible({ timeout: 5000 });

    const nameInput = page.getByTestId("input-term-name");
    await nameInput.fill(existingTermName);

    const definitionInput = page.getByTestId("input-definition");
    await definitionInput.click();
    await page.waitForTimeout(1000);

    const duplicateWarning = page.getByTestId("warning-duplicate");
    await expect(duplicateWarning).toBeVisible({ timeout: 5000 });
  });
});
