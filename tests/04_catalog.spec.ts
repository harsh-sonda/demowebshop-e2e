import { test } from "@playwright/test";
import { CatalogPage } from "../support/pageMethods/catalog";
import { ProductPage } from "../support/pageMethods/product";
import catalogData from "../support/testData/catalogData.json";

test.describe("Catalog Test Cases", () => {
  let catalogPage: CatalogPage;
  let productPage: ProductPage;

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    catalogPage = new CatalogPage(page);
    productPage = new ProductPage(page);
  });

  test("Browse main categories", async () => {
    for (const category of catalogData.categories) {
      await catalogPage.verifyCategoryNavigation(category);
    }
  });

  test("Browse selected subcategories", async () => {
    for (const category of catalogData.subcategories) {
      await catalogPage.verifySubcategoryNavigation(category);
    }
  });

  test("Change catalog sort, view mode, and page size", async () => {
    await catalogPage.verifyListingControls();
  });

  test("Sort products by price", async () => {
    await catalogPage.verifyPriceSorting();
  });

  test("Open product details", async () => {
    await productPage.verifyProductDetails(catalogData.bookProduct);
  });

  test("Configure computer product and add to cart", async () => {
    await productPage.configureComputerAndAddToCart(
      catalogData.computerProduct
    );
  });

  test("Fill virtual gift card fields and add to cart", async () => {
    await productPage.fillGiftCardAndAddToCart(catalogData.giftCardProduct);
  });
});
