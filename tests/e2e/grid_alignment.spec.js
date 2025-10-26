const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

// Automatically detect implementations in /src
const srcPath = path.join(__dirname, '../../src');
const implementations = fs.readdirSync(srcPath)
  .filter(file => file.startsWith('implementation_') && file.endsWith('.js'))
  .sort();

for (const implFile of implementations) {
  test.describe(`Grid Alignment Verification - [${implFile}]`, () => {

    test.beforeEach(async ({ page }) => {
      const templatePath = path.join(__dirname, '../fixtures/challenge_template.html');
      await page.goto('file://' + templatePath);
      const implPath = path.join(__dirname, '../../src/', implFile);
      await page.addScriptTag({ path: implPath });
      await page.waitForFunction(() => window.imgWidth > 0 && window.imgHeight > 0);
    });

    test('grid overlay lines align center-to-center with ruler lines', async ({ page }) => {
      // Compare the first 10 grid lines to the corresponding top ruler lines
      for (let i = 1; i <= 10; i++) {
        const gridLineX = parseFloat(await page.locator(`#grid-overlay line:nth-child(${i})`).getAttribute('x1'));
        const rulerLineX = parseFloat(await page.locator(`#top-lines line:nth-child(${i + 1})`).getAttribute('x1'));
        const diffX = Math.abs(gridLineX - rulerLineX);

        // Fail if misalignment exceeds 0.1px
        expect(diffX, `X misalignment at line ${i}: ${diffX}px`).toBeLessThanOrEqual(0.1);
      }

      // Compare the first 10 grid lines to the corresponding left ruler lines
      for (let i = 1; i <= 10; i++) {
        const gridLineY = parseFloat(await page.locator(`#grid-overlay line:nth-child(${i})`).getAttribute('y1'));
        const rulerLineY = parseFloat(await page.locator(`#left-lines line:nth-child(${i + 1})`).getAttribute('y1'));
        const diffY = Math.abs(gridLineY - rulerLineY);

        expect(diffY, `Y misalignment at line ${i}: ${diffY}px`).toBeLessThanOrEqual(0.1);
      }
    });

  });
}
