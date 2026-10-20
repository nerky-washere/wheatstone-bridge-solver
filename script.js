document.addEventListener('DOMContentLoaded', () => {
    fetchVisitorCount();

    const calculateBtn = document.getElementById('calculate-btn');
    const presetBtn = document.getElementById('preset-balanced');
    
    calculateBtn.addEventListener('click', computeWheatstoneBridge);
    presetBtn.addEventListener('click', loadPreset);

    // Đồng bộ giá trị giữa Input số và Range Slider
    setupSyncInputAndSlider('r1', 'r1-slider');
    setupSyncInputAndSlider('r2', 'r2-slider');
    setupSyncInputAndSlider('r3', 'r3-slider');
    setupSyncInputAndSlider('r4', 'r4-slider');
    setupSyncInputAndSlider('r5', 'r5-slider');

    computeWheatstoneBridge();
    initThemeEngine();
});

function setupSyncInputAndSlider(id, sliderId) {
    const input = document.getElementById(id);
    const slider = document.getElementById(sliderId);

    input.addEventListener('input', () => {
        slider.value = input.value;
        computeWheatstoneBridge();
    });

    slider.addEventListener('input', () => {
        input.value = slider.value;
        computeWheatstoneBridge();
    });
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

function computeWheatstoneBridge() {
    const Vs = parseFloat(document.getElementById('vs').value) || 0;
    const R1 = parseFloat(document.getElementById('r1').value) || 1e-6;
    const R2 = parseFloat(document.getElementById('r2').value) || 1e-6;
    const R3 = parseFloat(document.getElementById('r3').value) || 1e-6;
    const R4 = parseFloat(document.getElementById('r4').value) || 1e-6;
    const R5 = parseFloat(document.getElementById('r5').value) || 1e-6;

    const a11 = (1 / R1) + (1 / R2) + (1 / R5);
    const a12 = -1 / R5;
    const b1 = Vs / R1;

    const a21 = -1 / R5;
    const a22 = (1 / R3) + (1 / R4) + (1 / R5);
    const b2 = Vs / R3;

    const D = (a11 * a22) - (a12 * a21);
    if (Math.abs(D) < 1e-12) {
        return;
    }

    const Vm = ((b1 * a22) - (b2 * a12)) / D;
    const Vn = ((a11 * b2) - (a21 * b1)) / D;

    const U1 = Vs - Vm;
    const I1 = U1 / R1;

    const U3 = Vs - Vn;
    const I3 = U3 / R3;

    const U5 = Math.abs(Vm - Vn);
    const I5 = U5 / R5;

    const U2 = Vm;
    const I2 = U2 / R2;

    const U4 = Vn;
    const I4 = U4 / R4;

    const I_total = I1 + I3;
    const Req = I_total > 0 ? Vs / I_total : 0;

    const isBalanced = Math.abs(I5 * 1000) < 0.01;

    document.getElementById('vc-result').textContent = Vm.toFixed(3) + ' V';
    document.getElementById('vd-result').textContent = Vn.toFixed(3) + ' V';
    document.getElementById('ig-result').textContent = (I5 * 1000).toFixed(3) + ' mA';
    document.getElementById('req-result').textContent = Req.toFixed(2) + ' Ω';
    document.getElementById('itotal-result').textContent = I_total.toFixed(3) + ' A';
    document.getElementById('u5-result').textContent = U5.toFixed(3) + ' V';

    const statusBadge = document.getElementById('status-badge');
    if (isBalanced) {
        statusBadge.textContent = 'Bridge Balanced';
        statusBadge.className = 'status-badge balanced';
    } else {
        statusBadge.textContent = 'Bridge Unbalanced';
        statusBadge.className = 'status-badge unbalanced';
    }

    const tbody = document.getElementById('detailed-tbody');
    tbody.innerHTML = `
        <tr><td><strong>R1</strong></td><td>${I1.toFixed(4)} A</td><td>${U1.toFixed(3)} V</td></tr>
        <tr><td><strong>R2</strong></td><td>${I2.toFixed(4)} A</td><td>${U2.toFixed(3)} V</td></tr>
        <tr><td><strong>R3</strong></td><td>${I3.toFixed(4)} A</td><td>${U3.toFixed(3)} V</td></tr>
        <tr><td><strong>R4</strong></td><td>${I4.toFixed(4)} A</td><td>${U4.toFixed(3)} V</td></tr>
        <tr><td><strong>R5 (M-N)</strong></td><td>${(I5*1000).toFixed(3)} mA</td><td>${U5.toFixed(3)} V</td></tr>
    `;

    triggerCurrentFlowAnimation();
}

function triggerCurrentFlowAnimation() {
    const flows = document.querySelectorAll('.current-flow');
    flows.forEach(el => {
        el.classList.remove('active');
        void el.offsetWidth; 
        el.classList.add('active');
    });
}

function loadPreset() {
    document.getElementById('vs').value = 12;
    document.getElementById('r1').value = 100; document.getElementById('r1-slider').value = 100;
    document.getElementById('r2').value = 100; document.getElementById('r2-slider').value = 100;
    document.getElementById('r3').value = 150; document.getElementById('r3-slider').value = 150;
    document.getElementById('r4').value = 150; document.getElementById('r4-slider').value = 150;
    document.getElementById('r5').value = 220; document.getElementById('r5-slider').value = 220;
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
