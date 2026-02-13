# E2E Playwright Cucumber Test Setup

## Prerequisites
- **Node.js** (v18+ recommended, v24+ supported)
- **npm** (comes with Node.js)
- **Git** (to clone the repository)
- (Optional) **Chrome/Chromium** browser for headed runs

## 1. Clone the Repository
Clone the project to your local machine:
```bash
git clone <repo-url>
cd <repo-folder>/e2e-playwright-cucumber/e2e-playwright-cucumber
```

## 2. Install Dependencies
Install all required Node.js packages:
```bash
npm install
```

## 3. Install Playwright Browsers
Install Playwright's browser binaries:
```bash
npx playwright install
```
## 4. Run the Tests
From the `e2e-playwright-cucumber/e2e-playwright-cucumber` folder:
```bash
npm run test

## Troubleshooting
- If you see browser errors, run `npx playwright install` again.
- If TypeScript errors appear, ensure you are in the correct folder and have run `npm install`.
- For visual tests, the first run creates a baseline in `visual-baseline/`. Subsequent runs compare against it.


Just run `npm run test` and watch your tests execute.

Scenario: Marta chat interface - visual regression

For this application, I chose to create an automated visual test covering the most business-critical area: the AI chat interface. After logging in and selecting a card, I capture a visual snapshot when landing on the chat page and compare it against a baseline using a 10% threshold to allow minor browser rendering differences. When this threshold is not sufficient due to significantly larger or smaller monitor sizes, I either increase the threshold or update the visual baseline by removing the outdated screenshot from the project’s baseline folder. In a CI pipeline, I fix the browser viewport to a predefined resolution to remove local environment variability. I chose this visual approach to validate multiple components of the entire chat interface in a single check, avoiding reliance on flaky labels or dynamic IDs and making the test faster and more stable.


Scenario: Token usage when specific prompts are used in chat

For the second test, I chose to automate the visual behavior of the chat interface when submitting different types of prompts, specifically prompts that require token usage to proceed and prompts that do not. The test captures visual snapshots of the chat after sending these prompts and compares them against dedicated baselines to verify that the correct UI feedback is displayed in each case. I chose a visual approach to ensure that token-related indicators, warnings, or confirmation messages are clearly and consistently shown to the user, regardless of underlying implementation details. From a business perspective, this is critical because users must clearly understand when a request consumes tokens, representing real monetary value, versus when no token usage is required. Ensuring transparency around costs helps build user trust and directly contributes to a positive and reliable user experience.