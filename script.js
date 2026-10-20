document.addEventListener('DOMContentLoaded', () => {
    fetchVisitorCount();

    const calculateBtn = document.getElementById('calculate-btn');
    const presetBtn = document.getElementById('preset-balanced');
    
    calculateBtn.addEventListener('click', computeWheatstoneBridge);
    presetBtn.addEventListener('click', loadPreset);

    computeWheatstoneBridge();
    initThemeEngine();
});

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
        console.error("Lỗi kết nối bộ đếm:", err);
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

    // Phân tích nút mạng cho 2 đỉnh M và N
    const a11 = (1 / R1) + (1 / R2) + (1 / R5);
    const a12 = -1 / R5;
    const b1 = Vs / R1;

    const a21 = -1 / R5;
    const a22 = (1 / R3) + (1 / R4) + (1 / R5);
    const b2 = Vs / R3;

    const D = (a11 * a22) - (a12 * a21);
    if (Math.abs(D) < 1e-12) {
        alert("Lỗi cấu hình mạch: Determinant gần bằng 0!");
        return;
    }

    const Vm = ((b1 * a22) - (b2 * a12)) / D;
    const Vn = ((a11 * b2) - (a21 * b1)) / D;

    // Dòng điện qua từng nhánh
    // I1 qua R1 (từ nguồn A đến M): U_R1 = Vs - Vm => I1 = U_R1 / R1
    const U1 = Vs - Vm;
    const I1 = U1 / R1;

    // I3 qua R3 (từ nguồn A đến N): U_R3 = Vs - Vn => I3 = U_R3 / R3
    const U3 = Vs - Vn;
    const I3 = U3 / R3;

    // I5 qua R5 (từ M sang N nếu Vm > Vn, ngược lại từ N sang M)
    const U5 = Math.abs(Vm - Vn);
    const I5 = U5 / R5;

    // I2 qua R2 (từ M đến B): U_R2 = Vm - 0 => I2 = Vm / R2
    const U2 = Vm;
    const I2 = U2 / R2;

    // I4 qua R4 (từ N đến B): U_R4 = Vn - 0 => I4 = Vn / R4
    const U4 = Vn;
    const I4 = U4 / R4;

    // Tổng dòng điện và điện trở tương đương
    const I_total = I1 + I3;
    const Req = I_total > 0 ? Vs / I_total : 0;

    // Trạng thái cân bằng
    const isBalanced = Math.abs(I5 * 1000) < 0.01;

    // Hiển thị kết quả tổng quan
    document.getElementById('vc-result').textContent = Vm.toFixed(3) + ' V';
    document.getElementById('vd-result').textContent = Vn.toFixed(3) + ' V';
    document.getElementById('ig-result').textContent = (I5 * 1000).toFixed(3) + ' mA';
    document.getElementById('req-result').textContent = Req.toFixed(2) + ' Ω';
    document.getElementById('itotal-result').textContent = I_total.toFixed(3) + ' A';
    document.getElementById('u5-result').textContent = U5.toFixed(3) + ' V';

    const statusBadge = document.getElementById('status-badge');
    if (isBalanced) {
        statusBadge.textContent = 'Bridge Balanced (Cân bằng)';
        statusBadge.className = 'status-badge balanced';
    } else {
        statusBadge.textContent = 'Bridge Unbalanced (Lệch)';
        statusBadge.className = 'status-badge unbalanced';
    }

    // Đổ dữ liệu vào bảng chi tiết I và U
    const tbody = document.getElementById('detailed-tbody');
    tbody.innerHTML = `
        <tr><td><strong>R1</strong></td><td>${I1.toFixed(4)} A</td><td>${U1.toFixed(3)} V</td></tr>
        <tr><td><strong>R2</strong></td><td>${I2.toFixed(4)} A</td><td>${U2.toFixed(3)} V</td></tr>
        <tr><td><strong>R3</strong></td><td>${I3.toFixed(4)} A</td><td>${U3.toFixed(3)} V</td></tr>
        <tr><td><strong>R4</strong></td><td>${I4.toFixed(4)} A</td><td>${U4.toFixed(3)} V</td></tr>
        <tr><td><strong>R5 (M-N)</strong></td><td>${(I5*1000).toFixed(3)} mA</td><td>${U5.toFixed(3)} V</td></tr>
    `;

    // Kích hoạt hiệu ứng dòng điện chạy trên sơ đồ SVG
    triggerCurrentFlowAnimation();
}

function triggerCurrentFlowAnimation() {
    const flows = document.querySelectorAll('.current-flow');
    flows.forEach(el => {
        el.classList.remove('active');
        void el.offsetWidth; // Trigger reflow
        el.classList.add('active');
    });
}

function loadPreset() {
    document.getElementById('vs').value = 12;
    document.getElementById('r1').value = 100;
    document.getElementById('r2').value = 100;
    document.getElementById('r3').value = 150;
    document.getElementById('r4').value = 150;
    document.getElementById('r5').value = 220;
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
