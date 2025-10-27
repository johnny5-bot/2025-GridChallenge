// File: tests/e2e/zoom_sync.spec.js
// Tests for synchronization between image, grid, and rulers during zoom operations

const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

// Helper function to get computed transform values
async function getTransform(page, selector) {
  const transformStyle = await page.locator(selector).evaluate((el) => {
    return window.getComputedStyle(el).transform;
  });
  if (transformStyle === 'none') {
    return { translateX: 0, translateY: 0, scale: 1 };
  }
  const matrix = transformStyle.match(/matrix\(([^)]+)\)/)[1].split(', ').map(parseFloat);
  return {
    scale: matrix[0],
    translateX: matrix[4],
    translateY: matrix[5],
  };
}

// Discover all implementations
const srcPath = path.join(__dirname, '../../src');
const implementations = fs.readdirSync(srcPath)
  .filter(file => file.startsWith('implementation_') && file.endsWith('.js'))
  .sort();

console.log(`Zoom Sync - Discovered implementations: ${implementations.join(', ')}`);

// Test each implementation
for (const implFile of implementations) {
  
  test.describe(`Zoom Synchronization - [${implFile}]`, () => {

    test.beforeEach(async ({ page }) => {
      // Load the template HTML file
      const templatePath = path.join(__dirname, '../fixtures/challenge_template.html');
      await page.goto('file://' + templatePath);
      
      // Inject the specific implementation script
      const implPath = path.join(__dirname, '../../src/', implFile);
      await page.addScriptTag({ path: implPath });
      
      await page.evaluate((src) => {
        const im = document.getElementById('image-element');
        im.src = src;
      }, 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800"></svg>'));
      
      // Wait for image to load
      await page.waitForFunction(() => {
        return window.imgWidth > 0 && window.imgHeight > 0;
      });
    });

    test('should apply correct zoom factor when clicking zoom-in', async ({ page }) => {
      // Get initial scale
      let imgTransform = await getTransform(page, '#image-container');
      expect(imgTransform.scale).toBe(1);
      
      // Click zoom-in button
      await page.locator('#zoom-in').click();
      
      // Get the ZOOM_FACTOR from the implementation
      const zoomFactor = await page.evaluate(() => window.ZOOM_FACTOR);
      
      // Check new scale
      imgTransform = await getTransform(page, '#image-container');
      expect(imgTransform.scale).toBe(zoomFactor);
    });

    test('should maintain grid-to-ruler alignment after zoom', async ({ page }) => {
      // Get initial line positions - use .nth() instead of :nth-child() to count only <line> elements
      const gridLine = await page.locator('#grid-overlay line').nth(4).getAttribute('x1');
      const rulerLine = await page.locator('#top-lines line').nth(5).getAttribute('x1');
      
      // At scale=1, they should match
      const rulerLineValue = parseFloat(rulerLine);
      const gridLineValue = parseFloat(gridLine);
      expect(rulerLineValue).toBeCloseTo(gridLineValue, 0);

      // Zoom in
      await page.locator('#zoom-in').click();
      
      // Get new positions
      const newGridLine = await page.locator('#grid-overlay line').nth(4).getAttribute('x1');
      const newRulerLine = await page.locator('#top-lines line').nth(5).getAttribute('x1');
      
      // Grid line position (on the image) should not change
      expect(newGridLine).toBe(gridLine);
      
      // Ruler line should now be scaled
      const imgTransform = await getTransform(page, '#image-container');
      const newScale = imgTransform.scale;
      expect(parseFloat(newRulerLine)).toBeCloseTo(parseFloat(newGridLine) * newScale, 0);
    });

    test('should synchronize rulers with zoom transform', async ({ page }) => {
      // Zoom in
      await page.locator('#zoom-in').click();
      
      // Get transforms
      const imgTransform = await getTransform(page, '#image-container');
      const topTransform = await getTransform(page, '#top-lines');
      const leftTransform = await getTransform(page, '#left-lines');
      
      // Check that translation from zoom-to-center was synced
      expect(topTransform.translateX).toBe(imgTransform.translateX);
      expect(leftTransform.translateY).toBe(imgTransform.translateY);
      expect(topTransform.translateY).toBe(0);
      expect(leftTransform.translateX).toBe(0);
    });

    test('should zoom out correctly', async ({ page }) => {
      // Get zoom factor
      const zoomFactor = await page.evaluate(() => window.ZOOM_FACTOR);
      
      // Zoom in first
      await page.locator('#zoom-in').click();
      let imgTransform = await getTransform(page, '#image-container');
      expect(imgTransform.scale).toBe(zoomFactor);
      
      // Zoom out
      await page.locator('#zoom-out').click();
      imgTransform = await getTransform(page, '#image-container');
      expect(imgTransform.scale).toBe(1);
    });

  });
}

