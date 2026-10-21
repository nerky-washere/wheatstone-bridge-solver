let animationTimer = null;

document.addEventListener('DOMContentLoaded', () => {
    fetchVisitorCount();

    // Setup real-time bidirectional binding & calculation triggers (Requirement 3)
    setupSyncInputAndSlider('vs', null);
    setupSyncInputAndSlider('r1', 'r1-slider');
    setupSyncInputAndSlider('r2', 'r2-slider');
    setupSyncInputAndSlider('r3', 'r3-slider');
    setupSyncInputAndSlider('r4', 'r4-slider');
    setupSyncInputAndSlider('r5', 'r5-slider');

    const presetBtn = document.getElementById('preset-balanced');
    presetBtn.addEventListener('click', loadPreset);

    // Initial calculation run
    computeWheatstoneBridge();
    initThemeEngine();

    // Start periodic 2.5-second animation pulse loop (Requirement 7)
    startAnimationLoop();
});

function setupSyncInputAndSlider(id, sliderId) {
    const input = document.getElementById(id);
    const slider = sliderId ? document.getElementById(sliderId) : null;

    input.addEventListener('input', () => {
        if (slider) slider.value = input.value;
        computeWheatstoneBridge();
    });

    if (slider) {
        slider.addEventListener('input', () => {
            input.value = slider.value;
            computeWheatstoneBridge();
        });
    }
}

