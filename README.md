# 2025 Grid Challenge

A Playwright-based challenge for implementing synchronized pan/zoom with grid and ruler overlays.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Install Playwright browser
npx playwright install chromium

# Run tests (interactive UI mode - recommended)
npm run test:ui
```

## 🎯 The Challenge

Create an implementation file `src/implementation_NAME.js` that implements an interactive image viewer with:

- ✅ **Pan/Drag** - Drag the image to pan it around
- ✅ **Zoom** - Zoom in/out using buttons or mouse wheel  
- ✅ **Grid Synchronization** - Grid overlay stays aligned with the image
- ✅ **Ruler Synchronization** - Top and left rulers sync with image position and scale

## 📁 Project Structure

```
2025-GridChallenge/
├── README.md              → This file - complete documentation
├── gen_spec.js            → Generates SPEC.md for AI agents
├── generate_manual_test.js → Generates manual_test.html
├── playwright.config.js  → Playwright configuration
├── package.json           → Dependencies and scripts
├── challenge.css          → Styles for the UI
│
├── src/                   → Your implementations (auto-discovered)
│   ├── implementation_A.js
│   ├── implementation_B.js
│   └── implementation_C.js
│
└── tests/
    ├── e2e/               → Test suites (auto-discovers all specs)
    │   ├── translation_sync.spec.js
    │   ├── zoom_sync.spec.js
    │   └── grid_alignment.spec.js
    │
    └── fixtures/
        └── challenge_template.html
```

## 📝 Add Your Implementation

1. Create `src/implementation_YOURNAME.js`
2. The test runner **automatically discovers** all files matching `implementation_*.js`
3. No manual configuration needed!

**Note**: The point of this challenge is to write the implementation from scratch using only the specification. Looking at existing implementations defeats the purpose!

## 🧪 Running Tests

| Command | Description |
|---------|-------------|
| `npm run test:ui` | Interactive UI mode (recommended) - opens browser |
| `npm test` | Run all tests - terminal output |
| `npm run test:headed` | Watch tests in browser |
| `npm run test:debug` | Debug mode |
| `npm run spec` | Generate complete specification |
| `npm run manual` | Generate manual_test.html for manual testing |

## 🤖 Testing AI Systems

This challenge is designed to test whether AI systems can solve complex technical problems from specifications alone.

### Generate the Specification

The specification is generated on-the-fly from the current project state:

```bash
npm run spec > SPEC.md
```

This generates `SPEC.md` containing:
- ✅ Complete HTML template
- ✅ All CSS styles
- ✅ JavaScript code examples
- ✅ Test requirements
- ✅ Configuration constants
- ✅ Helper function patterns

**The spec is intentionally complete** - it contains everything needed to write a working implementation without looking at existing code.

### Challenge an AI System (Step by Step)

**Step 1: Generate the specification**
```bash
npm run spec > SPEC.md
```
This creates `SPEC.md` in the project root containing the complete challenge specification.

**Step 2: Send SPEC.md to AI**
Give the AI **ONLY** the `SPEC.md` file (no access to `src/implementation_*.js` files). Ask them to:
> "Read SPEC.md and create a file `src/implementation_AI.js` that implements the required functionality and passes all tests."

**Step 3: Save the AI's implementation**
Put the AI-generated file in the `src/` directory:
```bash
# AI generates: src/implementation_AI.js
# Just save it to src/
```

**Step 4: Test the implementation**
```bash
# Run all tests (tests all implementations)
npm run test:ui

# Or test just one implementation in terminal:
npx playwright test --grep "implementation_AI"
```

The goal is to see if an AI can **one-shot** solve this challenge using only the specification. No hints, no examples, no templates - just the spec.

## 🧪 Manual Testing

For hands-on testing of implementations:

```bash
npm run manual
```

This generates `manual_test.html` with a dropdown selector to switch between implementations. Open `manual_test.html` in a browser to test implementations visually.

**Note**: `manual_test.html` is auto-generated and gitignored - regenerate it after adding new implementations.

## 📚 Implementation Requirements

Your implementation must:

1. **Set global variables** when image loads:
   ```javascript
   window.imgWidth = img.naturalWidth;
   window.imgHeight = img.naturalHeight;
   window.ZOOM_FACTOR = YOUR_ZOOM_FACTOR; // e.g., 1.2, 1.8, etc.
   ```

2. **Use provided global variables** (already in HTML template):
   - `imageViewer`, `imageContainer`, `img`
   - `gridOverlay`, `topLinesSvg`, `leftLinesSvg`
   - `topBar`, `leftBar`
   - `zoomLevelSpan`, `zoomInButton`, `zoomOutButton`

3. **Implement these functions**:
   - `drawGridOverlay()` - Draw 45x45 grid on image
   - `drawTopLines()` - Draw horizontal ruler above image
   - `drawLeftLines()` - Draw vertical ruler beside image
   - `updateTransform()` - Synchronize all transforms
   - `zoom()` - Handle zoom with zoom-to-mouse logic

4. **Handle these events**:
   - Mouse wheel (zoom)
   - Mouse drag (pan)
   - Zoom button clicks
   - Window resize

## ✅ Success Criteria

Your implementation passes the tests if:

### Translation Test ✅
After dragging 50px right, 80px down:
- Image: translateX = 50, translateY = 80
- Top ruler: translateX = 50 (Y stays 0)
- Left ruler: translateY = 80 (X stays 0)

### Scale Test ✅
After clicking zoom-in:
- Scale equals your `ZOOM_FACTOR`
- Ruler lines scale proportionally
- Grid lines maintain relative positions

## 💡 Tips for AI Systems

- **The spec has everything** - Complete HTML, CSS, and JavaScript patterns
- **Start simple** - Get pan/zoom working, then add rulers
- **Test incrementally** - Run `npm run test:ui` after each feature  
- **Read error messages** - Tests tell you exactly what's expected
- **Use the helper functions** - SPEC.md includes all needed patterns

**Important**: No access to existing implementations (like `implementation_A.js`) - that defeats the purpose of the challenge!

## 🔧 Common Issues

**Tests can't find implementations?**
- File must start with `implementation_` and end with `.js`
- File must be in the `src/` directory

**"img.onload is not a function" error?**
- Set up `img.onload = () => { ... }` in your implementation
- Use the global `img` variable provided by the template

**Transform not synchronized?**
- Update `topLinesSvg.style.transform` and `leftLinesSvg.style.transform`
- Both should use the same `translateX` and `translateY` values

## 📊 Grid Specifications

- **45 divisions** in both X and Y directions
- Grid lines: Red, semi-transparent (0.5 opacity)
- Ruler lines: Black, solid
- Line width scales with zoom level
- Labels every 5 divisions on rulers

## 🎓 Current Implementations

- `implementation_A.js` - Standard (ZOOM_FACTOR = 1.2)
- `implementation_B.js` - Fast zoom (ZOOM_FACTOR = 1.8)
- `implementation_C.js` - Slow zoom (ZOOM_FACTOR = 1.05)

All are automatically discovered and tested!

## License

MIT
