// === GLOBAL VARIABLES & SETUP ===
const rainCanvas = document.getElementById('visual-canvas');
const rainCtx = rainCanvas.getContext('2d');
const waveCanvas = document.getElementById('wave-canvas');
const waveCtx = waveCanvas.getContext('2d');
const fxCanvas = document.getElementById('fx-canvas');
const fxCtx = fxCanvas.getContext('2d');
const cloudLayer = document.getElementById('cloud-layer');
const birdLayer = document.getElementById('bird-layer');
const splashOverlay = document.getElementById('splash-overlay');

// Scroll Logic Elements
const hero = document.querySelector('.hero');
const heroTitle = document.getElementById('hero-title');
const heroStatus = document.getElementById('hero-status');
const stage = document.getElementById('director-stage');
const water = document.getElementById('water-level');
const chars = document.querySelectorAll('.sink-char');
const cord = document.getElementById('rescue-cord');
const drone = document.getElementById('rescue-drone');
const grid = document.getElementById('intervention-grid');
const status = document.getElementById('status-display');
const hud = document.getElementById('zone-display');
const fence = document.getElementById('obj-fence');
const tree = document.getElementById('obj-tree');

// State Variables
let width, height;
let globalRain = 20;
let isPageVisible = true;
let scrollSpeed = 0;
let lastY = window.scrollY;
let lastT = performance.now();
let heroTriggered = false;

// RAF IDs (Safety Pattern)
let rainRaf = 0;
let waveRaf = 0;
let fxRaf = 0;
let cursorRaf = 0;

// Fish Globals
const fishCanvas = document.getElementById('fish-canvas');
const fishCtx = fishCanvas.getContext('2d');
let fishRaf = 0;
let fishW = 0, fishH = 0;

// Data Arrays
const rains = [];
const droplets = [];
const bubbles = [];
const fishes = [];
const FISH_MAX = 10;

// Reduced Motion
const reduceMotionMQ = window.matchMedia('(prefers-reduced-motion: reduce)');

function shouldAnimate() {
    return !reduceMotionMQ.matches && localStorage.getItem('floodzy_motion') !== 'off';
}

// === TOGGLE LOGIC ===
function toggleMotion() {
    const isCurrentlyOn = shouldAnimate();
    const newState = isCurrentlyOn ? 'off' : 'on';
    localStorage.setItem('floodzy_motion', newState);

    // Update UI
    const btnText = document.getElementById('anim-status');
    if (btnText) btnText.innerText = newState === 'on' ? 'ON' : 'OFF';

    if (newState === 'off') {
        stopRain();
        stopWave();
        stopFx();
        stopFish();
        stopCursor();
        document.body.classList.add('reduce-motion');
    } else {
        startRain();
        startWave();
        startFx();
        startFish();
        startCursor();
        document.body.classList.remove('reduce-motion');
    }
}

// Init Button Text
const savedPref = localStorage.getItem('floodzy_motion');
if (savedPref === 'off') {
    const btnText = document.getElementById('anim-status');
    if (btnText) btnText.innerText = 'OFF';
}

// === CLASS DEFINITIONS ===
class Drop {
    constructor() {
        this.init();
    }
    init() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.speed = Math.random() * 8 + 5;
        this.len = Math.random() * 30 + 10;
        this.alpha = Math.random() * 0.2 + 0.05;
    }
    update(intensity) {
        this.y += this.speed + (intensity / 5);
        if (this.y > height) {
            this.y = -20;
            this.x = Math.random() * width;
        }
    }
    draw() {
        rainCtx.strokeStyle = `rgba(46, 242, 255, ${this.alpha})`;
        rainCtx.lineWidth = 1;
        rainCtx.beginPath();
        rainCtx.moveTo(this.x, this.y);
        rainCtx.lineTo(this.x, this.y + this.len);
        rainCtx.stroke();
    }
}

// === RESIZE HANDLER ===
function setupCanvas(canvas, ctx, cssW, cssH) {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.floor(cssW * dpr);
    canvas.height = Math.floor(cssH * dpr);
    canvas.style.width = cssW + 'px';
    canvas.style.height = cssH + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return dpr;
}

