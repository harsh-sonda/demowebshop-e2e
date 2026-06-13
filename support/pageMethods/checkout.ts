import { expect, Locator, Page } from "@playwright/test";
import {
  assertPageUrl,
  clickWebElement,
  inputField,
  visibilityOfElement,
} from "../utils/generalPlaywrightMethod";
import projects from "../testData/projects.json";

export interface BillingAddress {
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

export interface CreditCardPayment {
  method: string;
  creditCardType: string;
  cardholderName: string;
  cardNumber: string;
  expireMonth: string;
  expireYear: string;
  cardCode: string;
}

export interface OrderResult {
  successMessage: string;
  orderNumber: string;
}

export class CheckoutPage {
  readonly page: Page;
  readonly checkoutAsGuestButton: Locator;
  readonly pageHeading: Locator;
  readonly billingFirstNameInput: Locator;
  readonly billingLastNameInput: Locator;
  readonly billingEmailInput: Locator;
  readonly billingCompanyInput: Locator;
  readonly billingCountrySelect: Locator;
  readonly billingCityInput: Locator;
  readonly billingAddress1Input: Locator;
  readonly billingAddress2Input: Locator;
  readonly billingZipPostalCodeInput: Locator;
  readonly billingPhoneNumberInput: Locator;
  readonly billingFaxNumberInput: Locator;
  readonly billingContinueButton: Locator;
  readonly shippingAddressContinueButton: Locator;
  readonly shippingMethodContinueButton: Locator;
  readonly paymentMethodContinueButton: Locator;
  readonly paymentInfoContinueButton: Locator;
  readonly confirmOrderButton: Locator;
  readonly orderSuccessMessage: Locator;
  readonly orderNumber: Locator;
  readonly fieldValidationErrors: Locator;

  constructor(page: Page) {
    this.page = page;
    this.checkoutAsGuestButton = page.locator(
      "input[value='Checkout as Guest']"
    );
    this.pageHeading = page.getByRole("heading", {
      name: projects.order.checkoutPageTitle,
    });
    this.billingFirstNameInput = page.locator(
      "#BillingNewAddress_FirstName"
    );
    this.billingLastNameInput = page.locator("#BillingNewAddress_LastName");
    this.billingEmailInput = page.locator("#BillingNewAddress_Email");
    this.billingCompanyInput = page.locator("#BillingNewAddress_Company");
    this.billingCountrySelect = page.locator("#BillingNewAddress_CountryId");
    this.billingCityInput = page.locator("#BillingNewAddress_City");
    this.billingAddress1Input = page.locator("#BillingNewAddress_Address1");
    this.billingAddress2Input = page.locator("#BillingNewAddress_Address2");
    this.billingZipPostalCodeInput = page.locator(
      "#BillingNewAddress_ZipPostalCode"
    );
    this.billingPhoneNumberInput = page.locator(
      "#BillingNewAddress_PhoneNumber"
    );
    this.billingFaxNumberInput = page.locator("#BillingNewAddress_FaxNumber");
    this.billingContinueButton = page.locator(
      "#billing-buttons-container input[value='Continue']"
    );
    this.shippingAddressContinueButton = page.locator(
      "#shipping-buttons-container input[value='Continue']"
    );
    this.shippingMethodContinueButton = page.locator(
      "#shipping-method-buttons-container input[value='Continue']"
    );
    this.paymentMethodContinueButton = page.locator(
      "#payment-method-buttons-container input[value='Continue']"
    );
    this.paymentInfoContinueButton = page.locator(
      "#payment-info-buttons-container input[value='Continue']"
    );
    this.confirmOrderButton = page.locator(
      "#confirm-order-buttons-container input[value='Confirm']"
    );
    this.orderSuccessMessage = page.getByText(
      projects.order.orderSuccessMessage
    );
    this.orderNumber = page
      .locator(".order-completed .details li")
      .filter({ hasText: "Order number:" });
    this.fieldValidationErrors = page.locator(".field-validation-error");
  }

  async startGuestCheckout(): Promise<void> {
    await clickWebElement(this.checkoutAsGuestButton);
    await assertPageUrl(this.page, /\/onepagecheckout$/);
    await visibilityOfElement(this.pageHeading);
  }

  async verifyCheckoutPage(): Promise<void> {
    await assertPageUrl(this.page, /\/onepagecheckout$/);
    await visibilityOfElement(this.pageHeading);
  }

