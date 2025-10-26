# Grid Challenge 2025

A testing project for multiple grid implementation approaches using Playwright.

## Project Structure

```
my-grid-project/
├── node_modules/           # Installed by 'npm install'
├── package.json            # Project manifest
├── playwright.config.js    # Playwright configuration
│
├── src/                    # All different implementations
│   ├── implementation_A.js
│   ├── implementation_B.js
│   └── ... (etc)
│
└── tests/                  # All test-related files
    ├── e2e/                # End-to-end test specs
    │   └── grid_runner.spec.js
    │
    └── fixtures/           # Test assets (like HTML templates)
        └── grid_template.html
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Install Playwright browsers:
```bash
npx playwright install
```

## Running Tests

- Run all tests: `npm test`
- Run with UI: `npm run test:ui`
- Run in headed mode: `npm run test:headed`
- Debug tests: `npm run test:debug`

### Dump to JSON

```
npx playwright test --reporter=json >test-results.json
```

### Bundle repo including test-results.json to send AI

```
repomix # writes repomix-output.xml
```

## Adding New Implementations

1. Create a new implementation file in `src/` (e.g., `implementation_C.js`)
2. Export a `createGrid` function with the signature:
   ```javascript
   export function createGrid(container, items, config = {}) {
       // Your implementation here
   }
   ```
3. Import and test it in `tests/e2e/grid_runner.spec.js`

## License

MIT

