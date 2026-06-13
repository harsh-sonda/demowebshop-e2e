import { test } from "@playwright/test";
import { CatalogPage } from "../support/pageMethods/catalog";
import { ProductPage } from "../support/pageMethods/product";
import catalogData from "../support/testData/catalogData.json";

test.describe("Catalog Test Cases", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("Browse main categories", async ({ page }) => {
    const catalogPage = new CatalogPage(page);

    for (const category of catalogData.categories) {
      await catalogPage.verifyCategoryNavigation(category);
    }
  });

  test("Browse selected subcategories", async ({ page }) => {
    const catalogPage = new CatalogPage(page);

    for (const category of catalogData.subcategories) {
      await catalogPage.verifySubcategoryNavigation(category);
    }
  });

  test("Change catalog sort, view mode, and page size", async ({ page }) => {
    await new CatalogPage(page).verifyListingControls();
  });

  test("Sort products by price", async ({ page }) => {
    await new CatalogPage(page).verifyPriceSorting();
  });

  test("Open product details", async ({ page }) => {
    await new ProductPage(page).verifyProductDetails(catalogData.bookProduct);
  });

  test("Configure computer product and add to cart", async ({ page }) => {
    await new ProductPage(page).configureComputerAndAddToCart(
      catalogData.computerProduct
    );
  });

  test("Fill virtual gift card fields and add to cart", async ({ page }) => {
    await new ProductPage(page).fillGiftCardAndAddToCart(
      catalogData.giftCardProduct
    );
  });
});
