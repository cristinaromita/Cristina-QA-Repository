import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
// LoginPage logic is implemented inline below
import { compareScreenshot } from '../src/utils/visual-regression';
import { CustomWorld } from '../src/support/world';

/**
 * Step Definitions for Login Feature
 */

// Background step
Given('I am on the login page', async function (this: CustomWorld) {
  // Navigate directly to the specified login URL
  await this.page.goto('https://fcedgmdaekj-olcffeha-pr-4350-44d7fc6b8a55.herokuapp.com/');
});

// When steps
When('I enter username {string}', async function (this: CustomWorld, username: string) {
  const user = username && username.trim() !== '' ? username : this.getTestData('username');
  await this.page.click('#user_email');
  await this.page.fill('#user_email', user);
  console.log(`Entered username: ${user}`);
});

When('I enter password {string}', async function (this: CustomWorld, password: string) {
  const pwd = password && password.trim() !== '' ? password : this.getTestData('password');
  try {
    await this.page.fill('#user_password', pwd);
  } catch (e) {
    try {
      await this.page.fill('input[name="user[password]"]', pwd);
    } catch {
      await this.page.fill('input[type="password"]', pwd);
    }
  }
  console.log('Entered password');
});

// Enter access key into the stage_access_key input
When('I enter access key {string}', async function (this: CustomWorld, accessKey: string) {
  const key = accessKey && accessKey.trim() !== '' ? accessKey : this.getTestData('accessKey');
  await this.page.click('#stage_access_key');
  await this.page.fill('#stage_access_key', key);
  console.log(`Entered access key: ${key}`);
});

When('I click the login button', async function (this: CustomWorld) {
  // Click the Login control (outer div) that opens the sign-in modal
  const loginLocator = this.page.locator('div[data-action="click->main#openSignInModal"]');
  try {
    if (await loginLocator.count() > 0) {
      await loginLocator.first().click({ timeout: 5000 });
    } else {
      await this.page.click('text=Login', { timeout: 5000 });
    }
    console.log('Clicked login button (opened sign-in modal)');
  } catch (e) {
    console.warn('Failed to click login div by data-action, falling back to text selector.');
    await this.page.click('text=Login');
  }
  await this.page.waitForSelector('#user_email', { state: 'visible', timeout: 5000 });
});

// Click the Sign in button inside the sign-in modal
When('I click the Sign in button', async function (this: CustomWorld) {
  // Prefer the unique id, otherwise use button text
  try {
    await this.page.click('button#signin-btn[type="submit"]', { timeout: 5000 });
  } catch (e) {
    try {
      await this.page.click('button:has-text("Sign in")', { timeout: 5000 });
    } catch {
      // Last resort: click any submit button with Sign in label
      await this.page.click('text=Sign in');
    }
  }
  console.log('Clicked Sign in button');

  // Wait for navigation or network activity after sign in
  try {
    await this.page.waitForLoadState('networkidle', { timeout: 8000 });
  } catch {
    await this.page.waitForTimeout(1000);
  }
});

// Click an icon by its visible label (e.g. "Marta")
When('I click the icon labeled {string}', async function (this: CustomWorld, label: string) {
  const normalized = (label || '').trim();
  try {
    await this.page.locator(`xpath=//div[normalize-space(.)="${normalized}"]/ancestor::a//video`).first().click({ timeout: 5000 });
  } catch (e) {
    const labelLocator = this.page.locator(`div:has-text("${normalized}")`);
    try {
      if (await labelLocator.count() > 0) {
        await labelLocator.first().click({ timeout: 5000 });
      } else {
        await this.page.click(`text=${normalized}`, { timeout: 5000 });
      }
    } catch (err) {
      try {
        await this.page.getByRole('button', { name: new RegExp(normalized, 'i') }).click();
      } catch {
        await this.page.click(`text=${normalized}`);
      }
    }
  }
  console.log(`Clicked icon labeled: ${label}`);
  await this.page.waitForTimeout(1000);
});

