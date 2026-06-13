import { expect, Page } from "@playwright/test";
import { CartPage } from "./cart";
import { CatalogPage } from "./catalog";
import {
  BillingAddress,
  CheckoutPage,
  CreditCardPayment,
  OrderResult,
} from "./checkout";
import { RegisterPage } from "./register";
import orderData from "../testData/orderData.json";
import projects from "../testData/projects.json";
import registerData from "../testData/registerData.json";
import { generateRandomEmail } from "../utils/helper";

export class OrderPage {
  readonly page: Page;
  readonly catalogPage: CatalogPage;
  readonly cartPage: CartPage;
  readonly checkoutPage: CheckoutPage;

  constructor(page: Page) {
    this.page = page;
    this.catalogPage = new CatalogPage(page);
    this.cartPage = new CartPage(page);
    this.checkoutPage = new CheckoutPage(page);
  }

  async createGuestOrderWithCreditCardPayment(): Promise<void> {
    const orderResult = await this.createGuestOrderWithCreditCardPaymentResult();

    this.verifyOrderResult(orderResult);
  }

  async createGuestOrderWithCreditCardPaymentResult(): Promise<OrderResult> {
    await this.addConfiguredBookAndStartGuestCheckout();

    return this.completeCreditCardCheckout(this.buildBillingAddress());
  }

  async createGuestOrderWithShippingMethod(
    shippingMethod: string
  ): Promise<void> {
    await this.addConfiguredBookAndStartGuestCheckout();

    const orderResult = await this.completeCreditCardCheckout(
      this.buildBillingAddress(),
      orderData.payment,
      shippingMethod
    );

    this.verifyOrderResult(orderResult);
  }

  async createGuestOrderWithPaymentMethod(
    paymentMethod: string
  ): Promise<void> {
    await this.addConfiguredBookAndStartGuestCheckout();

    const orderResult = await this.completeCheckoutWithPaymentMethod(
      this.buildBillingAddress(),
      paymentMethod
    );

    this.verifyOrderResult(orderResult);
  }

  async verifyGuestCheckoutRequiresBillingAddress(): Promise<void> {
    await this.addConfiguredBookAndStartGuestCheckout();

    await this.checkoutPage.verifyBillingAddressValidation();
  }

  async verifyGuestCheckoutRejectsInvalidCreditCard(): Promise<void> {
    await this.addConfiguredBookAndStartGuestCheckout();
    await this.checkoutPage.fillBillingAddress(this.buildBillingAddress());
    await this.checkoutPage.continueFromBillingAddress();
    await this.checkoutPage.continueWithBillingAsShippingAddress();
    await this.checkoutPage.selectShippingMethod(orderData.shippingMethod);
    await this.checkoutPage.selectPaymentMethod(orderData.payment.method);
    await this.checkoutPage.fillCreditCardPayment({
      ...orderData.payment,
      cardNumber: "123",
    });

    await this.checkoutPage.verifyInvalidPaymentInformation();
  }

  async createLoggedInOrderWithCreditCardPayment(): Promise<string> {
    const registerPage = new RegisterPage(this.page);
    const user = await registerPage.registerNewUser(
      generateRandomEmail(),
      registerData.password
    );

    await this.catalogPage.addProductToCart(
      orderData.product.categoryName,
      orderData.product.name
    );
    await this.cartPage.acceptTermsAndCheckout(/\/onepagecheckout$/);
    await this.checkoutPage.verifyCheckoutPage();

    const orderResult = await this.completeCreditCardCheckout(
      this.buildBillingAddress(user.email)
    );

    this.verifyOrderResult(orderResult);
    return orderResult.orderNumber.replace("Order number:", "").trim();
  }

  async verifyCartIsEmptyAfterSuccessfulOrder(): Promise<void> {
    await this.createGuestOrderWithCreditCardPayment();
    await this.cartPage.verifyCartIsEmpty();
  }

  private async addConfiguredBookAndStartGuestCheckout(): Promise<void> {
    await this.catalogPage.addProductToCart(
      orderData.product.categoryName,
      orderData.product.name
    );
    await this.cartPage.acceptTermsAndCheckout();
    await this.checkoutPage.startGuestCheckout();
  }

  private async completeCreditCardCheckout(
    billingAddress: BillingAddress,
    payment: CreditCardPayment = orderData.payment,
    shippingMethod = orderData.shippingMethod
  ): Promise<OrderResult> {
    await this.checkoutPage.fillBillingAddress(billingAddress);
    await this.checkoutPage.continueFromBillingAddress();
    await this.checkoutPage.continueWithBillingAsShippingAddress();
    await this.checkoutPage.selectShippingMethod(shippingMethod);
    await this.checkoutPage.selectPaymentMethod(payment.method);
    await this.checkoutPage.fillCreditCardPayment(payment);
    await this.checkoutPage.continueFromPaymentInformation();

    return this.checkoutPage.confirmOrder();
  }

  private async completeCheckoutWithPaymentMethod(
    billingAddress: BillingAddress,
    paymentMethod: string
  ): Promise<OrderResult> {
    await this.checkoutPage.fillBillingAddress(billingAddress);
    await this.checkoutPage.continueFromBillingAddress();
    await this.checkoutPage.continueWithBillingAsShippingAddress();
    await this.checkoutPage.selectShippingMethod(orderData.shippingMethod);
    await this.checkoutPage.selectPaymentMethod(paymentMethod, false);
    await this.checkoutPage.continueFromPaymentInformation();

    return this.checkoutPage.confirmOrder();
  }

  private buildBillingAddress(email = generateRandomEmail()): BillingAddress {
    return {
      ...orderData.billingAddress,
      email,
    };
  }

  private verifyOrderResult(orderResult: OrderResult): void {
    expect(orderResult.successMessage).toBe(projects.order.orderSuccessMessage);
    expect(orderResult.orderNumber).toMatch(/^Order number:\s+\d+$/);
  }
}
