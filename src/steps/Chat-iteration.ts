import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { compareScreenshot } from '../utils/visual-regression';
import { CustomWorld } from '../support/world';

/**
 * Step Definitions for Login Feature
 * Note: Given/When/Then are aliases in Cucumber - only register each step pattern once
 */

Given('I am on the login page', async function (this: CustomWorld) {
  await this.page.goto('https://fcedgmdaekj-olcffeha-pr-4350-44d7fc6b8a55.herokuapp.com/');
  this.setTestData('username', 'robin+qa-case-study-cristina@everai.ai');
  this.setTestData('password', 'eyr5apu3acm6XJQ');
  this.setTestData('accessKey', '');
});

Given('I enter username {string}', async function (this: CustomWorld, username: string) {
  const user = username && username.trim() !== '' ? username : this.getTestData('username');
  await this.page.click('#user_email');
  await this.page.fill('#user_email', user);
  console.log(`Entered username: ${user}`);
});

Given('I enter password {string}', async function (this: CustomWorld, password: string) {
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

Given('I enter access key {string}', async function (this: CustomWorld, accessKey: string) {
  const key = accessKey && accessKey.trim() !== '' ? accessKey : this.getTestData('accessKey');
  await this.page.click('#stage_access_key');
  await this.page.fill('#stage_access_key', key);
  console.log(`Entered access key: ${key}`);
});

Given('I click the login button', async function (this: CustomWorld) {
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

Given('I click the Sign in button', async function (this: CustomWorld) {
  try {
    await this.page.click('button#signin-btn[type="submit"]', { timeout: 5000 });
  } catch (e) {
    try {
      await this.page.click('button:has-text("Sign in")', { timeout: 5000 });
    } catch {
      await this.page.click('text=Sign in');
    }
  }
  console.log('Clicked Sign in button');
  try {
    await this.page.waitForLoadState('networkidle', { timeout: 8000 });
  } catch {
    await this.page.waitForTimeout(1000);
  }
});

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

Given('I click the submit button', async function (this: CustomWorld) {
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
  try {
    await this.page.waitForLoadState('networkidle', { timeout: 5000 });
  } catch {
    await this.page.waitForTimeout(1000);
  }
});

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

When('I accept only necessary cookies', async function (this: CustomWorld) {
  const id = 'cookiescript_reject';
  const visibleText = 'Only Necessary';
  const locator = this.page.locator(`#${id}`);
  try {
    await locator.waitFor({ state: 'visible', timeout: 3000 });
    await locator.scrollIntoViewIfNeeded();
    await locator.click({ force: true, timeout: 5000 });
    console.log('Clicked cookie control by id locator');
  } catch (e: any) {
    console.warn('Locator click failed, trying evaluate click:', e?.message || e);
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
      try {
        await this.page.click(`text=${visibleText}`, { force: true, timeout: 3000 });
        console.log('Clicked cookie control by visible text');
      } catch (err2) {
        console.warn('All cookie click strategies failed');
      }
    }
  }
  try {
    await this.page.waitForSelector(`#${id}`, { state: 'hidden', timeout: 3000 });
  } catch {
    await this.page.waitForTimeout(500);
  }
  console.log('Accepted only necessary cookies (attempted)');
});

When('I click on the right panel accordion', async function (this: CustomWorld) {
  const selectors = [
    'img[data-action="click->profile-toggle#toggle"]',
    'div.hidden.lg\\:inline-flex.h-full.bg-neutral-900\\/70.justify-ends.gap-3\\.5.items-center.relative.py-2 img',
    '#pfp-banner-container > div > div.flex.items-center.justify-center.gap-4.lg\\:gap-6 > div.hidden.lg\\:inline-flex.h-full.bg-neutral-900\\/70.justify-ends.gap-3\\.5.items-center.relative.py-2 img',
    '#pfp-banner-container > div > div.flex.items-center.justify-center.gap-4.lg\\:gap-6 > div.hidden.lg\\:inline-flex.h-full.bg-neutral-900\\/70.justify-ends.gap-3\\.5.items-center.relative.py-2'
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

When('I click the button labeled {string}', async function (this: CustomWorld, label: string) {
  const text = (label || '').trim();
  if (!text) throw new Error('Button label must be provided');
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

// Click on the chat message input field
When('I click on the message input field', async function (this: CustomWorld) {
  const selectors = [
    '#message_body',
    'textarea[placeholder="Write a message..."]',
    'textarea[data-gen-ai--chat-input-target="textarea"]',
    'textarea[aria-label="Chat message"]'
  ];
  for (const sel of selectors) {
    try {
      const loc = this.page.locator(sel);
      if (await loc.count() > 0) {
        await loc.first().waitFor({ state: 'visible', timeout: 5000 });
        await loc.first().scrollIntoViewIfNeeded();
        await loc.first().click({ force: true, timeout: 5000 });
        console.log(`Clicked message input field with selector: ${sel}`);
        return;
      }
    } catch (e: any) {
      console.warn(`Click failed for selector ${sel}:`, e?.message || e);
    }
  }
  throw new Error('Unable to click on the message input field');
});

// Type a message into the chat input field
When('I type {string} in the message input', async function (this: CustomWorld, message: string) {
  const selectors = [
    '#message_body',
    'textarea[placeholder="Write a message..."]',
    'textarea[data-gen-ai--chat-input-target="textarea"]',
    'textarea[aria-label="Chat message"]'
  ];
  for (const sel of selectors) {
    try {
      const loc = this.page.locator(sel);
      if (await loc.count() > 0) {
        await loc.first().waitFor({ state: 'visible', timeout: 5000 });
        await loc.first().scrollIntoViewIfNeeded();
        await loc.first().click({ force: true, timeout: 3000 });
        await loc.first().fill(message);
        console.log(`Typed message: "${message}" in input field with selector: ${sel}`);
        return;
      }
    } catch (e: any) {
      console.warn(`Fill failed for selector ${sel}:`, e?.message || e);
    }
  }
  throw new Error('Unable to type in the message input field');
});

// Clear/delete text from the chat message input field
When('I clear the message input field', async function (this: CustomWorld) {
  const selectors = [
    '#message_body',
    'textarea[placeholder="Write a message..."]',
    'textarea[data-gen-ai--chat-input-target="textarea"]',
    'textarea[aria-label="Chat message"]'
  ];
  for (const sel of selectors) {
    try {
      const loc = this.page.locator(sel);
      if (await loc.count() > 0) {
        await loc.first().waitFor({ state: 'visible', timeout: 5000 });
        await loc.first().scrollIntoViewIfNeeded();
        await loc.first().click({ force: true, timeout: 3000 });
        await loc.first().fill('');
        console.log(`Cleared message input field with selector: ${sel}`);
        return;
      }
    } catch (e: any) {
      console.warn(`Clear failed for selector ${sel}:`, e?.message || e);
    }
  }
  throw new Error('Unable to clear the message input field');
});

// Click the "Got it!" button in the character modal
When('I click the Got it button', async function (this: CustomWorld) {
  const selectors = [
    'button[data-action="click->conversations--v2-character-modal#closeModal"]',
    'button:has-text("Got it!")',
    'button.bg-linear-to-r:has-text("Got it!")'
  ];
  for (const sel of selectors) {
    try {
      const loc = this.page.locator(sel);
      if (await loc.count() > 0) {
        await loc.first().waitFor({ state: 'visible', timeout: 5000 });
        await loc.first().scrollIntoViewIfNeeded();
        await loc.first().click({ force: true, timeout: 5000 });
        console.log(`Clicked "Got it!" button with selector: ${sel}`);
        return;
      }
    } catch (e: any) {
      console.warn(`Click failed for selector ${sel}:`, e?.message || e);
    }
  }
  // Fallback: evaluate click
  try {
    const clicked = await this.page.evaluate(() => {
      const btn = Array.from((globalThis as any).document.querySelectorAll('button')).find(
        (b: any) => b.textContent?.trim() === 'Got it!'
      ) as any;
      if (btn) { btn.click(); return true; }
      return false;
    });
    if (clicked) {
      console.log('Clicked "Got it!" button via evaluate');
      return;
    }
  } catch (e: any) {
    console.warn('Evaluate click for Got it! button failed:', e?.message || e);
  }
  throw new Error('Unable to click the "Got it!" button');
});
