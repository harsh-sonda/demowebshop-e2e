import { Locator, Page } from "@playwright/test";
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
import { RegisterPage } from "./register";

export interface AddressData {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  countryValue: string;
  city: string;
  address1: string;
  address2: string;
  zipPostalCode: string;
  phoneNumber: string;
  faxNumber: string;
}

export class AddressPage {
  readonly page: Page;
  readonly navigationPage: NavigationPage;
  readonly addNewButton: Locator;
  readonly saveButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.navigationPage = new NavigationPage(page);
    this.addNewButton = page.getByRole("button", { name: "Add new" });
    this.saveButton = page.getByRole("button", { name: "Save" });
  }

  async addEditAndDeleteAddress(): Promise<void> {
    await this.registerUser();
    await this.openAddresses();
    await this.addAddress({
      ...accountData.address,
      email: generateRandomEmail(),
    });
    await this.editAddress();
    await this.deleteAddress();
  }

  private async openAddresses(): Promise<void> {
    await clickWebElement(this.page.locator(".header-links a[href='/customer/info']"));
    await this.navigationPage.openAccountNavigationLink("Addresses");
    await visibilityOfElement(
      this.page.getByRole("heading", { name: projects.account.addressesTitle })
    );
  }

  private async addAddress(address: AddressData): Promise<void> {
    await clickWebElement(this.addNewButton);
    await this.fillAddressForm(address);
    await clickWebElement(this.saveButton);

    await visibilityOfElement(this.page.getByText(address.city).first());
  }

  private async editAddress(): Promise<void> {
    await clickWebElement(this.page.locator(".edit-address-button").first());

    await inputField(
      this.page.locator("#Address_City"),
      accountData.editedAddress.city
    );
    await inputField(
      this.page.locator("#Address_Address1"),
      accountData.editedAddress.address1
    );
    await inputField(
      this.page.locator("#Address_ZipPostalCode"),
      accountData.editedAddress.zipPostalCode
    );
    await inputField(
      this.page.locator("#Address_PhoneNumber"),
      accountData.editedAddress.phoneNumber
    );
    await clickWebElement(this.saveButton);

    await visibilityOfElement(
      this.page.getByText(accountData.editedAddress.city).first()
    );
  }

  private async deleteAddress(): Promise<void> {
    const deleteButton = this.page
      .getByRole("button", { name: "Delete" })
      .first();
    const deleteAction = await deleteButton.getAttribute("onclick");
    const deletePath = deleteAction?.match(/'(\/customer\/addressdelete\/\d+)'/)?.[1];

    if (!deletePath) {
      throw new Error("Address delete URL was not available.");
    }

    this.page.once("dialog", async (dialog) => {
      await dialog.accept();
    });

    await Promise.all([
      this.page.waitForRequest((request) => request.url().includes(deletePath)),
      deleteButton.click({ noWaitAfter: true }),
    ]);
  }

  private async fillAddressForm(address: AddressData): Promise<void> {
    await inputField(this.page.locator("#Address_FirstName"), address.firstName);
    await inputField(this.page.locator("#Address_LastName"), address.lastName);
    await inputField(this.page.locator("#Address_Email"), address.email);
    await inputField(this.page.locator("#Address_Company"), address.company);
    await this.page.locator("#Address_CountryId").selectOption(address.countryValue);
    await inputField(this.page.locator("#Address_City"), address.city);
    await inputField(this.page.locator("#Address_Address1"), address.address1);
    await inputField(this.page.locator("#Address_Address2"), address.address2);
    await inputField(
      this.page.locator("#Address_ZipPostalCode"),
      address.zipPostalCode
    );
    await inputField(this.page.locator("#Address_PhoneNumber"), address.phoneNumber);
    await inputField(this.page.locator("#Address_FaxNumber"), address.faxNumber);
  }

  private async registerUser(): Promise<void> {
    await new RegisterPage(this.page).registerNewUser(
      generateRandomEmail(),
      registerData.password
    );
  }
}
