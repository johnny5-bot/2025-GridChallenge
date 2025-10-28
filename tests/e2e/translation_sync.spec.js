// File: tests/e2e/translation_sync.spec.js
// Tests for synchronization between image, grid, and rulers during pan/drag operations

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

// Test each implementation
for (const implFile of implementations) {
  
  test.describe(`Translation Synchronization - [${implFile}]`, () => {

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

    test('should synchronize top ruler with horizontal pan', async ({ page }) => {
      const imageContainer = page.locator('#image-container');
      
      // Get initial state
      let imgTransform = await getTransform(page, '#image-container');
      let topTransform = await getTransform(page, '#top-lines');
      expect(imgTransform.translateX).toBe(0);
      expect(topTransform.translateX).toBe(0);

      // Drag right
      await imageContainer.dragTo(imageContainer, {
        sourcePosition: { x: 100, y: 100 },
        targetPosition: { x: 150, y: 100 } // 50px right, no vertical movement
      });
      
      // Check synchronization
      imgTransform = await getTransform(page, '#image-container');
      topTransform = await getTransform(page, '#top-lines');
      
      expect(imgTransform.translateX).toBe(50);
      expect(imgTransform.translateY).toBe(0);
      expect(topTransform.translateX).toBe(50);
      expect(topTransform.translateY).toBe(0);
    });

    test('should synchronize left ruler with vertical pan', async ({ page }) => {
      const imageContainer = page.locator('#image-container');
      
      // Get initial state
      let imgTransform = await getTransform(page, '#image-container');
      let leftTransform = await getTransform(page, '#left-lines');
      expect(imgTransform.translateY).toBe(0);
      expect(leftTransform.translateY).toBe(0);

      // Drag down
      await imageContainer.dragTo(imageContainer, {
        sourcePosition: { x: 100, y: 100 },
        targetPosition: { x: 100, y: 180 } // 80px down, no horizontal movement
      });
      
      // Check synchronization
      imgTransform = await getTransform(page, '#image-container');
      leftTransform = await getTransform(page, '#left-lines');
      
      expect(imgTransform.translateX).toBe(0);
      expect(imgTransform.translateY).toBe(80);
      expect(leftTransform.translateX).toBe(0);
      expect(leftTransform.translateY).toBe(80);
    });

    test('should synchronize both rulers with diagonal pan', async ({ page }) => {
      const imageContainer = page.locator('#image-container');
      
      // Get initial state
      let imgTransform = await getTransform(page, '#image-container');
      let topTransform = await getTransform(page, '#top-lines');
      let leftTransform = await getTransform(page, '#left-lines');
      
      expect(imgTransform.translateX).toBe(0);
      expect(imgTransform.translateY).toBe(0);
      expect(topTransform.translateX).toBe(0);
      expect(leftTransform.translateY).toBe(0);

      // Drag diagonally
      await imageContainer.dragTo(imageContainer, {
        sourcePosition: { x: 100, y: 100 },
        targetPosition: { x: 150, y: 180 } // 50px right, 80px down
      });
      
      // Check synchronization
      imgTransform = await getTransform(page, '#image-container');
      topTransform = await getTransform(page, '#top-lines');
      leftTransform = await getTransform(page, '#left-lines');
      
      expect(imgTransform.translateX).toBe(50);
      expect(imgTransform.translateY).toBe(80);
      expect(topTransform.translateX).toBe(50); // Top ruler matches X
      expect(topTransform.translateY).toBe(0); // Top ruler Y stays 0
      expect(leftTransform.translateX).toBe(0); // Left ruler X stays 0
      expect(leftTransform.translateY).toBe(80); // Left ruler matches Y
    });

  });
}

