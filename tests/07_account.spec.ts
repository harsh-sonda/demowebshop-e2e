import { test } from "@playwright/test";
import { AccountPage } from "../support/pageMethods/account";
import { AddressPage } from "../support/pageMethods/address";

test.describe("Account Test Cases", () => {
  let accountPage: AccountPage;
  let addressPage: AddressPage;

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    accountPage = new AccountPage(page);
    addressPage = new AddressPage(page);
  });

  test("Update customer information", async () => {
    await accountPage.updateCustomerInfo();
  });

  test("Add, edit, and delete an address", async () => {
    await addressPage.addEditAndDeleteAddress();
  });

  test("Verify account navigation links", async () => {
    await accountPage.verifyAccountNavigationLinks();
  });

  test("Logged-in order appears in order history", async () => {
    await accountPage.verifyLoggedInOrderHistory();
  });
});
