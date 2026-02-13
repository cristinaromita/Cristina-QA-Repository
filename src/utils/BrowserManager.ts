import { chromium, firefox, webkit, Browser, BrowserContext, Page } from '@playwright/test';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * Browser Manager - Handles browser lifecycle
 */
export class BrowserManager {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;

  /**
   * Launch browser based on environment configuration
   */
  async launchBrowser(): Promise<void> {
    const browserType = process.env.BROWSER || 'chromium';
    const headless = process.env.HEADLESS === 'true';

    const launchOptions = {
      headless: headless,
      args: ['--start-maximized'],
      slowMo: headless ? 0 : 50
    };

    switch (browserType.toLowerCase()) {
      case 'firefox':
        this.browser = await firefox.launch(launchOptions);
        break;
      case 'webkit':
        this.browser = await webkit.launch(launchOptions);
        break;
      default:
        this.browser = await chromium.launch(launchOptions);
    }

    // Create browser context with default settings
    this.context = await this.browser.newContext({
      viewport: { width: 1280, height: 720 },
      ignoreHTTPSErrors: true,
      recordVideo: process.env.VIDEO_ON_FAILURE === 'true' ? {
        dir: './reports/videos/'
      } : undefined
    });

    // Create a new page
    this.page = await this.context.newPage();

    // Set default timeout
    const defaultTimeout = parseInt(process.env.DEFAULT_TIMEOUT || '30000');
    this.page.setDefaultTimeout(defaultTimeout);
  }

  /**
   * Get the current page
   */
  getPage(): Page {
    if (!this.page) {
      throw new Error('Page not initialized. Call launchBrowser() first.');
    }
    return this.page;
  }

  /**
   * Get the browser context
   */
  getContext(): BrowserContext {
    if (!this.context) {
      throw new Error('Context not initialized. Call launchBrowser() first.');
    }
    return this.context;
  }

  /**
   * Close browser and cleanup
   */
  async closeBrowser(): Promise<void> {
    if (this.page) {
      await this.page.close();
      this.page = null;
    }

    if (this.context) {
      await this.context.close();
      this.context = null;
    }

    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  /**
   * Take a screenshot
   */
  async takeScreenshot(name: string): Promise<void> {
    if (this.page) {
      await this.page.screenshot({
        path: `./reports/screenshots/${name}-${Date.now()}.png`,
        fullPage: true
      });
    }
  }
}
