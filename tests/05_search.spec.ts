import { test } from "@playwright/test";
import { SearchPage } from "../support/pageMethods/search";
import searchData from "../support/testData/searchData.json";

test.describe("Search Test Cases", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("Search from header returns matching products", async ({ page }) => {
    await new SearchPage(page).searchFromHeader(
      searchData.headerSearch.keyword,
      searchData.headerSearch.expectedProduct
    );
  });

  test("Search shows no results for unmatched keyword", async ({ page }) => {
    await new SearchPage(page).verifyNoResults(searchData.noResults.keyword);
  });

  test("Advanced search filters by category, subcategory, and price", async ({
    page,
  }) => {
    await new SearchPage(page).advancedSearch({
      ...searchData.advanced,
      includeSubcategories: true,
    });
  });

  test("Advanced search can include product descriptions", async ({ page }) => {
    await new SearchPage(page).advancedSearch({
      ...searchData.descriptionSearch,
      includeSubcategories: true,
      searchDescriptions: true,
    });
  });
});
