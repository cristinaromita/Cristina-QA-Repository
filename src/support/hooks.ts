import { Before, After, BeforeAll, AfterAll, Status, setDefaultTimeout } from '@cucumber/cucumber';
import { BrowserManager } from '../utils/BrowserManager';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

// Set default timeout for all steps
setDefaultTimeout(60000);

// Global browser manager instance
const browserManager = new BrowserManager();

// Create necessary directories
BeforeAll(async function () {
  const directories = [
    './reports',
    './reports/screenshots',
    './reports/videos'
  ];

  directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  console.log('Test execution started...');
});

// Before each scenario
Before(async function ({ pickle }) {
  console.log(`Starting scenario: ${pickle.name}`);
  
  // Launch browser for each scenario
  await browserManager.launchBrowser();
  
  // Store browser manager in the world context
  this.browserManager = browserManager;
  this.page = browserManager.getPage();
});

// After each scenario
After(async function ({ pickle, result }) {
  const scenarioName = pickle.name.replace(/[^a-zA-Z0-9]/g, '_');
  
  // Take screenshot on failure
  if (result?.status === Status.FAILED) {
    console.log(`Scenario failed: ${pickle.name}`);
    
    try {
      await browserManager.takeScreenshot(`FAILED_${scenarioName}`);
      console.log(`Screenshot saved for failed scenario: ${scenarioName}`);
    } catch (error) {
      console.error('Failed to take screenshot:', error);
    }
  } else {
    console.log(`Scenario passed: ${pickle.name}`);
  }

  // Close browser after each scenario unless user requested to keep it open on failure
  const keepOpen = process.env.KEEP_OPEN_ON_FAILURE === 'true';
  if (result?.status === Status.FAILED && keepOpen) {
    console.log('Scenario failed and KEEP_OPEN_ON_FAILURE is set — leaving browser open for debugging.');
    console.log('Press Enter to close browser and continue...');

    // Wait for user input so the process (and browser) stays alive for debugging
    await new Promise<void>((resolve) => {
      process.stdin.resume();
      process.stdin.once('data', () => {
        process.stdin.pause();
        resolve();
      });
    });
  }

  // Close browser in all other cases
  await browserManager.closeBrowser();
});

// After all scenarios
AfterAll(async function () {
  console.log('Test execution completed!');
  console.log('Reports generated in ./reports directory');
});
