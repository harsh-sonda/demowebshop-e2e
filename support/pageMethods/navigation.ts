import { Locator, Page } from "@playwright/test";
import {
  clickWebElement,
  inputField,
} from "../utils/generalPlaywrightMethod";

export class NavigationPage {
  readonly page: Page;
  readonly logoLink: Locator;
  readonly searchInput: Locator;
  readonly searchButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.logoLink = page.getByRole("link", { name: "Tricentis Demo Web Shop" });
    this.searchInput = page.locator("#small-searchterms");
    this.searchButton = page.getByRole("button", { name: "Search" });
  }

  async goHome(): Promise<void> {
    await clickWebElement(this.logoLink);
  }

  async openHeaderLink(name: string | RegExp): Promise<void> {
    await clickWebElement(
      this.page.locator(".header-links").getByRole("link", { name })
    );
  }

  async openTopMenuLink(name: string): Promise<void> {
    await clickWebElement(
      this.page
        .locator(".header-menu")
        .getByRole("link", { name, exact: true })
        .first()
    );
  }

  async openFooterLink(name: string): Promise<void> {
    await clickWebElement(
      this.page.locator(".footer").getByRole("link", { name, exact: true })
    );
  }

  async openAccountNavigationLink(name: string): Promise<void> {
    await clickWebElement(
      this.page
        .locator(".block-account-navigation")
        .getByRole("link", { name, exact: true })
    );
  }

  async openProductBySearch(productName: string): Promise<void> {
    await inputField(this.searchInput, productName);
    await clickWebElement(this.searchButton);
    await clickWebElement(
      this.page.getByRole("link", { name: productName, exact: true }).first()
    );
  }
}
