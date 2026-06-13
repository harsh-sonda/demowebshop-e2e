import { expect, Locator, Page } from "@playwright/test";
import {
  assertPageUrl,
  clickWebElement,
  inputField,
  visibilityOfElement,
} from "../utils/generalPlaywrightMethod";
import projects from "../testData/projects.json";
import { NavigationPage } from "./navigation";

export class CartPage {
  readonly page: Page;
  readonly navigationPage: NavigationPage;
  readonly cartLink: Locator;
  readonly pageHeading: Locator;
  readonly termsOfServiceCheckbox: Locator;
  readonly checkoutButton: Locator;
  readonly updateCartButton: Locator;
  readonly emptyCartMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.navigationPage = new NavigationPage(page);
    this.cartLink = page
      .locator(".header-links")
      .getByRole("link", { name: /Shopping cart/i });
    this.pageHeading = page.getByRole("heading", {
      name: projects.order.cartPageTitle,
    });
    this.termsOfServiceCheckbox = page.locator("#termsofservice");
    this.checkoutButton = page.locator("#checkout");
    this.updateCartButton = page.locator("input[name='updatecart']");
    this.emptyCartMessage = page.getByText(projects.cart.emptyCartMessage);
  }

  async verifyCartPageElements(): Promise<void> {
    await clickWebElement(this.cartLink);
    await assertPageUrl(this.page, /\/cart$/);
    await visibilityOfElement(this.pageHeading);
    await visibilityOfElement(this.termsOfServiceCheckbox);
    await visibilityOfElement(this.checkoutButton);
  }

  async acceptTermsAndCheckout(
    expectedUrl: RegExp = /\/login\/checkoutasguest/
  ): Promise<void> {
    await this.verifyCartPageElements();

    if (!(await this.termsOfServiceCheckbox.isChecked())) {
      await clickWebElement(this.termsOfServiceCheckbox);
    }

    await clickWebElement(this.checkoutButton);
    await assertPageUrl(this.page, expectedUrl);
  }

  async verifyProductInCart(productName: string): Promise<void> {
    await this.verifyCartPageElements();
    await visibilityOfElement(this.productRow(productName));
  }

  async updateProductQuantity(
    productName: string,
    quantity: string
  ): Promise<void> {
    await this.verifyCartPageElements();

    const row = this.productRow(productName);
    await inputField(row.locator("input.qty-input"), quantity);
    await clickWebElement(this.updateCartButton);

    await expect(row.locator("input.qty-input")).toHaveValue(quantity);
    await expect(this.cartLink).toContainText(`(${quantity})`);
  }

  async removeProductFromCart(productName: string): Promise<void> {
    await this.verifyCartPageElements();

    const row = this.productRow(productName);
    await row.locator("input[name='removefromcart']").check();
    await clickWebElement(this.updateCartButton);

    await visibilityOfElement(this.emptyCartMessage);
    await expect(this.cartLink).toContainText("(0)");
  }

  async verifyCheckoutRequiresTermsOfService(): Promise<void> {
    await this.verifyCartPageElements();

    if (await this.termsOfServiceCheckbox.isChecked()) {
      await clickWebElement(this.termsOfServiceCheckbox);
    }

    await clickWebElement(this.checkoutButton);
    await visibilityOfElement(
      this.page.getByText(projects.cart.termsOfServiceMessage).first()
    );
    await assertPageUrl(this.page, /\/cart$/);
  }

  async verifyCartIsEmpty(): Promise<void> {
    await this.navigationPage.openHeaderLink(/Shopping cart/i);
    await visibilityOfElement(this.emptyCartMessage);
    await expect(this.cartLink).toContainText("(0)");
  }

  private productRow(productName: string): Locator {
    return this.page.locator(".cart-item-row").filter({
      has: this.page.getByRole("link", { name: productName, exact: true }),
    });
  }
}
