let animationTimer = null;
let currentLang = localStorage.getItem('wb_lang') || 'en';

// Bộ từ điển Đa ngôn ngữ (Dictionary)
const i18n = {
    en: {
        app_title: "WHEATSTONE BRIDGE SOLVER",
        unique_visitors: "UNIQUE VISITORS:",
        circuit_params: "Circuit Parameters",
        load_preset: "Load Balanced Preset",
        source_voltage: "Source Voltage (Vs) [V]",
        r1_label: "R1 [Ω]",
        r2_label: "R2 [Ω]",
        r3_label: "R3 [Ω]",
        r4_label: "R4 [Ω]",
        r5_label: "R5 (Galvanometer / Arm M-N) [Ω]",
        lab_notes_label: "📝 Lab Notes & Observations",
        lab_notes_placeholder: "Type your experimental notes or formulas here...",
        analysis_results: "Analysis Results",
        req_label: "Equivalent Resistance (R<sub>eq</sub>)",
        itotal_label: "Total Current (I<sub>in</sub>)",
        vm_label: "Node M Voltage (V<sub>m</sub>)",
        vn_label: "Node N Voltage (V<sub>n</sub>)",
        ig_label: "Galvanometer Current (I<sub>g</sub> / I<sub>5</sub>)",
        u5_label: "Voltage Drop (U<sub>5</sub>)",
        branch_th: "Branch",
        current_th: "Current (I)",
        voltage_th: "Voltage (U)",
        status_invalid: "Invalid Input",
        status_balanced: "Bridge Balanced",
        status_unbalanced: "Bridge Unbalanced"
    },
    vi: {
        app_title: "BỘ GIẢI MẠCH CẦU WHEATSTONE",
        unique_visitors: "LƯỢT TRUY CẬP:",
        circuit_params: "Thông Số Mạch Điện",
        load_preset: "Tải Mạch Cân Bằng Mẫu",
        source_voltage: "Điện Áp Nguồn (Vs) [V]",
        r1_label: "Điện trở R1 [Ω]",
        r2_label: "Điện trở R2 [Ω]",
        r3_label: "Điện trở R3 [Ω]",
        r4_label: "Điện trở R4 [Ω]",
        r5_label: "R5 (Điện kế / Nhánh M-N) [Ω]",
        lab_notes_label: "📝 Ghi Chú & Thực Nghiệm",
        lab_notes_placeholder: "Nhập ghi chú hoặc công thức thực nghiệm của bạn tại đây...",
        analysis_results: "Kết Quả Phân Tích",
        req_label: "Điện Trở Tương Đương (R<sub>eq</sub>)",
        itotal_label: "Dòng Điện Tổng (I<sub>in</sub>)",
        vm_label: "Điện Thế Nút M (V<sub>m</sub>)",
        vn_label: "Điện Thế Nút N (V<sub>n</sub>)",
        ig_label: "Dòng Qua Điện Kế (I<sub>g</sub> / I<sub>5</sub>)",
        u5_label: "Độ Sụt Áp (U<sub>5</sub>)",
        branch_th: "Nhánh",
        current_th: "Dòng điện (I)",
        voltage_th: "Điện áp (U)",
        status_invalid: "Đầu Vào Không Hợp Lệ",
        status_balanced: "Cầu Cân Bằng",
        status_unbalanced: "Cầu Lệch (Không Cân Bằng)"
    }
};

document.addEventListener('DOMContentLoaded', () => {
    initI18n();
    fetchVisitorCount();

    // Setup real-time bidirectional binding & calculation triggers
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

    // Start periodic 2.5-second animation pulse loop
    startAnimationLoop();
});

// --- QUẢN LÝ ĐA NGÔN NGỮ (I18N) ---
function initI18n() {
    const langToggle = document.getElementById('lang-toggle');
    langToggle.textContent = currentLang === 'en' ? 'EN' : 'VN';
    
    langToggle.addEventListener('click', () => {
        currentLang = currentLang === 'en' ? 'vi' : 'en';
        langToggle.textContent = currentLang === 'en' ? 'EN' : 'VN';
        localStorage.setItem('wb_lang', currentLang);
        applyTranslations();
        computeWheatstoneBridge(); // Cập nhật lại chuỗi trạng thái động
    });
    
    applyTranslations();
}

function applyTranslations() {
    const dict = i18n[currentLang];
    
    // Dịch các thẻ chứa nội dung HTML
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (dict[key]) {
            el.innerHTML = dict[key];
        }
    });
    
    // Dịch các thẻ có placeholder (textarea)
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (dict[key]) {
            el.setAttribute('placeholder', dict[key]);
        }
    });
}

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
        counterSpan.textContent = 'Error';
    }
}

// Global state for current directions to use in animation
let currentStates = { I1: 0, I2: 0, I3: 0, I4: 0, I5: 0, I_total: 0 };

function computeWheatstoneBridge() {
    const Vs = parseFloat(document.getElementById('vs').value);
    const R1 = parseFloat(document.getElementById('r1').value);
    const R2 = parseFloat(document.getElementById('r2').value);
    const R3 = parseFloat(document.getElementById('r3').value);
    const R4 = parseFloat(document.getElementById('r4').value);
    const R5 = parseFloat(document.getElementById('r5').value);

    const dict = i18n[currentLang];

    // Input validation
    if (isNaN(Vs) || isNaN(R1) || isNaN(R2) || isNaN(R3) || isNaN(R4) || isNaN(R5) ||
        R1 <= 0 || R2 <= 0 || R3 <= 0 || R4 <= 0 || R5 <= 0) {
        document.getElementById('status-badge').textContent = dict.status_invalid;
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

    const U5 = Vm - Vn;
    const I5 = U5 / R5;

    const U2 = Vm;
    const I2 = U2 / R2;

    const U4 = Vn;
    const I4 = U4 / R4;

    const I_total = I1 + I3;
    const Req = I_total > 0 ? Vs / I_total : 0;

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
        statusBadge.textContent = dict.status_balanced;
        statusBadge.className = 'status-badge balanced';
    } else {
        statusBadge.textContent = dict.status_unbalanced;
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

// Current-Flow Animation
function startAnimationLoop() {
    if (animationTimer) clearInterval(animationTimer);
    animationTimer = setInterval(() => {
        triggerCurrentFlowPulse();
    }, 2500);
    triggerCurrentFlowPulse();
}

function triggerCurrentFlowPulse() {
    const tolerance = 1e-5; 

    applyFlow('flow-input', currentStates.I_total > tolerance, true);
    applyFlow('flow-r1', Math.abs(currentStates.I1) > tolerance, currentStates.I1 >= 0);
    applyFlow('flow-r3', Math.abs(currentStates.I3) > tolerance, currentStates.I3 >= 0);
    
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
    void el.offsetWidth; 

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