  async fillBillingAddress(address: BillingAddress): Promise<void> {
    await inputField(this.billingFirstNameInput, address.firstName);
    await inputField(this.billingLastNameInput, address.lastName);
    await inputField(this.billingEmailInput, address.email);
    await inputField(this.billingCompanyInput, address.company);
    await this.billingCountrySelect.selectOption(address.countryValue);
    await inputField(this.billingCityInput, address.city);
    await inputField(this.billingAddress1Input, address.address1);
    await inputField(this.billingAddress2Input, address.address2);
    await inputField(
      this.billingZipPostalCodeInput,
      address.zipPostalCode
    );
    await inputField(this.billingPhoneNumberInput, address.phoneNumber);
    await inputField(this.billingFaxNumberInput, address.faxNumber);
  }

  async continueFromBillingAddress(): Promise<void> {
    await clickWebElement(this.billingContinueButton);
    await expect
      .poll(
        async () =>
          (await this.shippingAddressContinueButton.isVisible()) ||
          (await this.shippingMethodContinueButton.isVisible()),
        { timeout: 30000 }
      )
      .toBe(true);
  }

  async verifyBillingAddressValidation(): Promise<void> {
    await clickWebElement(this.billingContinueButton);
    await expect(this.fieldValidationErrors.first()).toContainText(
      projects.order.billingRequiredMessage
    );
  }

  async continueWithBillingAsShippingAddress(): Promise<void> {
    if (await this.shippingMethodContinueButton.isVisible()) {
      return;
    }

    await clickWebElement(this.shippingAddressContinueButton);
    await visibilityOfElement(this.shippingMethodContinueButton);
  }

  async selectShippingMethod(methodName: string): Promise<void> {
    const shippingMethod = this.page
      .locator("#checkout-shipping-method-load li")
      .filter({ hasText: methodName })
      .locator("input[name='shippingoption']");

    await clickWebElement(shippingMethod);
    await expect(shippingMethod).toBeChecked();
    await clickWebElement(this.shippingMethodContinueButton);
    await visibilityOfElement(this.paymentMethodContinueButton);
  }

  async selectPaymentMethod(
    methodName: string,
    expectsCreditCardInfo = methodName === "Credit Card"
  ): Promise<void> {
    const paymentMethod = this.page
      .locator("#checkout-payment-method-load li")
      .filter({ hasText: methodName })
      .locator("input[name='paymentmethod']");

    await clickWebElement(paymentMethod);
    await expect(paymentMethod).toBeChecked();
    await clickWebElement(this.paymentMethodContinueButton);

    if (expectsCreditCardInfo) {
      await visibilityOfElement(this.page.locator("#CardholderName"));
    } else {
      await visibilityOfElement(this.paymentInfoContinueButton);
    }
  }

  async fillCreditCardPayment(payment: CreditCardPayment): Promise<void> {
    await this.page
      .locator("#CreditCardType")
      .selectOption(payment.creditCardType);
    await inputField(
      this.page.locator("#CardholderName"),
      payment.cardholderName
    );
    await inputField(this.page.locator("#CardNumber"), payment.cardNumber);
    await this.page.locator("#ExpireMonth").selectOption(payment.expireMonth);
    await this.page.locator("#ExpireYear").selectOption(payment.expireYear);
    await inputField(this.page.locator("#CardCode"), payment.cardCode);
  }

  async continueFromPaymentInformation(): Promise<void> {
    await clickWebElement(this.paymentInfoContinueButton);
    await visibilityOfElement(this.confirmOrderButton);
  }

  async verifyInvalidPaymentInformation(): Promise<void> {
    await clickWebElement(this.paymentInfoContinueButton);
    await visibilityOfElement(
      this.page.getByText(projects.order.paymentValidationMessage).first()
    );
  }

  async confirmOrder(): Promise<OrderResult> {
    await clickWebElement(this.confirmOrderButton);
    await assertPageUrl(this.page, /\/checkout\/completed/);
    await visibilityOfElement(this.orderSuccessMessage);
    await expect(this.orderNumber).toContainText("Order number:");

    return {
      successMessage:
        (await this.orderSuccessMessage.textContent())?.trim() ?? "",
      orderNumber: (await this.orderNumber.textContent())?.trim() ?? "",
    };
  }
}
