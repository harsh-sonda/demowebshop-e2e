import { expect, Locator, Page } from "@playwright/test";
import {
  assertPageUrl,
  clickWebElement,
  generateRandomEmail,
  generateRandomName,
  inputField,
  visibilityOfElement,
} from "../utils/misc/generalPlaywrightMethod";
import registerData from "../testData/registerData.json";
import projects from "../testData/projects.json";
import { RegisteredUser } from "../utils/misc/credentialStore";

export type RegisterUserResult = Pick<
  RegisteredUser,
  "email" | "password" | "firstName" | "lastName" | "gender"
>;

export class RegisterPage {
  readonly page: Page;
  readonly pageHeading: Locator;
  readonly genderMale: Locator;
  readonly genderFemale: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly registerButton: Locator;
  readonly successMessage: Locator;
  readonly validationSummary: Locator;

  constructor(page: Page) {
    this.page = page;
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
    this.successMessage = page.getByText(projects.register.successMessage);
    this.validationSummary = page.getByText(
      projects.register.passwordMismatchMessage
    );
  }

  async verifyRegisterPageElements(): Promise<void> {
    await this.page.goto("/register");
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
    await this.page.goto("/register");

    const userEmail = email ?? generateRandomEmail();
    const userPassword = password ?? registerData.password;
    const userFirstName = firstName ?? generateRandomName("First");
    const userLastName = lastName ?? generateRandomName("Last");
    const gender = registerData.gender;

    if (gender === "Male") {
      await clickWebElement(this.genderMale);
    } else {
      await clickWebElement(this.genderFemale);
    }

    await inputField(this.firstNameInput, userFirstName);
    await inputField(this.lastNameInput, userLastName);
    await inputField(this.emailInput, userEmail);
    await inputField(this.passwordInput, userPassword);
    await inputField(this.confirmPasswordInput, userPassword);
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

  async registerWithInvalidData(
    email: string,
    password: string,
    confirmPassword: string
  ): Promise<void> {
    await this.page.goto("/register");

    await inputField(this.firstNameInput, generateRandomName("First"));
    await inputField(this.lastNameInput, generateRandomName("Last"));
    await inputField(this.emailInput, email);
    await inputField(this.passwordInput, password);
    await inputField(this.confirmPasswordInput, confirmPassword);
    await clickWebElement(this.registerButton);

    await visibilityOfElement(this.validationSummary);
    await expect(this.successMessage).not.toBeVisible();
  }
}
