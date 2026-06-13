import { expect, Locator, Page } from "@playwright/test";
import {
  assertPageUrl,
  clickWebElement,
  generateRandomEmail,
  generateRandomName,
  inputField,
  visibilityOfElement,
} from "../utils/generalPlaywrightMethod";
import registerData from "../testData/registerData.json";
import projects from "../testData/projects.json";
import {
  RegisteredUser,
  saveRegisteredUser,
} from "../utils/credentialStore";
import { NavigationPage } from "./navigation";

export type RegisterUserResult = Pick<
  RegisteredUser,
  "email" | "password" | "firstName" | "lastName" | "gender"
>;

export class RegisterPage {
  readonly page: Page;
  readonly navigationPage: NavigationPage;
  readonly pageHeading: Locator;
  readonly genderMale: Locator;
  readonly genderFemale: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly registerButton: Locator;
  readonly registerLink: Locator;
  readonly logoutLink: Locator;
  readonly successMessage: Locator;
  readonly validationSummary: Locator;

  constructor(page: Page) {
    this.page = page;
    this.navigationPage = new NavigationPage(page);
    this.pageHeading = page.getByRole("heading", {
      name: projects.register.pageTitle,
    });
    this.genderMale = page.locator("#gender-male");
    this.genderFemale = page.locator("#gender-female");
    this.firstNameInput = page.locator("#FirstName");
    this.lastNameInput = page.locator("#LastName");
    this.emailInput = page.locator("#Email");
    this.passwordInput = page.locator("#Password");
    this.confirmPasswordInput = page.locator("#ConfirmPassword");
    this.registerButton = page.locator("#register-button");
    this.registerLink = page
      .locator(".header-links")
      .getByRole("link", { name: "Register" });
    this.logoutLink = page
      .locator(".header-links")
      .getByRole("link", { name: "Log out" });
    this.successMessage = page.getByText(projects.register.successMessage);
    this.validationSummary = page.getByText(
      projects.register.passwordMismatchMessage
    );
  }

  async verifyRegisterPageElements(): Promise<void> {
    await clickWebElement(this.registerLink);
    await assertPageUrl(this.page, /\/register$/);
    await visibilityOfElement(this.pageHeading);
    await visibilityOfElement(this.firstNameInput);
    await visibilityOfElement(this.lastNameInput);
    await visibilityOfElement(this.emailInput);
    await visibilityOfElement(this.passwordInput);
    await visibilityOfElement(this.confirmPasswordInput);
    await visibilityOfElement(this.registerButton);
  }

  async registerNewUser(
    email?: string,
    password?: string,
    firstName?: string,
    lastName?: string
  ): Promise<RegisterUserResult> {
    await this.verifyRegisterPageElements();

    const userEmail =
      email ?? process.env.REGISTER_EMAIL ?? generateRandomEmail();
    const userPassword =
      password ?? process.env.REGISTER_PASSWORD ?? registerData.password;
    const userFirstName = firstName ?? generateRandomName("First");
    const userLastName = lastName ?? generateRandomName("Last");
    const gender = registerData.gender;

    await this.fillRegistrationForm(
      userEmail,
      userPassword,
      userPassword,
      userFirstName,
      userLastName,
      gender
    );
    await clickWebElement(this.registerButton);

    await visibilityOfElement(this.successMessage);
    await assertPageUrl(this.page, /registerresult/);

    return {
      email: userEmail,
      password: userPassword,
      firstName: userFirstName,
      lastName: userLastName,
      gender,
    };
  }

  async registerNewUserWithValidData(): Promise<void> {
    const user = await this.registerNewUser(
      generateRandomEmail(),
      registerData.password
    );

    saveRegisteredUser(user);
  }

  async registerWithInvalidData(
    email: string,
    password: string,
    confirmPassword: string,
    expectedMessage = projects.register.passwordMismatchMessage
  ): Promise<void> {
    await this.verifyRegisterPageElements();

    await this.fillRegistrationForm(email, password, confirmPassword);
    await clickWebElement(this.registerButton);

    await visibilityOfElement(this.page.getByText(expectedMessage).first());
    await expect(this.successMessage).not.toBeVisible();
  }

  async registerWithRequiredFieldsMissing(): Promise<void> {
    await this.verifyRegisterPageElements();
    await clickWebElement(this.registerButton);

    for (const message of projects.register.requiredFieldMessages) {
      await visibilityOfElement(this.page.getByText(message).first());
    }
    await expect(this.successMessage).not.toBeVisible();
  }

  async registerWithInvalidEmail(): Promise<void> {
    await this.registerWithInvalidData(
      "not-an-email",
      registerData.password,
      registerData.password,
      projects.register.invalidEmailMessage
    );
  }

  async registerWithPasswordMismatch(): Promise<void> {
    await this.registerWithInvalidData(
      generateRandomEmail(),
      registerData.password,
      `${registerData.password}Mismatch`,
      projects.register.passwordMismatchMessage
    );
  }

  async registerWithDuplicateEmail(): Promise<void> {
    const email = generateRandomEmail();
    const password = registerData.password;

    await this.registerNewUser(email, password);
    await this.logout();
    await this.verifyRegisterPageElements();
    await this.fillRegistrationForm(email, password, password);
    await clickWebElement(this.registerButton);

    await visibilityOfElement(
      this.page.getByText(projects.register.duplicateEmailMessage).first()
    );
    await expect(this.successMessage).not.toBeVisible();
  }

  async logout(): Promise<void> {
    if (await this.logoutLink.isVisible()) {
      await clickWebElement(this.logoutLink);
      await expect(this.logoutLink).not.toBeVisible();
    }
  }

  private async fillRegistrationForm(
    email: string,
    password: string,
    confirmPassword: string,
    firstName = generateRandomName("First"),
    lastName = generateRandomName("Last"),
    gender = registerData.gender
  ): Promise<void> {
    if (gender === "Male") {
      await clickWebElement(this.genderMale);
    } else {
      await clickWebElement(this.genderFemale);
    }

    await inputField(this.firstNameInput, firstName);
    await inputField(this.lastNameInput, lastName);
    await inputField(this.emailInput, email);
    await inputField(this.passwordInput, password);
    await inputField(this.confirmPasswordInput, confirmPassword);
  }
}

