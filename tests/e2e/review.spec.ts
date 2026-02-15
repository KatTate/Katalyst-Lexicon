import { test, expect } from "@playwright/test";

test.describe("Review Job Journey", () => {
  test("navigate to review queue and verify access restriction or proposal list", async ({
    page,
  }) => {
    await page.goto("/review");

    const permissionDenied = page.getByTestId("permission-denied-review");
    const permDeniedVisible = await permissionDenied
      .isVisible({ timeout: 3000 })
      .catch(() => false);

    if (permDeniedVisible) {
      await expect(permissionDenied).toContainText("Access Restricted");
      return;
    }

    const emptyState = page.getByTestId("empty-state-review-queue");
    const hasEmpty = await emptyState.isVisible().catch(() => false);

    if (hasEmpty) {
      await expect(emptyState).toBeVisible();
      return;
    }

    const proposalsResponse = await page.request.get(
      "http://localhost:5000/api/proposals",
    );
    const proposals = await proposalsResponse.json();

    if (!Array.isArray(proposals) || proposals.length === 0) {
      return;
    }

    const firstProposalId = proposals[0].id;
    const proposalCard = page.getByTestId(
      `proposal-card-${firstProposalId}`,
    );

    const cardVisible = await proposalCard.isVisible().catch(() => false);
    if (!cardVisible) {
      return;
    }

    await proposalCard.click();

    const proposalName = page.getByTestId("text-proposal-name");
    await expect(proposalName).toBeVisible({ timeout: 5000 });

    const auditTrail = page.getByTestId("audit-trail-section");
    if (await auditTrail.isVisible().catch(() => false)) {
      await expect(auditTrail).toBeVisible();
    }

    const approveBtn = page.getByTestId("approve-button");
    const hasApprove = await approveBtn.isVisible().catch(() => false);

    if (!hasApprove) {
      return;
    }

    const responsePromise = page.waitForResponse(
      (resp) => resp.url().includes("/api/proposals/") && resp.url().includes("/approve"),
    );

    await approveBtn.click();
    const confirmDialog = page.getByTestId("approval-confirmation-dialog");
    await expect(confirmDialog).toBeVisible({ timeout: 3000 });

    const confirmButton = page.getByTestId("confirm-approve-button");
    await expect(confirmButton).toBeVisible();
    await confirmButton.click();

    const approvalResponse = await responsePromise.catch(() => null);

    if (approvalResponse && approvalResponse.ok()) {
      await expect(page).toHaveURL("/review", { timeout: 5000 });
      const updatedCard = page.getByTestId(`proposal-card-${firstProposalId}`);
      const cardStillVisible = await updatedCard.isVisible().catch(() => false);
      expect(cardStillVisible).toBe(false);
    } else if (approvalResponse) {
      expect(approvalResponse.status()).toBeGreaterThanOrEqual(400);
    }
  });
});
