import { test } from "@playwright/test";
import { CartPage } from "../support/pageMethods/cart";
import { CatalogPage } from "../support/pageMethods/catalog";
import { OrderPage } from "../support/pageMethods/order";
import orderData from "../support/testData/orderData.json";

test.describe("Create Order Test Cases", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("Update product quantity in cart", async ({ page }) => {
    await new CatalogPage(page).addProductToCart(
      orderData.product.categoryName,
      orderData.product.name
    );
    await new CartPage(page).updateProductQuantity(orderData.product.name, "2");
  });

  test("Remove product from cart", async ({ page }) => {
    await new CatalogPage(page).addProductToCart(
      orderData.product.categoryName,
      orderData.product.name
    );
    await new CartPage(page).removeProductFromCart(orderData.product.name);
  });

  test("Checkout is blocked until terms of service are accepted", async ({
    page,
  }) => {
    await new CatalogPage(page).addProductToCart(
      orderData.product.categoryName,
      orderData.product.name
    );
    await new CartPage(page).verifyCheckoutRequiresTermsOfService();
  });

  test("Create a guest order with credit card payment", async ({ page }) => {
    await new OrderPage(page).createGuestOrderWithCreditCardPayment();
  });

  for (const shippingMethod of orderData.shippingMethods) {
    test(`Create a guest order with ${shippingMethod} shipping`, async ({
      page,
    }) => {
      await new OrderPage(page).createGuestOrderWithShippingMethod(
        shippingMethod
      );
    });
  }

  for (const paymentMethod of orderData.paymentMethods) {
    test(`Create a guest order with ${paymentMethod} payment`, async ({
      page,
    }) => {
      await new OrderPage(page).createGuestOrderWithPaymentMethod(paymentMethod);
    });
  }

  test("Guest checkout validates missing billing address", async ({ page }) => {
    await new OrderPage(page).verifyGuestCheckoutRequiresBillingAddress();
  });

  test("Guest checkout rejects invalid credit card", async ({ page }) => {
    await new OrderPage(page).verifyGuestCheckoutRejectsInvalidCreditCard();
  });

  test("Cart is empty after successful order", async ({ page }) => {
    await new OrderPage(page).verifyCartIsEmptyAfterSuccessfulOrder();
  });
});
