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
  let contactPage: ContactPage;
  let contentPage: ContentPage;
  let newsletterPage: NewsletterPage;
  let pollPage: PollPage;
  let productPage: ProductPage;
  let registerPage: RegisterPage;

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    contactPage = new ContactPage(page);
    contentPage = new ContentPage(page);
    newsletterPage = new NewsletterPage(page);
    pollPage = new PollPage(page);
    productPage = new ProductPage(page);
    registerPage = new RegisterPage(page);
  });

  test("Submit contact us form", async () => {
    await contactPage.submitContactForm(siteData.contact);
  });

  test("Contact us form validates required fields", async () => {
    await contactPage.verifyRequiredFieldValidation();
  });

  test("Subscribe to newsletter with valid email", async () => {
    await newsletterPage.subscribeWithValidEmail(generateRandomEmail());
  });

  test("Newsletter rejects invalid email", async () => {
    await newsletterPage.subscribeWithInvalidEmail(
      siteData.newsletter.invalidEmail
    );
  });

  test("Vote in community poll", async () => {
    await registerPage.registerNewUser(
      generateRandomEmail(),
      registerData.password
    );
    await pollPage.voteInCommunityPoll();
  });

  test("Recently viewed products shows visited product", async () => {
    await contentPage.verifyRecentlyViewedProduct(catalogData.bookProduct.name);
  });

  test("New products page displays products", async () => {
    await contentPage.verifyNewProductsPage();
  });

  test("Logged-in user can submit a product review", async () => {
    await registerPage.registerNewUser(
      generateRandomEmail(),
      registerData.password
    );
    await productPage.submitReview(siteData.review);
  });

  test("Product review requires title", async () => {
    await registerPage.registerNewUser(
      generateRandomEmail(),
      registerData.password
    );
    await productPage.verifyReviewRequiresTitle(siteData.review);
  });

  test("Product review requires text", async () => {
    await registerPage.registerNewUser(
      generateRandomEmail(),
      registerData.password
    );
    await productPage.verifyReviewRequiresText(siteData.review);
  });

  test("Footer information links open expected pages", async () => {
    await contentPage.verifyFooterInformationLinks(siteData.contentLinks);
  });
});
