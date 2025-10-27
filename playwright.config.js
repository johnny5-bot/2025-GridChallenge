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
    // 1. The 'html' reporter you already have
    ['html'], 
    
    // 2. The new 'json' reporter
    // This will create a single 'test-results.json' file in your root folder
    ['json', { outputFile: 'test-results.json' }]
    
    // 3. (Optional) A 'junit' reporter, common for CI/CD systems
    // ['junit', { outputFile: 'test-results.xml' }]
  ],
  // --- END OF UPDATE ---
  
  use: {
    trace: 'on-first-retry',
  },
});

