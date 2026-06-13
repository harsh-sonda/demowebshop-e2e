import { expect, Locator, Page } from "@playwright/test";
import {
  clickWebElement,
  inputField,
  visibilityOfElement,
} from "../utils/generalPlaywrightMethod";
import { generateRandomEmail } from "../utils/helper";
import projects from "../testData/projects.json";
import { NavigationPage } from "./navigation";

export interface ProductDetailExpectation {
  name: string;
  path: string;
  price?: string;
}

export interface ComputerConfiguration {
  name: string;
  path: string;
  processor: string;
  ram: string;
  hdd: string;
  os: string;
  software: string[];
}

export interface GiftCardProduct {
  name: string;
  path: string;
  recipientName: string;
  recipientEmail: string;
  senderName: string;
  message: string;
}

export interface ReviewData {
  productName: string;
  title: string;
  text: string;
  rating: string;
}

export class ProductPage {
  readonly page: Page;
  readonly navigationPage: NavigationPage;
  readonly productName: Locator;
  readonly productPrice: Locator;
  readonly successNotification: Locator;
  readonly addToCartButton: Locator;
  readonly addToWishlistButton: Locator;
  readonly addToCompareButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.navigationPage = new NavigationPage(page);
    this.productName = page.locator(".product-name h1");
    this.productPrice = page.locator(".product-price");
    this.successNotification = page.locator(".bar-notification.success");
    this.addToCartButton = page.locator(".add-to-cart-button").first();
    this.addToWishlistButton = page.locator(".add-to-wishlist-button").first();
    this.addToCompareButton = page.locator(".add-to-compare-list-button").first();
  }

  async openProduct(productName: string): Promise<void> {
    await this.navigationPage.openProductBySearch(productName);
    await visibilityOfElement(this.productName);
  }

  async verifyProductDetails(
    product: ProductDetailExpectation
  ): Promise<void> {
    await this.openProduct(product.name);

    await expect(this.productName).toContainText(product.name);
    if (product.price) {
      await expect(this.productPrice).toContainText(product.price);
    }
    await visibilityOfElement(
      this.page.locator(".product-review-links a").first()
    );
    await visibilityOfElement(
      this.page.getByRole("link", { name: "Add your review" })
    );
  }

  async addCurrentProductToCart(productName: string): Promise<void> {
    await clickWebElement(this.addToCartButton);
    await this.expectSuccessNotification(
      "The product has been added to your shopping cart"
    );
    await expect(this.page.locator(".header-links .cart-qty")).toContainText(
      /[1-9]/
    );
  }

  async configureComputerAndAddToCart(
    product: ComputerConfiguration
  ): Promise<void> {
    await this.openProduct(product.name);

    await this.selectOptionContaining(
      this.page.locator("#product_attribute_16_5_4"),
      product.processor
    );
    await this.selectOptionContaining(
      this.page.locator("#product_attribute_16_6_5"),
      product.ram
    );
    await this.checkAttributeOption(product.hdd);
    await this.checkAttributeOption(product.os);

    for (const software of product.software) {
      await this.checkAttributeOption(software);
    }

    await this.addCurrentProductToCart(product.name);
  }

  async fillGiftCardAndAddToCart(product: GiftCardProduct): Promise<void> {
    await this.openProduct(product.name);

    await inputField(
      this.page.locator("#giftcard_2_RecipientName"),
      product.recipientName
    );
    await inputField(
      this.page.locator("#giftcard_2_RecipientEmail"),
      product.recipientEmail
    );
    await inputField(
      this.page.locator("#giftcard_2_SenderName"),
      product.senderName
    );
    await inputField(
      this.page.locator("#giftcard_2_SenderEmail"),
      generateRandomEmail()
    );
    await inputField(this.page.locator("#giftcard_2_Message"), product.message);

    await this.addCurrentProductToCart(product.name);
  }

  async addProductToWishlist(productName: string): Promise<void> {
    await this.openProduct(productName);
    await this.fillGiftCardFieldsIfPresent();
    await clickWebElement(this.addToWishlistButton);
    await this.expectSuccessNotification(projects.wishlist.successMessage);
  }

  async addProductToCompareList(productName: string): Promise<void> {
    await this.openProduct(productName);
    await clickWebElement(this.addToCompareButton);
    await expect(this.page).toHaveURL(/\/compareproducts$/);
  }

  async submitReview(review: ReviewData): Promise<void> {
    await this.openReviewForm(review.productName);

    await this.fillReviewForm(review);
    await this.page.locator(`#addproductrating_${review.rating}`).check();
    await this.submitReviewButton(true);

    await expect(
      this.page.getByText("Product review is successfully added.").first()
    ).toBeVisible({ timeout: 60000 });
  }

  async verifyReviewRequiresTitle(review: ReviewData): Promise<void> {
    await this.openReviewForm(review.productName);
    await this.fillReviewForm({ ...review, title: "" });
    await this.submitReviewButton(true);

    await expect(
      this.page.getByText(projects.review.titleRequiredMessage).first()
    ).toBeVisible({ timeout: 60000 });
  }

  async verifyReviewRequiresText(review: ReviewData): Promise<void> {
    await this.openReviewForm(review.productName);
    await this.fillReviewForm({ ...review, text: "" });
    await this.submitReviewButton(true);

    await expect(
      this.page.getByText(projects.review.textRequiredMessage).first()
    ).toBeVisible({ timeout: 60000 });
  }

  private async expectSuccessNotification(message: string): Promise<void> {
    await expect(this.successNotification).toBeVisible();
    await expect(this.successNotification).toContainText(message);
  }

  private async openReviewForm(productName: string): Promise<void> {
    await this.openProduct(productName);

    await this.page
      .getByRole("link", { name: "Add your review" })
      .click({ noWaitAfter: true });
    await expect(this.page.locator("#AddProductReview_Title")).toBeVisible({
      timeout: 60000,
    });
  }

  private async fillReviewForm(review: ReviewData): Promise<void> {
    await inputField(this.page.locator("#AddProductReview_Title"), review.title);
    await inputField(
      this.page.locator("#AddProductReview_ReviewText"),
      review.text
    );
  }

  private async submitReviewButton(waitForNavigation = false): Promise<void> {
    await this.page.getByRole("button", { name: "Submit review" }).click({
      noWaitAfter: !waitForNavigation,
      timeout: waitForNavigation ? 60000 : undefined,
    });
  }

  private async fillGiftCardFieldsIfPresent(): Promise<void> {
    const recipientName = this.page.locator("#giftcard_2_RecipientName");

    if (!(await recipientName.isVisible())) {
      return;
    }

    await inputField(recipientName, "Wishlist Recipient");
    await inputField(
      this.page.locator("#giftcard_2_RecipientEmail"),
      "wishlist.recipient@example.com"
    );
    await inputField(this.page.locator("#giftcard_2_SenderName"), "Wishlist Sender");
    await inputField(
      this.page.locator("#giftcard_2_SenderEmail"),
      generateRandomEmail()
    );
  }

  private async selectOptionContaining(
    select: Locator,
    text: string
  ): Promise<void> {
    const option = select.locator("option").filter({ hasText: text }).first();
    const value = await option.getAttribute("value");

    if (!value) {
      throw new Error(`Could not find select option containing "${text}"`);
    }

    await select.selectOption(value);
  }

  private async checkAttributeOption(labelText: string): Promise<void> {
    const option = this.page
      .locator(".attributes li")
      .filter({ hasText: labelText })
      .locator("input")
      .first();

    await option.check();
    await expect(option).toBeChecked();
  }
}
