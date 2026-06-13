import { test } from "@playwright/test";
import { LoginPage } from "../support/pageMethod/login";
import { RegisterPage } from "../support/pageMethod/register";
import registerData from "../support/testData/registerData.json";
import { generateRandomEmail } from "../support/utils/helper";

test.describe("Login Test Cases", () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.verifyLoginPageElements();
    await loginPage.logout();
  });

  test("Login with valid credentials", async ({ page }) => {
    const loginPage = new LoginPage(page);
    const registerPage = new RegisterPage(page);

    const credentials = await registerPage.registerNewUser(
      generateRandomEmail(),
      registerData.password
    );

    await loginPage.logout();
    await loginPage.page.goto("/login");
    await loginPage.loginIntoApplication(
      credentials.email,
      credentials.password
    );
  });

  test("Login fails with invalid password", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.verifyInvalidLogin("bad@example.com", "wrong");
  });
});
