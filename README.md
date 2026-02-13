

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

2. **Set environment variables:**
   - Create a `.env` file or set variables in your CI/CD:
     - `LOGIN_USERNAME`  
     - `LOGIN_PASSWORD`  
     - `LOGIN_ACCESS_KEY` (optional)

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

## License
This project is licensed under the MIT License.

---
For questions or support, open an issue on GitHub.
