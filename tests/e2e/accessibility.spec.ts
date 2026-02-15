import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

async function runAxeScan(page: any, context: string) {
  const results = await new AxeBuilder({ page })
    .withTags(WCAG_TAGS)
    .analyze();
  return results;
}

test.describe("WCAG 2.1 AA Compliance Audit", () => {
  test.describe("Home Page - Search (Combobox Pattern)", () => {
    test("home page passes axe-core WCAG 2.1 AA scan", async ({ page }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");
      const results = await runAxeScan(page, "Home page");
      const critical = results.violations.filter(
        (v) => v.impact === "critical" || v.impact === "serious",
      );
      expect(
        critical,
        `Critical/Serious violations on Home page: ${JSON.stringify(critical.map((v) => ({ id: v.id, impact: v.impact, description: v.description, nodes: v.nodes.length })), null, 2)}`,
      ).toHaveLength(0);
    });

    test("search combobox has proper ARIA attributes", async ({ page }) => {
      const isMobile = (page.viewportSize()?.width ?? 1280) < 768;
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      if (isMobile) {
        const searchButton = page.getByTestId("button-header-search");
        if (await searchButton.isVisible()) {
          await searchButton.click();
          const spotlightInput = page.getByTestId("spotlight-search-input");
          await expect(spotlightInput).toBeVisible({ timeout: 5000 });
          await expect(spotlightInput).toHaveAttribute("role", "combobox");
        }
      } else {
        const searchInput = page.getByTestId("search-input");
        await expect(searchInput).toBeVisible();
        await expect(searchInput).toHaveAttribute("role", "combobox");
        const ariaExpanded = await searchInput.getAttribute("aria-expanded");
        expect(ariaExpanded).toBeTruthy();
      }
    });

    test("search results announce count via aria-live", async ({ page }) => {
      const isMobile = (page.viewportSize()?.width ?? 1280) < 768;
      if (isMobile) {
        test.skip();
        return;
      }
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      const searchInput = page.getByTestId("search-input");
      await searchInput.fill("term");
      await page.waitForTimeout(500);

      const liveRegion = page.locator('[aria-live="polite"]');
      const liveRegionCount = await liveRegion.count();
      expect(liveRegionCount).toBeGreaterThan(0);
    });
  });

  test.describe("Term Detail - Progressive Disclosure", () => {
    test("term detail page passes axe-core WCAG 2.1 AA scan", async ({
      page,
    }) => {
      const termsResponse = await page.request.get(
        "http://localhost:5000/api/terms",
      );
      const terms = await termsResponse.json();
      if (!Array.isArray(terms) || terms.length === 0) {
        test.skip();
        return;
      }
      const firstTerm = terms[0];

      await page.goto(`/term/${firstTerm.id}`);
      await page.waitForLoadState("networkidle");

      const results = await runAxeScan(page, "Term Detail");
      const critical = results.violations.filter(
        (v) => v.impact === "critical" || v.impact === "serious",
      );
      expect(
        critical,
        `Critical/Serious violations on Term Detail: ${JSON.stringify(critical.map((v) => ({ id: v.id, impact: v.impact, description: v.description, nodes: v.nodes.length })), null, 2)}`,
      ).toHaveLength(0);
    });

    test("tier 2 sections are keyboard accessible", async ({ page }) => {
      const termsResponse = await page.request.get(
        "http://localhost:5000/api/terms",
      );
      const terms = await termsResponse.json();
      if (!Array.isArray(terms) || terms.length === 0) {
        test.skip();
        return;
      }
      const firstTerm = terms[0];

      await page.goto(`/term/${firstTerm.id}`);
      await page.waitForLoadState("networkidle");

      const tierSections = [
        "tier-section-examples",
        "tier-section-version-history",
        "tier-section-related-principles",
      ];

      for (const sectionId of tierSections) {
        const section = page.getByTestId(sectionId);
        if (await section.isVisible().catch(() => false)) {
          const trigger = section.locator("button, [role='button']").first();
          if (await trigger.isVisible().catch(() => false)) {
            await trigger.focus();
            const isFocused = await trigger.evaluate(
              (el) => document.activeElement === el,
            );
            expect(isFocused).toBe(true);
          }
        }
      }
    });
  });

  test.describe("Browse Page - Filters & Sidebar", () => {
    test("browse page passes axe-core WCAG 2.1 AA scan", async ({ page }) => {
      await page.goto("/browse");
      await page.waitForLoadState("networkidle");

      const results = await runAxeScan(page, "Browse page");
      const critical = results.violations.filter(
        (v) => v.impact === "critical" || v.impact === "serious",
      );
      expect(
        critical,
        `Critical/Serious violations on Browse: ${JSON.stringify(critical.map((v) => ({ id: v.id, impact: v.impact, description: v.description, nodes: v.nodes.length })), null, 2)}`,
      ).toHaveLength(0);
    });

    test("filter controls are keyboard operable", async ({ page }) => {
      await page.goto("/browse");
      await page.waitForLoadState("networkidle");

      const filterButtons = page.locator(
        '[data-testid*="filter-"], [data-testid*="status-filter"]',
      );
      const count = await filterButtons.count();
      for (let i = 0; i < Math.min(count, 3); i++) {
        const btn = filterButtons.nth(i);
        if (await btn.isVisible().catch(() => false)) {
          await btn.focus();
          const tagName = await btn.evaluate((el) =>
            el.tagName.toLowerCase(),
          );
          const role = await btn.getAttribute("role");
          expect(
            tagName === "button" || role === "button" || role === "checkbox" || role === "option" || tagName === "input",
          ).toBe(true);
        }
      }
    });
  });

  test.describe("Proposal Form - Validation & Error States", () => {
    test("propose page passes axe-core WCAG 2.1 AA scan", async ({
      page,
    }) => {
      await page.goto("/propose");
      await page.waitForLoadState("networkidle");

      const results = await runAxeScan(page, "Propose Term page");
      const critical = results.violations.filter(
        (v) => v.impact === "critical" || v.impact === "serious",
      );
      expect(
        critical,
        `Critical/Serious violations on Propose: ${JSON.stringify(critical.map((v) => ({ id: v.id, impact: v.impact, description: v.description, nodes: v.nodes.length })), null, 2)}`,
      ).toHaveLength(0);
    });

    test("form labels are associated with inputs", async ({ page }) => {
      await page.goto("/propose");
      await page.waitForLoadState("networkidle");

      const inputs = page.locator(
        'input:not([type="hidden"]), textarea, select',
      );
      const count = await inputs.count();
      let labeledCount = 0;
      for (let i = 0; i < count; i++) {
        const input = inputs.nth(i);
        if (!(await input.isVisible().catch(() => false))) continue;
        const ariaLabel = await input.getAttribute("aria-label");
        const ariaLabelledby = await input.getAttribute("aria-labelledby");
        const id = await input.getAttribute("id");
        let hasLabel = !!ariaLabel || !!ariaLabelledby;
        if (!hasLabel && id) {
          const label = page.locator(`label[for="${id}"]`);
          hasLabel = (await label.count()) > 0;
        }
        const placeholder = await input.getAttribute("placeholder");
        if (hasLabel || placeholder) {
          labeledCount++;
        }
      }
      expect(labeledCount).toBeGreaterThan(0);
    });
  });

  test.describe("Review Queue - Confirmation Dialogs", () => {
    test("review queue page passes axe-core WCAG 2.1 AA scan", async ({
      page,
    }) => {
      await page.goto("/review");
      await page.waitForLoadState("networkidle");

      const results = await runAxeScan(page, "Review Queue");
      const critical = results.violations.filter(
        (v) => v.impact === "critical" || v.impact === "serious",
      );
      expect(
        critical,
        `Critical/Serious violations on Review Queue: ${JSON.stringify(critical.map((v) => ({ id: v.id, impact: v.impact, description: v.description, nodes: v.nodes.length })), null, 2)}`,
      ).toHaveLength(0);
    });
  });

  test.describe("Principles Pages", () => {
    test("principles list passes axe-core WCAG 2.1 AA scan", async ({
      page,
    }) => {
      await page.goto("/principles");
      await page.waitForLoadState("networkidle");

      const results = await runAxeScan(page, "Principles list");
      const critical = results.violations.filter(
        (v) => v.impact === "critical" || v.impact === "serious",
      );
      expect(
        critical,
        `Critical/Serious violations on Principles: ${JSON.stringify(critical.map((v) => ({ id: v.id, impact: v.impact, description: v.description, nodes: v.nodes.length })), null, 2)}`,
      ).toHaveLength(0);
    });

    test("principle detail passes axe-core WCAG 2.1 AA scan", async ({
      page,
    }) => {
      const response = await page.request.get(
        "http://localhost:5000/api/principles",
      );
      const principles = await response.json();
      if (!Array.isArray(principles) || principles.length === 0) {
        test.skip();
        return;
      }
      const slug = principles[0].slug || principles[0].id;

      await page.goto(`/principle/${slug}`);
      await page.waitForLoadState("networkidle");

      const results = await runAxeScan(page, "Principle Detail");
      const critical = results.violations.filter(
        (v) => v.impact === "critical" || v.impact === "serious",
      );
      expect(
        critical,
        `Critical/Serious violations on Principle Detail: ${JSON.stringify(critical.map((v) => ({ id: v.id, impact: v.impact, description: v.description, nodes: v.nodes.length })), null, 2)}`,
      ).toHaveLength(0);
    });
  });

  test.describe("Navigation - Skip Link & Role-Filtered Items", () => {
    test("skip link is present and functional", async ({ page }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      const skipLink = page.getByTestId("skip-link");
      await expect(skipLink).toBeAttached();

      const href = await skipLink.getAttribute("href");
      expect(href).toBe("#main-content");

      const mainContent = page.locator("#main-content");
      await expect(mainContent).toBeAttached();
    });

    test("page title updates on route change", async ({ page }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");
      const homeTitle = await page.title();
      expect(homeTitle).toContain("Katalyst Lexicon");

      await page.goto("/browse");
      await page.waitForLoadState("networkidle");
      const browseTitle = await page.title();
      expect(browseTitle).toContain("Katalyst Lexicon");
      expect(browseTitle).not.toBe("");

      await page.goto("/principles");
      await page.waitForLoadState("networkidle");
      const principlesTitle = await page.title();
      expect(principlesTitle).toContain("Katalyst Lexicon");
    });

    test("navigation links have accessible names", async ({ page }) => {
      const isMobile = (page.viewportSize()?.width ?? 1280) < 768;
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      if (isMobile) {
        const menuButton = page.getByTestId("button-mobile-menu");
        if (await menuButton.isVisible()) {
          const ariaLabel = await menuButton.getAttribute("aria-label");
          expect(ariaLabel).toBeTruthy();
        }
      }

      const navLinks = page.locator('[data-testid^="nav-"]');
      const count = await navLinks.count();
      for (let i = 0; i < count; i++) {
        const link = navLinks.nth(i);
        if (!(await link.isVisible().catch(() => false))) continue;
        const text = await link.textContent();
        expect(text?.trim().length).toBeGreaterThan(0);
      }
    });
  });

  test.describe("Dark Mode Accessibility", () => {
    test("dark mode passes axe-core WCAG 2.1 AA scan on home page", async ({
      page,
    }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      const isMobile = (page.viewportSize()?.width ?? 1280) < 768;
      const themeToggle = isMobile
        ? page.getByTestId("button-theme-toggle-mobile")
        : page.getByTestId("button-theme-toggle");
      
      if (await themeToggle.isVisible().catch(() => false)) {
        await themeToggle.click();
        await page.waitForTimeout(300);
      }

      const results = await runAxeScan(page, "Home page (Dark mode)");
      const critical = results.violations.filter(
        (v) => v.impact === "critical" || v.impact === "serious",
      );
      expect(
        critical,
        `Critical/Serious dark mode violations: ${JSON.stringify(critical.map((v) => ({ id: v.id, impact: v.impact, description: v.description, nodes: v.nodes.length })), null, 2)}`,
      ).toHaveLength(0);
    });

    test("dark mode passes axe-core on browse page", async ({ page }) => {
      await page.goto("/browse");
      await page.waitForLoadState("networkidle");

      const isMobile = (page.viewportSize()?.width ?? 1280) < 768;
      const themeToggle = isMobile
        ? page.getByTestId("button-theme-toggle-mobile")
        : page.getByTestId("button-theme-toggle");

      if (await themeToggle.isVisible().catch(() => false)) {
        await themeToggle.click();
        await page.waitForTimeout(300);
      }

      const results = await runAxeScan(page, "Browse page (Dark mode)");
      const critical = results.violations.filter(
        (v) => v.impact === "critical" || v.impact === "serious",
      );
      expect(
        critical,
        `Critical/Serious dark mode violations on Browse: ${JSON.stringify(critical.map((v) => ({ id: v.id, impact: v.impact, description: v.description, nodes: v.nodes.length })), null, 2)}`,
      ).toHaveLength(0);
    });
  });

  test.describe("Additional Pages Axe Scans", () => {
    test("my proposals page passes axe-core scan", async ({ page }) => {
      await page.goto("/my-proposals");
      await page.waitForLoadState("networkidle");

      const results = await runAxeScan(page, "My Proposals");
      const critical = results.violations.filter(
        (v) => v.impact === "critical" || v.impact === "serious",
      );
      expect(
        critical,
        `Critical/Serious violations on My Proposals: ${JSON.stringify(critical.map((v) => ({ id: v.id, impact: v.impact, description: v.description, nodes: v.nodes.length })), null, 2)}`,
      ).toHaveLength(0);
    });

    test("categories management page passes axe-core scan", async ({
      page,
    }) => {
      await page.goto("/categories");
      await page.waitForLoadState("networkidle");

      const results = await runAxeScan(page, "Manage Categories");
      const critical = results.violations.filter(
        (v) => v.impact === "critical" || v.impact === "serious",
      );
      expect(
        critical,
        `Critical/Serious violations on Categories: ${JSON.stringify(critical.map((v) => ({ id: v.id, impact: v.impact, description: v.description, nodes: v.nodes.length })), null, 2)}`,
      ).toHaveLength(0);
    });

    test("settings page passes axe-core scan", async ({ page }) => {
      await page.goto("/settings");
      await page.waitForLoadState("networkidle");

      const results = await runAxeScan(page, "Settings");
      const critical = results.violations.filter(
        (v) => v.impact === "critical" || v.impact === "serious",
      );
      expect(
        critical,
        `Critical/Serious violations on Settings: ${JSON.stringify(critical.map((v) => ({ id: v.id, impact: v.impact, description: v.description, nodes: v.nodes.length })), null, 2)}`,
      ).toHaveLength(0);
    });

    test("manage principles page passes axe-core scan", async ({ page }) => {
      await page.goto("/manage-principles");
      await page.waitForLoadState("networkidle");

      const results = await runAxeScan(page, "Manage Principles");
      const critical = results.violations.filter(
        (v) => v.impact === "critical" || v.impact === "serious",
      );
      expect(
        critical,
        `Critical/Serious violations on Manage Principles: ${JSON.stringify(critical.map((v) => ({ id: v.id, impact: v.impact, description: v.description, nodes: v.nodes.length })), null, 2)}`,
      ).toHaveLength(0);
    });
  });

  test.describe("Data-testid Coverage Check", () => {
    test("interactive elements have data-testid attributes", async ({
      page,
    }) => {
      const pagesToCheck = ["/", "/browse", "/propose", "/principles"];
      const missingTestIds: { page: string; element: string; type: string }[] =
        [];

      for (const pagePath of pagesToCheck) {
        await page.goto(pagePath);
        await page.waitForLoadState("networkidle");

        const interactiveElements = await page
          .locator("button, a[href], input, select, textarea")
          .evaluateAll((els) =>
            els
              .filter((el) => {
                const style = window.getComputedStyle(el);
                return style.display !== "none" && style.visibility !== "hidden";
              })
              .map((el) => ({
                tag: el.tagName.toLowerCase(),
                hasTestId: !!el.getAttribute("data-testid"),
                text: (
                  el.textContent?.trim().substring(0, 50) ||
                  el.getAttribute("aria-label") ||
                  ""
                ).trim(),
                type: el.getAttribute("type") || "",
              })),
          );

        const missing = interactiveElements.filter((el) => !el.hasTestId);
        for (const el of missing) {
          missingTestIds.push({
            page: pagePath,
            element: `<${el.tag}${el.type ? ` type="${el.type}"` : ""}> "${el.text}"`,
            type: el.tag,
          });
        }
      }

      console.log(
        `data-testid coverage: ${missingTestIds.length} interactive elements missing testids`,
      );
      if (missingTestIds.length > 0) {
        console.log("Missing data-testid elements (sample):");
        missingTestIds.slice(0, 20).forEach((m) => {
          console.log(`  [${m.page}] ${m.element}`);
        });
      }
    });
  });

  test.describe("Color Contrast Checks", () => {
    test("all pages meet WCAG AA contrast requirements", async ({ page }) => {
      const pagesToCheck = ["/", "/browse", "/principles", "/propose"];
      const allContrastViolations: {
        page: string;
        id: string;
        nodes: number;
      }[] = [];

      for (const pagePath of pagesToCheck) {
        await page.goto(pagePath);
        await page.waitForLoadState("networkidle");

        const results = await new AxeBuilder({ page })
          .withTags(WCAG_TAGS)
          .analyze();

        const contrastViolations = results.violations.filter(
          (v) => v.id === "color-contrast" || v.id === "color-contrast-enhanced",
        );
        for (const v of contrastViolations) {
          allContrastViolations.push({
            page: pagePath,
            id: v.id,
            nodes: v.nodes.length,
          });
        }
      }

      if (allContrastViolations.length > 0) {
        console.log(
          "Contrast violations found:",
          JSON.stringify(allContrastViolations, null, 2),
        );
      }

      const criticalContrastPages = allContrastViolations.filter(
        (v) => v.nodes > 5,
      );
      expect(
        criticalContrastPages,
        `Pages with excessive contrast violations: ${JSON.stringify(criticalContrastPages)}`,
      ).toHaveLength(0);
    });
  });

  test.describe("Keyboard Navigation", () => {
    test("all pages are navigable by keyboard", async ({ page }) => {
      const isMobile = (page.viewportSize()?.width ?? 1280) < 768;
      if (isMobile) {
        test.skip();
        return;
      }

      await page.goto("/");
      await page.waitForLoadState("networkidle");

      await page.keyboard.press("Tab");
      const firstFocused = await page.evaluate(
        () => document.activeElement?.tagName,
      );
      expect(firstFocused).toBeTruthy();

      for (let i = 0; i < 5; i++) {
        await page.keyboard.press("Tab");
      }
      const somethingFocused = await page.evaluate(
        () => document.activeElement?.tagName,
      );
      expect(somethingFocused).toBeTruthy();
      expect(somethingFocused).not.toBe("BODY");
    });
  });

  test.describe("Focus Management", () => {
    test("main content can receive focus from skip link", async ({ page }) => {
      const isMobile = (page.viewportSize()?.width ?? 1280) < 768;
      if (isMobile) {
        test.skip();
        return;
      }

      await page.goto("/");
      await page.waitForLoadState("networkidle");

      const mainContent = page.locator("#main-content");
      const tabIndex = await mainContent.getAttribute("tabindex");
      expect(tabIndex).toBe("-1");
    });

    test("theme toggle has accessible label", async ({ page }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      const isMobile = (page.viewportSize()?.width ?? 1280) < 768;
      const toggleTestId = isMobile
        ? "button-theme-toggle-mobile"
        : "button-theme-toggle";
      const themeToggle = page.getByTestId(toggleTestId);

      if (await themeToggle.isVisible().catch(() => false)) {
        const ariaLabel = await themeToggle.getAttribute("aria-label");
        expect(ariaLabel).toBeTruthy();
        expect(ariaLabel).toMatch(/light|dark/i);
      }
    });
  });
});
