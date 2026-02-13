import { World, IWorldOptions, setWorldConstructor } from '@cucumber/cucumber';
import { Page } from '@playwright/test';
import { BrowserManager } from '../utils/BrowserManager';

/**
 * Custom World class to share context between steps
 */
export class CustomWorld extends World {
  public page!: Page;
  public browserManager!: BrowserManager;
  public testData: Record<string, any> = {};

  constructor(options: IWorldOptions) {
    super(options);
  }

  /**
   * Store data that can be used across steps
   */
  setTestData(key: string, value: any): void {
    this.testData[key] = value;
  }

  /**
   * Retrieve stored test data
   */
  getTestData(key: string): any {
    return this.testData[key];
  }
}

setWorldConstructor(CustomWorld);