function syncFishCanvas(force = false) {
    if (!fishCanvas || !fishCtx || !water) return;
    const r = water.getBoundingClientRect();
    const cssW = Math.max(0, Math.floor(r.width));
    const cssH = Math.max(0, Math.floor(r.height));
    if (!force && Math.abs(cssW - fishW) < 2 && Math.abs(cssH - fishH) < 2) return;
    fishW = cssW;
    fishH = cssH;
    // Keep CSS sizing controlled by stylesheet (100%)
    fishCanvas.style.width = '100%';
    fishCanvas.style.height = '100%';
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    fishCanvas.width = Math.floor(cssW * dpr);
    fishCanvas.height = Math.floor(cssH * dpr);
    fishCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // Optional: kalau air tipis, bersihin & kosongkan ikan biar gak “nyangkut”
    if (fishH < 40) {
        fishes.length = 0;
        fishCtx.clearRect(0, 0, fishW, fishH);
    }
}

function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    setupCanvas(rainCanvas, rainCtx, width, height);
    setupCanvas(fxCanvas, fxCtx, width, height);
    if (waveCanvas) {
        setupCanvas(waveCanvas, waveCtx, width, 120);
    }
    syncFishCanvas(true);
    // Mobile Opt: Resize Rain Array
    const targetCount = width < 768 ? 40 : 100;
    if (rains.length > targetCount) rains.length = targetCount;
    // Only push if width is defined and we need more
    if (width) {
        while (rains.length < targetCount) rains.push(new Drop());
    }
}
window.addEventListener('resize', resize);

// Performance: Pause FX when stage not visible
const stageObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
        if (!e.isIntersecting) {
            stopWave();
            stopFx();
            stopFish();
        } else {
            startWave();
            startFx();
            startFish();
        }
    });
}, {
    threshold: 0
});
if (stage) stageObserver.observe(stage);

// === INITIALIZATION ===
resize(); // Set initial W/H
// Initial populate (safe now that dimensions are set)
while (rains.length < (width < 768 ? 40 : 100)) rains.push(new Drop());

