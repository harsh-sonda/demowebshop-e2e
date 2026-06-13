import { expect, Locator, Page } from "@playwright/test";
import {
  clickWebElement,
  visibilityOfElement,
} from "../utils/generalPlaywrightMethod";
import projects from "../testData/projects.json";
import { ProductPage } from "./product";

export interface WishlistProduct {
  name: string;
  path: string;
}

export class WishlistPage {
  readonly page: Page;
  readonly productPage: ProductPage;
  readonly wishlistLink: Locator;
  readonly updateWishlistButton: Locator;
  readonly addToCartButton: Locator;
  readonly emptyWishlistMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.productPage = new ProductPage(page);
    this.wishlistLink = page
      .locator(".header-links")
      .getByRole("link", { name: /Wishlist/i });
    this.updateWishlistButton = page.locator("input[name='updatecart']");
    this.addToCartButton = page.locator("input[name='addtocartbutton']");
    this.emptyWishlistMessage = page.getByText(projects.wishlist.emptyMessage);
  }

  async addProductAndVerify(product: WishlistProduct): Promise<void> {
    await this.productPage.addProductToWishlist(product.name);
    await this.openWishlist();
    await visibilityOfElement(this.productRow(product.name));
  }

  async removeProduct(product: WishlistProduct): Promise<void> {
    await this.addProductAndVerify(product);

    await this.productRow(product.name)
      .locator("input[name='removefromcart']")
      .check();
    await clickWebElement(this.updateWishlistButton);

    await visibilityOfElement(this.emptyWishlistMessage);
  }

  async moveProductToCart(product: WishlistProduct): Promise<void> {
    await this.addProductAndVerify(product);

    await this.productRow(product.name)
      .locator("input[name='addtocart']")
      .check();
    await clickWebElement(this.addToCartButton);

    await expect(this.page).toHaveURL(/\/cart$/);
    await visibilityOfElement(
      this.page.getByRole("link", { name: product.name, exact: true })
    );
  }

  private async openWishlist(): Promise<void> {
    await clickWebElement(this.wishlistLink);
    await expect(this.page).toHaveURL(/\/wishlist$/);
    await visibilityOfElement(
      this.page.getByRole("heading", { name: projects.wishlist.pageTitle })
    );
  }

  private productRow(productName: string): Locator {
    return this.page.locator(".cart-item-row").filter({
      has: this.page.getByRole("link", { name: productName, exact: true }),
    });
  }
}
