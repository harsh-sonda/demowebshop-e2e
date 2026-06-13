import { expect, Locator, Page } from "@playwright/test";
import {
  clickWebElement,
  inputField,
  visibilityOfElement,
} from "../utils/generalPlaywrightMethod";
import accountData from "../testData/accountData.json";
import projects from "../testData/projects.json";
import registerData from "../testData/registerData.json";
import { generateRandomEmail } from "../utils/helper";
import { NavigationPage } from "./navigation";
import { OrderPage } from "./order";
import { RegisterPage } from "./register";

export class AccountPage {
  readonly page: Page;
  readonly navigationPage: NavigationPage;
  readonly accountLink: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly femaleGender: Locator;
  readonly saveButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.navigationPage = new NavigationPage(page);
    this.accountLink = page.locator(".header-links a[href='/customer/info']");
    this.firstNameInput = page.locator("#FirstName");
    this.lastNameInput = page.locator("#LastName");
    this.femaleGender = page.locator("#gender-female");
    this.saveButton = page.locator("input[name='save-info-button']");
  }

  async updateCustomerInfo(): Promise<void> {
    await this.registerUser();
    await this.openCustomerInfo();

    await clickWebElement(this.femaleGender);
    await inputField(this.firstNameInput, accountData.customer.firstName);
    await inputField(this.lastNameInput, accountData.customer.lastName);
    await clickWebElement(this.saveButton);

    await expect(this.firstNameInput).toHaveValue(accountData.customer.firstName);
    await expect(this.lastNameInput).toHaveValue(accountData.customer.lastName);
  }

  async verifyAccountNavigationLinks(): Promise<void> {
    await this.registerUser();
    await this.openCustomerInfo();

    const accountNavigation = this.page.locator(".block-account-navigation");

    await clickWebElement(
      accountNavigation.getByRole("link", { name: "Addresses" })
    );
    await visibilityOfElement(
      this.page.getByRole("heading", { name: projects.account.addressesTitle })
    );

    await clickWebElement(accountNavigation.getByRole("link", { name: "Orders" }));
    await visibilityOfElement(
      this.page.getByRole("heading", { name: projects.account.ordersTitle })
    );

    await clickWebElement(
      accountNavigation.getByRole("link", { name: "Customer info" })
    );
    await visibilityOfElement(
      this.page.getByRole("heading", {
        name: projects.account.customerInfoTitle,
      })
    );
  }

  async verifyLoggedInOrderHistory(): Promise<void> {
    const orderNumber = await new OrderPage(this.page)
      .createLoggedInOrderWithCreditCardPayment();

    await this.navigationPage.openFooterLink("Orders");
    await visibilityOfElement(
      this.page.getByRole("heading", { name: projects.account.ordersTitle })
    );
    await visibilityOfElement(this.page.getByText(orderNumber).first());
  }

  private async openCustomerInfo(): Promise<void> {
    await clickWebElement(this.accountLink);
    await visibilityOfElement(
      this.page.getByRole("heading", {
        name: projects.account.customerInfoTitle,
      })
    );
  }

  private async registerUser(): Promise<void> {
    await new RegisterPage(this.page).registerNewUser(
      generateRandomEmail(),
      registerData.password
    );
  }
}
