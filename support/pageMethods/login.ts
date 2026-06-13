import { expect, Locator, Page } from "@playwright/test";
import {
  assertPageUrl,
  clickWebElement,
  inputField,
  visibilityOfElement,
} from "../utils/generalPlaywrightMethod";
import projects from "../testData/projects.json";
import registerData from "../testData/registerData.json";
import { loadRegisteredUser } from "../utils/credentialStore";
import { generateRandomEmail } from "../utils/helper";
import { NavigationPage } from "./navigation";
import { RegisterPage } from "./register";

export class LoginPage {
  readonly page: Page;
  readonly navigationPage: NavigationPage;
  readonly pageHeading: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly rememberMeCheckbox: Locator;
  readonly loginButton: Locator;
  readonly loginLink: Locator;
  readonly registerLink: Locator;
  readonly accountLink: Locator;
  readonly logoutLink: Locator;
  readonly validationSummary: Locator;
  readonly forgotPasswordLink: Locator;
  readonly passwordRecoveryEmailInput: Locator;
  readonly recoverButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.navigationPage = new NavigationPage(page);
    this.pageHeading = page.getByRole("heading", {
      name: projects.login.pageTitle,
    });
    this.emailInput = page.getByLabel("Email:");
    this.passwordInput = page.getByLabel("Password:");
    this.rememberMeCheckbox = page.getByLabel("Remember me?");
    this.loginButton = page.getByRole("button", { name: "Log in" });
    this.loginLink = page
      .locator(".header-links")
      .getByRole("link", { name: "Log in" });
    this.registerLink = page.getByRole("link", { name: "Register" });
    this.accountLink = page
      .locator(".header-links")
      .getByRole("link", { name: projects.login.accountLinkText });
    this.logoutLink = page
      .locator(".header-links")
      .getByRole("link", { name: "Log out" });
    this.validationSummary = page.locator(".validation-summary-errors");
    this.forgotPasswordLink = page.getByRole("link", {
      name: "Forgot password?",
    });
    this.passwordRecoveryEmailInput = page.locator("#Email");
    this.recoverButton = page.locator("input[name='send-email']");
  }

  private getCredentials(email?: string, password?: string): {
    email: string;
    password: string;
  } {
    const storedUser = loadRegisteredUser();

    return {
      email:
        email ?? process.env.REGISTER_EMAIL ?? storedUser?.email ?? "",
      password:
        password ?? process.env.REGISTER_PASSWORD ?? storedUser?.password ?? "",
    };
  }

  async verifyLoginPageElements(): Promise<void> {
    await clickWebElement(this.loginLink);
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

  async loginWithValidCredentials(): Promise<void> {
    await this.verifyLoginPageElements();
    await this.logout();

    const registerPage = new RegisterPage(this.page);
    const credentials = await registerPage.registerNewUser(
      generateRandomEmail(),
      registerData.password
    );

    await this.logout();
    await clickWebElement(this.loginLink);
    await this.loginIntoApplication(
      credentials.email,
      credentials.password
    );
  }

  async loginWithInvalidPassword(): Promise<void> {
    await this.verifyLoginPageElements();
    await this.logout();
    await this.verifyInvalidLogin("bad@example.com", "wrong");
  }

  async loginWithEmptyCredentials(): Promise<void> {
    await this.verifyLoginPageElements();
    await this.logout();
    await clickWebElement(this.loginButton);

    await visibilityOfElement(this.validationSummary);
    await expect(this.validationSummary).toContainText(
      projects.login.invalidLoginMessage
    );
    await expect(this.logoutLink).not.toBeVisible();
  }

  async loginWithInvalidEmailFormat(): Promise<void> {
    await this.verifyLoginPageElements();
    await this.logout();

    await inputField(this.emailInput, "not-an-email");
    await inputField(this.passwordInput, registerData.password);
    await clickWebElement(this.loginButton);

    await visibilityOfElement(
      this.page.getByText("Please enter a valid email address.").first()
    );
    await expect(this.logoutLink).not.toBeVisible();
  }

  async loginThenLogout(): Promise<void> {
    await this.loginWithValidCredentials();
    await this.logout();

    await visibilityOfElement(this.loginLink);
    await expect(this.logoutLink).not.toBeVisible();
  }

  async recoverPasswordForRegisteredUser(): Promise<void> {
    await this.verifyLoginPageElements();
    await this.logout();

    const registerPage = new RegisterPage(this.page);
    const user = await registerPage.registerNewUser(
      generateRandomEmail(),
      registerData.password
    );

    await this.logout();
    await clickWebElement(this.loginLink);
    await clickWebElement(this.forgotPasswordLink);
    await this.verifyPasswordRecoveryPage();
    await inputField(this.passwordRecoveryEmailInput, user.email);
    await clickWebElement(this.recoverButton);

    await visibilityOfElement(
      this.page.getByText(projects.passwordRecovery.successMessage).first()
    );
  }

  async verifyPasswordRecoveryRequiresEmail(): Promise<void> {
    await clickWebElement(this.loginLink);
    await clickWebElement(this.forgotPasswordLink);
    await this.verifyPasswordRecoveryPage();
    await clickWebElement(this.recoverButton);

    await visibilityOfElement(
      this.page.getByText(projects.passwordRecovery.emailRequiredMessage).first()
    );
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

  private async verifyPasswordRecoveryPage(): Promise<void> {
    await assertPageUrl(this.page, /\/passwordrecovery$/);
    await visibilityOfElement(
      this.page.getByRole("heading", {
        name: projects.passwordRecovery.pageTitle,
      })
    );
    await visibilityOfElement(this.passwordRecoveryEmailInput);
    await visibilityOfElement(this.recoverButton);
  }
}

