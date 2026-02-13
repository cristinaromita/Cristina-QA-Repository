import fs from 'fs';
import path from 'path';
import { Page } from '@playwright/test';
// Use runtime require to avoid TypeScript declaration issues for third-party libs
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { PNG } = require('pngjs');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pixelmatch = require('pixelmatch');

type Options = {
  threshold?: number; // fraction of pixels allowed to differ
  waitMs?: number; // milliseconds to wait before taking the screenshot (default 500)
};

export async function compareScreenshot(page: Page, name: string, options: Options = {}) {
  const threshold = options.threshold ?? 0.10; // 10% default

  const baselineDir = path.resolve(process.cwd(), 'visual-baseline');
  const reportsDir = path.resolve(process.cwd(), 'reports', 'visual');
  if (!fs.existsSync(baselineDir)) fs.mkdirSync(baselineDir, { recursive: true });
  if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });

  const baselinePath = path.join(baselineDir, `${name}.png`);
  const currentPath = path.join(reportsDir, `${name}-current.png`);
  const diffPath = path.join(reportsDir, `${name}-diff.png`);

  // Wait briefly to allow animations/network to settle before capturing
  const waitMs = options.waitMs ?? 500;
  if (waitMs > 0) await page.waitForTimeout(waitMs);

  // Capture current screenshot
  const buffer = await page.screenshot({ fullPage: true });
  fs.writeFileSync(currentPath, buffer);

  if (!fs.existsSync(baselinePath)) {
    // If no baseline exists, save current as baseline and warn
    fs.writeFileSync(baselinePath, buffer);
    console.warn(`Visual baseline did not exist. Saved current screenshot as baseline: ${baselinePath}`);
    return { baselineCreated: true };
  }

  // Read PNGs
  const img1 = PNG.sync.read(fs.readFileSync(baselinePath));
  const img2 = PNG.sync.read(fs.readFileSync(currentPath));

  // Ensure same dimensions
  if (img1.width !== img2.width || img1.height !== img2.height) {
    const msg = `Screenshot dimensions differ: baseline ${img1.width}x${img1.height} vs current ${img2.width}x${img2.height}`;
    // Write a diff (scaled to the smaller size) by creating an empty diff image
    const diff = new PNG({ width: Math.max(img1.width, img2.width), height: Math.max(img1.height, img2.height) });
    fs.writeFileSync(diffPath, PNG.sync.write(diff));
    throw new Error(msg);
  }

  const diff = new PNG({ width: img1.width, height: img1.height });
  const pixelDiff = pixelmatch(img1.data, img2.data, diff.data, img1.width, img1.height, { threshold: 0.1 });

  const totalPixels = img1.width * img1.height;
  const diffRatio = pixelDiff / totalPixels;
  if (diffRatio > threshold) {
    fs.writeFileSync(diffPath, PNG.sync.write(diff));
    throw new Error(`Visual regression detected for ${name}: ${pixelDiff} pixels differ (${(diffRatio * 100).toFixed(2)}%). Diff saved to ${diffPath}`);
  }

  // Clean up current image on success
  try { fs.unlinkSync(currentPath); } catch {}
  return { baselineCreated: false, diffRatio };
}

export default compareScreenshot;
