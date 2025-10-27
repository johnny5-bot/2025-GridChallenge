// File: 2025-GridChallenge/src/implementation_C.js
// --- Implementation C (Aligned, Invariant) ---
// Crisp 1px rulers with 0.5px offset and invariant alignment after zoom.
// Matches test assumptions: grid overlay excludes edge lines, rulers include edges.

// --- Configurable ---
const GRID_X_DIVISIONS = 45; 
const GRID_Y_DIVISIONS = 45;
const MIN_ZOOM = 0.1;
const MAX_ZOOM = 10.0;
// --- MODIFIED ---
// Set your desired zoom speed here. 
// 1.1 is very slow, 1.5 is fast. 1.2 is a good default.
const ZOOM_FACTOR_INPUT = 1.02; 
// --- END MODIFIED ---

// --- ADDED SAFETY CHECK ---
// The ZOOM_FACTOR must be > 1.0. 
// If a value < 1.0 is given (e.g., 0.8), it inverts the zoom controls.
// This line ensures the factor is always > 1.0.
// (e.g., if ZOOM_FACTOR_INPUT is 0.8, ZOOM_FACTOR becomes 1/0.8 = 1.25)
const ZOOM_FACTOR = (ZOOM_FACTOR_INPUT < 1.0) ? (1.0 / ZOOM_FACTOR_INPUT) : ZOOM_FACTOR_INPUT;
// --- END ADDED ---

// Make ZOOM_FACTOR global for tests
window.ZOOM_FACTOR = ZOOM_FACTOR;
// ------------------

// State variables
let scale = 1.0;
let translateX = 0;
let translateY = 0;
let isDragging = false;
let startX = 0;
let startY = 0;
// Make imgWidth and imgHeight global for the test to wait for
window.imgWidth = 0;
window.imgHeight = 0;

// --- Image Loading and Initial Setup ---
img.onload = () => {
    window.imgWidth = img.naturalWidth;
    window.imgHeight = img.naturalHeight;
    console.log(`Image loaded (Impl C): ${window.imgWidth}x${window.imgHeight}`);

    topLinesSvg.setAttribute('width', window.imgWidth);
    topLinesSvg.setAttribute('height', topBar.clientHeight);
    leftLinesSvg.setAttribute('width', leftBar.clientWidth);
    leftLinesSvg.setAttribute('height', window.imgHeight);

    drawGridOverlay();
    drawTopLines();
    drawLeftLines();
    updateTransform(); 
};

img.onerror = () => {
    console.error("Failed to load image.");
    img.alt = "Failed to load image";
};

img.src = `https://placehold.co/800x800/eee/333?text=Image+800x800`;

// --- Drawing Functions ---
// --- FIXED drawGridOverlay() ---
function drawGridOverlay() {
    gridOverlay.innerHTML = '';
    const stepX = window.imgWidth / GRID_X_DIVISIONS;
    const stepY = window.imgHeight / GRID_Y_DIVISIONS;

    // Exclude edges to match tests (grid has no edge lines)
    for (let i = 1; i < GRID_X_DIVISIONS; i++) {
        const x = i * stepX;
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x);
        line.setAttribute('y1', 0);
        line.setAttribute('x2', x);
        line.setAttribute('y2', window.imgHeight);
        line.setAttribute('stroke-width', 1);
        line.setAttribute('vector-effect', 'non-scaling-stroke');
        gridOverlay.appendChild(line);
    }

    for (let i = 1; i < GRID_Y_DIVISIONS; i++) {
        const y = i * stepY;
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', 0);
        line.setAttribute('y1', y);
        line.setAttribute('x2', window.imgWidth);
        line.setAttribute('y2', y);
        line.setAttribute('stroke-width', 1);
        line.setAttribute('vector-effect', 'non-scaling-stroke');
        gridOverlay.appendChild(line);
    }
}


