#!/usr/bin/env node

/**
 * Generate manual_test.html with auto-discovered implementations
 * Usage: node scripts/generate_manual_test.js > manual_test.html
 */

const fs = require('fs');
const path = require('path');

// Discover all implementations
const srcPath = path.join(__dirname, '../src');
const implementationFiles = fs.readdirSync(srcPath)
  .filter(file => file.startsWith('implementation_') && file.endsWith('.js'))
  .sort();

// Generate implementations array
const implementations = implementationFiles.map((file, index) => {
  const letter = String.fromCharCode(65 + index); // A, B, C, D, ...
  return `{ label: 'Implementation ${letter}', value: './src/${file}' }`;
}).join(',\n            ');

// Generate the dynamic loading script
const dynamicLoader = `
        // Auto-discovered implementations
        const implementations = [
            ${implementations}
        ];`;

console.log(`
<!-- 
    File: manual_test.html
    THIS FILE IS AUTO-GENERATED - Do not edit manually!
    Run: node scripts/generate_manual_test.js > manual_test.html
-->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MANUAL TEST</title>
    <link rel="stylesheet" href="./challenge.css">
</head>
<body>
    <div class="app-container">
        <div id="top-left" class="grid-cell"></div>
        <div id="top-center" class="grid-cell">
            <svg id="top-lines"></svg>
        </div>
        <div id="top-right" class="grid-cell"></div>

        <div id="left-center" class="grid-cell">
            <svg id="left-lines"></svg>
        </div>

        <div id="center-center" class="grid-cell">
            <div id="image-container">
                <img id="image-element" alt="Load image...">
                <svg id="grid-overlay" class="svg-overlay"></svg>
            </div>
            <div class="zoom-controls">
                <button id="zoom-out">-</button>
                <span id="zoom-level" style="color: white; margin: 0 5px;">100%</span>
                <button id="zoom-in">+</button>
            </div>
            <!-- Implementation selector UI -->
            <div id="impl-selector" style="position: absolute; top: 50px; right: 10px; background: rgba(0,0,0,0.5); padding: 5px; border-radius: 3px; display: flex; align-items: center; font-family: sans-serif; font-size: 12px;">
                <label for="implSelect" style="color: white; margin-right: 5px;">Implementation: </label>
                <select id="implSelect" style="padding: 2px 5px;">
                    <!-- options populated by script -->
                </select>
            </div>
        </div>

        <div id="right-center" class="grid-cell"></div>
    </div>

    <script>
        const imageViewer = document.getElementById('center-center');
        const imageContainer = document.getElementById('image-container');
        const img = document.getElementById('image-element');
        const gridOverlay = document.getElementById('grid-overlay');
        const topBar = document.getElementById('top-center');
        const leftBar = document.getElementById('left-center');
        const topLinesSvg = document.getElementById('top-lines');
        const leftLinesSvg = document.getElementById('left-lines');
        const zoomLevelSpan = document.getElementById('zoom-level');
        const zoomInButton = document.getElementById('zoom-in');
        const zoomOutButton = document.getElementById('zoom-out');
    </script>

    <script>${dynamicLoader}
        const params = new URLSearchParams(window.location.search);
        const implFromUrl = params.get('impl');
        const implFile = implFromUrl ? implFromUrl : implementations[0].value;

        const implSelect = document.getElementById('implSelect');
        if (implSelect) {
            implementations.forEach(opt => {
                const o = document.createElement('option');
                o.value = opt.value;
                o.textContent = opt.label;
                if (opt.value === implFile) o.selected = true;
                implSelect.appendChild(o);
            });
            implSelect.addEventListener('change', () => {
                window.location.search = '?impl=' + encodeURIComponent(implSelect.value);
            });
        }

        document.title = 'MANUAL TEST - ' + implFile;

        const scriptTag = document.createElement('script');
        scriptTag.onerror = () => {
            document.body.innerHTML = '<h1 style="color: red; font-family: sans-serif; padding: 20px;">Error: Could not load script: ' + implFile + '</h1><p style="font-family: sans-serif; padding: 20px;">Make sure the file exists and the path is correct in the URL (e.g., ?impl=src/implementation_A.js)</p>';
        };
        scriptTag.src = implFile;
        document.body.appendChild(scriptTag);
    </script>
</body>
</html>
`);

