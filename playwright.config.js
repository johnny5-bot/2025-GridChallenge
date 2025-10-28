// File: 2025-GridChallenge/playwright.config.js
const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  // Tell Playwright where to look for test files
  testDir: './tests/e2e',
  fullyParallel: true,
  timeout: 3000,
  // --- UPDATED REPORTER SECTION ---
  // We've changed 'reporter' from a simple string to an array of arrays.
  // This tells Playwright to use multiple reporters.
  reporter: [
    ['list'],  // Show test names in console
    ['html'], 
    ['json', { outputFile: 'test-results.json' }]
  ],
  // --- END OF UPDATE ---
  
  use: {
    trace: 'on-first-retry',
  },
});

