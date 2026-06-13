import { test } from "@playwright/test";
import { RegisterPage } from "../support/pageMethods/register";

test.describe("Register Test Cases", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("Register a new user with valid data", async ({ page }) => {
    await new RegisterPage(page).registerNewUserWithValidData();
  });

  test("Register shows required field validation", async ({ page }) => {
    await new RegisterPage(page).registerWithRequiredFieldsMissing();
  });

  test("Register fails with invalid email", async ({ page }) => {
    await new RegisterPage(page).registerWithInvalidEmail();
  });

  test("Register fails when passwords do not match", async ({ page }) => {
    await new RegisterPage(page).registerWithPasswordMismatch();
  });

  test("Register fails with duplicate email", async ({ page }) => {
    await new RegisterPage(page).registerWithDuplicateEmail();
  });
});
