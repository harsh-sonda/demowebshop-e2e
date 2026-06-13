import { expect, Locator, Page } from "@playwright/test";
import {
  clickWebElement,
  inputField,
  visibilityOfElement,
} from "../utils/generalPlaywrightMethod";
import projects from "../testData/projects.json";
import { NavigationPage } from "./navigation";

export interface AdvancedSearchCriteria {
  keyword: string;
  category?: string;
  manufacturer?: string;
  priceFrom?: string;
  priceTo?: string;
  expectedProduct: string;
  includeSubcategories?: boolean;
  searchDescriptions?: boolean;
}

export class SearchPage {
  readonly page: Page;
  readonly navigationPage: NavigationPage;
  readonly headerSearchInput: Locator;
  readonly headerSearchButton: Locator;
  readonly keywordInput: Locator;
  readonly advancedSearchCheckbox: Locator;
  readonly categorySelect: Locator;
  readonly subcategoryCheckbox: Locator;
  readonly manufacturerSelect: Locator;
  readonly priceFromInput: Locator;
  readonly priceToInput: Locator;
  readonly descriptionsCheckbox: Locator;
  readonly searchButton: Locator;
  readonly noResultsMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.navigationPage = new NavigationPage(page);
    this.headerSearchInput = page.locator("#small-searchterms");
    this.headerSearchButton = page.locator(".search-box-button");
    this.keywordInput = page.locator("#Q");
    this.advancedSearchCheckbox = page.locator("#As");
    this.categorySelect = page.locator("#Cid");
    this.subcategoryCheckbox = page.locator("#Isc");
    this.manufacturerSelect = page.locator("#Mid");
    this.priceFromInput = page.locator("#Pf");
    this.priceToInput = page.locator("#Pt");
    this.descriptionsCheckbox = page.locator("#Sid");
    this.searchButton = page.locator(".search-input input[type='submit']");
    this.noResultsMessage = page.getByText(projects.search.noResultsMessage);
  }

  async searchFromHeader(
    keyword: string,
    expectedProduct: string
  ): Promise<void> {
    await inputField(this.headerSearchInput, keyword);
    await clickWebElement(this.headerSearchButton);

    await this.verifySearchResults(expectedProduct);
  }

  async verifyNoResults(keyword: string): Promise<void> {
    await this.navigationPage.openFooterLink("Search");
    await inputField(this.keywordInput, keyword);
    await clickWebElement(this.searchButton);

    await visibilityOfElement(this.noResultsMessage);
  }

  async advancedSearch(criteria: AdvancedSearchCriteria): Promise<void> {
    await this.navigationPage.openFooterLink("Search");
    await inputField(this.keywordInput, criteria.keyword);

    if (!(await this.advancedSearchCheckbox.isChecked())) {
      await clickWebElement(this.advancedSearchCheckbox);
    }

    if (criteria.category) {
      await this.categorySelect.selectOption({ label: criteria.category });
    }

    if (criteria.includeSubcategories) {
      await this.subcategoryCheckbox.check();
    }

    if (criteria.manufacturer) {
      await this.manufacturerSelect.selectOption({
        label: criteria.manufacturer,
      });
    }

    if (criteria.priceFrom) {
      await inputField(this.priceFromInput, criteria.priceFrom);
    }

    if (criteria.priceTo) {
      await inputField(this.priceToInput, criteria.priceTo);
    }

    if (criteria.searchDescriptions) {
      await this.descriptionsCheckbox.check();
    }

    await clickWebElement(this.searchButton);
    await this.verifySearchResults(criteria.expectedProduct);
  }

  private async verifySearchResults(expectedProduct: string): Promise<void> {
    await expect(this.page).toHaveURL(/\/search/);
    await visibilityOfElement(
      this.page.getByRole("heading", { name: projects.search.pageTitle })
    );
    await visibilityOfElement(
      this.page.getByRole("link", { name: expectedProduct, exact: true })
    );
  }
}
