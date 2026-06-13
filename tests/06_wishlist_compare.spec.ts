import { test } from "@playwright/test";
import { ComparePage } from "../support/pageMethods/compare";
import { WishlistPage } from "../support/pageMethods/wishlist";
import catalogData from "../support/testData/catalogData.json";

test.describe("Wishlist and Compare Test Cases", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("Add product to wishlist", async ({ page }) => {
    await new WishlistPage(page).addProductAndVerify(
      catalogData.giftCardProduct
    );
  });

  test("Remove product from wishlist", async ({ page }) => {
    await new WishlistPage(page).removeProduct(catalogData.giftCardProduct);
  });

  test("Move wishlist product to cart", async ({ page }) => {
    await new WishlistPage(page).moveProductToCart(catalogData.giftCardProduct);
  });

  test("Add products to compare list", async ({ page }) => {
    await new ComparePage(page).addProductsAndVerify(
      catalogData.compareProducts
    );
  });

  test("Clear compare list", async ({ page }) => {
    await new ComparePage(page).clearCompareList(catalogData.compareProducts);
  });
});
