import { test } from "@playwright/test";
import { CartPage } from "../support/pageMethods/cart";
import { CatalogPage } from "../support/pageMethods/catalog";
import { OrderPage } from "../support/pageMethods/order";
import orderData from "../support/testData/orderData.json";

test.describe("Create Order Test Cases", () => {
  let cartPage: CartPage;
  let catalogPage: CatalogPage;
  let orderPage: OrderPage;

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    cartPage = new CartPage(page);
    catalogPage = new CatalogPage(page);
    orderPage = new OrderPage(page);
  });

  test("Update product quantity in cart", async () => {
    await catalogPage.addProductToCart(
      orderData.product.categoryName,
      orderData.product.name
    );
    await cartPage.updateProductQuantity(orderData.product.name, "2");
  });

  test("Remove product from cart", async () => {
    await catalogPage.addProductToCart(
      orderData.product.categoryName,
      orderData.product.name
    );
    await cartPage.removeProductFromCart(orderData.product.name);
  });

  test("Checkout is blocked until terms of service are accepted", async () => {
    await catalogPage.addProductToCart(
      orderData.product.categoryName,
      orderData.product.name
    );
    await cartPage.verifyCheckoutRequiresTermsOfService();
  });

  test("Create a guest order with credit card payment", async () => {
    await orderPage.createGuestOrderWithCreditCardPayment();
  });

  for (const shippingMethod of orderData.shippingMethods) {
    test(`Create a guest order with ${shippingMethod} shipping`, async () => {
      await orderPage.createGuestOrderWithShippingMethod(shippingMethod);
    });
  }

  for (const paymentMethod of orderData.paymentMethods) {
    test(`Create a guest order with ${paymentMethod} payment`, async () => {
      await orderPage.createGuestOrderWithPaymentMethod(paymentMethod);
    });
  }

  test("Guest checkout validates missing billing address", async () => {
    await orderPage.verifyGuestCheckoutRequiresBillingAddress();
  });

  test("Guest checkout rejects invalid credit card", async () => {
    await orderPage.verifyGuestCheckoutRejectsInvalidCreditCard();
  });

  test("Cart is empty after successful order", async () => {
    await orderPage.verifyCartIsEmptyAfterSuccessfulOrder();
  });
});