async function fetchVisitorCount() {
    const counterSpan = document.querySelector('#visitor-counter .count-value');
    try {
        const response = await fetch('https://wheatstone-counter-backend.onrender.com/api/visitor-count', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        const data = await response.json();
        if (data.success) {
            counterSpan.textContent = data.count;
        } else {
            counterSpan.textContent = 'Offline';
        }
    } catch (err) {
        console.error("Counter fetch error:", err);
        counterSpan.textContent = 'Connection Error';
    }
}

// Global state for current directions to use in animation
let currentStates = {
    I1: 0,
    I2: 0,
    I3: 0,
    I4: 0,
    I5: 0,
    I_total: 0
};

function computeWheatstoneBridge() {
    const Vs = parseFloat(document.getElementById('vs').value);
    const R1 = parseFloat(document.getElementById('r1').value);
    const R2 = parseFloat(document.getElementById('r2').value);
    const R3 = parseFloat(document.getElementById('r3').value);
    const R4 = parseFloat(document.getElementById('r4').value);
    const R5 = parseFloat(document.getElementById('r5').value);

    // Input validation (Requirement 3 & 9)
    if (isNaN(Vs) || isNaN(R1) || isNaN(R2) || isNaN(R3) || isNaN(R4) || isNaN(R5) ||
        R1 <= 0 || R2 <= 0 || R3 <= 0 || R4 <= 0 || R5 <= 0) {
        document.getElementById('status-badge').textContent = 'Invalid Input';
        document.getElementById('status-badge').className = 'status-badge unbalanced';
        return;
    }

    // Nodal Analysis Equations
    const a11 = (1 / R1) + (1 / R2) + (1 / R5);
    const a12 = -1 / R5;
    const b1 = Vs / R1;

    const a21 = -1 / R5;
    const a22 = (1 / R3) + (1 / R4) + (1 / R5);
    const b2 = Vs / R3;

    const D = (a11 * a22) - (a12 * a21);
    if (Math.abs(D) < 1e-12) return;

    const Vm = ((b1 * a22) - (b2 * a12)) / D;
    const Vn = ((a11 * b2) - (a21 * b1)) / D;

    const U1 = Vs - Vm;
    const I1 = U1 / R1;

    const U3 = Vs - Vn;
    const I3 = U3 / R3;

    // Signed current for R5: positive means M -> N, negative means N -> M
    const U5 = Vm - Vn;
    const I5 = U5 / R5;

    const U2 = Vm;
    const I2 = U2 / R2;

    const U4 = Vn;
    const I4 = U4 / R4;

    const I_total = I1 + I3;
    const Req = I_total > 0 ? Vs / I_total : 0;

    // Store states for animation renderer
    currentStates = { I1, I2, I3, I4, I5, I_total };

    // Balanced bridge detection (Tolerance < 0.01 mA)
    const isBalanced = Math.abs(I5 * 1000) < 0.01;

    // Update Result Cards
    document.getElementById('vc-result').textContent = Vm.toFixed(3) + ' V';
    document.getElementById('vd-result').textContent = Vn.toFixed(3) + ' V';
    document.getElementById('ig-result').textContent = (I5 * 1000).toFixed(3) + ' mA';
    document.getElementById('req-result').textContent = Req.toFixed(2) + ' Ω';
    document.getElementById('itotal-result').textContent = I_total.toFixed(3) + ' A';
    document.getElementById('u5-result').textContent = Math.abs(U5).toFixed(3) + ' V';

    const statusBadge = document.getElementById('status-badge');
    if (isBalanced) {
        statusBadge.textContent = 'Bridge Balanced';
        statusBadge.className = 'status-badge balanced';
    } else {
        statusBadge.textContent = 'Bridge Unbalanced';
        statusBadge.className = 'status-badge unbalanced';
    }

    // Update Detailed Table
    const tbody = document.getElementById('detailed-tbody');
    tbody.innerHTML = `
        <tr><td><strong>R1</strong></td><td>${I1.toFixed(4)} A</td><td>${Math.abs(U1).toFixed(3)} V</td></tr>
        <tr><td><strong>R2</strong></td><td>${I2.toFixed(4)} A</td><td>${Math.abs(U2).toFixed(3)} V</td></tr>
        <tr><td><strong>R3</strong></td><td>${I3.toFixed(4)} A</td><td>${Math.abs(U3).toFixed(3)} V</td></tr>
        <tr><td><strong>R4</strong></td><td>${I4.toFixed(4)} A</td><td>${Math.abs(U4).toFixed(3)} V</td></tr>
        <tr><td><strong>R5 (M-N)</strong></td><td>${(I5 * 1000).toFixed(3)} mA</td><td>${Math.abs(U5).toFixed(3)} V</td></tr>
    `;
}

// Requirement 7: Physically Meaningful Current-Flow Animation
function startAnimationLoop() {
    if (animationTimer) clearInterval(animationTimer);

    // Trigger pulse every 2.5 seconds
    animationTimer = setInterval(() => {
        triggerCurrentFlowPulse();
    }, 2500);

    // Trigger initial pulse immediately
    triggerCurrentFlowPulse();
}

function triggerCurrentFlowPulse() {
    const tolerance = 1e-5; // 0.01 mA threshold

    applyFlow('flow-input', currentStates.I_total > tolerance, true);
    applyFlow('flow-r1', Math.abs(currentStates.I1) > tolerance, currentStates.I1 >= 0);
    applyFlow('flow-r3', Math.abs(currentStates.I3) > tolerance, currentStates.I3 >= 0);
    
    // R5 branch: suppress if balanced or negligible
    const isR5Active = Math.abs(currentStates.I5) > tolerance;
    applyFlow('flow-r5', isR5Active, currentStates.I5 >= 0);

    applyFlow('flow-r2', Math.abs(currentStates.I2) > tolerance, currentStates.I2 >= 0);
    applyFlow('flow-r4', Math.abs(currentStates.I4) > tolerance, currentStates.I4 >= 0);
    applyFlow('flow-output', currentStates.I_total > tolerance, true);
}

function applyFlow(elementId, isActive, isForward) {
    const el = document.getElementById(elementId);
    if (!el) return;

    el.classList.remove('active-forward', 'active-reverse');
    void el.offsetWidth; // Reflow reset

    if (isActive) {
        if (isForward) {
            el.classList.add('active-forward');
        } else {
            el.classList.add('active-reverse');
        }
    }
}

function loadPreset() {
    document.getElementById('vs').value = 12;
    document.getElementById('r1').value = 100; document.getElementById('r1-slider').value = 100;
    document.getElementById('r2').value = 100; document.getElementById('r2-slider').value = 100;
    document.getElementById('r3').value = 150; document.getElementById('r3-slider').value = 150;
    document.getElementById('r4').value = 150; document.getElementById('r4-slider').value = 150;
    document.getElementById('r5').value = 282; document.getElementById('r5-slider').value = 282;
    computeWheatstoneBridge();
}

function initThemeEngine() {
    const htmlEl = document.documentElement;
    const themeToggle = document.getElementById('theme-toggle');
    const accentDots = document.querySelectorAll('.accent-pickers .dot');

    const savedTheme = localStorage.getItem('wb_theme') || 'dark';
    const savedAccent = localStorage.getItem('wb_accent') || 'cyan';

    htmlEl.setAttribute('data-theme', savedTheme);
    htmlEl.setAttribute('data-accent', savedAccent);
    themeToggle.textContent = savedTheme === 'dark' ? '🌙' : '☀️';

    themeToggle.addEventListener('click', () => {
        const currentTheme = htmlEl.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        htmlEl.setAttribute('data-theme', newTheme);
        themeToggle.textContent = newTheme === 'dark' ? '🌙' : '☀️';
        localStorage.setItem('wb_theme', newTheme);
    });

    accentDots.forEach(dot => {
        dot.addEventListener('click', () => {
            const color = dot.getAttribute('data-color');
            htmlEl.setAttribute('data-accent', color);
            localStorage.setItem('wb_accent', color);
        });
    });
}
