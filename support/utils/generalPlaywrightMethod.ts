import { expect, Locator, Page } from "@playwright/test";

export async function inputField(
  locator: Locator,
  value: string,
  options?: { clear?: boolean }
): Promise<void> {
  await locator.waitFor({ state: "visible" });
  if (options?.clear !== false) {
    await locator.clear();
  }
  await locator.fill(value);
}

export async function clickWebElement(locator: Locator): Promise<void> {
  await locator.waitFor({ state: "visible" });
  await locator.click();
}

export async function visibilityOfElement(locator: Locator): Promise<void> {
  await expect(locator).toBeVisible();
}

export async function assertPageUrl(
  page: Page,
  expectedUrl: string | RegExp
): Promise<void> {
  await expect(page).toHaveURL(expectedUrl);
}

export function generateRandomEmail(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `qa.user.${timestamp}.${random}@example.com`;
}

export function generateRandomName(prefix: string): string {
  const random = Math.floor(Math.random() * 10000);
  return `${prefix}${random}`;
}