function drawTopLines() {
    topLinesSvg.innerHTML = '';
    const scaledWidth = window.imgWidth * scale;
    const stepX = scaledWidth / GRID_X_DIVISIONS;
    const barHeight = topBar.clientHeight;

    // Use a translated group so attribute x1 matches grid (no +0.5)
    // while visually lines are shifted by 0.5px for crispness.
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('transform', 'translate(0.5, 0)');

    for (let i = 0; i <= GRID_X_DIVISIONS; i++) {
        const x = (i * stepX);
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x);
        line.setAttribute('y1', 0);
        line.setAttribute('x2', x);
        line.setAttribute('y2', barHeight);
        line.setAttribute('stroke-width', 1);
        line.setAttribute('vector-effect', 'non-scaling-stroke');
        g.appendChild(line);

        if (i % 5 === 0) {
             const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
             text.setAttribute('x', x + 2);
             text.setAttribute('y', 15);
             text.setAttribute('font-size', 10 / scale);
             text.textContent = i;
             g.appendChild(text);
        }
    }
    topLinesSvg.appendChild(g);
    topLinesSvg.setAttribute('width', scaledWidth);
    topLinesSvg.setAttribute('height', barHeight);
}
function drawLeftLines() {
    leftLinesSvg.innerHTML = '';
    const scaledHeight = window.imgHeight * scale;
    const stepY = scaledHeight / GRID_Y_DIVISIONS;
    const barWidth = leftBar.clientWidth;

    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('transform', 'translate(0, 0.5)');

    for (let i = 0; i <= GRID_Y_DIVISIONS; i++) {
        const y = (i * stepY);
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', 0);
        line.setAttribute('y1', y);
        line.setAttribute('x2', barWidth);
        line.setAttribute('y2', y);
        line.setAttribute('stroke-width', 1);
        line.setAttribute('vector-effect', 'non-scaling-stroke');
        g.appendChild(line);

        if (i % 5 === 0) {
             const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
             text.setAttribute('x', barWidth - 15);
             text.setAttribute('y', y + 10);
             text.setAttribute('font-size', 10 / scale); 
             text.setAttribute('text-anchor', 'end');
             text.textContent = i;
             g.appendChild(text);
        }
    }
    leftLinesSvg.appendChild(g);
    leftLinesSvg.setAttribute('width', barWidth);
    leftLinesSvg.setAttribute('height', scaledHeight); 
}

// --- Transform and Sync Logic ---
function updateTransform() {
    if (!window.imgWidth || !window.imgHeight) return;

    imageContainer.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;

    const scaledWidth = window.imgWidth * scale;
    const scaledHeight = window.imgHeight * scale;

    topLinesSvg.style.transform = `translateX(${translateX}px)`;
    leftLinesSvg.style.transform = `translateY(${translateY}px)`;

    // Keep ruler SVG viewboxes sized to scaled image
    topLinesSvg.setAttribute('width', scaledWidth);
    leftLinesSvg.setAttribute('height', scaledHeight);

    zoomLevelSpan.textContent = `${Math.round(scale * 100)}%`;
    // --- MODIFIED ---
    // We only need to redraw the grid overlay if the scale changes,
    // but redrawing the rulers is necessary for the text labels.
    // To keep logic simple, we can just redraw all.
    // However, if performance was an issue, we'd only call drawGridOverlay
    // from the zoom() function. For now, this is fine.
    drawGridOverlay(); 
    drawTopLines();
    drawLeftLines();
    // --- END MODIFIED ---
}

// --- Event Handlers ---
function zoom(factor, clientX, clientY) {
    const newScale = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, scale * factor));
    if (newScale === scale) return;

    const rect = imageContainer.getBoundingClientRect();
    const mouseX = clientX - rect.left;
    const mouseY = clientY - rect.top;

    const scaleChange = newScale / scale;

    translateX = mouseX - (mouseX - translateX) * scaleChange;
    translateY = mouseY - (mouseY - translateY) * scaleChange;

    scale = newScale;

    // --- MODIFIED ---
    // updateTransform will now redraw everything
    updateTransform();
    // --- END MODIFIED ---
}

imageViewer.addEventListener('wheel', (e) => {
    e.preventDefault(); 
    const factor = e.deltaY < 0 ? ZOOM_FACTOR : 1 / ZOOM_FACTOR;
    zoom(factor, e.clientX, e.clientY);
}, { passive: false });

imageContainer.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.clientX - translateX;
    startY = e.clientY - translateY;
    imageViewer.style.cursor = 'grabbing';
    imageContainer.style.willChange = 'transform';
});

window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    translateX = e.clientX - startX;
    translateY = e.clientY - startY;
    updateTransform();
});

window.addEventListener('mouseup', () => {
    if (isDragging) {
        isDragging = false;
        imageViewer.style.cursor = 'grab';
        imageContainer.style.willChange = 'auto';
    }
});

zoomInButton.addEventListener('click', () => {
    const rect = imageViewer.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    zoom(ZOOM_FACTOR, centerX, centerY);
});

zoomOutButton.addEventListener('click', () => {
     const rect = imageViewer.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    zoom(1 / ZOOM_FACTOR, centerX, centerY);
});

window.addEventListener('resize', () => {
    // Redraw rulers on resize
    drawTopLines();
    drawLeftLines();
});
