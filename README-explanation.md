

## Project Overview
This repository contains end-to-end (E2E) tests for the Cristina chat interface using Playwright and Cucumber. The tests cover login, chat interactions, visual regression, and UI navigation.

## Folder Structure

- `features/`  
  - `Chat-interface.feature`: Cucumber feature file describing chat scenarios.
  - `Chat-iteration.ts`: Step definitions for chat and login flows.
  - `README.md`: Feature-specific documentation.
- `src/`  
  - `pages/`: Page object models for UI components.
  - `steps/`: Step definitions for Cucumber scenarios.
  - `support/`: Hooks and world definitions for Cucumber.
  - `types/`: TypeScript declarations.
  - `utils/`: Utility scripts (e.g., visual regression, browser management).
- `playwright.config.ts`: Playwright configuration.
- `cucumber.js`: Cucumber configuration.
- `tsconfig.json`: TypeScript configuration.
- `reports/`: Test reports and screenshots.
- `playwright-report/`: Playwright HTML report.
- `test-results/`: Raw test results.
- `visual-baseline/`: Baseline images for visual regression.

## Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set credentials in `.env`:**
    - Add the following to your `.env` file (or set in CI/CD):
       - `ACCESS_KEY`
       - `USERNAME`
       - `PASSWORD`

    Example:
    ```env
    ACCESS_KEY=your-access-key
    USERNAME=your-username
    PASSWORD=your-password
    ```

    The feature files use empty strings for credentials (e.g., `And I enter username ""`). Step definitions will automatically use values from `.env`.

3. **Run tests:**
   ```bash
   npm run test
   ```

4. **View reports:**
   - Open `playwright-report/index.html` for Playwright report.
   - Open `reports/cucumber-html-report.html` for Cucumber report.

## Key Files

- `features/Chat-iteration.ts`: Step definitions for login, chat, and UI actions.
- `src/utils/visual-regression.ts`: Visual regression utilities.
- `src/support/world.ts`: Custom world for Cucumber steps.

## Contribution
- Fork the repository and create a branch for your feature or bugfix.
- Submit a pull request with a clear description.



Scenario: Marta chat interface - visual regression

For this application, I chose to create an automated visual test covering the most business-critical area: the AI chat interface. After logging in and selecting a card, I capture a visual snapshot when landing on the chat page and compare it against a baseline using a 10% threshold to allow minor browser rendering differences. When this threshold is not sufficient due to significantly larger or smaller monitor sizes, I either increase the threshold or update the visual baseline by removing the outdated screenshot from the project’s baseline folder. In a CI pipeline, I fix the browser viewport to a predefined resolution to remove local environment variability. I chose this visual approach to validate multiple components of the entire chat interface in a single check, avoiding reliance on flaky labels or dynamic IDs and making the test faster and more stable.


Scenario: Token usage when specific prompts are used in chat

For the second test, I chose to automate the visual behavior of the chat interface when submitting different types of prompts, specifically prompts that require token usage to proceed and prompts that do not. The test captures visual snapshots of the chat after sending these prompts and compares them against dedicated baselines to verify that the correct UI feedback is displayed in each case. I chose a visual approach to ensure that token-related indicators, warnings, or confirmation messages are clearly and consistently shown to the user, regardless of underlying implementation details. From a business perspective, this is critical because users must clearly understand when a request consumes tokens, representing real monetary value, versus when no token usage is required. Ensuring transparency around costs helps build user trust and directly contributes to a positive and reliable user experience.


