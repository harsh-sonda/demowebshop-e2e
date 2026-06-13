import { expect, Locator, Page } from "@playwright/test";
import {
  clickWebElement,
  inputField,
  visibilityOfElement,
} from "../utils/generalPlaywrightMethod";
import projects from "../testData/projects.json";
import { NavigationPage } from "./navigation";

export class NewsletterPage {
  readonly page: Page;
  readonly navigationPage: NavigationPage;
  readonly emailInput: Locator;
  readonly subscribeButton: Locator;
  readonly resultBlock: Locator;

  constructor(page: Page) {
    this.page = page;
    this.navigationPage = new NavigationPage(page);
    this.emailInput = page.locator("#newsletter-email");
    this.subscribeButton = page.locator("#newsletter-subscribe-button");
    this.resultBlock = page.locator("#newsletter-result-block");
  }

  async subscribeWithValidEmail(email: string): Promise<void> {
    await this.navigationPage.goHome();
    await inputField(this.emailInput, email);
    await clickWebElement(this.subscribeButton);

    await visibilityOfElement(this.resultBlock);
    await expect(this.resultBlock).toContainText(projects.newsletter.successMessage);
  }

  async subscribeWithInvalidEmail(email: string): Promise<void> {
    await this.navigationPage.goHome();
    await inputField(this.emailInput, email);
    await clickWebElement(this.subscribeButton);

    await visibilityOfElement(this.resultBlock);
    await expect(this.resultBlock).toContainText(
      projects.newsletter.invalidEmailMessage
    );
  }
}
