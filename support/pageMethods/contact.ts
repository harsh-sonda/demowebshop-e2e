import { expect, Locator, Page } from "@playwright/test";
import {
  clickWebElement,
  inputField,
  visibilityOfElement,
} from "../utils/generalPlaywrightMethod";
import projects from "../testData/projects.json";
import { NavigationPage } from "./navigation";

export interface ContactData {
  fullName: string;
  email: string;
  enquiry: string;
}

export class ContactPage {
  readonly page: Page;
  readonly navigationPage: NavigationPage;
  readonly fullNameInput: Locator;
  readonly emailInput: Locator;
  readonly enquiryInput: Locator;
  readonly submitButton: Locator;
  readonly fieldValidationErrors: Locator;

  constructor(page: Page) {
    this.page = page;
    this.navigationPage = new NavigationPage(page);
    this.fullNameInput = page.locator("#FullName");
    this.emailInput = page.locator("#Email");
    this.enquiryInput = page.locator("#Enquiry");
    this.submitButton = page.locator("input[name='send-email']");
    this.fieldValidationErrors = page.locator(".field-validation-error");
  }

  async submitContactForm(contact: ContactData): Promise<void> {
    await this.navigationPage.openFooterLink("Contact us");
    await visibilityOfElement(
      this.page.getByRole("heading", { name: projects.contact.pageTitle })
    );

    await inputField(this.fullNameInput, contact.fullName);
    await inputField(this.emailInput, contact.email);
    await inputField(this.enquiryInput, contact.enquiry);
    await clickWebElement(this.submitButton);

    await visibilityOfElement(this.page.getByText(projects.contact.successMessage));
  }

  async verifyRequiredFieldValidation(): Promise<void> {
    await this.navigationPage.openFooterLink("Contact us");
    await clickWebElement(this.submitButton);

    await expect(this.fieldValidationErrors.first()).toBeVisible();
  }
}
