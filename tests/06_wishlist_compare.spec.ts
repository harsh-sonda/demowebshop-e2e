import { test } from "@playwright/test";
import { ComparePage } from "../support/pageMethods/compare";
import { WishlistPage } from "../support/pageMethods/wishlist";
import catalogData from "../support/testData/catalogData.json";

test.describe("Wishlist and Compare Test Cases", () => {
  let comparePage: ComparePage;
  let wishlistPage: WishlistPage;

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    comparePage = new ComparePage(page);
    wishlistPage = new WishlistPage(page);
  });

  test("Add product to wishlist", async () => {
    await wishlistPage.addProductAndVerify(catalogData.giftCardProduct);
  });

  test("Remove product from wishlist", async () => {
    await wishlistPage.removeProduct(catalogData.giftCardProduct);
  });

  test("Move wishlist product to cart", async () => {
    await wishlistPage.moveProductToCart(catalogData.giftCardProduct);
  });

  test("Add products to compare list", async () => {
    await comparePage.addProductsAndVerify(catalogData.compareProducts);
  });

  test("Clear compare list", async () => {
    await comparePage.clearCompareList(catalogData.compareProducts);
  });
});
