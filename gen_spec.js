#!/usr/bin/env node
// Generates a comprehensive spec for writing src/implementation_*.js
// It includes a high-level brief plus embedded CSS, HTML template, and tests.

const fs = require('fs');
const path = require('path');

function read(file) {
  const p = path.resolve(__dirname, file);
  return fs.readFileSync(p, 'utf8');
}

function section(title, content) {
  return `\n\n## ${title}\n\n\n\n${content}`;
}

function codeBlock(lang, content) {
  return `\n\n\n\n\`\`\`${lang}\n${content}\n\`\`\`\n`;
}

function main() {
  const css = read('challenge.css');
  const html = read('tests/fixtures/challenge_template.html');
  const testRunner = read('tests/e2e/challenge_runner.spec.js');
  const gridAlign = read('tests/e2e/grid_alignment.spec.js');
  const config = read('playwright.config.js');

  const brief = `Goal\n- Implement \\`src/implementation_*.js\\` files that power an image viewer with pan+zoom, a grid overlay on the image, and synchronized rulers (top and left).\n- Implementations are loaded via a plain <script> into the provided HTML template and must rely on globally available DOM nodes.\n\nRequired Global Contracts\n- Must expose \\`window.ZOOM_FACTOR\\` (> 1.0) used by the tests to validate zoom buttons.\n- Must set \\`window.imgWidth\\` and \\`window.imgHeight\\` upon image load so tests can await readiness.\n\nCore Behavior\n- Panning: dragging inside the viewer updates \\`translateX\\` and \\`translateY\\` and applies a CSS transform to the image container: \\`translate(px, px) scale(s)\\`.\n- Zooming: mousewheel and +/- buttons call a \\`zoom(factor, cx, cy)\\` function that zooms toward the given client coordinates while keeping rulers and image translation synchronized.\n- Rulers: top ruler represents X divisions (including edge lines), left ruler represents Y divisions (including edge lines).\n- Grid Overlay: draws lines over the image content (excluding edge lines), so its indices differ from the rulers by one. Lines must stay invariant in image space when zooming (non-scaling-stroke).\n\nVisual Crispness\n- Ruler lines render at device pixel centers using a 0.5px offset for crisp 1px lines. You can achieve this by wrapping lines in a translated group (e.g., translate(0.5,0) for vertical lines; translate(0,0.5) for horizontal), while keeping raw coordinates aligned with image-space indices.\n\nSynchronization Requirements\n- After panning: image translateX/Y equals ruler translateX/Y respectively (top tracks X; left tracks Y).\n- After zooming: scale equals \\`window.ZOOM_FACTOR\\` when clicking "+"; rulers’ line positions scale accordingly while overlay grid positions remain invariant in image coordinates.\n\nSizing Rules\n- Top ruler SVG width equals \\`imgWidth * scale\\`.\n- Left ruler SVG height equals \\`imgHeight * scale\\`.\n- Image container uses transform-origin 0 0 and applies translate/scale.\n\nDivisions\n- Use 45 divisions in both X and Y for parity with tests.\n- Grid overlay excludes edges (1..N-1). Rulers include edges (0..N).\n`;

  let out = `# Grid Challenge Implementation Spec\n\nThis document is generated from repo sources to serve as a complete, self-contained prompt for implementing \\`src/implementation_*.js\\`.\n`;
  out += section('High-Level Brief', brief);
  out += section('CSS (challenge.css)', codeBlock('css', css));
  out += section('HTML Template (challenge_template.html)', codeBlock('html', html));
  out += section('Test: Challenge Runner', codeBlock('javascript', testRunner));
  out += section('Test: Grid Alignment', codeBlock('javascript', gridAlign));
  out += section('Playwright Config', codeBlock('javascript', config));

  process.stdout.write(out);
}

main();

