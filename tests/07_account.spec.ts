import { test } from "@playwright/test";
import { AccountPage } from "../support/pageMethods/account";
import { AddressPage } from "../support/pageMethods/address";

test.describe("Account Test Cases", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("Update customer information", async ({ page }) => {
    await new AccountPage(page).updateCustomerInfo();
  });

  test("Add, edit, and delete an address", async ({ page }) => {
    await new AddressPage(page).addEditAndDeleteAddress();
  });

  test("Verify account navigation links", async ({ page }) => {
    await new AccountPage(page).verifyAccountNavigationLinks();
  });

  test("Logged-in order appears in order history", async ({ page }) => {
    await new AccountPage(page).verifyLoggedInOrderHistory();
  });
});