// === ATMOSPHERE INIT ===
function svgCloudDataUri() {
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='420' height='160' viewBox='0 0 420 160'>
<defs>
<linearGradient id='g' x1='0' y1='0' x2='0' y2='1'>
<stop offset='0' stop-color='rgba(46,242,255,0.20)'/>
<stop offset='1' stop-color='rgba(46,242,255,0.02)'/>
</linearGradient>
</defs>
<path d='M110 120c-35 0-60-20-60-45 0-22 18-40 44-44 10-20 32-33 58-33 30 0 55 18 62 43 26 2 46 20 46 42 0 25-25 37-56 37H110z' fill='url(#g)'/>
</svg>`;
    return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

function svgBirdDataUri() {
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='80' height='40' viewBox='0 0 80 40'>
<path d='M5 25c10-10 20-10 30 0 10-10 20-10 30 0' fill='none' stroke='rgba(46,242,255,0.45)' stroke-width='3' stroke-linecap='round'/>
</svg>`;
    return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

function initAtmos() {
    const cloudBg = svgCloudDataUri();
    for (let i = 0; i < 5; i++) {
        const c = document.createElement('div');
        c.className = 'cloud';
        c.style.backgroundImage = cloudBg;
        c.style.top = (8 + Math.random() * 22) + '%';
        c.style.left = (-40 - Math.random() * 60) + 'vw';
        c.style.opacity = (0.25 + Math.random() * 0.25).toFixed(2);
        c.style.transform = `scale(${(0.6 + Math.random() * 0.7).toFixed(2)})`;
        c.style.animationDuration = (45 + Math.random() * 45).toFixed(0) + 's';
        c.style.animationDelay = (-Math.random() * 40).toFixed(0) + 's';
        cloudLayer.appendChild(c);
    }
    const birdBg = svgBirdDataUri();
    for (let i = 0; i < 4; i++) {
        const b = document.createElement('div');
        b.className = 'bird';
        b.style.backgroundImage = birdBg;
        b.style.top = (12 + Math.random() * 18) + '%';
        b.style.left = (-20 - Math.random() * 30) + 'vw';
        b.style.opacity = (0.18 + Math.random() * 0.25).toFixed(2);
        b.style.animationDuration = (18 + Math.random() * 20).toFixed(0) + 's';
        b.style.animationDelay = (-Math.random() * 16).toFixed(0) + 's';
        birdLayer.appendChild(b);
    }
}
initAtmos();

// === ANIMATION LOOP FUNCTIONS ===
// 1. Rain
function animateRain() {
    rainCtx.clearRect(0, 0, width, height);
    rains.forEach(r => {
        r.update(globalRain);
        r.draw();
    });
    rainRaf = requestAnimationFrame(animateRain);
}

function startRain() {
    if (!rainRaf) rainRaf = requestAnimationFrame(animateRain);
}

function stopRain() {
    if (!rainRaf) return;
    cancelAnimationFrame(rainRaf);
    rainRaf = 0;
}

// 2. Wave
let waveTime = 0;
const WAVE_H = 120;

function drawWave(level = 20) {
    if (!waveCtx) return;
    // Use CSS units for clearRect and logic
    waveCtx.clearRect(0, 0, width, WAVE_H);
    const baseHeight = WAVE_H * 0.5;
    const amp = 10 + (level * 0.3);
    waveCtx.beginPath();
    waveCtx.moveTo(0, baseHeight);
    // Draw using CSS pixels (width) not buffer width
    for (let x = 0; x <= width; x += 2) {
        const y = Math.sin(x * 0.01 + waveTime) * amp + Math.sin(x * 0.02 + waveTime * 1.5) * (amp * 0.5) + Math.sin(x * 0.005 + waveTime * 0.5) * (amp * 0.2);
        waveCtx.lineTo(x, baseHeight + y);
    }
    waveCtx.lineTo(width, WAVE_H);
    waveCtx.lineTo(0, WAVE_H);
    waveCtx.closePath();
    const grad = waveCtx.createLinearGradient(0, 0, 0, WAVE_H);
    grad.addColorStop(0, 'rgba(46, 242, 255, 0.9)');
    grad.addColorStop(1, 'rgba(46, 242, 255, 0.1)');
    waveCtx.fillStyle = grad;
    waveCtx.shadowColor = 'rgba(46, 242, 255, 0.8)';
    waveCtx.shadowBlur = 15;
    waveCtx.fill();
    waveCtx.globalCompositeOperation = 'source-atop';
    waveCtx.fillStyle = 'rgba(255,255,255,0.3)';
    if (level > 60) waveCtx.fillRect(0, 0, width, 15);
    waveCtx.globalCompositeOperation = 'source-over';
    waveCtx.shadowBlur = 0;
}

function loopWave() {
    waveTime += 0.02;
    drawWave(globalRain);
    waveRaf = requestAnimationFrame(loopWave);
}

function startWave() {
    if (!waveRaf) waveRaf = requestAnimationFrame(loopWave);
}

function stopWave() {
    if (!waveRaf) return;
    cancelAnimationFrame(waveRaf);
    waveRaf = 0;
}

// 3. FX (Droplets + Bubbles)
const MAX_DROPLETS = 600;
const MAX_BUBBLES = 300;

function spawnDropletBurst(power) {
    if (droplets.length > MAX_DROPLETS) return;
    const count = Math.floor(18 + power * 42);
    for (let i = 0; i < count; i++) {
        droplets.push({
            x: window.innerWidth * (0.25 + Math.random() * 0.5),
            y: window.innerHeight * (0.35 + Math.random() * 0.35),
            vx: (Math.random() - 0.5) * (3 + power * 10),
            vy: (-2 - Math.random() * 6) * (1 + power),
            r: 1 + Math.random() * (2 + power * 3),
            a: 0.25 + Math.random() * 0.35,
            life: 1
        });
    }
}

function spawnBubbleBurst(x, count = 5) {
    if (bubbles.length >= MAX_BUBBLES) return;
    const remaining = MAX_BUBBLES - bubbles.length;
    const c = Math.min(count, remaining);
    for (let i = 0; i < c; i++) {
        bubbles.push({
            x: x + (Math.random() - 0.5) * 20,
            y: window.innerHeight + 10,
            vy: 2 + Math.random() * 3, // Faster upward speed
            r: 2 + Math.random() * 5,
            a: 0.4 + Math.random() * 0.4,
            wobble: Math.random() * Math.PI * 2
        });
    }
}

function spawnBubble() {
    if (bubbles.length > MAX_BUBBLES) return;
    if (!water) return;
    const waterRect = water.getBoundingClientRect();
    if (waterRect.height < 40) return;
    const x = Math.random() * window.innerWidth;
    const y = waterRect.top + waterRect.height - (Math.random() * 20);
    bubbles.push({
        x,
        y,
        vy: 0.4 + Math.random() * 1.2,
        r: 1.5 + Math.random() * 4,
        a: 0.10 + Math.random() * 0.18,
        wobble: Math.random() * Math.PI * 2
    });
}

function fxLoop() {
    fxCtx.clearRect(0, 0, width, height);
    // Spawn logic
    const bubbleRate = (globalRain / 100) * 0.8;
    if (Math.random() < bubbleRate) spawnBubble();
    // Render Bubbles
    fxCtx.globalCompositeOperation = 'lighter';
    for (let i = bubbles.length - 1; i >= 0; i--) {
        const b = bubbles[i];
        b.wobble += 0.06;
        b.y -= b.vy;
        b.x += Math.sin(b.wobble) * 0.35;
        b.a *= 0.998;
        fxCtx.beginPath();
        fxCtx.strokeStyle = `rgba(255,255,255,${b.a})`;
        fxCtx.lineWidth = 1;
        fxCtx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        fxCtx.stroke();
        if (b.y < 0 || b.a < 0.02) bubbles.splice(i, 1);
    }
    // Render Droplets
    fxCtx.globalCompositeOperation = 'screen';
    for (let i = droplets.length - 1; i >= 0; i--) {
        const d = droplets[i];
        d.x += d.vx;
        d.y += d.vy;
        d.vy += 0.18;
        d.vx *= 0.985;
        d.life *= 0.965;
        d.a *= 0.97;
        fxCtx.beginPath();
        fxCtx.fillStyle = `rgba(46,242,255,${d.a})`;
        fxCtx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        fxCtx.fill();
        if (d.life < 0.08 || d.y > window.innerHeight + 50) droplets.splice(i, 1);
    }
    fxCtx.globalCompositeOperation = 'source-over';
    fxRaf = requestAnimationFrame(fxLoop);
}

function startFx() {
    if (!fxRaf) fxRaf = requestAnimationFrame(fxLoop);
}

function stopFx() {
    if (!fxRaf) return;
    cancelAnimationFrame(fxRaf);
    fxRaf = 0;
}

function rand(a, b) {
    return a + Math.random() * (b - a);
}

function spawnFish() {
    if (fishes.length >= FISH_MAX) return;
    const dir = Math.random() > 0.5 ? 1 : -1;
    const depth = rand(0.2, 1.0); // 0 dekat kamera, 1 jauh
    const s = 0.6 + (1.1 - depth) * 0.8; // makin dekat = makin besar
    fishes.push({
        x: dir === 1 ? -rand(30, 120) : fishW + rand(30, 120),
        y: rand(fishH * 0.55, fishH * 0.95), // selalu bawah (lebih natural)
        dir,
        depth,
        s,
        sp: (0.35 + (1.2 - depth) * 0.9) * (dir),
        ph: rand(0, Math.PI * 2),
        wob: rand(0.6, 1.4),
        life: rand(0.6, 1.0),
    });
}

function drawFishShape(ctx, x, y, s, dir, t, depth) {
    // Silhouette + rim light tipis
    const bodyL = 26 * s;
    const bodyH = 10 * s;
    const tailL = 10 * s;
    const bob = Math.sin(t * 1.2 + depth * 4) * (1.2 * s);
    const sway = Math.sin(t * 2.4 + depth * 3) * (0.35 * s);
    ctx.save();
    ctx.translate(x, y + bob);
    ctx.scale(dir, 1);
    // body
    ctx.beginPath();
    ctx.ellipse(0, 0, bodyL * 0.5, bodyH * 0.5, sway, 0, Math.PI * 2);
    // tail
    ctx.moveTo(-bodyL * 0.55, 0);
    ctx.lineTo(-bodyL * 0.55 - tailL, -bodyH * 0.35);
    ctx.lineTo(-bodyL * 0.55 - tailL, bodyH * 0.35);
    ctx.closePath();
    // fill silhouette (gelap halus supaya “underwater”)
    ctx.fillStyle = `rgba(0,0,0,${0.10 + (1 - depth) * 0.08})`;
    ctx.fill();
    // rim light
    ctx.strokeStyle = `rgba(46,242,255,${0.08 + (1 - depth) * 0.10})`;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
}

function fishLoop() {
    if (!fishCtx) {
        fishRaf = 0;
        return;
    }
    // Jangan matikan loop; cukup skip render kalau air tipis
    if (fishH < 40 || fishW < 40) {
        fishRaf = requestAnimationFrame(fishLoop);
        return;
    }
    fishCtx.clearRect(0, 0, fishW, fishH);
    // ikan cuma muncul kalau air sudah cukup tinggi // (kalau mau selalu ada, hapus kondisi ini)
    const waterRect = water.getBoundingClientRect();
    if (waterRect.height < window.innerHeight * 0.35) {
        fishRaf = requestAnimationFrame(fishLoop);
        return;
    }
    // spawn rate menyesuaikan intensitas
    const spawnChance = 0.015 + (globalRain / 100) * 0.02;
    if (Math.random() < spawnChance) spawnFish();
    const t = performance.now() / 1000;
    for (let i = fishes.length - 1; i >= 0; i--) {
        const f = fishes[i];
        f.x += f.sp;
        f.ph += 0.02 * f.wob;
        // kecilkan “kehadiran” saat CRITICAL biar tidak ramai
        const fade = (globalRain > 85) ? 0.6 : 1.0;
        fishCtx.globalAlpha = f.life * fade;
        drawFishShape(fishCtx, f.x, f.y, f.s, f.dir, t + f.ph, f.depth);
        // wrap / kill
        if (f.dir === 1 && f.x > fishW + 140) fishes.splice(i, 1);
        else if (f.dir === -1 && f.x < -140) fishes.splice(i, 1);
    }
    fishCtx.globalAlpha = 1;
    fishRaf = requestAnimationFrame(fishLoop);
}

function startFish() {
    if (!fishRaf) fishRaf = requestAnimationFrame(fishLoop);
}

function stopFish() {
    if (!fishRaf) return;
    cancelAnimationFrame(fishRaf);
    fishRaf = 0;
}

// === START ANIMATIONS ===
let fxEnabled = true;

if (window.innerWidth < 600) {
    fxEnabled = false;
    // Ensure all heavy updates are stopped/cleared if logic runs these by default
}

if (shouldAnimate() && fxEnabled) {
    startRain();
    startWave();
    startFx();
    startFish();
}

// === CURSOR LOGIC ===
const dot = document.getElementById('cursor-dot');
const ring = document.getElementById('cursor-ring');
let cursorX = 0,
    cursorY = 0,
    ringX = 0,
    ringY = 0,
    isCursorActive = false;

function cursorLoop() {
    if (!isCursorActive) {
        cursorRaf = 0;
        return;
    }
    ringX += (cursorX - ringX) * 0.15;
    ringY += (cursorY - ringY) * 0.15;
    ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
    cursorRaf = requestAnimationFrame(cursorLoop);
}

function startCursor() {
    if (!cursorRaf && isCursorActive) cursorRaf = requestAnimationFrame(cursorLoop);
}

function stopCursor() {
    if (!cursorRaf) return;
    cancelAnimationFrame(cursorRaf);
    cursorRaf = 0;
}
document.addEventListener('mousemove', e => {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    cursorX = e.clientX;
    cursorY = e.clientY;
    dot.style.display = 'block';
    dot.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%)`;
    if (!isCursorActive) {
        isCursorActive = true;
        ring.style.display = 'block';
        ringX = cursorX;
        ringY = cursorY;
        startCursor();
    }
});

// === SCROLL & INTERACTION Logic ===
function updateScrollSpeed() {
    const now = performance.now();
    const dy = Math.abs(window.scrollY - lastY);
    const dt = Math.max(16, now - lastT);
    scrollSpeed = Math.min(1, (dy / dt) * 0.9);
    lastY = window.scrollY;
    lastT = now;
}
window.addEventListener('scroll', updateScrollSpeed, {
    passive: true
});

// Hero Transition
window.addEventListener('scroll', () => {
    if (window.scrollY > 40 && !heroTriggered) {
        hero.classList.add('entering');
        heroTriggered = true;
        setTimeout(() => {
            heroTitle.style.opacity = 0;
            heroStatus.style.opacity = 0;
            setTimeout(() => {
                heroTitle.innerText = "Predict the Surge.";
                heroStatus.innerText = "Director's Cut Simulation";
                heroTitle.style.opacity = 1;
                heroStatus.style.opacity = 1;
            }, 500);
        }, 800);
    }
});

// Loop for Scroll Speed + handleScroll
let ticking = false;
window.addEventListener('scroll', () => {
    if (!ticking) {
        requestAnimationFrame(() => {
            handleScroll();
            ticking = false;
        });
        ticking = true;
    }
});

function easeInOut(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function applySplashFX(p) {
    const inCriticalBand = (p > 0.40 && p < 0.72);
    const power = inCriticalBand ? Math.min(1, (p - 0.40) / 0.18) : 0;
    const overlayOpacity = Math.min(0.85, power * (0.35 + scrollSpeed * 0.9));
    splashOverlay.style.opacity = overlayOpacity.toFixed(3);
    splashOverlay.style.transform = `scale(${(0.98 + power * 0.05).toFixed(3)})`;
    splashOverlay.style.filter = `blur(${(power * 6).toFixed(1)}px) saturate(${(110 + power * 25).toFixed(0)}%)`;
    if (inCriticalBand && scrollSpeed > 0.35 && Math.random() > 0.35) {
        spawnDropletBurst(Math.min(1, power + scrollSpeed));
    }
}

function handleScroll() {
    const rect = stage.getBoundingClientRect();
    let rawP = (window.innerHeight - rect.top) / rect.height;
    rawP = Math.max(0, Math.min(1, rawP));
    const p = easeInOut(rawP);
    applySplashFX(p);

    // Toggle Fish Visibility removed (handled in loop) // water.classList.toggle('fish-on', p > 0.25); // Micro-Shake
    if (p > 0.45 && p < 0.7) document.body.classList.add('failure');
    else document.body.classList.remove('failure');

    if (p < 0.2) {
        setZone("MONITORING", "NORMAL", "#FFF");
        water.style.height = (p * 100) + '%';
        globalRain = 30;
        resetProps();
        resetSink();
    } else if (p < 0.45) {
        // Set seen flag early
        // if (!localStorage.getItem('floodzy_seen')) localStorage.setItem('floodzy_seen', 'yes');
        setZone("WARNING", "RISING", "#FFD60A");
        water.style.height = (p * 120) + '%';
        fence.classList.add('shaking');
        globalRain = 60;
        resetProps();
    } else if (p < 0.70) {
        setZone("CRITICAL", "FAILURE", "#FF3B30");
        water.style.height = '90%';
        globalRain = 100;
        fence.className = 'scenery-obj fence-drift';
        tree.className = 'scenery-obj tree-fall';
        chars.forEach((c, i) => setTimeout(() => c.classList.add('drowning'), i * 100));
    } else if (p < 0.90) {
        setZone("DEPLOYMENT", "RESCUE", "#2EF2FF");
        water.style.height = '80%';
        globalRain = 50;
        cord.style.top = '0';
        drone.style.top = '50%';
    } else {
        setZone("SYSTEM", "INTERVENTION", "#2EF2FF");
        grid.style.opacity = 0.8;
        water.style.height = '40%';
        emergeSink();
        // Staggered resurface
        drone.style.top = '-100px';
        cord.style.top = '-100px';
    }
    syncFishCanvas(false);
}

function setZone(z, s, c) {
    hud.innerText = `ZONE: ${z}`;
    status.innerText = s;
    status.style.color = c;
    if (z === "CRITICAL") status.classList.add('disaster');
    else status.classList.remove('disaster');
}

function resetSink() {
    chars.forEach(c => {
        c.classList.remove('drowning');
        c.classList.remove('resurfacing');
    });
}

function emergeSink() {
    chars.forEach((c, i) => {
        if (c.classList.contains('drowning')) {
            c.classList.remove('drowning');
            c.classList.add('resurfacing');
            c.style.animationDelay = (i * 0.1) + 's';
            // SYNC: Burst bubbles under the letter
            const rect = c.getBoundingClientRect();
            setTimeout(() => {
                spawnBubbleBurst(rect.left + rect.width / 2, 6);
            }, i * 100);
            setTimeout(() => c.classList.remove('resurfacing'), 2000);
        }
    });
}

function resetProps() {
    fence.className = 'scenery-obj';
    tree.className = 'scenery-obj';
}

// Sunrise
const sunSection = document.getElementById('final-sunrise');
const sunOrb = document.querySelector('.sun-orb');
const network = document.querySelector('.final-network');
const obs = new IntersectionObserver(e => {
    if (e[0].isIntersecting) {
        sunOrb.classList.add('rise');
        network.style.opacity = 1;
        rainCanvas.style.opacity = 0;
    } else {
        rainCanvas.style.opacity = 1;
    }
}, {
    threshold: 0.5
});
obs.observe(sunSection);

// Playground
const playground = document.querySelector('.playground-container');
if (playground) {
    playground.addEventListener('mouseenter', () => document.body.classList.add('sentinel-active'));
    playground.addEventListener('mouseleave', () => document.body.classList.remove('sentinel-active'));
}

// Sim Map Logic
const map = document.getElementById('sim-map');
const sensorCount = document.getElementById('sensor-count');
const nodes = [];
for (let i = 0; i < 12; i++) {
    let n = document.createElement('div');
    let type = Math.random() > 0.5 ? 'RIVER' : 'RAIN';
    n.className = 'node pulse';
    n.dataset.type = type;
    n.style.left = (10 + Math.random() * 80) + '%';
    n.style.top = (10 + Math.random() * 80) + '%';
    n.style.animationDelay = Math.random() + 's';
    map.appendChild(n);
    nodes.push(n);
}
const rainSlider = document.getElementById('rain-slider');
const riverSlider = document.getElementById('river-slider');
const riverLabel = document.getElementById('river-val');
rainSlider.addEventListener('input', (e) => {
    document.getElementById('rain-val').innerText = e.target.value + '%';
    setTimeout(() => {
        const val = parseInt(e.target.value);
        globalRain = val;
        nodes.forEach(n => {
            if (n.dataset.type === 'RAIN' && val > 50 && Math.random() > 0.6) {
                n.classList.add('ripple');
                setTimeout(() => n.classList.remove('ripple'), 1000);
            }
        });
    }, 100);
});
riverSlider.addEventListener('input', (e) => {
    setTimeout(() => {
        const val = parseInt(e.target.value);
        let status = "SAFE",
            colorClass = "",
            activeSensors = 12;
        if (val < 40) {
            status = "SAFE";
            colorClass = "";
        } else if (val < 80) {
            status = "WARNING";
            colorClass = "warning";
        } else {
            status = "CRITICAL";
            colorClass = "critical";
            activeSensors = Math.floor(12 * 0.6);
        }
        riverLabel.innerText = status;
        riverLabel.className = 'mono ' + (status === 'SAFE' ? 'text-cyan' : (status === 'WARNING' ? 'text-warning' : 'text-red'));
        sensorCount.innerText = activeSensors;
        nodes.forEach(n => {
            n.className = 'node ' + colorClass;
            if (status === 'CRITICAL') n.classList.add('critical');
            else n.classList.add('pulse');
        });
    }, 150);
});

// === FINAL SAFE VISIBILITY CHECK ===
document.addEventListener('visibilitychange', () => {
    isPageVisible = document.visibilityState === 'visible';
    if (!shouldAnimate()) {
        stopRain();
        stopWave();
        stopFx();
        stopFish();
        stopCursor();
        return;
    }
    if (isPageVisible) {
        startRain();
        startWave();
        startFx();
        startFish();
        startCursor();
    } else {
        stopRain();
        stopWave();
        stopFx();
        stopFish();
        stopCursor();
    }
});
reduceMotionMQ.addEventListener('change', () => {
    if (shouldAnimate()) {
        startRain();
        startWave();
        startFx();
        startFish();
    } else {
        stopRain();
        stopWave();
        stopFx();
        stopFish();
        stopCursor();
    }
});
