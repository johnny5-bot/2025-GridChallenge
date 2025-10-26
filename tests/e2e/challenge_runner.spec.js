// File: 2025-GridChallenge/tests/e2e/challenge_runner.spec.js
const { test, expect } = require('@playwright/test');
const path = require('path'); // Needed to construct file paths

// --- List of Implementations to Test ---
// Add all your implementation files to this array.
const implementations = [
  'implementation_A.js',
  'implementation_B.js',
  // 'implementation_C_new_pan_logic.js',
  // 'implementation_D_different_grid.js',
];

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


// --- Test Runner ---
// This loop creates a new test suite for each implementation file
for (const implFile of implementations) {
  
  test.describe(`2025 Grid Challenge - [${implFile}]`, () => {

    test.beforeEach(async ({ page }) => {
      // 1. Load the template HTML file
      const templatePath = path.join(__dirname, '../fixtures/challenge_template.html');
      await page.goto('file://' + templatePath);
      
      // 2. Inject the specific implementation script
      // Path is relative to this test file
      const implPath = path.join(__dirname, '../../src/', implFile);
      await page.addScriptTag({ path: implPath });
      
      // 3. Wait for the injected script's img.onload to fire
      // We check the global variable set by the implementation scripts
      await page.waitForFunction(() => {
        return window.imgWidth > 0 && window.imgHeight > 0;
      });
    });

    // ---
    // The test logic remains identical.
    // ---

    test('should synchronize translation (panning) on drag', async ({ page }) => {
      const imageContainer = page.locator('#image-container');
      
      // Get initial transforms
      let imgTransform = await getTransform(page, '#image-container');
      let topTransform = await getTransform(page, '#top-lines');
      let leftTransform = await getTransform(page, '#left-lines');
      expect(imgTransform.translateX).toBe(0);
      expect(topTransform.translateX).toBe(0);
      expect(leftTransform.translateY).toBe(0);

      // Perform a drag
      await imageContainer.dragTo(imageContainer, {
        sourcePosition: { x: 100, y: 100 },
        targetPosition: { x: 150, y: 180 } // Drag 50px right, 80px down
      });
      
      // Get new transforms
      imgTransform = await getTransform(page, '#image-container');
      topTransform = await getTransform(page, '#top-lines');
      leftTransform = await getTransform(page, '#left-lines');

      // Assert all transforms are synced correctly
      expect(imgTransform.translateX).toBe(50);
      expect(imgTransform.translateY).toBe(80);
      expect(topTransform.translateX).toBe(50); // Top ruler matches X
      expect(topTransform.translateY).toBe(0); // Top ruler Y is 0
      expect(leftTransform.translateX).toBe(0); // Left ruler X is 0
      expect(leftTransform.translateY).toBe(80); // Left ruler matches Y
    });

    test('should synchronize scale (zooming) on button click', async ({ page }) => {
      // Get initial scale and line positions
      let imgTransform = await getTransform(page, '#image-container');
      const initialScale = imgTransform.scale;
      expect(initialScale).toBe(1);
      
      // Get position of grid line and corresponding ruler line
      // Grid overlay lines start at index 1 (no edge line), ruler lines include edge (index 0)
      // So grid line #5 (index 4) should match ruler line #6 (index 5)
      const gridLine = await page.locator('#grid-overlay line:nth-child(5)').getAttribute('x1');
      const rulerLine = await page.locator('#top-lines line:nth-child(6)').getAttribute('x1');
      
      // The grid line is positioned on the image itself (in image coordinates)
      // The ruler line needs to be scaled by the current scale
      // At scale=1, ruler should equal grid at scale=1
      const rulerLineValue = parseFloat(rulerLine);
      const gridLineValue = parseFloat(gridLine);
      expect(rulerLineValue).toBeCloseTo(gridLineValue);

      // Click zoom-in button
      await page.locator('#zoom-in').click();

      // Get the ZOOM_FACTOR from the implementation's global scope
      const zoomFactor = await page.evaluate(() => window.ZOOM_FACTOR);
      
      // Check new scale
      imgTransform = await getTransform(page, '#image-container');
      const newScale = imgTransform.scale;
      expect(newScale).toBe(zoomFactor); // Check against the *implementation's* factor
      
      // Get new line positions
      const newGridLine = await page.locator('#grid-overlay line:nth-child(5)').getAttribute('x1');
      const newRulerLine = await page.locator('#top-lines line:nth-child(6)').getAttribute('x1');
      
      // Grid line position (on the image) should not change
      expect(newGridLine).toBe(gridLine); 
      // Ruler line position should now be scaled
      expect(parseFloat(newRulerLine)).toBeCloseTo(parseFloat(newGridLine) * newScale);
      
      // Check that translation from zoom-to-center was also synced
      const imgTranslateX = imgTransform.translateX;
      const imgTranslateY = imgTransform.translateY;
      const topTransform = await getTransform(page, '#top-lines');
      const leftTransform = await getTransform(page, '#left-lines');
      expect(topTransform.translateX).toBe(imgTranslateX);
      expect(leftTransform.translateY).toBe(imgTranslateY);
    });

  });
}

