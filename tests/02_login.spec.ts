import { test } from "@playwright/test";
import { LoginPage } from "../support/pageMethods/login";

test.describe("Login Test Cases", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("Login with valid credentials", async ({ page }) => {
    await new LoginPage(page).loginWithValidCredentials();
  });

  test("Login fails with invalid password", async ({ page }) => {
    await new LoginPage(page).loginWithInvalidPassword();
  });

  test("Login fails with empty credentials", async ({ page }) => {
    await new LoginPage(page).loginWithEmptyCredentials();
  });

  test("Login fails with invalid email format", async ({ page }) => {
    await new LoginPage(page).loginWithInvalidEmailFormat();
  });

  test("User can log out after login", async ({ page }) => {
    await new LoginPage(page).loginThenLogout();
  });

  test("Recover password for registered user", async ({ page }) => {
    await new LoginPage(page).recoverPasswordForRegisteredUser();
  });

  test("Password recovery requires email", async ({ page }) => {
    await new LoginPage(page).verifyPasswordRecoveryRequiresEmail();
  });
});