// Click the form submit button
When('I click the submit button', async function (this: CustomWorld) {
  // Target the exact input element provided (with primary-gradient class), with fallbacks
  const selector = 'input[type="submit"][name="commit"][value="Submit"][class*="primary-gradient"]';
  try {
    await this.page.click(selector, { timeout: 5000 });
  } catch (e) {
    try {
      await this.page.click('input[type="submit"][name="commit"]', { timeout: 5000 });
    } catch {
      await this.page.click('input[type="submit"][value="Submit"]');
    }
  }
  console.log('Clicked submit button');
  // Wait briefly for navigation or network activity
  try {
    await this.page.waitForLoadState('networkidle', { timeout: 5000 });
  } catch {
    await this.page.waitForTimeout(1000);
  }
});

// Visual snapshot and comparison step
When('I capture and compare snapshot {string}', async function (this: CustomWorld, name: string) {
  try {
    const result = await compareScreenshot(this.page, name);
    if (result && result.baselineCreated) {
      console.log(`Baseline created for snapshot: ${name}`);
    } else {
      console.log(`Snapshot comparison passed: ${name}`);
    }
  } catch (e) {
    console.error(e);
    throw e;
  }
});

// Accept only necessary cookies by clicking the cookie widget's 'Only Necessary' control
When('I accept only necessary cookies', async function (this: CustomWorld) {
  const id = 'cookiescript_reject';
  const visibleText = 'Only Necessary';

  // Strategy 1: locator click (visible + scrollIntoView + force)
  const locator = this.page.locator(`#${id}`);
  try {
    await locator.waitFor({ state: 'visible', timeout: 3000 });
    await locator.scrollIntoViewIfNeeded();
    await locator.click({ force: true, timeout: 5000 });
    console.log('Clicked cookie control by id locator');
  } catch (e: any) {
    console.warn('Locator click failed, trying evaluate click:', e?.message || e);

    // Strategy 2: DOM evaluate click (works even if element is covered)
    try {
      const clicked = await this.page.evaluate((elId: any) => {
        const el = (globalThis as any).document.getElementById(elId) as any | null;
        if (el) {
          el.click();
          return true;
        }
        return false;
      }, id);

      if (clicked) {
        console.log('Clicked cookie control via page.evaluate');
      } else {
        throw new Error('Element not found for evaluate click');
      }
    } catch (err: any) {
      console.warn('Evaluate click failed, trying text-based fallback:', err?.message || err);

      // Strategy 3: text-based click fallback
      try {
        await this.page.click(`text=${visibleText}`, { force: true, timeout: 3000 });
        console.log('Clicked cookie control by visible text');
      } catch (err2) {
        console.warn('All cookie click strategies failed');
      }
    }
  }

  // Give the banner a moment to disappear
  try {
    await this.page.waitForSelector(`#${id}`, { state: 'hidden', timeout: 3000 });
  } catch {
    await this.page.waitForTimeout(500);
  }
  console.log('Accepted only necessary cookies (attempted)');
});

// Click the right panel accordion (toggle image)
When('I click on the right panel accordion', async function (this: CustomWorld) {
  const selectors = [
    'img[data-action="click->profile-toggle#toggle"]',
    'div.hidden.lg\:inline-flex.h-full.bg-neutral-900\\/70.justify-ends.gap-3.5.items-center.relative.py-2 img',
    '#pfp-banner-container > div > div.flex.items-center.justify-center.gap-4.lg\:gap-6 > div.hidden.lg\:inline-flex.h-full.bg-neutral-900\\/70.justify-ends.gap-3.5.items-center.relative.py-2 img',
    '#pfp-banner-container > div > div.flex.items-center.justify-center.gap-4.lg\:gap-6 > div.hidden.lg\:inline-flex.h-full.bg-neutral-900\\/70.justify-ends.gap-3.5.items-center.relative.py-2'
  ];

  for (const sel of selectors) {
    try {
      const loc = this.page.locator(sel);
      const count = await loc.count();
      console.log(`[Accordion] Selector: ${sel} found ${count} elements`);
      if (count > 0) {
        await loc.first().waitFor({ state: 'visible', timeout: 3000 });
        await loc.first().scrollIntoViewIfNeeded();
        await loc.first().click({ force: true, timeout: 5000 });
        console.log(`[Accordion] Clicked element with selector: ${sel}`);
        return;
      }
    } catch (e: any) {
      console.warn(`[Accordion] Click failed for selector ${sel}:`, e?.message || e);
    }
  }

  // Last resort: evaluate and click via DOM
  try {
    const clicked = await this.page.evaluate(() => {
      const el = (globalThis as any).document.querySelector('img[data-action="click->profile-toggle#toggle"]') as any | null;
      if (el) { el.click(); return true; }
      return false;
    });
    if (clicked) {
      console.log('[Accordion] Clicked via evaluate');
      return;
    }
  } catch (err: any) {
    console.warn('[Accordion] Evaluate click failed:', err?.message || err);
  }

  throw new Error('Unable to click right panel accordion');
});

