import { test } from "@playwright/test";
import { RegisterPage } from "../support/PageMethod/register";
import { generateRandomEmail } from "../support/utils/misc/helper";
import { saveRegisteredUser } from "../support/utils/misc/credentialStore";
import registerData from "../support/testData/registerData.json";

test.describe("Register Test Cases", () => {
  test.beforeEach(async ({ page }) => {
    const registerPage = new RegisterPage(page);
    await registerPage.verifyRegisterPageElements();
  });

  test("Register a new user with valid data", async ({ page }) => {
    const registerPage = new RegisterPage(page);
    const user = await registerPage.registerNewUser(
      generateRandomEmail(),
      registerData.password
    );

    saveRegisteredUser(user);
  });
});
