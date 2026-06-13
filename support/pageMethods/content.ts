import { expect, Page } from "@playwright/test";
import { visibilityOfElement } from "../utils/generalPlaywrightMethod";
import { NavigationPage } from "./navigation";
import { ProductPage } from "./product";

export interface ContentLink {
  name: string;
  path: string;
  heading: string;
}

export class ContentPage {
  readonly page: Page;
  readonly navigationPage: NavigationPage;
  readonly productPage: ProductPage;

  constructor(page: Page) {
    this.page = page;
    this.navigationPage = new NavigationPage(page);
    this.productPage = new ProductPage(page);
  }

  async verifyFooterInformationLinks(links: ContentLink[]): Promise<void> {
    for (const link of links) {
      await this.navigationPage.goHome();
      await this.navigationPage.openFooterLink(link.name);

      await expect(this.page).toHaveURL(new RegExp(`${link.path}$`));
      await visibilityOfElement(
        this.page.getByRole("heading", { name: link.heading })
      );
    }
  }

  async verifyRecentlyViewedProduct(
    productName: string
  ): Promise<void> {
    await this.productPage.openProduct(productName);
    await this.navigationPage.openFooterLink("Recently viewed products");

    await visibilityOfElement(
      this.page.getByRole("heading", { name: "Recently viewed products" })
    );
    await visibilityOfElement(
      this.page.getByRole("link", { name: productName, exact: true })
    );
  }

  async verifyNewProductsPage(): Promise<void> {
    await this.navigationPage.openFooterLink("New products");

    await visibilityOfElement(
      this.page.getByRole("heading", { name: "New products" })
    );
    await expect(this.page.locator(".product-item").first()).toBeVisible();
  }
}
