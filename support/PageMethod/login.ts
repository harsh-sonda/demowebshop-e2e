import { expect, Locator, Page } from "@playwright/test";
import {
  assertPageUrl,
  clickWebElement,
  inputField,
  visibilityOfElement,
} from "../utils/misc/generalPlaywrightMethod";
import loginData from "../testData/loginData.json";
import projects from "../testData/projects.json";
import { loadRegisteredUser } from "../utils/misc/credentialStore";

export class LoginPage {
  readonly page: Page;
  readonly pageHeading: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly rememberMeCheckbox: Locator;
  readonly loginButton: Locator;
  readonly registerLink: Locator;
  readonly accountLink: Locator;
  readonly logoutLink: Locator;
  readonly validationSummary: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageHeading = page.getByRole("heading", {
      name: projects.login.pageTitle,
    });
    this.emailInput = page.getByLabel("Email:");
    this.passwordInput = page.getByLabel("Password:");
    this.rememberMeCheckbox = page.getByLabel("Remember me?");
    this.loginButton = page.getByRole("button", { name: "Log in" });
    this.registerLink = page.getByRole("link", { name: "Register" });
    this.accountLink = page
      .locator(".header-links")
      .getByRole("link", { name: projects.login.accountLinkText });
    this.logoutLink = page
      .locator(".header-links")
      .getByRole("link", { name: "Log out" });
    this.validationSummary = page.locator(".validation-summary-errors");
  }

  private getCredentials(email?: string, password?: string): {
    email: string;
    password: string;
  } {
    const storedUser = loadRegisteredUser();

    return {
      email:
        email ??
        process.env.REGISTER_EMAIL ??
        storedUser?.email ??
        loginData.email,
      password:
        password ??
        process.env.REGISTER_PASSWORD ??
        storedUser?.password ??
        loginData.password,
    };
  }

  async verifyLoginPageElements(): Promise<void> {
    await this.page.goto("/login");
    await assertPageUrl(this.page, /\/login$/);
    await visibilityOfElement(this.pageHeading);
    await visibilityOfElement(this.emailInput);
    await visibilityOfElement(this.passwordInput);
    await visibilityOfElement(this.loginButton);
    await visibilityOfElement(this.registerLink);
  }

  async loginIntoApplication(
    email?: string,
    password?: string
  ): Promise<void> {
    const credentials = this.getCredentials(email, password);

    await inputField(this.emailInput, credentials.email);
    await inputField(this.passwordInput, credentials.password);
    await clickWebElement(this.loginButton);

    await visibilityOfElement(this.logoutLink);
  }

  async verifyInvalidLogin(email: string, password: string): Promise<void> {
    await inputField(this.emailInput, email);
    await inputField(this.passwordInput, password);
    await clickWebElement(this.loginButton);

    await visibilityOfElement(this.validationSummary);
    await expect(this.validationSummary).toContainText(
      projects.login.invalidLoginMessage
    );
    await expect(this.logoutLink).not.toBeVisible();
  }

  async logout(): Promise<void> {
    if (await this.logoutLink.isVisible()) {
      await clickWebElement(this.logoutLink);
      await expect(this.logoutLink).not.toBeVisible();
    }
  }
}
