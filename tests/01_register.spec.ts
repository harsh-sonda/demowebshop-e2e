import { test } from "@playwright/test";
import { RegisterPage } from "../support/pageMethods/register";

test.describe("Register Test Cases", () => {
  let registerPage: RegisterPage;

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    registerPage = new RegisterPage(page);
  });

  test("Register a new user with valid data", async () => {
    await registerPage.registerNewUserWithValidData();
  });

  test("Register shows required field validation", async () => {
    await registerPage.registerWithRequiredFieldsMissing();
  });

  test("Register fails with invalid email", async () => {
    await registerPage.registerWithInvalidEmail();
  });

  test("Register fails when passwords do not match", async () => {
    await registerPage.registerWithPasswordMismatch();
  });

  test("Register fails with duplicate email", async () => {
    await registerPage.registerWithDuplicateEmail();
  });
});
