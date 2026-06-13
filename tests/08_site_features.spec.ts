import { test } from "@playwright/test";
import { ContactPage } from "../support/pageMethods/contact";
import { ContentPage } from "../support/pageMethods/content";
import { NewsletterPage } from "../support/pageMethods/newsletter";
import { PollPage } from "../support/pageMethods/poll";
import { ProductPage } from "../support/pageMethods/product";
import { RegisterPage } from "../support/pageMethods/register";
import catalogData from "../support/testData/catalogData.json";
import registerData from "../support/testData/registerData.json";
import siteData from "../support/testData/siteData.json";
import { generateRandomEmail } from "../support/utils/helper";

test.describe("Site Feature Test Cases", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("Submit contact us form", async ({ page }) => {
    await new ContactPage(page).submitContactForm(siteData.contact);
  });

  test("Contact us form validates required fields", async ({ page }) => {
    await new ContactPage(page).verifyRequiredFieldValidation();
  });

  test("Subscribe to newsletter with valid email", async ({ page }) => {
    await new NewsletterPage(page).subscribeWithValidEmail(generateRandomEmail());
  });

  test("Newsletter rejects invalid email", async ({ page }) => {
    await new NewsletterPage(page).subscribeWithInvalidEmail(
      siteData.newsletter.invalidEmail
    );
  });

  test("Vote in community poll", async ({ page }) => {
    await new RegisterPage(page).registerNewUser(
      generateRandomEmail(),
      registerData.password
    );
    await new PollPage(page).voteInCommunityPoll();
  });

  test("Recently viewed products shows visited product", async ({ page }) => {
    await new ContentPage(page).verifyRecentlyViewedProduct(
      catalogData.bookProduct.name
    );
  });

  test("New products page displays products", async ({ page }) => {
    await new ContentPage(page).verifyNewProductsPage();
  });

  test("Logged-in user can submit a product review", async ({ page }) => {
    await new RegisterPage(page).registerNewUser(
      generateRandomEmail(),
      registerData.password
    );
    await new ProductPage(page).submitReview(siteData.review);
  });

  test("Product review requires title", async ({ page }) => {
    await new RegisterPage(page).registerNewUser(
      generateRandomEmail(),
      registerData.password
    );
    await new ProductPage(page).verifyReviewRequiresTitle(siteData.review);
  });

  test("Product review requires text", async ({ page }) => {
    await new RegisterPage(page).registerNewUser(
      generateRandomEmail(),
      registerData.password
    );
    await new ProductPage(page).verifyReviewRequiresText(siteData.review);
  });

  test("Footer information links open expected pages", async ({ page }) => {
    await new ContentPage(page).verifyFooterInformationLinks(
      siteData.contentLinks
    );
  });
});
