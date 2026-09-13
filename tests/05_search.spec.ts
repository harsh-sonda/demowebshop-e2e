import { test } from "@playwright/test";
import { SearchPage } from "../support/pageMethods/search";
import searchData from "../support/testData/searchData.json";

test.describe("Search Test Cases", () => {
  let searchPage: SearchPage;

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    searchPage = new SearchPage(page);
  });

  test("Search from header returns matching products", async () => {
    await searchPage.searchFromHeader(
      searchData.headerSearch.keyword,
      searchData.headerSearch.expectedProduct
    );
  });

  test("Search shows no results for unmatched keyword", async () => {
    await searchPage.verifyNoResults(searchData.noResults.keyword);
  });

  test("Advanced search filters by category, subcategory, and price", async () => {
    await searchPage.advancedSearch({
      ...searchData.advanced,
      includeSubcategories: true,
    });
  });

  test("Advanced search can include product descriptions", async () => {
    await searchPage.advancedSearch({
      ...searchData.descriptionSearch,
      includeSubcategories: true,
      searchDescriptions: true,
    });
  });
});
