import { test, expect } from "@playwright/test";

test.describe("Critical user flows", () => {
  test("homepage loads", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Preppy Losers/i);
  });

  test("shop page loads", async ({ page }) => {
    await page.goto("/shop");
    await expect(page.locator("body")).toBeVisible();
  });

  test("login page loads", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: /sign in/i })).toBeVisible();
  });

  test("signup page loads", async ({ page }) => {
    await page.goto("/signup");
    await expect(page.getByRole("heading", { name: /create account/i })).toBeVisible();
  });

  test("legal pages are accessible", async ({ page }) => {
    const legalPaths = [
      "/privacy-policy",
      "/terms-and-conditions",
      "/refund-policy",
      "/shipping-policy",
    ];

    for (const path of legalPaths) {
      await page.goto(path);
      await expect(page.locator("article, main")).toBeVisible();
    }
  });

  test("health endpoint responds", async ({ request }) => {
    const response = await request.get("/api/health");
    expect([200, 503]).toContain(response.status());
    const body = await response.json();
    expect(body).toHaveProperty("status");
  });

  test("checkout redirects unauthenticated users to login", async ({ page }) => {
    await page.goto("/checkout");
    await expect(page).toHaveURL(/\/login/);
  });
});
