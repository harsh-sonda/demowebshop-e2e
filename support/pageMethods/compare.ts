import { expect, Page } from "@playwright/test";
import {
  clickWebElement,
  visibilityOfElement,
} from "../utils/generalPlaywrightMethod";
import projects from "../testData/projects.json";
import { ProductPage } from "./product";

export interface CompareProduct {
  name: string;
  path: string;
}

export class ComparePage {
  readonly page: Page;
  readonly productPage: ProductPage;

  constructor(page: Page) {
    this.page = page;
    this.productPage = new ProductPage(page);
  }

  async addProductsAndVerify(products: CompareProduct[]): Promise<void> {
    for (const product of products) {
      await this.productPage.addProductToCompareList(product.name);
    }

    await visibilityOfElement(
      this.page.getByRole("heading", { name: projects.compare.pageTitle })
    );

    for (const product of products) {
      await visibilityOfElement(
        this.page.getByRole("link", { name: product.name, exact: true })
      );
    }
  }

  async clearCompareList(products: CompareProduct[]): Promise<void> {
    await this.addProductsAndVerify(products);
    await clickWebElement(this.page.getByRole("link", { name: "Clear list" }));

    await expect(this.page).toHaveURL(/\/compareproducts$/);
    await visibilityOfElement(this.page.getByText(projects.compare.emptyMessage));
  }
}