// Generic step: click a button by its visible label (robust strategies)
When('I click the button labeled {string}', async function (this: CustomWorld, label: string) {
  const text = (label || '').trim();
  if (!text) throw new Error('Button label must be provided');

  // Strategy A: direct button locator by visible text
  try {
    const byText = this.page.locator(`button:has-text("${text}")`);
    if (await byText.count() > 0) {
      await byText.first().waitFor({ state: 'visible', timeout: 3000 });
      await byText.first().scrollIntoViewIfNeeded();
      await byText.first().click({ force: true, timeout: 5000 });
      console.log(`Clicked button by text: ${text}`);
      return;
    }
  } catch (e: any) {
    console.warn('Direct button locator failed:', e?.message || e);
  }

  // Strategy B: search inside known modal container if present
  try {
    const modal = this.page.locator('#v2-character-modal');
    if (await modal.count() > 0) {
      const btnInModal = modal.locator(`button:has-text("${text}")`);
      if (await btnInModal.count() > 0) {
        await btnInModal.first().click({ force: true, timeout: 5000 });
        console.log(`Clicked button inside #v2-character-modal: ${text}`);
        return;
      }
    }
  } catch (e: any) {
    console.warn('Modal-scoped click attempt failed:', e?.message || e);
  }

  // Strategy C: DOM evaluate click searching for matching innerText
  try {
    const clicked = await this.page.evaluate((t: string) => {
      const buttons = Array.from((globalThis as any).document.querySelectorAll('button')) as any[];
      const normalized = t.trim().toLowerCase();
      const btn = buttons.find(b => ((b.innerText || '') as string).trim().toLowerCase().includes(normalized));
      if (btn) { (btn as any).click(); return true; }
      return false;
    }, text);
    if (clicked) {
      console.log(`Clicked button via evaluate by matching text: ${text}`);
      return;
    }
  } catch (e: any) {
    console.warn('Evaluate-based button click failed:', e?.message || e);
  }

  throw new Error(`Unable to click button labeled: ${text}`);
});

// Generic step: click an element by CSS selector (robust strategies)
When('I click the element with selector {string}', async function (this: CustomWorld, selector: string) {
  if (!selector || selector.trim() === '') throw new Error('Selector must be provided');
  const sel = selector.trim();

  try {
    const loc = this.page.locator(sel);
    await loc.first().waitFor({ state: 'visible', timeout: 3000 });
    await loc.first().scrollIntoViewIfNeeded();
    await loc.first().click({ force: true, timeout: 5000 });
    console.log(`Clicked element by selector: ${sel}`);
    return;
  } catch (e: any) {
    console.warn('Locator click by selector failed:', e?.message || e);
  }

  // Evaluate click fallback
  try {
    const clicked = await this.page.evaluate((s: string) => {
      const el = (globalThis as any).document.querySelector(s) as any | null;
      if (el) { el.click(); return true; }
      return false;
    }, sel);
    if (clicked) {
      console.log(`Clicked element by evaluating selector: ${sel}`);
      return;
    }
  } catch (e: any) {
    console.warn('Evaluate click by selector failed:', e?.message || e);
  }

  throw new Error(`Unable to click element with selector: ${sel}`);
});
