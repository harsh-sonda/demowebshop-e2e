import { test } from "@playwright/test";
import { LoginPage } from "../support/pageMethods/login";

test.describe("Login Test Cases", () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    loginPage = new LoginPage(page);
  });

  test("Login with valid credentials", async () => {
    await loginPage.loginWithValidCredentials();
  });

  test("Login fails with invalid password", async () => {
    await loginPage.loginWithInvalidPassword();
  });

  test("Login fails with empty credentials", async () => {
    await loginPage.loginWithEmptyCredentials();
  });

  test("Login fails with invalid email format", async () => {
    await loginPage.loginWithInvalidEmailFormat();
  });

  test("User can log out after login", async () => {
    await loginPage.loginThenLogout();
  });

  test("Recover password for registered user", async () => {
    await loginPage.recoverPasswordForRegisteredUser();
  });

  test("Password recovery requires email", async () => {
    await loginPage.verifyPasswordRecoveryRequiresEmail();
  });
});
