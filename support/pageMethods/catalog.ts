import { expect, Locator, Page } from "@playwright/test";
import {
  assertPageUrl,
  clickWebElement,
  visibilityOfElement,
} from "../utils/generalPlaywrightMethod";
import { NavigationPage } from "./navigation";

export interface CategoryExpectation {
  name: string;
  path: string;
  expectedProduct?: string;
  expectedSubcategory?: string;
}

export class CatalogPage {
  readonly page: Page;
  readonly navigationPage: NavigationPage;
  readonly cartQuantity: Locator;
  readonly viewModeSelect: Locator;
  readonly sortSelect: Locator;
  readonly pageSizeSelect: Locator;
  readonly productItems: Locator;

  constructor(page: Page) {
    this.page = page;
    this.navigationPage = new NavigationPage(page);
    this.cartQuantity = page.locator(".header-links .cart-qty");
    this.viewModeSelect = page.locator("#products-viewmode");
    this.sortSelect = page.locator("#products-orderby");
    this.pageSizeSelect = page.locator("#products-pagesize");
    this.productItems = page.locator(".product-item");
  }

  async addProductToCart(
    categoryName: string,
    productName: string
  ): Promise<void> {
    await clickWebElement(
      this.page
        .locator(".header-menu")
        .getByRole("link", { name: categoryName, exact: true })
    );

    const productItem = this.page.locator(".product-item").filter({
      has: this.page.getByRole("link", { name: productName, exact: true }),
    });
    const addToCartButton = productItem.locator(
      "input.product-box-add-to-cart-button"
    );

    await visibilityOfElement(productItem);
    await clickWebElement(addToCartButton);
    await expect(this.cartQuantity).toContainText(/[1-9]/);
  }

  async verifyCategoryNavigation(
    category: CategoryExpectation
  ): Promise<void> {
    await this.navigationPage.openTopMenuLink(category.name);

    await assertPageUrl(this.page, new RegExp(`${category.path}$`));
    await visibilityOfElement(
      this.page.getByRole("heading", { name: category.name, exact: true })
    );
    await this.verifyCategoryExpectedContent(category);
  }

  async verifySubcategoryNavigation(
    category: CategoryExpectation
  ): Promise<void> {
    await this.openSubcategory(category.name);
    await visibilityOfElement(
      this.page.getByRole("heading", { name: category.name, exact: true })
    );
    await this.verifyCategoryExpectedContent(category);
  }

  async verifyListingControls(): Promise<void> {
    await this.navigationPage.openTopMenuLink("Books");

    await Promise.all([
      this.page.waitForURL(/orderby=5/),
      this.sortSelect.selectOption({ label: "Name: A to Z" }),
    ]);
    await expect(this.productItems.first()).toContainText(
      "Computing and Internet"
    );

    await Promise.all([
      this.page.waitForURL(/viewmode=list/),
      this.viewModeSelect.selectOption({ label: "List" }),
    ]);
    await expect(this.page.locator(".product-list")).toBeVisible();

    await Promise.all([
      this.page.waitForURL(/pagesize=4/),
      this.pageSizeSelect.selectOption({ label: "4" }),
    ]);
    await expect(this.productItems).toHaveCount(4);
  }

  async verifyPriceSorting(): Promise<void> {
    await this.navigationPage.openTopMenuLink("Books");

    await Promise.all([
      this.page.waitForURL(/orderby=10/),
      this.sortSelect.selectOption({ label: "Price: Low to High" }),
    ]);
    await this.expectPricesSorted("ascending");

    await Promise.all([
      this.page.waitForURL(/orderby=11/),
      this.sortSelect.selectOption({ label: "Price: High to Low" }),
    ]);
    await this.expectPricesSorted("descending");
  }

  private async verifyCategoryExpectedContent(
    category: CategoryExpectation
  ): Promise<void> {
    if (category.expectedProduct) {
      await visibilityOfElement(
        this.productItems.getByRole("link", {
          name: category.expectedProduct,
          exact: true,
        }).first()
      );
    }

    if (category.expectedSubcategory) {
      await visibilityOfElement(
        this.page
          .locator(".sub-category-item")
          .getByRole("link", {
            name: category.expectedSubcategory,
            exact: true,
          })
          .first()
      );
    }
  }

  private async openSubcategory(categoryName: string): Promise<void> {
    await this.navigationPage.openTopMenuLink(
      this.parentCategoryFor(categoryName)
    );
    await clickWebElement(
      this.page
        .locator(".sub-category-item")
        .getByRole("link", { name: categoryName, exact: true })
        .first()
    );
  }

  private parentCategoryFor(categoryName: string): string {
    if (["Desktops", "Notebooks", "Accessories"].includes(categoryName)) {
      return "Computers";
    }

    if (["Camera, photo", "Cell phones"].includes(categoryName)) {
      return "Electronics";
    }

    throw new Error(`No parent category configured for "${categoryName}".`);
  }

  private async expectPricesSorted(
    direction: "ascending" | "descending"
  ): Promise<void> {
    const prices = await this.getVisibleActualPrices();
    const sortedPrices = [...prices].sort((first, second) =>
      direction === "ascending" ? first - second : second - first
    );

    expect(prices).toEqual(sortedPrices);
  }

  private async getVisibleActualPrices(): Promise<number[]> {
    const prices = await this.productItems
      .locator(".actual-price")
      .allTextContents();

    return prices.map((price) => Number(price.trim()));
  }
}
