const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

const srcPath = path.join(__dirname, '../../src');
const implementations = fs.readdirSync(srcPath)
  .filter(f => f.startsWith('implementation_') && f.endsWith('.js'))
  .filter(f => !f.includes('reference')) // Exclude reference implementations from tests
  .sort();

const DATA_URL_800 =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800"></svg>');

function median(arr) {
  const a = arr.slice().sort((x,y)=>x-y);
  const n = a.length;
  if (!n) return NaN;
  return n % 2 ? a[(n-1)/2] : 0.5*(a[n/2-1]+a[n/2]);
}

for (const implFile of implementations) {
  test.describe(`Grid Alignment Verification - [${implFile}]`, () => {
    test.beforeEach(async ({ page }) => {
      const template = path.join(__dirname, '../fixtures/challenge_template.html');
      await page.goto('file://' + template);

      const impl = path.join(__dirname, '../../src/', implFile);
      await page.addScriptTag({ path: impl });

      // Force local image to remove network flake
      await page.evaluate((src) => { document.getElementById('image-element').src = src; }, DATA_URL_800);

      // Wait for dimensions or force draw
      await page.waitForFunction(() => window.imgWidth > 0 && window.imgHeight > 0)
        .catch(() => page.evaluate(() => {
          window.imgWidth = 800; window.imgHeight = 800;
          typeof drawTopLines==='function' && drawTopLines();
          typeof drawLeftLines==='function' && drawLeftLines();
          typeof drawGridOverlay==='function' && drawGridOverlay();
          typeof updateTransform==='function' && updateTransform();
        }));

      // Ensure lines exist
      await page.waitForFunction(() =>
        document.querySelectorAll('#grid-overlay line').length &&
        document.querySelectorAll('#top-lines line').length &&
        document.querySelectorAll('#left-lines line').length
      );
    });

    test('rulers are consistently 0.5px offset from grid before and after zoom', async ({ page }) => {
      // Helpers: screen-space centers relative to each SVG origin
      const vCentersLocal = async (lineSel, svgSel) => {
        const base = await page.locator(svgSel).evaluate(el => el.getBoundingClientRect().left);
        const xs = await page.$$eval(lineSel, els => els.map(el => {
          const r = el.getBoundingClientRect(); return (r.left + r.right) / 2;
        }));
        return xs.map(x => x - base).sort((a,b)=>a-b);
      };
      const hCentersLocal = async (lineSel, svgSel) => {
        const base = await page.locator(svgSel).evaluate(el => el.getBoundingClientRect().top);
        const ys = await page.$$eval(lineSel, els => els.map(el => {
          const r = el.getBoundingClientRect(); return (r.top + r.bottom) / 2;
        }));
        return ys.map(y => y - base).sort((a,b)=>a-b);
      };
      const midSample = arr => arr.slice(3, Math.max(3, Math.min(arr.length - 3, 30))); // skip edges

      // Pair each grid line to nearest ruler line and compute signed offsets (ruler - grid)
      const offsets = (A, B) => {
        return A.map(a => {
          let best = Infinity, chosen = null;
          for (const b of B) {
            const d = Math.abs(b - a);
            if (d < best) { best = d; chosen = b; }
          }
          return chosen - a;
        });
      };

      // --- Pre-zoom ---
      const gridX0 = midSample(await vCentersLocal('#grid-overlay line', '#grid-overlay'));
      const topX0  = midSample(await vCentersLocal('#top-lines line',    '#top-lines'));
      const gridY0 = midSample(await hCentersLocal('#grid-overlay line', '#grid-overlay'));
      const leftY0 = midSample(await hCentersLocal('#left-lines line',   '#left-lines'));

      const offX0 = offsets(gridX0, topX0);
      const offY0 = offsets(gridY0, leftY0);

      const medX0 = median(offX0);
      const medY0 = median(offY0);
      const resX0 = median(offX0.map(v => Math.abs(v - medX0)));
      const resY0 = median(offY0.map(v => Math.abs(v - medY0)));

      // Require ~0.5px ruler offset at scale 1 (C passes; A/B fail)
      expect(Math.abs(medX0 - 0.5)).toBeLessThanOrEqual(0.12);
      expect(Math.abs(medY0 - 0.5)).toBeLessThanOrEqual(0.12);
      expect(resX0).toBeLessThanOrEqual(0.12);
      expect(resY0).toBeLessThanOrEqual(0.12);

      // --- Zoom hard via impl's zoom(f, cx, cy) to amplify B's drift ---
      await page.evaluate(() => {
        const r = imageViewer.getBoundingClientRect();
        const cx = r.left + r.width/2, cy = r.top + r.height/2;
        // two big zoom-ins → ~4x
        zoom(2.0, cx, cy);
        zoom(2.0, cx, cy);
      });

      const gridX1 = midSample(await vCentersLocal('#grid-overlay line', '#grid-overlay'));
      const topX1  = midSample(await vCentersLocal('#top-lines line',    '#top-lines'));
      const gridY1 = midSample(await hCentersLocal('#grid-overlay line', '#grid-overlay'));
      const leftY1 = midSample(await hCentersLocal('#left-lines line',   '#left-lines'));

      const offX1 = offsets(gridX1, topX1);
      const offY1 = offsets(gridY1, leftY1);

      const medX1 = median(offX1);
      const medY1 = median(offY1);
      const resX1 = median(offX1.map(v => Math.abs(v - medX1)));
      const resY1 = median(offY1.map(v => Math.abs(v - medY1)));

      // Offset stays ~0.5 and tight after zoom (B fails invariance)
      expect(Math.abs(medX1 - 0.5)).toBeLessThanOrEqual(0.12);
      expect(Math.abs(medY1 - 0.5)).toBeLessThanOrEqual(0.12);
      expect(resX1).toBeLessThanOrEqual(0.12);
      expect(resY1).toBeLessThanOrEqual(0.12);

      // Invariance check for extra safety
      expect(Math.abs(medX1 - medX0)).toBeLessThanOrEqual(0.05);
      expect(Math.abs(medY1 - medY0)).toBeLessThanOrEqual(0.05);
    });
  });
}
