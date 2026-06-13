import { expect, Locator, Page } from "@playwright/test";
import {
  clickWebElement,
  visibilityOfElement,
} from "../utils/generalPlaywrightMethod";
import projects from "../testData/projects.json";
import { NavigationPage } from "./navigation";

export class PollPage {
  readonly page: Page;
  readonly navigationPage: NavigationPage;
  readonly pollBlock: Locator;
  readonly voteButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.navigationPage = new NavigationPage(page);
    this.pollBlock = page.locator(".poll");
    this.voteButton = page.locator("#vote-poll-1");
  }

  async voteInCommunityPoll(): Promise<void> {
    await this.navigationPage.goHome();
    await expect(this.pollBlock).toContainText(projects.poll.question);

    await this.pollBlock.getByLabel("Excellent").check();
    await clickWebElement(this.voteButton);

    await visibilityOfElement(this.pollBlock.locator(".poll-results"));
  }
}
